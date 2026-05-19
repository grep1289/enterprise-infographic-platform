# Enterprise Infographic Platform — Final PRD
**Version:** 2.0  
**Status:** Agent-Ready  
**Classification:** Product & Engineering Specification

---

## Review Notes: What Changed from Draft + Addendum

Before the final specification, here is a summary of every improvement applied and why.

### Issues Fixed

| Area | Draft Problem | Fix Applied |
|---|---|---|
| Architecture | LLMs asked to produce coordinates directly — high variance | Layout Engine layer added; LLM outputs semantic AST only |
| AST Schema (v1) | Flat `fill` hex field allowed LLMs to inject raw colors | Replaced with `semanticColor` enum; renderer owns all hex |
| PPTX Renderer (v1) | `addText()` width hard-coded to `w: 2` — text clips on any long string | Addendum v2 fixes this with `wrap: true`, `autoFit: true`, and bounded `w/h` scaled from canvas |
| PPTX Renderer (v1) | `pptx.ShapeType.roundRect` — wrong API; PptxGenJS uses `pres.shapes.ROUNDED_RECTANGLE` | Corrected in renderer spec |
| PPTX Renderer (v1) | `radius: 0.1` on shape — PptxGenJS uses `rectRadius` not `radius` | Corrected |
| SVG Renderer | Text positioned at fixed `y + 35` offset regardless of box height | Corrected to vertically centre text using `dominant-baseline="central"` at `y + height/2` |
| Generate route | Hard-coded to OpenAI only; no LLM selector | Route updated to accept `provider` param and route to adapter |
| OpenAI adapter | Hard-coded `model: 'gpt-5'` — does not exist | Changed to `gpt-4o` |
| Connectors | Connector rendering absent from both SVG and PPTX renderers | Connector rendering spec added for both renderers |
| Schema Repair | Error swallowed if `JSON.parse` throws — crashes silently | Wrapped in try/catch with structured error response |
| CI/CD | Backend workflow missing test and lint steps | Test + lint steps added |
| Frontend | Bare textarea with no SVG preview | Preview component and download button specified |
| Multi-slide | Tall canvases forced into single slide — content overflow | Auto-pagination rule added: new slide every 750px of canvas height |
| BFSI addendum | Arabic text fragment in line 1578 — editorial artifact | Removed |
| Addendum schema | `visualAstSchemaV2` introduced `canvas` wrapper but base schema had flat `width/height` | Unified under v2 schema throughout |
| Addendum | Manhattan router spec written as math formula only | Translated to implementable pseudocode |

---

## 1. Problem Statement

Enterprise architecture, DevOps transformation, and platform engineering teams spend significant time creating:

- executive infographics and operating model diagrams
- architecture and governance views
- transformation roadmaps and consulting presentation assets

Current tools all fail in at least one critical dimension:

| Tool | Failure |
|---|---|
| Figma / Lucidchart exports | Non-editable PowerPoint output |
| PNG / raster diagrams | Locked, non-searchable visuals |
| SVG embeds in PPT | Partially editable; no native shapes |
| Manual PowerPoint creation | Slow, error-prone, non-reproducible |
| AI image generators | Non-deterministic; no editability |

No current tool provides: AI generation + deterministic rendering + fully editable PowerPoint output + multi-LLM interoperability + Git-trackable source definitions.

---

## 2. Vision

```
Business Intent
      ↓
AI-generated Semantic Visual AST (JSON)
      ↓
Layout Engine (coordinate computation)
      ↓
Validation Layer
      ↓
Deterministic Renderer
      ├── SVG Preview
      └── Native Editable PPTX Export
```

The platform is **Presentation-as-Code**: diagrams are defined in versioned JSON, rendered deterministically, and exported as fully editable PowerPoint native shapes.

---

## 3. Core Product Goals

1. Generate enterprise-grade infographics from plain-language prompts.
2. Support multiple LLM providers interchangeably with consistent output.
3. Enforce deterministic rendering through a constraint-based system.
4. Export fully editable native PowerPoint shapes — zero image embeds.
5. Enable Git-based versioning and audit trails of visual assets.
6. Provide reusable enterprise visual templates.

---

## 4. Non-Goals

The platform does NOT support:

