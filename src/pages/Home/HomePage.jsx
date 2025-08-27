import { useEffect, useState } from "react";
import usePersistentState from "../../hooks/usePersistentState.js";
import useImage from "../../hooks/useImage.js";
import { DEFAULT_PLATE_CONFIG } from "../../constants/plates.js";
import {
  computePlateStats,
  updatePlateHelper,
  addPlateHelper,
  removePlateHelper,
  exportPNGHelper,
  resetConfigHelper,
} from "../../utils/plates.js";

import PreviewCard from "../../components/cards/PreviewCard.jsx";
import ConfigCard from "../../components/cards/ConfigCard.jsx";

export default function HomePage() {
  const [cfg, setCfg] = usePersistentState("plategen:v1", DEFAULT_PLATE_CONFIG);
  const { plates, motifUrl, renderMode } = cfg;
  const { img, error: imgErr } = useImage(motifUrl);

  const [recentlyAdded, setRecentlyAdded] = useState(null);
  const [activeId, setActiveId] = useState(plates[0]?.id || null);

  const [unit, setUnit] = useState("cm"); // "cm" | "inch"

  useEffect(() => {
    if (!plates.find((p) => p.id === activeId)) {
      setActiveId(plates[0]?.id ?? null);
    }
  }, [plates, activeId]);

  const { totalWidth, maxHeight } = computePlateStats(plates);

  const updatePlate = (id, patch) =>
    setCfg((s) => updatePlateHelper(s, id, patch));

  const addPlate = (afterId) =>
    setCfg((s) => addPlateHelper(s, afterId, setRecentlyAdded));

  const removePlate = (id) => removePlateHelper(cfg, id, setCfg);

  let exportCanvasEl = null;
  const handleCanvasRef = (c) => (exportCanvasEl = c);
  const exportPNG = () => exportPNGHelper(exportCanvasEl);

  const resetToDefaults = () => setCfg(resetConfigHelper());

  return (
    <div className="mx-auto max-w-7xl">
      {/* Preview grows (min-w-0 so it can overflow), Card column does not shrink */}
      <div className="grid gap-6 md:grid-cols-[1fr_480px]">
        {/* Left: Preview */}
        <div className="min-w-0">
          <PreviewCard
            plates={plates}
            img={img}
            imgErr={imgErr}
            renderMode={renderMode}
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
