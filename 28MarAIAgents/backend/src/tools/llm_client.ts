import axios from 'axios';
import { OpenAI } from 'openai';

const CONFIG: Record<string, any> = {
    groq: { baseUrl: 'https://api.groq.com/openai/v1', defaultModel: 'llama-3.3-70b-versatile' },
    grok: { baseUrl: 'https://api.x.ai/v1', defaultModel: 'grok-beta' },
    gemini: { baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', defaultModel: 'gemini-1.5-pro' },
    ollama: { baseUrl: 'http://localhost:11434/v1', defaultModel: 'llama3' }
};

export async function testConnection(provider: string, apiKey?: string, baseUrl?: string, model?: string) {
    try {
        if (provider === 'ollama') {
            const url = (baseUrl || 'http://localhost:11434').replace('/v1', '').replace(/\/$/, '');
            const res = await axios.get(`${url}/api/tags`, { timeout: 10000 });
            if (res.status === 200) {
                const models = res.data.models.map((m: any) => m.name);
                if (models.length === 0) return { ok: false, message: "Ollama running but no models installed. Run: ollama pull llama3" };
                return { ok: true, message: `Ollama connected. Models: ${models.slice(0, 5).join(', ')}`, models };
            }
            return { ok: false, message: "Ollama not responding." };
        }

        const cfg = CONFIG[provider] || {};
        const testModel = model || cfg.defaultModel;
        
        const client = new OpenAI({
            apiKey: apiKey || '',
            baseURL: baseUrl || cfg.baseUrl,
        });

        await client.chat.completions.create({
            model: testModel,
            messages: [{ role: 'user', content: 'Reply with just: OK' }],
            max_tokens: 5
        });

        return { ok: true, message: `${provider.toUpperCase()} connected. Model: ${testModel}`, model: testModel };
    } catch (e: any) {
        const msg = String(e.message || e);
        if (msg.includes('401') || msg.toLowerCase().includes('unauthorized')) return { ok: false, message: `Invalid API key for ${provider}.` };
        if (msg.includes('404')) return { ok: false, message: `Model not found. Check the model name.` };
        return { ok: false, message: msg };
    }
}

export async function generateCompletion(provider: string, model: string, messages: any[], apiKey?: string, baseUrl?: string, temperature: number = 0.2) {
    try {
        const cfg = CONFIG[provider] || {};
        const client = new OpenAI({
            apiKey: apiKey || (provider === 'ollama' ? 'ollama' : ''),
            baseURL: baseUrl || cfg.baseUrl
        });

        const res = await client.chat.completions.create({
            model: model,
            messages: messages,
            temperature: temperature
        });

        return { ok: true, content: res.choices[0].message.content };
    } catch (e: any) {
        return { ok: false, message: String(e.message || e) };
    }
}
