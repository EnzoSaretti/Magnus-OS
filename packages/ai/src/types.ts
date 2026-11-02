/**
 * Provider-agnostic contract between MAGNUS and LLM vendors.
 *
 * Adapters in ./adapters/ (phase 2, Anthropic first) translate this contract
 * to a vendor SDK. Nothing outside packages/ai may import a vendor SDK.
 *
 * Deliberate omissions, so the contract only promises what every target
 * provider supports:
 * - no sampling knobs (temperature/top_p): rejected by current Claude models;
 * - no forced tool choice: rejected by current Claude models. Steer with the
 *   system prompt and validate tool inputs against their schema instead;
 * - no assistant prefill.
 */

export type ProviderId = 'anthropic' | 'openai';

export interface ModelRef {
  provider: ProviderId;
  model: string;
}

/** JSON Schema object describing a tool's input. Kept loose here; adapters validate. */
export type JsonSchema = { type: 'object'; [keyword: string]: unknown };

export interface ToolSpec {
  name: string;
  description: string;
  inputSchema: JsonSchema;
}

export type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'tool_call'; id: string; name: string; input: unknown }
  | { type: 'tool_result'; toolCallId: string; content: string; isError?: boolean }
  /**
   * Provider-native block that must be sent back unchanged on the next request
   * (for example, Claude thinking blocks). Only meaningful to the provider that
   * produced it, which is why a run is pinned to one provider and model.
   */
  | { type: 'opaque'; provider: ProviderId; payload: unknown };

export interface Message {
  role: 'user' | 'assistant';
  content: ContentPart[];
}

/** Reasoning depth / spend dial. Adapters map it to the provider's equivalent or ignore it. */
export type Effort = 'low' | 'medium' | 'high';

export interface GenerateRequest {
  model: ModelRef;
  system: string;
  /** Append-only history. Never edit or drop earlier parts: providers may reject edited history. */
  messages: Message[];
  tools?: ToolSpec[];
  maxOutputTokens: number;
  effort?: Effort;
  /** Used for metering, tracing and logs. Never sent to the model. */
  context: { orgId: string; runId?: string };
  signal?: AbortSignal;
}

export type StopReason = 'end_turn' | 'tool_use' | 'max_tokens' | 'refusal' | 'other';

/** Token usage as billed. inputTokens excludes cache reads and cache writes. */
export interface Usage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
}

export interface GenerateResult {
  message: Message;
  stopReason: StopReason;
  usage: Usage;
  /** Provider's request id, kept for support tickets and audits. */
  providerRequestId?: string;
}

export interface ModelProvider {
  readonly id: ProviderId;
  generate(request: GenerateRequest): Promise<GenerateResult>;
}

export interface EmbeddingProvider {
  readonly id: string;
  readonly model: string;
  /** Fixed per model; stored next to every vector so a model change is detectable. */
  readonly dimensions: number;
  embed(texts: string[], context: { orgId: string }): Promise<number[][]>;
}

export type ProviderErrorKind = 'rate_limited' | 'unavailable' | 'invalid_request' | 'auth' | 'refused' | 'unknown';

/** Normalized error every adapter throws, so callers never handle vendor SDK errors. */
export class ProviderError extends Error {
  readonly provider: ProviderId;
  readonly kind: ProviderErrorKind;
  readonly retryable: boolean;

  constructor(provider: ProviderId, kind: ProviderErrorKind, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'ProviderError';
    this.provider = provider;
    this.kind = kind;
    this.retryable = kind === 'rate_limited' || kind === 'unavailable';
  }
}
