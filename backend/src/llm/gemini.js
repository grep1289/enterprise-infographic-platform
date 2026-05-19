import { GoogleGenAI } from '@google/genai';

export async function generateWithGemini(systemPrompt, userPrompt) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is required. Set GEMINI_API_KEY or GOOGLE_API_KEY.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    contents: `${systemPrompt}\n\n${userPrompt}`
  });

  return response?.text ?? '';
}
