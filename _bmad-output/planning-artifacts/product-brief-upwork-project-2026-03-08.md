---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: []
date: 2026-03-08
author: Mr. Oleg
---

# Product Brief: upwork-project

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

UpFlow is a lightweight Node.js CLI automation tool that monitors Upwork for new project opportunities, uses AI (Claude API) to filter and categorize them based on a personal skills profile, generates tailored cover letters with working prototype links, and sends full project briefings to Telegram for approval before manual submission. Built as a personal power tool — optimized for one user, maximum hackability, config-driven criteria. It tracks all proposal history and outcomes in SQLite, creating a self-improving feedback loop that gets smarter over time. Designed for minimal RAM usage (~30-50 MB during runs, zero between) and deployable on a Raspberry Pi, Mac, or VPS via cron.

---

## Core Vision

### Problem Statement

Freelancers on Upwork lose competitive advantage due to two bottlenecks: filtering relevant projects from noise (hire offers vs. project work, skill mismatches) and the time-consuming process of crafting quality proposals. By the time a good proposal is written, clients have already received dozens of others and stop reading new ones.

### Problem Impact

- Missed opportunities due to slow response times — first responders win
- Hours wasted scanning irrelevant projects and hire offers
- Low proposal open rates because of late submissions
- Quality proposals go unread while generic fast ones win
- No way to demonstrate capability beyond text descriptions
- No data-driven insights into what works and what doesn't

### Why Existing Solutions Fall Short

Freelancers handle Upwork bidding entirely manually. No tools combine AI-powered project filtering, proposal generation, prototype creation, and outcome tracking into a single pipeline. Existing automation is limited to basic alerts without intelligence. Third-party auto-submit tools risk account bans and violate Upwork's Terms of Service.

### Proposed Solution

UpFlow monitors Upwork via the Upwork GraphQL API, uses AI (Claude API) to filter projects into two categories based on a stored skills profile:

- **Quick projects** (<$1K, prototype-quality, client just wants it done) — built with AI/RALF, minimal human involvement
- **Greenfield projects** (<1 month, clean code, maintainable, full BMAD workflow) — filtered by skills match

For each match, UpFlow automatically:
1. Generates a tailored cover letter based on user's resume/skills
2. Sends two Telegram posts simultaneously: a briefing post (project text, AI summary, client info, budget, Upwork link) and a cover letter post (pure copy-pasteable text)
3. User refines cover letter via chat-based loop if needed, then approves
4. Bot sends profile highlights post (prototype URL + description, pure copy-pasteable)
5. User copies content, opens Upwork link, pastes, and submits

All proposals and outcomes are stored in SQLite for history analysis, pattern discovery, and criteria tuning. The system is designed for progressive autonomy — start with human-in-the-loop approval, gradually automate simple projects end-to-end.

### Key Differentiators

- **Working prototype with every proposal** — proof you can deliver, linked in both cover letter and Profile Highlights
- **AI-powered filtering** using personal skills document — only relevant projects, no noise
- **Speed** — near-real-time monitoring gives first-mover advantage
- **Self-improving feedback loop** — tracks wins/losses to tune filtering criteria and proposal style
- **History & analytics** — data-driven freelancing with SQLite storage
- **Upwork-compliant** — no auto-submission, human approves and submits manually via Telegram workflow
- **Configurable autonomy** — start with approval flow, gradually automate simple projects
- **Personal tool philosophy** — no multi-tenancy, pure hackability, YAML/JSON config-driven
- **Minimal resources** — runs on a Raspberry Pi, zero RAM between cron cycles

---

## Target Users

### Primary Users

**Oleg — Freelance Developer & Orchestrator**
- Has a regular full-time job, manages Upwork bidding on the side via Telegram and browser
- No time to manually scan projects, write proposals, and build prototypes
- Reviews AI-generated briefings in Telegram and acts with minimal effort (~10 seconds per bid)
- Configures filtering criteria, skills profile, and proposal templates
- Tracks history and tunes the system over time
- Goal: more proposals out, more contracts won, less time invested

### Secondary Users

**Team Members — Bid Submitters**
- Share the same Telegram channel as Oleg
- Can act on notifications: copy cover letters, submit bids on Oleg's behalf
- Especially useful for simple projects — handle the last-mile submission
- No system configuration access needed — just read briefings and submit

**External Prototype Service (Machine User)**
- Receives build requests from UpFlow (AI coding agent — RALF, Claude Code, etc.)
- Builds and deploys prototypes (Next.js + Supabase + Tailwind/shadcn on Vercel)
- Returns deployed URL when done
- UpFlow polls/checks progress and grabs the link

### User Journey

1. **Setup**: Oleg configures skills profile, resume, filtering criteria, and Telegram bot
2. **Monitoring**: UpFlow runs via cron, scans Upwork GraphQL API, AI filters and categorizes projects
3. **Notification**: Match found → two Telegram posts arrive together automatically:
   - **Post 1 (Briefing)**: Original project text, AI summary, client info, budget, Upwork link + **[Skip]** button
   - **Post 2 (Cover Letter)**: Pure copy-pasteable cover letter text + **[Approve CL]** **[Refine CL]** buttons
