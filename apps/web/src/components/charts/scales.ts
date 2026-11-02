/** Rounds a maximum up to 1, 2, 2.5 or 5 × 10^n so four gridlines land on readable values. */
export function niceMax(value: number): number {
  if (!(value > 0)) return 1;
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / 10 ** exponent;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return nice * 10 ** exponent;
}

export interface Point {
  x: number;
  y: number;
}

/**
 * Monotone cubic interpolation (Fritsch–Carlson): smooth like the references,
 * but never overshoots the data, so a curve cannot dip below zero or invent peaks.
 */
export function monotonePath(points: readonly Point[]): string {
  const n = points.length;
  const first = points[0];
  if (!first) return '';
  if (n === 1) return `M${first.x},${first.y}`;

  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const a = points[i]!;
    const b = points[i + 1]!;
    slopes.push((b.y - a.y) / (b.x - a.x));
  }

  const tangents: number[] = new Array(n).fill(0);
  tangents[0] = slopes[0]!;
  tangents[n - 1] = slopes[n - 2]!;
  for (let i = 1; i < n - 1; i++) {
    const left = slopes[i - 1]!;
    const right = slopes[i]!;
    tangents[i] = left * right <= 0 ? 0 : (left + right) / 2;
  }
  for (let i = 0; i < n - 1; i++) {
    const slope = slopes[i]!;
    if (slope === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      continue;
    }
    const a = tangents[i]! / slope;
    const b = tangents[i + 1]! / slope;
    const sum = a * a + b * b;
    if (sum > 9) {
      const tau = 3 / Math.sqrt(sum);
      tangents[i] = tau * a * slope;
      tangents[i + 1] = tau * b * slope;
    }
  }

  let path = `M${first.x},${first.y}`;
  for (let i = 0; i < n - 1; i++) {
    const a = points[i]!;
    const b = points[i + 1]!;
    const dx = (b.x - a.x) / 3;
    path += `C${a.x + dx},${a.y + tangents[i]! * dx} ${b.x - dx},${b.y - tangents[i + 1]! * dx} ${b.x},${b.y}`;
  }
  return path;
}

/** Spreads label positions apart so direct labels never overlap (min gap in px). */
export function separate(positions: readonly number[], minGap: number): number[] {
  const order = positions.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  for (let i = 1; i < order.length; i++) {
    const previous = order[i - 1]!;
    const current = order[i]!;
    if (current.value - previous.value < minGap) current.value = previous.value + minGap;
  }
  const result: number[] = [];
  for (const { value, index } of order) result[index] = value;
  return result;
}
