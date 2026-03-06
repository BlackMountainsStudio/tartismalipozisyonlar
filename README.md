# FootballAI - Controversy Detection Platform

AI-powered web platform that automatically discovers controversial referee decisions in football matches by crawling discussions from community platforms (Reddit, Eksi Sozluk) and analyzing them with OpenAI.

## Features

- **Automated Crawling** - Crawls Reddit and Eksi Sozluk for match discussions
- **AI Incident Detection** - OpenAI-powered analysis detects controversial referee decisions
- **Vector Clustering** - Qdrant groups similar comments to avoid duplicates
- **Admin Dashboard** - Review, approve, reject, edit, and merge detected incidents
- **AI Chat Assistant** - Natural language interface for querying incidents
- **Public Website** - Shows confirmed controversies to the public

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Crawler**: Playwright, Cheerio, Snoowrap
- **AI**: OpenAI API (GPT-4o-mini, text-embedding-3-small)
- **Vector Database**: Qdrant
- **Database**: PostgreSQL (Prisma ORM)

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Qdrant instance (local or cloud)
- OpenAI API key
- Reddit API credentials (optional, for Reddit crawling)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials.

### 3. Set up the database

```bash
npx prisma migrate dev --name init
```

### 4. Start Qdrant (optional, for vector clustering)

```bash
docker run -p 6333:6333 qdrant/qdrant
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site.
Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the admin dashboard.

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    page.tsx              # Public homepage
    matches/[id]/         # Public match detail page
    dashboard/            # Admin dashboard
      page.tsx            # Match list
      matches/[id]/       # Match detail with incidents
      chat/               # AI chat interface
    api/                  # API Routes
      matches/            # Match CRUD
      incidents/          # Incident CRUD
      crawler/            # Trigger crawl + AI analysis
      chat/               # AI chat endpoint
  components/             # Shared UI components
  crawler/                # Reddit and Eksi Sozluk crawlers
  agents/                 # AI incident detection and chat
  vector/                 # Qdrant vector DB integration
  database/               # Prisma client
  utils/                  # Keywords, logger, rate limiter
```

## Usage

### Adding a Match

1. Go to Dashboard (`/dashboard`)
2. Click "Add Match"
3. Fill in match details (teams, week, date)

### Running the Crawler

1. Click on a match in the Dashboard
2. Click "Run Crawler & AI"
3. The system will crawl discussions and detect incidents

### Reviewing Incidents

Each incident card shows:
- Type (Penalty, Offside, Red Card, VAR)
- Match minute (if detected)
- Description
- Confidence score
- Source links

Actions available:
- **Approve** - Shows on public page
- **Reject** - Hides from public page
- **Edit** - Modify description
- **Merge** - Combine with another incident

### AI Chat

Go to Dashboard > AI Chat to interact with the AI assistant:
- "Show me incidents with confidence above 0.7"
- "Explain why this incident was detected"
- "Summarize all pending incidents"

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matches` | List all matches |
| POST | `/api/matches` | Create a match |
| GET | `/api/incidents` | List incidents (filter by matchId, status, minConfidence) |
| POST | `/api/incidents` | Create an incident |
| PATCH | `/api/incidents/:id` | Update/merge incident |
| DELETE | `/api/incidents/:id` | Delete incident |
| POST | `/api/crawler` | Trigger crawl for a match |
| POST | `/api/chat` | Send message to AI chat |
