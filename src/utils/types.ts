import { ComponentProps } from "react";
import { Card } from "../components/ui/Card";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import { PrimitiveType } from "react-intl";

/* ────────────────────────────────────────────────────────────────────────────
 * Domain types (data model)
 * ────────────────────────────────────────────────────────────────────────── */

/** Supported measurement units across the app. */
export type Unit = "cm" | "inch";

/** A single plate with width/height in "plate pixels" (post-scaling). */
export type Plate = {
  id: string;
  w: number;
  h: number;
};

/** Plate plus optional UI status flags used in lists and preview. */
export type PlateWithStatus = Plate & {
  status?: "active" | "removing" | "idle";
};

/** Persisted app configuration. */
export type PlateConfig = {
  motifUrl: string;
  plates: Plate[];
};

/* ────────────────────────────────────────────────────────────────────────────
 * Geometry / rendering helpers
 * ────────────────────────────────────────────────────────────────────────── */

/** Normalized rectangle used for cover-fit calculations. */
export type CoverRect = { x: number; y: number; w: number; h: number };

/** Canvas `crop` rectangle (Konva/Canvas style). */
export type CropRect = { x: number; y: number; width: number; height: number };

/** Snapshot for the "removed plate" ghost animation. */
export type RemovedGhost = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  crop: CropRect | null;
} | null;

/** Used to trigger subtle grow/shrink animations on resize. */
export type ResizeChange = { id: string; type: "grow" | "shrink" };

/* ────────────────────────────────────────────────────────────────────────────
 * Reusable callbacks
 * ────────────────────────────────────────────────────────────────────────── */

/** Reorder callback: move item at `from` to index `to`. */
export type OnReorder = (from: number, to: number) => void;

/* ────────────────────────────────────────────────────────────────────────────
 * React component prop types
 * ────────────────────────────────────────────────────────────────────────── */

/** DOM props we forward to the Card container (excluding layout-managed ones). */
export type CardDomProps = Omit<
  ComponentProps<typeof Card>,
  "children" | "className"
>;

/** Props for a single plate input field (width/height). */
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

/** Actions row below the plate list (add/reset, etc.). */
export type PlatesActionsProps = {
  plates: Plate[]; // was unknown[] — narrowed for clarity
  addPlate: () => void;
  resetToDefaults: () => void;
  unit: Unit;
  totalWidth: number;
  maxHeight: number;
};

/** Konva preview canvas + DnD overlay. */
export type PlateCanvasProps = {
  plates: Plate[]; // PlateWithStatus is acceptable here as it extends Plate
  img: HTMLImageElement | null;
  onCanvasRef?: (el: HTMLCanvasElement | null) => void;
  onStageRef?: (stage: KonvaStage | null) => void;
  recentlyAdded?: string | null;
  recentlyRemoved?: string | null;
  exportPNG: () => void;
  onReorder?: OnReorder;
};

/** Left-side list of plates with active/removed styling. */
export type PlatesListProps = {
  plates: PlateWithStatus[]; // unified usage of PlateWithStatus
  recentlyAdded?: string | null;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  updatePlate: (id: string, patch: Partial<Pick<Plate, "w" | "h">>) => void;
  removePlate: (id: string) => void;
  unit: Unit;
};

/** Preview card shell that hosts PlateCanvas. */
export type PreviewCardProps = {
  plates: PlateWithStatus[]; // reads p.status internally
  img: HTMLImageElement | null;
  imgErr?: string | null;
  handleCanvasRef?: (el: HTMLCanvasElement | null) => void;
  recentlyAdded?: string | null;
  exportPNG: () => void;
  onReorder?: OnReorder;
};

/** Right-side configuration panel. */
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

/** Motif URL input. */
export type MotifInputProps = {
  motifUrl: string;
  setCfg: React.Dispatch<React.SetStateAction<PlateConfig>>;
};

/** Removed-ghost renderer props. */
export type RemovedGhostProps = {
  ghost: RemovedGhost;
  sourceImg: CanvasImageSource | null;
};

/** A single editable plate row. */
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
};

/* ────────────────────────────────────────────────────────────────────────────
 * UI / layout constants
 * ────────────────────────────────────────────────────────────────────────── */

/** Padding around the Konva stage content (in CSS px). */
export const PAD = 24;
/** Gap between neighboring plates (in plate px). */
export const GAP = 4;
/** Default animation duration (seconds). */
export const ANIM_S = 0.5;
/** Hard cap on stage width to prevent runaway canvases. */
export const MAX_STAGE_WIDTH = 12000;

/* ────────────────────────────────────────────────────────────────────────────
 * Internationalization
 * ────────────────────────────────────────────────────────────────────────── */

export type Locale = "en" | "de";
export type Messages = Record<string, string>;
export type IntlValues = Record<string, PrimitiveType>;
export type ErrorMsg = { id: string; values?: IntlValues } | null;
