import type React from "react";
import { DEFAULT_PLATE_CONFIG, PLATE_LIMITS } from "../constants/plates";
import { Plate, PlateConfig } from "./types";

export type PlateWithStatus = Plate & { status?: "active" | "removing" };

export function computePlateStats(plates: Array<Plate | PlateWithStatus>) {
  const totalWidth = plates.reduce((s, p) => s + (Number(p.w) || 0), 0);
  const maxHeight = Math.max(1, ...plates.map((p) => Number(p.h) || 0));
  return { totalWidth, maxHeight };
}

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

export function addPlateHelper(
  cfg: PlateConfig,
  afterId: string | undefined,
  setRecentlyAdded: (id: string | null) => void
): PlateConfig {
  if (cfg.plates.length >= PLATE_LIMITS.MAX_PLATES) return cfg;

  let idx = cfg.plates.length;

  if (afterId) {
    const found = cfg.plates.findIndex((p) => p.id === afterId);
    if (found >= 0) {
      idx = found + 1;
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
  setCfg({
    ...cfg,
    plates: cfg.plates.map((p) =>
      p.id === id ? { ...p, status: "removing" } : p
    ),
  });

  window.setTimeout(() => {
    setCfg((s) => ({
      ...s,
      plates:
        s.plates.length <= 1 ? s.plates : s.plates.filter((p) => p.id !== id),
    }));
  }, 500);
}

export function exportPNGHelper(canvasEl: HTMLCanvasElement | null): void {
  if (!canvasEl) return;
  const url = canvasEl.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = `plates_${Date.now()}.png`;
  a.click();
}

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
