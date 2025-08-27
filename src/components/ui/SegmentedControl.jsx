export default function SegmentedControl({ value, onChange, options = [] }) {
  return (
    <div className="inline-flex rounded-xl border border-slate-300 overflow-hidden">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={
              "px-3 py-1.5 text-sm border-r last:border-r-0 " +
              (active
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-900 hover:bg-slate-50")
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
