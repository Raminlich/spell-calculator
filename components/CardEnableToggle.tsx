"use client";

/** Top-left enable toggle shared by noun / delivery / modifier cards. */
export default function CardEnableToggle({
  id,
  checked,
  onChange,
}: {
  id: string;
  checked: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      title={checked ? "Included in calculation" : "Excluded from calculation"}
      className="flex shrink-0 items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-ink/50"
    >
      <input
        id={id}
        name={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-3.5 accent-accent"
      />
      <span className="sr-only">Enable in calculation</span>
    </label>
  );
}