- artistic illustrations or marketing posters
- photorealistic or raster image generation
- freeform vector illustration (no Adobe Illustrator replacement)
- arbitrary SVG complexity (masks, filters, transforms, bezier paths)
- real-time collaboration editing

---

## 5. System Architecture

### 5.1 Full Data Flow

```
User Prompt + LLM Provider Selection
          ↓
Content Prompt Builder
          ↓
Rendering Contract (system prompt injected)
          ↓
LLM Adapter Layer
          ↓
Raw LLM Output (JSON string, possibly dirty)
          ↓
Schema Repair Layer (strip fences, fix trailing commas, assign missing IDs)
          ↓
AST Validator (Zod schema v2)
          ↓
Layout Engine (ELK/Dagre — injects x, y, width, height if absent)
          ↓
Validated, Coordinate-Complete AST
          ↓
Renderer Engine
    ├── SVG Renderer  →  SVG string → frontend preview
    └── PPTX Renderer → .pptx binary → download
```

### 5.2 Key Design Principle: Renderer-Controlled

LLMs output **semantic intent only**. The renderer owns all visual decisions.

| Responsibility | Owner |
|---|---|
| Element type, title, subtitle, connections | LLM |
| Coordinates (x, y, width, height) | Layout Engine |
| Colors (hex values) | Theme / Token System |
| Spacing, corner radius, font size | Renderer |
| Slide pagination | Renderer |

This guarantees identical output regardless of which LLM is used.

---

## 6. Repository Structure

```
enterprise-infographic-platform/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── components/
│   │   │   ├── PromptEditor.jsx
│   │   │   ├── LlmSelector.jsx
│   │   │   ├── SvgPreview.jsx
│   │   │   ├── Toolbar.jsx
│   │   │   └── DownloadButton.jsx
│   │   └── styles.css
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   │   ├── generate.js
│   │   │   └── export.js
│   │   ├── llm/
│   │   │   ├── index.js           ← adapter router
│   │   │   ├── openai.js
│   │   │   ├── claude.js
│   │   │   ├── azureOpenAI.js
│   │   │   └── ollama.js
│   │   ├── prompts/
│   │   │   ├── contentPrompt.js
│   │   │   └── renderingContract.js
│   │   ├── schema/
│   │   │   └── visualAstSchema.js  ← v2 (unified)
│   │   ├── validator/
│   │   │   ├── validateAst.js
│   │   │   └── schemaRepairLayer.js
│   │   ├── layout/
│   │   │   └── layoutEngine.js
│   │   ├── renderer/
│   │   │   ├── svgRenderer.js
│   │   │   ├── pptRenderer.js
│   │   │   ├── coordinateMapper.js
│   │   │   └── connectorRouter.js
│   │   └── theme/
│   │       └── enterpriseTheme.js
│   ├── package.json
│   └── .env.example
│
├── .github/
│   └── workflows/
│       ├── frontend.yml
│       └── backend.yml
│
├── prompts/                        ← versioned prompt definitions
├── samples/                        ← example AST JSON files
└── README.md
```

---

## 7. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React + Vite | React 18, Vite 5 |
| Backend API | Node.js + Express | Node 20 |
| PPT Generation | PptxGenJS | 3.12.x |
| SVG Rendering | Native SVG (server-side string) | — |
| Schema Validation | Zod | 3.23.x |
| Layout Engine | elkjs (Phase 2) / manual grid (Phase 1) | — |
| LLM Adapters | OpenAI, Anthropic, Ollama, Azure OpenAI | — |
| CI/CD | GitHub Actions | — |
| Deployment | Vercel (frontend), Render/Railway (backend) | — |

---

## 8. Visual AST Schema (v2 — Unified)

**File:** `backend/src/schema/visualAstSchema.js`

