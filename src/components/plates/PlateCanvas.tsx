import { useEffect, useMemo, useRef, useState } from "react";
import { Plate, RenderMode } from "../../constants/plates";
import { Card, CardContent } from "../ui/Card";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import AppCard from "../common/AppCard";

const PAD = 24;
const ANIM_MS = 500;
const EPS = 0.01;

type ResizeChange = { id: string; type: "grow" | "shrink" };
function drawImageClamped(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const imgW = img.width;
  const imgH = img.height;

  const sxa = Math.max(0, Math.min(imgW, sx));
  const sya = Math.max(0, Math.min(imgH, sy));
  const sxb = Math.max(0, Math.min(imgW, sx + sw));
  const syb = Math.max(0, Math.min(imgH, sy + sh));

  const clampedSW = Math.max(0, sxb - sxa);
  const clampedSH = Math.max(0, syb - sya);
  if (clampedSW < EPS || clampedSH < EPS) return;

  const cropLeft = sw > 0 ? (sxa - sx) / sw : 0;
  const cropTop = sh > 0 ? (sya - sy) / sh : 0;
  const cropRight = sw > 0 ? (sx + sw - sxb) / sw : 0;
  const cropBottom = sh > 0 ? (sy + sh - syb) / sh : 0;

  const adjDx = dx + dw * cropLeft;
  const adjDy = dy + dh * cropTop;
  const adjDw = dw * (1 - cropLeft - cropRight);
  const adjDh = dh * (1 - cropTop - cropBottom);

  if (adjDw < EPS || adjDh < EPS) return;

  ctx.drawImage(
    img,
    sxa,
    sya,
    clampedSW,
    clampedSH,
    adjDx,
    adjDy,
    adjDw,
    adjDh
  );
}

function hatch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();
  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < h; i += 5) {
    ctx.moveTo(x, y + i);
    ctx.lineTo(x + w, y + i);
  }
  for (let i = 0; i < w; i += 5) {
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i, y + h);
  }
  ctx.stroke();
  ctx.restore();
}

