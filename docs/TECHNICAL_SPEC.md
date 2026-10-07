# Codyteam Technical Specification
> **Architecture, Hook Lifecycle, IPC Bus, and Zero-Trust Mechanics**

## 1. System Architecture

```
                  +--------------------------------+
                  |  01 Cody the Maestro           |
                  |  (Queue Dispatch & Standup)    |
                  +---------------+----------------+
                                  |
              +-------------------+-------------------+
              |                   |                   |
    [Discover & Define]    [Design & Prototype]   [Execution & Verify]
    02 The Detective       05 The Inventor        09 The Locksmith (TDD)
    03 The Empath (JTBD)   06 The Artisan (UI)    10 The Craftsman (Code)
    04 The Minimalist      07 The Strategist      11 The Grand Judge (Gate)
                           13 Devil's Advocate    12 The Surgeon (Debug)
                           08 The Mom Sentinel    14 The Hawk (Visual Patrol)
```

---

## 2. Hook Lifecycle & Exit Codes

Codyteam enforcement relies exclusively on **Node.js built-ins** (`fs`, `path`, `crypto`, `child_process`). It requires **zero npm dependencies** and no external binaries (`jq`, `curl`).

### Exit Code Semantics:
- **`0`**: Approved execution. May output JSON decision payload on stdout.
- **`2`**: Hard block / Policy violation. Stdout / Stderr contains user-facing rejection reason.
- **Never rely on exit code `1`**: Exit code 1 in some agent harnesses indicates an uncaught runtime error rather than a deliberate policy veto.

### Registered Hooks:
1. **`guard.mjs` (`PreToolUse`)**:
   - Inspects target file path for `Edit` and `Write` tool calls.
   - Rejects edits on `.claude/settings.json`, `.claude/hooks/`, or `.swarm/`.
   - Rejects edits on frozen test files (unless role is `09-tdd-architect`).
   - Rejects edits outside the declared ticket `scope` globs.
2. **`completion-gate.mjs` (`SubagentStop`)**:
   - Reads `.swarm/reports/<ticket_id>.json`.
   - Rejects completion if report is missing, contains unfulfilled items, or has `TODO` in source files.
   - Flags fabrication if claims lack corresponding command execution logs or file references.
   - Enforces the **Zero-Trust Tri-Proof** (Code, Test, Screenshot).
   - Validates **Scope Matrix** completeness.
   - Creates downstream tickets upon successful closure.
3. **`queue-pump.mjs` (`Stop`)**:
   - Intercepts coordinator attempt to end a turn.
   - Scans `.swarm/queue/` for tasks in `todo` or `claimed` states.
   - Vetoes stop if tasks are ready, forcing the coordinator to dispatch them.
4. **`teammate-idle.mjs` (`TeammateIdle`)**:
   - Triggers when an agent becomes idle.
   - If tasks exist matching the idle agent's role, exits with code 2 to reawaken the agent.

---

## 3. Schemas

### A. Ticket Schema (`.swarm/queue/<id>.json`)
```json
{
  "id": "T-001",
  "level": "L0|L1|L2",
  "owner_role": "10-core-engineer",
  "status": "todo|claimed|in_review|done|rework|blocked_on_human|escalated",
  "depends_on": [],
  "priority": 1,
  "goal": "Implement integer stay adjustment calculation",
  "scope": ["mhm/src/lib/pricing.ts"],
  "acceptance": [
    {"id": "AC1", "text": "Stay adjustment delta matches integer VND"}
  ],
  "required_artifacts": [],
  "validators": ["triz-card"],
  "verify_cmd": "npm test tests/pricing.test.ts",
  "frozen_tests": {"tests/pricing.test.ts": "sha256-hash..."},
  "requires_visual_proof": false,
  "scope_matrix": [],
  "attempts": 0
}
```

### B. Report Schema (`.swarm/reports/<id>.json`)
```json
{
  "items": [
    {
      "id": "AC1",
      "status": "done",
      "evidence": {
        "type": "command|file|url|screenshot|tri-proof",
        "ref": "npm test | mhm/src/lib/pricing.ts:45 | .audit/screenshots/screen.png"
      }
    }
  ],
  "verdict": "pass|reject",
  "defects": [],
  "needs": null,
  "question": null
}
```
