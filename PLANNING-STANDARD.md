# Codyteam Planning & Specification Standard (v2)
> **Synthesizing OpenSpec, TRIZ/ARIZ Resource Discipline, and Superpowers Engineering Rigor**

## 1. Core Philosophy: Why Superpowers Outperforms Naive OpenSpec

Naive OpenSpec documents often fail in agentic swarms because they rely on **abstract prose descriptions** (e.g., *"Update button styling and handle validation"*). When an LLM agent receives high-level prose, four catastrophic failure modes occur:
1. **Context Pollution & Drift**: The agent hallucinates missing requirements or introduces bloated abstractions.
2. **Silent Shrinkage**: Difficult edge cases, secondary screens, or subtle invariants are silently skipped.
3. **Broken Interfaces**: Functions named in Task 2 don't match parameters expected in Task 5.
4. **Untestable Code**: Steps lack runnable tests or commands, leading to untested "it should work" completions.

### The Superpowers Mindset
> **"Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything they need to know: which files to touch for each task, exact code snippets, testing commands, and how to verify it. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits."**

Every plan must be so concrete that an implementer subagent can execute it by pure transcription and testing without guessing or expanding scope.

---

## 2. The Plan Document Structure

Every implementation plan (e.g., `specs/phase-XX/PLAN.md`) MUST strictly follow this standard:

```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach, Operational Zone, and ARIZ separation principle used]

**Tech Stack:** [Key technologies, libraries, and native primitives]

## Global Constraints

- Currency invariant: VND amounts must be integer (MoneyVnd = i64, 0 float). Check with `npm run verify:money`.
- Booking status invariant: `bookings.status = 'voided'` must be excluded from all financial queries.
- Architecture: UI -> invokeCommand -> service -> repository -> SQLite.
- UI Design Tokens: Background #FAFAFA, Card #FFFFFF, Border #E2E8F0 (1px hairline), Accent #981F1F. Tabular numerals for money/dates.
- Scope Matrix: Every plan affecting general UI must audit the 9 PMS routes (`/`, `/#/rooms`, `/#/reservations`, `/#/guests`, `/#/groups`, `/#/analytics`, `/#/night-audit`, `/#/declaration`, `/#/settings`).

---
```

---

## 3. The Task Specification Standard

Each task represents the smallest atomic unit that carries its own test cycle and can be meaningfully evaluated by a fresh reviewer. Each task takes 2–5 minutes and produces <100 lines of diff.

### Mandatory Task Format:

```markdown
### Task N: [Component or Unit Name]

**Files:**
- Create: `exact/path/to/new_file.ts`
- Modify: `exact/path/to/existing_file.tsx:120-145`
- Test: `tests/exact/path/to/test_file.test.ts`

**Interfaces:**
- Consumes: [Exact function signatures, types, or data structures from prior tasks]
- Produces: [Exact function names, parameter types, and return types exposed for future tasks]

**ARIZ Resource Rung:**
- [In-system | Environment | Super-system | Object] (Justification if adding any new entity)

- [ ] **Step 1: Write the failing test (RED)**

```typescript
// tests/path/to/test.test.ts
import { describe, it, expect } from 'vitest';
import { calculateStayAdjustment } from '@/lib/pricing';

describe('calculateStayAdjustment', () => {
  it('correctly calculates hourly to daily delta in integer VND', () => {
    const delta = calculateStayAdjustment(100_000, 350_000);
    expect(delta).toBe(250_000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/path/to/test.test.ts`
Expected: FAIL with "calculateStayAdjustment is not a function"

- [ ] **Step 3: Write minimal implementation (GREEN)**

```typescript
// src/lib/pricing.ts
export function calculateStayAdjustment(initialVnd: number, updatedVnd: number): number {
  return Math.trunc(updatedVnd - initialVnd);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/path/to/test.test.ts`
Expected: PASS (1 test passed)

- [ ] **Step 5: Verify global PMS invariants & Commit**

Run: `npm run verify:money`
```bash
git add tests/path/to/test.test.ts src/lib/pricing.ts
git commit -m "feat(pricing): add integer stay adjustment calculation"
```
```

---

## 4. The "No Placeholders" Iron Rule

The gatekeeper hooks strictly reject any plan containing placeholders. The following patterns are classified as **Plan Failures**:

| Forbidden Pattern | Why It Fails | Required Superpowers Pattern |
|---|---|---|
| `"TODO: handle errors"` | Implementer will guess or ignore edge cases | Write the exact `try/catch` block and error return type |
| `"Write tests for the above"` | Implementer writes vacuous assertions | Write the exact test code with input, expected output, and mock setups |
| `"Similar to Task 2"` | Subagents execute in isolated context without Task 2 in prompt | Repeat the code and interface verbatim |
| `"Add appropriate styling"` | Visual inconsistencies and token violations | Specify exact Tailwind classes and visual tokens |
| `"TBD" / "Implement later"` | Plan is incomplete; cannot be dispatched | Complete the specification before publishing the plan |

---

## 5. Planner Self-Review Checklist

Before handing off any plan to `13-adversarial-plan-auditor` (Cody the Devil's Advocate), `07-strategic-planner` (Cody the Strategist) must run this 3-point self-review:

1. **Spec Coverage**: Skim every requirement, user story, and Acceptance Criterion from the Phase Spec. Can you point to a specific Task N that satisfies it?
2. **Placeholder Scan**: Search the document for `TODO`, `TBD`, `later`, `appropriate`, `similar to`. Eradicate all instances.
3. **Interface Consistency**: Do parameter names and types in `Produces` match what subsequent tasks declare under `Consumes`?

---

## 6. Subagent Execution & Two-Stage Review Protocol

When executing the plan via `/teamwork-preview` or `subagent-driven-development`:

1. **Task Brief Extraction**:
   - Never feed the entire 500-line plan to an implementer.
   - Extract `task-N-brief.md` containing only Task N's requirements, interfaces, and global constraints.
2. **Report Contract**:
   - The implementer writes detailed execution logs to `task-N-report.md`.
   - The implementer returns only a 4-line status to the controller: Status (DONE), Commits, Test Summary, and Concerns.
3. **Two-Stage Review (Separation of Powers)**:
   - **Reviewer 1 (Spec Compliance)**: Did the code build exactly what the brief requested, and nothing extra?
   - **Reviewer 2 (Code Quality & Security)**: Clean architecture, zero `any`, integer money invariants, no magic numbers.
4. **Bounded Fix Loop (Max 5 Rounds)**:
   - Rounds 1–3: Resume original implementer with exact review findings.
   - Rounds 4–5: Escalate model tier and dispatch a fresh implementer.
   - Round 5 Expiry: Trip circuit breaker to prevent infinite agent churn.
5. **Persistent Ledger (`.swarm/progress.md`)**:
   - Every completed task, commit hash, and parked finding is logged to disk so context survives compaction.

---

## 7. Zero-Trust Tri-Proof Gate

No task is marked complete based on claims alone. The completion gate enforces:
1. **Code Evidence**: File and line number verified.
2. **Test Evidence**: Executed test suite passing green (`0 failures`).
3. **Visual Screenshot Evidence**: Physical `.png` saved to `.audit/screenshots/` on disk with non-zero size for UI tasks.
