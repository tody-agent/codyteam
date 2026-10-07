# Codyteam Planning Standard Reference

For the full specification, see [PLANNING-STANDARD.md](../../../PLANNING-STANDARD.md).

## Key Superpowers Invariants
1. **Assume Zero Context**: Write plans as if the engineer has zero codebase context and questionable taste.
2. **Bite-Sized Granularity**: 2-5 minutes / <100 lines of diff per step.
3. **Mandatory Task Blocks**:
   - `Files:` (Create / Modify with line ranges / Test)
   - `Interfaces:` (`Consumes:` signatures from prior tasks, `Produces:` signatures exposed for later tasks)
   - `ARIZ Resource Rung:` (In-system -> Environment -> Super-system -> Object)
4. **5-Step TDD Cycles**:
   - Step 1: Write failing test (RED) with complete code snippet.
   - Step 2: Run test command verifying failure with expected failure string.
   - Step 3: Write minimal implementation (GREEN) with complete code snippet.
   - Step 4: Run test command verifying PASS.
   - Step 5: Verify global invariants & commit.
5. **No Placeholders**: Never allow `TODO`, `TBD`, `implement later`, `add validation`, or `write tests for above`.
6. **Planner 3-Point Self-Review**:
   - Spec coverage (every requirement maps to a task)
   - Placeholder scan (0 placeholders)
   - Type consistency (signatures match across tasks)
