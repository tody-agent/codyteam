# Codyteam User Guide
> **The Practical Handbook for Orchestrating Autonomous Multi-Agent Swarms**

Welcome to **Codyteam**! This guide explains how to install, configure, and operate the 14-agent Codyteam swarm across multiple AI coding platforms.

---

## 1. Quick Installation

You can install Codyteam with a single command on any supported platform:

### Linux / macOS / WSL
```bash
curl -fsSL https://raw.githubusercontent.com/tody-agent/codyteam/main/install.sh | bash
```

### Windows PowerShell
```powershell
irm https://raw.githubusercontent.com/tody-agent/codyteam/main/install.ps1 | iex
```

### Via npm / npx
```bash
npm install -g codyteam
# or
npx codyteam init .
```

---

## 2. Platform Support & Setup

| Agent Platform | Configuration Directory | Activation Method |
|---|---|---|
| **Claude Code** | `.claude/agents/`, `.claude/hooks/` | Automatically active via `settings.json` hooks and agent markdown files |
| **Codex** | `.codex/` | References `SWARM-SPEC.md` and `PLANNING-STANDARD.md` |
| **Google Antigravity** | `~/.gemini/config/plugins/codyteam` | Registered as an Antigravity plugin with skill `codyteam` |
| **Multica** | `.multica/skills/codyteam/` | Loaded via Multica skill manager |
| **OpenCode** | `.opencode/agents/` | Native multi-agent YAML/Markdown profiles |

---

## 3. How to Run a Feature Sprint

### Step 1: Initialize Swarm in your Project
```bash
codyteam init .
```
This generates the `.claude/agents/`, `.swarm/`, `scripts/`, `SWARM-SPEC.md`, and `PLANNING-STANDARD.md` files in your repository.

### Step 2: Trigger Teamwork in Chat UI
In your AI assistant prompt (e.g. Claude Code, Antigravity), type:
```text
/teamwork-preview Let's build a post-checkin stay modification drawer allowing hourly to daily stay conversion, with full manager PIN override and integer VND pricing.
```

### Step 3: What Happens Under the Hood
1. **Cody the Maestro (`01`)** awakens, triages the request, creates Ticket `T-001`, and assigns it to **Cody the Detective (`02`)**.
2. **Cody the Detective (`02`)** maps the 5-Whys, Motivators & Frictions, and isolates the Technical Contradiction (TC).
3. **Cody the Minimalist (`04`)** and **Cody the Empath (`03`)** research existing resources and draft the Phase Spec with interface boundaries (`Consumes`/`Produces`).
4. **Cody the Inventor (`05`)** drafts ASCII prototypes using separation principles (time, space, condition).
5. **Cody the Strategist (`07`)** produces `PLAN.md` with bite-sized tasks (<100 diff lines) and zero placeholders.
6. **Cody the Devil's Advocate (`13`)** ruthlessly audits the plan against the Superpowers checklist.
7. **Cody the Locksmith (`09`)** writes failing tests (RED) and locks them with SHA-256 hashes.
8. **Cody the Craftsman (`10`)** implements the minimal code to turn tests GREEN.
9. **Cody the Grand Judge (`11`)** audits code invariants, rerun test suites, and verifies money calculations.
10. **Cody the Hawk (`14`)** runs the visual sentinel patrol and saves screenshot proof to disk.

---

## 4. Useful CLI Commands

```bash
# Verify all Zero-Trust hooks and safety invariants
node scripts/test-hooks.mjs

# Start the continuous queue watchdog daemon
node scripts/swarm-watchdog.mjs

# Create a new swarm ticket manually
node scripts/swarm.mjs new --role 10-core-engineer --goal "Implement rate calculation" --scope "src/lib/"

# Inspect active swarm status
node scripts/swarm.mjs status
```
