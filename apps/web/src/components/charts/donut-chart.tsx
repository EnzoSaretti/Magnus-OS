'use client';

export interface DonutSlice {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  slices: readonly DonutSlice[];
  ariaLabel: string;
  centerCaption: string;
  /** Slice highlighted from the chart or from its legend. */
  activeId: string | null;
  onActiveChange: (id: string | null) => void;
  size?: number;
  thickness?: number;
}

const GAP = 3;
const MIN_VISIBLE = 4;

/** Donut with surface gaps between slices; hover (or the legend) focuses one slice. */
export function DonutChart({
  slices,
  ariaLabel,
  centerCaption,
  activeId,
  onActiveChange,
  size = 184,
  thickness = 16,
}: DonutChartProps) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const active = slices.find((slice) => slice.id === activeId) ?? null;

  let offset = 0;
  const arcs = slices.map((slice) => {
    const share = total > 0 ? slice.value / total : 0;
    const length = Math.max(MIN_VISIBLE, share * circumference - GAP);
    const arc = { slice, length, offset };
    offset += share * circumference;
    return arc;
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label={ariaLabel} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-graphite-800)"
          strokeWidth={thickness}
        />
        {arcs.map(({ slice, length, offset: start }) => (
          <circle
            key={slice.id}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={slice.color}
            strokeWidth={thickness}
            strokeDasharray={`${length} ${circumference - length}`}
            strokeDashoffset={-start}
            opacity={activeId && activeId !== slice.id ? 0.3 : 1}
            className="transition-opacity duration-150"
            onPointerEnter={() => onActiveChange(slice.id)}
            onPointerLeave={() => onActiveChange(null)}
          />
        ))}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-wide text-3xl font-semibold tabular-nums text-mist-50">
          {(active ? active.value : total).toLocaleString('pt-BR')}
        </span>
        <span className="mt-0.5 max-w-[10ch] text-xs leading-4 text-mist-300">
          {active ? active.label : centerCaption}
        </span>
      </div>
    </div>
  );
}
