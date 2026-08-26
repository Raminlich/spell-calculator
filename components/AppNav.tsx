"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSpellConfig } from "@/components/SpellConfigContext";

const links = [
  { href: "/", label: "Calculator" },
  { href: "/components", label: "Components" },
  { href: "/builder", label: "Builder" },
] as const;

export default function AppNav() {
  const pathname = usePathname();
  const { resetAll } = useSpellConfig();

  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
      <div>
        <p className="text-xl font-semibold tracking-tight">Spell Calculator</p>
        <nav className="mt-3 flex flex-wrap gap-1" aria-label="Primary">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-ink text-paper"
                    : "text-ink/60 hover:bg-line/50 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <button
        type="button"
        onClick={resetAll}
        className="rounded border border-line px-3 py-1.5 text-xs font-medium text-ink/60 hover:border-ink/30 hover:text-ink"
      >
        Reset to defaults
      </button>
    </header>
  );
}
