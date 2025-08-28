// src/components/plates/PlateField.tsx
import React from "react";
import TextField from "../ui/TextField"; // if your file is TextField.tsx
import { parseLocaleNumber } from "@/utils/number";
// If still JS for now, you can keep: import TextField from "../ui/TextField.jsx";

type Unit = "cm" | "inch";

type PlateFieldProps = {
  label: React.ReactNode,
  min: number, // boundaries in cm
  max: number, // boundaries in cm
  draft: string, // controlled input value as text
  error?: string | null,
  onChange: React.ChangeEventHandler<HTMLInputElement>,
  onBlur?: React.FocusEventHandler<HTMLInputElement>,
  isActive?: boolean,
  unit: Unit,
};

export default function PlateField({
  label,
  min,
  max,
  draft,
  error,
  onChange,
  onBlur,
  isActive = false,
  unit,
}: PlateFieldProps) {
  const cmToMmLabel = (val: string) => {
    const num = parseLocaleNumber(val);
    if (Number.isNaN(num)) return null;
    const cm = unit === "cm" ? num : num * 2.54;
    const mm = cm * 10;
    return Number.isInteger(mm) ? String(mm) : mm.toFixed(1);
  };

  const toInch2 = (cm: number) => (cm / 2.54).toFixed(2);

  const mm = cmToMmLabel(draft);

  return (
    <div>
      {isActive && (
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-xs font-medium text-slate-600">{label}</span>
          <span className="text-[10px] text-slate-400">
            {unit === "cm"
              ? `${min} – ${max} cm`
              : `${toInch2(min)} – ${toInch2(max)} inch`}
          </span>
        </div>
      )}

      <TextField
        label={null}
        value={draft}
        onChange={onChange}
        onBlur={onBlur}
        inputMode="decimal"
        rightAddon={unit}
        className="rounded-lg"
      />

      <div className="mt-1">
        {error ? (
          <div className="text-xs text-red-600">{error}</div>
        ) : (
          isActive &&
          mm && (
            <div className="text-[10px] text-slate-400 text-center">
              {mm} mm
            </div>
          )
        )}
      </div>
    </div>
  );
}
