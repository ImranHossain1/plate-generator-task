export default function Card({ title, subtitle, right, children }) {
  return (
    <section className="rounded-2xl bg-white shadow-sm p-3">
      {(title || subtitle || right) && (
        <header className="flex items-start justify-between px-1 pb-2">
          <div>
            {title && (
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            )}
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}
