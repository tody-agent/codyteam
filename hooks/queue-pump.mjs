import { readInput, listTasks, readyTasks, readJson, writeJson, S, blockJson } from './swarm-lib.mjs';

const i = await readInput();
if (i.agent_type) process.exit(0);
const all = listTasks();
const ready = readyTasks(all);
const stale = all.filter(t => t.status === 'claimed' && Date.parse(t.lease_until) < Date.now());
const escalated = all.filter(t => t.status === 'escalated' && !t.escalation_dispatched);

if (!ready.length && !stale.length && !escalated.length) process.exit(0);

const sig = [...ready, ...stale, ...escalated].map(t => t.id).join(',');
const st = readJson(S('pump.json'), { sig: '', n: 0 });
st.n = st.sig === sig ? st.n + 1 : 1;
st.sig = sig;
writeJson(S('pump.json'), st);

if (st.n > 3) {
  process.stdout.write(JSON.stringify({ systemMessage: `SWARM STALLED on: ${sig}. Human attention needed.` }));
  process.exit(0);
}

blockJson(`QUEUE NOT EMPTY — coordinator must not stop. Dispatch now (parallel when independent):\n` +
  ready.map(t => `- ${t.id} -> subagent ${t.owner_role}`).join('\n') +
  (stale.length ? `\nLease expired (re-dispatch): ${stale.map(t => t.id).join(', ')}` : '') +
  (escalated.length ? `\nEscalated (dispatch 12-systematic-debugger or ask human): ${escalated.map(t => t.id).join(', ')}` : ''));
