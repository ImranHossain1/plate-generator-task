import { useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import AppCard from "../../common/AppCard";
import CanvasStage from "./Konva/CanvasStage";
import PlateBlock from "./Konva/PlateBlock";
import RemovedGhostCmp from "./Konva/RemovedGhost";
import { Minus, Plus } from "lucide-react";
import {
  computeSizes,
  getCoverSrcRect,
  makeMirroredStripe,
  getResizeChanges,
  computeRemovedGhost,
} from "../../../utils/helpers";
import {
  CoverRect,
  RemovedGhost,
  PlateCanvasProps,
  ANIM_S,
  PAD,
  GAP,
  Plate,
} from "../../../utils/types";
import AppButton from "../../common/AppButton";
import ReorderLayer from "./dnd/ReorderLayer";

export default function PlateCanvas({
  plates,
  img,
  onCanvasRef,
  onStageRef,
  exportPNG,
  recentlyAdded = null,
  recentlyRemoved = null,
  onReorder,
}: PlateCanvasProps) {
  const stageRef = useRef<KonvaStage | null>(null);
  const nodeMapRef = useRef<Record<string, Konva.Group | null>>({});
  const prevPlatesRef = useRef<Plate[]>([]);
  const lastAddedRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fitScale, setFitScale] = useState(1);

  const [removedGhost, setRemovedGhost] = useState<RemovedGhost>(null);

  // Visual zoom (keeps math at 1cm = 1px)
  const [previewScale, setPreviewScale] = useState(1);
  const clamp = (v: number) => Math.min(3, Math.max(0.5, Number(v.toFixed(2))));
  const zoomOut = () => setPreviewScale((s) => clamp(s - 0.25));
  const zoomIn = () => setPreviewScale((s) => clamp(s + 0.25));
  const resetZoom = () => setPreviewScale(1);

  // Memoize computed stage and canvas sizes based on plates
  const { totalWidth, pxW, pxH, stageWidth, stageHeight } = useMemo(() => {
    const s = computeSizes(plates);
    return {
      totalWidth: s.totalWidth,
      pxW: s.pxW,
      pxH: s.pxH,
      stageWidth: s.stageWidth,
      stageHeight: s.stageHeight,
    };
  }, [plates]);

  // Memoize source image (mirror if needed for wide setups)
  const { sourceImg, sW, sH } = useMemo(() => {
    const ready = !!img && img.width > 0 && img.height > 0;
    const needsMirror = totalWidth > 300 && ready;
    if (!needsMirror || !img) {
      return {
        sourceImg: (img as CanvasImageSource | null) ?? null,
        sW: img?.width ?? 0,
        sH: img?.height ?? 0,
      };
    }
    return makeMirroredStripe(img);
  }, [img, totalWidth]);

  // Expose Konva stage reference upward
  useEffect(() => onStageRef?.(stageRef.current), [onStageRef]);

  // Compute fit-to-container scale on initial render and resize
  useEffect(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    if (stageWidth > 0 && containerWidth > 0) {
      const scaleToFit = containerWidth / stageWidth;
      setFitScale(scaleToFit);
    }
  }, [stageWidth]);

  // Provide raw <canvas> element ref upward for external usage
  useEffect(() => {
    if (!onCanvasRef) return;
    const stage = stageRef.current;
    const canvasEl =
      (stage
        ?.container?.()
        ?.querySelector?.("canvas") as HTMLCanvasElement | null) || null;
    onCanvasRef(canvasEl);
  }, [onCanvasRef]);

  const globalSrc: CoverRect | null =
    sourceImg && sW > 0 && sH > 0 ? getCoverSrcRect(sW, sH, pxW, pxH) : null;

  // Detect differences in plate dimensions to animate resize
  const resizeChanges = useMemo(
    () => getResizeChanges(prevPlatesRef.current, plates),
    [plates]
  );

  // Animate plates when newly added
  useEffect(() => {
    if (!recentlyAdded) return;
    if (lastAddedRef.current === recentlyAdded) return;
    lastAddedRef.current = recentlyAdded;

    const node = nodeMapRef.current[recentlyAdded];
    if (!node) return;

    node.scale({ x: 0.85, y: 0.85 });
    node.opacity(0);
    new Konva.Tween({
      node,
      duration: ANIM_S,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      easing: Konva.Easings.EaseInOut,
    }).play();
  }, [recentlyAdded]);

  // Animate plates when resized
  useEffect(() => {
    if (!resizeChanges.length) return;
    for (const change of resizeChanges) {
      const node = nodeMapRef.current[change.id];
      if (!node) continue;
      node.scale({
        x: change.type === "grow" ? 0.9 : 1.1,
        y: change.type === "grow" ? 0.9 : 1.1,
      });
      new Konva.Tween({
        node,
        duration: ANIM_S,
        scaleX: 1,
        scaleY: 1,
        easing: Konva.Easings.EaseInOut,
      }).play();
    }
  }, [resizeChanges]);

  const lastSnapshotRef = useRef<{
    prevPlates: Plate[];
    pxW: number;
    pxH: number;
    globalSrc: CoverRect | null;
  }>({
    prevPlates: [],
    pxW,
    pxH,
    globalSrc,
  });

  // Track previous plates + snapshot for removed ghost calculation
  useEffect(() => {
    lastSnapshotRef.current = {
      prevPlates: prevPlatesRef.current,
      pxW,
      pxH,
      globalSrc,
    };
    prevPlatesRef.current = plates.map((p) => ({ ...p }));
  }, [plates, pxW, pxH, globalSrc]);

  // Animate ghost for recently removed plates
  useEffect(() => {
    if (!recentlyRemoved) return;
    const {
      prevPlates,
      pxW: snapW,
      pxH: snapH,
      globalSrc: snapCrop,
    } = lastSnapshotRef.current;
    setRemovedGhost(
      computeRemovedGhost(
        prevPlates,
        recentlyRemoved,
        snapW,
        snapH,
        snapCrop,
        sourceImg
      )
    );
    const t = setTimeout(() => setRemovedGhost(null), ANIM_S * 1000);
    return () => clearTimeout(t);
  }, [recentlyRemoved, sourceImg]);

  /*  
  Previously, this computation for plateRects and gapXs was written inline without useMemo.  
  That meant every single render (even if unrelated props/state changed) we would recompute  
  all rects and gaps by iterating over the plates array. The algorithm itself is O(n)  
  — where n is the number of plates — since we loop once to build rects and gap markers.  

  By wrapping this in useMemo, React will only re-run the computation when its dependencies  
  (plates, pxH, stageWidth, stageHeight, fitScale, previewScale) actually change.  
  This avoids unnecessary recalculations on every re-render and prevents wasteful  
  object allocations (new arrays for rects/gaps/rectsScaled).  

  The result: the time complexity of the loop is still O(n), but it now executes only  
  when required, making the code more efficient and reducing CPU work during renders.  
  This is especially beneficial when there are many plates or frequent state updates.  
*/

  // Compute plate rectangles, scaled positions, gaps, and stage size for rendering & reordering
  const {
    plateRects,
    plateRectsScaled,
    gapXsScaled,
    stageWidthScaled,
    stageHeightScaled,
    scale,
  } = useMemo(() => {
    // Base rect positions (unscaled)
    const rects: {
      id: string;
      left: number;
      top: number;
      width: number;
      height: number;
    }[] = [];
    // Gap markers (used for drag & drop reordering)
    const gaps: number[] = [];
    let cursorXForRects = 0;
    gaps.push(PAD);
    for (const p of plates) {
      const w = Number(p.w) || 0;
      const h = Number(p.h) || 0;
      const drawW = Math.max(0, w - GAP);
      const x = cursorXForRects;
      const y = pxH - h;

      rects.push({
        id: p.id,
        left: PAD + x,
        top: PAD + y,
        width: drawW,
        height: h,
      });

      cursorXForRects += w;
      gaps.push(PAD + cursorXForRects);
    }

    // --- Scaling ---
    /*
    After computing base positions, we apply scaling:
    - scale = fitScale (auto fit-to-container) × previewScale (user zoom).
    - stageWidth/HeightScaled = how large the canvas actually renders at this scale.
    - rectsScaled = each plate’s coordinates and size adjusted by scale,
        so the visual layout matches zoom/fit.
    - gapsScaled = scale the gap markers too, ensuring drag & drop targets
        stay aligned with the scaled layout.

    Without these multiplications, zooming or fitting wouldn’t affect
    the actual rendered positions, leading to misaligned visuals.
    */
    const scale = fitScale * previewScale;
    const stageWidthScaled = stageWidth * scale;
    const stageHeightScaled = stageHeight * scale;
    const rectsScaled = rects.map((r) => ({
      id: r.id,
      left: r.left * scale,
      top: r.top * scale,
      width: r.width * scale,
      height: r.height * scale,
    }));
    const gapsScaled = gaps.map((x) => x * scale);

    return {
      plateRects: rects,
      gapXs: gaps,
      plateRectsScaled: rectsScaled,
      gapXsScaled: gapsScaled,
      stageWidthScaled,
      stageHeightScaled,
      scale,
    };
  }, [plates, pxH, stageWidth, stageHeight, fitScale, previewScale]);

  return (
    <AppCard
      className="min-w-0 bg-gray-100"
      contentClassName="p-0"
      action={
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <AppButton
              variant="secondary"
              size="sm"
              onClick={zoomOut}
              aria-label="Zoom out"
              icon={<Minus className="h-4 w-4" />}
            />
            <AppButton
              variant="secondary"
              size="sm"
              onClick={resetZoom}
              aria-label="Reset zoom"
            >
              {Math.round(previewScale * 100)}%
            </AppButton>
            <AppButton
              variant="secondary"
              size="sm"
              onClick={zoomIn}
              aria-label="Zoom in"
              icon={<Plus className="h-4 w-4" />}
            />
          </div>

          <AppButton msgId="preview.export" onClick={exportPNG} />
        </div>
      }
    >
      <div
        ref={containerRef}
        className="w-full max-w-full h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96 overflow-hidden relative"
      >
        <div className="min-w-min h-full flex items-center justify-center">
          <div
            className="relative"
            style={{
              width: stageWidthScaled,
              height: stageHeightScaled,
            }}
          >
            {/* Only the Konva canvas is scaled */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <CanvasStage
                ref={stageRef}
                width={stageWidth}
                height={stageHeight}
                pad={PAD}
              >
                {plates.map((p) => {
                  const w = Number(p.w) || 0;
                  const h = Number(p.h) || 0;
                  const x =
                    (plateRects.find((r) => r.id === p.id)?.left ?? PAD) - PAD;
                  const y = pxH - h;
                  const drawW = Math.max(0, w - GAP);
                  const drawH = h;
                  const id = p.id;

                  const crop =
                    sourceImg && globalSrc
                      ? {
                          x: globalSrc.x + (globalSrc.w * x) / pxW,
                          y: globalSrc.y + (globalSrc.h * (pxH - h)) / pxH,
                          width: (globalSrc.w * drawW) / pxW,
                          height: (globalSrc.h * drawH) / pxH,
                        }
                      : null;

                  return (
                    <PlateBlock
                      key={id}
                      id={id}
                      x={x}
                      y={y}
                      width={drawW}
                      height={drawH}
                      crop={crop}
                      sourceImg={sourceImg}
                      onRef={(node) => (nodeMapRef.current[id] = node)}
                    />
                  );
                })}
                <RemovedGhostCmp ghost={removedGhost} sourceImg={sourceImg} />
              </CanvasStage>
            </div>

            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 10,
              }}
            >
              <ReorderLayer
                plateRects={plateRectsScaled}
                gapXs={gapXsScaled}
                stageWidth={stageWidthScaled}
                stageHeight={stageHeightScaled}
                onReorder={(from, to) => onReorder?.(from, to)}
                dragHandle="full"
              />
            </div>
          </div>
        </div>
      </div>
    </AppCard>
  );
}
