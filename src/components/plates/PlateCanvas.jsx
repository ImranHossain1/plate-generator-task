import { useEffect, useMemo, useRef, useState } from "react";
import { hatch } from "../../utils/canvas.js";

function drawImageClamped(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
  const EPS = 0.01;
  const sxa = Math.max(0, Math.min(img.width, sx));
  const sya = Math.max(0, Math.min(img.height, sy));
  const sxb = Math.max(0, Math.min(img.width, sx + sw));
  const syb = Math.max(0, Math.min(img.height, sy + sh));

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

export default function PlateCanvas({
  plates,
  img,
  renderMode,
  onCanvasRef,
  recentlyAdded,
  recentlyRemoved,
}) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  // Track resized plates and direction
  const [resizedPlates, setResizedPlates] = useState([]);
  const prevPlatesRef = useRef([]);

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
    if (typeof onCanvasRef === "function") onCanvasRef(canvasRef.current);
  }, [onCanvasRef]);

  // detect width/height changes
  useEffect(() => {
    const prev = prevPlatesRef.current;
    const changes = [];

    plates.forEach((p) => {
      const prevP = prev.find((x) => x.id === p.id);
      if (prevP && (prevP.w !== p.w || prevP.h !== p.h)) {
        const bigger = p.w > prevP.w || p.h > prevP.h;
        changes.push({ id: p.id, type: bigger ? "grow" : "shrink" });
      }
    });

    if (changes.length > 0) {
      setResizedPlates(changes);
      setTimeout(() => setResizedPlates([]), 600);
    }

    prevPlatesRef.current = plates.map((p) => ({ ...p }));
  }, [plates]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");

    const cmW = Math.max(1, totalWidth);
    const cmH = Math.max(1, maxHeight);
    const pad = 24;
    const availW = Math.max(10, wrap.clientWidth - pad * 2);
    const availH = Math.max(10, wrap.clientHeight - pad * 2);
    const scale = Math.max(0.1, Math.min(availW / cmW, availH / cmH));
    const pxW = Math.max(1, Math.round(cmW * scale));
    const pxH = Math.max(1, Math.round(cmH * scale));

    canvas.width = pxW + pad * 2;
    canvas.height = pxH + pad * 2;

    let start = null;
    const duration = 500;
    let animationFrame;

    function drawFrame(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min(1, (timestamp - start) / duration);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      function getCoverSrcRect(imgW, imgH, destW, destH, mode) {
        const srcRatio = imgW / imgH;
        const destRatio = destW / destH;
        if (mode === "contain") {
          if (destRatio > srcRatio) {
            const newW = imgH * destRatio;
            const xOff = (imgW - newW) / 2;
            return { x: xOff, y: 0, w: newW, h: imgH };
          } else {
            const newH = imgW / destRatio;
            const yOff = (imgH - newH) / 2;
            return { x: 0, y: yOff, w: imgW, h: newH };
          }
        }
        // cover
        if (destRatio > srcRatio) {
          const newH = imgW / destRatio;
          const yOff = (imgH - newH) / 2;
          return { x: 0, y: yOff, w: imgW, h: newH };
        } else {
          const newW = imgH * destRatio;
          const xOff = (imgW - newW) / 2;
          return { x: xOff, y: 0, w: newW, h: imgH };
        }
      }

      let globalSrc = null;
      if (img && img.width > 0 && img.height > 0 && renderMode !== "tile") {
        globalSrc = getCoverSrcRect(
          img.width,
          img.height,
          pxW,
          pxH,
          renderMode
        );
      }

      let cursorX = 0;
      plates.forEach((p) => {
        const gap = 4;
        const w = (Number(p.w) || 0) * scale;
        const h = (Number(p.h) || 0) * scale;
        const x = pad + cursorX;
        const y = pad + (pxH - h);

        let alpha = 1;
        let drawW = w - gap;
        let drawH = h;

        // ADD animation
        if (p.id === recentlyAdded) {
          alpha = progress;
          drawW *= progress;
          drawH *= progress;
        }
        // REMOVE animation
        else if (p.id === recentlyRemoved) {
          alpha = 1 - progress;
          drawW *= 1 - 0.2 * progress;
          drawH *= 1 - 0.2 * progress;
        }
        // RESIZE animation
        else {
          const resize = resizedPlates.find((r) => r.id === p.id);
          if (resize) {
            if (resize.type === "grow") {
              drawW *= 0.8 + 0.2 * progress; // expand into place
              drawH *= 0.8 + 0.2 * progress;
            } else {
              drawW *= 1.2 - 0.2 * progress; // shrink into place
              drawH *= 1.2 - 0.2 * progress;
            }
          }
        }

        ctx.save();
        ctx.globalAlpha = alpha;

        ctx.beginPath();
        ctx.rect(x, y + (h - drawH), drawW, drawH); // bottom-aligned
        ctx.clip();

        if (img && img.width > 0 && img.height > 0) {
          if (renderMode === "tile") {
            const pat = ctx.createPattern(img, "repeat");
            if (pat) {
              ctx.fillStyle = pat;
              ctx.fillRect(x, y + (h - drawH), drawW, drawH);
            } else {
              hatch(ctx, x, y + (h - drawH), drawW, drawH);
            }
          } else if (globalSrc) {
            const fx = cursorX / pxW;
            const fy = (pxH - h) / pxH;
            const fw = drawW / pxW;
            const fh = drawH / pxH;

            const sx = globalSrc.x + globalSrc.w * fx;
            const sy = globalSrc.y + globalSrc.h * fy;
            const sw = globalSrc.w * fw;
            const sh = globalSrc.h * fh;

            drawImageClamped(
              ctx,
              img,
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
      });

      if (progress < 1) {
        animationFrame = requestAnimationFrame(drawFrame);
      }
    }

    animationFrame = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(animationFrame);
  }, [
    plates,
    img,
    totalWidth,
    maxHeight,
    renderMode,
    recentlyAdded,
    recentlyRemoved,
    resizedPlates,
  ]);

  return (
    <div
      ref={wrapRef}
      className="relative w-full h-[320px] sm:h-[420px] md:h-[520px] 
             rounded-xl bg-slate-50 border border-slate-200 overflow-hidden 
             flex items-center justify-center"
    >
      <canvas ref={canvasRef} className="block " />
    </div>
  );
}
