export const clamp = (v: number, min: number, max: number): number =>
  Math.min(Math.max(v, min), max);

export const parseLocaleNumber = (val: unknown): number => {
  if (typeof val === "number") return val;
  if (val === null || val === undefined) return NaN;

  const norm = String(val).trim().replace(/,/g, ".");
  return Number(norm);
};
