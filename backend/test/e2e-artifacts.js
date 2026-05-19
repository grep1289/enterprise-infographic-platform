import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.resolve(__dirname, '../../output/artifacts');
const apiBase = 'http://localhost:3001';
const provider = process.argv[2] || process.env.PROVIDER || 'gemini';
const prompt = 'Generate an editable infographic for a modern DevSecOps workflow in 2026, including cloud-native security automation, continuous compliance, secure infrastructure, developer collaboration, and risk monitoring.';

async function run() {
  await fs.mkdir(outputDir, { recursive: true });

  console.log('Using provider:', provider);
  console.log('Prompt:', prompt);

  const generateResponse = await fetch(`${apiBase}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, provider })
  });

  if (!generateResponse.ok) {
    const body = await generateResponse.text();
    throw new Error(`Generate failed: ${generateResponse.status} ${body}`);
  }

  const { ast, svg } = await generateResponse.json();
  if (!ast || !svg) {
    throw new Error('Generate response did not include ast and svg.');
  }

  const svgPath = path.join(outputDir, 'devsecops-workflow-2026.svg');
  await fs.writeFile(svgPath, svg, 'utf8');
  console.log('Saved SVG:', svgPath);

  const exportResponse = await fetch(`${apiBase}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ast })
  });

  if (!exportResponse.ok) {
    const body = await exportResponse.text();
    throw new Error(`Export failed: ${exportResponse.status} ${body}`);
  }

  const { pptx } = await exportResponse.json();
  if (!pptx) {
    throw new Error('Export response did not include pptx.');
  }

  const pptxPath = path.join(outputDir, 'devsecops-workflow-2026.pptx');
  const data = Buffer.from(pptx, 'base64');
  await fs.writeFile(pptxPath, data);
  console.log('Saved PPTX:', pptxPath);

  const metaPath = path.join(outputDir, 'devsecops-workflow-2026.json');
  await fs.writeFile(metaPath, JSON.stringify({ prompt, provider, svgPath, pptxPath }, null, 2), 'utf8');
  console.log('Saved metadata:', metaPath);
}

run().catch((error) => {
  console.error('E2E artifact generation failed:', error.message);
  process.exit(1);
});
