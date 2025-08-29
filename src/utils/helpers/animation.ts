// Animation helpers (diffs, ghosts)
import { CoverRect, GAP, Plate, RemovedGhost, ResizeChange } from "../types";

/** Detect plates that grew/shrank to trigger subtle scale tweens.
 *  Only compares w/h and ignores tiny float noise via epsilon.
 */
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
