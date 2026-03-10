import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface SkillsConfig {
  skills: string[];
}

export interface Experience {
  Role: string;
  Period: string;
  Highlights: string[];
}

export interface ResumeConfig {
  experience: Experience[];
}

export interface CriteriaConfig {
  criteria: string[];
}

export function loadYamlConfig<T>(fileName: string): T {
  const configPath = path.join(process.cwd(), 'config', fileName);
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }
  const fileContents = fs.readFileSync(configPath, 'utf8');
  return yaml.load(fileContents) as T;
}

export function getSkills(): SkillsConfig {
  return loadYamlConfig<SkillsConfig>('skills.yaml');
}

export function getResume(): ResumeConfig {
  return loadYamlConfig<ResumeConfig>('resume.yaml');
}

export function getCriteria(): CriteriaConfig {
  return loadYamlConfig<CriteriaConfig>('criteria.yaml');
}
