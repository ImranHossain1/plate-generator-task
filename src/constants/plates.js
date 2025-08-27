export const PLATE_LIMITS = {
  MIN_W: 20,
  MAX_W: 300,
  MIN_H: 30,
  MAX_H: 128,
  MAX_PLATES: 10,
};

export const DEFAULT_PLATE_CONFIG = {
  motifUrl:
    "https://rueckwand24.com/cdn/shop/files/Kuechenrueckwand-Kuechenrueckwand-Gruene-frische-Kraeuter-KR-000018-HB.jpg?v=1695288356&width=1200",
  renderMode: "cover", 
  plates: [
    { id: crypto.randomUUID(), w: 60, h: 100 },
    { id: crypto.randomUUID(), w: 60, h: 100 },
    { id: crypto.randomUUID(), w: 60, h: 100 },
  ],
};
