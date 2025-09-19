#!/usr/bin/env bash
# ================================================================================
# MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
# CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
# ================================================================================
#
# MODULE: ai-scripts/analyze.sh
# FUNCTION: AI development assistance analysis runner
# ARCHITECTURE: Bash scripting, Python integration, cross-platform compatibility
# SECURITY: Local processing only, no data transmission, privacy-first design
# PERFORMANCE: Efficient script execution, optimized analysis workflow
# COMPATIBILITY: Bash 4.0+, Python 3.8+, cross-platform path handling
#
# DEVELOPMENT TEAM:
# • LEAD DEVELOPER: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
# • SCRUM MASTER: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
#
# ORGANIZATION: WEKTURBO DESIGNS - HOSTWEK LTD | https://hostwek.com/wekturbo
# REPOSITORY: https://github.com/JosephMatino/MultiAiFilePaster
# TECHNICAL SUPPORT: wekturbo@hostwek.com | Response time: 24-48 hours
# ================================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

if [ -x .venv/bin/python ]; then
  PY=".venv/bin/python"
elif [ -x .venv/Scripts/python.exe ]; then
  PY=".venv/Scripts/python.exe"
elif command -v python3 >/dev/null 2>&1; then
  PY="python3"
else
  PY="python"
fi

case "${1:-help}" in
    "project")
        shift
        "$PY" ai-scripts/projanalyze.py "$@"
        ;;
    "i18n")
        shift
        "$PY" ai-scripts/i18ncheck.py "$@"
        ;;
    "coverage")
        shift
        "$PY" ai-scripts/i18ncheck.py --coverage "$@"
        ;;
    "all")
        echo "🔍 Running All Analyses..."
        echo "=========================="
        "$PY" ai-scripts/projanalyze.py
        echo ""
        "$PY" ai-scripts/i18ncheck.py
        echo ""
        "$PY" ai-scripts/i18ncheck.py --coverage
        ;;
    *)
        echo "AI Development Analysis Tools"
        echo ""
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  project   - Project analysis"
        echo "  i18n      - i18n analysis"
        echo "  coverage  - i18n coverage"
        echo "  all       - Run all analyses"
        ;;
esac
