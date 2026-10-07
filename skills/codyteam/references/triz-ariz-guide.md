# TRIZ / ARIZ Inventive Problem Solving in Codyteam

Codyteam adapts Altshuller's classical Algorithm for Inventive Problem Solving (ARIZ-85V) for modern autonomous software engineering.

## 1. Contradiction Types
- **Administrative Contradiction (AC)**: The surface request ("We need faster check-ins, but we do not know how").
- **Technical Contradiction (TC)**: Improving system parameter A degrades system parameter B.
  - *TC-1*: If we require PIN authorization, security increases, but check-in speed decreases.
  - *TC-2*: If we remove PIN authorization, check-in speed increases, but security decreases.
- **Physical Contradiction (PC)**: One specific element in the Operational Zone must be in state **S** AND state **NOT-S**.
  - *Example*: The room rate field must be locked to prevent unauthorized changes, AND must be editable for instant manager overrides.

## 2. Separation Principles
To resolve Physical Contradictions without compromising:
1. **Separation in Time**: The rate is uneditable during standard reception entry (T1), but unlocks automatically when an authenticated manager key/PIN is supplied (T2).
2. **Separation in Space**: The rate on the front desk view is fixed, but the split ledger panel allows manager adjustments.
3. **Separation by Condition**: Normal operations restrict edits; offline emergency mode enables local edits with cryptographic audit trails.
4. **Separation between System and Parts**: The booking total cannot be arbitrarily edited, but individual service line items can be adjusted.

## 3. Substance-Field Resources (SFR Hierarchy)
Never add new complexity before exhausting existing resources:
1. **In-system resources**: Existing database fields, existing React state, existing UI primitives.
2. **Environment resources**: Native browser APIs (`<dialog>`, popover, CSS variables), OS features.
3. **Super-system resources**: Database triggers, parent components, shared infrastructure.
4. **Object resources**: The payload or request entity itself.

## 4. Ideal Final Result (IFR-1)
> **"The X-element ITSELF removes the harm, adds zero new complexity, and preserves the full benefit."**
Any proposal to add a new table, microservice, or third-party npm package requires written justification proving all higher SFR rungs have been exhausted.
