import { SpellCombo } from "@/lib/types";

export type ExportColumn = {
  key: string;
  label: string;
  get: (c: SpellCombo) => string | number;
};

export type TableExportFormat = "csv" | "json" | "tsv";

function escapeCsvCell(value: string | number): string {
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function escapeTsvCell(value: string | number): string {
  return String(value).replace(/[\t\n\r]/g, " ");
}

export function combosToDelimited(
  combos: SpellCombo[],
  columns: ExportColumn[],
  delimiter: "," | "\t"
): string {
  const escape = delimiter === "\t" ? escapeTsvCell : escapeCsvCell;
  const header = columns.map((col) => escape(col.label)).join(delimiter);
  const rows = combos.map((combo) =>
    columns.map((col) => escape(col.get(combo))).join(delimiter)
  );
  return [header, ...rows].join("\n");
}

export function combosToJson(combos: SpellCombo[], columns: ExportColumn[]): string {
  const rows = combos.map((combo) => {
    const row: Record<string, string | number> = {};
    for (const col of columns) {
      row[col.label] = col.get(combo);
    }
    return row;
  });
  return JSON.stringify(rows, null, 2);
}

export function downloadTextFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function timestampForFilename(): string {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
}

export function exportCombosTable(
  combos: SpellCombo[],
  columns: ExportColumn[],
  format: TableExportFormat
): void {
  const stamp = timestampForFilename();
  switch (format) {
    case "csv": {
      downloadTextFile(
        combosToDelimited(combos, columns, ","),
        `spell-combos-${stamp}.csv`,
        "text/csv;charset=utf-8"
      );
      return;
    }
    case "tsv": {
      downloadTextFile(
        combosToDelimited(combos, columns, "\t"),
        `spell-combos-${stamp}.tsv`,
        "text/tab-separated-values;charset=utf-8"
      );
      return;
    }
    case "json": {
      downloadTextFile(
        combosToJson(combos, columns),
        `spell-combos-${stamp}.json`,
        "application/json"
      );
      return;
    }
    default: {
      const _exhaustive: never = format;
      void _exhaustive;
      return;
    }
  }
}
