import axios from 'axios';

export async function generateWithAzureOpenAI(systemPrompt, userPrompt) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  if (!endpoint || !deployment) {
    throw new Error('Azure OpenAI endpoint and deployment must be configured');
  }

  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-12-01`;
  const response = await axios.post(
    url,
    {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 800
    },
    {
      headers: {
        'api-key': process.env.AZURE_OPENAI_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data?.choices?.[0]?.message?.content ?? '';
}
