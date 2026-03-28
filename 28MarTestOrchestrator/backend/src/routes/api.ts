import express from 'express';
import { jiraService } from '../services/jiraService';
import { llmService, TestCase } from '../services/llmService';

const router = express.Router();

// Fetch Jira User Stories
router.get('/jira/stories', async (req, res) => {
  try {
    const stories = await jiraService.fetchUserStories();
    res.json({ success: true, stories });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch Jira stories' });
  }
});

// Generate Test Plan & Cases
router.post('/generate/testplan', async (req, res) => {
  const { summary, description } = req.body;
  try {
    const testPlan = await llmService.generateTestPlan(summary, description);
    res.json({ success: true, testPlan });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to generate test plan' });
  }
});

// Generate Automation Code
router.post('/generate/code', async (req, res) => {
  const { testCase, tool }: { testCase: TestCase; tool: 'selenium' | 'playwright' } = req.body;
  try {
    const code = await llmService.generateAutomationCode(testCase, tool);
    res.json({ success: true, code });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to generate automation code' });
  }
});

export default router;
