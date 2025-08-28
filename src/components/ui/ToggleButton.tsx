// src/components/ui/ToggleButton.tsx
import React from "react";

export type ToggleOption<T extends string | number = string> = {
  value: T;
  label: React.ReactNode;
};

type ToggleButtonProps<T extends string | number = string> = {
  value: T;
  onChange: (val: T) => void;
  options: ToggleOption<T>[];
  className?: string;
};

export default function ToggleButton<T extends string | number = string>({
  value,
  onChange,
  options,
  className = "",
}: ToggleButtonProps<T>) {
  return (
    <div
      className={`inline-flex rounded-lg border border-slate-300 overflow-hidden ${className}`}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 text-sm ${
            value === opt.value
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-900 hover:bg-slate-100"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
