# TestOrchestrator

AI-powered test automation platform that orchestrates the full QA lifecycle — from Jira user stories to production-ready Playwright/Selenium scripts.

---

## Overview

TestOrchestrator bridges the gap between requirements and automation. Feed it a Jira user story and it uses an LLM to generate structured test plans, granular test cases, and executable automation code — all in one workflow.

```
Jira Story  →  AI Test Plan  →  Test Cases  →  Automation Code (Playwright / Selenium)
```

---

## Features

| Feature | Description |
|---|---|
| **Jira Integration** | Fetch user stories directly from your Jira board |
| **AI Test Generation** | GPT-4 generates structured test plans and test cases |
| **Code Generation** | Produces ready-to-run Playwright or Selenium scripts |
| **Test Dashboard** | View, filter, and manage all generated test cases |
| **Mock Mode** | Works fully offline with realistic mock data |

---

## Tech Stack

**Frontend** — React 19 · TypeScript · Vite · Framer Motion · Lucide Icons

**Backend** — Node.js · Express 5 · TypeScript · OpenAI SDK · tsx (hot reload)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- OpenAI API key *(optional — app uses mock data without it)*

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd 28MarTestOrchestrator

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Configuration

Create `backend/.env`:

```env
PORT=3001
OPENAI_API_KEY=sk-...          # Required for real AI generation
MODEL_NAME=gpt-4-turbo-preview # Default model
# OPENAI_BASE_URL=http://localhost:11434/v1  # Uncomment for local Ollama
```

### Running the App

Open two terminals:

```bash
# Terminal 1 — Backend (port 3001)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm run dev
```

Visit **http://localhost:3000**

---

## Project Structure

```
28MarTestOrchestrator/
├── backend/
│   ├── src/
│   │   ├── server.ts              # Express app entry point
│   │   ├── routes/api.ts          # API route definitions
│   │   └── services/
│   │       ├── llmService.ts      # OpenAI test generation
│   │       └── jiraService.ts     # Jira story fetching (+ mock)
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── App.tsx                # Root component + navigation
    │   ├── components/
    │   │   ├── Dashboard.tsx      # Overview stats & activity
    │   │   ├── JiraFetcher.tsx    # Story browser
    │   │   ├── TestGenerator.tsx  # AI test plan generator
    │   │   ├── TestDashboard.tsx  # Test case table
    │   │   └── CodeGenerator.tsx  # Automation code viewer
    │   ├── index.css              # Global styles & design tokens
    │   └── App.css                # Component-level styles
    ├── vite.config.ts             # Vite config + API proxy
    └── package.json
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/jira/stories` | Fetch Jira user stories |
| `POST` | `/api/generate/testplan` | Generate test plan from story |
| `POST` | `/api/generate/code` | Generate Playwright/Selenium code |

### POST `/api/generate/testplan`

```json
{
  "summary": "User can log in with email and password",
  "description": "As a user, I want to log in so that I can access my dashboard."
}
```

### POST `/api/generate/code`

```json
{
  "testCase": { "id": "TC-001", "title": "...", "steps": [...], "expectedResult": "..." },
  "tool": "playwright"
}
```

---

## Using a Local LLM (Ollama)

To use Llama 3 or any Ollama-compatible model instead of OpenAI:

```env
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_API_KEY=ollama
MODEL_NAME=llama3
```

---

## License

MIT
