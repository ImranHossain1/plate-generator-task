import { useEffect, useRef, useState } from "react";
import usePersistentState from "../../hooks/usePersistentState";
import { DEFAULT_PLATE_CONFIG } from "../../constants/plates";
import useImage from "../../hooks/useImage";
import {
  addPlateHelper,
  computePlateStats,
  exportPNGHelper,
  removePlateHelper,
  resetConfigHelper,
  updatePlateHelper,
} from "../../utils/plates";
import PreviewCard from "../../components/previewLayout/PreviewCard";
import ConfigCard from "../../components/configLayout/ConfigCard";
import { Plate, PlateConfig, Unit, ANIM_S } from "../../utils/types";
import { arrayMove } from "../../utils/helpers";

export default function HomePage() {
  const [cfg, setCfg] = usePersistentState<PlateConfig>(
    "plategen:v1",
    DEFAULT_PLATE_CONFIG
  );
  const { plates, motifUrl } = cfg;
  const { img, error: imgErr } = useImage(motifUrl);

  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(
    plates[0]?.id ?? null
  );
  const [unit, setUnit] = useState<Unit>("cm");
  const [dismissErrorsKey, setDismissErrorsKey] = useState(0);

  useEffect(() => {
    if (!recentlyAdded) return;
    const t = setTimeout(() => setRecentlyAdded(null), ANIM_S * 1000);
    return () => clearTimeout(t);
  }, [recentlyAdded]);

  useEffect(() => {
    if (!plates.find((p) => p.id === activeId)) {
      setActiveId(plates[0]?.id ?? null);
    }
  }, [plates, activeId]);

  const handleReorder = (from: number, to: number) => {
    setCfg((prev) => ({
      ...prev,
      plates: arrayMove(prev.plates, from, to),
    }));
  };

  const { totalWidth, maxHeight } = computePlateStats(plates);

  const updatePlate = (id: string, patch: Partial<Pick<Plate, "w" | "h">>) =>
    setCfg((s) => updatePlateHelper(s, id, patch));

  const addPlate = (afterId?: string) => {
    setCfg((s) => addPlateHelper(s, afterId, setRecentlyAdded));
    setDismissErrorsKey((k) => k + 1);
  };

  const removePlate = (id: string) => {
    removePlateHelper(cfg, id, setCfg);
    setDismissErrorsKey((k) => k + 1);
  };

  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const handleCanvasRef = (c: HTMLCanvasElement | null) => {
    exportCanvasRef.current = c;
  };
  const exportPNG = () => exportPNGHelper(exportCanvasRef.current);

  const resetToDefaults = () => {
    setCfg(resetConfigHelper());
    setDismissErrorsKey((k) => k + 1);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-6 md:grid-cols-[1fr_480px]">
        <div className="min-w-0">
          <PreviewCard
            plates={plates}
            img={img}
            imgErr={imgErr}
            handleCanvasRef={handleCanvasRef}
            recentlyAdded={recentlyAdded}
            exportPNG={exportPNG}
            onReorder={handleReorder}
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
            dismissErrorsKey={dismissErrorsKey}
          />
        </div>
      </div>
    </div>
  );
}