function getCoverSrcRect(
  imgW: number,
  imgH: number,
  destW: number,
  destH: number,
  mode: RenderMode
) {
  const srcRatio = imgW / imgH;
  const destRatio = destW / destH;

  if (mode === "contain") {
    if (destRatio > srcRatio) {
      const w = imgH * destRatio;
      const x = (imgW - w) / 2;
      return { x, y: 0, w, h: imgH };
    } else {
      const h = imgW / destRatio;
      const y = (imgH - h) / 2;
      return { x: 0, y, w: imgW, h };
    }
  }

  // cover
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

type PlateCanvasProps = {
  plates: Plate[];
  img: HTMLImageElement | null;
  renderMode: RenderMode;
  onCanvasRef?: (el: HTMLCanvasElement | null) => void;
  recentlyAdded?: string | null;
  recentlyRemoved?: string | null;
};

export default function PlateCanvas({
  plates,
  img,
  renderMode,
  onCanvasRef,
  recentlyAdded = null,
  recentlyRemoved = null,
}: PlateCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [resizedPlates, setResizedPlates] = useState<ResizeChange[]>([]);
  const prevPlatesRef = useRef<Plate[]>([]);

  const totalWidth = useMemo(
    () => plates.reduce((s, p) => s + (Number(p.w) || 0), 0),
    [plates]
  );
  const maxHeight = useMemo(
    () => Math.max(1, ...plates.map((p) => Number(p.h) || 0)),
    [plates]
  );

  // expose canvas to parent
  useEffect(() => {
    onCanvasRef?.(canvasRef.current);
  }, [onCanvasRef]);

  // detect width/height changes for resize animation
  useEffect(() => {
    const prev = prevPlatesRef.current;
    const changes: ResizeChange[] = [];

    for (const p of plates) {
      const prevP = prev.find((x) => x.id === p.id);
      if (prevP && (prevP.w !== p.w || prevP.h !== p.h)) {
        const bigger = p.w > prevP.w || p.h > prevP.h;
        changes.push({ id: p.id, type: bigger ? "grow" : "shrink" });
      }
    }

    if (changes.length) {
      setResizedPlates(changes);
      const t = setTimeout(() => setResizedPlates([]), 600);
      return () => clearTimeout(t);
    }
    prevPlatesRef.current = plates.map((p) => ({ ...p }));
  }, [plates]);

  // Build a mirrored source when total width > 300 cm
  const { sourceImg, sW, sH } = useMemo(() => {
    const ready = !!img && img.width > 0 && img.height > 0;
    const needsMirror = totalWidth > 300 && ready;

    if (!needsMirror || !img) {
      return {
        sourceImg: img as HTMLImageElement | HTMLCanvasElement | null,
        sW: img?.width ?? 0,
        sH: img?.height ?? 0,
      };
    }

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
      sourceImg: stripe as HTMLCanvasElement,
      sW: stripe.width,
      sH: stripe.height,
    };
  }, [img, totalWidth]);

  // Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Pixel size: 1 cm -> 1 px, pad around
    const pxW = Math.max(1, Math.round(totalWidth));
    const pxH = Math.max(1, Math.round(maxHeight));

    canvas.width = pxW + PAD * 2;
    canvas.height = pxH + PAD * 2;

    let start: number | null = null;
    let raf = 0;

    const hasSource = !!sourceImg && sW > 0 && sH > 0;
    const globalSrc =
      hasSource && renderMode !== "tile"
        ? getCoverSrcRect(sW, sH, pxW, pxH, renderMode)
        : null;

    const draw = (ts: number) => {
      if (start == null) start = ts;
      const progress = Math.min(1, (ts - start) / ANIM_MS);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let cursorX = 0;

      for (const p of plates) {
        const gap = 4;
        const w = Number(p.w) || 0;
        const h = Number(p.h) || 0;
        const x = PAD + cursorX;
        const y = PAD + (pxH - h);

        let alpha = 1;
        let drawW = w - gap;
        let drawH = h;

        // animations
        if (p.id === recentlyAdded) {
          alpha = progress;
          drawW *= progress;
          drawH *= progress;
        } else if (p.id === recentlyRemoved) {
          alpha = 1 - progress;
          drawW *= 1 - 0.2 * progress;
          drawH *= 1 - 0.2 * progress;
        } else {
          const resize = resizedPlates.find((r) => r.id === p.id);
          if (resize) {
            if (resize.type === "grow") {
              drawW *= 0.8 + 0.2 * progress;
              drawH *= 0.8 + 0.2 * progress;
            } else {
              drawW *= 1.2 - 0.2 * progress;
              drawH *= 1.2 - 0.2 * progress;
            }
          }
        }

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.rect(x, y + (h - drawH), drawW, drawH); // bottom-aligned
        ctx.clip();

        if (hasSource) {
          if (renderMode === "tile") {
            const pat = ctx.createPattern(sourceImg!, "repeat");
            if (pat) {
              ctx.fillStyle = pat;
              ctx.fillRect(x, y + (h - drawH), drawW, drawH);
            } else {
              hatch(ctx, x, y + (h - drawH), drawW, drawH);
            }
          } else if (globalSrc) {
            // Map this plate’s slice within the full composition
            const fx = cursorX / pxW; // left fraction
            const fy = (pxH - h) / pxH; // top fraction (bottom-aligned)
            const fw = drawW / pxW;
            const fh = drawH / pxH;

            const sx = globalSrc.x + globalSrc.w * fx;
            const sy = globalSrc.y + globalSrc.h * fy;
            const sw = globalSrc.w * fw;
            const sh = globalSrc.h * fh;

            drawImageClamped(
              ctx,
              sourceImg!,
              sx,
              sy,
              sw,
              sh,
              x,
              y + (h - drawH),
              drawW,
              drawH
            );
          }
        } else {
          hatch(ctx, x, y + (h - drawH), drawW, drawH);
        }

        ctx.restore();
        cursorX += w;
      }

      if (progress < 1) {
        raf = requestAnimationFrame(draw);
      }
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [
    plates,
    sourceImg,
    sW,
    sH,
    totalWidth,
    maxHeight,
    renderMode,
    recentlyAdded,
    recentlyRemoved,
    resizedPlates,
  ]);

  return (
    <AppCard className="overflow-hidden" contentClassName="p-0">
      <ScrollArea>
        <div className="min-w-full">
          <canvas ref={canvasRef} />
        </div>
      </ScrollArea>
    </AppCard>
  );
}
