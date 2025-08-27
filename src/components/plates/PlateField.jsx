import TextField from "../ui/TextField.jsx";
import { parseLocaleNumber } from "../../utils/number.js";

export default function PlateField({
  label,
  min,
  max,
  draft,
  error,
  onChange,
  onBlur,
  isActive,
}) {
  const cmToMmLabel = (val) => {
    const num = parseLocaleNumber(val);
    if (Number.isNaN(num)) return null;
    const mm = num * 10;
    return Number.isInteger(mm) ? String(mm) : mm.toFixed(1);
  };

  const mm = cmToMmLabel(draft);

  return (
    <div>
      {isActive && (
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-xs font-medium text-slate-600">{label}</span>
          <span className="text-[10px] text-slate-400">
            {min} – {max} cm
          </span>
        </div>
      )}

      <TextField
        label={null}
        value={draft}
        onChange={onChange}
        onBlur={onBlur}
        inputMode="decimal"
        rightAddon="cm"
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
