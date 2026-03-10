---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ["product-brief-upwork-project-2026-03-08.md", "system-architecture-upflow-2026-03-10.md"]
date: 2026-03-10
author: Gemini CLI
---

# Backlog: UpFlow MVP

This backlog outlines the tasks required to deliver the Minimum Viable Product (MVP) of UpFlow.

## Milestone 1: Setup & Foundations
- [x] **1.1 Project Initialization**
  - [x] Initialize Node.js project (`package.json`, `tsconfig.json`).
  - [x] Setup folder structure (`src/`, `config/`, `scripts/`, `tests/`).
  - [x] Install core dependencies (`telegraf`, `better-sqlite3`, `@anthropic-ai/sdk`, `js-yaml`, `dotenv`).
- [x] **1.2 Database Schema Implementation**
  - [x] Create SQLite initialization script (`scripts/init-db.ts`).
  - [x] Define tables: `jobs`, `proposals`, `settings`.
- [x] **1.3 Configuration Management**
  - [x] Create sample YAML config files (`config/skills.yaml.example`, `config/resume.yaml.example`).
  - [x] Implement config loader utility.

## Milestone 2: Upwork Integration (Monitoring)
- [x] **2.1 Upwork API Client**
  - [x] Implement OAuth2 flow for Upwork GraphQL API.
  - [x] Create utility for token storage and refreshing in SQLite.
- [x] **2.2 Job Fetching Logic**
  - [x] Implement polling service to fetch new jobs via GraphQL.
  - [x] Deduplication logic using SQLite job IDs.

## Milestone 3: AI Intelligence (Claude)
- [x] **3.1 Job Classifier**
  - [x] Implement Claude API prompt for job categorization (Quick/Greenfield/Irrelevant).
  - [x] Integrate skills profile into the classification prompt.
- [x] **3.2 Proposal Generator**
  - [x] Implement Claude API prompt for cover letter generation.
  - [x] Integrate user resume and project details into the prompt.

## Milestone 4: Telegram Interface
- [x] **4.1 Bot Setup**
  - [x] Initialize Telegram bot using `Telegraf`.
  - [x] Implement basic commands: `/start`, `/help`.
- [x] **4.2 Notification Flow (Two-Post Flow)**
  - [x] Implement Post 1 (Briefing) with project details and `[Skip]` button.
  - [x] Implement Post 2 (Cover Letter) with copy-pasteable text and `[Approve CL]`, `[Refine CL]` buttons.
- [x] **4.3 Refinement Loop**
  - [x] Implement feedback collection and re-generation logic for cover letters.
- [x] **4.4 Outcome Tracking**
  - [x] Implement `[Won]` button and `/won <id>` command.
  - [x] Implement logic for marking proposals as `Won`.

## Milestone 5: Orchestration & CLI
- [x] **5.1 Monitor Command**
  - [x] Implement the main `upflow-monitor` CLI command.
  - [x] Orchestrate the end-to-end flow: Fetch -> Classify -> Generate -> Notify.
- [x] **5.2 Error Handling & Logging**
  - [x] Implement robust error handling for API failures and rate limits.
  - [x] Setup basic logging.

## Milestone 6: Deployment & Verification
- [x] **6.1 Deployment Script**
  - [x] Create a script for starting the tool via cron.
- [x] **6.2 MVP Validation**
  - [x] Test end-to-end flow with real job data (simulated or sandbox).
  - [x] Verify Telegram notifications and refinement loop.

---

## Future Milestones (Post-MVP)
- **Phase 2**: Automated prototype building orchestration.
- **Phase 3**: Profile Highlights post with prototype links.
- **Phase 4**: Detailed analytics and statistics.
- **Phase 5**: Self-improving feedback loop based on win/loss data.
