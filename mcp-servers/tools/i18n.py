#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: mcp-servers/tools/i18n.py
 * FUNCTION: Internationalization validation tool with dynamic locale detection
 * ARCHITECTURE: Codebase-aware i18n analysis with pattern detection
 * SECURITY: Local processing only, no data transmission, privacy-first design
 * PERFORMANCE: Optimized pattern matching, efficient file scanning
 * COMPATIBILITY: Python 3.8+, dynamically detects all available locales
 *
 * COPYRIGHT © 2025 HOSTWEK LTD. ALL RIGHTS RESERVED.
 * DEVELOPED BY JOSEPH MATINO UNDER WEKTURBO DESIGNS - HOSTWEK LTD
 * LICENSED UNDER HOSTWEK CUSTOM LICENSE
 * ================================================================================
 """

import os
import json
import re
import subprocess
from typing import Dict, Any, List, Set, Optional
from mcp.types import Tool
from .base import BaseTool


class I18nTool(BaseTool):
    """
    Validate internationalization with dynamic locale detection.

    This tool complements .github/hooks/check-i18n.py by providing:
    - Interactive MCP interface for AI assistants
    - Focused validation reports for specific checks
    - Integration with Augment's context-aware assistance

    The check-i18n.py script (901 lines) provides comprehensive CLI validation
    for git hooks, while this MCP tool provides AI-friendly analysis.
    """

    def __init__(self):
        super().__init__(
            name="validate_i18n",
            description="Validate internationalization with dynamic locale detection, check hardcoded strings, verify getMessage() usage"
        )
        self._supported_locales: Optional[List[str]] = None
        self._expected_key_count: Optional[int] = None

    def _detect_supported_locales(self) -> List[str]:
        """Dynamically detect available locales from _locales directory."""
        if self._supported_locales is not None:
            return self._supported_locales

        locales: List[str] = []
        locales_dir = os.path.join(self.project_root, '_locales')

        if os.path.exists(locales_dir):
            for item in os.listdir(locales_dir):
                locale_path = os.path.join(locales_dir, item)
                messages_file = os.path.join(locale_path, 'messages.json')
                if os.path.isdir(locale_path) and os.path.isfile(messages_file):
                    locales.append(item)

        self._supported_locales = sorted(locales)
        return self._supported_locales

    def _get_expected_key_count(self) -> int:
        """Dynamically detect expected key count from English locale."""
        if self._expected_key_count is not None:
            return self._expected_key_count

        en_data = self.read_json('_locales/en/messages.json')
        if en_data:
            self._expected_key_count = len(en_data)
            return self._expected_key_count

        return 0

    def get_definition(self) -> Tool:
        return Tool(
            name=self.name,
            description=self.description,
            inputSchema={
                "type": "object",
                "properties": {
                    "check_completeness": {
                        "type": "boolean",
                        "description": "Check if all locales have same key count as English",
                        "default": True
                    },
                    "check_hardcoded": {
                        "type": "boolean",
                        "description": "Find hardcoded strings that should use getMessage()",
                        "default": True
                    },
                    "check_usage": {
                        "type": "boolean",
                        "description": "Verify all keys are used in codebase",
                        "default": False
                    },
                    "run_check_i18n_script": {
                        "type": "boolean",
                        "description": "Run the comprehensive .github/hooks/check-i18n.py script",
                        "default": False
                    }
                }
            }
        )
    
    async def execute(self, arguments: Dict[str, Any]) -> str:
        check_completeness = arguments.get('check_completeness', True)
        check_hardcoded = arguments.get('check_hardcoded', True)
        check_usage = arguments.get('check_usage', False)
        run_script = arguments.get('run_check_i18n_script', False)

        sections: List[Dict[str, Any]] = []

        if run_script:
            script_result = self._run_check_i18n_script()
            sections.append(script_result)

        if check_completeness:
            completeness = self._check_locale_completeness()
            sections.append(completeness)

        if check_hardcoded:
            hardcoded = self._find_hardcoded_strings()
            sections.append(hardcoded)

        if check_usage:
            usage = self._check_key_usage()
            sections.append(usage)

        return self.format_result("I18N VALIDATION REPORT", sections)

    def _run_check_i18n_script(self) -> Dict[str, Any]:
        """Run the comprehensive .github/hooks/check-i18n.py script."""
        script_path = os.path.join(self.project_root, '.github', 'hooks', 'check-i18n.py')

        if not os.path.exists(script_path):
            return {
                'title': "Check-i18n.py Script",
                'content': ["❌ Script not found at .github/hooks/check-i18n.py"],
                'status': 'error'
            }

        try:
            result = subprocess.run(
                ['python3', script_path],
                capture_output=True,
                text=True,
                timeout=60,
                cwd=self.project_root
            )

            output_lines = result.stdout.split('\n')
            summary: List[str] = []

            for line in output_lines:
                if any(keyword in line for keyword in [
                    'Used keys:', 'Defined keys:', 'Missing keys:', 'Unused keys:',
                    'OVERALL STATUS:', 'LOCALE CONFIGURATION', 'Expected locales:',
                    'TRANSLATION COMPLETENESS:', 'MIXED LANGUAGE ISSUES:'
                ]):
                    summary.append(line.strip())

            status = 'success' if result.returncode == 0 else 'error'

            return {
                'title': "Comprehensive I18N Check (check-i18n.py)",
                'content': summary if summary else ["✅ All checks passed"],
                'status': status
            }

        except subprocess.TimeoutExpired:
            return {
                'title': "Check-i18n.py Script",
                'content': ["❌ Script timeout (>60s)"],
                'status': 'error'
            }
        except Exception as e:
            return {
                'title': "Check-i18n.py Script",
                'content': [f"❌ Error: {str(e)}"],
                'status': 'error'
            }

    def _check_locale_completeness(self) -> Dict[str, Any]:
        """Check if all locales have the expected number of keys."""
        supported_locales = self._detect_supported_locales()
        expected_count = self._get_expected_key_count()

        if expected_count == 0:
            return {
                'title': "Locale Completeness",
                'content': ["❌ Cannot read English locale to determine expected key count"],
                'status': 'error'
            }

        results: List[str] = []
        all_complete = True

        for locale in supported_locales:
            locale_path = f"_locales/{locale}/messages.json"
            locale_data = self.read_json(locale_path)

            if not locale_data:
                results.append(f"❌ {locale}: FILE MISSING")
                all_complete = False
                continue

            key_count = len(locale_data)
            if key_count == expected_count:
                results.append(f"✅ {locale}: {key_count}/{expected_count} keys")
            else:
                diff = expected_count - key_count
                results.append(f"❌ {locale}: {key_count}/{expected_count} keys ({'missing' if diff > 0 else 'extra'} {abs(diff)})")
                all_complete = False

        return {
            'title': f"Locale Completeness ({len(supported_locales)} languages, {expected_count} keys expected)",
            'content': results,
            'status': 'success' if all_complete else 'error'
        }

    def _find_hardcoded_strings(self) -> Dict[str, Any]:
        """Find hardcoded user-facing strings that should use getMessage()."""
        hardcoded: List[str] = []

        fallback_patterns: List[str] = [
            r'GPTPF_I18N\?\.\w+\([^)]+\)\s*\|\|\s*[\'"]([^\'\"]+)[\'"]',
            r'getMessage\([^)]+\)\s*\|\|\s*[\'"]([^\'\"]+)[\'"]',
            r'\?\?\s*[\'"]([^\'\"]+)[\'"]',
        ]

        excluded_safe_patterns: List[str] = [
            r"''", r'""', r"'txt'", r'"txt"', r"'auto'", r'"auto"',
            r"'unknown'", r'"unknown"', r"'AI Model'", r'"AI Model"'
        ]

        js_files = self.list_files('src', '.js')

        for file_path in js_files:
            content = self.read_file(file_path)
            if not content:
                continue

            for pattern in fallback_patterns:
                matches = re.finditer(pattern, content)
                for match in matches:
                    matched_text = match.group(0)

                    is_safe = any(safe in matched_text for safe in excluded_safe_patterns)
                    if is_safe:
                        continue

                    line_num = content[:match.start()].count('\n') + 1
                    hardcoded.append(f"{file_path}:{line_num} - {matched_text[:60]}...")

        return {
            'title': "Hardcoded Strings (Fallback Patterns)",
            'content': hardcoded if hardcoded else ["✅ No hardcoded fallback patterns found"],
            'status': 'error' if hardcoded else 'success'
        }

    def _check_key_usage(self) -> Dict[str, Any]:
        """Check which i18n keys are actually used in the codebase."""
        en_data = self.read_json("_locales/en/messages.json")
        if not en_data:
            return {
                'title': "Key Usage Analysis",
                'content': ["❌ Cannot read English locale file"],
                'status': 'error'
            }

        defined_keys: Set[str] = set(en_data.keys())
        used_keys: Set[str] = set()

        usage_patterns: List[str] = [
            r'window\.GPTPF_I18N\.getMessage\([\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
            r'GPTPF_I18N\.getMessage\([\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
            r'getMessage\([\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
            r'data-i18n=[\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
            r'data-i18n-html=[\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
            r'data-i18n-placeholder=[\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
            r'data-i18n-aria-label=[\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
            r'data-i18n-title=[\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
            r'data-tip-i18n=[\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
            r'__MSG_([a-zA-Z0-9_\.\-]+)__',
            r'GPTPF_DEBUG\?\.\w+\([\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
            r'GPTPF_DEBUG\.\w+\([\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
        ]

        scan_dirs: List[str] = ['src', 'manifest.json', '_locales']
        all_files: List[str] = []

        for scan_dir in scan_dirs:
            if scan_dir.endswith('.json'):
                all_files.append(scan_dir)
            else:
                all_files.extend(self.list_files(scan_dir, '.js'))
                all_files.extend(self.list_files(scan_dir, '.html'))
                all_files.extend(self.list_files(scan_dir, '.json'))

        for file_path in all_files:
            content = self.read_file(file_path)
            if not content:
                continue

            for pattern in usage_patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                used_keys.update(matches)

        unused = defined_keys - used_keys
        missing = used_keys - defined_keys

        dynamic_prefixes: List[str] = [
            'debug_', 'console_', 'language_abbreviation_', 'ui_components_',
            'file_', 'platform_', 'modal_', 'aria_', 'html_sections_',
            'errors_', 'success_', 'attachment_', 'batch_', 'compression_'
        ]

        truly_unused: List[str] = []
        for key in unused:
            if not any(key.startswith(prefix) for prefix in dynamic_prefixes):
                truly_unused.append(key)

        results: List[str] = [
            f"Defined keys: {len(defined_keys)}",
            f"Used keys: {len(used_keys)}",
            f"Unused keys: {len(truly_unused)} (excluding dynamic keys)",
            f"Missing keys: {len(missing)}"
        ]

        if missing:
            results.append("")
            results.append("❌ MISSING KEYS (used but not defined):")
            for key in sorted(list(missing))[:10]:
                results.append(f"  • {key}")
            if len(missing) > 10:
                results.append(f"  • ... and {len(missing) - 10} more")

        if truly_unused and len(truly_unused) <= 20:
            results.append("")
            results.append("⚠️  UNUSED KEYS:")
            for key in sorted(truly_unused):
                results.append(f"  • {key}")

        return {
            'title': "Key Usage Analysis",
            'content': results,
            'status': 'error' if missing else 'success'
        }

