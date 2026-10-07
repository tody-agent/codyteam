import { readInput, listTasks, readyTasks, saveTask, now, LEASE_MIN } from './swarm-lib.mjs';
const i = await readInput(); const role = i.agent_type; if (!role) process.exit(0);
const all = listTasks();
let t = all.find(x => x.owner_role === role && x.status === 'claimed') || readyTasks(all).find(x => x.owner_role === role);
const out = ctx => { process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SubagentStart', additionalContext: ctx } })); process.exit(0); };
if (!t) out(`NO TICKET in queue for ${role}. Reply exactly "NO_TICKET" and stop. Do not invent work.`);
t.status = 'claimed'; t.claimed_at = now(); t.lease_until = new Date(Date.now() + LEASE_MIN * 60e3).toISOString(); saveTask(t);
out([
  `YOUR TICKET: ${t.id} (level ${t.level || 'L0'}) — ${t.goal || ''}`,
  `Scope (edits outside are denied): ${(t.scope || []).join(', ') || 'reports only'}`,
  `Acceptance:\n${(t.acceptance || []).map(a => `  - ${a.id}: ${a.text}`).join('\n')}`,
  `Required artifacts: ${(t.required_artifacts || []).join(', ') || 'none'}`,
  `Gate will re-run: ${t.verify_cmd || 'n/a'}`,
  t.last_problems?.length ? `PREVIOUS GATE FAILURES (fix these first):\n  - ${t.last_problems.join('\n  - ')}` : '',
  `Write evidence to .swarm/reports/${t.id}.json. Only the gate can close this ticket.`,
].filter(Boolean).join('\n'));
