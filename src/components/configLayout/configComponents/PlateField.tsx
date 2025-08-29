import { parseLocaleNumber } from "../../../utils/number";
import { Label } from "@radix-ui/react-label";
import { Input } from "../../ui/input";
import { PlateFieldProps } from "../../../utils/types";
import { useIntl } from "react-intl";

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
  const intl = useIntl();

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
        <div className="mb-1 flex items-baseline justify-between">
          <Label className="text-xs font-medium text-foreground/80">
            {label}
          </Label>
          <span className="text-[10px] text-muted-foreground">
            {unit === "cm"
              ? `${min} – ${max} ${intl.formatMessage({ id: "units.cm" })}`
              : `${toInch2(min)} – ${toInch2(max)} ${intl.formatMessage({
                  id: "units.inch",
                })}`}
          </span>
        </div>
      )}

      <div className="relative">
        <Input
          value={draft}
          onChange={onChange}
          onBlur={onBlur}
          inputMode="decimal"
          className={[
            "rounded-lg pr-14",
            error ? "border-destructive focus-visible:ring-destructive" : "",
          ].join(" ")}
          aria-invalid={!!error}
          aria-describedby={error ? "platefield-error" : undefined}
        />
        <span
          className="pointer-events-none absolute inset-y-0 right-0 grid place-items-center
                     rounded-r-lg border-l bg-muted px-3 text-xs text-muted-foreground"
        >
          {intl.formatMessage({ id: `units.${unit}` })}
        </span>
      </div>

      <div className="mt-1">
        {error ? (
          <p id="platefield-error" className="text-xs text-destructive">
            {error}
          </p>
        ) : (
          isActive &&
          mm && (
            <p className="text-center text-[10px] text-muted-foreground">
              {mm} {intl.formatMessage({ id: "units.mm" })}
            </p>
          )
        )}
      </div>
    </div>
  );
}
