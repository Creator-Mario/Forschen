export const INTRO_MIN_LENGTH = 100;
export const INTRO_MAX_LENGTH = 500;

export function getIntroLengthError(fieldLabel: string, value: string): string | null {
  const length = value.trim().length;

  if (length < INTRO_MIN_LENGTH) {
    return `Das ${fieldLabel} muss mindestens ${INTRO_MIN_LENGTH} Zeichen enthalten.`;
  }

  if (length > INTRO_MAX_LENGTH) {
    return `Das ${fieldLabel} darf höchstens ${INTRO_MAX_LENGTH} Zeichen enthalten.`;
  }

  return null;
}
