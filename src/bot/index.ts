import { Telegraf, Markup } from 'telegraf';
import 'dotenv/config';
import { updateJobStatus } from '../db/jobs';
import { updateProposalStatus, updateProposalCoverLetter, getProposal } from '../db/proposals';
import { generateCoverLetter } from '../services/ai';
import { getJob } from '../db/jobs'; // I need to add getJob to db/jobs.ts

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');
const chatId = process.env.TELEGRAM_CHAT_ID;

// Simple in-memory state for refinement loop
const userState: Record<string, { lastProposalId: number }> = {};

export function startBot() {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is missing.');
    return;
  }

  bot.start((ctx) => ctx.reply('UpFlow Bot started. Monitoring Upwork...'));
  bot.help((ctx) => ctx.reply('Use the buttons to manage proposals or type feedback to refine the last cover letter.\nYou can also use /won <proposal_id> to mark a contract as won.'));

  bot.command('won', async (ctx) => {
    const proposalId = parseInt(ctx.payload);
    if (isNaN(proposalId)) {
      await ctx.reply('Please provide a valid proposal ID. Example: /won 123');
      return;
    }
    updateProposalStatus(proposalId, 'Won');
    await ctx.reply(`🎉 Proposal #${proposalId} marked as Won!`);
  });

  // Handle Skip button
  bot.action(/skip_(.+)/, async (ctx) => {
    const jobId = ctx.match[1];
    updateJobStatus(jobId, 'Skipped');
    await ctx.answerCbQuery('Job skipped.');
    await ctx.editMessageText('🚫 Job marked as skipped.');
  });

  // Handle Approve button
  bot.action(/approve_(.+)/, async (ctx) => {
    const proposalId = parseInt(ctx.match[1]);
    updateProposalStatus(proposalId, 'Approved');
    await ctx.answerCbQuery('Proposal approved.');
    await ctx.reply('✅ Proposal approved! Copy the cover letter and submit it on Upwork.');
    await ctx.reply('Once submitted, you can mark it as Won if you get the contract.');
  });

  // Handle Refine button
  bot.action(/refine_(.+)/, async (ctx) => {
    const proposalId = parseInt(ctx.match[1]);
    userState[ctx.chat!.id] = { lastProposalId: proposalId };
    await ctx.answerCbQuery('Send your feedback.');
    await ctx.reply('What would you like to change in the cover letter? Type your feedback below:');
  });

  // Handle Won button
  bot.action(/won_(.+)/, async (ctx) => {
    const proposalId = parseInt(ctx.match[1]);
    updateProposalStatus(proposalId, 'Won');
    await ctx.answerCbQuery('Congratulations!');
    await ctx.reply('🎉 Contract won! History updated.');
  });

  // Handle text input for refinement loop
  bot.on('text', async (ctx) => {
    const state = userState[ctx.chat!.id];
    if (state?.lastProposalId) {
      const feedback = ctx.message.text;
      const proposal = getProposal(state.lastProposalId);
      
      if (!proposal) {
        await ctx.reply('Error: Proposal not found.');
        return;
      }

      const job = getJob(proposal.job_id);
      if (!job) {
        await ctx.reply('Error: Job not found.');
        return;
      }

      await ctx.reply('🔄 Refining cover letter...');
      const refinedCL = await generateCoverLetter(job.title, job.description, feedback);
      
      updateProposalCoverLetter(state.lastProposalId, refinedCL, feedback);
      
      await ctx.reply(refinedCL);
      await ctx.reply('Refined cover letter above. What now?', Markup.inlineKeyboard([
        [Markup.button.callback('✅ Approve', `approve_${state.lastProposalId}`)],
        [Markup.button.callback('🔄 Refine Again', `refine_${state.lastProposalId}`)]
      ]));
    }
  });

  bot.launch();
  console.log('Telegram Bot launched.');
}

export async function sendBriefing(job: any) {
  if (!chatId) return;
  const message = `
🔔 *New Job Match* (#${job.id})
*Title:* ${job.title}
*Budget:* ${job.budget}
*Category:* ${job.category}

*Summary:* ${job.reason || 'No reason provided.'}

[View on Upwork](https://www.upwork.com/jobs/${job.id})
  `;
  
  await bot.telegram.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('🚫 Skip', `skip_${job.id}`)]
    ])
  });
}

export async function sendCoverLetter(proposalId: number, coverLetter: string) {
  if (!chatId) return;
  await bot.telegram.sendMessage(chatId, coverLetter);
  await bot.telegram.sendMessage(chatId, '---', Markup.inlineKeyboard([
    [Markup.button.callback('✅ Approve', `approve_${proposalId}`)],
    [Markup.button.callback('🔄 Refine', `refine_${proposalId}`)]
  ]));
}