```javascript
import { z } from 'zod';

export const edgeSchema = z.object({
  targetId: z.string(),
  type: z.enum(['flow', 'association', 'feedback-loop', 'bypass-path']),
  style: z.enum(['solid', 'dashed', 'dotted']).default('solid'),
  routingHint: z.enum(['orthogonal', 'straight']).default('orthogonal'),
  label: z.string().optional()
});

export const elementSchema = z.object({
  id: z.string(),
  type: z.enum([
    'pipeline-stage',
    'copilot-card',
    'agent-card',
    'human-gate',
    'metric-card',
    'section-header',
    'label',
    'feedback-loop',
    'connector'
  ]),
  // Coordinates — may be omitted by LLM; Layout Engine fills these in
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),

  // Semantic grouping for layout
  parentId: z.string().optional(),
  layoutGroup: z.string().optional(),

  // Content
  title: z.string().optional(),
  subtitle: z.string().optional(),

  // Semantic color token — NO raw hex from LLM
  semanticColor: z.enum([
    'pipeline', 'copilot', 'agent', 'human',
    'auto', 'background', 'border', 'metric'
  ]).default('pipeline'),

  // Outbound connections
  edges: z.array(edgeSchema).default([])
});

export const visualAstSchema = z.object({
  canvas: z.object({
    width: z.number().max(1400).default(1400),
    height: z.number().max(3600).default(1800),
    themeId: z.string().default('enterprise-default'),
    title: z.string().optional()
  }),
  elements: z.array(elementSchema)
});
```

---

## 9. Enterprise Theme System

**File:** `backend/src/theme/enterpriseTheme.js`

```javascript
export const themes = {
  'enterprise-default': {
    pipeline:   { fill: '4F46C6', stroke: '3730A3', text: 'FFFFFF' },
    copilot:    { fill: '00897B', stroke: '00695C', text: 'FFFFFF' },
    agent:      { fill: 'D97706', stroke: 'B45309', text: 'FFFFFF' },
    human:      { fill: 'A63A1E', stroke: '7F2D17', text: 'FFFFFF' },
    auto:       { fill: '5B9F3A', stroke: '3D7A25', text: 'FFFFFF' },
    metric:     { fill: '1E40AF', stroke: '1E3A8A', text: 'FFFFFF' },
    background: { fill: 'F8FAFC', stroke: 'CBD5E1', text: '0F172A' },
    border:     { fill: 'FFFFFF', stroke: 'CBD5E1', text: '0F172A' }
  }
};

export function getThemeTokens(themeId, semanticColor) {
  return themes[themeId]?.[semanticColor] ?? themes['enterprise-default'].pipeline;
}
```

---

## 10. Rendering Contract (System Prompt)

**File:** `backend/src/prompts/renderingContract.js`

The rendering contract is injected as the LLM system prompt. It must:

- Forbid raw hex colors (use `semanticColor` tokens only)
- Forbid SVG, markdown, or explanation in output
- Require valid JSON matching the v2 schema
- Allow coordinate fields to be omitted (Layout Engine handles them)
- Enumerate all allowed element types

```javascript
export const renderingContract = `
You are a deterministic enterprise infographic layout engine.

OUTPUT: Valid JSON only. No markdown fences. No SVG. No explanation text.

ALLOWED ELEMENT TYPES:
pipeline-stage | copilot-card | agent-card | human-gate | metric-card
section-header | label | feedback-loop | connector

FIELD RULES:
- id: unique string per element
- type: one of the allowed types above
- title: short label (max 6 words)
- subtitle: supporting detail (max 10 words)
- semanticColor: one of: pipeline | copilot | agent | human | auto | background | border | metric
- edges: array of { targetId, type, style } — use for connectors between elements
- parentId: use to group cards under a parent section
- layoutGroup: use to hint swimlane placement (e.g. "left-lane", "center-lane", "right-lane")

DO NOT include:
- x, y, width, height (the layout engine calculates these)
- any hex color values
- SVG, HTML, or markdown

OUTPUT FORMAT:
{
  "canvas": {
    "width": 1400,
    "height": 1800,
    "themeId": "enterprise-default",
    "title": "<diagram title>"
  },
  "elements": [ ... ]
}
`;
```

---

## 11. Schema Repair Layer

**File:** `backend/src/validator/schemaRepairLayer.js`

```javascript
export function sanitizeAndRepairJson(rawLlmString) {
  try {
    let clean = rawLlmString.trim();

    // Strip markdown fences
    clean = clean.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/m, '');

    // Remove trailing commas before ] or }
    clean = clean.replace(/,(\s*[\]}])/g, '$1');

    const parsed = JSON.parse(clean);

    // Inject missing IDs
    if (Array.isArray(parsed.elements)) {
      parsed.elements = parsed.elements.map((el, i) => ({
        ...el,
        id: el.id || `${el.type || 'element'}-${i}`
      }));
    }

    return { success: true, data: parsed };
  } catch (err) {
    return { success: false, error: `JSON parse failed: ${err.message}` };
  }
}
```

