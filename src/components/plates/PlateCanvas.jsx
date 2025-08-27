import { useEffect, useMemo, useRef, useState } from "react";

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

// simple hatch fallback
function hatch(ctx, x, y, w, h) {
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

  // detect width/height changes for resize animation
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

  // Build a mirrored source when total width > 300 cm
  const { sourceImg, sW, sH } = useMemo(() => {
    const needsMirror =
      totalWidth > 300 && img && img.width > 0 && img.height > 0;
    if (!needsMirror) {
      return { sourceImg: img, sW: img?.width || 0, sH: img?.height || 0 };
    }
    // Make a 2× wide stripe: [img | mirrored img]
    const stripe = document.createElement("canvas");
    stripe.width = img.width * 2;
    stripe.height = img.height;
    const sctx = stripe.getContext("2d");
    // left: original
    sctx.drawImage(img, 0, 0);
    // right: mirrored
    sctx.save();
    sctx.translate(stripe.width, 0); // move to right edge
    sctx.scale(-1, 1); // flip horizontally
    sctx.drawImage(img, 0, 0); // draw from (0,0) in flipped space
    sctx.restore();
    return { sourceImg: stripe, sW: stripe.width, sH: stripe.height };
  }, [img, totalWidth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");

    const cmW = Math.max(1, totalWidth);
    const cmH = Math.max(1, maxHeight);
    const pad = 24;

    // 1 cm == 1 px (we’ll scale down only for fitting)
    let scale = 1;

    // Canvas pixel size
    const pxW = Math.max(1, Math.round(cmW * scale));
    const pxH = Math.max(1, Math.round(cmH * scale));

    canvas.width = pxW + pad * 2;
    canvas.height = pxH + pad * 2;

    // Center the canvas when it fits, otherwise left-align & scroll
    const fits = canvas.width <= wrap.clientWidth;
    wrap.style.justifyContent = fits ? "center" : "flex-start";
    wrap.style.overflowX = fits ? "hidden" : "auto";
    if (!fits) wrap.scrollLeft = 0;

    let start = null;
    const duration = 500;
    let animationFrame;

    function drawFrame(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min(1, (timestamp - start) / duration);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Compute a centered source rect for the WHOLE composition.
      function getCoverSrcRect(imgW, imgH, destW, destH, mode) {
        // Center-outward crop for both modes
        const srcRatio = imgW / imgH;
        const destRatio = destW / destH;

        if (mode === "contain") {
          // fit the whole image inside, center remainder
          if (destRatio > srcRatio) {
            // empty bars left/right -> widen source to match dest aspect (centered)
            const newW = imgH * destRatio;
            const xOff = (imgW - newW) / 2;
            return { x: xOff, y: 0, w: newW, h: imgH };
          } else {
            const newH = imgW / destRatio;
            const yOff = (imgH - newH) / 2;
            return { x: 0, y: yOff, w: imgW, h: newH };
          }
        }

        // cover: fill destination, cropping from center outward
        if (destRatio > srcRatio) {
          // crop top/bottom
          const newH = imgW / destRatio;
          const yOff = (imgH - newH) / 2;
          return { x: 0, y: yOff, w: imgW, h: newH };
        } else {
          // crop left/right
          const newW = imgH * destRatio;
          const xOff = (imgW - newW) / 2;
          return { x: xOff, y: 0, w: newW, h: imgH };
        }
      }

      let globalSrc = null;
      if (sourceImg && sW > 0 && sH > 0 && renderMode !== "tile") {
        // Use mirrored stripe if it exists; crop centered
        globalSrc = getCoverSrcRect(sW, sH, pxW, pxH, renderMode);
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

        if (sourceImg && sW > 0 && sH > 0) {
          if (renderMode === "tile") {
            // tile from mirrored stripe if active; gives seamless mirror joins too
            const pat = ctx.createPattern(sourceImg, "repeat");
            if (pat) {
              ctx.fillStyle = pat;
              ctx.fillRect(x, y + (h - drawH), drawW, drawH);
            } else {
              hatch(ctx, x, y + (h - drawH), drawW, drawH);
            }
          } else if (globalSrc) {
            // Map this plate’s “window” inside the full composition
            const fx = cursorX / pxW; // left fraction
            const fy = (pxH - h) / pxH; // bottom-aligned -> top fraction
            const fw = drawW / pxW;
            const fh = drawH / pxH;

            const sx = globalSrc.x + globalSrc.w * fx;
            const sy = globalSrc.y + globalSrc.h * fy;
            const sw = globalSrc.w * fw;
            const sh = globalSrc.h * fh;

            drawImageClamped(
              ctx,
              sourceImg,
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
    <div
      ref={wrapRef}
      className="relative w-full h-[320px] sm:h-[420px] md:h-[520px]
                 rounded-xl bg-slate-50 border border-slate-200
                 overflow-x-auto overflow-y-hidden
                 flex items-center justify-start"
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
