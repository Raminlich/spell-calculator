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
  optional?: boolean;
  className?: string;
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
  optional = false,
  className,
}: FieldProps) {
  const empty = optional && (value === "" || value === undefined || value === null);

  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`}>
      <label htmlFor={id} className="text-xs font-medium text-ink/70">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        step={type === "number" ? step : undefined}
        min={min}
        value={empty ? "" : value}
        placeholder={optional ? "—" : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-10 rounded border border-line bg-white px-2.5 py-2 text-sm focus:border-accent focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
      {hint && <span className="text-[11px] text-ink/45">{hint}</span>}
    </div>
  );
}
