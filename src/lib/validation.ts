export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  isEmail?: boolean;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function checkValidity(value: string, rules?: ValidationRules): boolean {
  if (!rules) return true;

  const trimmed = value.trim();

  if (rules.required && trimmed === '') return false;
  if (rules.minLength !== undefined && value.length < rules.minLength) return false;
  if (rules.maxLength !== undefined && value.length > rules.maxLength) return false;
  if (rules.isEmail && !EMAIL_PATTERN.test(trimmed)) return false;

  return true;
}
