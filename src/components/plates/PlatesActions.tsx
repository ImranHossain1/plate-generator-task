import Button from "../ui/Button";
import { PLATE_LIMITS, type Plate } from "@/constants/plates";

type Unit = "cm" | "inch";

type PlatesActionsProps = {
  plates: Plate[],
  addPlate: () => void,
  resetToDefaults: () => void,
  unit: Unit,
  totalWidth: number, // in cm
  maxHeight: number, // in cm
};

const toUnit = (cm: number, unit: Unit) => (unit === "cm" ? cm : cm / 2.54);

const fmt2 = (n: number) => n.toFixed(2);

export default function PlatesActions({
  plates,
  addPlate,
  resetToDefaults,
  unit,
  totalWidth,
  maxHeight,
}: PlatesActionsProps) {
  const atLimit = plates.length >= PLATE_LIMITS.MAX_PLATES;

  return (
    <>
      <div className="mt-5 flex flex-col gap-2 w-full md:flex-row md:justify-end">
        <Button
          onClick={addPlate}
          disabled={atLimit}
          variant="success"
          className="w-full md:w-auto"
          title={atLimit ? "Maximale Anzahl erreicht" : undefined}
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
        Total width: <b>{fmt2(toUnit(totalWidth, unit))}</b> {unit} · Max
        height: <b>{fmt2(toUnit(maxHeight, unit))}</b> {unit}
      </div>
    </>
  );
}
