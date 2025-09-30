# Multi-AI File Paster - MCP Server

**Professional Model Context Protocol (MCP) Server for Chrome Extension Development**

This MCP server provides AI assistants (like Augment) with codebase-aware tools for analyzing, validating, and maintaining the Multi-AI File Paster Chrome extension.

---

## 🎯 Purpose

This MCP server exists **alongside** the `.github/hooks` scripts to provide:

1. **Interactive AI Assistance**: MCP tools integrate with Augment for context-aware help
2. **Focused Analysis**: Each tool provides specific validation reports
3. **Dynamic Detection**: All tools detect expected values from actual codebase (no hardcoded values)
4. **Cross-Platform Support**: Works on Windows WSL and Linux Ubuntu

### Why Both MCP Tools AND .github/hooks Scripts?

- **`.github/hooks/check-i18n.py` (901 lines)**: Comprehensive CLI validation for git hooks and CI/CD
- **MCP Tools**: AI-friendly interface for interactive development assistance

They complement each other - hooks for automation, MCP for AI-assisted development.

---

## 🛠️ Tools Overview

### 1. **i18n.py** - Internationalization Validation
**Purpose**: Validate 11 language translations with dynamic locale detection

**Features**:
- Dynamically detects available locales from `_locales/` directory
- Detects expected key count from English locale (actual: 648 keys)
- Finds hardcoded strings that should use `getMessage()`
- Verifies all keys are used in codebase
- Can run comprehensive `.github/hooks/check-i18n.py` script

**Usage**:
```python
# Check locale completeness
await i18n_tool.execute({"check_completeness": True})

# Find hardcoded strings
await i18n_tool.execute({"check_hardcoded": True})

# Run full check-i18n.py script
await i18n_tool.execute({"run_check_i18n_script": True})
```

---

### 2. **manifest.py** - Manifest V3 Validation
**Purpose**: Validate Chrome Extension Manifest V3 compliance

**Features**:
- Dynamically detects platforms from `config.js` PLATFORM_DOMAINS
- Validates manifest structure and required fields
- Checks permissions and host_permissions
- Verifies content_scripts files actually exist on filesystem
- Validates web_accessible_resources includes all locale files

**Usage**:
```python
# Full manifest validation
await manifest_tool.execute({
    "check_structure": True,
    "check_permissions": True,
    "check_content_scripts": True,
    "check_locales": True
})
```

---

### 3. **platform.py** - Platform Handler Analysis
**Purpose**: Analyze 5 AI platform handlers (ChatGPT, Claude, Gemini, DeepSeek, Grok)

**Features**:
- Dynamically detects platforms from `factory.js` and filesystem
- Detects required methods from actual implementations
- Analyzes factory pattern implementation
- Verifies platform-specific logic
- Checks DOM selectors, event listeners, file operations

**Usage**:
```python
# Analyze all platforms
await platform_tool.execute({"check_methods": True, "check_factory": True})

# Analyze specific platform
await platform_tool.execute({"platform": "chatgpt"})
```

---

### 4. **config.py** - Configuration System Validation
**Purpose**: Validate centralized GPTPF_CONFIG system

**Features**:
- Dynamically detects word limits from `config.js` VALIDATION_LIMITS (50-15,000 words)
- Validates GPTPF_CONFIG structure
- Checks word limits across config.js, index.html, and all 11 locale files
- Analyzes default configuration values
- Verifies platform-specific timeout configurations

**Usage**:
```python
# Full config validation
await config_tool.execute({
    "check_structure": True,
    "check_limits": True,
    "check_defaults": True,
    "check_platform_timeouts": True
})
```

---

### 5. **quality.py** - Code Quality Analysis
**Purpose**: Run .github/hooks scripts, check signatures, verify production readiness, **execute Jest test suite**

**Features**:
- **✨ NEW**: Executes Jest test suite (38 tests) with coverage analysis
- **✨ NEW**: Provides intelligent coverage recommendations
- Runs `.github/hooks/check-i18n.py` (901 lines) with cross-platform support
- Checks Hostwek signature headers in source files
- Validates centralization standards (no hardcoded fallback patterns)
- Cross-platform compatible (Windows WSL + Linux Ubuntu)
- Detects correct Python command automatically

**Usage**:
```python
# Full quality check
await quality_tool.execute({
    "run_i18n_check": True,
    "check_signatures": True,
    "check_centralization": True
})

# Include test execution with coverage
await quality_tool.execute({
    "run_i18n_check": True,
    "check_signatures": True,
    "check_centralization": True,
    "run_tests": True,              # ✨ Execute Jest test suite
    "coverage_report": True          # ✨ Generate coverage recommendations
})
```

