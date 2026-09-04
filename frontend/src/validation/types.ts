export type ValidationErrors = Record<string, string>;

export interface ValidationResult {
  valid: boolean;
  errors: ValidationErrors;
}

export function makeResult(errors: ValidationErrors): ValidationResult {
  return { valid: Object.keys(errors).length === 0, errors };
}
