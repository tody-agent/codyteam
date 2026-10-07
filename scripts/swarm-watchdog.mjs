import { spawn } from 'node:child_process';
import { listTasks, readyTasks, readJsonl, saveTask, bump, event, S, ROOT } from '../.claude/hooks/swarm-lib.mjs';

const IDLE_MIN = Number(process.env.SWARM_IDLE_MIN || 10);

function tick() {
  for (const t of listTasks().filter(t => t.status === 'claimed' && Date.parse(t.lease_until) < Date.now())) {
    t.status = 'todo';
    t.attempts = (t.attempts || 0) + 1;
    t.last_problems = [...(t.last_problems || []), 'Lease expired: work abandoned without report.'];
    saveTask(t);
    bump(t.owner_role, 'abandoned');
    event('lease_expired', { task: t.id, role: t.owner_role });
  }
  const last = readJsonl(S('evidence.jsonl')).at(-1)?.ts;
  if (readyTasks().length && (!last || Date.now() - Date.parse(last) > IDLE_MIN * 60e3)) {
    const cmd = process.env.SWARM_RESUME_CMD || 'claude -p --continue "Coordinator: resume the swarm. Run node scripts/swarm.mjs status and dispatch all ready tickets."';
    spawn(cmd, { cwd: ROOT, shell: true, stdio: 'ignore', detached: true }).unref();
    event('watchdog_resume', {});
  }
}

tick();
if (process.argv.includes('--loop')) setInterval(tick, 120_000);
