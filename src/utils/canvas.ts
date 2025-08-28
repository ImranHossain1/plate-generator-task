/**
 * Draws a rounded rectangle path onto the canvas context.
 */
export function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

/**
 * Fills a rectangle with a hatch (diagonal stripe) pattern.
 */
export function hatch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  ctx.fillStyle = "#e2e8f0"; // background fill
  ctx.fillRect(x, y, w, h);

  ctx.strokeStyle = "#cbd5e1"; // hatch lines
  for (let i = -h; i < w + h; i += 8) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i - h, y + h);
    ctx.stroke();
  }
}
