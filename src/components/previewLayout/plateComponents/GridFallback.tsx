import { Group, Rect } from "react-konva";

type GridFallbackProps = {
  width: number;
  height: number;
  step?: number;
};

export default function GridFallback({
  width,
  height,
  step = 6,
}: GridFallbackProps) {
  const rows = Math.ceil(height / step);
  const cols = Math.ceil(width / step);
  return (
    <Group>
      <Rect width={width} height={height} fill="#ffffff" stroke="#e5e7eb" />
      {Array.from({ length: rows }).map((_, i) => (
        <Rect
          key={`h-${i}`}
          x={0}
          y={i * step}
          width={width}
          height={1}
          fill="#e5e7eb"
        />
      ))}
      {Array.from({ length: cols }).map((_, i) => (
        <Rect
          key={`v-${i}`}
          x={i * step}
          y={0}
          width={1}
          height={height}
          fill="#e5e7eb"
        />
      ))}
    </Group>
  );
}
