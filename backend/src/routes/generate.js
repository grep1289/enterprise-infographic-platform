import express from 'express';
import { buildContentPrompt } from '../prompts/contentPrompt.js';
import { renderingContract } from '../prompts/renderingContract.js';
import { generateWithProvider } from '../llm/index.js';
import { sanitizeAndRepairJson } from '../validator/schemaRepairLayer.js';
import { validateAst } from '../validator/validateAst.js';
import { applyLayout } from '../layout/layoutEngine.js';
import { renderSvg } from '../renderer/svgRenderer.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { prompt, provider = 'openai' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const userPrompt = buildContentPrompt(prompt);
    const rawOutput = await generateWithProvider(provider, renderingContract, userPrompt);

    const repaired = sanitizeAndRepairJson(rawOutput);
    if (!repaired.success) {
      return res.status(422).json({ error: repaired.error });
    }

    const validated = validateAst(repaired.data);
    const withLayout = applyLayout(validated);
    const svg = renderSvg(withLayout);

    return res.json({ ast: withLayout, svg });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
