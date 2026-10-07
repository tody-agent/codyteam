#!/usr/bin/env bash
# Codyteam Universal Installer for AI Coding Agents
# Supports: Claude Code, Codex, Antigravity, Multica, OpenCode
set -e

REPO_URL="https://github.com/tody-agent/codyteam"
RAW_URL="https://raw.githubusercontent.com/tody-agent/codyteam/main"
TARGET_DIR="${1:-.}"

echo "=========================================================="
echo "   Codyteam Multi-Agent Swarm (Double Diamond x ARIZ)"
echo "   Zero-Trust Tri-Proof Gates & Superpowers Planning"
echo "=========================================================="
echo "Installing into target directory: ${TARGET_DIR}"

TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

echo "Fetching latest Codyteam assets..."
git clone --depth 1 "${REPO_URL}.git" "$TMP_DIR/codyteam"

cd "$TARGET_DIR"

# 1. Install Claude Code Agents & Hooks
echo "-> Configuring Claude Code..."
mkdir -p .claude/agents .claude/hooks .swarm
cp -r "$TMP_DIR/codyteam/.claude/agents/"* .claude/agents/ 2>/dev/null || true
cp -r "$TMP_DIR/codyteam/hooks/"* .claude/hooks/ 2>/dev/null || true
cp -r "$TMP_DIR/codyteam/templates/"* .swarm/ 2>/dev/null || true

# 2. Install Codex Agent Config
echo "-> Configuring Codex..."
mkdir -p .codex
cp "$TMP_DIR/codyteam/SWARM-SPEC.md" .codex/SWARM-SPEC.md
cp "$TMP_DIR/codyteam/PLANNING-STANDARD.md" .codex/PLANNING-STANDARD.md

# 3. Install Antigravity Plugin & Skills
echo "-> Configuring Google Antigravity..."
ANTIGRAVITY_PLUGINS="${HOME}/.gemini/config/plugins/codyteam"
mkdir -p "${ANTIGRAVITY_PLUGINS}"
cp -r "$TMP_DIR/codyteam/"* "${ANTIGRAVITY_PLUGINS}/" 2>/dev/null || true

# 4. Install Multica Skills
echo "-> Configuring Multica..."
mkdir -p .multica/skills/codyteam
cp -r "$TMP_DIR/codyteam/skills/codyteam/"* .multica/skills/codyteam/ 2>/dev/null || true

# 5. Install OpenCode Agents
echo "-> Configuring OpenCode..."
mkdir -p .opencode/agents
cp -r "$TMP_DIR/codyteam/.claude/agents/"* .opencode/agents/ 2>/dev/null || true

# 6. Install Root Specifications & Scripts
mkdir -p scripts
cp "$TMP_DIR/codyteam/SWARM-SPEC.md" ./SWARM-SPEC.md
cp "$TMP_DIR/codyteam/PLANNING-STANDARD.md" ./PLANNING-STANDARD.md
cp -r "$TMP_DIR/codyteam/scripts/"* ./scripts/ 2>/dev/null || true

echo ""
echo "=========================================================="
echo "✓ Codyteam successfully installed across all agent targets!"
echo "  - Claude Code:    .claude/agents/ & .claude/hooks/"
echo "  - Codex:          .codex/"
echo "  - Antigravity:    ~/.gemini/config/plugins/codyteam"
echo "  - Multica:        .multica/skills/codyteam/"
echo "  - OpenCode:       .opencode/agents/"
echo "=========================================================="
echo "Run verification test:  node scripts/test-hooks.mjs"
echo ""
