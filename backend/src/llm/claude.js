import axios from 'axios';

export async function generateWithClaude(systemPrompt, userPrompt) {
  const response = await axios.post(
    'https://api.anthropic.com/v1/chat/completions',
    {
      model: process.env.CLAUDE_MODEL || 'claude-3.5',
      max_tokens: 800,
      temperature: 0.1,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    },
    {
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data?.completion ?? response.data?.choices?.[0]?.message?.content ?? '';
}
