"use client";

export type EditableColumn<T> = {
  key: string;
  label: string;
  type: "text" | "number";
  step?: number;
  get: (row: T) => string | number;
  set: (row: T, value: string) => T;
  width?: string;
};

export default function EditableTable<T extends { id: string }>({
  rows,
  columns,
  onChange,
  caption,
}: {
  rows: T[];
  columns: EditableColumn<T>[];
  onChange: (rows: T[]) => void;
  caption?: string;
}) {
  function updateCell(rowIndex: number, col: EditableColumn<T>, value: string) {
    const next = rows.slice();
    next[rowIndex] = col.set(next[rowIndex], value);
    onChange(next);
  }

  return (
    <div className="overflow-x-auto">
      {caption && (
        <div className="mb-2 text-xs uppercase tracking-wide text-ink/50">
          {caption}
        </div>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-ink/60">
            {columns.map((col) => (
              <th
                key={col.key}
                className="whitespace-nowrap px-2 py-1.5 font-medium"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id} className="border-b border-line/60 last:border-0">
              {columns.map((col) => (
                <td key={col.key} className="px-2 py-1">
                  <input
                    type={col.type}
                    step={col.step ?? 0.1}
                    value={col.get(row)}
                    onChange={(e) => updateCell(rowIndex, col, e.target.value)}
                    className="w-full min-w-0 rounded border border-transparent bg-transparent px-1.5 py-1 focus:border-accent focus:bg-white focus:outline-none"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
