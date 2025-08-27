export default function ToggleButton({ value, onChange, options }) {
  return (
    <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.value}
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
