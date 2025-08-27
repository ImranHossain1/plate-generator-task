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
          Rückwand hinzufügen{" "}
          <span aria-hidden className="text-base leading-none">
            +
          </span>
        </Button>
        <Button
          variant="danger"
          onClick={resetToDefaults}
          className="w-full mt-2 md:mt-0 md:w-auto"
        >
          Zurücksetzen
        </Button>
      </div>

      <div className="mt-2 text-xs text-slate-500 text-center md:text-left">
        Total width:{" "}
        <b>
          {unit === "cm"
            ? totalWidth.toFixed(2)
            : (totalWidth / 2.54).toFixed(2)}
        </b>{" "}
        {unit} · Max height:{" "}
        <b>
          {unit === "cm" ? maxHeight.toFixed(2) : (maxHeight / 2.54).toFixed(2)}
        </b>{" "}
        {unit}
      </div>
    </>
  );
}
