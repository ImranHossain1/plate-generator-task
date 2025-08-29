import { useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import AppCard from "../../common/AppCard";
import CanvasStage from "./Konva/CanvasStage";
import PlateBlock from "./Konva/PlateBlock";
import RemovedGhostCmp from "./Konva/RemovedGhost";
import { useIntl } from "react-intl";
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

  const [removedGhost, setRemovedGhost] = useState<RemovedGhost>(null);
  const intl = useIntl();

  // --- Preview Zoom (visual only; math stays 1px = 1cm) ---
  const [previewScale, setPreviewScale] = useState(1);
  const clamp = (v: number) => Math.min(3, Math.max(0.5, Number(v.toFixed(2))));
  const zoomOut = () => setPreviewScale((s) => clamp(s - 0.25));
  const zoomIn = () => setPreviewScale((s) => clamp(s + 0.25));
  const resetZoom = () => setPreviewScale(1);

  // sizing
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

  // mirror if needed
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

  // refs exposure
  useEffect(() => onStageRef?.(stageRef.current), [onStageRef]);
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

  // detect only *real* size changes (epsilon guard in helper)
  const resizeChanges = useMemo(
    () => getResizeChanges(prevPlatesRef.current, plates),
    [plates]
  );

  // Animation: play "recently added" ONCE per id
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

  // Animation: subtle grow/shrink only when w/h actually changed
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

  // snapshot for ghost
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

  useEffect(() => {
    lastSnapshotRef.current = {
      prevPlates: prevPlatesRef.current,
      pxW,
      pxH,
      globalSrc,
    };
    prevPlatesRef.current = plates.map((p) => ({ ...p }));
  }, [plates, pxW, pxH, globalSrc]);

  // removed ghost
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

  // ---- layout rects for overlay ----
  const plateRects: Array<{
    id: string;
    left: number;
    top: number;
    width: number;
    height: number;
  }> = [];
  const gapXs: number[] = [];

  let cursorXForRects = 0;
  gapXs.push(PAD + 0);
  for (const p of plates) {
    const w = Number(p.w) || 0;
    const h = Number(p.h) || 0;
    const drawW = Math.max(0, w - GAP);
    const x = cursorXForRects;
    const y = pxH - h;

    plateRects.push({
      id: p.id,
      left: PAD + x,
      top: PAD + y,
      width: drawW,
      height: h,
    });

    cursorXForRects += w;
    gapXs.push(PAD + cursorXForRects);
  }

  return (
    <AppCard
      className="min-w-0 bg-gray-100"
      contentClassName="p-0"
      title={intl.formatMessage({ id: "preview.title" })}
      subtitle={intl.formatMessage({ id: "preview.subtitle" })}
      action={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-md bg-white/70 px-2 py-1 shadow">
            <button
              className="px-2 py-1"
              onClick={zoomOut}
              aria-label="Zoom out"
            >
              −
            </button>
            <button
              className="px-2 py-1"
              onClick={resetZoom}
              aria-label="Reset zoom"
            >
              {Math.round(previewScale * 100)}%
            </button>
            <button className="px-2 py-1" onClick={zoomIn} aria-label="Zoom in">
              +
            </button>
          </div>
          <AppButton msgId="preview.export" onClick={exportPNG} />
        </div>
      }
    >
      <div className="w-full max-w-full h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96 overflow-x-auto overflow-y-hidden relative">
        <div className="min-w-min h-full flex items-center justify-center">
          <div
            className="relative"
            style={{
              width: stageWidth * previewScale,
              height: stageHeight * previewScale,
            }}
          >
            <div
              className="relative"
              style={{
                width: stageWidth,
                height: stageHeight,
                transform: `scale(${previewScale})`,
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

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              >
                <ReorderLayer
                  plateRects={plateRects}
                  gapXs={gapXs}
                  stageWidth={stageWidth}
                  stageHeight={stageHeight}
                  onReorder={(from, to) => onReorder?.(from, to)}
                  dragHandle="full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppCard>
  );
}
