import { generateCompletion } from './llm_client';

const SYSTEM_PROMPT = `
You are an expert QA Test Planner acting under STRICT anti-hallucination rules.
You will write a comprehensive Test Plan based ONLY on the provided Jira issues.

RULES (MANDATORY):
1. DO NOT invent features, APIs, error codes, UI elements, or test steps not inferable from the issues.
2. DO NOT assume default behavior.
3. If information is missing for a section, write: "Insufficient information provided in Jira issues."
4. Format your output strictly as the final JSON schema. No markdown outside the JSON.
5. All test cases must reference the specific Jira Key they test.

JSON RESPONSE FORMAT:
{
  "overview": "string",
  "scope": "string",
  "objectives": ["string"],
  "test_strategy": "string",
  "test_types": ["string"],
  "entry_criteria": ["string"],
  "exit_criteria": ["string"],
  "test_cases": [
    {
      "id": "TC-001",
      "jira_ref": "KAN-1",
      "title": "string",
      "preconditions": "string",
      "steps": ["string"],
      "expected_result": "string",
      "priority": "High|Medium|Low"
    }
  ],
  "risks": ["string"],
  "timeline": "string"
}
`;

export async function generatePlan(issues: any[], provider: string, model: string, context: string, apiKey: string, baseUrl: string) {
    const issuesText = JSON.stringify(issues.map(i => ({
        key: i.key,
        summary: i.summary,
        description: i.description,
        type: i.issue_type,
        acceptance: i.acceptance_criteria
    })), null, 2);

    const userMsg = `
Provided Context & Notes from QA Lead:
${context || 'None'}

Jira Issues to parse:
${issuesText}

Generate the test plan in JSON format.
    `;

    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMsg }
    ];

    const res = await generateCompletion(provider, model, messages, apiKey, baseUrl, 0.1);
    if (!res.ok) return { ok: false, message: res.message };

    try {
        let txt = res.content!.trim();
        if (txt.startsWith('```json')) txt = txt.substring(7, txt.length - 3).trim();
        else if (txt.startsWith('```')) txt = txt.substring(3, txt.length - 3).trim();
        
        return { ok: true, plan: JSON.parse(txt) };
    } catch (e: any) {
        return { ok: false, message: `LLM returned invalid JSON: ${e.message}`, raw: res.content };
    }
}
