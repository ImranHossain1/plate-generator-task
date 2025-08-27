export default function TextField({
  label,
  value,
  onChange,
  placeholder,
  rightAddon, // e.g., "cm"
  inputMode = "text",
  type = "text",
  className = "",
  labelClassName = "",
  ...rest
}) {
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
