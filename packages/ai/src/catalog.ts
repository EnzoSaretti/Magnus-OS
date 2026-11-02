/**
 * Models MAGNUS may route to, with list prices used to ESTIMATE spend for
 * budgets and dashboards. Billing truth is the provider's usage report.
 * Update PRICING_AS_OF whenever prices change.
 */
import type { ModelRef, Usage } from './types.ts';

export const PRICING_AS_OF = '2026-10-06';

export interface PriceTable {
  inputUsdPerMTok: number;
  outputUsdPerMTok: number;
  /** Omitted when unknown; cache reads are then priced as regular input. */
  cacheReadUsdPerMTok?: number;
}

export interface ModelInfo extends ModelRef {
  tier: 'frontier' | 'balanced' | 'fast';
  contextTokens: number;
  maxOutputTokens: number;
  pricing: PriceTable;
  /** Higher prices that apply once the prompt exceeds `thresholdTokens`. */
  longPromptPricing?: PriceTable & { thresholdTokens: number };
}

export const MODEL_CATALOG: readonly ModelInfo[] = [
  {
    provider: 'anthropic',
    model: 'claude-opus-5-5',
    tier: 'frontier',
    contextTokens: 1_000_000,
    maxOutputTokens: 128_000,
    pricing: { inputUsdPerMTok: 4, outputUsdPerMTok: 20, cacheReadUsdPerMTok: 0.2 },
  },
  {
    provider: 'anthropic',
    model: 'claude-sonnet-5-5',
    tier: 'balanced',
    contextTokens: 1_000_000,
    maxOutputTokens: 128_000,
    pricing: { inputUsdPerMTok: 2, outputUsdPerMTok: 10, cacheReadUsdPerMTok: 0.2 },
  },
  {
    provider: 'anthropic',
    model: 'claude-haiku-5-5',
    tier: 'fast',
    contextTokens: 1_000_000,
    maxOutputTokens: 128_000,
    pricing: { inputUsdPerMTok: 0.1, outputUsdPerMTok: 0.5 },
    longPromptPricing: { thresholdTokens: 100_000, inputUsdPerMTok: 0.5, outputUsdPerMTok: 2.5 },
  },
];

/** Default for agent runs until the cost policy (docs/09, D-08) is decided. */
export const DEFAULT_AGENT_MODEL: ModelRef = { provider: 'anthropic', model: 'claude-opus-5-5' };

export function findModel(ref: ModelRef): ModelInfo | undefined {
  return MODEL_CATALOG.find((m) => m.provider === ref.provider && m.model === ref.model);
}

/**
 * Estimated cost in USD of one request. Cache writes are priced as regular
 * input (a lower bound), since write premiums vary by cache duration.
 * Throws for models outside the catalog so spend is never silently counted as zero.
 */
export function estimateCostUsd(ref: ModelRef, usage: Usage): number {
  const info = findModel(ref);
  if (!info) {
    throw new Error(`No pricing for ${ref.provider}/${ref.model}; add it to MODEL_CATALOG`);
  }

  const promptTokens = usage.inputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
  const prices =
    info.longPromptPricing && promptTokens > info.longPromptPricing.thresholdTokens
      ? info.longPromptPricing
      : info.pricing;
  const cacheReadRate = prices.cacheReadUsdPerMTok ?? prices.inputUsdPerMTok;

  const usd =
    (usage.inputTokens + usage.cacheWriteTokens) * prices.inputUsdPerMTok +
    usage.cacheReadTokens * cacheReadRate +
    usage.outputTokens * prices.outputUsdPerMTok;

  return usd / 1_000_000;
}
