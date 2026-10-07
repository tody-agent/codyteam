# Zero-Trust Tri-Proof Verification in Codyteam

Codyteam operates on a strict **Zero-Trust Enforcement Model**. Agents are never permitted to close their own tickets or declare work done without physical proof.

## 1. The Tri-Proof Standard

Every completed task must provide three distinct forms of evidence:
1. **Code Evidence**: Exact `file:line` citation pointing to verified modifications.
2. **Test Evidence**: Executed test suite output confirming green status (`0 failures`) with exit code `0`.
3. **Visual Screenshot Evidence**: Physical `.png` screenshot captured from the live application and saved to `.audit/screenshots/` with non-zero byte size on disk.

## 2. Enforcement Hooks & Exit Codes

All policy enforcement is handled deterministically via Node built-ins in `.claude/hooks/`:

| Hook | Lifecycle Event | Enforcement Behavior |
|---|---|---|
| `guard.mjs` | `PreToolUse` | Blocks edits on `.claude/settings.json`, frozen tests, or files outside the task scope. Returns exit code 2 or JSON denial. |
| `completion-gate.mjs` | `SubagentStop` | Validates report presence, checks for TODOs/skip flags, verifies Cyrillic absence, audits Tri-Proof evidence, and checks the 9-Route Scope Matrix. Exits 2 on failure. |
| `queue-pump.mjs` | `Stop` | Blocks coordinator from stopping if unclaimed or ready tasks exist in `.swarm/queue/`. |
| `teammate-idle.mjs` | `TeammateIdle` | Wakes idle agents with ready work from the pipeline; exits 2 if ready tasks exist. |

## 3. Scope Matrix Verification

When UI changes occur, `task.scope_matrix` requires verification across all 9 core routes:
1. `/` (Dashboard)
2. `/#/rooms` (Rooms Grid)
3. `/#/reservations` (Reservations Table)
4. `/#/guests` (Guests Directory)
5. `/#/groups` (Group Management)
6. `/#/analytics` (Analytics)
7. `/#/night-audit` (Night Audit)
8. `/#/declaration` (Police Declaration)
9. `/#/settings` (Settings)

If any required route is omitted from the implementation, the gate triggers a veto:
`ZERO-TRUST VETO: Forgotten pages/routes detected in implementation!`
