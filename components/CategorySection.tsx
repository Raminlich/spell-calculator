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
    <section className="mb-10">
      <div className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">
          {title}
        </h2>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-ink/50">{description}</p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </section>
  );
}
