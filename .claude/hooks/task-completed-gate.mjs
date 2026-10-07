import { readInput, listTasks } from './swarm-lib.mjs';
import { verifyTask } from './gate-core.mjs';

const i = await readInput();
const id = JSON.stringify(i).match(/\[(T-[\w.>-]+)\]/)?.[1];
const task = id && listTasks().find(t => t.id === id);
if (!task) process.exit(0);

const { problems } = verifyTask(task, task.owner_role, '');
if (problems.length) {
  process.stderr.write(`Cannot complete ${id}:\n- ${problems.join('\n- ')}`);
  process.exit(2);
}
process.exit(0);
