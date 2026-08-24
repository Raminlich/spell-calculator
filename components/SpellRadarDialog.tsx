"use client";

import { useEffect, useRef } from "react";
import type { GlobalConfig, SpellCombo } from "@/lib/types";
import type { RadarMetric } from "@/lib/radarMetrics";
import { scoreSpellRadar } from "@/lib/radarScore";
import SpellRadarChart from "@/components/SpellRadarChart";

function modifierSummary(combo: SpellCombo): string {
  if (combo.modifierList.length === 0) return "None";
  return combo.modifierList
    .map(({ modifier, count }) =>
      count > 1 ? `${modifier.name}×${count}` : modifier.name
    )
    .join(", ");
}

export default function SpellRadarDialog({
  combo,
  config,
  radarMetrics,
  open,
  onClose,
}: {
  combo: SpellCombo | null;
  config: GlobalConfig;
  radarMetrics: RadarMetric[];
  open: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const radar = combo ? scoreSpellRadar(combo, config, radarMetrics) : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && combo) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open, combo]);

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="fixed left-1/2 top-1/2 m-0 w-[min(100%,28rem)] max-h-[min(100%,90vh)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded border border-line bg-surface p-0 text-ink shadow-lg backdrop:bg-ink/40"
    >
      {combo && radar && (
        <div className="flex flex-col">
          <div className="border-b border-line px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink/45">
                  Spell identity
                </p>
                <h2 className="mt-0.5 truncate text-base font-semibold tracking-tight">
                  {combo.label}
                </h2>
                <p className="mt-1 text-xs text-ink/60">
                  {combo.noun.name} · {combo.delivery.name}
                </p>
                <p className="mt-0.5 text-xs text-ink/50">
                  Modifiers: {modifierSummary(combo)}
                </p>
              </div>
              <form method="dialog">
                <button
                  type="submit"
                  aria-label="Close"
                  className="rounded border border-line px-2 py-1 text-xs font-medium text-ink/55 hover:border-ink/30 hover:text-ink"
                >
                  Close
                </button>
              </form>
            </div>
            <p className="mt-3 font-mono text-sm text-ink/80">
              Score{" "}
              <span className="font-semibold text-ink">
                {radar.totalScore.toFixed(1)}
              </span>
              <span className="text-ink/45">
                {" "}
                / {radar.maxTotalScore.toFixed(0)}
              </span>
              <span className="ml-2 text-xs text-ink/45">
                ({(radar.normalizedTotal * 100).toFixed(0)}%)
              </span>
            </p>
          </div>

          <div className="px-3 py-4">
            <SpellRadarChart axes={radar.axes} />
          </div>

          <div className="border-t border-line px-4 py-3">
            <ul className="grid gap-2 sm:grid-cols-2">
              {radar.axes.map((axis) => (
                <li
                  key={axis.id}
                  className="rounded border border-line/80 px-2.5 py-2"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-medium text-ink/75">
                      {axis.label}
                    </span>
                    <span className="font-mono text-[11px] text-ink/55">
                      {axis.score.toFixed(1)}/{axis.maxWeight}
                    </span>
                  </div>
                  <ul className="mt-1.5 space-y-0.5">
                    {axis.metrics.map((m) => (
                      <li
                        key={m.label}
                        className="flex justify-between gap-2 text-[11px] text-ink/50"
                      >
                        <span>{m.label}</span>
                        <span className="font-mono shrink-0">{m.raw}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </dialog>
  );
}
