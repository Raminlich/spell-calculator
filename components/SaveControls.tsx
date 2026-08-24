"use client";

import { useRef, useState, type ChangeEvent } from "react";
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
    importWorkspace,
    lastSavedAt,
    hydrated,
    persistenceMode,
  } = useSpellConfig();
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2800);
  }

  async function handleSave() {
    setBusy(true);
    try {
      const result = await saveWorkspace();
      if (result?.mode === "server") {
        flash(`Saved ${contextLabel.toLowerCase()} to cloud`);
      } else if (result) {
        flash("Saved locally — cloud unavailable");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleLoad() {
    setBusy(true);
    try {
      const ok = await loadWorkspace();
      flash(ok ? "Loaded saved data" : "No saved data found");
    } finally {
      setBusy(false);
    }
  }

  function handleExport() {
    exportWorkspace();
    flash("Downloaded JSON backup");
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setBusy(true);
    try {
      const ok = await importWorkspace(file);
      flash(ok ? "Imported from JSON" : "Invalid or unreadable JSON file");
    } finally {
      setBusy(false);
    }
  }

  const savedLabel = formatSavedAt(lastSavedAt);
  const disabled = !hydrated || busy;

  return (
    <div className="flex max-w-xl flex-col items-end gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={disabled}
          className="rounded bg-ink px-3 py-1.5 text-xs font-medium text-paper hover:bg-ink/90 disabled:opacity-50"
        >
          {busy ? "…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => void handleLoad()}
          disabled={disabled}
          className="rounded border border-line px-3 py-1.5 text-xs font-medium text-ink/70 hover:border-ink/30 hover:text-ink disabled:opacity-50"
        >
          Load
        </button>
        <button
          type="button"
          onClick={handleExport}
          disabled={disabled}
          className="rounded border border-line px-3 py-1.5 text-xs font-medium text-ink/70 hover:border-ink/30 hover:text-ink disabled:opacity-50"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          disabled={disabled}
          className="rounded border border-line px-3 py-1.5 text-xs font-medium text-ink/70 hover:border-ink/30 hover:text-ink disabled:opacity-50"
        >
          Import JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => void handleImportFile(event)}
        />
      </div>
      <span className="text-right text-[11px] text-ink/45" aria-live="polite">
        {message
          ? message
          : savedLabel
            ? `Last saved ${savedLabel}${persistenceMode === "local" ? " (local cache)" : ""}`
            : hydrated
              ? persistenceMode === "local"
                ? "Cloud offline — using local cache"
                : "No save yet"
              : "…"}
      </span>
    </div>
  );
}
