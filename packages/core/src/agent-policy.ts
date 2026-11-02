/**
 * Decides, in code, whether an agent may run a tool call.
 *
 * The model only proposes tool calls. Whether a call runs, waits for a human,
 * or is refused is decided here from facts the model cannot influence: the
 * tool's risk class (set by the tool's author), the agent's configuration
 * (set by an org admin) and the run's consumption so far.
 *
 * Invariant for V1: effects outside MAGNUS, destructive operations and
 * anything financial ALWAYS require human approval, at every autonomy level.
 * Changing that requires a new ADR (docs/adr/0005).
 */

/** Side-effect class of a tool. Assigned in code by the tool's author and reviewed like security code. */
export const TOOL_RISKS = ['read', 'write_internal', 'write_external', 'destructive', 'financial'] as const;

export type ToolRisk = (typeof TOOL_RISKS)[number];

/**
 * How much an agent may do on its own.
 * - read_only: may only read; any other tool call is refused.
 * - supervised: may read; every write waits for approval.
 * - autonomous_internal: may read and change MAGNUS-internal state; anything else waits for approval.
 */
export const AUTONOMY_LEVELS = ['read_only', 'supervised', 'autonomous_internal'] as const;

export type AutonomyLevel = (typeof AUTONOMY_LEVELS)[number];

/** Risk classes that need a human decision regardless of autonomy level. */
const ALWAYS_REQUIRE_APPROVAL: ReadonlySet<ToolRisk> = new Set(['write_external', 'destructive', 'financial']);

export interface ToolDescriptor {
  name: string;
  risk: ToolRisk;
  /** True for the delegation tool, which hands a subtask to another agent. */
  delegates?: boolean;
}

export interface ExecutionLimits {
  /** Maximum model/tool steps in one run. */
  maxSteps: number;
  /** Maximum chain length of agent-to-agent delegation (0 = cannot delegate). */
  maxDelegationDepth: number;
  /** Maximum estimated model spend for one run, in USD. */
  maxCostUsd: number;
}

export interface AgentPolicy {
  autonomy: AutonomyLevel;
  /** Tool names this agent may call. Anything else is refused. */
  allowedTools: readonly string[];
  limits: ExecutionLimits;
}

export interface RunUsage {
  stepsTaken: number;
  /** 0 for a run started by a person or a schedule; parent depth + 1 for a delegated run. */
  delegationDepth: number;
  costUsd: number;
}

export type DenyReason =
  | 'tool_not_allowed'
  | 'read_only_agent'
  | 'step_limit_reached'
  | 'budget_exhausted'
  | 'delegation_depth_reached';

export type ApprovalReason = 'sensitive_action' | 'supervised_write';

export type PolicyDecision =
  | { outcome: 'allow' }
  | { outcome: 'require_approval'; reason: ApprovalReason }
  | { outcome: 'deny'; reason: DenyReason };

export const DEFAULT_LIMITS: ExecutionLimits = Object.freeze({
  maxSteps: 25,
  maxDelegationDepth: 2,
  maxCostUsd: 2,
});

export function isToolRisk(value: unknown): value is ToolRisk {
  return typeof value === 'string' && (TOOL_RISKS as readonly string[]).includes(value);
}

export function isAutonomyLevel(value: unknown): value is AutonomyLevel {
  return typeof value === 'string' && (AUTONOMY_LEVELS as readonly string[]).includes(value);
}

/**
 * Evaluates one proposed tool call. Refusals are checked before approvals, so a
 * human can never approve a call that breaks the agent's configuration or limits.
 */
export function evaluateToolCall(tool: ToolDescriptor, policy: AgentPolicy, usage: RunUsage): PolicyDecision {
  if (!policy.allowedTools.includes(tool.name)) {
    return { outcome: 'deny', reason: 'tool_not_allowed' };
  }
  if (usage.stepsTaken >= policy.limits.maxSteps) {
    return { outcome: 'deny', reason: 'step_limit_reached' };
  }
  if (usage.costUsd >= policy.limits.maxCostUsd) {
    return { outcome: 'deny', reason: 'budget_exhausted' };
  }
  if (tool.delegates && usage.delegationDepth + 1 > policy.limits.maxDelegationDepth) {
    return { outcome: 'deny', reason: 'delegation_depth_reached' };
  }
  if (tool.risk === 'read') {
    return { outcome: 'allow' };
  }
  if (policy.autonomy === 'read_only') {
    return { outcome: 'deny', reason: 'read_only_agent' };
  }
  if (ALWAYS_REQUIRE_APPROVAL.has(tool.risk)) {
    return { outcome: 'require_approval', reason: 'sensitive_action' };
  }
  if (policy.autonomy === 'supervised') {
    return { outcome: 'require_approval', reason: 'supervised_write' };
  }
  return { outcome: 'allow' };
}
