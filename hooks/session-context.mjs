import { readInput, listTasks, readyTasks, readJson, S } from './swarm-lib.mjs';

await readInput();
const all = listTasks();
const sb = readJson(S('scoreboard.json'), {});
console.log(`SWARM STATE: ${all.filter(t => t.status === 'done').length}/${all.length} done; ready: ${readyTasks(all).map(t => t.id).join(', ') || 'none'}`);
console.log(`Blocked on human: ${all.filter(t => t.status === 'blocked_on_human').map(t => t.id).join(', ') || 'none'}`);
console.log(`Scoreboard: ${JSON.stringify(sb)}`);
console.log('Rule: you are the coordinator. Dispatch, do not code. Do not end a turn while tickets are ready.');
