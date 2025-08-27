import { FormattedMessage } from "react-intl";
import Button from "../ui/Button.jsx";

export default function MotifInput({ motifUrl, setCfg }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">
        <FormattedMessage id="config.imageUrl" />
      </label>

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
          <FormattedMessage id="config.useSample" />
        </Button>

        <span className="text-xs text-slate-500 self-center">
          <FormattedMessage id="preview.url.tip" />
        </span>
      </div>
    </div>
  );
}
