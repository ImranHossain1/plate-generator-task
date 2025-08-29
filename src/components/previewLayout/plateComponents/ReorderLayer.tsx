// src/components/preview/plateComponents/ReorderLayer.tsx
import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragCancelEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  DragOverlay,
  rectIntersection,
  closestCenter, // add
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

type PlateRect = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

type ReorderLayerProps = {
  plateRects: PlateRect[]; // absolute positions inside the stage (including PAD)
  gapXs: number[]; // absolute Xs for gaps (0..n)
  stageWidth: number;
  stageHeight: number;
  dragHandle?: "full" | "edge"; // optional: where to grab
  onReorder?: (fromIndex: number, toIndex: number) => void;
};

function DraggablePlate({
  id,
  rect,
  handleMode = "full",
}: {
  id: string;
  rect: PlateRect;
  handleMode?: "full" | "edge";
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  const style: React.CSSProperties = {
    position: "absolute",
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    pointerEvents: "auto",
    transform: CSS.Translate.toString(transform),
    cursor: "grab",
    outline: isDragging ? "2px solid rgba(0,0,0,0.25)" : "none",
    borderRadius: 6,
    background: isDragging ? "rgba(0,0,0,0.03)" : "transparent",
    zIndex: isDragging ? 11 : 10,
  };

  const handleStyle: React.CSSProperties =
    handleMode === "full"
      ? { position: "absolute", inset: 0 }
      : {
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 14, // grab from right edge only
          background:
            "linear-gradient(to left, rgba(0,0,0,0.10), rgba(0,0,0,0))",
          borderTopRightRadius: 6,
          borderBottomRightRadius: 6,
        };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div {...listeners} style={handleStyle} />
    </div>
  );
}

function DroppableGap({
  id,
  x,
  height,
  width,
  active,
}: {
  id: string;
  x: number;
  height: number;
  width: number;
  active: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });

  // slim, full-height strip:
  const style: React.CSSProperties = {
    position: "absolute",
    left: x - width / 2,
    top: 0,
    width,
    height,
    pointerEvents: "auto",
    // show a line when hovering/active
    boxShadow:
      isOver || active
        ? "inset 0 0 0 2px rgba(59,130,246,0.8)"
        : "inset 0 0 0 1px rgba(0,0,0,0.08)",
    background: isOver ? "rgba(59,130,246,0.15)" : "transparent",
  };

  return <div ref={setNodeRef} style={style} />;
}

export default function ReorderLayer({
  plateRects,
  gapXs,
  stageWidth,
  stageHeight,
  dragHandle = "full",
  onReorder,
}: ReorderLayerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const [isDragging, setIsDragging] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const gapWidth = isDragging ? 36 : 0; // wider & only visible while dragging

  const handleDragStart = (e: DragStartEvent) => {
    setIsDragging(true);
    setActiveId(e.active?.id as string);
  };
  const handleDragCancel = (_e: DragCancelEvent) => {
    setIsDragging(false);
    setActiveId(null);
  };
  const handleDragEnd = (e: DragEndEvent) => {
    setIsDragging(false);
    setActiveId(null);

    const fromId = e.active?.id as string | undefined;
    const overId = e.over?.id as string | undefined;
    if (!fromId || !overId || !onReorder) return;
    if (!overId.startsWith("gap-")) return;

    const fromIndex = plateRects.findIndex((r) => r.id === fromId);
    const toIndex = Number(overId.replace("gap-", "")); // insert BEFORE toIndex
    if (fromIndex < 0 || toIndex < 0) return;
    if (toIndex === fromIndex || toIndex === fromIndex + 1) return;

    onReorder(fromIndex, toIndex > fromIndex ? toIndex - 1 : toIndex);
  };

  return (
    <DndContext
      sensors={sensors}
      // 'closestCenter' makes skinny targets easier to hit than the default
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      {plateRects.map((r) => (
        <DraggablePlate key={r.id} id={r.id} rect={r} handleMode={dragHandle} />
      ))}

      {/* Show gap targets only while dragging */}
      {isDragging &&
        gapXs.map((gx, i) => (
          <DroppableGap
            key={`gap-${i}`}
            id={`gap-${i}`}
            x={gx}
            height={stageHeight}
            width={gapWidth}
            active={false}
          />
        ))}

      {/* Optional: draw a subtle ghost */}
      <DragOverlay />
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: stageWidth,
          height: stageHeight,
          pointerEvents: "none",
        }}
      />
    </DndContext>
  );
}
