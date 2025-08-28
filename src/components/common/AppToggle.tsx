import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

type Option<T extends string> = {
  value: T;
  label: React.ReactNode;
  ariaLabel?: string;
};

type ToggleProps<T extends string> = {
  value: T;
  onChange: (v: T) => void;
  options: Option<T>[];
  ariaLabel?: string;
  className?: string;
  itemClassName?: string;
  rounded?: boolean; // pill style
};

export default function AppToggle<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
  itemClassName,
  rounded = true,
}: ToggleProps<T>) {
  // Narrow unknown string from ToggleGroup to T using provided options
  const isValid = React.useCallback(
    (v: string): v is T => options.some((o) => o.value === (v as T)),
    [options]
  );

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v && isValid(v)) onChange(v);
      }}
      aria-label={ariaLabel}
      className={["border", rounded ? "rounded-md" : "", className ?? ""]
        .join(" ")
        .trim()}
    >
      {options.map(({ value: val, label, ariaLabel: itemAria }, i) => (
        <ToggleGroupItem
          key={`${String(val)}-${i}`}
          value={val}
          aria-label={
            itemAria ?? (typeof label === "string" ? label : undefined)
          }
          className={[
            "px-3",
            rounded ? "first:rounded-l-md last:rounded-r-md" : "",
            "data-[state=on]:bg-black data-[state=on]:text-white",
            "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            itemClassName ?? "",
          ].join(" ")}
        >
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
