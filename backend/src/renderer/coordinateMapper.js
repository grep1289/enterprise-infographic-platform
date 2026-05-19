export function createCoordinateMapper(canvas, page, options = {}) {
  const slideW = options.slideW ?? 13.333;
  const slideH = options.slideH ?? 7.5;
  const sliceH = options.sliceH ?? 750;
  const yOffset = page * sliceH;

  return {
    scaleX: (x) => (x / canvas.width) * slideW,
    scaleY: (y) => ((y - yOffset) / sliceH) * slideH,
    isVisible: (el) => el.y < yOffset + sliceH && el.y + el.height > yOffset
  };
}
