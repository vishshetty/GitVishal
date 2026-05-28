"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jiraService_1 = require("../services/jiraService");
const llmService_1 = require("../services/llmService");
const router = express_1.default.Router();
// Fetch Jira User Stories
router.get('/jira/stories', async (req, res) => {
    try {
        const stories = await jiraService_1.jiraService.fetchUserStories();
        res.json({ success: true, stories });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch Jira stories' });
    }
});
// Generate Test Plan & Cases
router.post('/generate/testplan', async (req, res) => {
    const { summary, description } = req.body;
    try {
        const testPlan = await llmService_1.llmService.generateTestPlan(summary, description);
        res.json({ success: true, testPlan });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to generate test plan' });
    }
});
// Generate Automation Code
router.post('/generate/code', async (req, res) => {
    const { testCase, tool } = req.body;
    try {
        const code = await llmService_1.llmService.generateAutomationCode(testCase, tool);
        res.json({ success: true, code });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to generate automation code' });
    }
});
exports.default = router;
