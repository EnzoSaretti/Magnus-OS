import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_AGENT_MODEL, MODEL_CATALOG, estimateCostUsd, findModel } from '../src/catalog.ts';
import { ProviderError, type Usage } from '../src/types.ts';

const NO_CACHE: Usage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };

describe('model catalog', () => {
  test('the default agent model is in the catalog', () => {
    assert.ok(findModel(DEFAULT_AGENT_MODEL));
  });

  test('model ids are unique per provider', () => {
    const keys = MODEL_CATALOG.map((m) => `${m.provider}/${m.model}`);
    assert.equal(new Set(keys).size, keys.length);
  });
});

describe('estimateCostUsd', () => {
  const opus = { provider: 'anthropic', model: 'claude-opus-5-5' } as const;
  const haiku = { provider: 'anthropic', model: 'claude-haiku-5-5' } as const;

  test('prices input and output per million tokens', () => {
    const usd = estimateCostUsd(opus, { ...NO_CACHE, inputTokens: 1_000_000, outputTokens: 1_000_000 });
    assert.equal(usd, 24);
  });

  test('prices cache reads at the cache rate', () => {
    const usd = estimateCostUsd(opus, { ...NO_CACHE, cacheReadTokens: 1_000_000 });
    assert.equal(usd, 0.2);
  });

  test('switches to long-prompt pricing above the threshold', () => {
    const short = estimateCostUsd(haiku, { ...NO_CACHE, inputTokens: 100_000, outputTokens: 1_000 });
    const long = estimateCostUsd(haiku, { ...NO_CACHE, inputTokens: 100_001, outputTokens: 1_000 });
    assert.ok(Math.abs(short - (0.01 + 0.0005)) < 1e-9);
    assert.ok(long > short * 4);
  });

  test('refuses to price an unknown model instead of returning zero', () => {
    assert.throws(() => estimateCostUsd({ provider: 'openai', model: 'unknown' }, NO_CACHE), /No pricing/);
  });
});

describe('ProviderError', () => {
  test('marks only transient failures as retryable', () => {
    assert.ok(new ProviderError('anthropic', 'rate_limited', 'slow down').retryable);
    assert.ok(new ProviderError('anthropic', 'unavailable', 'overloaded').retryable);
    assert.ok(!new ProviderError('anthropic', 'invalid_request', 'bad').retryable);
    assert.ok(!new ProviderError('anthropic', 'refused', 'declined').retryable);
  });
});
