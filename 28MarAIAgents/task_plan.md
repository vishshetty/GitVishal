# 📋 task_plan.md — Intelligent Test Planning Agent

## 🎯 Project Goal
Build a full-stack "Intelligent Test Planning Agent" that:
1. Connects to Jira (and future: ADO, X-Ray) to fetch user stories by project/ID
2. Lets the user review fetched issues and add context
3. Uses an LLM (Ollama / GROQ / Grok) to generate a structured test plan
4. Exports the test plan as `.docx` and renders it in the browser
5. Maintains a "View History" of past generated plans

---

## 🟢 Phase 0: Initialization ✅
- [x] Read B.L.A.S.T Framework
- [x] Read UI screenshots (4-step wizard)
- [x] Read test plan template
- [x] Read anti-hallucination rules
- [x] Gather Jira credentials from user
- [x] Gather LLM requirements
- [x] Create `gemini.md` (Project Constitution)
- [x] Create `task_plan.md`
- [ ] Create `findings.md`
- [ ] Create `progress.md`

---

## 🏗️ Phase 1: Blueprint ✅ (Awaiting User Approval)

### Open Questions for User:
- [ ] Q1: Should the final test plan be downloadable as `.docx`? (Yes/No)
- [ ] Q2: Tech stack confirmed as **React (Vite) + FastAPI**?
- [ ] Q3: Is Grok = xAI's Grok or Google Gemini? User said "Grok also" in context of Ollama + GROQ.

---

## ⚡ Phase 2: Link (Connection Verification)
- [ ] Test Jira REST API with provided credentials
- [ ] Build `tools/jira_client.py` — minimal handshake
- [ ] Build `tools/llm_client.py` — test GROQ/Ollama/Grok connections
- [ ] Verify Jira project "KAN" list issues response

---

## ⚙️ Phase 3: Architect (3-Layer Build)

### Layer 1: Architecture SOPs
- [ ] `architecture/jira_connector.md`
- [ ] `architecture/llm_connector.md`
- [ ] `architecture/test_plan_generator.md`

### Layer 2: Navigation (FastAPI backend)
- [ ] `backend/main.py` — FastAPI app
- [ ] `backend/routers/connections.py` — Jira + LLM config endpoints
- [ ] `backend/routers/issues.py` — Fetch issues endpoint
- [ ] `backend/routers/testplan.py` — Generate test plan endpoint
- [ ] `backend/routers/history.py` — View history endpoint
- [ ] `backend/db/database.py` — SQLite setup
- [ ] `backend/db/models.py` — ORM models

### Layer 3: Tools
- [ ] `tools/jira_client.py`
- [ ] `tools/llm_client.py`
- [ ] `tools/test_plan_generator.py`
- [ ] `tools/docx_exporter.py`

### Frontend (React/Vite)
- [ ] Step 1: Setup page (Jira Connection + LLM Settings)
- [ ] Step 2: Fetch Issues page
- [ ] Step 3: Review page
- [ ] Step 4: Test Plan page (render + download)
- [ ] Settings: LLM connection manager
- [ ] History: View past test plans

---

## ✨ Phase 4: Stylize
- [ ] Apply clean, modern UI (matching screenshots)
- [ ] Export to `.docx` button
- [ ] Loading states and animations

---

## 🛰️ Phase 5: Trigger
- [ ] Finalize deployment approach
- [ ] Update maintenance log
