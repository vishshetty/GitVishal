import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder',
  baseURL: process.env.OPENAI_BASE_URL || undefined, // Useful for Ollama or Local Llama
});

export interface TestCase {
  testCaseId: string;
  scenarioId: string;
  testScenario: string;
  steps: string[];
  expectedResult: string;
}

export interface TestPlan {
  objective: string;
  scope: string;
  inclusions: string[];
  exclusions: string[];
  testEnvironments: string[];
  defectReporting: string;
  testStrategy: string;
  testSchedule: string;
  testDeliverables: string[];
  entryCriteria: string[];
  exitCriteria: string[];
  tools: string[];
  risksAndMitigations: string[];
  testCases: TestCase[];
}

import fs from 'fs';
import path from 'path';

export class LLMService {
  async generateTestPlan(storySummary: string, storyDescription: string): Promise<TestPlan> {
    try {
      const prompt = `You are a Senior QA Architect. Generate a SPECIFIC, DETAILED test plan and test cases for the EXACT Jira User Story provided below.

CRITICAL RULES:
- Every section MUST be directly derived from the story below. Do NOT generate generic content.
- The Objective must mention the exact feature/functionality from the story summary.
- The Scope must describe specifically what will be tested for THIS story.
- Test Cases must reflect the exact workflows, inputs, and outcomes described in this story.
- Generate at least 5 unique Test Cases specifically for this story.
- Do NOT use placeholder text like "feature" or "module". Use the actual feature name from the story.

JIRA USER STORY:
Title: ${storySummary}
Description: ${storyDescription}

Return ONLY a valid JSON object with this EXACT structure:
{
  "objective": "string - specific to this story",
  "scope": "string - specific to this story",
  "inclusions": ["array", "of", "specific", "items", "for this story"],
  "exclusions": ["array"],
  "testEnvironments": ["array"],
  "defectReporting": "string",
  "testStrategy": "string - specific to this story's testing approach",
  "testSchedule": "string",
  "testDeliverables": ["array"],
  "entryCriteria": ["array"],
  "exitCriteria": ["array"],
  "tools": ["array"],
  "risksAndMitigations": ["array"],
  "testCases": [
    {
      "testCaseId": "TC-001",
      "scenarioId": "SCN-[FEATURE_CODE]-01",
      "testScenario": "string - specific test scenario for this story",
      "steps": ["step 1 specific to story", "step 2", "step 3"],
      "expectedResult": "string - specific expected outcome"
    }
  ]
}
Generate at least 5 test cases. Each test case must be specifically related to: ${storySummary}`;

      const response = await openai.chat.completions.create({
        model: process.env.MODEL_NAME || "gpt-4-turbo-preview",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        objective: result.objective || "No objective generated.",
        scope: result.scope || "",
        inclusions: result.inclusions || [],
        exclusions: result.exclusions || [],
        testEnvironments: result.testEnvironments || [],
        defectReporting: result.defectReporting || "",
        testStrategy: result.testStrategy || "",
        testSchedule: result.testSchedule || "",
        testDeliverables: result.testDeliverables || [],
        entryCriteria: result.entryCriteria || [],
        exitCriteria: result.exitCriteria || [],
        tools: result.tools || [],
        risksAndMitigations: result.risksAndMitigations || [],
        testCases: (result.testCases || []).map((tc: any) => ({
          testCaseId: tc.testCaseId || `TC-${Math.floor(Math.random() * 1000)}`,
          scenarioId: tc.scenarioId || "SCN-01",
          testScenario: tc.testScenario || "Untitled Scenario",
          steps: tc.steps || [],
          expectedResult: tc.expectedResult || ""
        }))
      };
    } catch (error) {
      console.error("LLM Generation Error:", error);
      return this.getMockTestPlan(storySummary, storyDescription);
    }
  }

  async generateAutomationCode(testCase: TestCase, tool: 'selenium' | 'playwright'): Promise<string> {
    try {
      let pageTemplatePath = '';
      let specTemplatePath = '';
      let language = 'TypeScript';

      if (tool === 'selenium') {
        pageTemplatePath = path.resolve(process.cwd(), '../project_context/LoginPage.java');
        specTemplatePath = path.resolve(process.cwd(), '../project_context/LoginTest.java');
        language = 'Java';
      } else {
        pageTemplatePath = path.resolve(process.cwd(), '../project_context/login.pages.ts');
        specTemplatePath = path.resolve(process.cwd(), '../project_context/login.spec.ts');
      }
      
      let pageCode = '';
      if (fs.existsSync(pageTemplatePath)) {
        pageCode = fs.readFileSync(pageTemplatePath, 'utf8');
      }

      let specCode = '';
      if (fs.existsSync(specTemplatePath)) {
        specCode = fs.readFileSync(specTemplatePath, 'utf8');
      }

      const prompt = `Generate ${tool} automation code in ${language} for this test case:
      Test Scenario: ${testCase.testScenario}
      Steps: ${testCase.steps.join(', ')}
      Expected: ${testCase.expectedResult}

      MUST FOLLOW THIS EXACT PATTERN (POM):
      --- Page Pattern ---
      ${pageCode}
      
      --- Spec Pattern ---
      ${specCode}
      
      Return ONLY the code block combined. Do not hallucinate imports.`;

      const response = await openai.chat.completions.create({
        model: process.env.MODEL_NAME || "gpt-4-turbo-preview",
        messages: [{ role: "user", content: prompt }]
      });

      return response.choices[0].message.content || "// Failed to generate code";
    } catch (error) {
      console.error("LLM Generation Error for Code:", error);

      if (tool === 'selenium') {
          return `package com.vwo.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class FeaturePage {
    private WebDriver driver;
    private By primaryElement = By.id("primary-${testCase.scenarioId.toLowerCase()}");

    public FeaturePage(WebDriver driver) {
        this.driver = driver;
    }

    public void navigate() {
        driver.get("https://app.vwo.com/#/${testCase.scenarioId.toLowerCase()}");
    }

    public boolean isPrimaryElementDisplayed() {
        return driver.findElement(primaryElement).isDisplayed();
    }
}

// ==========================================
package com.vwo.tests;

import com.vwo.pages.FeaturePage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ${testCase.scenarioId.replace(/-/g, '')}Test extends BaseTest {

    @Test
    public void ${testCase.scenarioId.replace(/[^a-zA-Z0-9]/g, '')}_TestFlow() {
        // Test Title: ${testCase.testScenario}
        // Steps provided from Test Case:
        // ${testCase.steps.map(s => `- ${s}`).join('\n        // ')}
        
        FeaturePage featurePage = new FeaturePage(driver);
        featurePage.navigate();
        
        // Expected: ${testCase.expectedResult}
        Assert.assertTrue(featurePage.isPrimaryElementDisplayed(), "Primary element is not visible.");
    }
}
`;
      }

      return `import { test, expect, Page, Locator } from '@playwright/test';

// ==========================================
// Page Object Model (Enforced via Context)
// ==========================================
class FeaturePage {
    readonly page: Page;
    readonly primaryElement: Locator;
    
    constructor(page: Page) {
        this.page = page;
        this.primaryElement = page.locator('#primary-${testCase.scenarioId.toLowerCase()}');
    }

    async navigate() {
        await this.page.goto('https://app.vwo.com/#/${testCase.scenarioId.toLowerCase()}');
    }
}

// ==========================================
// Auto-Generated Spec based on STRICT format
// ==========================================
test.describe('Generated Suite for ${testCase.scenarioId}', () => {

    test('${testCase.testScenario.replace(/'/g, "\\'")}', async ({ page }) => {
        // Steps provided from Test Case:
        // ${testCase.steps.map(s => `- ${s}`).join('\n        // ')}
        
        const featurePage = new FeaturePage(page);
        await featurePage.navigate();
        
        // Anti-Hallucination: Mock verification step matching expected result
        // Expected: ${testCase.expectedResult}
        await expect(featurePage.primaryElement).toBeVisible();
    });

});
`;
    }
  }

  private getMockTestPlan(summary: string, description: string): TestPlan {
      const featureName = summary.replace(/^(User Story|Feature|Task|Bug)[^\w]*/i, '').trim() || summary;
      const normalizedFeature = featureName.toUpperCase().replace(/\s+/g, '-').substring(0, 10);

      return {
        objective: `Ensure the proper implementation and functioning of the feature: ${featureName}.`,
        scope: `Testing UI interactions, edge cases, and core functional paths described for: ${featureName}.`,
        inclusions: [`Functional Testing of ${featureName}`, "UI Elements Validation", "Integration points"],
        exclusions: ["Performance testing under load", "Cross-browser mobile testing"],
        testEnvironments: ["Staging environment (https://staging.app.vwo.com)"],
        defectReporting: "All defects must be logged in Jira linked to the parent story.",
        testStrategy: `Manual execution of UI functional cases for ${featureName} followed by Automated Playwright spec generation.`,
        testSchedule: "To be completed within the current Sprint cycle.",
        testDeliverables: ["Test Plan", "Test Cases", "Automation Scripts", "Execution Report"],
        entryCriteria: ["Code deployed to Staging", "API endpoints available"],
        exitCriteria: ["100% test execution", "Zero critical defects open"],
        tools: ["Playwright", "Jira", "Test Orchestrator"],
        risksAndMitigations: ["Risk: Missing API data. Mitigation: Use mock servers for dependencies."],
        testCases: [
          {
            testCaseId: `TC-${normalizedFeature}-01`,
            scenarioId: `SCN-${normalizedFeature}-01`,
            testScenario: `Verify user can successfully execute the primary path for ${featureName}`,
            steps: [
              `Navigate to the ${featureName} module`,
              `Follow instructions exactly as given in: ${description.substring(0, 50)}...`,
              `Trigger the main action corresponding to the feature`,
              `Confirm execution without errors`
            ],
            expectedResult: `The ${featureName} action completes successfully and state is updated.`
          },
          {
            testCaseId: `TC-${normalizedFeature}-02`,
            scenarioId: `SCN-${normalizedFeature}-02`,
            testScenario: `Verify error handling and boundary conditions for ${featureName}`,
            steps: [
              `Navigate to the ${featureName} module`,
              `Provide intentionally invalid or empty inputs`,
              `Attempt to process the action`,
              `Observe system feedback`
            ],
            expectedResult: `The system correctly catches errors, prevents progression, and displays an appropriate warning for ${featureName}.`
          }
        ]
      };
  }
}

export const llmService = new LLMService();
