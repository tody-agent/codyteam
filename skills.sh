#!/usr/bin/env bash
# Codyteam skills.sh compatibility entry point
# Usage: ./skills.sh install [agent_type]
# Supported agent types: all (default), claude, codex, antigravity, multica, opencode

AGENT_TYPE="${1:-all}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[Codyteam skills.sh] Installing skills for profile: ${AGENT_TYPE}..."
exec bash "${SCRIPT_DIR}/install.sh" "."
