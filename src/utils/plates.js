import { DEFAULT_PLATE_CONFIG, PLATE_LIMITS } from "../constants/plates.js";

/** Compute derived data for plate configuration */
export function computePlateStats(plates) {
  const totalWidth = plates.reduce((s, p) => s + (Number(p.w) || 0), 0);
  const maxHeight = Math.max(1, ...plates.map((p) => Number(p.h) || 0));
  return { totalWidth, maxHeight };
}

/** Update a plate with a patch */
export function updatePlateHelper(cfg, id, patch) {
  return {
    ...cfg,
    plates: cfg.plates.map((p) =>
      p.id === id ? { ...p, ...patch } : p
    ),
  };
}

/** Add a plate after given id (or at end) */
export function addPlateHelper(cfg, afterId, setRecentlyAdded) {
  if (cfg.plates.length >= PLATE_LIMITS.MAX_PLATES) return cfg;

  const idx = afterId
    ? cfg.plates.findIndex((p) => p.id === afterId) + 1
    : cfg.plates.length;

  const next = [...cfg.plates];
  const newPlate = {
    id: crypto.randomUUID(),
    w: 60,
    h: 100,
    status: "active",
  };
  next.splice(idx, 0, newPlate);

  setRecentlyAdded(newPlate.id);
  setTimeout(() => setRecentlyAdded(null), 500);

  return { ...cfg, plates: next };
}

/** Mark a plate for removal (and remove after delay) */
export function removePlateHelper(cfg, id, setCfg) {
  // mark as removing
  setCfg({
    ...cfg,
    plates: cfg.plates.map((p) =>
      p.id === id ? { ...p, status: "removing" } : p
    ),
  });

  // cleanup after animation delay
  setTimeout(() => {
    setCfg((s) => ({
      ...s,
      plates:
        s.plates.length <= 1
          ? s.plates // never remove last plate
          : s.plates.filter((p) => p.id !== id),
    }));
  }, 500);
}

/** Export canvas as PNG */
export function exportPNGHelper(canvasEl) {
  if (!canvasEl) return;
  const url = canvasEl.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = `plates_${Date.now()}.png`;
  a.click();
}

/** Reset to default config */
export function resetConfigHelper() {
  return {
    ...DEFAULT_PLATE_CONFIG,
    plates: DEFAULT_PLATE_CONFIG.plates.map((p) => ({
      ...p,
      status: "active",
    })),
  };
}