---

## 12. Layout Engine

**File:** `backend/src/layout/layoutEngine.js`

Phase 1 uses a grid-based layout. Phase 2 upgrades to ELK.

**Phase 1 — Grid Layout Rules:**

- Default element size by type:

| Type | Width | Height |
|---|---|---|
| pipeline-stage | 200 | 80 |
| copilot-card / agent-card | 180 | 100 |
| section-header | 1300 | 60 |
| metric-card | 160 | 90 |
| human-gate | 120 | 120 |
| label | 200 | 40 |

- Minimum vertical gap between rows: 40px
- Horizontal grid snap: 20px
- Elements with the same `layoutGroup` are placed in the same column
- Canvas auto-paginates: every 750px of canvas height becomes a new PPT slide

**Phase 2 — ELK Integration:**

Replace the grid with `elkjs` graph layout. Pass nodes and edges from the AST. Inject computed `x`, `y`, `width`, `height` back into AST elements before rendering.

---

## 13. Connector Router

**File:** `backend/src/renderer/connectorRouter.js`

For each `edge` in `element.edges`, compute a path from the source element's boundary to the target element's boundary.

**Routing algorithm (Manhattan/Orthogonal):**

```
Given source box S and target box T:

1. Compute source exit point: bottom-centre of S = (S.x + S.width/2, S.y + S.height)
2. Compute target entry point: top-centre of T = (T.x + T.width/2, T.y)
3. Midpoint Y = (exitY + entryY) / 2
4. Path = [exitPoint, (exitX, midY), (entryX, midY), entryPoint]
5. If path segment intersects any element bounding box:
   - Shift the horizontal segment outward by +30px (right if going right, left if going left)
```

SVG renderer emits this as a `<polyline>` with `points`. PPTX renderer draws it as a sequence of `addShape(LINE)` segments.

---

## 14. SVG Renderer

**File:** `backend/src/renderer/svgRenderer.js`

```javascript
import { getThemeTokens } from '../theme/enterpriseTheme.js';
import { routeConnector } from './connectorRouter.js';

export function renderSvg(ast) {
  const { canvas, elements } = ast;
  const theme = canvas.themeId;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">`;
  svg += `<rect width="${canvas.width}" height="${canvas.height}" fill="#F8FAFC"/>`;

  // Build element lookup for connector routing
  const elementMap = Object.fromEntries(elements.map(el => [el.id, el]));

  // Render shapes
  elements.forEach(el => {
    if (el.type === 'connector') return; // connectors rendered via edges

    const tokens = getThemeTokens(theme, el.semanticColor);
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    const titleY = el.subtitle ? cy - 10 : cy;

    svg += `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"
      rx="12" fill="#${tokens.fill}" stroke="#${tokens.stroke}" stroke-width="1.5"/>`;

    if (el.title) {
      svg += `<text x="${cx}" y="${titleY}" text-anchor="middle" dominant-baseline="central"
        font-family="Arial" font-size="14" font-weight="bold" fill="#${tokens.text}">${escapeXml(el.title)}</text>`;
    }

    if (el.subtitle) {
      svg += `<text x="${cx}" y="${cy + 14}" text-anchor="middle" dominant-baseline="central"
        font-family="Arial" font-size="11" fill="#${tokens.text}" opacity="0.85">${escapeXml(el.subtitle)}</text>`;
    }

    // Render outbound edges
    (el.edges || []).forEach(edge => {
      const target = elementMap[edge.targetId];
      if (!target) return;
      const points = routeConnector(el, target, elements);
      const pointStr = points.map(p => `${p[0]},${p[1]}`).join(' ');
      const dashArray = edge.style === 'dashed' ? '6,4' : edge.style === 'dotted' ? '2,3' : 'none';
      svg += `<polyline points="${pointStr}" fill="none" stroke="#64748B"
        stroke-width="1.5" stroke-dasharray="${dashArray}"
        marker-end="url(#arrow)"/>`;
    });
  });

  svg += `<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
    <path d="M0,0 L0,6 L8,3 z" fill="#64748B"/></marker></defs>`;
  svg += '</svg>';

  return svg;
}

