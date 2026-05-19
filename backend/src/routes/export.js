import express from 'express';
import { validateAst } from '../validator/validateAst.js';
import { applyLayout } from '../layout/layoutEngine.js';
import { renderPpt } from '../renderer/pptRenderer.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { ast } = req.body;
    if (!ast) {
      return res.status(400).json({ error: 'ast is required' });
    }

    const validated = validateAst(ast);
    const withLayout = applyLayout(validated);
    const base64 = await renderPpt(withLayout);

    return res.json({ pptx: base64 });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
