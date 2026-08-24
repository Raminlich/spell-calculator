"use client";

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  type?: "text" | "number";
  value: string | number;
  onChange: (value: string) => void;
  step?: number;
  min?: number;
  max?: number;
  optional?: boolean;
  className?: string;
  variant?: "field" | "title";
};

export default function CardField({
  id,
  label,
  hint,
  type = "text",
  value,
  onChange,
  step = 0.1,
  min,
  max,
  optional = false,
  className,
  variant = "field",
}: FieldProps) {
  const empty = optional && (value === "" || value === undefined || value === null);
  const isTitle = variant === "title";
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className={`flex min-w-0 flex-col ${isTitle ? "gap-0" : "gap-0.5"} ${className ?? ""}`}>
      <label
        htmlFor={id}
        title={hint}
        className={
          isTitle
            ? "sr-only"
            : `text-[11px] font-medium leading-tight text-ink/65 ${
                hint ? "cursor-help underline decoration-dotted decoration-ink/30 underline-offset-2" : ""
              }`
        }
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        step={type === "number" ? step : undefined}
        min={min}
        max={max}
        value={empty ? "" : value}
        placeholder={optional ? "—" : undefined}
        title={hint}
        aria-describedby={hintId}
        onChange={(e) => onChange(e.target.value)}
        className={
          isTitle
            ? "min-h-7 w-full rounded-none border-0 border-b border-line/70 bg-transparent px-0 py-0.5 text-sm font-semibold tracking-tight text-balance hover:border-ink/40 focus:border-accent focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            : `min-h-7 rounded border border-line bg-white px-1.5 py-1 text-xs leading-tight focus:border-accent focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                type === "number" ? "font-mono tabular-nums" : ""
              }`
        }
      />
      {hint && (
        <span id={hintId} className="sr-only">
          {hint}
        </span>
      )}
    </div>
  );
}
