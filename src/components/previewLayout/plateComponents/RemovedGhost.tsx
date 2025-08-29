import { Group, Image as KonvaImage, Rect } from "react-konva";
import Konva from "konva";
import { ANIM_S, RemovedGhostProps } from "../../../utils/types";

export default function RemovedGhost({ ghost, sourceImg }: RemovedGhostProps) {
  if (!ghost) return null;

  return (
    <Group
      x={ghost.x}
      y={ghost.y}
      listening={false}
      opacity={1}
      scaleX={1}
      scaleY={1}
      ref={(node) => {
        if (!node) return;
        node.opacity(1);
        node.scale({ x: 1, y: 1 });
        new Konva.Tween({
          node,
          duration: ANIM_S,
          opacity: 0,
          scaleX: 0.85,
          scaleY: 0.85,
          easing: Konva.Easings.EaseInOut,
        }).play();
      }}
    >
      {sourceImg && ghost.crop ? (
        <KonvaImage
          x={0}
          y={0}
          width={ghost.w}
          height={ghost.h}
          image={sourceImg}
          crop={ghost.crop}
        />
      ) : (
        <>
          <Rect
            width={ghost.w}
            height={ghost.h}
            fill="#ffffff"
            stroke="#e5e7eb"
          />
          {Array.from({ length: Math.ceil(ghost.h / 6) }).map((_, i) => (
            <Rect
              key={`gh-${i}`}
              x={0}
              y={i * 6}
              width={ghost.w}
              height={1}
              fill="#e5e7eb"
            />
          ))}
          {Array.from({ length: Math.ceil(ghost.w / 6) }).map((_, i) => (
            <Rect
              key={`gv-${i}`}
              x={i * 6}
              y={0}
              width={1}
              height={ghost.h}
              fill="#e5e7eb"
            />
          ))}
        </>
      )}
    </Group>
  );
}
