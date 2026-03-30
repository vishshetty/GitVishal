import { Router } from 'express';
import { TestPlanHistory } from '../db/database';

const router = Router();

router.get('/', async (req, res) => {
    const hists = await TestPlanHistory.findAll({ order: [['createdAt', 'DESC']] });
    res.json(hists.map(h => ({
        id: h.id,
        project_key: h.project_key,
        issues_used: JSON.parse(h.issues_used),
        created_at: h.createdAt,
        plan_json: JSON.parse(h.plan_json)
    })));
});

router.delete('/:id', async (req, res) => {
    await TestPlanHistory.destroy({ where: { id: req.params.id } });
    res.json({ ok: true });
});

export default router;
