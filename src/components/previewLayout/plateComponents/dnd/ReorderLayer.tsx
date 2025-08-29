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

  // Gap semantics:
  //   gap k (0..n) means "insert BEFORE item k"
  //   (gap n == after the last item).
  // After removing the dragged item, indices >= fromIndex shift left by 1.
  // So, if you drop at a gap to the RIGHT of the original position,
  // the final insertion index is (gapIndex - 1); otherwise it's gapIndex.
  const computeInsertIndex = (gapIndex: number, fromIndex: number) =>
    gapIndex - (fromIndex < gapIndex ? 1 : 0);

  const handleDragEnd = (e: DragEndEvent) => {
    setIsDragging(false);

    const fromId = e.active?.id as string | undefined;
    const overId = e.over?.id as string | undefined;
    if (!fromId || !overId || !onReorder) return;
    if (!overId.startsWith("gap-")) return;

    const fromIndex = plateRects.findIndex((r) => r.id === fromId);
    const gapIndex = Number(overId.slice(4)); // "gap-<k>"
    if (fromIndex < 0 || Number.isNaN(gapIndex)) return;

    const insertAt = computeInsertIndex(gapIndex, fromIndex);

    // No-op cases: dropping "before self" or "immediately after self"
    if (insertAt === fromIndex) return;

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
