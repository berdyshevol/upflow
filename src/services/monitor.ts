import { fetchUpworkJobs } from '../api/upwork';
import { jobExists, saveJob, Job } from '../db/jobs';
import { classifyJob, generateCoverLetter } from './ai';
import { sendBriefing, sendCoverLetter } from '../bot';
import { saveProposal } from '../db/proposals';

const JOB_SEARCH_QUERY = `
  query searchJobs($query: String!) {
    searchJobs(query: $query, first: 10) {
      edges {
        node {
          id
          title
          description
          amount {
            amount
            currencyCode
          }
          client {
            location {
              country
            }
            totalReviews
            totalFeedback
          }
        }
      }
    }
  }
`;

export async function monitorNewJobs() {
  console.log('Checking for new jobs on Upwork...');
  
  try {
    const response = await fetchUpworkJobs(JOB_SEARCH_QUERY, { query: 'Node.js developer' });
    const jobs = response.data?.searchJobs?.edges || [];

    for (const edge of jobs) {
      const node = edge.node;
      if (!jobExists(node.id)) {
        console.log(`Analyzing new job: ${node.title} (${node.id})`);
        
        // 1. Classify Job
        const classification = await classifyJob(node.title, node.description);
        
        const job: Job = {
          id: node.id,
          title: node.title,
          description: node.description,
          budget: node.amount ? `${node.amount.amount} ${node.amount.currencyCode}` : 'N/A',
          client_info: JSON.stringify(node.client),
          category: classification.category,
          status: classification.category === 'Irrelevant' ? 'Skipped' : 'Pending'
        };
        
        saveJob(job);

        if (classification.category === 'Irrelevant') {
          console.log(`Job skipped: ${classification.reason}`);
          continue;
        }

        console.log(`Job matched: ${job.title}. Category: ${job.category}. Reason: ${classification.reason}`);

        // 2. Generate Cover Letter
        const coverLetter = await generateCoverLetter(job.title, job.description);
        
        // 3. Save Proposal
        const proposalId = saveProposal({
          job_id: job.id,
          cover_letter: coverLetter,
          status: 'Draft'
        });

        // 4. Notify via Telegram
        await sendBriefing({ ...job, reason: classification.reason });
        await sendCoverLetter(proposalId, coverLetter);
        
        console.log(`Notifications sent for job: ${job.id}`);
      }
    }
  } catch (error) {
    console.error('Error monitoring jobs:', error);
  }
}
