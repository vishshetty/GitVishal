# 🔍 findings.md — Research & Discoveries

## Jira REST API (v3 — Atlassian Cloud)

- **Base URL:** `https://{host}/rest/api/3/`
- **Auth:** Basic Auth → `base64(email:api_token)` in `Authorization` header
- **Get all issues for project:** `GET /rest/api/3/search?jql=project={KEY}&maxResults=50`
- **Get single issue:** `GET /rest/api/3/issue/{issueKey}`
- **Fields of interest:** `summary`, `description`, `issuetype`, `status`, `priority`, `assignee`, `story_points`, `customfield_10016` (story points), `labels`, `sprint`
- **Description format:** Jira Cloud returns description as **Atlassian Document Format (ADF)** JSON — needs custom parser to extract plain text

## LLM Providers

### GROQ
- **Base URL:** `https://api.groq.com/openai/v1`
- **Compatible with:** OpenAI Python SDK (`openai` package, set `base_url`)
- **Free models:** `llama-3.3-70b-versatile`, `mixtral-8x7b-32768`, `gemma2-9b-it`
- **Test endpoint:** `GET /openai/v1/models`

### Ollama (Local)
- **Base URL:** `http://localhost:11434`
- **Compatible with:** OpenAI Python SDK (0.28+) or native `ollama` Python package
- **Test endpoint:** `GET /api/tags` → returns list of installed models
- **Common models:** `llama3`, `mistral`, `phi3`, `gemma`

### Grok (xAI)
- **Base URL:** `https://api.x.ai/v1`
- **Compatible with:** OpenAI Python SDK
- **Model:** `grok-beta`, `grok-2`
- **Test endpoint:** `GET /v1/models`

## Test Plan Template (Word .docx)
- Template structure extracted from context:
  - Cover Page (Project, Version, Date, Author)
  - 1. Introduction / Overview
  - 2. Scope (In Scope / Out of Scope)
  - 3. Objectives
  - 4. Test Strategy
  - 5. Test Types (Functional, Integration, Regression, etc.)
  - 6. Entry & Exit Criteria
  - 7. Test Cases Table
  - 8. Risks & Mitigations
  - 9. Timeline & Resources

## Key Libraries (Python Backend)
- `fastapi` + `uvicorn` — REST API server
- `jira` (atlassian-python-api) OR direct `httpx`/`requests` — Jira client
- `openai` — universal LLM client (works for GROQ, Grok, Ollama)
- `python-docx` — Generate .docx output
- `sqlalchemy` + `aiosqlite` — SQLite async ORM
- `python-dotenv` — `.env` loading

## Key Libraries (React Frontend)
- `vite` — build tool
- `react-router-dom` — routing
- `axios` — HTTP client
- `react-markdown` — render generated test plan
- `lucide-react` — icons (matches screenshot icon style)
