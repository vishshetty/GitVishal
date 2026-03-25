# Task Plan

## Phase 1: Initialization & Discovery
- [x] Create fundamental tracking documents (`task_plan.md`, `findings.md`, `progress.md`, `context.md`).
- [x] Ask discovery questions to define the scope and blueprint.
- [x] Get answers from the user.
- [x] Formulate Blueprint based on answers.
- [x] Receive approved Blueprint from the user.

## Blueprint (Approved)
- **Goal**: Generate Functional and Non-Functional API and Web Application test cases.
- **Output Format**: Jira format test cases.
- **Input Mechanism**: Jira requirements provided by user via copy-paste or chat input.
- **LLM Infrastructure**: Support for local/remote APIs including Ollama, LM Studio, Grok, OpenAI, Claude, and Gemini inside a settings window configuration.
- **Tech Stack**: 
  - Backend: Node.js with TypeScript.
  - Frontend: React with TypeScript.
- **UI Design**: Based on provided wireframes:
  - *Main Chat Interface*: A left sidebar for `History`, a main content area to display the generated test cases, and a bottom input field to ask for tests.
  - *Settings View*: Input configuration for various providers (Ollama, Grok, OpenAI, etc.) with a `Save Button` and `Test Connection` button.

## Phase 2: Implementation (Pending Blueprint Approval)
- [x] Initialize Node.js & React TypeScript environments.
- [x] Build UI based on the design wireframe (Chat Interface + Settings View).
- [x] Develop backend API clients to interface with the various LLMs (Ollama, LM Studio, OpenAI, Grok, Claude, Gemini).
- [x] Implement local database or storage mechanism to handle the `History` sidebar.
- [x] Implement settings save and test connection functionality.
- [x] Design and test the LLM prompts to output reliable Jira-formatted test cases.

## Phase 3: Testing & Refinement
- [x] Test all LLM connection settings.
- [x] Verify test case output formats (functional and non-functional, API and Web App cases).
