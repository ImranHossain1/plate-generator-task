import { useEffect, useState } from "react";
import { useIntl, type PrimitiveType } from "react-intl";
import PlateField from "./PlateField";
import { parseLocaleNumber } from "../../utils/number";
import { Plate, PLATE_LIMITS } from "../../constants/plates";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/Card";
import AppButton from "../common/AppButton";

type IntlValues = Record<string, PrimitiveType>;
type ErrorMsg = { id: string; values?: IntlValues } | null;
type Unit = "cm" | "inch";

type PlateRowProps = {
  plate: Plate;
  index: number;
  isActive?: boolean;
  onSelect?: () => void;
  onChange: (patch: Partial<Pick<Plate, "w" | "h">>) => void;
  onRemove: () => void;
  canRemove: boolean;
  unit: Unit;
  recentlyAdded?: string | null;
  recentlyRemoved?: string | null;
};

export default function PlateRow({
  plate,
  index,
  isActive = false,
  onSelect = () => {},
  onChange,
  onRemove,
  canRemove,
  unit,
}: PlateRowProps) {
  const intl = useIntl();

  const cmToUnit = (cm: number) =>
    unit === "cm" ? cm : Math.round((cm / 2.54) * 100) / 100;

  const unitToCm = (val: number) => (unit === "cm" ? val : val * 2.54);

  const [wDraft, setWDraft] = useState<string>(String(cmToUnit(plate.w)));
  const [hDraft, setHDraft] = useState<string>(String(cmToUnit(plate.h)));
  const [wError, setWError] = useState<ErrorMsg>(null);
  const [hError, setHError] = useState<ErrorMsg>(null);

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

  useEffect(() => {
    setWError(null);
    setHError(null);
  }, [unit, plate.w, plate.h]);

  const fmt2 = (n: number) =>
    intl.formatNumber(n, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const validate = (
    val: string,
    min: number,
    max: number
  ): { ok: true; numCm: number } | { ok: false; err: ErrorMsg } => {
    const num = parseLocaleNumber(val);
    if (Number.isNaN(num)) {
      return { ok: false, err: { id: "errors.notNumber" } };
    }

    const numCm = parseFloat(unitToCm(num).toFixed(2));
    if (numCm < min || numCm > max) {
      return {
        ok: false,
        err: {
          id: "errors.range",
          values: {
            min: fmt2(cmToUnit(min)),
            max: fmt2(cmToUnit(max)),
            unit: intl.formatMessage({
              id: unit === "cm" ? "units.cm" : "units.inch",
            }),
          },
        },
      };
    }
    return { ok: true, numCm };
  };

  const handleBlurW = () => {
    const res = validate(wDraft, PLATE_LIMITS.MIN_W, PLATE_LIMITS.MAX_W);
    if (!res.ok) {
      setWError(res.err);
      setWDraft(String(cmToUnit(plate.w)));
      return;
    }
    setWError(null);
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
    setHError(null);
    if (res.numCm !== plate.h) onChange({ h: res.numCm });
    setHDraft(String(cmToUnit(res.numCm)));
  };

  const wErrorText = wError
    ? intl.formatMessage({ id: wError.id }, wError.values)
    : "";
  const hErrorText = hError
    ? intl.formatMessage({ id: hError.id }, hError.values)
    : "";

  return (
    <div className="relative">
      {/* Mobile index badge (shadcn Badge) */}
      <Badge
        variant={isActive ? "default" : "outline"}
        className="absolute -top-2 -left-2 z-10 h-5 w-5 select-none items-center justify-center p-0 text-center text-xs font-semibold md:hidden"
      >
        {index + 1}
      </Badge>

      {/* Mobile remove */}
      <div className="absolute -top-2 -right-2 z-10 md:hidden">
        <AppButton
          variant="destructive"
          size="icon"
          className="h-5 w-5 rounded-full p-0 text-xs leading-none"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          disabled={!canRemove}
          title={intl.formatMessage({ id: "plate.remove" })}
          icon="–"
        />
      </div>

      <Card
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect?.()}
        className={`relative shadow-sm transition-colors ${
          isActive ? "ring-1 ring-ring" : ""
        }`}
      >
        <CardContent className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4">
          {/* Desktop index badge */}
          <Badge
            variant={isActive ? "default" : "outline"}
            className="hidden h-9 w-9 select-none items-center justify-center rounded-lg p-0 text-xs font-semibold md:flex"
          >
            {index + 1}
          </Badge>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <PlateField
              label={intl.formatMessage({ id: "plate.width" })}
              min={PLATE_LIMITS.MIN_W}
              max={PLATE_LIMITS.MAX_W}
              draft={wDraft}
              error={wErrorText}
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
              error={hErrorText}
              onChange={(e) => setHDraft(e.target.value)}
              onBlur={handleBlurH}
              isActive={isActive}
              unit={unit}
            />
          </div>

          {/* Desktop remove */}
          <div className="hidden items-center self-center md:flex">
            <AppButton
              variant="destructive"
              size="icon"
              className="h-7 w-7 rounded-full p-0 text-sm leading-none"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              disabled={!canRemove}
              title={intl.formatMessage({ id: "plate.remove" })}
              icon="–"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
