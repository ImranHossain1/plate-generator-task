import { useMemo } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import { Plate, RenderMode } from "../../constants/plates";
import PlateCanvas from "../plates/PlateCanvas";
import AppButton from "../common/AppButton";
import AppCard from "../common/AppCard";

type PlateWithStatus = Plate & { status?: "active" | "removing" };

type PreviewCardProps = {
  plates: PlateWithStatus[];
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
  const intl = useIntl();

  const recentlyRemovedId = useMemo(
    () => plates.find((p) => p.status === "removing")?.id ?? null,
    [plates]
  );

  return (
    <AppCard
      title={intl.formatMessage({ id: "preview.title" })}
      subtitle={intl.formatMessage({ id: "preview.subtitle" })}
      action={<AppButton msgId="preview.export" onClick={exportPNG} />}
      className="mb-5 md:h-[460px] lg:h-[520px]"
    >
      <div className="flex-1">
        <PlateCanvas
          plates={plates}
          img={img}
          renderMode={renderMode}
          onCanvasRef={handleCanvasRef}
          recentlyAdded={recentlyAdded}
          recentlyRemoved={recentlyRemovedId}
        />
      </div>

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
    </AppCard>
  );
}
