import { callClaude } from '../api/claude';
import { getSkills, getResume, getCriteria } from '../utils/config';

export interface ClassificationResult {
  category: 'Quick' | 'Greenfield' | 'Irrelevant';
  reason: string;
}

export async function classifyJob(jobTitle: string, jobDescription: string): Promise<ClassificationResult> {
  const skills = getSkills().skills.join(', ');
  const criteria = getCriteria().criteria.join('\n');

  const systemPrompt = `
    You are an AI assistant helping a freelance developer filter Upwork jobs.
    Your goal is to categorize a job into one of three categories:
    1. Quick: Small projects (<$1000), prototype-quality, simple tasks.
    2. Greenfield: Larger projects, clean code, maintainable, usually long-term.
    3. Irrelevant: Hire offers, skill mismatches, or poor quality jobs.

    Developer Skills: ${skills}
    Filtering Criteria:
    ${criteria}

    Respond ONLY with a JSON object in this format:
    { "category": "Quick" | "Greenfield" | "Irrelevant", "reason": "Short explanation" }
  `;

  const prompt = `
    Job Title: ${jobTitle}
    Job Description: ${jobDescription}
  `;

  try {
    const response = await callClaude(prompt, systemPrompt);
    // Parse JSON from response (handling potential markdown markers)
    const jsonStr = response.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonStr) as ClassificationResult;
  } catch (error) {
    console.error('Error classifying job:', error);
    return { category: 'Irrelevant', reason: 'Error during classification' };
  }
}

export async function generateCoverLetter(jobTitle: string, jobDescription: string, feedback?: string): Promise<string> {
  const resume = JSON.stringify(getResume().experience, null, 2);
  const skills = getSkills().skills.join(', ');

  const systemPrompt = `
    You are an expert freelance proposal writer.
    Your goal is to write a tailored, professional, and persuasive cover letter for an Upwork job.
    Use the developer's resume and skills provided below.
    The tone should be professional yet conversational.
    Focus on how the developer can solve the client's specific problem.
    Do NOT use placeholders like [Your Name]. Use the developer's experience naturally.

    Developer Resume:
    ${resume}
    
    Developer Skills: ${skills}

    Respond ONLY with the cover letter text.
  `;

  let prompt = `
    Job Title: ${jobTitle}
    Job Description: ${jobDescription}
  `;

  if (feedback) {
    prompt += `\n\nUser Feedback for refinement: ${feedback}\nPlease refine the previous cover letter based on this feedback.`;
  }

  try {
    return await callClaude(prompt, systemPrompt);
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return 'Error generating cover letter. Please try again.';
  }
}
