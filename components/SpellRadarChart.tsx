import type { RadarAxisResult } from "@/lib/radarScore";

const SIZE = 280;
const CX = SIZE / 2;
const CY = SIZE / 2;
const RADIUS = 96;
const LEVELS = 4;

function polar(angleRad: number, radius: number): { x: number; y: number } {
  return {
    x: CX + radius * Math.sin(angleRad),
    y: CY - radius * Math.cos(angleRad),
  };
}

export default function SpellRadarChart({ axes }: { axes: RadarAxisResult[] }) {
  const n = axes.length;
  if (n === 0) return null;

  const angleStep = (Math.PI * 2) / n;

  const gridPolygons = Array.from({ length: LEVELS }, (_, level) => {
    const r = (RADIUS * (level + 1)) / LEVELS;
    return axes
      .map((_, i) => {
        const p = polar(i * angleStep, r);
        return `${p.x},${p.y}`;
      })
      .join(" ");
  });

  const valuePoints = axes.map((axis, i) => {
    const r = RADIUS * Math.min(1, Math.max(0, axis.normalized));
    return polar(i * angleStep, r);
  });
  const valuePolygon = valuePoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={SIZE}
      height={SIZE}
      role="img"
      aria-label="Spell radar chart by axis scores"
      className="mx-auto block"
    >
      {gridPolygons.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="#dcd9d2"
          strokeWidth={1}
        />
      ))}

      {axes.map((axis, i) => {
        const tip = polar(i * angleStep, RADIUS);
        const labelPos = polar(i * angleStep, RADIUS + 22);
        return (
          <g key={axis.id}>
            <line
              x1={CX}
              y1={CY}
              x2={tip.x}
              y2={tip.y}
              stroke="#dcd9d2"
              strokeWidth={1}
            />
            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-ink/70"
              style={{ fontSize: 11, fontWeight: 500 }}
            >
              {axis.shortLabel}
            </text>
            <text
              x={labelPos.x}
              y={labelPos.y + 12}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-ink/45"
              style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
            >
              {axis.score.toFixed(1)}/{axis.maxWeight}
            </text>
          </g>
        );
      })}

      <polygon
        points={valuePolygon}
        fill="rgba(59, 91, 219, 0.18)"
        stroke="#3b5bdb"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {valuePoints.map((p, i) => (
        <circle
          key={axes[i].id}
          cx={p.x}
          cy={p.y}
          r={3.5}
          fill="#3b5bdb"
        />
      ))}
    </svg>
  );
}
