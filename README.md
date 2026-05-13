# SparcBlog AI

AI-powered blog content engine for SparcPay. Aggregates fintech/payments/AP industry news, uses the Claude API to generate blog post drafts in SparcPay's brand voice, and provides an editorial dashboard for reviewing, editing, and managing content.

## Tech Stack

- **Backend:** Java 17 + Spring Boot 3.2
- **Frontend:** Angular 17 with TypeScript
- **Database:** MongoDB
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)
- **News Aggregation:** RSS feeds via ROME library
- **Build:** Maven (backend), npm/Angular CLI (frontend)
- **Styling:** Bootstrap 5

## Prerequisites

- Java 17+
- Node.js 18+
- MongoDB running on `localhost:27017`
- Anthropic API key

## Setup

### Environment Variables

```bash
export CLAUDE_API_KEY=your-anthropic-api-key
```

### Start MongoDB

```bash
mongod --dbpath /path/to/data
```

### Start Backend

```bash
cd backend
./mvnw spring-boot:run
```

The backend starts on http://localhost:8080.

### Start Frontend

```bash
cd frontend
npm install
npx ng serve
```

The frontend starts on http://localhost:4200.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/sources | List all news sources |
| POST | /api/sources | Add a new source |
| PUT | /api/sources/{id} | Update a source |
| DELETE | /api/sources/{id} | Delete a source |
| GET | /api/news | List fetched articles (supports pagination, category, minRelevance filters) |
| POST | /api/news/fetch | Trigger a manual news fetch cycle |
| GET | /api/news/{id} | Get a single article |
| POST | /api/drafts/generate | Generate a new blog draft using Claude AI |
| GET | /api/drafts | List all drafts (supports pagination, status, targetVertical filters) |
| GET | /api/drafts/{id} | Get a single draft |
| PUT | /api/drafts/{id} | Update draft content |
| PATCH | /api/drafts/{id}/status | Change draft status (DRAFT, IN_REVIEW, APPROVED, PUBLISHED, REJECTED) |
| DELETE | /api/drafts/{id} | Delete a draft |
| GET | /api/stats | Dashboard statistics |

## Features

- **News Aggregation:** Automatically fetches and scores articles from RSS feeds based on relevance to AP automation, fintech, and payments
- **AI Draft Generation:** Uses Claude to generate blog posts in SparcPay's brand voice, targeting specific industry verticals
- **Editorial Workflow:** Full draft lifecycle management (Draft -> In Review -> Approved -> Published)
- **Dashboard:** Real-time stats on drafts, articles, and sources
- **Source Management:** Add, edit, enable/disable RSS feed sources
- **Scheduled Fetching:** Daily automatic news fetch at 7 AM

## Screenshots

_Coming soon_

---

Built with [Claude Code](https://claude.ai/claude-code) as the AI-assisted development tool.
