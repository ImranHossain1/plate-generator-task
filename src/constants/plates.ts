export const PLATE_LIMITS = {
  MIN_W: 20,
  MAX_W: 300,
  MIN_H: 30,
  MAX_H: 128,
  MAX_PLATES: 10,
} as const;

export type Plate = {
  id: string;
  w: number;
  h: number;
};

export type PlateConfig = {
  motifUrl: string;
  plates: Plate[];
};

export const DEFAULT_PLATE_CONFIG: PlateConfig = {
  motifUrl:
    "https://rueckwand24.com/cdn/shop/files/Kuechenrueckwand-Kuechenrueckwand-Gruene-frische-Kraeuter-KR-000018-HB.jpg?v=1695288356&width=1200",
  plates: [
    { id: crypto.randomUUID(), w: 60, h: 100 },
    { id: crypto.randomUUID(), w: 60, h: 100 },
    { id: crypto.randomUUID(), w: 60, h: 100 },
  ],
};
