# Codyteam Best Practices
> **Engineering Rigor, Context Preservation, and Flawless Execution**

This document details the critical operating rules and best practices discovered while building and refining the Codyteam Multi-Agent Swarm.

---

## 1. The Iron Law of Verification

> **"NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE."**

Agents commonly exhibit "premature satisfaction" — claiming code works because "it looks correct" or "the logic is sound." Codyteam strictly rejects this behavior:

### The Red Flags
- Words like: *"should work now"*, *"probably"*, *"looks complete"*, *"tests should pass"*.
- Expressing satisfaction before executing tests (*"Great! All done!"*).
- Assuming a linter pass means tests pass.
- Relying on a test run executed *before* the latest edit was made.

### The Gate Rule
The gate re-executes tests independently. If an agent claims "All tests pass" but failed to execute the command after modifying code, the gate records a **Fabrication Flag** and halts the agent.

---

## 2. Context Window Budgeting & Swarm Isolation

LLM performance degrades severely as context exceeds 100k tokens. A single agent handling a complex multi-page task suffers from **Attention Sink**, leading to:
- Forgetting edge cases.
- Dropping secondary screens (e.g. updating 3 routes while forgetting the remaining 6).
- Leaving lazy `TODO` comments.

### The Remedy: Subagent Isolation
1. **Never pass accumulated history**: Pass only the task brief (`task-N-brief.md`), the interface contracts (`Consumes`/`Produces`), and global constraints.
2. **Keep diffs under 100 lines**: Break large features into bite-sized units taking 2–5 minutes of LLM compute.
3. **Use Persistent Ledgers**: Write task status, commit hashes, and parked findings to disk (`.swarm/progress.md`). Disk survives context window compaction; conversation history does not.

---

## 3. The Bounded Fix Loop (Circuit Breaker)

When a reviewer rejects code with defects, do not allow unbounded retry churn:
- **Rounds 1–3**: Resume the original implementer with the reviewer's findings verbatim. The implementer retains context on the problem.
- **Rounds 4–5**: Escalate the model tier and dispatch a **fresh implementer**. If an agent fails three times, it is blind to its own bug; fresh eyes break the psychological inertia.
- **Round 5 Expiry**: Trip the circuit breaker! Stop dispatching, adjudicate remaining findings, or escalate to human review.

---

## 4. The "No Placeholders" Policy

Every task plan must provide the exact code:
- ❌ Bad: `"TODO: Add validation for guest phone number"`
- ✅ Good:
  ```typescript
  if (!/^\+?[0-9]{9,15}$/.test(phone)) {
    throw new ValidationError('Invalid phone format');
  }
  ```
- ❌ Bad: `"Write unit tests for the above calculation"`
- ✅ Good: Provide the exact `describe()`, `it()`, input values, and `expect()` assertions.
