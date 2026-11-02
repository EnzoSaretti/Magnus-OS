import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { monotonePath, niceMax, separate } from '../src/components/charts/scales.ts';

describe('niceMax', () => {
  test('rounds up to 1, 2, 2.5 or 5 × 10^n', () => {
    assert.equal(niceMax(14), 20);
    assert.equal(niceMax(20), 20);
    assert.equal(niceMax(23), 25);
    assert.equal(niceMax(3), 5);
    assert.equal(niceMax(0.7), 1);
    assert.equal(niceMax(0), 1);
  });
});

describe('monotonePath', () => {
  function controlYs(path: string): number[] {
    return [...path.matchAll(/C([\d.-]+),([\d.-]+) ([\d.-]+),([\d.-]+) ([\d.-]+),([\d.-]+)/g)].flatMap((m) => [
      Number(m[2]),
      Number(m[4]),
    ]);
  }

  test('never overshoots the data range (no invented peaks or dips below zero)', () => {
    const points = [0, 10, 10, 2, 8, 8, 0].map((v, i) => ({ x: i * 10, y: 100 - v * 10 }));
    const ys = controlYs(monotonePath(points));
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));
    for (const y of ys) {
      assert.ok(y >= minY - 1e-9 && y <= maxY + 1e-9, `control point ${y} outside [${minY}, ${maxY}]`);
    }
  });

  test('handles empty and single-point series', () => {
    assert.equal(monotonePath([]), '');
    assert.equal(monotonePath([{ x: 1, y: 2 }]), 'M1,2');
  });
});

describe('separate', () => {
  test('pushes overlapping labels apart and keeps their order', () => {
    assert.deepEqual(separate([50, 52, 120], 16), [50, 66, 120]);
    assert.deepEqual(separate([80, 20], 16), [80, 20]);
  });
});
