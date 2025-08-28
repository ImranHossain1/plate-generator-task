import React from "react";
import Button from "../ui/Button";
import type { PlateConfig } from "@/constants/plates";

type MotifInputProps = {
  motifUrl: string;
  setCfg: React.Dispatch<React.SetStateAction<PlateConfig>>;
};

export default function MotifInput({ motifUrl, setCfg }: MotifInputProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">Motif image URL</label>
      <input
        type="url"
        placeholder="https://..."
        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
        value={motifUrl}
        onChange={(e) => setCfg((s) => ({ ...s, motifUrl: e.target.value }))}
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
  );
}
