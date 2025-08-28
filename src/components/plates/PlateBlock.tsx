import React, { useCallback } from "react";
import { Group, Image as KonvaImage } from "react-konva";
import Konva from "konva";
import GridFallback from "./GridFallback";
import { CropRect } from "../../utils/types";

type PlateBlockProps = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  crop: CropRect | null;
  sourceImg: CanvasImageSource | null;
  onRef: (node: Konva.Group | null) => void;
};

export default function PlateBlock({
  id,
  x,
  y,
  width,
  height,
  crop,
  sourceImg,
  onRef,
}: PlateBlockProps) {
  const setNodeRef = useCallback(
    (node: Konva.Group | null) => onRef(node),
    [onRef]
  );

  return (
    <Group
      key={id}
      x={x}
      y={y}
      width={width}
      height={height}
      ref={setNodeRef}
      opacity={1}
      scaleX={1}
      scaleY={1}
      listening={false}
    >
      {sourceImg && crop ? (
        <KonvaImage
          x={0}
          y={0}
          width={width}
          height={height}
          image={sourceImg}
          crop={crop}
        />
      ) : (
        <GridFallback width={width} height={height} />
      )}
    </Group>
  );
}
