---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
inputDocuments: ["product-brief-upwork-project-2026-03-08.md"]
date: 2026-03-10
author: Gemini CLI
---

# System Architecture: UpFlow

## Overview

UpFlow is a Node.js CLI tool designed for automation of the Upwork job search and proposal process. It follows a modular architecture to handle job monitoring, AI filtering, content generation, and user interaction via Telegram.

---

## Technical Stack

- **Runtime**: Node.js (v20+ recommended)
- **Language**: TypeScript (for type safety and better maintainability)
- **Database**: SQLite (using `better-sqlite3` for performance and simplicity)
- **AI Engine**: Anthropic Claude API (via `@anthropic-ai/sdk`)
- **Upwork Integration**: Upwork GraphQL API (using OAuth2 for authentication)
- **Notification/Interaction**: Telegram Bot API (using `telegraf` or `node-telegram-bot-api`)
- **Configuration**: YAML (using `js-yaml`) or JSON
- **Deployment**: Cron-based execution on Raspberry Pi/Mac/VPS

---

## System Components

### 1. Job Monitor (Service)
- Polls the Upwork GraphQL API for new job postings.
- Handles OAuth2 token management and refreshing.
- Deduplicates jobs using SQLite job IDs.
- Filters out jobs already processed.

### 2. Classifier Engine (AI)
- Uses Claude API to analyze job descriptions against a user's skills profile.
- Categorizes jobs into:
  - **Quick Projects** (<$1K)
  - **Greenfield Projects** (>1 month/clean code)
  - **Irrelevant** (filters out noise/hire offers)
- Returns structured JSON for downstream processing.

### 3. Content Generator (AI)
- Generates tailored cover letters based on the job description, user resume, and skills.
- Incorporates prototype links if available (future expansion).
- Supports iterative refinement via user feedback.

### 4. Telegram Bot (Interface)
- **Notification Layer**: Sends briefing posts (Post 1) and draft cover letters (Post 2).
- **Interaction Layer**: Handles buttons like `[Skip]`, `[Approve CL]`, `[Refine CL]`.
- **Feedback Loop**: Collects user input for refining cover letters and updates the draft.
- **Outcome Tracking**: Handles `/won` command and `[Won]` button.

### 5. Storage Layer (SQLite)
- **Jobs Table**: Stores job ID, title, description, budget, client info, category, and status.
- **Proposals Table**: Stores proposal drafts, refinement history, and submission status.
- **Auth Table**: Stores OAuth2 tokens for Upwork and Telegram.
- **Analytics Table**: Stores win/loss data and feedback for future tuning.

---

## Data Schema (Proposed)

### Table: `jobs`
- `id` (TEXT PRIMARY KEY) - Upwork Job ID
- `title` (TEXT)
- `description` (TEXT)
- `client_info` (JSON)
- `budget` (TEXT)
- `category` (TEXT) - Quick/Greenfield/Irrelevant
- `status` (TEXT) - Pending/Approved/Skipped
- `created_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)

### Table: `proposals`
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `job_id` (TEXT REFERENCES jobs(id))
- `cover_letter` (TEXT)
- `feedback_history` (JSON)
- `status` (TEXT) - Draft/Approved/Submitted/Won/Lost
- `submitted_at` (DATETIME)

### Table: `settings`
- `key` (TEXT PRIMARY KEY)
- `value` (TEXT)

---

## Workflows

### 1. The Monitoring Loop (Cron)
1. `upflow-monitor` command is triggered by cron.
2. Fetch new jobs from Upwork.
3. For each job:
   - Check if exists in SQLite; if yes, skip.
   - Send to Classifier Engine (Claude).
   - If "Irrelevant", mark as skipped and exit.
   - If relevant, store in `jobs` table with category.
   - Trigger Content Generator (Claude).
   - Send Post 1 (Briefing) and Post 2 (Cover Letter) to Telegram.

### 2. The Refinement Workflow (Telegram)
1. User receives Post 1 & 2.
2. User clicks `[Skip]` -> Update job status to `Skipped`.
3. User clicks `[Refine CL]` -> Bot asks for feedback.
4. User sends feedback -> Bot calls Claude with previous draft + feedback -> Sends updated Post 2.
5. User clicks `[Approve CL]` -> Bot marks as `Approved`.
6. User copies text, submits manually on Upwork, clicks `[Submitted]` (implied by approval in MVP).
7. After 14 days, if not marked `/won`, auto-mark as `Lost`.

---

## Folder Structure (Proposed)

```
upflow/
├── config/             # YAML/JSON config files
│   ├── skills.yaml
│   ├── resume.yaml
│   └── criteria.yaml
├── src/
│   ├── api/            # Upwork & Claude API wrappers
│   ├── bot/            # Telegram bot logic & commands
│   ├── db/             # SQLite schema & queries
│   ├── services/       # Core business logic (Monitoring, AI)
│   ├── utils/          # Helpers (Logging, Date, etc.)
│   └── index.ts        # CLI entry point
├── scripts/            # Helper scripts (DB init, Auth)
├── tests/              # Unit & Integration tests
├── .env                # API keys & secrets
├── package.json
└── tsconfig.json
```

---

## Key Considerations

- **Rate Limiting**: Manage Claude API and Upwork API rate limits.
- **Security**: Securely store API keys and OAuth tokens (use `.env` and SQLite for tokens).
- **Resilience**: Handle network failures during API calls; retry logic for Telegram notifications.
- **Maintainability**: Clear separation between AI logic and API handling.
