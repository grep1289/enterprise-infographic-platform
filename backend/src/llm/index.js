import { generateWithOpenAI } from './openai.js';
import { generateWithClaude } from './claude.js';
import { generateWithAzureOpenAI } from './azureOpenAI.js';
import { generateWithOllama } from './ollama.js';
import { generateWithGemini } from './gemini.js';
import { generateWithMock } from './mock.js';

export async function generateWithProvider(provider, systemPrompt, userPrompt) {
  const adapters = {
    openai: () => generateWithOpenAI(systemPrompt, userPrompt),
    claude: () => generateWithClaude(systemPrompt, userPrompt),
    azure: () => generateWithAzureOpenAI(systemPrompt, userPrompt),
    ollama: () => generateWithOllama(systemPrompt, userPrompt),
    gemini: () => generateWithGemini(systemPrompt, userPrompt),
    mock: () => generateWithMock(systemPrompt, userPrompt)
  };

  const adapter = adapters[provider];
  if (!adapter) throw new Error(`Unknown provider: ${provider}`);
  return adapter();
}
