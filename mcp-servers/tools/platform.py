#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: mcp-servers/tools/platform.py
 * FUNCTION: Platform handler analysis with dynamic platform detection
 * ARCHITECTURE: Codebase-aware platform integration analysis
 * SECURITY: Local processing only, no data transmission, privacy-first design
 * PERFORMANCE: Optimized file scanning, efficient pattern matching
 * COMPATIBILITY: Python 3.8+, analyzes JavaScript platform handlers
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


class PlatformTool(BaseTool):
    """Analyze platform handlers with dynamic detection from factory.js and filesystem."""

    def __init__(self):
        super().__init__(
            name="analyze_platforms",
            description="Analyze platform handlers with dynamic detection, check factory pattern, verify platform-specific logic"
        )
        self._platforms: Optional[Dict[str, str]] = None
        self._required_methods: Optional[List[str]] = None

    def _detect_platforms(self) -> Dict[str, str]:
        """Dynamically detect platforms from factory.js and filesystem."""
        if self._platforms is not None:
            return self._platforms

        platforms: Dict[str, str] = {}

        factory_content = self.read_file('src/content/platforms/factory.js')
        if factory_content:
            platform_map_match = re.search(
                r'const\s+map\s*=\s*\{([^}]+)\}',
                factory_content
            )

            if platform_map_match:
                map_content = platform_map_match.group(1)
                platform_pattern = r'(\w+):\s*[\'"](\w+Platform)[\'"]'
                matches = re.findall(platform_pattern, map_content)

                for platform_name, _ in matches:
                    platform_file = f'src/content/platforms/{platform_name}.js'
                    if os.path.exists(os.path.join(self.project_root, platform_file)):
                        platforms[platform_name] = platform_file

        if not platforms:
            platforms_dir = os.path.join(self.project_root, 'src/content/platforms')
            if os.path.exists(platforms_dir):
                for file in os.listdir(platforms_dir):
                    if file.endswith('.js') and file != 'factory.js':
                        platform_name = file.replace('.js', '')
                        platforms[platform_name] = f'src/content/platforms/{file}'

        self._platforms = platforms
        return self._platforms

    def _detect_required_methods(self) -> List[str]:
        """Dynamically detect required methods from actual platform implementations."""
        if self._required_methods is not None:
            return self._required_methods

        methods: List[str] = []

        platforms = self._detect_platforms()
        if platforms:
            first_platform_file = list(platforms.values())[0]
            content = self.read_file(first_platform_file)

            if content:
                method_pattern = r'^\s{2}(\w+)\s*\([^)]*\)\s*\{'
                matches = re.findall(method_pattern, content, re.MULTILINE)

                common_methods = [
                    'isCurrentPlatform', 'getPlatformSettings', 'getComposer',
                    'getAttachButton', 'getFileInput', 'ensureFileInput', 'attachFile'
                ]

                methods = [m for m in common_methods if m in matches]

                if not methods:
                    methods = common_methods

        self._required_methods = methods if methods else [
            'isCurrentPlatform', 'getPlatformSettings', 'getComposer',
            'getAttachButton', 'getFileInput', 'ensureFileInput', 'attachFile'
        ]

        return self._required_methods

    def get_definition(self) -> Tool:
        platforms = self._detect_platforms()
        platform_names = list(platforms.keys()) if platforms else ["chatgpt", "claude", "gemini", "deepseek", "grok"]

        return Tool(
            name=self.name,
            description=self.description,
            inputSchema={
                "type": "object",
                "properties": {
                    "check_methods": {
                        "type": "boolean",
                        "description": "Verify all required methods are implemented",
                        "default": True
                    },
                    "check_factory": {
                        "type": "boolean",
                        "description": "Analyze factory pattern implementation",
                        "default": True
                    },
                    "platform": {
                        "type": "string",
                        "description": f"Specific platform to analyze ({'/'.join(platform_names)})",
                        "enum": platform_names + ["all"],
                        "default": "all"
                    }
                }
            }
        )

    async def execute(self, arguments: Dict[str, Any]) -> str:
        check_methods = arguments.get('check_methods', True)
        check_factory = arguments.get('check_factory', True)
        platform_filter = arguments.get('platform', 'all')

        platforms = self._detect_platforms()

        sections: List[Dict[str, Any]] = []

        if check_factory:
            factory = self._analyze_factory()
            sections.append(factory)

        if check_methods:
            platforms_to_check = [platform_filter] if platform_filter != 'all' else list(platforms.keys())

            for platform in platforms_to_check:
                if platform in platforms:
                    analysis = self._analyze_platform(platform, platforms[platform])
                    sections.append(analysis)

        return self.format_result("PLATFORM ANALYSIS", sections)

    def _analyze_factory(self) -> Dict[str, Any]:
        """Analyze factory pattern implementation."""
        factory_path = 'src/content/platforms/factory.js'
        content = self.read_file(factory_path)

        if not content:
            return {
                'title': "Factory Pattern",
                'content': ["❌ Cannot read factory.js"],
                'status': 'error'
            }

        results: List[str] = []
        all_valid = True

        class_match = re.search(r'class\s+(\w+)\s*\{', content)
        if class_match:
            results.append(f"✅ Factory class: {class_match.group(1)}")
        else:
            results.append("❌ Factory class: NOT FOUND")
            all_valid = False

        platform_map_match = re.search(r'const\s+map\s*=\s*\{([^}]+)\}', content)
        if platform_map_match:
            map_content = platform_map_match.group(1)
            platform_entries = re.findall(r'(\w+):', map_content)
            results.append(f"✅ Platform map: {len(platform_entries)} platforms")
            for platform in platform_entries:
                results.append(f"  • {platform}")
        else:
            results.append("❌ Platform map: NOT FOUND")
            all_valid = False

        factory_methods: Dict[str, str] = {
            'getCurrentPlatform': r'static\s+getCurrentPlatform\s*\(',
            'createPlatformHandler': r'static\s+createPlatformHandler\s*\(',
            'getPlatformSettings': r'static\s+getPlatformSettings\s*\(',
            'isSupportedPlatform': r'static\s+isSupportedPlatform\s*\(',
            'getSupportedPlatforms': r'static\s+getSupportedPlatforms\s*\('
        }

        results.append("\nFactory Methods:")
        for method, pattern in factory_methods.items():
            if re.search(pattern, content):
                results.append(f"  ✅ {method}()")
            else:
                results.append(f"  ⚠️  {method}() not found")

        return {
            'title': "Factory Pattern Analysis",
            'content': results,
            'status': 'success' if all_valid else 'error'
        }

    def _analyze_platform(self, platform: str, file_path: str) -> Dict[str, Any]:
        """Analyze a specific platform handler."""
        content = self.read_file(file_path)

        if not content:
            return {
                'title': f"{platform.upper()} Platform",
                'content': [f"❌ Cannot read {file_path}"],
                'status': 'error'
            }

        results: List[str] = []
        all_methods_present = True

        class_match = re.search(r'class\s+(\w+Platform)', content)
        if class_match:
            class_name = class_match.group(1)
            results.append(f"✅ Class {class_name} defined")
        else:
            results.append(f"❌ Platform class NOT FOUND")
            all_methods_present = False

        required_methods = self._detect_required_methods()
        results.append(f"\nRequired Methods ({len(required_methods)}):")

        for method in required_methods:
            pattern = rf'^\s{{2}}{method}\s*\('
            if re.search(pattern, content, re.MULTILINE):
                results.append(f"  ✅ {method}()")
            else:
                results.append(f"  ❌ {method}() MISSING")
                all_methods_present = False

        lines = content.split('\n')
        results.append(f"\nFile: {file_path}")
        results.append(f"Size: {len(lines)} lines")

        platform_specific_patterns: Dict[str, str] = {
            'DOM selectors': r'querySelector|getElementById|getElementsBy',
            'Event listeners': r'addEventListener|on\w+\s*=',
            'File operations': r'File\(|FileReader|Blob',
            'Async operations': r'async\s+\w+|await\s+'
        }

        results.append("\nImplementation Features:")
        for feature, pattern in platform_specific_patterns.items():
            if re.search(pattern, content):
                results.append(f"  ✅ {feature}")

        return {
            'title': f"{platform.upper()} Platform Handler",
            'content': results,
            'status': 'success' if all_methods_present else 'error'
        }

