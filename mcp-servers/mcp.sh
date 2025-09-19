#!/usr/bin/env bash
set -euo pipefail

# Determine repo root (parent of this script's directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${ROOT_DIR}"

# Choose Python interpreter
if [ -x .venv/bin/python ]; then
  PY=".venv/bin/python"
elif [ -x .venv/Scripts/python.exe ]; then
  PY=".venv/Scripts/python.exe"
elif command -v python3 >/dev/null 2>&1; then
  PY="python3"
else
  PY="python"
fi

exec "$PY" mcp-servers/multi_ai_assistant.py