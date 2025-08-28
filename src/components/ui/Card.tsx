// src/components/ui/Card.tsx
import React from "react";

type CardProps = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
};

export default function Card({ title, subtitle, right, children }: CardProps) {
  return (
    <section className="rounded-2xl bg-white p-3">
      {(title || subtitle || right) && (
        <header className="flex items-start justify-between pb-2">
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
