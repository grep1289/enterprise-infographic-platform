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
