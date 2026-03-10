# UpFlow 🚀

UpFlow is a lightweight Node.js CLI automation tool that monitors Upwork for new projects, filters them using AI (Claude), and generates tailored proposals via Telegram.

## Features

- **AI-Powered Filtering**: Classifies jobs into Quick, Greenfield, or Irrelevant based on your skills profile.
- **Automated Proposals**: Generates professional cover letters using your resume and job description.
- **Telegram Bot Interface**:
  - Receive real-time notifications with job briefings.
  - Approve or refine cover letters directly in Telegram.
  - Track proposal outcomes (Won/Lost).
- **Lightweight & Fast**: Uses SQLite for storage, designed to run on a Raspberry Pi or VPS via cron.

---

## Setup Instructions

### 1. Prerequisites
- Node.js (v20+)
- Upwork Developer API Keys (GraphQL)
- Anthropic API Key (Claude)
- Telegram Bot (via @BotFather)

### 2. Installation
```bash
git clone https://github.com/berdyshevol/upflow.git
cd upflow
npm install
```

### 3. Configuration
1. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
2. Fill in your API keys in `.env`.
3. Configure your profile in `config/`:
   - `skills.yaml`: Your tech stack.
   - `resume.yaml`: Your experience summary.
   - `criteria.yaml`: Filtering rules.

### 4. Database Initialization
```bash
npx ts-node scripts/init-db.ts
```

### 5. Upwork OAuth2 Setup
Since Upwork uses OAuth2, you need to obtain the initial refresh token manually or via a script.
1. Use the Upwork Developer Portal to get your Client ID and Secret.
2. Store the initial `refresh_token` in the `settings` table of `upflow.sqlite`:
   ```sql
   INSERT INTO settings (key, value) VALUES ('upwork_refresh_token', 'YOUR_REFRESH_TOKEN');
   ```

---

## Usage

### Start the Telegram Bot (Listener)
The bot must be running to handle refinement feedback.
```bash
npm run bot
```

### Run Job Monitor (Manual)
```bash
npm run monitor
```

### Automation (Cron)
To run the monitor every 15 minutes, add this to your crontab:
```bash
*/15 * * * * cd /path/to/upflow && /usr/local/bin/npm run monitor >> /var/log/upflow.log 2>&1
```

---

## Architecture

- **Monitor**: Polls Upwork GraphQL API.
- **Classifier**: Claude API (3.5 Sonnet) filters irrelevant jobs.
- **Generator**: Claude API creates personalized cover letters.
- **Telegram Bot**: User interaction layer (Approvals, Refinement, Tracking).
- **SQLite**: Persistence for jobs, proposals, and tokens.

---

## License
ISC
