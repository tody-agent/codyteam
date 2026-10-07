import { readInput, readJson, S, saveTask, listTasks, claimedBy, bump, event, blockJson, MAX_ATTEMPTS, now } from './swarm-lib.mjs';
import { verifyTask } from './gate-core.mjs';

const i = await readInput();
const role = i.agent_type;
if (!role) process.exit(0);
const task = claimedBy(role);
if (!task) process.exit(0);

const { problems, fabricated, report } = verifyTask(task, role, i.last_assistant_message || '');
if (fabricated) bump(role, 'fabrication_flags');

// A blocked item with "needs" is a legitimate stop: route it, don't punish it.
const blockedItem = report?.items?.find(x => x.status === 'blocked' && x.needs);
if (problems.length === 0 && blockedItem) {
  task.status = blockedItem.needs === 'human' ? 'blocked_on_human' : 'todo';
  if (blockedItem.needs !== 'human') task.owner_role = blockedItem.needs;
  saveTask(task); event('blocked', { task: task.id, role, needs: blockedItem.needs, question: report.question });
  process.exit(0);
}

if (problems.length) {
  task.attempts = (task.attempts || 0) + 1;
  task.last_problems = problems;
  if (task.attempts >= MAX_ATTEMPTS) {
    task.status = 'escalated'; task.escalated_to = task.escalate_to || '12-systematic-debugger';
    saveTask(task); bump(role, 'escalations');
    event('escalated', { task: task.id, role, problems });
    process.stdout.write(JSON.stringify({ systemMessage: `Ticket ${task.id} escalated to ${task.escalated_to} after ${MAX_ATTEMPTS} failed gate attempts.` }));
    process.exit(0);
  }
  saveTask(task); bump(role, 'gate_blocks');
  blockJson(`COMPLETION GATE: ticket ${task.id} is NOT done (attempt ${task.attempts}/${MAX_ATTEMPTS}).\n` +
    `Fix every item below, update .swarm/reports/${task.id}.json, then finish again:\n- ${problems.join('\n- ')}`);
}

// PASS -> close and push work downstream
const pipeline = readJson(S('pipeline.json'), {});
const templates = readJson(S('templates.json'), {});
task.status = 'done'; task.done_at = now(); saveTask(task); bump(role, 'done');
event('done', { task: task.id, role });

const all = listTasks();
if (report?.verdict === 'reject' && task.rework_to) {
  saveTask({ id: `${task.id}.rework${(task.attempts || 0) + 1}`, owner_role: task.rework_to, status: 'rework',
    priority: 0, depends_on: [], goal: `Rework requested by ${role}`, scope: task.parent_scope || [],
    acceptance: (report.defects || []).map((d, k) => ({ id: `D${k + 1}`, text: d })),
    verify_cmd: task.parent_verify_cmd, reviewer_role: role, attempts: 0 });
  bump(task.rework_to, 'rework_received');
  event('rework', { from: role, to: task.rework_to, task: task.id });
} else {
  for (const next of pipeline[role] || []) {
    const id = `${task.id.split('>')[0]}>${next}`;
    if (all.some(t => t.id === id)) continue;
    saveTask({ ...(templates[next] || {}), id, owner_role: next, status: 'todo', depends_on: [task.id],
      level: task.level, frozen_tests: task.frozen_tests, rework_to: role, attempts: 0 });
    event('handoff', { from: role, to: next, task: id });
  }
}
process.exit(0);
