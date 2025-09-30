#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: mcp-servers/tools/config.py
 * FUNCTION: Configuration system validation with dynamic limit detection
 * ARCHITECTURE: Codebase-aware config analysis with validation limits verification
 * SECURITY: Local processing only, no data transmission, privacy-first design
 * PERFORMANCE: Optimized pattern matching, efficient validation
 * COMPATIBILITY: Python 3.8+, analyzes JavaScript config system
 *
 * COPYRIGHT © 2025 HOSTWEK LTD. ALL RIGHTS RESERVED.
 * DEVELOPED BY JOSEPH MATINO UNDER WEKTURBO DESIGNS - HOSTWEK LTD
 * LICENSED UNDER HOSTWEK CUSTOM LICENSE
 * ================================================================================
 """

import os
import re
from typing import Dict, Any, List, Optional
from mcp.types import Tool
from .base import BaseTool


class ConfigTool(BaseTool):
    """Validate centralized config system with dynamic limit detection."""

    def __init__(self):
        super().__init__(
            name="validate_config",
            description="Validate centralized config system (GPTPF_CONFIG) with dynamic detection of validation limits from actual code"
        )
        self._word_limits: Optional[Dict[str, int]] = None

    def _detect_word_limits(self) -> Dict[str, int]:
        """Dynamically detect word limits from config.js VALIDATION_LIMITS."""
        if self._word_limits is not None:
            return self._word_limits

        limits: Dict[str, int] = {}
        config_content = self.read_file('src/shared/config.js')

        if config_content:
            validation_limits_match = re.search(
                r'VALIDATION_LIMITS\s*:\s*Object\.freeze\(\{([^}]+)\}\)',
                config_content,
                re.DOTALL
            )

            if validation_limits_match:
                limits_content = validation_limits_match.group(1)

                min_match = re.search(r'minWordLimit\s*:\s*(\d+)', limits_content)
                max_match = re.search(r'maxWordLimit\s*:\s*(\d+)', limits_content)

                if min_match:
                    limits['min'] = int(min_match.group(1))
                if max_match:
                    limits['max'] = int(max_match.group(1))

            defaults_match = re.search(
                r'DEFAULTS\s*:\s*Object\.freeze\(\{([^}]+)\}\)',
                config_content,
                re.DOTALL
            )

            if defaults_match:
                defaults_content = defaults_match.group(1)
                word_limit_match = re.search(r'wordLimit\s*:\s*(\d+)', defaults_content)
                if word_limit_match:
                    limits['default'] = int(word_limit_match.group(1))

        if not limits:
            limits = {'min': 50, 'max': 15000, 'default': 500}

        self._word_limits = limits
        return self._word_limits

    def get_definition(self) -> Tool:
        limits = self._detect_word_limits()
        limit_desc = f"Verify word limits ({limits.get('min', 50)}-{limits.get('max', 15000)}) are consistent"

        return Tool(
            name=self.name,
            description=self.description,
            inputSchema={
                "type": "object",
                "properties": {
                    "check_structure": {
                        "type": "boolean",
                        "description": "Validate GPTPF_CONFIG structure",
                        "default": True
                    },
                    "check_limits": {
                        "type": "boolean",
                        "description": limit_desc,
                        "default": True
                    },
                    "check_defaults": {
                        "type": "boolean",
                        "description": "Analyze default configuration values",
                        "default": True
                    },
                    "check_platform_timeouts": {
                        "type": "boolean",
                        "description": "Verify platform-specific timeout configurations",
                        "default": True
                    }
                }
            }
        )

    async def execute(self, arguments: Dict[str, Any]) -> str:
        check_structure = arguments.get('check_structure', True)
        check_limits = arguments.get('check_limits', True)
        check_defaults = arguments.get('check_defaults', True)
        check_timeouts = arguments.get('check_platform_timeouts', True)

        sections: List[Dict[str, Any]] = []

        if check_structure:
            structure = self._validate_structure()
            sections.append(structure)

        if check_limits:
            limits = self._validate_word_limits()
            sections.append(limits)

        if check_defaults:
            defaults = self._validate_defaults()
            sections.append(defaults)

        if check_timeouts:
            timeouts = self._validate_platform_timeouts()
            sections.append(timeouts)

        return self.format_result("CONFIG SYSTEM VALIDATION", sections)

    def _validate_structure(self) -> Dict[str, Any]:
        """Validate GPTPF_CONFIG structure."""
        config_path = 'src/shared/config.js'
        content = self.read_file(config_path)

        if not content:
            return {
                'title': "Config Structure",
                'content': ["❌ Cannot read config.js"],
                'status': 'error'
            }

        results: List[str] = []
        all_valid = True

        required_sections: List[str] = [
            'VERSION', 'APP_NAME', 'LANGUAGE_DEFAULT', 'HOSTS',
            'PLATFORM_DOMAINS', 'OFFICIAL_LINKS', 'PLATFORM_TIMEOUTS',
            'DEBUG', 'DEFAULTS', 'VALIDATION_LIMITS'
        ]

        for section in required_sections:
            pattern = rf'{section}\s*:'
            if re.search(pattern, content):
                results.append(f"✅ {section}")
            else:
                results.append(f"❌ {section} MISSING")
                all_valid = False

        freeze_count = content.count('Object.freeze')
        if freeze_count > 0:
            results.append(f"✅ Configuration frozen ({freeze_count} freeze calls)")
        else:
            results.append("⚠️  Configuration not frozen")

        version_match = re.search(r"VERSION\s*:\s*['\"]([^'\"]+)['\"]", content)
        if version_match:
            results.append(f"✅ Version: {version_match.group(1)}")

        app_name_match = re.search(r"APP_NAME\s*:\s*['\"]([^'\"]+)['\"]", content)
        if app_name_match:
            results.append(f"✅ App Name: {app_name_match.group(1)}")

        return {
            'title': "GPTPF_CONFIG Structure",
            'content': results,
            'status': 'success' if all_valid else 'error'
        }

    def _validate_word_limits(self) -> Dict[str, Any]:
        """Verify word limits are consistent across all files."""
        limits = self._detect_word_limits()
        results: List[str] = []
        all_consistent = True

        results.append(f"Expected Limits: {limits['min']}-{limits['max']} words (default: {limits['default']})")
        results.append("")

        config_content = self.read_file('src/shared/config.js')
        if config_content:
            min_match = re.search(r'minWordLimit\s*:\s*(\d+)', config_content)
            max_match = re.search(r'maxWordLimit\s*:\s*(\d+)', config_content)
            default_match = re.search(r'wordLimit\s*:\s*(\d+)', config_content)

            if min_match and int(min_match.group(1)) == limits['min']:
                results.append(f"✅ config.js: minWordLimit = {min_match.group(1)}")
            else:
                results.append(f"❌ config.js: minWordLimit mismatch")
                all_consistent = False

            if max_match and int(max_match.group(1)) == limits['max']:
                results.append(f"✅ config.js: maxWordLimit = {max_match.group(1)}")
            else:
                results.append(f"❌ config.js: maxWordLimit mismatch")
                all_consistent = False

            if default_match and int(default_match.group(1)) == limits['default']:
                results.append(f"✅ config.js: wordLimit = {default_match.group(1)}")
            else:
                results.append(f"❌ config.js: wordLimit mismatch")
                all_consistent = False

        html_content = self.read_file('src/popup/index.html')
        if html_content:
            max_attr = re.search(r'max=[\'"](\d+)[\'"]', html_content)
            if max_attr and int(max_attr.group(1)) == limits['max']:
                results.append(f"✅ index.html: max attribute = {max_attr.group(1)}")
            else:
                results.append(f"❌ index.html: max attribute mismatch")
                all_consistent = False

        locales_dir = os.path.join(self.project_root, '_locales')
        if os.path.exists(locales_dir):
            locale_count = 0
            locale_matches = 0

            for locale in os.listdir(locales_dir):
                locale_file = os.path.join(locales_dir, locale, 'messages.json')
                if os.path.isfile(locale_file):
                    locale_count += 1
                    content = self.read_file(f'_locales/{locale}/messages.json')
                    if content:
                        # Support ALL international number formats
                        # Examples from actual locales:
                        # - ar: 50-15000 (no separator)
                        # - de/pt: 50-15.000 (dot as thousands separator)
                        # - en/es/hi/ja/sw/zh: 50-15,000 (comma as thousands separator)
                        # - fr/ru: 50-15 000 (space as thousands separator)
                        
                        min_val = str(limits['min'])
                        max_val = str(limits['max'])
                        
                        # Build comprehensive pattern list
                        patterns_to_check = [
                            f"{min_val}-{max_val}",           # 50-15000 (no separator)
                            f"{min_val}-{max_val[:-3]},{max_val[-3:]}",  # 50-15,000 (comma)
                            f"{min_val}-{max_val[:-3]}.{max_val[-3:]}",  # 50-15.000 (dot)
                            f"{min_val}-{max_val[:-3]} {max_val[-3:]}",  # 50-15 000 (space)
                        ]
                        
                        # Check if ANY format matches
                        if any(pattern in content for pattern in patterns_to_check):
                            locale_matches += 1

            if locale_matches == locale_count:
                results.append(f"✅ All {locale_count} locales: Word limit text validated (supports 4 number formats)")
            else:
                results.append(f"❌ Locales: {locale_matches}/{locale_count} have word limit text")
                all_consistent = False

        return {
            'title': f"Word Limit Consistency ({limits['min']}-{limits['max']:,} words)",
            'content': results,
            'status': 'success' if all_consistent else 'error'
        }

    def _validate_defaults(self) -> Dict[str, Any]:
        """Analyze default configuration values."""
        config_path = 'src/shared/config.js'
        content = self.read_file(config_path)

        if not content:
            return {
                'title': "Default Configuration",
                'content': ["❌ Cannot read config.js"],
                'status': 'error'
            }

        results: List[str] = []
        all_found = True

        defaults_match = re.search(r'DEFAULTS\s*:\s*Object\.freeze\(\{([^}]+)\}\)', content, re.DOTALL)
        if defaults_match:
            defaults_content = defaults_match.group(1)

            key_patterns: Dict[str, str] = {
                'debugMode': r'debugMode\s*:\s*(true|false)',
                'wordLimit': r'wordLimit\s*:\s*(\d+)',
                'autoAttachEnabled': r'autoAttachEnabled\s*:\s*(true|false)',
                'batchMode': r'batchMode\s*:\s*(true|false)',
                'telemetryEnabled': r'telemetryEnabled\s*:\s*(true|false)',
                'claudeOverride': r'claudeOverride\s*:\s*(true|false)',
                'defaultTheme': r'defaultTheme\s*:\s*[\'"]([^\'\"]+)[\'"]',
                'debugLevel': r'debugLevel\s*:\s*[\'"]([^\'\"]+)[\'"]'
            }

            for key, pattern in key_patterns.items():
                match = re.search(pattern, defaults_content)
                if match:
                    results.append(f"✅ {key}: {match.group(1)}")
                else:
                    results.append(f"❌ {key}: NOT FOUND")
                    all_found = False
        else:
            results.append("❌ DEFAULTS section not found")
            all_found = False

        return {
            'title': "Default Configuration Values",
            'content': results,
            'status': 'success' if all_found else 'error'
        }

    def _validate_platform_timeouts(self) -> Dict[str, Any]:
        """Validate platform-specific timeout configurations."""
        config_content = self.read_file('src/shared/config.js')

        if not config_content:
            return {
                'title': "Platform Timeouts",
                'content': ["❌ Cannot read config.js"],
                'status': 'error'
            }

        results: List[str] = []

        timeouts_match = re.search(
            r'PLATFORM_TIMEOUTS\s*:\s*Object\.freeze\(\{([^}]+)\}\)',
            config_content,
            re.DOTALL
        )

        if timeouts_match:
            timeouts_content = timeouts_match.group(1)

            platform_pattern = r'(\w+)\s*:\s*(\d+)'
            matches = re.findall(platform_pattern, timeouts_content)

            results.append(f"Platform Timeouts ({len(matches)}):")
            for platform, timeout in matches:
                results.append(f"  • {platform}: {timeout}ms")
        else:
            results.append("❌ PLATFORM_TIMEOUTS section not found")

        return {
            'title': "Platform Timeout Configuration",
            'content': results,
            'status': 'success'
        }

