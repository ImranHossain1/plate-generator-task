import React, { forwardRef } from "react";

type TextFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "placeholder" | "className" | "inputMode"
> & {
  label?: React.ReactNode;
  subtitle?: React.ReactNode; // optional helper text if you want it later
  rightAddon?: React.ReactNode;
  className?: string;
  labelClassName?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  type?: React.HTMLInputTypeAttribute;
  value?: string | number | readonly string[];
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
};

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      value,
      onChange,
      placeholder,
      rightAddon,
      inputMode = "text",
      type = "text",
      className = "",
      labelClassName = "",
      ...rest
    },
    ref
  ) => {
    return (
      <label className="block">
        {label && (
          <span
            className={`block text-xs font-medium text-slate-600 mb-1 ${labelClassName}`}
          >
            {label}
          </span>
        )}

        <div className="relative">
          <input
            ref={ref}
            type={type}
            inputMode={inputMode}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full h-9 ${
              rightAddon ? "pr-8" : ""
            } pl-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 ${className}`}
            {...rest}
          />
          {rightAddon && (
            <span className="absolute inset-y-0 right-2 flex items-center text-xs text-slate-500 pointer-events-none">
              {rightAddon}
            </span>
          )}
        </div>
      </label>
    );
  }
);

TextField.displayName = "TextField";
export default TextField;
