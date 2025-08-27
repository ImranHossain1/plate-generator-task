import { useIntl, FormattedMessage } from "react-intl";
import PlateCanvas from "../plates/PlateCanvas.jsx";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";

export default function PreviewCard({
  plates,
  img,
  imgErr,
  renderMode,
  handleCanvasRef,
  recentlyAdded,
  exportPNG,
}) {
  const intl = useIntl();

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
          recentlyRemoved={plates.find((p) => p.status === "removing")?.id}
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