4. **Review**: Oleg or team member reads briefing, then cover letter
5. **Refine loop** (if needed): Tap [Refine CL] → bot asks what to change → user types feedback → bot sends new post with updated cover letter (pure copy-pasteable) + same buttons → repeat until satisfied
6. **Approve CL**: Tap [Approve CL] → copy cover letter text, paste into Upwork
7. **Profile Highlights**: After CL approved, bot sends **Post 3 (Profile Highlights)**: pure copy-pasteable prototype URL + description + **[Approve PH]** **[Refine PH]** buttons → same refine loop
8. **Approve PH**: Tap [Approve PH] → copy, add to Upwork Profile Highlights
9. **Tracking**: Bot sends **Post 4**: submission confirmation + **[Won]** button. Auto-marked as `lost` after 14 days if no response
10. **Tune**: Adjust filtering criteria and proposal style based on win/loss analytics

### Telegram Post Formats

**Post 1 — Briefing (for reading, not copy-pasting)**
- Project ID (e.g. #UF-042)
- Original project text
- AI summary & analysis
- Client rating, history, country
- Budget / hourly rate
- Link to Upwork project
- Buttons: **[Skip]**

**Post 2 — Cover Letter (pure copy-pasteable, no bot commentary)**
- Cover letter text only — nothing else
- Buttons: **[Approve CL]** **[Refine CL]**

**Post 3 — Profile Highlights (pure copy-pasteable, no bot commentary)**
- Prototype URL + description only
- Buttons: **[Approve PH]** **[Refine PH]**

**Post 4 — Tracking**
- Submission confirmation
- Buttons: **[Won]**

### Telegram Bot Commands (MVP)

- `/help` — show all available commands
- `/won <id>` — mark a proposal as won

### Telegram Bot Commands (Future)

- `/building` — show current prototype build status (when auto-prototype is added)
- `/queue` — show queued projects for prototype building + **[Priority]** button to reorder
- `/history` — recent proposals and outcomes
- `/stats` — win rates, trends, conversion data

---

## Success Metrics

### User Success
- Time per proposal: <1 min manual effort (copy/paste from Telegram)
- Filtering accuracy: <20% skipped projects (AI picks relevant ones)
- Cover letter quality: personalized, includes relevant skills and experience
- Flexible prototype flow: can apply with or without prototype

### Business Objectives
- **Month 1-3**: $3-5K/month from Upwork contracts
- **Month 6+**: Tune criteria to improve win rate, reduce wasted proposals
- **Long-term**: Add automated prototype building, increase autonomy for simple projects

### Key Performance Indicators
- **Win rate**: target 10-15% (track from day one)
- **Revenue per month**: target $3-5K
- **Proposals sent per day**: 1-2 minimum
- **Time from project posted → proposal submitted**: <30 min
- **Skip rate**: track to improve AI filtering over time
- **Cost per proposal**: Connects + AI API cost vs. revenue won

### Outcome Tracking
- **Auto-loss**: proposals auto-marked as `lost` after 14 days with no response
- **Manual wins**: user reports wins via `/won` command or **[Won]** button
- **Data feeds back** into filtering criteria and proposal quality improvements

---

## MVP Scope

### Prerequisites

- Register app on [Upwork Developer portal](https://www.upwork.com/developer) and obtain API keys (client ID + secret)
- Set up OAuth2 authentication for Upwork GraphQL API
- Create Telegram bot via BotFather
- Set up Claude API key

### Core Features

1. **Upwork GraphQL API Monitoring** — cron-based polling, configurable interval (default 15 min)
2. **AI Filtering** — Claude API classifies projects into Quick (<$1K) or Greenfield (<1 month), filters out hire offers, matches against stored skills document
3. **Cover Letter Generation** — AI generates personalized cover letter from resume/skills profile + project description. Context-aware: if prototype link is provided during refine loop, AI includes it in cover letter; if not, focuses on skills and approach only
4. **Telegram Bot — Two-Post Flow (MVP)**:
   - Post 1: Briefing (project text, AI summary, client info, budget, Upwork link) + [Skip]
   - Post 2: Cover letter (pure copy-pasteable) + [Approve CL] [Refine CL]
   - Refine loop: user types feedback → new cover letter → repeat until approved
   - Post 3: Tracking confirmation + [Won]
5. **SQLite Storage** — projects, proposals, outcomes, status tracking
6. **Telegram Commands**: `/help`, `/won <id>`
7. **Config files** — skills profile, resume, filtering criteria (YAML/JSON)

### Out of Scope for MVP

- Automated prototype building (external service orchestration)
- Post 3 Profile Highlights (added when prototype service is ready)
- `/queue`, `/building`, `/stats`, `/history` commands
- Self-improving feedback loop (auto-tuning criteria from win/loss data)
- Auto-submit without human approval
- Multi-account support

### MVP Success Criteria

- System finds and filters relevant projects from Upwork
- Cover letters are personalized and copy-pasteable
- Full Telegram flow works end-to-end (briefing → refine → approve → track)
- First proposal submitted within 1 week of deployment
- Reaching $3-5K/month within 3 months

### Future Vision

- **Phase 2**: Prototype orchestration — delegate to external AI service, queue management, `/building`, `/queue` commands. Flow differs by project type:
  - **Simple projects**: auto-build prototype → notify with cover letter + prototype link ready
  - **Greenfield projects**: notify first (briefing only) → user reviews and decides → taps [Build Prototype] → then prototype is built → cover letter updated with link
- **Phase 3**: Profile Highlights post added to Telegram flow (Post 3 with [Approve PH] [Refine PH])
- **Phase 4**: Analytics — `/stats`, `/history`, win/loss tracking
- **Phase 5**: Self-improving loop — AI learns from outcomes to tune filtering and proposal style
- **Phase 6**: Full autonomy for simple projects — no human in the loop
