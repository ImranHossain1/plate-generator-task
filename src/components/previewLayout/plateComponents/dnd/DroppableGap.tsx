import type { CSSProperties } from "react";
import { useDroppable } from "@dnd-kit/core";

export default function DroppableGap({
  id,
  x,
  height,
  width,
}: {
  id: string;
  x: number;
  height: number;
  width: number;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });

  const style: CSSProperties = {
    position: "absolute",
    left: x - width / 2,
    top: 0,
    width,
    height,
    pointerEvents: "auto",
    boxShadow: isOver ? "inset 0 0 0 2px rgba(59,130,246,0.8)" : "none",
    background: isOver ? "rgba(59,130,246,0.15)" : "transparent",
  };

  return <div ref={setNodeRef} style={style} />;
}
