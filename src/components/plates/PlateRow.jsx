import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { parseLocaleNumber } from "../../utils/number.js";
import { PLATE_LIMITS } from "../../constants/plates.js";
import Button from "../ui/Button.jsx";
import PlateField from "./PlateField.jsx";

export default function PlateRow({
  plate,
  index,
  isActive = false,
  onSelect = () => {},
  onChange,
  onRemove,
  canRemove,
  unit,
}) {
  const intl = useIntl();

  // helpers
  const cmToUnit = (cm) =>
    unit === "cm" ? cm : Math.round((cm / 2.54) * 100) / 100;
  const unitToCm = (val) => (unit === "cm" ? val : val * 2.54);

  const [wDraft, setWDraft] = useState(String(cmToUnit(plate.w)));
  const [hDraft, setHDraft] = useState(String(cmToUnit(plate.h)));
  const [wError, setWError] = useState("");
  const [hError, setHError] = useState("");

  // keep drafts in sync if plate values or unit change (inline logic to satisfy exhaustive-deps)
  useEffect(() => {
    const val =
      unit === "cm" ? plate.w : Math.round((plate.w / 2.54) * 100) / 100;
    setWDraft(String(val));
  }, [plate.w, unit]);

  useEffect(() => {
    const val =
      unit === "cm" ? plate.h : Math.round((plate.h / 2.54) * 100) / 100;
    setHDraft(String(val));
  }, [plate.h, unit]);

  // clear stale error strings when unit or plate values change
  useEffect(() => {
    setWError("");
    setHError("");
  }, [unit, plate.w, plate.h]);

  const fmt2 = (n) =>
    intl.formatNumber(n, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const validate = (val, min, max) => {
    const num = parseLocaleNumber(val);
    if (Number.isNaN(num)) {
      return { ok: false, err: intl.formatMessage({ id: "errors.notNumber" }) };
    }

    // compare in cm (internal source of truth)
    const numCm = parseFloat(unitToCm(num).toFixed(2));
    if (numCm < min || numCm > max) {
      return {
        ok: false,
        err: intl.formatMessage(
          { id: "errors.range" },
          {
            min: fmt2(cmToUnit(min)),
            max: fmt2(cmToUnit(max)),
            unit: intl.formatMessage({
              id: unit === "cm" ? "units.cm" : "units.inch",
            }),
          }
        ),
      };
    }
    return { ok: true, numCm };
  };

  const handleBlurW = () => {
    const res = validate(wDraft, PLATE_LIMITS.MIN_W, PLATE_LIMITS.MAX_W);
    if (!res.ok) {
      setWError(res.err);
      setWDraft(String(cmToUnit(plate.w))); // revert to last valid
      return;
    }
    setWError("");
    if (res.numCm !== plate.w) onChange({ w: res.numCm });
    setWDraft(String(cmToUnit(res.numCm)));
  };

  const handleBlurH = () => {
    const res = validate(hDraft, PLATE_LIMITS.MIN_H, PLATE_LIMITS.MAX_H);
    if (!res.ok) {
      setHError(res.err);
      setHDraft(String(cmToUnit(plate.h)));
      return;
    }
    setHError("");
    if (res.numCm !== plate.h) onChange({ h: res.numCm });
    setHDraft(String(cmToUnit(res.numCm)));
  };

  return (
    <div className="relative">
      {/* Mobile-only index badge */}
      <div
        className={`absolute -top-2 -left-2 w-5 h-5 flex items-center justify-center rounded-full text-xs font-semibold select-none md:hidden z-10
        ${
          isActive
            ? "bg-slate-900 text-white"
            : "bg-white text-slate-900 border border-slate-900"
        }`}
      >
        {index + 1}
      </div>

      {/* Mobile-only remove button */}
      <div className="absolute -top-2 -right-2 md:hidden z-10">
        <Button
          variant="danger"
          className="h-5 w-5 rounded-full p-0 text-xs leading-none bg-rose-50"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          disabled={!canRemove}
          title={intl.formatMessage({ id: "plate.remove" })}
        >
          -
        </Button>
      </div>

      <div
        className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-gray-200 bg-gray-100 p-3 shadow-sm relative"
        onClick={onSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
      >
        {/* Desktop index indicator */}
        <div
          className={`hidden md:flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold select-none ${
            isActive
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-900 border border-slate-900"
          }`}
        >
          {index + 1}
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <PlateField
            label={intl.formatMessage({ id: "plate.width" })}
            min={PLATE_LIMITS.MIN_W}
            max={PLATE_LIMITS.MAX_W}
            draft={wDraft}
            error={wError}
            onChange={(e) => setWDraft(e.target.value)}
            onBlur={handleBlurW}
            isActive={isActive}
            unit={unit}
          />
          <PlateField
            label={intl.formatMessage({ id: "plate.height" })}
            min={PLATE_LIMITS.MIN_H}
            max={PLATE_LIMITS.MAX_H}
            draft={hDraft}
            error={hError}
            onChange={(e) => setHDraft(e.target.value)}
            onBlur={handleBlurH}
            isActive={isActive}
            unit={unit}
          />
        </div>

        {/* Desktop remove button */}
        <div className="hidden md:flex items-center gap-1 self-center">
          <Button
            variant="danger"
            className="h-7 w-7 rounded-full p-0 text-sm leading-none bg-rose-50"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            disabled={!canRemove}
            title={intl.formatMessage({ id: "plate.remove" })}
          >
            -
          </Button>
        </div>
      </div>
    </div>
  );
}
