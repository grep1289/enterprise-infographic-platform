function intersectsHorizontalSegment(x1, x2, y, box) {
  const [left, right] = x1 < x2 ? [x1, x2] : [x2, x1];
  const intersectsX = right >= box.x && left <= box.x + box.width;
  const intersectsY = y >= box.y && y <= box.y + box.height;
  return intersectsX && intersectsY;
}

export function routeConnector(source, target, elements) {
  // Orthogonal (Manhattan distance) routing to minimize overlaps
  const exitPoint = [source.x + source.width / 2, source.y + source.height];
  const entryPoint = [target.x + target.width / 2, target.y];
  
  // Vertical gap between source and target
  const verticalGap = Math.max(50, entryPoint[1] - exitPoint[1]);
  const midY = exitPoint[1] + verticalGap / 2;
  
  // Check for blocking elements at the planned midline
  const baseMidX = exitPoint[0];
  let midX = baseMidX;
  let mid2X = entryPoint[0];
  
  // If blocked, shift the connector route horizontally to avoid intersection
  const horizontalSegment = { x1: Math.min(midX, mid2X), x2: Math.max(midX, mid2X), y: midY };
  const blocking = elements.some(el => {
    if (el.id === source.id || el.id === target.id) return false;
    return intersectsHorizontalSegment(horizontalSegment.x1, horizontalSegment.x2, horizontalSegment.y, el);
  });

  if (blocking) {
    // Shift route to the right or left depending on which direction is clearer
    const shiftRight = target.x >= source.x ? 45 : -45;
    midX = baseMidX + shiftRight;
    mid2X = entryPoint[0] + shiftRight;
  }

  return [
    exitPoint,
    [midX, exitPoint[1] + 15],      // vertical segment from source
    [midX, midY],                    // horizontal segment top
    [mid2X, midY],                   // horizontal segment main
    [mid2X, entryPoint[1] - 15],     // vertical segment to target
    entryPoint
  ];
}
