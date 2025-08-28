import { ComponentProps } from "react";
import { Card } from "../components/ui/Card";
import { Plate, PlateConfig } from "../constants/plates";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import { Button } from "../components/ui/Button";

/* ─── DOMAIN / DATA TYPES ── */

export type Unit = "cm" | "inch";
export type PlateWithStatus = Plate & { status?: "active" | "removing" };
export type CoverRect = { x: number; y: number; w: number; h: number };
export type CropRect = { x: number; y: number; width: number; height: number };

export type RemovedGhost = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  crop: CropRect | null;
} | null;

export type ResizeChange = { id: string; type: "grow" | "shrink" };

/* ─── REACT COMPONENT PROPS TYPES ───── */
export type CardDomProps = Omit<
  React.ComponentProps<typeof Card>,
  "children" | "className"
>;

export type PlateFieldProps = {
  label: React.ReactNode;
  min: number;
  max: number;
  draft: string;
  error?: string | null;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  isActive?: boolean;
  unit: Unit;
};

export type PlatesActionsProps = {
  plates: unknown[];
  addPlate: () => void;
  resetToDefaults: () => void;
  unit: Unit;
  totalWidth: number;
  maxHeight: number;
};

export type PlateCanvasProps = {
  plates: Plate[];
  img: HTMLImageElement | null;
  onCanvasRef?: (el: HTMLCanvasElement | null) => void;
  onStageRef?: (stage: KonvaStage | null) => void;
  recentlyAdded?: string | null;
  recentlyRemoved?: string | null;
  exportPNG: () => void;
};

export type PlatesListProps = {
  plates: (Plate & { status?: "removing" | "idle" })[];
  recentlyAdded?: string | null;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  updatePlate: (id: string, patch: Partial<Pick<Plate, "w" | "h">>) => void;
  removePlate: (id: string) => void;
  unit: Unit;
};

export type PreviewCardProps = {
  plates: PlateWithStatus[];
  img: HTMLImageElement | null;
  imgErr: string;
  handleCanvasRef: (c: HTMLCanvasElement | null) => void;
  recentlyAdded: string | null;
  exportPNG: () => void;
};

export type ConfigCardProps = {
  plates: Plate[];
  motifUrl: string;
  setCfg: React.Dispatch<React.SetStateAction<PlateConfig>>;
  totalWidth: number;
  maxHeight: number;
  recentlyAdded?: string | null;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  updatePlate: (id: string, patch: Partial<Pick<Plate, "w" | "h">>) => void;
  removePlate: (id: string) => void;
  addPlate: () => void;
  resetToDefaults: () => void;
  unit: Unit;
  setUnit: (u: Unit) => void;
};

export type MotifInputProps = {
  motifUrl: string;
  setCfg: React.Dispatch<React.SetStateAction<PlateConfig>>;
};

export type RemovedGhostProps = {
  ghost: RemovedGhost;
  sourceImg: CanvasImageSource | null;
};

/* ─── CONSTANTS (UI / LAYOUT CONFIG) ─── */
export const PAD = 24;
export const GAP = 4;
export const ANIM_S = 0.5;
export const MAX_STAGE_WIDTH = 12000;

/* ─── INTERNATIONALIZATION / LOCALE ──── */
export type Locale = "en" | "de";
export type Messages = Record<string, string>;
