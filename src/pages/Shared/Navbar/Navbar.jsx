import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="border-b bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <NavLink to="/" className="font-semibold tracking-tight">
          Plate Generator
        </NavLink>
        <nav className="text-sm text-slate-600">React + Tailwind</nav>
      </div>
    </header>
  );
};

export default Navbar;
