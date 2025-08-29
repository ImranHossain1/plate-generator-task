import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragCancelEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import type { ReorderLayerProps } from "../../../../utils/types";
import DraggablePlate from "./DraggablePlate";
import DroppableGap from "./DroppableGap";

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

  const handleDragStart = (_e: DragStartEvent) => setIsDragging(true);
  const handleDragCancel = (_e: DragCancelEvent) => setIsDragging(false);

  // gap k means "insert BEFORE item k". After removal, indices shift.
  const computeInsertIndex = (gapIndex: number, fromIndex: number) =>
    gapIndex - (fromIndex < gapIndex ? 1 : 0);

  const handleDragEnd = (e: DragEndEvent) => {
    setIsDragging(false);

    const fromId = e.active?.id as string | undefined;
    const overId = e.over?.id as string | undefined;
    if (!fromId || !overId || !onReorder) return;
    if (!overId.startsWith("gap-")) return;

    const fromIndex = plateRects.findIndex((r) => r.id === fromId);
    const gapIndex = Number(overId.slice(4));
    if (fromIndex < 0 || Number.isNaN(gapIndex)) return;

    const insertAt = computeInsertIndex(gapIndex, fromIndex);
    if (insertAt === fromIndex) return; // same/immediately-after → no-op

    onReorder(fromIndex, insertAt);
  };

  const gapWidth = isDragging ? 36 : 0;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      {plateRects.map((r) => (
        <DraggablePlate key={r.id} id={r.id} rect={r} handleMode={dragHandle} />
      ))}

      {isDragging &&
        gapXs.map((gx, i) => (
          <DroppableGap
            key={`gap-${i}`}
            id={`gap-${i}`}
            x={gx}
            height={stageHeight}
            width={gapWidth}
          />
        ))}

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
