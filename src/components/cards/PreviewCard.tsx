import { useMemo } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import PlateCanvas from "../plates/PlateCanvas";
import { PreviewCardProps } from "../../utils/types";
import AppButton from "../common/AppButton";
import AppCard from "../common/AppCard";

export default function PreviewCard({
  plates,
  img,
  imgErr,
  handleCanvasRef,
  recentlyAdded,
  exportPNG,
}: PreviewCardProps) {
  const intl = useIntl();

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
