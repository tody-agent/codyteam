#!/usr/bin/env bash
# Codyteam Universal Terminal Launcher
# Opens the Codyteam Live Monitor in a dedicated floating terminal window.
# Supports: macOS Terminal.app, iTerm2, tmux, and standard X11 terminal emulators.

TARGET_SCRIPT="${1:-}"
if [ -n "$1" ]; then
  shift
fi
EXTRA_ARGS="$*"

if [ -z "$TARGET_SCRIPT" ]; then
  echo "Usage: launch-terminal.sh <path-to-script> [args...]"
  exit 1
fi

CWD="$(pwd)"

# 1. Check if running inside tmux
if [ -n "$TMUX" ]; then
  tmux new-window -n "codyteam-monitor" "bash -c 'cd \"$CWD\" && python3 \"$TARGET_SCRIPT\" $EXTRA_ARGS; echo Press Enter to close...; read'" 2>/dev/null && exit 0
fi

# 2. Check macOS GUI
if [[ "$OSTYPE" == "darwin"* ]]; then
  # If iTerm2 is currently running, prefer it
  if pgrep -x "iTerm2" >/dev/null 2>&1; then
    osascript -e "tell application \"iTerm\"
      create window with default profile command \"bash -c 'cd \\\"$CWD\\\" && python3 \\\"$TARGET_SCRIPT\\\" $EXTRA_ARGS'\"
      activate
    end tell" >/dev/null 2>&1 && exit 0
  fi

  # Default to native macOS Terminal.app (present on 100% of Macs)
  osascript -e "tell application \"Terminal\"
    set newTab to do script \"cd \\\"$CWD\\\" && python3 \\\"$TARGET_SCRIPT\\\" $EXTRA_ARGS\"
    set custom title of newTab to \"⚡ Codyteam Swarm Live Monitor\"
    activate
  end tell" >/dev/null 2>&1 && exit 0
fi

# 3. Check Linux GUI terminal emulators
for term in x-terminal-emulator gnome-terminal xterm alacritty kitty; do
  if command -v "$term" >/dev/null 2>&1; then
    "$term" -e "bash -c 'cd \"$CWD\" && python3 \"$TARGET_SCRIPT\" $EXTRA_ARGS'" &
    exit 0
  fi
done

# 4. Fallback if no GUI terminal is found
echo "[codyteam] No GUI terminal emulator detected. Running in current session..."
exec python3 "$TARGET_SCRIPT" $EXTRA_ARGS
