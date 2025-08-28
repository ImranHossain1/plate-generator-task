import { FormattedMessage, FormattedNumber } from "react-intl";
import { PLATE_LIMITS } from "../../constants/plates";
import AppButton from "../common/AppButton";

type Unit = "cm" | "inch";

type PlatesActionsProps = {
  plates: unknown[];
  addPlate: () => void;
  resetToDefaults: () => void;
  unit: Unit;
  totalWidth: number;
  maxHeight: number;
};

export default function PlatesActions({
  plates,
  addPlate,
  resetToDefaults,
  unit,
  totalWidth,
  maxHeight,
}: PlatesActionsProps) {
  const atMax = plates.length >= PLATE_LIMITS.MAX_PLATES;

  return (
    <>
      <div className="mt-5 flex flex-col gap-2 w-full md:flex-row md:justify-end">
        <AppButton
          msgId="config.add"
          onClick={addPlate}
          disabled={atMax}
          variant="success"
          icon={
            <span aria-hidden className="text-base leading-none">
              +
            </span>
          }
        />

        <AppButton
          msgId="config.reset"
          onClick={resetToDefaults}
          variant="destructive"
        />
      </div>

      <div className="mt-2 text-xs text-slate-500 text-center md:text-left">
        <FormattedMessage id="config.total" />:{" "}
        <b>
          <FormattedNumber
            value={unit === "cm" ? totalWidth : totalWidth / 2.54}
            minimumFractionDigits={2}
            maximumFractionDigits={2}
          />
        </b>{" "}
        <FormattedMessage id={unit === "cm" ? "units.cm" : "units.inch"} /> ·{" "}
        <FormattedMessage id="config.maxHeight" />:{" "}
        <b>
          <FormattedNumber
            value={unit === "cm" ? maxHeight : maxHeight / 2.54}
            minimumFractionDigits={2}
            maximumFractionDigits={2}
          />
        </b>{" "}
        <FormattedMessage id={unit === "cm" ? "units.cm" : "units.inch"} />
      </div>
    </>
  );
}
