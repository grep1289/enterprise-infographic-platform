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
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  parentId: z.string().optional(),
  layoutGroup: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  semanticColor: z.enum([
    'pipeline', 'copilot', 'agent', 'human',
    'auto', 'background', 'border', 'metric'
  ]).default('pipeline'),
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
