import { useMemo } from "react";
import { FormattedMessage } from "react-intl";
import PlateCanvas from "./plateComponents/PlateCanvas";
import { PreviewCardProps } from "../../utils/types";

export default function PreviewCard({
  plates,
  img,
  imgErr,
  handleCanvasRef,
  recentlyAdded,
  exportPNG,
  onReorder,
}: PreviewCardProps) {
  const recentlyRemovedId = useMemo(
    () => plates.find((p) => p.status === "removing")?.id ?? null,
    [plates]
  );

  return (
    <div>
      <PlateCanvas
        plates={plates}
        img={img}
        exportPNG={exportPNG}
        onCanvasRef={handleCanvasRef}
        recentlyAdded={recentlyAdded}
        recentlyRemoved={recentlyRemovedId}
        onReorder={onReorder}
      />

      {imgErr && (
        <div className="px-1 pt-2 text-sm">
          <div className="text-destructive">
            <FormattedMessage id="preview.url.error" />
          </div>
          <div className="mt-1 text-muted-foreground">
            <FormattedMessage id="preview.url.tip" />
          </div>
        </div>
      )}
    </div>
  );
}
