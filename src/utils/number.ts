/** Clamp a number between min and max */
export const clamp = (v: number, min: number, max: number): number =>
  Math.min(Math.max(v, min), max);

/**
 * Parse a localized string into a number.
 * Accepts numbers directly, otherwise replaces commas with dots.
 * Returns NaN if input is invalid or empty.
 */
export const parseLocaleNumber = (val: unknown): number => {
  if (typeof val === "number") return val;
  if (val == null) return NaN;

  const norm = String(val).trim().replace(/,/g, ".");
  return Number(norm);
};
