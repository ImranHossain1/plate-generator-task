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
  return (
    <Card
      title="Visual Preview"
      subtitle="Plates are proportional; the motif spans them continuously."
      right={<Button onClick={exportPNG}>Export PNG</Button>}
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
      {imgErr && <div className="px-1 pt-2 text-sm text-red-600">{imgErr}</div>}
    </Card>
  );
}
