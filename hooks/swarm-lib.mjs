import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

export const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
export const S = (...p) => path.join(ROOT, '.swarm', ...p);
export const LEASE_MIN = 20;
export const MAX_ATTEMPTS = 3;

export async function readInput() {
  let d = ''; for await (const c of process.stdin) d += c;
  return d ? JSON.parse(d) : {};
}
export const now = () => new Date().toISOString();
export function readJson(f, fb = null) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return fb; } }
export function writeJson(f, o) {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f + '.tmp', JSON.stringify(o, null, 2)); fs.renameSync(f + '.tmp', f);
}
export function appendJsonl(f, o) {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.appendFileSync(f, JSON.stringify({ ts: now(), ...o }) + '\n');
}
export function readJsonl(f) {
  if (!fs.existsSync(f)) return [];
  return fs.readFileSync(f, 'utf8').split('\n').filter(Boolean)
    .map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}
export function listTasks() {
  const dir = S('queue'); if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => readJson(path.join(dir, f))).filter(Boolean);
}
export const safeFile = name => (process.platform === 'win32' ? String(name).replace(/>/g, '_to_') : String(name));
export const saveTask = t => writeJson(S('queue', `${safeFile(t.id)}.json`), t);
export const depsDone = (t, all) => (t.depends_on || []).every(id => all.find(x => x.id === id)?.status === 'done');
export const claimedBy = role => listTasks().find(t => t.owner_role === role && t.status === 'claimed');
export const readyTasks = (all = listTasks()) =>
  all.filter(t => ['todo', 'rework'].includes(t.status) && depsDone(t, all)).sort((a, b) => (a.priority ?? 9) - (b.priority ?? 9));
export const sha256 = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
export function sh(cmd) { try { return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' }); } catch { return ''; } }
export function bump(role, key) {
  const f = S('scoreboard.json'); const sb = readJson(f, {});
  sb[role] ??= {}; sb[role][key] = (sb[role][key] || 0) + 1; writeJson(f, sb);
}
export const event = (type, data) => appendJsonl(S('events.jsonl'), { type, ...data });
export const blockJson = reason => { process.stdout.write(JSON.stringify({ decision: 'block', reason })); process.exit(0); };
