import { getThemeTokens } from '../theme/enterpriseTheme.js';
import { routeConnector } from './connectorRouter.js';

export function renderSvg(ast) {
  const { canvas, elements } = ast;
  const theme = canvas.themeId;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">`;
  svg += `<rect width="${canvas.width}" height="${canvas.height}" fill="#F8FAFC"/>`;

  const elementMap = Object.fromEntries(elements.map(el => [el.id, el]));

  elements.forEach(el => {
    if (el.type === 'connector') return;

    const tokens = getThemeTokens(theme, el.semanticColor);
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    const titleY = el.subtitle ? cy - 10 : cy;

    svg += `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="12" fill="#${tokens.fill}" stroke="#${tokens.stroke}" stroke-width="1.5"/>`;

    if (el.title) {
      svg += `<text x="${cx}" y="${titleY}" text-anchor="middle" dominant-baseline="central" font-family="Arial" font-size="14" font-weight="bold" fill="#${tokens.text}">${escapeXml(el.title)}</text>`;
    }

    if (el.subtitle) {
      svg += `<text x="${cx}" y="${cy + 14}" text-anchor="middle" dominant-baseline="central" font-family="Arial" font-size="11" fill="#${tokens.text}" opacity="0.85">${escapeXml(el.subtitle)}</text>`;
    }

    (el.edges || []).forEach(edge => {
      const target = elementMap[edge.targetId];
      if (!target) return;
      const points = routeConnector(el, target, elements);
      const pointStr = points.map(p => `${p[0]},${p[1]}`).join(' ');
      const dashArray = edge.style === 'dashed' ? '6,4' : edge.style === 'dotted' ? '2,3' : 'none';
      svg += `<polyline points="${pointStr}" fill="none" stroke="#64748B" stroke-width="1.5" stroke-dasharray="${dashArray}" marker-end="url(#arrow)"/>`;
    });
  });

  svg += `<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#64748B"/></marker></defs>`;
  svg += '</svg>';

  return svg;
}

function escapeXml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
