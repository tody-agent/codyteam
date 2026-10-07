import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { ROOT, S, readJson, readJsonl, sha256, sh, safeFile } from './swarm-lib.mjs';

const PLACEHOLDER = /\b(TODO|TBD|FIXME|lorem ipsum|placeholder|not implemented)\b/i;
const CYRILLIC = /[\u0400-\u04FF]/;
const FACADE = [
  [/\b(TODO|FIXME|TBD)\b/, 'TODO/TBD marker'],
  [/throw new Error\(\s*['"`](not implemented|todo)/i, 'not-implemented throw'],
  [/\b(unimplemented|todo)!\(/, 'Rust stub macro'],
  [/\bas any\b|:\s*any\b/, 'any type'],
  [/return\s+(null|undefined|\[\]|\{\})\s*;?\s*\/\/\s*(stub|mock|temp|fake)/i, 'stub return'],
  [/\b(mock|fake|dummy)[A-Z_]\w*\s*=/, 'mock/fake object in production code'],
];
const TEST_CHEAT = /\b(it|test|describe)\.(skip|only|todo)\(|\bxit\(|#\[ignore\]/;
const CLAIM = /(all tests pass|tests? (are )?(green|passing)|verified|build (succeeds|passed)|fully implemented|no errors|everything works)/i;

const VALIDATORS = {
  'triz-card'() {
    const c = readJson(S('TRIZ-CARD.json')); const p = [];
    if (!c) return ['TRIZ-CARD.json missing or invalid JSON'];
    for (const k of ['surface_problem_AC', 'TC1', 'TC2', 'chosen_TC', 'intensified', 'OZ', 'OT', 'resources', 'IFR', 'PC'])
      if (!c[k] || (typeof c[k] === 'string' && c[k].trim().length < 8)) p.push(`TRIZ-CARD.${k} missing/too vague`);
    if (c.PC && !/must .+ and must not|must .+ and .+ must not/i.test(c.PC)) p.push('PC must have form "<OZ> must <S> ... and must not <S> ..."');
    if (c.OZ && /^(system|app|everything|ui|backend)$/i.test(String(c.OZ).trim())) p.push('OZ is generic; name the exact screen/command/table/function');
    if (c.intensified && !/\b(no|zero|none|absent|without)\b/i.test(c.intensified)) p.push('TC not intensified to an extreme (no/zero/absent)');
    return p;
  },
};

export function verifyTask(task, role, lastMessage = '') {
  const problems = [];
  const report = readJson(S('reports', `${task.id}.json`)) || readJson(S('reports', `${safeFile(task.id)}.json`));
  const ev = readJsonl(S('evidence.jsonl'));
  const lastEdit = ev.filter(e => e.agent === role && e.file && e.ok).map(e => e.ts).sort().at(-1) || '';

  if (!report) problems.push(`Missing report .swarm/reports/${task.id}.json (see SWARM-SPEC section 6).`);

  for (const a of task.acceptance || []) {
    const r = report?.items?.find(x => x.id === a.id);
    if (!r) { problems.push(`${a.id} not reported: "${a.text}"`); continue; }
    if (r.status === 'deferred') { if (!r.reason || !r.followup_task) problems.push(`${a.id} deferred without reason + followup_task`); continue; }
    if (r.status === 'blocked') { if (!r.needs) problems.push(`${a.id} blocked without "needs"`); continue; }
    if (r.status !== 'done') { problems.push(`${a.id} status="${r.status}"`); continue; }
    const e = r.evidence || {};
    if (e.type === 'command') {
      if (!ev.some(x => x.agent === role && x.ok && x.command?.includes(e.ref) && x.ts >= lastEdit))
        problems.push(`${a.id}: no successful run of "${e.ref}" recorded AFTER your last edit.`);
    } else if (e.type === 'file') {
      const [f, line] = String(e.ref).split(':');
      const fullPath = path.resolve(ROOT, f);
      if (!fs.existsSync(fullPath)) problems.push(`${a.id}: cited file ${f} does not exist.`);
      else if (line && fs.readFileSync(fullPath, 'utf8').split('\n').length < Number(line)) problems.push(`${a.id}: ${f} has no line ${line}.`);
    } else if (e.type === 'url') {
      if (!ev.some(x => x.url === e.ref)) problems.push(`${a.id}: URL never fetched (${e.ref}). No citation without retrieval.`);
    } else if (e.type === 'screenshot' || e.type === 'image') {
      const imgPath = path.resolve(ROOT, e.ref);
      if (!fs.existsSync(imgPath)) problems.push(`${a.id}: visual screenshot proof missing at ${e.ref}.`);
      else if (fs.statSync(imgPath).size < 100) problems.push(`${a.id}: visual screenshot proof ${e.ref} is empty/corrupt.`);
    } else if (e.type === 'tri-proof') {
      const codeRef = e.code;
      const cmdRef = e.test;
      const imgRef = e.screenshot;
      if (!codeRef || !cmdRef || !imgRef) {
        problems.push(`${a.id}: tri-proof requires code (file:line), test (command), and screenshot (image path).`);
      } else {
        const [f, line] = String(codeRef).split(':');
        const fullPath = path.resolve(ROOT, f);
        if (!fs.existsSync(fullPath)) problems.push(`${a.id}: tri-proof cited file ${f} does not exist.`);
        else if (line && fs.readFileSync(fullPath, 'utf8').split('\n').length < Number(line)) problems.push(`${a.id}: ${f} has no line ${line}.`);
        if (!ev.some(x => x.agent === role && x.ok && x.command?.includes(cmdRef) && x.ts >= lastEdit))
          problems.push(`${a.id}: tri-proof: no successful run of "${cmdRef}" recorded AFTER your last edit.`);
        const imgPath = path.resolve(ROOT, imgRef);
        if (!fs.existsSync(imgPath)) problems.push(`${a.id}: tri-proof visual screenshot proof missing at ${imgRef}.`);
        else if (fs.statSync(imgPath).size < 100) problems.push(`${a.id}: tri-proof visual screenshot ${imgRef} is empty.`);
      }
    } else problems.push(`${a.id}: evidence missing or unknown type.`);
  }

  // Zero-Trust Visual Proof Enforcement
  if (task.requires_visual_proof) {
    const hasVisualEvidence = report?.items?.some(it => {
      const et = it.evidence?.type;
      if (et === 'screenshot' || et === 'image') {
        const p = path.resolve(ROOT, it.evidence.ref);
        return fs.existsSync(p) && fs.statSync(p).size >= 100;
      }
      if (et === 'tri-proof') {
        const p = it.evidence?.screenshot && path.resolve(ROOT, it.evidence.screenshot);
        return p && fs.existsSync(p) && fs.statSync(p).size >= 100;
      }
      return false;
    });
    if (!hasVisualEvidence) {
      problems.push('ZERO-TRUST VETO: Task requires visual handover screenshot, but no valid screenshot proof was found on disk.');
    }
  }

  // Zero-Trust Exhaustive Page Matrix Enforcement
  if (Array.isArray(task.scope_matrix) && task.scope_matrix.length > 0) {
    const auditedRoutes = new Set((report?.screen_audits || []).concat(report?.items?.map(it => it.route || it.screen) || []).filter(Boolean));
    const missingRoutes = task.scope_matrix.filter(route => !auditedRoutes.has(route));
    if (missingRoutes.length > 0) {
      problems.push(`ZERO-TRUST VETO: Incomplete scope scan. Forgotten pages/routes detected: [${missingRoutes.join(', ')}]. All pages in scope_matrix must be audited.`);
    }
  }

  for (const p of task.required_artifacts || []) {
    const f = path.resolve(ROOT, p);
    if (!fs.existsSync(f)) { problems.push(`Artifact missing: ${p}`); continue; }
    const t = fs.readFileSync(f, 'utf8');
    if (t.trim().length < (task.min_artifact_chars ?? 200)) problems.push(`Artifact too thin: ${p}`);
    if (PLACEHOLDER.test(t)) problems.push(`Placeholder text in ${p}`);
    if (CYRILLIC.test(t)) problems.push(`Cyrillic characters in ${p}; use ASCII TRIZ terms (TC/PC/IFR/SFR/OZ/OT).`);
  }
  for (const v of task.validators || []) problems.push(...(VALIDATORS[v]?.() ?? [`Unknown validator ${v}`]));

  const changed = (sh('git diff --name-only HEAD') + '\n' + sh('git ls-files --others --exclude-standard'))
    .split('\n').map(s => s.trim()).filter(Boolean).filter(f => fs.existsSync(path.resolve(ROOT, f)));
  for (const f of changed) {
    const normF = f.split(path.sep).join('/');
    const t = fs.readFileSync(path.resolve(ROOT, f), 'utf8');
    const isTest = /\.(test|spec)\.|__tests__|\/tests?\//.test(normF);
    if (isTest && TEST_CHEAT.test(t)) problems.push(`Skipped/focused test in ${normF}`);
    if (!isTest && /^src\/.*\.(ts|tsx|js|mjs|rs)$/.test(normF))
      for (const [re, label] of FACADE) if (re.test(t)) problems.push(`Facade (${label}) in ${normF}`);
  }

  for (const [f, h] of Object.entries(task.frozen_tests || {}))
    if (!fs.existsSync(path.resolve(ROOT, f)) || sha256(path.resolve(ROOT, f)) !== h) problems.push(`Frozen test modified or deleted: ${f}`);

  if (problems.length === 0 && task.verify_cmd) {
    try { execSync(task.verify_cmd, { cwd: ROOT, stdio: 'pipe', timeout: 600_000 }); }
    catch (e) { problems.push(`Gate re-ran "${task.verify_cmd}" and it FAILED:\n${String(e.stdout || '').slice(-1200)}\n${String(e.stderr || '').slice(-1200)}`); }
  }

  const fabricated = problems.length > 0 && CLAIM.test(lastMessage);
  if (fabricated) problems.unshift('FABRICATION FLAG: your final message claims success, but the checks below contradict it.');
  return { problems, fabricated, report };
}
