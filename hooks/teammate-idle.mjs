import { readInput, readyTasks } from './swarm-lib.mjs';

const i = await readInput();
const who = i.teammate_name || i.agent_type;
const ready = readyTasks().filter(t => !who || t.owner_role === who);
if (!ready.length) process.exit(0);

process.stderr.write(`Do not go idle. Claim next ticket: ${ready[0].id} (${ready[0].goal || ''}).`);
process.exit(2);
