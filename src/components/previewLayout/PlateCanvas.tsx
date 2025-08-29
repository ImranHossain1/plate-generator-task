import { useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import AppCard from "../common/AppCard";
import CanvasStage from "./plateComponents/CanvasStage";
import PlateBlock from "./plateComponents/PlateBlock";
import RemovedGhostCmp from "./plateComponents/RemovedGhost";
import { Plate } from "../../constants/plates";
import { useIntl, FormattedMessage } from "react-intl";
import {
  computeSizes,
  getCoverSrcRect,
  makeMirroredStripe,
  getResizeChanges,
  computeRemovedGhost,
} from "../../utils/helpers";
import {
  CoverRect,
  RemovedGhost,
  PlateCanvasProps,
  ANIM_S,
  PAD,
  GAP,
} from "../../utils/types";
import AppButton from "../common/AppButton";

export default function PlateCanvas({
  plates,
  img,
  onCanvasRef,
  onStageRef,
  exportPNG,
  recentlyAdded = null,
  recentlyRemoved = null,
}: PlateCanvasProps) {
  const stageRef = useRef<KonvaStage | null>(null);
  const nodeMapRef = useRef<Record<string, Konva.Group | null>>({});
  const prevPlatesRef = useRef<Plate[]>([]);
  const [removedGhost, setRemovedGhost] = useState<RemovedGhost>(null);
  const intl = useIntl();
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

  // animations
  const resizeChanges = useMemo(
    () => getResizeChanges(prevPlatesRef.current, plates),
    [plates]
  );

  useEffect(() => {
    if (recentlyAdded) {
      const node = nodeMapRef.current[recentlyAdded];
      if (node) {
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
      }
    }
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
  }, [recentlyAdded, resizeChanges]);

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

  let cursorX = 0;

  return (
    <AppCard
      className="min-w-0 bg-gray-100"
      contentClassName="p-0"
      title={intl.formatMessage({ id: "preview.title" })}
      subtitle={intl.formatMessage({ id: "preview.subtitle" })}
      action={<AppButton msgId="preview.export" onClick={exportPNG} />}
    >
      <div className="w-full max-w-full h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96 overflow-x-auto overflow-y-hidden relative">
        <div className="min-w-min h-full flex items-center justify-center">
          <CanvasStage
            ref={stageRef}
            width={stageWidth}
            height={stageHeight}
            pad={PAD}
          >
            {plates.map((p) => {
              const w = Number(p.w) || 0;
              const h = Number(p.h) || 0;
              const x = cursorX;
              const y = pxH - h;
              const drawW = Math.max(0, w - GAP);
              const drawH = h;
              const id = p.id;

              const crop =
                sourceImg && globalSrc
                  ? {
                      x: globalSrc.x + (globalSrc.w * cursorX) / pxW,
                      y: globalSrc.y + (globalSrc.h * (pxH - h)) / pxH,
                      width: (globalSrc.w * drawW) / pxW,
                      height: (globalSrc.h * drawH) / pxH,
                    }
                  : null;

              const el = (
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
              cursorX += w;
              return el;
            })}

            <RemovedGhostCmp ghost={removedGhost} sourceImg={sourceImg} />
          </CanvasStage>
        </div>
      </div>
    </AppCard>
  );
}
