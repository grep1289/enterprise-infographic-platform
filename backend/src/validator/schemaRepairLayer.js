const edgeTypeMap = {
  bidirectional: 'flow',
  directed: 'flow',
  direct: 'flow',
  directional: 'flow',
  linear: 'flow',
  arrow: 'flow',
  connector: 'flow',
  connection: 'flow',
  line: 'flow',
  'one-way': 'flow',
  'two-way': 'flow',
  'feedback loop': 'feedback-loop',
  'feedback-loop': 'feedback-loop',
  bypass: 'bypass-path',
  'bypass path': 'bypass-path'
};

const styleMap = {
  solid: 'solid',
  dashed: 'dashed',
  dotted: 'dotted'
};

const semanticColorMap = {
  pipeline: 'pipeline',
  copilot: 'copilot',
  agent: 'agent',
  human: 'human',
  auto: 'auto',
  background: 'background',
  border: 'border',
  metric: 'metric',
  feedback: 'human',
  'feedback-loop': 'human'
};

function normalizeValue(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

function normalizeEdgeType(type) {
  const normalized = normalizeValue(type);
  if (edgeTypeMap[normalized]) return edgeTypeMap[normalized];
  if (/feedback/.test(normalized)) return 'feedback-loop';
  if (/arrow|connect|line|path|flow|relationship/.test(normalized)) return 'flow';
  return normalized;
}

function normalizeStyle(style) {
  const normalized = normalizeValue(style);
  return styleMap[normalized] || normalized;
}

function normalizeSemanticColor(color) {
  const normalized = normalizeValue(color);
  return semanticColorMap[normalized] || 'pipeline';
}

export function sanitizeAndRepairJson(rawLlmString) {
  try {
    let clean = rawLlmString.trim();

    clean = clean.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/m, '');
    clean = clean.replace(/\/\/.*$/gm, '');
    clean = clean.replace(/\/\*[\s\S]*?\*\//g, '');
    clean = clean.replace(/,(\s*[\]}])/g, '$1');

    const parsed = JSON.parse(clean);

    if (Array.isArray(parsed.elements)) {
      parsed.elements = parsed.elements.map((el, i) => {
        const edges = Array.isArray(el.edges)
          ? el.edges.map((edge) => ({
              ...edge,
              type: normalizeEdgeType(edge.type),
              style: normalizeStyle(edge.style)
            }))
          : el.edges;

        return {
          ...el,
          id: el.id || `${el.type || 'element'}-${i}`,
          semanticColor: normalizeSemanticColor(el.semanticColor),
          edges
        };
      });
    }

    return { success: true, data: parsed };
  } catch (err) {
    return { success: false, error: `JSON parse failed: ${err.message}` };
  }
}
