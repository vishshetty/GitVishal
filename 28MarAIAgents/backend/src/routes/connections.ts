import { Router } from 'express';
import { JiraConnection, LLMConnection } from '../db/database';
import { testConnection as testJira } from '../tools/jira_client';
import { testConnection as testLlm } from '../tools/llm_client';

const router = Router();

router.post('/jira/test', async (req, res) => {
    let { host, email, api_token, connection_id } = req.body;
    // If no token provided, try to use stored one
    if (!api_token && connection_id) {
        const stored = await JiraConnection.findByPk(connection_id);
        if (stored) api_token = stored.api_token;
    }
    if (!api_token) {
        const stored = await JiraConnection.findOne({ where: { host, email } });
        if (stored) api_token = stored.api_token;
    }
    const result = await testJira(host, email, api_token);
    res.json(result);
});

router.post('/jira', async (req, res) => {
    let { connection_name, host, email, api_token } = req.body;
    let c = await JiraConnection.findOne({ where: { connection_name } });
    if (c) {
        // Keep existing token if not provided
        const updateData: any = { host, email };
        if (api_token) updateData.api_token = api_token;
        await c.update(updateData);
    } else {
        await JiraConnection.create({ connection_name, host, email, api_token });
    }
    res.json({ ok: true, message: "Saved" });
});

router.get('/jira', async (req, res) => {
    const jiras = await JiraConnection.findAll();
    res.json(jiras.map(j => ({ id: j.id, connection_name: j.connection_name, host: j.host, email: j.email, has_token: !!j.api_token })));
});

router.delete('/jira/:id', async (req, res) => {
    await JiraConnection.destroy({ where: { id: req.params.id } });
    res.json({ ok: true });
});

router.post('/llm/test', async (req, res) => {
    let { provider, model, api_key, base_url } = req.body;
    // If no api_key provided, try to use stored one
    if (!api_key && provider !== 'ollama') {
        const stored = await LLMConnection.findOne({ where: { provider } });
        if (stored && stored.api_key) api_key = stored.api_key;
    }
    const result = await testLlm(provider, api_key, base_url, model);
    res.json(result);
});

router.post('/llm', async (req, res) => {
    let { provider, model, api_key, base_url } = req.body;
    let c = await LLMConnection.findOne({ where: { provider } });
    if (c) {
        // Keep existing api_key if not provided
        const updateData: any = { model, base_url, is_active: 1 };
        if (api_key) updateData.api_key = api_key;
        await c.update(updateData);
    } else {
        await LLMConnection.create({ provider, model, api_key, base_url, is_active: 1 });
    }
    res.json({ ok: true, message: "Saved" });
});

router.get('/llm', async (req, res) => {
    const llms = await LLMConnection.findAll();
    res.json(llms.map(l => ({ id: l.id, provider: l.provider, model: l.model, base_url: l.base_url, has_key: !!l.api_key })));
});

export default router;
