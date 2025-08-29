import { FormattedMessage } from "react-intl";
import AppButton from "../../common/AppButton";
import { Input } from "../../ui/input";
import { MotifInputProps } from "../../../utils/types";

export default function MotifInput({ motifUrl, setCfg }: MotifInputProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">
        <FormattedMessage id="config.imageUrl" />
      </label>

      <Input
        type="url"
        placeholder="https://..."
        value={motifUrl}
        onChange={(e) => setCfg((s) => ({ ...s, motifUrl: e.target.value }))}
      />
      <div className="flex gap-2 mt-3">
        <AppButton
          msgId="config.useSample"
          onClick={() =>
            setCfg((s) => ({
              ...s,
              motifUrl:
                "https://rueckwand24.com/cdn/shop/files/Kuechenrueckwand-Kuechenrueckwand-Gruene-frische-Kraeuter-KR-000018-HB.jpg?v=1695288356&width=1200",
            }))
          }
        />

        <span className="text-xs text-slate-500 self-center">
          <FormattedMessage id="preview.url.tip" />
        </span>
      </div>
    </div>
  );
}
