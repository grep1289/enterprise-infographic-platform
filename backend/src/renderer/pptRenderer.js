import PptxGenJS from 'pptxgenjs';
import { getThemeTokens } from '../theme/enterpriseTheme.js';
import { routeConnector } from './connectorRouter.js';

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;
const CANVAS_SLICE_H = 750;

export async function renderPpt(ast) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';

  const { canvas, elements } = ast;
  const elementMap = Object.fromEntries(elements.map(el => [el.id, el]));
  const totalSlides = Math.ceil(canvas.height / CANVAS_SLICE_H);

  for (let page = 0; page < totalSlides; page++) {
    const slide = pptx.addSlide();
    const yOffset = page * CANVAS_SLICE_H;

    const scaleX = (x) => (x / canvas.width) * SLIDE_W;
    const scaleY = (y) => ((y - yOffset) / CANVAS_SLICE_H) * SLIDE_H;

    const visible = elements.filter(el => el.y < yOffset + CANVAS_SLICE_H && el.y + el.height > yOffset);

    visible.forEach(el => {
      if (el.type === 'connector') return;

      const tokens = getThemeTokens(canvas.themeId, el.semanticColor);

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: scaleX(el.x),
        y: scaleY(el.y),
        w: scaleX(el.width),
        h: scaleY(el.height),
        fill: { color: tokens.fill },
        line: { color: tokens.stroke, width: 1.5 },
        rectRadius: 0.08
      });

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
