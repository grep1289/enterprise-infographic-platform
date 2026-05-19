const typeDefaults = {
  'pipeline-stage': { width: 160, height: 75 },
  'copilot-card': { width: 150, height: 85 },
  'agent-card': { width: 150, height: 85 },
  'section-header': { width: 1320, height: 50 },
  'metric-card': { width: 140, height: 80 },
  'human-gate': { width: 130, height: 100 },
  label: { width: 150, height: 35 },
  'feedback-loop': { width: 160, height: 85 },
  connector: { width: 0, height: 0 }
};

export function applyLayout(ast) {
  const canvas = {
    width: ast.canvas?.width ?? 1400,
    height: ast.canvas?.height ?? 1800,
    themeId: ast.canvas?.themeId ?? 'enterprise-default',
    title: ast.canvas?.title
  };

  const groups = [];
  const groupMap = new Map();

  ast.elements.forEach((el) => {
    const groupKey = el.layoutGroup || 'default';
    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, []);
      groups.push(groupKey);
    }
    groupMap.get(groupKey).push(el);
  });

  // Aggressive layout tuning: enforce tight grid to prevent overlaps
  const columnSpacing = 30;
  const rowSpacing = 25;
  const leftMargin = 35;
  const topMargin = 35;
  const itemPadding = 15; // horizontal padding within each column

  const sortedGroups = groups.map((key) => groupMap.get(key));
  let maxBottom = 0;
  // compute adaptive column width so groups are evenly spaced
  const availableWidth = canvas.width - leftMargin * 2 - Math.max(0, (sortedGroups.length - 1) * columnSpacing);
  const columnWidth = Math.max(180, Math.floor(availableWidth / Math.max(1, sortedGroups.length)));
  const maxItemWidth = columnWidth - itemPadding * 2;

  sortedGroups.forEach((group, groupIndex) => {
    const xCursor = leftMargin + groupIndex * (columnWidth + columnSpacing);
    let yCursor = topMargin;

    const headers = group.filter((el) => el.type === 'section-header');
    const items = group.filter((el) => el.type !== 'section-header' && el.type !== 'connector');
    const itemIds = new Set(items.map((el) => el.id));
    const childrenByParent = new Map();

    items.forEach((item) => {
      if (item.parentId && itemIds.has(item.parentId)) {
        if (!childrenByParent.has(item.parentId)) {
          childrenByParent.set(item.parentId, []);
        }
        childrenByParent.get(item.parentId).push(item);
      }
    });

    headers.forEach((header) => {
      const defaults = typeDefaults[header.type];
      header.x = leftMargin;
      header.y = yCursor;
      header.width = canvas.width - leftMargin * 2;
      header.height = defaults.height;
      yCursor += header.height + rowSpacing;
      maxBottom = Math.max(maxBottom, header.y + header.height);
    });

    const roots = items.filter((item) => !item.parentId || !itemIds.has(item.parentId));

    function placeItem(item, x, y, depth = 0) {
      const defaults = typeDefaults[item.type] || { width: 160, height: 80 };
      
      // Enforce strict sizing constraints: no overflow, normalized sizes
      let itemWidth = defaults.width;
      let itemHeight = defaults.height;
      
      // Never exceed column bounds
      itemWidth = Math.min(itemWidth, maxItemWidth);
      
      // Set deterministic position (override any model-provided values)
      item.x = x + Math.floor((columnWidth - itemWidth) / 2);
      item.y = y;
      item.width = itemWidth;
      item.height = itemHeight;

      maxBottom = Math.max(maxBottom, item.y + item.height);
      let nextY = item.y + item.height + rowSpacing;
      const children = childrenByParent.get(item.id) || [];

      // Place children in vertical stack (no horizontal offset to prevent overlap)
      children.forEach((child) => {
        nextY = placeItem(child, x, nextY, depth + 1);
      });

      return nextY;
    }

    roots.forEach((root) => {
      yCursor = placeItem(root, xCursor, yCursor);
    });
  });

  canvas.height = Math.max(canvas.height, maxBottom + topMargin, 750);
  canvas.height = Math.min(canvas.height, 3600);
  canvas.width = Math.min(canvas.width, 1400);

  return {
    canvas,
    elements: ast.elements
  };
}
