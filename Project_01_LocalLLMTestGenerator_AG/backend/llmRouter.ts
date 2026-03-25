import express from 'express';
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

export interface LLMPayload {
  provider: 'ollama' | 'lmstudio' | 'openai' | 'claude' | 'grok' | 'gemini' | 'groq';
  endpoint?: string;
  apiKey?: string;
  model: string;
  prompt: string;
}

router.post('/generate', async (req, res) => {
  const { provider, endpoint, apiKey, model, prompt }: LLMPayload = req.body;

  try {
    const systemPrompt = `You are an expert QA Engineer. Generate Functional and Non-Functional test cases based on the following requirements.
You MUST respond with a JSON array of objects representing the test cases. DO NOT wrap the response in markdown blocks like \`\`\`json. Only output the raw JSON array.
Each object must have the following keys:
- "id": string (e.g., "TC-001")
- "description": string (brief description of what is being tested)
- "type": "Positive" | "Negative" | "Edge Case"
- "priority": "High" | "Medium" | "Low"
- "steps": array of strings (the steps to reproduce)
- "expectedResult": string (what should happen)`;
    let generatedText = "";

    if (['ollama', 'lmstudio', 'openai', 'grok', 'groq'].includes(provider)) {
      const client = new OpenAI({
        apiKey: apiKey || 'not-needed',
        baseURL: endpoint || undefined,
      });

      const response = await client.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ]
      });
      generatedText = response.choices[0].message.content || "";
    }
    else if (provider === 'claude') {
      const anthropic = new Anthropic({ apiKey: apiKey || '' });
      const response = await anthropic.messages.create({
        model: model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }]
      });
      // @ts-ignore
      generatedText = response.content[0].text;
    }
    else if (provider === 'gemini') {
      const ai = new GoogleGenAI({ apiKey: apiKey || '' });
      const response = await ai.models.generateContent({
        model: model,
        contents: `${systemPrompt}\n\nRequirements:\n${prompt}`
      });
      generatedText = response.text || "";
    }

    res.json({ success: true, text: generatedText });
  } catch (error: any) {
    console.error("LLM Generation Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/test-connection', async (req, res) => {
  const { provider, endpoint, apiKey, model }: Omit<LLMPayload, 'prompt'> = req.body;
  try {
    // A lightweight ping or model list fetch to verify connection
    if (['ollama', 'lmstudio', 'openai', 'grok', 'groq'].includes(provider)) {
      const client = new OpenAI({ apiKey: apiKey || 'not-needed', baseURL: endpoint || undefined });
      await client.models.list(); // Should throw if unauthorized
    }
    res.json({ success: true, message: "Connection successful" });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
