export default function Button({
  variant = "solid",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-sm transition";
  const styles = {
    solid: "bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300",
    outline:
      "border border-slate-300 hover:bg-slate-50 disabled:opacity-50 text-slate-900",
    subtle: "bg-slate-200 hover:bg-slate-300 text-slate-900",
    danger:
      "border border-rose-300 text-rose-700 hover:bg-rose-100 disabled:opacity-50",
    success:
      "border border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-50",
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props} />
  );
}
