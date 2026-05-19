export function buildContentPrompt(prompt) {
  return `Create a deterministic enterprise infographic AST based on the following business prompt:\n\n${prompt}\n\nReturn valid JSON only, matching the expected schema, using semantic element types and semanticColor tokens.`;
}
