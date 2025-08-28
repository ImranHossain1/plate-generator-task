import { useEffect, useRef, useState } from "react";
import usePersistentState from "@/hooks/usePersistentState";
import useImage from "@/hooks/useImage";
import {
  DEFAULT_PLATE_CONFIG,
  type Plate,
  type PlateConfig,
  type RenderMode,
} from "@/constants/plates";


import PreviewCard from "@/components/cards/PreviewCard";
import ConfigCard from "@/components/cards/ConfigCard";
import { addPlateHelper, computePlateStats, exportPNGHelper, removePlateHelper, resetConfigHelper, updatePlateHelper } from "@/utils/plates";

type Unit = "cm" | "inch";

export default function HomePage() {
  const [cfg, setCfg] = usePersistentState<PlateConfig>(
    "plategen:v1",
    DEFAULT_PLATE_CONFIG
  );
  const { plates, motifUrl, renderMode } = cfg;

  const { img, error: imgErr } = useImage(motifUrl);

  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(plates[0]?.id ?? null);

  const [unit, setUnit] = useState<Unit>("cm");

  useEffect(() => {
    if (!plates.find((p) => p.id === activeId)) {
      setActiveId(plates[0]?.id ?? null);
    }
  }, [plates, activeId]);

  const { totalWidth, maxHeight } = computePlateStats(plates); // -> { totalWidth: number, maxHeight: number }

  const updatePlate = (id: string, patch: Partial<Pick<Plate, "w" | "h">>) =>
    setCfg((s) => updatePlateHelper(s, id, patch));

  const addPlate = (afterId?: string) =>
    setCfg((s) => addPlateHelper(s, afterId, setRecentlyAdded));

  const removePlate = (id: string) => removePlateHelper(cfg, id, setCfg);

  // Canvas ref for export
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const handleCanvasRef = (c: HTMLCanvasElement | null) => {
    exportCanvasRef.current = c;
  };
  const exportPNG = () => exportPNGHelper(exportCanvasRef.current);

  const resetToDefaults = () => setCfg(resetConfigHelper());

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-6 md:grid-cols-[1fr_480px]">
        {/* Left: Preview */}
        <div className="min-w-0">
          <PreviewCard
            plates={plates}
            img={img}
            imgErr={imgErr}
            renderMode={renderMode as RenderMode}
            handleCanvasRef={handleCanvasRef}
            recentlyAdded={recentlyAdded}
            exportPNG={exportPNG}
          />
        </div>

        {/* Right: Config */}
        <div className="w-full md:w-[480px] md:flex-none">
          <ConfigCard
            plates={plates}
            motifUrl={motifUrl}
            setCfg={setCfg}
            totalWidth={totalWidth}
            maxHeight={maxHeight}
            recentlyAdded={recentlyAdded}
            activeId={activeId}
            setActiveId={setActiveId}
            updatePlate={updatePlate}
            removePlate={removePlate}
            addPlate={addPlate}
            resetToDefaults={resetToDefaults}
            unit={unit}
            setUnit={setUnit}
          />
        </div>
      </div>
    </div>
  );
}
