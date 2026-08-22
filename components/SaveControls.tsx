"use client";

import { useState } from "react";
import { useSpellConfig } from "@/components/SpellConfigContext";
import { formatSavedAt } from "@/lib/persistence";

type SaveControlsProps = {
  /** Short context label shown next to status, e.g. "Calculator" or "Components". */
  contextLabel: string;
};

export default function SaveControls({ contextLabel }: SaveControlsProps) {
  const {
    saveWorkspace,
    loadWorkspace,
    exportWorkspace,
    lastSavedAt,
    hydrated,
  } = useSpellConfig();
  const [message, setMessage] = useState<string | null>(null);

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2500);
  }

  function handleSave() {
    const savedAt = saveWorkspace();
    flash(`Saved ${contextLabel.toLowerCase()} workspace`);
    void savedAt;
  }

  function handleLoad() {
    const ok = loadWorkspace();
    flash(ok ? "Loaded saved workspace" : "No saved workspace found");
  }

  function handleExport() {
    exportWorkspace();
    flash("Downloaded JSON backup");
  }

  const savedLabel = formatSavedAt(lastSavedAt);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleSave}
        disabled={!hydrated}
        className="rounded bg-ink px-3 py-1.5 text-xs font-medium text-paper hover:bg-ink/90 disabled:opacity-50"
      >
        Save
      </button>
      <button
        type="button"
        onClick={handleLoad}
        disabled={!hydrated}
        className="rounded border border-line px-3 py-1.5 text-xs font-medium text-ink/70 hover:border-ink/30 hover:text-ink disabled:opacity-50"
      >
        Load
      </button>
      <button
        type="button"
        onClick={handleExport}
        disabled={!hydrated}
        className="rounded border border-line px-3 py-1.5 text-xs font-medium text-ink/70 hover:border-ink/30 hover:text-ink disabled:opacity-50"
      >
        Export JSON
      </button>
      <span className="text-[11px] text-ink/45" aria-live="polite">
        {message
          ? message
          : savedLabel
            ? `Last saved ${savedLabel}`
            : hydrated
              ? "No save yet"
              : "…"}
      </span>
    </div>
  );
}
