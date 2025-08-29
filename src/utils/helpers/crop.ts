// Cropping helpers
import { CoverRect, CropRect } from "../types";

/** Build the crop rect for a single plate within the global cover crop. */
export function buildPlateCrop(
  globalSrc: CoverRect,
  pxW: number,
  pxH: number,
  cursorX: number,
  plateH: number,
  drawW: number,
  drawH: number
): CropRect {
  return {
    x: globalSrc.x + (globalSrc.w * cursorX) / pxW,
    y: globalSrc.y + (globalSrc.h * (pxH - plateH)) / pxH,
    width: (globalSrc.w * drawW) / pxW,
    height: (globalSrc.h * drawH) / pxH,
  };
}
