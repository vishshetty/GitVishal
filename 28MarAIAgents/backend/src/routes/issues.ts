import { Router } from 'express';
import { JiraConnection } from '../db/database';
import { getProjectIssues } from '../tools/jira_client';

const router = Router();

router.post('/fetch', async (req, res) => {
    const { connection_id, project_key, sprint_version } = req.body;
    let c = await JiraConnection.findByPk(connection_id);
    if (!c) {
        c = await JiraConnection.findOne();
    }
    if (!c) {
        return res.status(404).json({ detail: "Jira connection not found. Please setup Jira again." });
    }
    console.log("JIRA FETCH DB OBJECT:", c.toJSON());
    const result = await getProjectIssues(c.host, c.email, c.api_token, project_key, sprint_version);
    if (!result.ok) {
        return res.status(400).json({ detail: result.message });
    }

    res.json(result);
});

export default router;
