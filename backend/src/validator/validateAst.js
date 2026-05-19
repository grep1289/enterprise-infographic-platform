import { visualAstSchema } from '../schema/visualAstSchema.js';

export function validateAst(ast) {
  return visualAstSchema.parse(ast);
}
