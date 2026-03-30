import { Router } from 'express';
import { LLMConnection, TestPlanHistory } from '../db/database';
import { generatePlan } from '../tools/test_plan_generator';
import { createDocx } from '../tools/docx_exporter';

const router = Router();

router.post('/generate', async (req, res) => {
    const { issues, llm_provider, additional_context, project_key } = req.body;
    
    const llm = await LLMConnection.findOne({ where: { provider: llm_provider } });
    if (!llm) {
        return res.status(404).json({ detail: `LLM connection for ${llm_provider} not found` });
    }

    const result = await generatePlan(
        issues, 
        llm.provider, 
        llm.model, 
        additional_context || "", 
        llm.api_key || "", 
        llm.base_url || ""
    );

    if (!result.ok) {
        return res.status(500).json({ detail: result.message });
    }

    const issueKeys = issues.map((i: any) => i.key);
    
    // Save history
    const hist = await TestPlanHistory.create({
        project_key: project_key,
        issues_used: JSON.stringify(issueKeys),
        plan_json: JSON.stringify(result.plan)
    });

    res.json({ ok: true, plan: result.plan, history_id: hist.id });
});

router.get('/:id/download', async (req, res) => {
    const hist = await TestPlanHistory.findByPk(req.params.id);
    if (!hist) {
        return res.status(404).json({ detail: "Test plan not found" });
    }

    const planData = JSON.parse(hist.plan_json);
    const docxBuffer = await createDocx(planData);

    res.setHeader('Content-Disposition', `attachment; filename=Test_Plan_${hist.project_key}.docx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(docxBuffer);
});

export default router;
