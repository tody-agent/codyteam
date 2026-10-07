import path from 'node:path';
import { readInput, ROOT, claimedBy } from './swarm-lib.mjs';

const i = await readInput();
const role = i.agent_type || 'main';
const t = i.tool_name;
const inp = i.tool_input || {};
const deny = msg => {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: msg
    }
  }));
  process.exit(0);
};
const rel = p => path.relative(ROOT, path.resolve(ROOT, p || '')).split(path.sep).join('/');

if (/Edit|Write/.test(t)) {
  const f = rel(inp.file_path || inp.notebook_path);
  if (/^\.claude\/|^\.swarm\/(?!reports\/|TRIZ-CARD\.json|triz-ledger\.jsonl)/.test(f))
    deny(`Protected swarm infrastructure: ${f}. Agents may write only .swarm/reports/, TRIZ-CARD.json, triz-ledger.jsonl.`);
  if (role === 'main' && /^src\//.test(f)) deny('Coordinator does not write product code. Create a ticket for 10-core-engineer.');
  const task = role === 'main' ? null : claimedBy(role);
  if (role !== 'main' && !task) deny(`No claimed ticket for ${role}. No ticket, no work.`);
  if (task?.frozen_tests && f in task.frozen_tests && role !== '09-tdd-architect')
    deny(`${f} is a frozen (hash-locked) test. Request a rework ticket for 09-tdd-architect.`);
  if (task?.scope?.length && !f.startsWith('.swarm/') && !task.scope.some(s => f.startsWith(s)))
    deny(`${f} is outside ticket scope [${task.scope.join(', ')}]. Report it as deferred with a followup_task instead.`);
}
if (t === 'Bash') {
  const c = inp.command || '';
  const writes = /(>|>>|\btee\b|\brm\b|\bmv\b|\bcp\b|sed -i|truncate|node -e|python3? -c)/;
  if (/\.swarm\/(evidence|queue|scoreboard)|\.claude\//.test(c) && writes.test(c)) deny('Shell write to protected swarm infrastructure.');
  for (const [re, why] of [[/--no-verify|git commit\s+-n\b/, 'bypasses git hooks'], [/disableAllHooks/, 'disables hooks'],
    [/git (reset --hard|push --force|clean -fd|checkout -- \.)/, 'destroys work']])
    if (re.test(c)) deny(`Blocked: command ${why}.`);
}
process.exit(0);