function escapeXml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
```

---

## 15. PPTX Renderer (Corrected)

**File:** `backend/src/renderer/pptRenderer.js`

```javascript
import PptxGenJS from 'pptxgenjs';
import { getThemeTokens } from '../theme/enterpriseTheme.js';
import { routeConnector } from './connectorRouter.js';

const SLIDE_W = 13.333;   // inches, LAYOUT_WIDE
const SLIDE_H = 7.5;
const CANVAS_SLICE_H = 750; // canvas px per slide

export async function renderPpt(ast) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';

  const { canvas, elements } = ast;
  const elementMap = Object.fromEntries(elements.map(el => [el.id, el]));

  // Paginate: one slide per 750px of canvas height
  const totalSlides = Math.ceil(canvas.height / CANVAS_SLICE_H);

  for (let page = 0; page < totalSlides; page++) {
    const slide = pptx.addSlide();
    const yOffset = page * CANVAS_SLICE_H;

    const scaleX = (x) => (x / canvas.width) * SLIDE_W;
    const scaleY = (y) => ((y - yOffset) / CANVAS_SLICE_H) * SLIDE_H;

    // Filter elements visible on this slide
    const visible = elements.filter(el =>
      el.y < yOffset + CANVAS_SLICE_H && el.y + el.height > yOffset
    );

    visible.forEach(el => {
      if (el.type === 'connector') return;

      const tokens = getThemeTokens(canvas.themeId, el.semanticColor);

      // Shape — CORRECTED: ROUNDED_RECTANGLE + rectRadius
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: scaleX(el.x),
        y: scaleY(el.y),
        w: scaleX(el.width),
        h: scaleY(el.height),
        fill: { color: tokens.fill },
        line: { color: tokens.stroke, width: 1.5 },
        rectRadius: 0.08
      });

      // Title text — CORRECTED: width/height bound to shape, wrap + autoFit
      if (el.title) {
        slide.addText(el.title, {
          x: scaleX(el.x),
          y: scaleY(el.y),
          w: scaleX(el.width),
          h: el.subtitle ? scaleY(el.height) * 0.55 : scaleY(el.height),
          fontFace: 'Arial',
          fontSize: el.type === 'section-header' ? 18 : 12,
          color: tokens.text,
          bold: true,
          align: 'center',
          valign: el.subtitle ? 'bottom' : 'middle',
          wrap: true,
          autoFit: true,
          margin: [4, 6, 4, 6]
        });
      }

      // Subtitle text
      if (el.subtitle) {
        slide.addText(el.subtitle, {
          x: scaleX(el.x),
          y: scaleY(el.y) + scaleY(el.height) * 0.55,
          w: scaleX(el.width),
          h: scaleY(el.height) * 0.4,
          fontFace: 'Arial',
          fontSize: 10,
          color: tokens.text,
          align: 'center',
          valign: 'top',
          wrap: true,
          autoFit: true,
          margin: [2, 6, 4, 6]
        });
      }

      // Connectors
      (el.edges || []).forEach(edge => {
        const target = elementMap[edge.targetId];
        if (!target) return;
        const points = routeConnector(el, target, elements);
        if (points.length < 2) return;

        for (let i = 0; i < points.length - 1; i++) {
          const [x1, y1] = points[i];
          const [x2, y2] = points[i + 1];
          slide.addShape(pptx.shapes.LINE, {
            x: scaleX(x1),
            y: scaleY(y1),
            w: scaleX(x2) - scaleX(x1),
            h: scaleY(y2) - scaleY(y1),
            line: {
              color: '64748B',
              width: 1.5,
              dashType: edge.style === 'dashed' ? 'dash' : edge.style === 'dotted' ? 'dot' : 'solid',
              endArrowType: i === points.length - 2 ? 'triangle' : 'none'
            }
          });
        }
      });
    });
  }

  return pptx.write({ outputType: 'base64' });
}
```

---

## 16. LLM Adapter Layer

**File:** `backend/src/llm/index.js` — Router

```javascript
import { generateWithOpenAI } from './openai.js';
import { generateWithClaude } from './claude.js';
import { generateWithAzureOpenAI } from './azureOpenAI.js';
import { generateWithOllama } from './ollama.js';

