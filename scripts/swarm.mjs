import { saveTask, listTasks, readJson, writeJson, S } from '../.claude/hooks/swarm-lib.mjs';

const [cmd, ...a] = process.argv.slice(2);
const arg = k => a[a.indexOf(`--${k}`) + 1];

if (cmd === 'new') {
  const role = arg('role');
  const tpl = readJson(S('templates.json'), {})[role] || {};
  const id = `T-${Date.now().toString(36)}`;
  saveTask({
    ...tpl,
    id,
    owner_role: role,
    status: 'todo',
    level: arg('level') || 'L0',
    goal: arg('goal'),
    scope: arg('scope') ? arg('scope').split(',') : tpl.scope || [],
    depends_on: [],
    attempts: 0
  });
  console.log(id);
} else if (cmd === 'status') {
  for (const t of listTasks()) {
    console.log(`${t.status.padEnd(16)} ${t.owner_role.padEnd(36)} ${t.id}  att=${t.attempts || 0}`);
  }
} else if (cmd === 'answer') {
  writeJson(S('answers', `${arg('task')}.json`), { answer: arg('text') });
  const t = listTasks().find(x => x.id === arg('task'));
  if (t) {
    t.status = 'todo';
    t.human_answer = arg('text');
    saveTask(t);
  }
}
