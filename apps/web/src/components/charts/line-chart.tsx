'use client';

import { useId, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { monotonePath, niceMax, separate, xLabelIndexes } from './scales';
import { useElementWidth } from './use-element-width';

export interface LineSeries {
  id: string;
  label: string;
  /** Token color, e.g. var(--color-chart-1). */
  color: string;
  values: readonly number[];
}

export interface LineChartProps {
  series: readonly LineSeries[];
  /** One label per point on the x axis. */
  labels: readonly string[];
  ariaLabel: string;
  height?: number;
  formatValue?: (value: number) => string;
}

const PAD = { top: 14, right: 96, bottom: 30, left: 34 };
const formatDefault = (value: number) => value.toLocaleString('pt-BR');

/**
 * Multi-series line chart on one shared axis: monotone curves, recessive grid,
 * direct labels at the line ends, crosshair tooltip on hover and arrow keys,
 * and a visually hidden table for screen readers.
 */
export function LineChart({ series, labels, ariaLabel, height = 248, formatValue = formatDefault }: LineChartProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const gradientId = useId();

  const count = labels.length;
  const max = niceMax(Math.max(0, ...series.flatMap((s) => s.values)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const innerWidth = Math.max(0, width - PAD.left - PAD.right);
  const innerHeight = height - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (count <= 1 ? innerWidth / 2 : (i * innerWidth) / (count - 1));
  const y = (v: number) => PAD.top + innerHeight - (v / max) * innerHeight;
  const labelEvery = Math.max(1, Math.ceil(count / Math.max(1, Math.floor(innerWidth / 64))));
  const shownLabels = xLabelIndexes(count, labelEvery);

  const endLabelY = separate(
    series.map((s) => y(s.values[s.values.length - 1] ?? 0)),
    16,
  );

  function indexFromPointer(event: PointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / Math.max(1, rect.width);
    return Math.min(count - 1, Math.max(0, Math.round(ratio * (count - 1))));
  }

  function onKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const step = event.key === 'ArrowLeft' ? -1 : 1;
    setActive((current) => Math.min(count - 1, Math.max(0, (current ?? count - 1) + step)));
  }

  const tooltipLeft = active === null ? 0 : Math.min(Math.max(x(active), 80), Math.max(80, width - 80));

  return (
    <div ref={ref} className="relative" style={{ height }}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={ariaLabel}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onFocus={() => setActive((current) => current ?? count - 1)}
          onBlur={() => setActive(null)}
          className="block overflow-visible rounded-control focus-visible:outline-2 focus-visible:outline-magnus-300"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={series[0]?.color} stopOpacity="0.22" />
              <stop offset="1" stopColor={series[0]?.color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={PAD.left + innerWidth}
                y1={y(tick)}
                y2={y(tick)}
                stroke="var(--color-graphite-800)"
                strokeWidth={1}
              />
              <text x={PAD.left - 10} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-graphite-500 text-[11px]">
                {formatValue(tick)}
              </text>
            </g>
          ))}

          {shownLabels.map((i) => (
            <text key={labels[i]} x={x(i)} y={height - 8} textAnchor="middle" className="fill-graphite-500 text-[11px]">
              {labels[i]}
            </text>
          ))}

          {series[0] && (
            <path
              d={`${monotonePath(series[0].values.map((v, i) => ({ x: x(i), y: y(v) })))}L${x(count - 1)},${y(0)}L${x(0)},${y(0)}Z`}
              fill={`url(#${gradientId})`}
            />
          )}

          {series.map((s) => (
            <path
              key={s.id}
              d={monotonePath(s.values.map((v, i) => ({ x: x(i), y: y(v) })))}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {series.map((s, index) => (
            <g key={`${s.id}-label`}>
              <circle cx={x(count - 1)} cy={y(s.values[count - 1] ?? 0)} r={3.5} fill={s.color} />
              <text x={x(count - 1) + 10} y={endLabelY[index]} dy="0.32em" className="fill-mist-300 text-[12px]">
                {s.label}
              </text>
            </g>
          ))}

          {active !== null && (
            <g pointerEvents="none">
              <line
                x1={x(active)}
                x2={x(active)}
                y1={PAD.top}
                y2={PAD.top + innerHeight}
                stroke="var(--color-graphite-600)"
                strokeDasharray="3 4"
              />
              {series.map((s) => (
                <circle
                  key={s.id}
                  cx={x(active)}
                  cy={y(s.values[active] ?? 0)}
                  r={5}
                  fill={s.color}
                  stroke="var(--color-graphite-900)"
                  strokeWidth={2}
                />
              ))}
            </g>
          )}

          <rect
            x={PAD.left}
            y={PAD.top}
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            onPointerMove={(event) => setActive(indexFromPointer(event))}
            onPointerLeave={() => setActive(null)}
          />
        </svg>
      )}

      {active !== null && (
        <div
          role="status"
          className="pointer-events-none absolute top-0 z-10 min-w-36 -translate-x-1/2 rounded-control border border-graphite-700 bg-graphite-850/95 px-3 py-2 text-xs shadow-lg backdrop-blur"
          style={{ left: tooltipLeft }}
        >
          <p className="font-medium text-mist-50">{labels[active]}</p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {series.map((s) => (
              <li key={s.id} className="flex items-center gap-2 text-mist-300">
                <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="flex-1">{s.label}</span>
                <span className="tabular-nums text-mist-50">{formatValue(s.values[active] ?? 0)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <thead>
          <tr>
            <th scope="col">Data</th>
            {series.map((s) => (
              <th key={s.id} scope="col">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((label, i) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              {series.map((s) => (
                <td key={s.id}>{formatValue(s.values[i] ?? 0)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