export async function generateWithProvider(provider, systemPrompt, userPrompt) {
  const adapters = {
    openai:       () => generateWithOpenAI(systemPrompt, userPrompt),
    claude:       () => generateWithClaude(systemPrompt, userPrompt),
    azure:        () => generateWithAzureOpenAI(systemPrompt, userPrompt),
    ollama:       () => generateWithOllama(systemPrompt, userPrompt)
  };
  const adapter = adapters[provider];
  if (!adapter) throw new Error(`Unknown provider: ${provider}`);
  return adapter();
}
```

All adapters receive separate `systemPrompt` and `userPrompt` parameters (not concatenated) so native system prompt fields are used where available.

**Corrected OpenAI adapter** (`model: 'gpt-4o'`, not `gpt-5`):

```javascript
export async function generateWithOpenAI(systemPrompt, userPrompt) {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o',
      temperature: 0.1,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    },
    { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
  );
  return response.data.choices[0].message.content;
}
```

---

## 17. Generate Route (Updated)

**File:** `backend/src/routes/generate.js`

```javascript
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

    if (!prompt) return res.status(400).json({ error: 'prompt is required' });

    const userPrompt = buildContentPrompt(prompt);
    const rawOutput = await generateWithProvider(provider, renderingContract, userPrompt);

    const repaired = sanitizeAndRepairJson(rawOutput);
    if (!repaired.success) return res.status(422).json({ error: repaired.error });

    const validated = validateAst(repaired.data);
    const withLayout = applyLayout(validated);
    const svg = renderSvg(withLayout);

    res.json({ ast: withLayout, svg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
```

**File:** `backend/src/routes/export.js`

```javascript
import express from 'express';
import { validateAst } from '../validator/validateAst.js';
import { applyLayout } from '../layout/layoutEngine.js';
import { renderPpt } from '../renderer/pptRenderer.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { ast } = req.body;
    if (!ast) return res.status(400).json({ error: 'ast is required' });

    const validated = validateAst(ast);
    const withLayout = applyLayout(validated);
    const base64 = await renderPpt(withLayout);

    res.json({ pptx: base64 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
```

---

## 18. Frontend Specification

### 18.1 Components

**`LlmSelector.jsx`** — Dropdown: OpenAI | Claude | Azure OpenAI | Ollama

**`PromptEditor.jsx`** — Large textarea for business intent input

**`SvgPreview.jsx`** — Renders returned SVG string inline; scales to container width

**`DownloadButton.jsx`** — Calls `/export`, receives base64 PPTX, triggers browser download

**`Toolbar.jsx`** — Contains LlmSelector + Generate button + DownloadButton

### 18.2 App Flow

```
User types prompt → selects provider → clicks Generate
  → POST /generate { prompt, provider }
  → Receives { ast, svg }
  → SVG rendered in SvgPreview
  → User clicks Download PPTX
  → POST /export { ast }
  → Receives { pptx } (base64)
  → Browser downloads enterprise-infographic.pptx
```

### 18.3 Download Trigger

```javascript
function downloadPptx(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'enterprise-infographic.pptx';
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## 19. Environment Variables

**File:** `backend/.env.example`

```bash
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_DEPLOYMENT=
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
PORT=3001
```

---

## 20. GitHub Actions — CI/CD

### Backend (`backend.yml`)

```yaml
name: Backend CI
on:
  push:
    paths: ['backend/**']
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: cd backend && npm install
      - run: cd backend && npm run lint
      - run: cd backend && npm test
```

### Frontend (`frontend.yml`)

```yaml
name: Frontend CI
on:
  push:
    paths: ['frontend/**']
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: cd frontend && npm install
      - run: cd frontend && npm run build
```

---

## 21. Non-Functional Requirements

| Requirement | Target |
|---|---|
| PPT editability | 100% native shapes — zero image embeds |
| Rendering determinism | Identical output for same AST input, any LLM |
| API response time | < 8 seconds for generation (LLM latency dominant) |
| PPT export time | < 3 seconds |
| Multi-LLM compatibility | OpenAI, Claude, Azure OpenAI, Ollama |
| Git trackability | All diagrams representable as versioned JSON |

---

## 22. Sprint Delivery Plan

### Sprint 1 — Foundations
**Agent scope:** Backend scaffold, schema, validator, schema repair layer, OpenAI adapter, generate route, server

Deliverables:
- `server.js` with Express and CORS
- `visualAstSchema.js` (v2)
- `validateAst.js` + `schemaRepairLayer.js`
- `renderingContract.js`
- `contentPrompt.js`
- `llm/openai.js` (corrected to `gpt-4o`)
- `routes/generate.js`
- `backend/.env.example`
- `backend/package.json`

---

### Sprint 2 — Rendering Core
**Agent scope:** SVG renderer, PPTX renderer, coordinate mapper, connector router, export route

Deliverables:
- `svgRenderer.js`
- `pptRenderer.js` (corrected API calls)
- `coordinateMapper.js` (scale helpers)
- `connectorRouter.js` (Manhattan routing)
- `routes/export.js`
- `theme/enterpriseTheme.js`

---

### Sprint 3 — Frontend + Multi-LLM
**Agent scope:** React frontend, all LLM adapters, LLM router

Deliverables:
- `frontend/` — full React + Vite app
- `PromptEditor.jsx`, `LlmSelector.jsx`, `SvgPreview.jsx`, `DownloadButton.jsx`, `Toolbar.jsx`
- `llm/claude.js`, `llm/azureOpenAI.js`, `llm/ollama.js`
- `llm/index.js` adapter router

---

### Sprint 4 — Layout Engine + GitHub Actions
**Agent scope:** Grid layout engine, CI workflows, deployment config

Deliverables:
- `layout/layoutEngine.js` (Phase 1 grid)
- `.github/workflows/backend.yml`
- `.github/workflows/frontend.yml`
- `README.md` with setup instructions

---

### Sprint 5 — Enterprise Templates + Phase 2 Layout
**Agent scope:** ELK layout, swimlane support, additional element types, template library

Deliverables:
- `layout/layoutEngine.js` upgraded to ELK
- Swimlane grouping support
- Multi-slide pagination tested
- Template sample JSON files in `samples/`
- BFSI and DevOps template prompts in `prompts/`

---

### Sprint 6 — Ingestion & Architecture-as-Code
**Agent scope:** Mermaid ingestion, draw.io ingestion, YAML diagram definitions

Deliverables:
- `backend/src/ingestion/mermaidParser.js`
- `backend/src/ingestion/drawioParser.js`
- `backend/src/ingestion/yamlParser.js`
- `routes/ingest.js`

---

## 23. Success Metrics

| Metric | Target |
|---|---|
| PPT native shape editability | 100% |
| LLM providers supported at MVP | 3 (OpenAI, Claude, Ollama) |
| Manual redesign time reduction | > 80% vs manual PPT |
| Diagram generation time | < 10 seconds end-to-end |
| Schema validation pass rate | > 95% after repair layer |
| Git-trackable diagram definitions | 100% |

---

## 24. Open Questions for Team Alignment

1. **Auth layer:** Should the backend expose API keys to the frontend, or proxy all LLM calls server-side? Recommendation: server-side proxy (keys never leave backend).
2. **Ollama deployment:** Self-hosted only, or containerised? Needs infrastructure decision before Sprint 1.
3. **PPTX binary transport:** Base64 via JSON body vs. streaming binary response — base64 is simpler for MVP; streaming preferred for large multi-slide decks (> 5 slides).
4. **Phase 2 layout library:** ELK runs in Node.js but adds ~4MB to bundle. Confirm acceptable before Sprint 5.
5. **BFSI theme:** Define colour palette and typography standards before Sprint 5 template work.

---

## 25. Long-Term Strategic Direction

This platform evolves into:

- **Presentation-as-Code** — diagrams defined in versioned JSON, rendered on demand
- **Architecture-as-Code** — C4 model, BPMN, draw.io import/export
- **AI-powered consulting accelerator** — automated proposal and operating model generation
- **Enterprise storytelling engine** — AI-authored executive narratives from architecture data
- **Agentic diagram generation** — multi-agent layout planning and governance recommendation

The core differentiator: **AI-generated, enterprise-grade, fully editable PowerPoint output with deterministic rendering across all LLM providers.**
