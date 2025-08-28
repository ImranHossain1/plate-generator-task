import { useMemo } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import PlateCanvas from "../plates/PlateCanvas";
import Card from "../ui/Card";
import Button from "../ui/Button";
import type { Plate, RenderMode } from "@/constants/plates";

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
    <Card
      title={intl.formatMessage({ id: "preview.title" })}
      subtitle={intl.formatMessage({ id: "preview.subtitle" })}
      right={
        <Button onClick={exportPNG}>
          <FormattedMessage id="preview.export" />
        </Button>
      }
      className="h-[280px] sm:h-[360px] md:h-[460px] lg:h-[520px] flex flex-col"
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
          <div className="text-red-600">{imgErr}</div>
          <div className="text-slate-500 mt-1">
            <FormattedMessage id="preview.url.tip" />
          </div>
        </div>
      )}
    </Card>
  );
}
