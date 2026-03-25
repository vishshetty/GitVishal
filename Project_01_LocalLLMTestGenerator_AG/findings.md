# Findings

## Research & Discoveries
- **Test Generation Focus**: Both API and Web Application test cases. Must cover both Functional and Non-Functional testing.
- **Output Structure**: Test cases must be strictly formatted for Jira.
- **Input Method**: Users will provide inputs either by copy-pasting Jira requirements or through direct chat interface.
- **LLM APIs**: The application needs to be flexible, supporting local APIs (Ollama, LM Studio) and remote vendor APIs (Grok, OpenAI, Claude, Gemini).
- **Architecture**: A full-stack TypeScript application (Node.js backend + React frontend).
- **UI Blueprint (from design image)**:
  - Main Window: Sidebar for History, Output box for generated cases, Input box.
  - Settings Window: Configuration for different providers, with a Save button and Test Connection button.

## Constraints
- **Execution Halted**: No scripts or code are to be written until the Discovery Questions are answered.
- **Prerequisite**: An approved Blueprint must be established in `task_plan.md` before execution begins.
- **Format**: All documentation must be in Markdown format.
- **Settings**: A settings window must be designed in the frontend to handle the various LLM configurations.
