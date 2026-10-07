import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const S = (...p) => path.join(ROOT, '.swarm', ...p);
const QUEUE = S('queue');
const REPORTS = S('reports');

fs.mkdirSync(QUEUE, { recursive: true });
fs.mkdirSync(REPORTS, { recursive: true });

function runHook(hookRelativePath, inputObj = {}) {
  const fullPath = path.resolve(ROOT, hookRelativePath);
  const res = spawnSync(process.execPath, [fullPath], {
    cwd: ROOT,
    input: JSON.stringify(inputObj),
    encoding: 'utf8',
    timeout: 10000,
    env: { ...process.env, CLAUDE_PROJECT_DIR: ROOT }
  });
  let json = null;
  try { json = JSON.parse(res.stdout); } catch {}
  return {
    status: res.status,
    stdout: res.stdout || '',
    stderr: res.stderr || '',
    json
  };
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

function cleanTestFiles() {
  if (fs.existsSync(QUEUE)) {
    for (const f of fs.readdirSync(QUEUE)) {
      if (f.startsWith('T-test-') || f.startsWith('T-valid')) {
        fs.rmSync(path.join(QUEUE, f), { force: true });
      }
    }
  }
  if (fs.existsSync(REPORTS)) {
    for (const f of fs.readdirSync(REPORTS)) {
      if (f.startsWith('T-test-') || f.startsWith('T-valid')) {
        fs.rmSync(path.join(REPORTS, f), { force: true });
      }
    }
  }
  if (fs.existsSync(S('pump.json'))) fs.rmSync(S('pump.json'), { force: true });
}

console.log('=== RUNNING SWARM-SPEC v2 HOOK TEST SUITE ===\n');

try {
  cleanTestFiles();

  // =========================================================================
  // 1. GUARD HOOK TESTS
  // =========================================================================
  console.log('1. Testing guard.mjs (PreToolUse)...');

  // 1a. Denies Edit on .claude/settings.json
  const taskGuard1 = {
    id: 'T-test-guard-1',
    status: 'claimed',
    owner_role: '10-core-engineer',
    scope: ['src/']
  };
  fs.writeFileSync(path.join(QUEUE, `${taskGuard1.id}.json`), JSON.stringify(taskGuard1, null, 2));

  const res1a = runHook('.claude/hooks/guard.mjs', {
    hook_event_name: 'PreToolUse',
    agent_type: '10-core-engineer',
    tool_name: 'Edit',
    tool_input: { file_path: '.claude/settings.json' }
  });
  assert(
    res1a.status === 0 &&
    res1a.json?.hookSpecificOutput?.permissionDecision === 'deny' &&
    res1a.json?.hookSpecificOutput?.permissionDecisionReason?.includes('Protected swarm infrastructure'),
    'guard denies Edit on .claude/settings.json'
  );

  // 1b. Denies Edit on a frozen test (non-09 role)
  cleanTestFiles();
  const taskGuard2 = {
    id: 'T-test-guard-2',
    status: 'claimed',
    owner_role: '10-core-engineer',
    scope: ['tests/'],
    frozen_tests: { 'tests/frozen.test.ts': 'sha256dummyhash' }
  };
  fs.writeFileSync(path.join(QUEUE, `${taskGuard2.id}.json`), JSON.stringify(taskGuard2, null, 2));

  const res1b = runHook('.claude/hooks/guard.mjs', {
    hook_event_name: 'PreToolUse',
    agent_type: '10-core-engineer',
    tool_name: 'Edit',
    tool_input: { file_path: 'tests/frozen.test.ts' }
  });
  assert(
    res1b.status === 0 &&
    res1b.json?.hookSpecificOutput?.permissionDecision === 'deny' &&
    res1b.json?.hookSpecificOutput?.permissionDecisionReason?.includes('frozen (hash-locked) test'),
    'guard denies Edit on a frozen test (non-09 role)'
  );

  // 1c. Denies Edit outside scope
  cleanTestFiles();
  const taskGuard3 = {
    id: 'T-test-guard-3',
    status: 'claimed',
    owner_role: '10-core-engineer',
    scope: ['src/features/shift/']
  };
  fs.writeFileSync(path.join(QUEUE, `${taskGuard3.id}.json`), JSON.stringify(taskGuard3, null, 2));

  const res1c = runHook('.claude/hooks/guard.mjs', {
    hook_event_name: 'PreToolUse',
    agent_type: '10-core-engineer',
    tool_name: 'Edit',
    tool_input: { file_path: 'src/features/other/outside.ts' }
  });
  assert(
    res1c.status === 0 &&
    res1c.json?.hookSpecificOutput?.permissionDecision === 'deny' &&
    res1c.json?.hookSpecificOutput?.permissionDecisionReason?.includes('outside ticket scope'),
    'guard denies Edit outside scope'
  );

  // =========================================================================
  // 2. COMPLETION-GATE HOOK TESTS
  // =========================================================================
  console.log('\n2. Testing completion-gate.mjs (SubagentStop)...');

  // 2a. Blocks: missing report
  cleanTestFiles();
  const taskGateMissingRep = {
    id: 'T-test-missing-rep',
    status: 'claimed',
    owner_role: '10-core-engineer',
    attempts: 0,
    acceptance: [{ id: 'AC1', text: 'Implement feature' }]
  };
  fs.writeFileSync(path.join(QUEUE, `${taskGateMissingRep.id}.json`), JSON.stringify(taskGateMissingRep, null, 2));

  const res2a = runHook('.claude/hooks/completion-gate.mjs', {
    hook_event_name: 'SubagentStop',
    agent_type: '10-core-engineer'
  });
  assert(
    res2a.status === 0 &&
    res2a.json?.decision === 'block' &&
    res2a.json?.reason?.includes('Missing report'),
    'completion-gate blocks: missing report'
  );

  // 2b. Blocks: claim without evidence
  cleanTestFiles();
  const taskGateClaim = {
    id: 'T-test-claim-no-ev',
    status: 'claimed',
    owner_role: '10-core-engineer',
    attempts: 0,
    acceptance: [{ id: 'AC1', text: 'Verify calculations' }]
  };
  fs.writeFileSync(path.join(QUEUE, `${taskGateClaim.id}.json`), JSON.stringify(taskGateClaim, null, 2));
  fs.writeFileSync(path.join(REPORTS, `${taskGateClaim.id}.json`), JSON.stringify({
    items: [{
      id: 'AC1',
      status: 'done',
      evidence: { type: 'command', ref: 'npm test -- nonexistent-verify-run' }
    }]
  }, null, 2));

  const res2b = runHook('.claude/hooks/completion-gate.mjs', {
    hook_event_name: 'SubagentStop',
    agent_type: '10-core-engineer',
    last_assistant_message: 'All tests pass and everything works!'
  });
  assert(
    res2b.status === 0 &&
    res2b.json?.decision === 'block' &&
    res2b.json?.reason?.includes('FABRICATION FLAG'),
    'completion-gate blocks: claim without evidence (flags fabrication)'
  );

  // 2c. Blocks: TODO in src
  cleanTestFiles();
  const tempSrcDir = path.join(ROOT, 'src');
  const tempSrcFile = path.join(tempSrcDir, 'temp_test_todo.ts');
  fs.mkdirSync(tempSrcDir, { recursive: true });
  fs.writeFileSync(tempSrcFile, '// TODO: finish implementation later\nexport const x = 1;\n');

  try {
    const taskGateTodo = {
      id: 'T-test-todo-in-src',
      status: 'claimed',
      owner_role: '10-core-engineer',
      attempts: 0,
      acceptance: [{ id: 'AC1', text: 'Clean code' }]
    };
    fs.writeFileSync(path.join(QUEUE, `${taskGateTodo.id}.json`), JSON.stringify(taskGateTodo, null, 2));
    fs.writeFileSync(path.join(REPORTS, `${taskGateTodo.id}.json`), JSON.stringify({
      items: [{
        id: 'AC1',
        status: 'done',
        evidence: { type: 'file', ref: 'package.json:1' }
      }]
    }, null, 2));

    const res2c = runHook('.claude/hooks/completion-gate.mjs', {
      hook_event_name: 'SubagentStop',
      agent_type: '10-core-engineer'
    });
    assert(
      res2c.status === 0 &&
      res2c.json?.decision === 'block' &&
      res2c.json?.reason?.includes('Facade (TODO/TBD marker)'),
      'completion-gate blocks: TODO in src'
    );
  } finally {
    fs.rmSync(tempSrcFile, { force: true });
    // if src was empty, remove it
    if (fs.existsSync(tempSrcDir) && fs.readdirSync(tempSrcDir).length === 0) {
      fs.rmdirSync(tempSrcDir);
    }
  }

  // 2d. Blocks: .skip in tests
  cleanTestFiles();
  const tempTestDir = path.join(ROOT, 'tests');
  const tempTestFile = path.join(tempTestDir, 'temp_skip.test.ts');
  fs.mkdirSync(tempTestDir, { recursive: true });
  fs.writeFileSync(tempTestFile, 'describe("suite", () => { it.skip("skipped test", () => {}); });\n');

  try {
    const taskGateSkip = {
      id: 'T-test-skip-in-test',
      status: 'claimed',
      owner_role: '10-core-engineer',
      attempts: 0,
      acceptance: [{ id: 'AC1', text: 'Clean tests' }]
    };
    fs.writeFileSync(path.join(QUEUE, `${taskGateSkip.id}.json`), JSON.stringify(taskGateSkip, null, 2));
    fs.writeFileSync(path.join(REPORTS, `${taskGateSkip.id}.json`), JSON.stringify({
      items: [{
        id: 'AC1',
        status: 'done',
        evidence: { type: 'file', ref: 'package.json:1' }
      }]
    }, null, 2));

    const res2d = runHook('.claude/hooks/completion-gate.mjs', {
      hook_event_name: 'SubagentStop',
      agent_type: '10-core-engineer'
    });
    assert(
      res2d.status === 0 &&
      res2d.json?.decision === 'block' &&
      res2d.json?.reason?.includes('Skipped/focused test'),
      'completion-gate blocks: .skip in tests'
    );
  } finally {
    fs.rmSync(tempTestFile, { force: true });
    if (fs.existsSync(tempTestDir) && fs.readdirSync(tempTestDir).length === 0) {
      fs.rmdirSync(tempTestDir);
    }
  }

  // 2e. Blocks: Cyrillic in artifact
  cleanTestFiles();
  const tempArtifact = S('temp_cyrillic_artifact.md');
  const cyrillicContent = 'This artifact describes the ARIZ formulation: ТРИЗ метод решения задач. ' + 'A'.repeat(200);
  fs.writeFileSync(tempArtifact, cyrillicContent, 'utf8');

  try {
    const taskGateCyrillic = {
      id: 'T-test-cyrillic',
      status: 'claimed',
      owner_role: '02-rootcause-contradiction-analyst',
      attempts: 0,
      required_artifacts: ['.swarm/temp_cyrillic_artifact.md'],
      acceptance: [{ id: 'AC1', text: 'Formulate contradiction' }]
    };
    fs.writeFileSync(path.join(QUEUE, `${taskGateCyrillic.id}.json`), JSON.stringify(taskGateCyrillic, null, 2));
    fs.writeFileSync(path.join(REPORTS, `${taskGateCyrillic.id}.json`), JSON.stringify({
      items: [{
        id: 'AC1',
        status: 'done',
        evidence: { type: 'file', ref: 'package.json:1' }
      }]
    }, null, 2));

    const res2e = runHook('.claude/hooks/completion-gate.mjs', {
      hook_event_name: 'SubagentStop',
      agent_type: '02-rootcause-contradiction-analyst'
    });
    assert(
      res2e.status === 0 &&
      res2e.json?.decision === 'block' &&
      res2e.json?.reason?.includes('Cyrillic characters in .swarm/temp_cyrillic_artifact.md'),
      'completion-gate blocks: Cyrillic in artifact'
    );
  } finally {
    fs.rmSync(tempArtifact, { force: true });
  }

  // 2f. Escalates on attempt 3
  cleanTestFiles();
  const taskGateEsc = {
    id: 'T-test-escalate',
    status: 'claimed',
    owner_role: '10-core-engineer',
    attempts: 2, // 3rd failure triggers escalation
    acceptance: [{ id: 'AC1', text: 'Task needing escalation' }]
  };
  fs.writeFileSync(path.join(QUEUE, `${taskGateEsc.id}.json`), JSON.stringify(taskGateEsc, null, 2));
  // No report provided -> causes failure

  const res2f = runHook('.claude/hooks/completion-gate.mjs', {
    hook_event_name: 'SubagentStop',
    agent_type: '10-core-engineer'
  });
  const reloadedEscTask = JSON.parse(fs.readFileSync(path.join(QUEUE, `${taskGateEsc.id}.json`), 'utf8'));
  assert(
    res2f.status === 0 &&
    res2f.json?.systemMessage?.includes('escalated to 12-systematic-debugger after 3 failed gate attempts') &&
    reloadedEscTask.status === 'escalated' &&
    reloadedEscTask.attempts === 3,
    'completion-gate escalates on attempt 3'
  );

  // 2g. Passes a valid fixture and creates downstream task
  cleanTestFiles();
  const taskValid = {
    id: 'T-valid-01',
    status: 'claimed',
    owner_role: '02-rootcause-contradiction-analyst',
    level: 'L2',
    attempts: 0,
    acceptance: [{ id: 'AC1', text: 'Contradiction formulated' }]
  };
  fs.writeFileSync(path.join(QUEUE, `${taskValid.id}.json`), JSON.stringify(taskValid, null, 2));
  fs.writeFileSync(path.join(REPORTS, `${taskValid.id}.json`), JSON.stringify({
    items: [{
      id: 'AC1',
      status: 'done',
      evidence: { type: 'file', ref: 'package.json:1' }
    }]
  }, null, 2));

  const res2g = runHook('.claude/hooks/completion-gate.mjs', {
    hook_event_name: 'SubagentStop',
    agent_type: '02-rootcause-contradiction-analyst'
  });
  const reloadedValidTask = JSON.parse(fs.readFileSync(path.join(QUEUE, `${taskValid.id}.json`), 'utf8'));
  const downstreamName = process.platform === 'win32' ? 'T-valid-01_to_04-openspec-architect.json' : 'T-valid-01>04-openspec-architect.json';
  const downstreamFile = path.join(QUEUE, downstreamName);
  const downstreamExists = fs.existsSync(downstreamFile);
  const downstreamTask = downstreamExists ? JSON.parse(fs.readFileSync(downstreamFile, 'utf8')) : null;

  assert(
    res2g.status === 0 &&
    !res2g.json?.decision &&
    reloadedValidTask.status === 'done' &&
    downstreamExists &&
    downstreamTask?.owner_role === '04-openspec-architect' &&
    downstreamTask?.status === 'todo',
    'completion-gate passes valid fixture and creates downstream task (pipeline handoff)'
  );

  // 2h. Blocks when requires_visual_proof is true but no screenshot exists
  cleanTestFiles();
  const taskVisualReq = {
    id: 'T-test-visual-req',
    status: 'claimed',
    owner_role: '14-automated-visual-sentinel',
    requires_visual_proof: true,
    attempts: 0,
    acceptance: [{ id: 'AC1', text: 'Visual patrol check' }]
  };
  fs.writeFileSync(path.join(QUEUE, `${taskVisualReq.id}.json`), JSON.stringify(taskVisualReq, null, 2));
  fs.writeFileSync(path.join(REPORTS, `${taskVisualReq.id}.json`), JSON.stringify({
    items: [{
      id: 'AC1',
      status: 'done',
      evidence: { type: 'file', ref: 'package.json:1' }
    }]
  }, null, 2));

  const res2h = runHook('.claude/hooks/completion-gate.mjs', {
    hook_event_name: 'SubagentStop',
    agent_type: '14-automated-visual-sentinel'
  });
  assert(
    res2h.status === 0 &&
    res2h.json?.decision === 'block' &&
    res2h.json?.reason?.includes('ZERO-TRUST VETO: Task requires visual handover screenshot'),
    'completion-gate blocks: missing visual handover screenshot proof'
  );

  // 2i. Blocks when scope_matrix has forgotten pages/routes
  cleanTestFiles();
  const taskScopeMatrix = {
    id: 'T-test-scope-matrix',
    status: 'claimed',
    owner_role: '07-strategic-planner',
    scope_matrix: ['/', '/#/rooms', '/#/guests', '/#/settings'],
    attempts: 0,
    acceptance: [{ id: 'AC1', text: 'Exhaustive route audit' }]
  };
  fs.writeFileSync(path.join(QUEUE, `${taskScopeMatrix.id}.json`), JSON.stringify(taskScopeMatrix, null, 2));
  fs.writeFileSync(path.join(REPORTS, `${taskScopeMatrix.id}.json`), JSON.stringify({
    screen_audits: ['/'],
    items: [{
      id: 'AC1',
      status: 'done',
      route: '/',
      evidence: { type: 'file', ref: 'package.json:1' }
    }]
  }, null, 2));

  const res2i = runHook('.claude/hooks/completion-gate.mjs', {
    hook_event_name: 'SubagentStop',
    agent_type: '07-strategic-planner'
  });
  assert(
    res2i.status === 0 &&
    res2i.json?.decision === 'block' &&
    res2i.json?.reason?.includes('ZERO-TRUST VETO: Incomplete scope scan. Forgotten pages/routes detected: [/#/rooms, /#/guests, /#/settings]'),
    'completion-gate blocks: forgotten pages in scope_matrix'
  );

  // 2j. Passes when visual proof and scope_matrix are fully satisfied
  cleanTestFiles();
  const tempScreenshot = path.join(ROOT, 'docs', 'screenshots', 'temp_zero_trust.png');
  fs.mkdirSync(path.dirname(tempScreenshot), { recursive: true });
  fs.writeFileSync(tempScreenshot, Buffer.alloc(1024, 0xAA));

  try {
    const taskZeroTrustPass = {
      id: 'T-test-zt-pass',
      status: 'claimed',
      owner_role: '14-automated-visual-sentinel',
      requires_visual_proof: true,
      scope_matrix: ['/', '/#/rooms'],
      attempts: 0,
      acceptance: [{ id: 'AC1', text: 'Visual patrol check' }]
    };
    fs.writeFileSync(path.join(QUEUE, `${taskZeroTrustPass.id}.json`), JSON.stringify(taskZeroTrustPass, null, 2));
    fs.writeFileSync(path.join(REPORTS, `${taskZeroTrustPass.id}.json`), JSON.stringify({
      screen_audits: ['/', '/#/rooms'],
      items: [{
        id: 'AC1',
        status: 'done',
        route: '/',
        evidence: { type: 'screenshot', ref: 'docs/screenshots/temp_zero_trust.png' }
      }]
    }, null, 2));

    const res2j = runHook('.claude/hooks/completion-gate.mjs', {
      hook_event_name: 'SubagentStop',
      agent_type: '14-automated-visual-sentinel'
    });
    const reloadedZt = JSON.parse(fs.readFileSync(path.join(QUEUE, `${taskZeroTrustPass.id}.json`), 'utf8'));
    assert(
      res2j.status === 0 &&
      !res2j.json?.decision &&
      reloadedZt.status === 'done',
      'completion-gate passes: Zero-Trust verified with screenshot & full 9-route scope matrix'
    );
  } finally {
    fs.rmSync(tempScreenshot, { force: true });
  }

  // =========================================================================
  // 3. QUEUE-PUMP HOOK TESTS
  // =========================================================================
  console.log('\n3. Testing queue-pump.mjs (Stop)...');

  // 3a. Blocks coordinator Stop when ready tasks exist
  cleanTestFiles();
  const taskReadyPump = {
    id: 'T-test-ready-pump',
    status: 'todo',
    owner_role: '10-core-engineer',
    priority: 1
  };
  fs.writeFileSync(path.join(QUEUE, `${taskReadyPump.id}.json`), JSON.stringify(taskReadyPump, null, 2));

  const res3a = runHook('.claude/hooks/queue-pump.mjs', {});
  assert(
    res3a.status === 0 &&
    res3a.json?.decision === 'block' &&
    res3a.json?.reason?.includes('QUEUE NOT EMPTY — coordinator must not stop'),
    'queue-pump blocks coordinator Stop when ready tasks exist'
  );

  // 3b. Allows coordinator Stop when queue empty
  cleanTestFiles();
  const res3b = runHook('.claude/hooks/queue-pump.mjs', {});
  assert(
    res3b.status === 0 &&
    !res3b.json?.decision,
    'queue-pump allows coordinator Stop when queue empty'
  );

  // =========================================================================
  // 4. TEAMMATE-IDLE HOOK TESTS
  // =========================================================================
  console.log('\n4. Testing teammate-idle.mjs (TeammateIdle)...');

  // 4a. Exits 2 when a ready task exists for teammate
  cleanTestFiles();
  const taskIdleReady = {
    id: 'T-test-idle-ready',
    status: 'todo',
    owner_role: '10-core-engineer',
    goal: 'Build core feature'
  };
  fs.writeFileSync(path.join(QUEUE, `${taskIdleReady.id}.json`), JSON.stringify(taskIdleReady, null, 2));

  const res4a = runHook('.claude/hooks/teammate-idle.mjs', {
    teammate_name: '10-core-engineer'
  });
  assert(
    res4a.status === 2 &&
    res4a.stderr?.includes('Do not go idle. Claim next ticket: T-test-idle-ready'),
    'teammate-idle exits 2 when a ready task exists'
  );

  // 4b. Allows (exit 0) when no ready tasks exist for teammate
  const res4b = runHook('.claude/hooks/teammate-idle.mjs', {
    teammate_name: 'nonexistent-idle-role'
  });
  assert(
    res4b.status === 0,
    'teammate-idle allows (exit 0) when no ready task exists for teammate'
  );

  // Clean up all test files after complete run
  cleanTestFiles();

  console.log('\n=============================================');
  console.log(`TOTAL HOOK TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
} catch (err) {
  console.error('Test execution error:', err);
  cleanTestFiles();
  process.exit(1);
}
