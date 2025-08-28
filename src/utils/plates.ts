import type React from "react";
import {
  DEFAULT_PLATE_CONFIG,
  Plate,
  PLATE_LIMITS,
  PlateConfig,
} from "../constants/plates";

/** Optional UI status on a plate (for animations, etc.) */
export type PlateWithStatus = Plate & { status?: "active" | "removing" };

/** Compute derived data for plate configuration */
export function computePlateStats(plates: Array<Plate | PlateWithStatus>) {
  const totalWidth = plates.reduce((s, p) => s + (Number(p.w) || 0), 0);
  const maxHeight = Math.max(1, ...plates.map((p) => Number(p.h) || 0));
  return { totalWidth, maxHeight };
}

/** Update a plate with a patch */
export function updatePlateHelper(
  cfg: PlateConfig,
  id: string,
  patch: Partial<Pick<Plate, "w" | "h">>
): PlateConfig {
  return {
    ...cfg,
    plates: cfg.plates.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  };
}

/** Add a plate after given id (or at end) */
export function addPlateHelper(
  cfg: PlateConfig,
  afterId: string | undefined,
  setRecentlyAdded: (id: string | null) => void
): PlateConfig {
  if (cfg.plates.length >= PLATE_LIMITS.MAX_PLATES) return cfg;

  // default index = append at end
  let idx = cfg.plates.length;

  if (afterId) {
    const found = cfg.plates.findIndex((p) => p.id === afterId);
    if (found >= 0) {
      idx = found + 1; // insert right after the given id
    }
  }

  const next = [...cfg.plates];
  const newPlate: PlateWithStatus = {
    id: crypto.randomUUID(),
    w: 60,
    h: 100,
    status: "active",
  };
  next.splice(idx, 0, newPlate);

  setRecentlyAdded(newPlate.id);
  window.setTimeout(() => setRecentlyAdded(null), 500);

  return { ...cfg, plates: next };
}

export function removePlateHelper(
  cfg: PlateConfig & { plates: PlateWithStatus[] },
  id: string,
  setCfg: React.Dispatch<
    React.SetStateAction<PlateConfig & { plates: PlateWithStatus[] }>
  >
): void {
  // mark as removing
  setCfg({
    ...cfg,
    plates: cfg.plates.map((p) =>
      p.id === id ? { ...p, status: "removing" } : p
    ),
  });

  // cleanup after animation delay
  window.setTimeout(() => {
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
export function exportPNGHelper(canvasEl: HTMLCanvasElement | null): void {
  if (!canvasEl) return;
  const url = canvasEl.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = `plates_${Date.now()}.png`;
  a.click();
}

/** Reset to default config (adds UI status) */
export function resetConfigHelper(): PlateConfig & {
  plates: PlateWithStatus[];
} {
  return {
    ...DEFAULT_PLATE_CONFIG,
    plates: DEFAULT_PLATE_CONFIG.plates.map((p) => ({
      ...p,
      status: "active",
    })),
  };
}
