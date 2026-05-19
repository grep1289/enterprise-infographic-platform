export async function generateWithMock(systemPrompt, userPrompt) {
  // Return a deterministic AST for a 2026 DevSecOps workflow.
  return JSON.stringify({
    canvas: {
      width: 1400,
      height: 1200,
      themeId: 'enterprise-default',
      title: '2026 DevSecOps Workflow'
    },
    elements: [
      {
        id: 'section-vision',
        type: 'section-header',
        title: 'DevSecOps Workflow 2026',
        subtitle: 'Secure delivery with cloud-native automation and continuous compliance',
        semanticColor: 'background',
        x: 40,
        y: 40,
        width: 1320,
        height: 80,
        edges: []
      },
      {
        id: 'plan',
        type: 'pipeline-stage',
        title: 'Secure Planning',
        subtitle: 'Threat modeling, policy-as-code, architecture review',
        semanticColor: 'pipeline',
        layoutGroup: 'left-lane',
        edges: [{ targetId: 'build', type: 'flow', style: 'solid' }]
      },
      {
        id: 'build',
        type: 'agent-card',
        title: 'Secure Build',
        subtitle: 'SCA, SBOM, and binary signing in CI/CD',
        semanticColor: 'agent',
        layoutGroup: 'left-lane',
        edges: [{ targetId: 'deploy', type: 'flow', style: 'solid' }]
      },
      {
        id: 'deploy',
        type: 'pipeline-stage',
        title: 'Secure Deployment',
        subtitle: 'Infrastructure as code, runtime hardening, zero trust',
        semanticColor: 'pipeline',
        layoutGroup: 'center-lane',
        edges: [{ targetId: 'monitor', type: 'flow', style: 'solid' }]
      },
      {
        id: 'monitor',
        type: 'metric-card',
        title: 'Continuous Monitoring',
        subtitle: 'Risk dashboards, anomaly detection, drift control',
        semanticColor: 'metric',
        layoutGroup: 'center-lane',
        edges: [{ targetId: 'feedback', type: 'flow', style: 'solid' }]
      },
      {
        id: 'feedback',
        type: 'feedback-loop',
        title: 'Adaptive Feedback',
        subtitle: 'AI-assisted remediation, compliance orchestration',
        semanticColor: 'auto',
        layoutGroup: 'right-lane',
        edges: [{ targetId: 'plan', type: 'feedback-loop', style: 'dashed' }]
      },
      {
        id: 'human-review',
        type: 'human-gate',
        title: 'Governance Review',
        subtitle: 'Stakeholder approval and risk acceptance',
        semanticColor: 'human',
        layoutGroup: 'right-lane',
        edges: [{ targetId: 'deploy', type: 'flow', style: 'dotted' }]
      }
    ]
  });
}
