---
name: codyteam
description: Deploy and coordinate the Codyteam 14-agent autonomous swarm combining Double Diamond design, TRIZ/ARIZ inventive problem solving, and Superpowers bite-sized planning rigor with Zero-Trust Tri-Proof gates.
---

# Codyteam — Autonomous Multi-Agent Swarm Skill

## Overview

Codyteam is an elite 14-agent autonomous development swarm engineered to eliminate laziness, hallucinations, and unverified code completions in AI pair programming.

By combining the **Double Diamond Design Framework** (Discover & Define), **ARIZ/TRIZ Inventive Problem Solving** (Technical & Physical Contradictions, IFR, Substance-Field Resources), and **Superpowers Execution Rigor** (`writing-plans`, `subagent-driven-development`, `verification-before-completion`), Codyteam guarantees that every change is independently tested, verified against global invariants, and visually inspected before closing.

## Core Swarm Roles (Meet the 14 Agents)

1. **`01-coordinator` — Cody the Maestro**: Swarm Conductor & Dispatcher. Manages queue, dispatches in parallel, keeps pipeline moving.
2. **`02-rootcause-contradiction-analyst` — Cody the Detective**: 5-Whys Sleuth & Conflict Sharpener. Reaches Technical & Physical Contradictions.
3. **`03-jtbd-market-researcher` — Cody the Empath**: Mom-Test Scout & JTBD Truth-Seeker. Grounded behavioral research eliminating confirmation bias.
4. **`04-openspec-architect` — Cody the Minimalist**: Resource-First Architect & Bloat Slayer. Zero new tables/deps, strict interface contracts.
5. **`05-concept-prototyper` — Cody the Inventor**: Idea Lab Wizard. Differentiates separation principles (time, space, condition, system/part).
6. **`06-opendesign-ui` — Cody the Artisan**: Bespoke UI & Visual Sculptor. Adapts to project design tokens, game art direction, and native primitives.
7. **`07-strategic-planner` — Cody the Strategist**: Bite-Sized Task Master. Writes <100-line diff tasks with exact TDD steps and zero placeholders.
8. **`08-momtest-ux-sentinel` — Cody the Mom Sentinel**: Radical UX Gatekeeper. Non-tech usability testing, bans developer jargon in copy.
9. **`09-tdd-architect` — Cody the Locksmith**: RED-First Test Craftsman. Writes failing tests and locks them with SHA-256 hashes.
10. **`10-core-engineer` — Cody the Craftsman**: Clean Code Ninja. Implements minimal diffs satisfying RED tests into GREEN.
11. **`11-forensic-test-gate` — Cody the Grand Judge**: Zero-Tolerance Integrity Auditor. Re-executes test suites, audits project domain invariants.
12. **`12-systematic-debugger` — Cody the Surgeon**: Surgical Root-Cause Healer. Resolves bugs at the source using Mini-ARIZ.
13. **`13-adversarial-plan-auditor` — Cody the Devil's Advocate**: Ruthless Plan Auditor. Bans vague placeholders, magic thresholds, and scope shrinkage.
14. **`14-automated-visual-sentinel` — Cody the Hawk**: Automated Visual Sentinel. Patrolled screens, scenes, and viewports with physical screenshot verification.

## 🚀 Live Swarm Monitor Auto-Launch (Phase 0 Protocol)

Whenever Codyteam starts an orchestration or swarm run (`01-coordinator` / Maestro activation):
1. **Auto-boot Monitor**: Run non-blocking `codyteam monitor --launch` (or `python3 scripts/codyteam-monitor.py --launch`).
2. **Antigravity Desktop Support**: In GUI environments (Antigravity Desktop on macOS), it automatically launches a dedicated floating Terminal window (`130x44`) displaying the live 7-tier dashboard (KPIs, summary, area progress, upcoming roadmap, screenshot evidence gallery) without blocking agent execution.
3. **Interactive Hotkeys**:
   - `Tab` / `Shift-Tab`: Chuyển đổi vùng chọn giữa bảng **Tiến Độ** và bảng **Báo Cáo Ảnh**.
   - `↑` / `↓`: Cuộn chọn phân khu hoặc lướt nhanh danh sách toàn bộ ảnh chụp.
   - `Enter`: Mở màn hình Deep-Dive chi tiết phân khu, hoặc mở ảnh đang chọn.
   - `o`: Mở ảnh hiện tại bằng macOS Preview để kiểm định chất lượng trực quan.
   - `c`: Copy nhanh Task ID vào Clipboard để gửi yêu cầu AI sửa lỗi.
   - `q`: Đóng monitor và thoát terminal nhẹ nhàng.

## Quick CLI Reference

```bash
# Initialize Codyteam into the current project
codyteam init .

# Launch Live Swarm Monitor in dedicated terminal window
codyteam monitor --launch

# Run Live Monitor in current terminal
codyteam monitor

# Print single-shot status snapshot
codyteam monitor --once

# Run the 17-point Zero-Trust enforcement test suite
codyteam test

# Start the autonomous background queue watchdog
codyteam watchdog
```

## Detailed Documentation & References

- [Agent Roster](references/agent-roster.md)
- [Planning Standard](references/planning-standard.md)
- [TRIZ & ARIZ Guide](references/triz-ariz-guide.md)
- [Zero-Trust Tri-Proof Verification](references/zero-trust-verification.md)
- [Swarm Specification](references/SWARM-SPEC.md)
