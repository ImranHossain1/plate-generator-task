import Button from "../ui/Button.jsx";
import { PLATE_LIMITS } from "../../constants/plates.js";

export default function PlatesActions({ plates, addPlate, resetToDefaults }) {
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

      <p className="mt-2 text-xs text-slate-500 text-center md:text-left">
        Limits: width {PLATE_LIMITS.MIN_W}–{PLATE_LIMITS.MAX_W} cm, height{" "}
        {PLATE_LIMITS.MIN_H}–{PLATE_LIMITS.MAX_H} cm, up to{" "}
        {PLATE_LIMITS.MAX_PLATES} plates.
      </p>
    </>
  );
}
