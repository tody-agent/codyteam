import { readInput, appendJsonl, S, claimedBy, saveTask, LEASE_MIN } from './swarm-lib.mjs';
const i = await readInput(); const role = i.agent_type || 'main';
const rec = { event: i.hook_event_name, ok: i.hook_event_name === 'PostToolUse', agent: role, tool: i.tool_name };
const inp = i.tool_input || {};
if (i.tool_name === 'Bash') rec.command = inp.command;
if (/Edit|Write/.test(i.tool_name || '')) rec.file = inp.file_path;
if (i.tool_name === 'WebFetch') rec.url = inp.url;
appendJsonl(S('evidence.jsonl'), rec);
const t = role !== 'main' && claimedBy(role); // implicit heartbeat
if (t) { t.lease_until = new Date(Date.now() + LEASE_MIN * 60e3).toISOString(); saveTask(t); }
process.exit(0);
