import {
  CoverRect,
  CropRect,
  GAP,
  MAX_STAGE_WIDTH,
  PAD,
  Plate,
  RemovedGhost,
  ResizeChange,
} from "./types";

export const arrayMove = <T>(arr: T[], from: number, to: number) => {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
};
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

/** When layout is wider than threshold, mirror the image horizontally into a stripe (img|mirror(img)). */
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

/** Content and stage sizing from plates. */
export function computeSizes(plates: Plate[]) {
  const totalWidth = plates.reduce((s, p) => s + (Number(p.w) || 0), 0);
  const maxHeight = Math.max(1, ...plates.map((p) => Number(p.h) || 0));
  const pxW = Math.max(1, Math.round(totalWidth));
  const pxH = Math.max(1, Math.round(maxHeight));
  const stageWidth = Math.min(pxW + PAD * 2, MAX_STAGE_WIDTH);
  const stageHeight = pxH + PAD * 2;
  return { totalWidth, maxHeight, pxW, pxH, stageWidth, stageHeight };
}

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
    x: globalSrc.x + globalSrc.w * (cursorX / pxW),
    y: globalSrc.y + globalSrc.h * ((pxH - plateH) / pxH),
    width: globalSrc.w * (drawW / pxW),
    height: globalSrc.h * (drawH / pxH),
  };
}

/** Detect plates that grew/shrank to trigger subtle scale tweens. */
export function getResizeChanges(
  prev: Plate[],
  next: Plate[],
  eps = 1e-6
): ResizeChange[] {
  const byId = new Map(prev.map((p) => [p.id, p]));
  const changes: ResizeChange[] = [];
  for (const n of next) {
    const p = byId.get(n.id);
    if (!p) continue; // creations handled by 'recentlyAdded'
    const dw = Number(n.w) - Number(p.w);
    const dh = Number(n.h) - Number(p.h);
    if (Math.abs(dw) > eps || Math.abs(dh) > eps) {
      changes.push({ id: n.id, type: dw + dh >= 0 ? "grow" : "shrink" });
    }
  }
  return changes;
}

/** Compute the “ghost” rect + crop for a recently removed plate for fade-out animation. */
export function computeRemovedGhost(
  prevPlates: Plate[],
  removedId: string,
  snapW: number,
  snapH: number,
  snapCrop: CoverRect | null,
  sourceImg: CanvasImageSource | null
): RemovedGhost {
  let cursor = 0;
  for (const p of prevPlates) {
    const w = Number(p.w) || 0;
    const h = Number(p.h) || 0;
    if (p.id === removedId) {
      const x = cursor;
      const y = snapH - h;
      const drawW = Math.max(0, w - GAP);
      const drawH = h;

      if (snapCrop && sourceImg) {
        const fx = cursor / snapW;
        const fy = (snapH - h) / snapH;
        const fw = drawW / snapW;
        const fh = drawH / snapH;

        const sx = snapCrop.x + snapCrop.w * fx;
        const sy = snapCrop.y + snapCrop.h * fy;
        const sw = snapCrop.w * fw;
        const sh = snapCrop.h * fh;

        return {
          id: p.id,
          x,
          y,
          w: drawW,
          h: drawH,
          crop: { x: sx, y: sy, width: sw, height: sh },
        };
      }
      return { id: p.id, x, y, w: drawW, h: drawH, crop: null };
    }
    cursor += w;
  }
  return null;
}
