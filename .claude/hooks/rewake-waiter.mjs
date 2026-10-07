import fs from 'node:fs';
import { readInput, readyTasks, readJsonl, S } from './swarm-lib.mjs';

const i = await readInput();
if (i.agent_type) process.exit(0);

const lock = S('waiter.lock');
if (fs.existsSync(lock) && Date.now() - fs.statSync(lock).mtimeMs < 4 * 3600e3) process.exit(0);
fs.writeFileSync(lock, String(process.pid));

const sleep = ms => new Promise(r => setTimeout(r, ms));
const answersDir = S('answers');
const seen = new Set(fs.existsSync(answersDir) ? fs.readdirSync(answersDir) : []);

for (let k = 0; k < 4 * 60 * 4; k++) { // up to ~4h, every 15s
  await sleep(15_000);
  const lastMain = readJsonl(S('evidence.jsonl')).filter(e => e.agent === 'main').at(-1)?.ts;
  if (lastMain && Date.now() - Date.parse(lastMain) < 60_000) continue; // coordinator is active
  const ready = readyTasks();
  const newAnswers = (fs.existsSync(answersDir) ? fs.readdirSync(answersDir) : []).filter(f => !seen.has(f));
  if (ready.length || newAnswers.length) {
    fs.rmSync(lock, { force: true });
    process.stderr.write(`WAKE UP: ${ready.length} ready ticket(s) [${ready.map(t => t.id).join(', ')}]` +
      (newAnswers.length ? `; human answered: ${newAnswers.join(', ')}` : '') + '. Resume dispatching.');
    process.exit(2); // exit 2 => wakes Claude
  }
}
fs.rmSync(lock, { force: true });
process.exit(0);
