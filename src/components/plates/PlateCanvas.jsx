import { useEffect, useMemo, useRef } from "react";
import { hatch, roundedRect } from "../../utils/canvas.js";

/** Safely draws an image, clamping the source rect to image bounds and
 *  adjusting the destination rect so alignment is preserved. */
function drawImageClamped(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
  const EPS = 0.01;

  // Clamp source rectangle to the image bounds
  const sxa = Math.max(0, Math.min(img.width, sx));
  const sya = Math.max(0, Math.min(img.height, sy));
  const sxb = Math.max(0, Math.min(img.width, sx + sw));
  const syb = Math.max(0, Math.min(img.height, sy + sh));

  const clampedSW = Math.max(0, sxb - sxa);
  const clampedSH = Math.max(0, syb - sya);
  if (clampedSW < EPS || clampedSH < EPS) return; // nothing valid to draw

  // Fractions cropped off each side of the original src
  const cropLeft = sw > 0 ? (sxa - sx) / sw : 0;
  const cropTop = sh > 0 ? (sya - sy) / sh : 0;
  const cropRight = sw > 0 ? (sx + sw - sxb) / sw : 0;
  const cropBottom = sh > 0 ? (sy + sh - syb) / sh : 0;

  // Adjust destination rect accordingly
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

export default function PlateCanvas({ plates, img, renderMode, onCanvasRef }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  const totalWidth = useMemo(
    () => plates.reduce((s, p) => s + (Number(p.w) || 0), 0),
    [plates]
  );
  const maxHeight = useMemo(
    () => Math.max(1, ...plates.map((p) => Number(p.h) || 0)),
    [plates]
  );

  // expose canvas to parent (export)
  useEffect(() => {
    if (typeof onCanvasRef === "function") onCanvasRef(canvasRef.current);
  }, [onCanvasRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const cmW = Math.max(1, totalWidth);
    const cmH = Math.max(1, maxHeight);

    const pad = 24; // px margin around drawing area
    const availW = Math.max(10, wrap.clientWidth - pad * 2);
    const availH = Math.max(10, wrap.clientHeight - pad * 2);

    // Fit into available area (keeps aspect)
    const scale = Math.max(0.1, Math.min(availW / cmW, availH / cmH));
    const pxW = Math.max(1, Math.round(cmW * scale)); // total drawing width
    const pxH = Math.max(1, Math.round(cmH * scale)); // total drawing height

    canvas.width = pxW + pad * 2;
    canvas.height = pxH + pad * 2;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // background
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const originX = pad;

    // helper for cover/contain crop rect
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

    // Compute one global source rect for the whole wall (pxW × pxH)
    let globalSrc = null;
    if (img && img.width > 0 && img.height > 0 && renderMode !== "tile") {
      globalSrc = getCoverSrcRect(img.width, img.height, pxW, pxH, renderMode);
    }

    // draw plates sequentially
    let cursorX = 0;
    plates.forEach((p) => {
      const w = (Number(p.w) || 0) * scale;
      const h = (Number(p.h) || 0) * scale;
      const x = originX + cursorX;
      const y = pad + (pxH - h); // bottom align

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.15)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;

      ctx.beginPath();
      const r = 8;
      roundedRect(ctx, x, y, w, h, r);
      ctx.clip();

      if (img && img.width > 0 && img.height > 0) {
        if (renderMode === "tile") {
          const pat = ctx.createPattern(img, "repeat");
          if (pat) {
            ctx.fillStyle = pat;
            ctx.fillRect(x, y, w, h);
          } else {
            // fallback if pattern not created yet
            hatch(ctx, x, y, w, h);
          }
        } else if (globalSrc) {
          // Map this plate's dest rect to the corresponding slice of globalSrc
          const fx = cursorX / pxW; // fraction from left
          const fy = (pxH - h) / pxH; // fraction from top (bottom-aligned)
          const fw = w / pxW; // width fraction
          const fh = h / pxH; // height fraction

          const sx = globalSrc.x + globalSrc.w * fx;
          const sy = globalSrc.y + globalSrc.h * fy;
          const sw = globalSrc.w * fw;
          const sh = globalSrc.h * fh;

          drawImageClamped(ctx, img, sx, sy, sw, sh, x, y, w, h);
        } else {
          hatch(ctx, x, y, w, h);
        }
      } else {
        hatch(ctx, x, y, w, h);
      }

      ctx.restore();

      // border
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#0f172a";
      ctx.beginPath();
      roundedRect(ctx, x, y, w, h, 8);
      ctx.stroke();

      // label
      ctx.fillStyle = "#0f172a";
      ctx.font = "12px ui-sans-serif, system-ui, -apple-system";
      ctx.fillText(`${p.w}×${p.h} cm`, x + 8, y + 18);

      cursorX += w;
    });
  }, [plates, img, totalWidth, maxHeight, renderMode]);

  // subtle reflow fix on resize
  useEffect(() => {
    const onResize = () => {
      const c = canvasRef.current;
      if (!c) return;
      c.style.opacity = "0.9999";
      requestAnimationFrame(() => (c.style.opacity = "1"));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative h-[520px] rounded-xl bg-slate-50 border border-slate-200 overflow-hidden
                 flex items-center justify-center"
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