**Test Execution Output**:
```
📦 Test Suites: 3 passed, 3 total
📊 Tests: 38 passed, 38 total
⏱️  Time: 18.245s

📈 Coverage Report:
  validation.js       |    95.0%   |   88.0%  |   96.0%   | 95.2% |
  languagedetector.js |    90.5%   |   82.1%  |   93.0%   | 91.0% |
  batchprocessor.js   |    92.0%   |   86.0%   |   93.5%   | 92.5% |

🎯 Coverage Analysis:
  ✅ All coverage metrics meet 80% threshold
  🎯 Consider adding integration tests for platform handlers
  🎯 Consider adding E2E tests for full workflows

✅ All tests passing - ready for production
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Python 3.8+** (python3 or python command available)
- **MCP Package**: `pip install mcp`
- **Virtual Environment**: `.venv` directory with dependencies

### Installation

1. **Verify Python Virtual Environment**:
   ```bash
   # Windows WSL / Linux
   source .venv/bin/activate
   
   # Verify Python version
   python --version  # Should be 3.8+
   ```

2. **Install MCP Package** (if not already installed):
   ```bash
   pip install mcp
   ```

3. **Verify MCP Server Can Be Imported**:
   ```bash
   python -c "from mcp_servers.server import TOOLS; print(f'✅ MCP Server OK: {len(TOOLS)} tools')"
   ```

### Configuration

The `.vscode/mcp.json` file is already configured:

```json
{
  "mcpServers": {
    "multi-ai-assistant": {
      "command": "python",
      "args": ["-m", "mcp", "run", "mcp-servers/server.py"],
      "cwd": "${workspaceFolder}",
      "env": {
        "PYTHONPATH": "${workspaceFolder}",
        "PYTHONUNBUFFERED": "1"
      },
      "disabled": false
    }
  }
}
```

---

## 🔧 Cross-Platform Compatibility

### Windows WSL

- Uses `/mnt/c/Users/...` paths
- Python virtual environment: `.venv/bin/python`
- Bash shell with WSL integration

### Linux Ubuntu

- Standard Linux paths
- Python virtual environment: `.venv/bin/python`
- Native bash shell

### Python Command Detection

The `quality.py` tool automatically detects the correct Python command:
- Tries `python3` first
- Falls back to `python`
- Reports errors if neither works

---

## 📊 Tool Accuracy

All tools use **dynamic detection** - no hardcoded values:

| Tool | Dynamic Detection | Source |
|------|------------------|--------|
| i18n.py | Key count (648) | `_locales/en/messages.json` |
| i18n.py | Available locales (11) | `_locales/` directory |
| manifest.py | Platforms (5) | `config.js` PLATFORM_DOMAINS |
| platform.py | Platform list | `factory.js` + filesystem |
| platform.py | Required methods | Actual platform implementations |
| config.py | Word limits (50-15000) | `config.js` VALIDATION_LIMITS |
| quality.py | Signature format | Actual file headers |

---

## 🐛 Troubleshooting

### Issue: "Python command not found"
**Solution**: Install Python 3.8+ and ensure it's in your PATH

### Issue: "MCP module not found"
**Solution**: `pip install mcp` in your virtual environment

### Issue: "check-i18n.py timeout"
**Solution**: Check for infinite loops in the script, increase timeout in quality.py

### Issue: "Pylance errors in MCP tools"
**Solution**: All tools have proper type hints - verify Python extension is installed

---

## 📝 Development Notes

### Adding New Tools

1. Create new tool file in `mcp-servers/tools/`
2. Inherit from `BaseTool` class
3. Implement `get_definition()` and `execute()` methods
4. Add to `TOOLS` list in `server.py`
5. Use dynamic detection - never hardcode expected values

### Type Hints

All tools use comprehensive type hints for Pylance compliance:
- `List[str]`, `Dict[str, Any]`, `Set[str]`
- `Optional[T]` for nullable values
- Proper return type annotations

### Testing

**MCP Server Testing**:
```bash
# Test i18n validation
python -c "from mcp_servers.tools.i18n import I18nTool; import asyncio; tool = I18nTool(); print(asyncio.run(tool.execute({})))"

# Test manifest validation
python -c "from mcp_servers.tools.manifest import ManifestTool; import asyncio; tool = ManifestTool(); print(asyncio.run(tool.execute({})))"

# Test quality tool with Jest test execution
python -c "from mcp_servers.tools.quality import QualityTool; import asyncio; tool = QualityTool(); print(asyncio.run(tool.execute({'run_tests': True})))"
```

**Jest Test Suite Testing** (Recommended):
```bash
# Interactive test menu
cd tests && ./test.sh

# Or run directly
cd tests && npm test
```

**Test Suite Details**:
- **Location**: `tests/` directory
- **Framework**: Jest 29.7.0 with jsdom environment
- **Tests**: 38 tests across 3 files (100% pass rate)
- **Coverage**: 80% thresholds (statements, branches, functions, lines)
- **Execution**: ~18 seconds average
- **Interactive Menu**: `tests/test.sh` provides guided testing workflow

---

## 📄 License

**HOSTWEK CUSTOM LICENSE**

COPYRIGHT © 2025 HOSTWEK LTD. ALL RIGHTS RESERVED.
DEVELOPED BY JOSEPH MATINO UNDER WEKTURBO DESIGNS - HOSTWEK LTD

This MCP server is part of the Multi-AI File Paster Chrome Extension project.

---

## 🤝 Support

- **Technical Support**: dev@josephmatino.com
- **Repository**: https://github.com/JosephMatino/MultiAiFilePaster
- **Documentation**: See project README.md and TECHNICAL_DOCS.md

---

**Version**: 1.1.0  
**Last Updated**: 2025-09-30  
**Maintained By**: Joseph Matino | WekTurbo Designs - Hostwek LTD

