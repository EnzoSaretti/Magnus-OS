import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AUTONOMY_LEVELS,
  DEFAULT_LIMITS,
  TOOL_RISKS,
  evaluateToolCall,
  type AgentPolicy,
  type AutonomyLevel,
  type PolicyDecision,
  type RunUsage,
  type ToolDescriptor,
  type ToolRisk,
} from '../src/agent-policy.ts';

const FRESH_RUN: RunUsage = { stepsTaken: 0, delegationDepth: 0, costUsd: 0 };

function tool(risk: ToolRisk, name = `tool_${risk}`): ToolDescriptor {
  return { name, risk };
}

function policy(autonomy: AutonomyLevel, overrides: Partial<AgentPolicy> = {}): AgentPolicy {
  return {
    autonomy,
    allowedTools: [...TOOL_RISKS.map((r) => `tool_${r}`), 'delegate_to_agent'],
    limits: DEFAULT_LIMITS,
    ...overrides,
  };
}

describe('evaluateToolCall — autonomy × risk matrix', () => {
  const allow: PolicyDecision = { outcome: 'allow' };
  const sensitive: PolicyDecision = { outcome: 'require_approval', reason: 'sensitive_action' };
  const supervisedWrite: PolicyDecision = { outcome: 'require_approval', reason: 'supervised_write' };
  const readOnly: PolicyDecision = { outcome: 'deny', reason: 'read_only_agent' };

  const expected: Record<AutonomyLevel, Record<ToolRisk, PolicyDecision>> = {
    read_only: {
      read: allow,
      write_internal: readOnly,
      write_external: readOnly,
      destructive: readOnly,
      financial: readOnly,
    },
    supervised: {
      read: allow,
      write_internal: supervisedWrite,
      write_external: sensitive,
      destructive: sensitive,
      financial: sensitive,
    },
    autonomous_internal: {
      read: allow,
      write_internal: allow,
      write_external: sensitive,
      destructive: sensitive,
      financial: sensitive,
    },
  };

  for (const autonomy of AUTONOMY_LEVELS) {
    for (const risk of TOOL_RISKS) {
      test(`${autonomy} agent calling a ${risk} tool`, () => {
        assert.deepEqual(evaluateToolCall(tool(risk), policy(autonomy), FRESH_RUN), expected[autonomy][risk]);
      });
    }
  }

  test('no autonomy level runs external, destructive or financial actions without approval', () => {
    for (const autonomy of AUTONOMY_LEVELS) {
      for (const risk of ['write_external', 'destructive', 'financial'] as const) {
        assert.notEqual(evaluateToolCall(tool(risk), policy(autonomy), FRESH_RUN).outcome, 'allow');
      }
    }
  });
});

describe('evaluateToolCall — refusals take precedence over approval', () => {
  test('a tool outside the allowlist is refused, even a read-only one', () => {
    const decision = evaluateToolCall(
      tool('read', 'export_all_contacts'),
      policy('autonomous_internal'),
      FRESH_RUN,
    );
    assert.deepEqual(decision, { outcome: 'deny', reason: 'tool_not_allowed' });
  });

  test('the step limit stops the run', () => {
    const usage = { ...FRESH_RUN, stepsTaken: DEFAULT_LIMITS.maxSteps };
    assert.deepEqual(evaluateToolCall(tool('read'), policy('autonomous_internal'), usage), {
      outcome: 'deny',
      reason: 'step_limit_reached',
    });
  });

  test('an exhausted budget is refused instead of sent for approval', () => {
    const usage = { ...FRESH_RUN, costUsd: DEFAULT_LIMITS.maxCostUsd };
    assert.deepEqual(evaluateToolCall(tool('write_external'), policy('autonomous_internal'), usage), {
      outcome: 'deny',
      reason: 'budget_exhausted',
    });
  });

  test('delegation stops at the maximum depth', () => {
    const delegate: ToolDescriptor = { name: 'delegate_to_agent', risk: 'write_internal', delegates: true };
    const agent = policy('autonomous_internal');

    assert.deepEqual(evaluateToolCall(delegate, agent, { ...FRESH_RUN, delegationDepth: 1 }), { outcome: 'allow' });
    assert.deepEqual(evaluateToolCall(delegate, agent, { ...FRESH_RUN, delegationDepth: 2 }), {
      outcome: 'deny',
      reason: 'delegation_depth_reached',
    });
  });

  test('an agent configured with depth 0 cannot delegate at all', () => {
    const delegate: ToolDescriptor = { name: 'delegate_to_agent', risk: 'write_internal', delegates: true };
    const agent = policy('autonomous_internal', { limits: { ...DEFAULT_LIMITS, maxDelegationDepth: 0 } });
    assert.equal(evaluateToolCall(delegate, agent, FRESH_RUN).outcome, 'deny');
  });
});
