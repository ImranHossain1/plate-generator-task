// src/components/cards/PreviewCard.tsx
import React from "react";
import Card from "@/components/ui/Card";
import PlateCanvas from "@/components/plates/PlateCanvas";
import type { Plate, RenderMode } from "@/constants/plates";
import Button from "@/components/ui/Button";

type PreviewCardProps = {
  plates: Plate[];
  img: HTMLImageElement | null;
  imgErr: string;
  renderMode: RenderMode;
  handleCanvasRef: (c: HTMLCanvasElement | null) => void;
  recentlyAdded: string | null;
  exportPNG: () => void;
};

export default function PreviewCard({
  plates,
  img,
  imgErr,
  renderMode,
  handleCanvasRef,
  recentlyAdded,
  exportPNG,
}: PreviewCardProps) {
  return (
    <Card
      title="Preview"
      right={
        <Button onClick={exportPNG} variant="outline">
          Export PNG
        </Button>
      }
      subtitle={imgErr ? <span className="text-red-600">{imgErr}</span> : null}
    >
      <div className="mt-2">
        <PlateCanvas
          plates={plates}
          img={img}
          renderMode={renderMode}
          onCanvasRef={handleCanvasRef}
          recentlyAdded={recentlyAdded}
          recentlyRemoved={null}
        />
      </div>
    </Card>
  );
}
