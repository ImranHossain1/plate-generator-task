import type { CSSProperties } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { PlateRect } from "../../../../utils/types";

export default function DraggablePlate({
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

  const style: CSSProperties = {
    position: "absolute",
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    pointerEvents: "auto",
    transform: CSS.Translate.toString(transform), // no scale compensation
    cursor: "grab",
    outline: isDragging ? "2px solid rgba(0,0,0,0.25)" : "none",
    borderRadius: 6,
    background: isDragging ? "rgba(0,0,0,0.03)" : "transparent",
    zIndex: isDragging ? 11 : 10,
  };

  const handleStyle: CSSProperties =
    handleMode === "full"
      ? { position: "absolute", inset: 0 }
      : {
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 14,
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
