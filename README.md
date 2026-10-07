# 🦾 Codyteam
> **Autonomous 14-Agent Swarm for AI Coding Agents**  
> *Double Diamond × ARIZ Inventive Problem Solving × Superpowers Planning Rigor with Zero-Trust Tri-Proof Gates*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: Claude Code](https://img.shields.io/badge/Platform-Claude%20Code-orange.svg)](#claude-code)
[![Platform: Codex](https://img.shields.io/badge/Platform-Codex-black.svg)](#codex)
[![Platform: Google Antigravity](https://img.shields.io/badge/Platform-Google%20Antigravity-4285F4.svg)](#google-antigravity)
[![Platform: Multica](https://img.shields.io/badge/Platform-Multica-purple.svg)](#multica)
[![Platform: OpenCode](https://img.shields.io/badge/Platform-OpenCode-green.svg)](#opencode)
[![Tests: 17/17 Passed](https://img.shields.io/badge/Tests-17%2F17%20Passed-brightgreen.svg)](#verification)

---

## ⚡ Why Codyteam?

Standard AI coding agents fail on medium-to-large projects due to **unbounded context pollution**, **silent shrinkage of edge cases**, and **self-certification bias** (agents marking their own flawed code as "done").

**Codyteam solves this mechanically**:
1. **Zero-Trust Tri-Proof Gate**: Agents cannot close their own tickets. Tickets require **Code Evidence** (`file:line`), **Test Evidence** (verified exit code 0), and **Screenshot Evidence** (physical image on disk).
2. **Superpowers Planning Standard**: Every feature is decomposed into bite-sized tasks (<100 diff lines / 2–5 min) with explicit `Consumes` / `Produces` interface contracts, exact TDD steps, and **0 placeholders** (strictly banning `TODO`, `TBD`, or "implement later").
3. **ARIZ / TRIZ Inventive Problem Solving**: Sharpens technical & physical contradictions without "optimal compromise" hacks, enforcing strict Substance-Field Resource (SFR) order (0 new unneeded tables/deps).
4. **Complete Scope Matrix**: Enforces complete audit across all application routes so secondary screens are never forgotten.

---

## 🚀 1-Command Universal Installation

Install Codyteam across your preferred AI agent environment with a single command:

### Linux / macOS / WSL
```bash
curl -fsSL https://raw.githubusercontent.com/tody-agent/codyteam/main/install.sh | bash
```

### Windows PowerShell
```powershell
irm https://raw.githubusercontent.com/tody-agent/codyteam/main/install.ps1 | iex
```

### Via skills.sh / npx
```bash
# Using skills.sh
./skills.sh install

# Or using npx
npx codyteam init .
```

---

## 👥 Meet the 14 Agents

Every agent in Codyteam has a specialized mission, clear boundaries, and an uncompromised Accountability Contract:

| # | Role & Callsign | Motto | Specialization |
|:---:|:---|:---|:---|
| **01** | **Cody the Maestro** (`01-coordinator`) | *"Keep the swarm humming, no tickets left behind!"* | Event bus conductor, triage (L0/L1/L2), parallel dispatching. |
| **02** | **Cody the Detective** (`02-rootcause-contradiction-analyst`) | *"Beneath every surface glitch lies a hidden contradiction."* | 5-Whys root-cause sleuth, TC-1/TC-2 contradiction sharpener. |
| **03** | **Cody the Empath** (`03-jtbd-market-researcher`) | *"Listen to what users did, never what they promise they might do."* | JTBD truth-seeker, Mom Test behavioral interviewer. |
| **04** | **Cody the Minimalist** (`04-openspec-architect`) | *"The best new table or dependency is the one you never add!"* | Resource-first architect, zero-bloat interface contracts. |
| **05** | **Cody the Inventor** (`05-concept-prototyper`) | *"Separate in time, space, and condition to dissolve the conflict."* | Idea lab wizard, ASCII & HTML concept prototyper. |
| **06** | **Cody the Artisan** (`06-opendesign-ui`) | *"Crisp hairlines, tabular numbers, zero decorative fluff."* | OpenDesign UI sculptor, high-density React primitives. |
| **07** | **Cody the Strategist** (`07-strategic-planner`) | *"Slice the beast into bite-sized morsels; quick to digest, impossible to choke on!"* | Superpowers task master, <100 line diffs, zero placeholders. |
| **08** | **Cody the Mom Sentinel** (`08-momtest-ux-sentinel`) | *"If my non-tech mom pauses for 3 seconds, the UI is guilty until proven innocent."* | Radical UX gatekeeper, jargon veto, non-tech ergonomics. |
| **09** | **Cody the Locksmith** (`09-tdd-architect`) | *"Lock the test in RED, seal the hash in stone; only then may code be born."* | RED-first test craftsman, SHA-256 test hash locker. |
| **10** | **Cody the Craftsman** (`10-core-engineer`) | *"Clean architecture, minimal diffs, zero any: code that speaks for itself."* | Clean Code ninja, minimal diff builder turning RED into GREEN. |
| **11** | **Cody the Grand Judge** (`11-forensic-test-gate`) | *"Trust no claims, verify all invariants: money is integer, history is immutable."* | Zero-tolerance integrity auditor, automated test runner. |
| **12** | **Cody the Surgeon** (`12-systematic-debugger`) | *"Cure the illness at the genetic root; never bandage a symptom."* | Surgical root-cause healer, Mini-ARIZ physician. |
| **13** | **Cody the Devil's Advocate** (`13-adversarial-plan-auditor`) | *"Does this solution breed a worse second problem? Disguised compromises die here!"* | Ruthless plan auditor, placeholder crusher, compromise slayer. |
| **14** | **Cody the Hawk** (`14-automated-visual-sentinel`) | *"A thousand green unit tests cannot hide a single broken pixel on screen."* | Automated visual patrol, screenshot proof collector. |

---

## 🔄 The Swarm Lifecycle

```
01 Maestro (Triage)
       │
       ▼
02 Detective ──► 04 Minimalist ──► 03 Empath ──► 05 Inventor ──► 08 Mom Sentinel
(5-Whys / TC)    (SFR / Specs)     (JTBD)         (Separation)   (UX Gate)
                                                       │
                                                       ▼
                                            06 Artisan || 07 Strategist
                                            (UI Tokens)   (Superpowers Plan)
                                                       │
                                                       ▼
                                            13 Devil's Advocate (Audit)
                                                       │
                                                       ▼
                                            09 Locksmith (TDD RED)
                                                       │
                                                       ▼
                                            10 Craftsman (Code GREEN)
                                                       │
                                                       ▼
                                            11 Grand Judge (Zero-Trust Gate)
                                                 │                 │
                                            (pass)                 (fail)
                                                 │                 ▼
                                                 │          12 Surgeon (Debug)
                                                 ▼
                                            14 Hawk (Visual Patrol & Screenshots)
```

---

## 🛠️ Verification & Testing

Codyteam includes a comprehensive 17-point test harness validating guard permissions, frozen test tamper-resistance, fabrication flags, TODO detections, Cyrillic bans, scope matrix checks, queue pump, and teammate idle triggers:

```bash
node scripts/test-hooks.mjs
```

```text
=== RUNNING SWARM-SPEC v2 HOOK TEST SUITE ===

1. Testing guard.mjs (PreToolUse)...
  [PASS] guard denies Edit on .claude/settings.json
  [PASS] guard denies Edit on a frozen test (non-09 role)
  [PASS] guard denies Edit outside scope

2. Testing completion-gate.mjs (SubagentStop)...
  [PASS] completion-gate blocks: missing report
  [PASS] completion-gate blocks: claim without evidence (flags fabrication)
  [PASS] completion-gate blocks: TODO in src
  [PASS] completion-gate blocks: .skip in tests
  [PASS] completion-gate blocks: Cyrillic in artifact
  [PASS] completion-gate escalates on attempt 3
  [PASS] completion-gate passes valid fixture and creates downstream task (pipeline handoff)
  [PASS] completion-gate blocks: missing visual handover screenshot proof
  [PASS] completion-gate blocks: forgotten pages in scope_matrix
  [PASS] completion-gate passes: Zero-Trust verified with screenshot & full 9-route scope matrix

3. Testing queue-pump.mjs (Stop)...
  [PASS] queue-pump blocks coordinator Stop when ready tasks exist
  [PASS] queue-pump allows coordinator Stop when queue empty

4. Testing teammate-idle.mjs (TeammateIdle)...
  [PASS] teammate-idle exits 2 when a ready task exists
  [PASS] teammate-idle allows (exit 0) when no ready task exists for teammate

=============================================
TOTAL HOOK TESTS: 17
PASSED: 17
FAILED: 0
=============================================
```

---

## 📖 Documentation Directory

- [User Guide](docs/USER_GUIDE.md) — Setup and sprint execution instructions.
- [Best Practices](docs/BEST_PRACTICES.md) — Context budgeting, the Iron Law of Verification, and the Bounded Fix Loop.
- [Technical Specification](docs/TECHNICAL_SPEC.md) — Architecture, hook lifecycles, and IPC message schemas.
- [Superpowers Planning Standard](PLANNING-STANDARD.md) — The complete specification for bite-sized task planning.
- [SWARM Specification v2](SWARM-SPEC.md) — The formal Double Diamond x ARIZ Swarm Specification.

---

## 📄 License

MIT © [tody-agent](https://github.com/tody-agent)
