import { useEffect, useState } from "react";
import PlateRow from "../../components/plates/PlateRow.jsx";
import PlateCanvas from "../../components/plates/PlateCanvas.jsx";
import usePersistentState from "../../hooks/usePersistentState.js";
import useImage from "../../hooks/useImage.js";
import { DEFAULT_PLATE_CONFIG, PLATE_LIMITS } from "../../constants/plates.js";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import SegmentedControl from "../../components/ui/SegmentedControl.jsx";

export default function HomePage() {
  const [cfg, setCfg] = usePersistentState("plategen:v1", DEFAULT_PLATE_CONFIG);
  const { plates, motifUrl, renderMode } = cfg;
  const { img, error: imgErr } = useImage(motifUrl);

  // derived data
  const totalWidth = plates.reduce((s, p) => s + (Number(p.w) || 0), 0);
  const maxHeight = Math.max(1, ...plates.map((p) => Number(p.h) || 0));

  // selection state: which plate is active (shows ranges + mm and dark badge)
  const [activeId, setActiveId] = useState(plates[0]?.id || null);
  useEffect(() => {
    if (!plates.find((p) => p.id === activeId)) {
      setActiveId(plates[0]?.id ?? null);
    }
  }, [plates, activeId]);

  // actions
  const updatePlate = (id, patch) =>
    setCfg((s) => ({
      ...s,
      plates: s.plates.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));

  const addPlate = (afterId) =>
    setCfg((s) => {
      if (s.plates.length >= PLATE_LIMITS.MAX_PLATES) return s;
      const idx = afterId
        ? s.plates.findIndex((p) => p.id === afterId) + 1
        : s.plates.length;
      const next = [...s.plates];
      const newPlate = { id: crypto.randomUUID(), w: 60, h: 100 };
      next.splice(idx, 0, newPlate);
      return { ...s, plates: next };
    });

  const removePlate = (id) =>
    setCfg((s) =>
      s.plates.length <= 1
        ? s
        : { ...s, plates: s.plates.filter((p) => p.id !== id) }
    );

  const movePlate = (id, dir) =>
    setCfg((s) => {
      const i = s.plates.findIndex((p) => p.id === id);
      const j = i + (dir === "left" ? -1 : 1);
      if (i < 0 || j < 0 || j >= s.plates.length) return s;
      const arr = [...s.plates];
      const [it] = arr.splice(i, 1);
      arr.splice(j, 0, it);
      return { ...s, plates: arr };
    });

  let exportCanvasEl = null;
  const handleCanvasRef = (c) => (exportCanvasEl = c);
  const exportPNG = () => {
    if (!exportCanvasEl) return;
    const url = exportCanvasEl.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `plates_${Date.now()}.png`;
    a.click();
  };

  const resetToDefaults = () => setCfg(DEFAULT_PLATE_CONFIG);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card
        title="Visual Preview"
        subtitle="Plates are proportional; the motif spans them continuously."
        right={<Button onClick={exportPNG}>Export PNG</Button>}
      >
        <PlateCanvas
          plates={plates}
          img={img}
          renderMode={renderMode}
          onCanvasRef={handleCanvasRef}
        />
        {imgErr && (
          <div className="px-1 pt-2 text-sm text-red-600">{imgErr}</div>
        )}
      </Card>

      <Card title="Configuration">
        {/* Motif URL */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Motif image URL</label>
          <input
            type="url"
            placeholder="https://..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
            value={motifUrl}
            onChange={(e) =>
              setCfg((s) => ({ ...s, motifUrl: e.target.value }))
            }
          />
          <div className="flex gap-2">
            <Button
              variant="subtle"
              onClick={() =>
                setCfg((s) => ({
                  ...s,
                  motifUrl:
                    "https://rueckwand24.com/cdn/shop/files/Kuechenrueckwand-Kuechenrueckwand-Gruene-frische-Kraeuter-KR-000018-HB.jpg?v=1695288356&width=1200",
                }))
              }
            >
              Use Sample
            </Button>
            <span className="text-xs text-slate-500 self-center">
              Tip: needs a CORS-enabled image URL.
            </span>
          </div>
        </div>

        {/* Render mode */}
        <div className="mt-4">
          <label className="text-sm font-medium block mb-1">Image fit</label>
          <SegmentedControl
            value={renderMode}
            onChange={(val) => setCfg((s) => ({ ...s, renderMode: val }))}
            options={[
              { value: "cover", label: "Cover" },
              { value: "contain", label: "Contain" },
              { value: "tile", label: "Tile" },
            ]}
          />
        </div>

        {/* Plates list */}
        <div className="mt-5">
          <div className="flex items-end justify-between">
            <h3 className="text-base font-medium">Maße. Eingaben</h3>
            <div className="text-xs text-slate-500">
              Total width: <b>{totalWidth.toFixed(2)}</b> cm · Max height:{" "}
              <b>{maxHeight.toFixed(2)}</b> cm
            </div>
          </div>

          <div className="mt-2 space-y-2">
            {plates.map((p, i) => (
              <PlateRow
                key={p.id}
                plate={p}
                index={i}
                isActive={p.id === activeId}
                onSelect={() => setActiveId(p.id)}
                onChange={(patch) => updatePlate(p.id, patch)}
                onRemove={() => removePlate(p.id)}
                onAddAfter={() => addPlate(p.id)}
                canRemove={plates.length > 1}
                canMoveLeft={i > 0}
                canMoveRight={i < plates.length - 1}
                onMoveLeft={() => movePlate(p.id, "left")}
                onMoveRight={() => movePlate(p.id, "right")}
              />
            ))}
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <Button
              onClick={() => addPlate()}
              disabled={plates.length >= PLATE_LIMITS.MAX_PLATES}
              variant="success"
            >
              Rückwand hinzufügen{" "}
              <span aria-hidden className="text-base leading-none">
                +
              </span>
            </Button>
            <Button variant="danger" onClick={resetToDefaults}>
              Zurücksetzen
            </Button>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Limits: width {PLATE_LIMITS.MIN_W}–{PLATE_LIMITS.MAX_W} cm, height{" "}
            {PLATE_LIMITS.MIN_H}–{PLATE_LIMITS.MAX_H} cm, up to{" "}
            {PLATE_LIMITS.MAX_PLATES} plates.
          </p>
        </div>
      </Card>
    </div>
  );
}
