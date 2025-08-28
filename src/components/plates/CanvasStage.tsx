import { Stage, Layer, Group } from "react-konva";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import React, { forwardRef } from "react";

type CanvasStageProps = {
  width: number;
  height: number;
  pad: number;
  children: React.ReactNode;
  listening?: boolean;
};

const CanvasStage = forwardRef<KonvaStage, CanvasStageProps>(
  ({ width, height, pad, children, listening = false }, ref) => {
    // No background Rect => transparent canvas
    return (
      <Stage ref={ref} width={width} height={height} listening={listening}>
        <Layer listening={false}>
          <Group x={pad} y={pad} listening={false}>
            {children}
          </Group>
        </Layer>
      </Stage>
    );
  }
);
CanvasStage.displayName = "CanvasStage";
export default CanvasStage;
