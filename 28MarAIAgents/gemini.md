# 📜 gemini.md — Project Constitution
**Project:** Intelligent Test Planning Agent  
**Author:** Vishal Shetty  
**Framework:** B.L.A.S.T. (Blueprint → Link → Architect → Stylize → Trigger)  
**Anti-Hallucination:** STRICT — All outputs must be traceable to Jira issue data or user-provided context.

---

## 🔑 Data Schema (Input → Output)

### Input: Jira Connection Config
```json
{
  "connection_name": "string",
  "jira_host": "string (e.g. vishalshetty22.atlassian.net)",
  "jira_email": "string",
  "jira_api_token": "string",
  "jira_project_key": "string (e.g. KAN)"
}
```

### Input: Fetch Issues Request
```json
{
  "product_name": "string",
  "project_key": "string",
  "sprint_version": "string | null",
  "additional_context": "string | null",
  "issue_ids": ["string"] 
}
```

### Input: Jira Issue (Raw from API)
```json
{
  "id": "string",
  "key": "string (e.g. KAN-1)",
  "summary": "string",
  "description": "string | null",
  "issue_type": "string (Story | Bug | Task | Epic)",
  "status": "string",
  "priority": "string",
  "assignee": "string | null",
  "reporter": "string | null",
  "story_points": "number | null",
  "acceptance_criteria": "string | null",
  "labels": ["string"],
  "sprint": "string | null",
  "created": "datetime",
  "updated": "datetime"
}
```

### Input: LLM Connection Config
```json
{
  "provider": "ollama | groq | grok",
  "model": "string (e.g. llama3, llama-3.3-70b-versatile, grok-beta)",
  "api_key": "string | null (null for Ollama local)",
  "base_url": "string | null (for Ollama: http://localhost:11434)"
}
```

### Output: Generated Test Plan
```json
{
  "test_plan_id": "uuid",
  "generated_at": "datetime",
  "jira_project": "string",
  "jira_issues": ["string"],
  "product_name": "string",
  "llm_provider": "string",
  "llm_model": "string",
  "content": {
    "overview": "string",
    "scope": "string",
    "objectives": ["string"],
    "test_strategy": "string",
    "test_types": ["string"],
    "entry_criteria": ["string"],
    "exit_criteria": ["string"],
    "test_cases": [
      {
        "id": "string",
        "jira_ref": "string",
        "title": "string",
        "preconditions": "string",
        "steps": ["string"],
        "expected_result": "string",
        "priority": "High | Medium | Low"
      }
    ],
    "risks": ["string"],
    "timeline": "string"
  },
  "export_formats": ["docx", "html", "json"]
}
```

---

## 🏗️ Architectural Invariants

1. **Never invent test data** — All test cases must be derived ONLY from Jira issue fields.
2. **LLM is a formatter, not a fabricator** — The LLM receives Jira content and structures it per the template. It must not add assumptions.
3. **API connections are verified before use** — The "Test Connection" button must return HTTP 200 before saving.
4. **All secrets stored in `.env`** — Never hardcoded in source.
5. **History is persisted** — SQLite DB stores all generated test plans for "View History".
6. **Template-first** — The test plan structure MUST match the provided Word template sections.

---

## 🔌 Integration Registry

| Platform | Status | Auth Method |
|---|---|---|
| Jira (Atlassian Cloud) | ✅ Phase 1 | Basic Auth (Email + API Token) |
| ADO (Azure DevOps) | 🔜 Phase 2 | PAT Token |
| X-Ray | 🔜 Phase 2 | Jira App Token |
| TestRail | 🔜 Phase 3 | API Key |
| Zephyr | 🔜 Phase 3 | Jira App Token |
| Ollama (Local) | ✅ Phase 1 | None (localhost) |
| GROQ | ✅ Phase 1 | API Key |
| Grok (xAI) | ✅ Phase 1 | API Key |

---

## 📋 Behavioral Rules

- **Tone:** Professional, structured, QA-focused
- **Anti-Hallucination:** ACTIVE — Governed by `/anti_hallucination/anti_hallucination_rules.md`
- **Do NOT:** Invent features, APIs, acceptance criteria, or test steps not present in the Jira issue
- **Do NOT:** Proceed to next phase if the current phase's Link/connection test fails
- **Default LLM model:** GROQ `llama-3.3-70b-versatile` (fast, free tier available)

---

## 🔄 Change Log
| Date | Change | Phase |
|---|---|---|
| 2026-03-29 | Initial constitution created | Blueprint |
