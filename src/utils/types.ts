import { ComponentProps } from "react";
import { Card } from "../components/ui/Card";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import { PrimitiveType } from "react-intl";
import Konva from "konva";

/* ────────────────────────────────────────────────────────────────────────────
 * Domain types (data model)
 * ────────────────────────────────────────────────────────────────────────── */

export type Unit = "cm" | "inch";

export type Plate = {
  id: string;
  w: number;
  h: number;
};

export type PlateBlockProps = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  crop: CropRect | null;
  sourceImg: CanvasImageSource | null;
  onRef: (node: Konva.Group | null) => void;
};
export type PlateWithStatus = Plate & {
  status?: "active" | "removing" | "idle";
};

export type PlateConfig = {
  motifUrl: string;
  plates: Plate[];
};

/* ────────────────────────────────────────────────────────────────────────────
 * Geometry / rendering helpers
 * ────────────────────────────────────────────────────────────────────────── */

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

/** Absolute rect for each plate used by the DnD overlay. */
export type PlateRect = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

/* ────────────────────────────────────────────────────────────────────────────
 * Reusable callbacks
 * ────────────────────────────────────────────────────────────────────────── */

export type OnReorder = (from: number, to: number) => void;

/* ────────────────────────────────────────────────────────────────────────────
 * React component prop types
 * ────────────────────────────────────────────────────────────────────────── */

export type CardDomProps = Omit<
  ComponentProps<typeof Card>,
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
  plates: Plate[];
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
  onReorder?: OnReorder;
};

export type PlatesListProps = {
  plates: PlateWithStatus[];
  recentlyAdded?: string | null;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  updatePlate: (id: string, patch: Partial<Pick<Plate, "w" | "h">>) => void;
  removePlate: (id: string) => void;
  unit: Unit;
  dismissErrorsKey?: number;
};

export type PreviewCardProps = {
  plates: PlateWithStatus[];
  img: HTMLImageElement | null;
  imgErr?: string | null;
  handleCanvasRef?: (el: HTMLCanvasElement | null) => void;
  recentlyAdded?: string | null;
  exportPNG: () => void;
  onReorder?: OnReorder;
};

/** Props for the DnD overlay component. */
export type ReorderLayerProps = {
  plateRects: PlateRect[];
  gapXs: number[];
  stageWidth: number;
  stageHeight: number;
  dragHandle?: "full" | "edge";
  onReorder?: OnReorder;
  scale?: number;
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
  dismissErrorsKey?: number;
};

export type MotifInputProps = {
  motifUrl: string;
  setCfg: React.Dispatch<React.SetStateAction<PlateConfig>>;
};

export type RemovedGhostProps = {
  ghost: RemovedGhost;
  sourceImg: CanvasImageSource | null;
};

export type PlateRowProps = {
  plate: Plate;
  index: number;
  isActive?: boolean;
  onSelect?: () => void;
  onChange: (patch: Partial<Pick<Plate, "w" | "h">>) => void;
  onRemove: () => void;
  canRemove: boolean;
  unit: Unit;
  recentlyAdded?: string | null;
  recentlyRemoved?: string | null;
  dismissErrorsKey?: number;
};

/* ────────────────────────────────────────────────────────────────────────────
 * UI / layout constants
 * ────────────────────────────────────────────────────────────────────────── */

export const PAD = 24;
export const GAP = 4;
export const ANIM_S = 0.5;
export const MAX_STAGE_WIDTH = 12000;

/* ────────────────────────────────────────────────────────────────────────────
 * Internationalization
 * ────────────────────────────────────────────────────────────────────────── */

export type Locale = "en" | "de";
export type Messages = Record<string, string>;
export type IntlValues = Record<string, PrimitiveType>;
export type ErrorMsg = { id: string; values?: IntlValues } | null;
