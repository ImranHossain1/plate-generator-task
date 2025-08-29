// Sizing / layout math
import { MAX_STAGE_WIDTH, PAD, Plate } from "../types";

export function computeSizes(plates: Plate[]) {
  const totalWidth = plates.reduce((s, p) => s + (Number(p.w) || 0), 0);
  const maxHeight = Math.max(1, ...plates.map((p) => Number(p.h) || 0));
  const pxW = Math.max(1, Math.round(totalWidth));
  const pxH = Math.max(1, Math.round(maxHeight));
  const stageWidth = Math.min(pxW + PAD * 2, MAX_STAGE_WIDTH);
  const stageHeight = pxH + PAD * 2;
  return { totalWidth, maxHeight, pxW, pxH, stageWidth, stageHeight };
}
