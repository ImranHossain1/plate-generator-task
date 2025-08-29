import { CoverRect } from "../types";

/** Compute a cover-crop rectangle for drawing an image into a destination box. */
export function getCoverSrcRect(
  imgW: number,
  imgH: number,
  destW: number,
  destH: number
): CoverRect {
  const srcRatio = imgW / imgH;
  const destRatio = destW / destH;
  if (destRatio > srcRatio) {
    const h = imgW / destRatio;
    const y = (imgH - h) / 2;
    return { x: 0, y, w: imgW, h };
  } else {
    const w = imgH * destRatio;
    const x = (imgW - w) / 2;
    return { x, y: 0, w, h: imgH };
  }
}

/** When layout is wide, mirror the image horizontally into a stripe (img|mirror(img)). */
export function makeMirroredStripe(img: HTMLImageElement): {
  sourceImg: CanvasImageSource;
  sW: number;
  sH: number;
} {
  const stripe = document.createElement("canvas");
  stripe.width = img.width * 2;
  stripe.height = img.height;
  const sctx = stripe.getContext("2d")!;
  sctx.drawImage(img, 0, 0);
  sctx.save();
  sctx.translate(stripe.width, 0);
  sctx.scale(-1, 1);
  sctx.drawImage(img, 0, 0);
  sctx.restore();
  return {
    sourceImg: stripe as CanvasImageSource,
    sW: stripe.width,
    sH: stripe.height,
  };
}
