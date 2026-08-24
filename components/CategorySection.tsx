"use client";

import type { ReactNode } from "react";

export default function CategorySection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-6">
      <div className="mb-2.5">
        <h2 className="text-balance text-xs font-semibold uppercase tracking-wide text-ink/60">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 max-w-2xl text-xs text-ink/50 text-pretty">{description}</p>
        )}
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(17.5rem,1fr))] items-start gap-2.5">
        {children}
      </div>
    </section>
  );
}
