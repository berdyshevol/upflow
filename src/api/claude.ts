import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function callClaude(prompt: string, systemPrompt?: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Missing ANTHROPIC_API_KEY.');
  }

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20240620',
    max_tokens: 2000,
    temperature: 0,
    system: systemPrompt,
    messages: [
      { role: 'user', content: prompt }
    ],
  });

  const content = message.content[0];
  if (content.type === 'text') {
    return content.text;
  }
  return '';
}
