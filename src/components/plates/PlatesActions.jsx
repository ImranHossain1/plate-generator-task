import { FormattedMessage, FormattedNumber } from "react-intl";
import Button from "../ui/Button.jsx";
import { PLATE_LIMITS } from "../../constants/plates.js";

export default function PlatesActions({
  plates,
  addPlate,
  resetToDefaults,
  unit,
  totalWidth,
  maxHeight,
}) {
  return (
    <>
      <div className="mt-5 flex flex-col gap-2 w-full md:flex-row md:justify-end">
        <Button
          onClick={() => addPlate()}
          disabled={plates.length >= PLATE_LIMITS.MAX_PLATES}
          variant="success"
          className="w-full md:w-auto"
        >
          <FormattedMessage id="config.add" />{" "}
          <span aria-hidden className="text-base leading-none">
            +
          </span>
        </Button>

        <Button
          variant="danger"
          onClick={resetToDefaults}
          className="w-full mt-2 md:mt-0 md:w-auto"
        >
          <FormattedMessage id="config.reset" />
        </Button>
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
