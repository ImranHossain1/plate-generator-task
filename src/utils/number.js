export const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export const parseLocaleNumber = (val) => {
  if (typeof val === "number") return val;
  if (!val) return NaN;
  const norm = String(val).trim().replace(/,/g, ".");
  return Number(norm);
};
