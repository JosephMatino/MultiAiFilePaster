#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: mcp-servers/tools/manifest.py
 * FUNCTION: Manifest V3 validation tool with dynamic platform detection
 * ARCHITECTURE: Codebase-aware manifest analysis with permission validation
 * SECURITY: Local processing only, no data transmission, privacy-first design
 * PERFORMANCE: Optimized JSON parsing, efficient validation
 * COMPATIBILITY: Python 3.8+, validates Chrome Extension Manifest V3
 *
 * COPYRIGHT © 2025 HOSTWEK LTD. ALL RIGHTS RESERVED.
 * DEVELOPED BY JOSEPH MATINO UNDER WEKTURBO DESIGNS - HOSTWEK LTD
 * LICENSED UNDER HOSTWEK CUSTOM LICENSE
 * ================================================================================
 """

import os
import re
from typing import Dict, Any, List, Set, Optional
from mcp.types import Tool
from .base import BaseTool


class ManifestTool(BaseTool):
    """Validate Manifest V3 compliance with dynamic platform detection."""
    
    REQUIRED_FIELDS: List[str] = ['manifest_version', 'name', 'version', 'description']
    REQUIRED_MV3_FIELDS: List[str] = ['manifest_version', 'name', 'version', 'permissions', 'host_permissions']
    
    def __init__(self):
        super().__init__(
            name="validate_manifest",
            description="Validate Manifest V3 compliance with dynamic platform detection from config.js and manifest.json"
        )
        self._expected_platforms: Optional[List[str]] = None
    
    def _detect_expected_platforms(self) -> List[str]:
        """Dynamically detect expected platforms from config.js PLATFORM_DOMAINS."""
        if self._expected_platforms is not None:
            return self._expected_platforms
        
        platforms: List[str] = []
        config_content = self.read_file('src/shared/config.js')
        
        if config_content:
            platform_domains_match = re.search(
                r'PLATFORM_DOMAINS\s*:\s*Object\.freeze\(\{([^}]+)\}\)',
                config_content,
                re.DOTALL
            )
            
            if platform_domains_match:
                domains_content = platform_domains_match.group(1)
                domain_pattern = r"['\"]([a-z0-9\.\-]+)['\"]"
                found_domains = re.findall(domain_pattern, domains_content)
                platforms = [d for d in found_domains if '.' in d]
        
        if not platforms:
            manifest = self.read_json('manifest.json')
            if manifest and 'host_permissions' in manifest:
                for host in manifest['host_permissions']:
                    domain_match = re.search(r'https?://([^/\*]+)', host)
                    if domain_match:
                        platforms.append(domain_match.group(1))
        
        self._expected_platforms = list(set(platforms))
        return self._expected_platforms
    
    def get_definition(self) -> Tool:
        return Tool(
            name=self.name,
            description=self.description,
            inputSchema={
                "type": "object",
                "properties": {
                    "check_structure": {
                        "type": "boolean",
                        "description": "Validate manifest structure and required fields",
                        "default": True
                    },
                    "check_permissions": {
                        "type": "boolean",
                        "description": "Analyze permissions and host_permissions",
                        "default": True
                    },
                    "check_content_scripts": {
                        "type": "boolean",
                        "description": "Verify content_scripts configuration and file existence",
                        "default": True
                    },
                    "check_locales": {
                        "type": "boolean",
                        "description": "Verify web_accessible_resources includes all locale files",
                        "default": True
                    }
                }
            }
        )
    
    async def execute(self, arguments: Dict[str, Any]) -> str:
        check_structure = arguments.get('check_structure', True)
        check_permissions = arguments.get('check_permissions', True)
        check_content_scripts = arguments.get('check_content_scripts', True)
        check_locales = arguments.get('check_locales', True)
        
        manifest = self.read_json('manifest.json')
        if not manifest:
            return self.format_result("MANIFEST VALIDATION", [{
                'title': "Error",
                'content': ["❌ Cannot read manifest.json"],
                'status': 'error'
            }])
        
        sections: List[Dict[str, Any]] = []
        
        if check_structure:
            structure = self._validate_structure(manifest)
            sections.append(structure)
        
        if check_permissions:
            permissions = self._validate_permissions(manifest)
            sections.append(permissions)
        
        if check_content_scripts:
            content_scripts = self._validate_content_scripts(manifest)
            sections.append(content_scripts)
        
        if check_locales:
            locales = self._validate_locale_resources(manifest)
            sections.append(locales)
        
        return self.format_result("MANIFEST V3 VALIDATION", sections)
    
    def _validate_structure(self, manifest: Dict[str, Any]) -> Dict[str, Any]:
        """Validate manifest structure and required fields."""
        results: List[str] = []
        all_valid = True
        
        for field in self.REQUIRED_FIELDS:
            if field in manifest:
                value = manifest[field]
                if field == 'version':
                    results.append(f"✅ {field}: {value}")
                elif field == 'manifest_version':
                    results.append(f"✅ {field}: {value}")
                else:
                    display_value = value if len(str(value)) < 50 else f"{str(value)[:47]}..."
                    results.append(f"✅ {field}: {display_value}")
            else:
                results.append(f"❌ {field}: MISSING")
                all_valid = False
        
        manifest_version = manifest.get('manifest_version')
        if manifest_version == 3:
            results.append("✅ Manifest V3 compliant")
        else:
            results.append(f"❌ Manifest version {manifest_version} (expected 3)")
            all_valid = False
        
        if 'background' in manifest:
            bg = manifest['background']
            if 'service_worker' in bg:
                results.append(f"✅ Service worker: {bg['service_worker']}")
            else:
                results.append("❌ Service worker: MISSING (required for MV3)")
                all_valid = False
        else:
            results.append("❌ Background configuration: MISSING")
            all_valid = False
        
        if 'default_locale' in manifest:
            results.append(f"✅ Default locale: {manifest['default_locale']}")
        
        return {
            'title': "Manifest Structure",
            'content': results,
            'status': 'success' if all_valid else 'error'
        }
    
    def _validate_permissions(self, manifest: Dict[str, Any]) -> Dict[str, Any]:
        """Validate permissions and host_permissions."""
        expected_platforms = self._detect_expected_platforms()
        results: List[str] = []
        
        permissions = manifest.get('permissions', [])
        results.append(f"Permissions ({len(permissions)}):")
        for perm in permissions:
            results.append(f"  • {perm}")
        
        host_permissions = manifest.get('host_permissions', [])
        results.append(f"\nHost Permissions ({len(host_permissions)}):")
        
        missing_platforms: List[str] = []
        for platform in expected_platforms:
            found = any(platform in host for host in host_permissions)
            if found:
                results.append(f"  ✅ {platform}")
            else:
                results.append(f"  ❌ {platform} (MISSING)")
                missing_platforms.append(platform)
        
        results.append(f"\nExpected platforms: {len(expected_platforms)}")
        results.append(f"Configured platforms: {len(host_permissions)}")
        
        return {
            'title': f"Permissions Analysis ({len(expected_platforms)} platforms expected)",
            'content': results,
            'status': 'error' if missing_platforms else 'success'
        }
    
    def _validate_content_scripts(self, manifest: Dict[str, Any]) -> Dict[str, Any]:
        """Validate content_scripts configuration."""
        results: List[str] = []
        missing_files: List[str] = []
        
        content_scripts = manifest.get('content_scripts', [])
        if not content_scripts:
            return {
                'title': "Content Scripts",
                'content': ["❌ No content scripts defined"],
                'status': 'error'
            }
        
        results.append(f"Content Scripts ({len(content_scripts)}):")
        
        for idx, script in enumerate(content_scripts, 1):
            matches = script.get('matches', [])
            js_files = script.get('js', [])
            css_files = script.get('css', [])
            
            results.append(f"\nScript {idx}:")
            results.append(f"  Matches: {len(matches)} patterns")
            results.append(f"  JS files: {len(js_files)}")
            results.append(f"  CSS files: {len(css_files)}")
            
            for js_file in js_files:
                file_exists = os.path.exists(os.path.join(self.project_root, js_file))
                if file_exists:
                    results.append(f"    ✅ {js_file}")
                else:
                    results.append(f"    ❌ {js_file} (FILE NOT FOUND)")
                    missing_files.append(js_file)
            
            for css_file in css_files:
                file_exists = os.path.exists(os.path.join(self.project_root, css_file))
                if file_exists:
                    results.append(f"    ✅ {css_file}")
                else:
                    results.append(f"    ❌ {css_file} (FILE NOT FOUND)")
                    missing_files.append(css_file)
        
        return {
            'title': "Content Scripts Configuration",
            'content': results,
            'status': 'error' if missing_files else 'success'
        }
    
    def _validate_locale_resources(self, manifest: Dict[str, Any]) -> Dict[str, Any]:
        """Validate web_accessible_resources includes all locale files."""
        results: List[str] = []
        
        locales_dir = os.path.join(self.project_root, '_locales')
        available_locales: List[str] = []
        
        if os.path.exists(locales_dir):
            for item in os.listdir(locales_dir):
                locale_path = os.path.join(locales_dir, item)
                messages_file = os.path.join(locale_path, 'messages.json')
                if os.path.isdir(locale_path) and os.path.isfile(messages_file):
                    available_locales.append(item)
        
        web_resources = manifest.get('web_accessible_resources', [])
        if not web_resources:
            return {
                'title': "Web Accessible Resources",
                'content': ["❌ No web_accessible_resources defined"],
                'status': 'error'
            }
        
        accessible_files: Set[str] = set()
        for resource_group in web_resources:
            resources = resource_group.get('resources', [])
            accessible_files.update(resources)
        
        missing_locales: List[str] = []
        for locale in available_locales:
            locale_file = f"_locales/{locale}/messages.json"
            if locale_file in accessible_files:
                results.append(f"✅ {locale}")
            else:
                results.append(f"❌ {locale} (NOT IN web_accessible_resources)")
                missing_locales.append(locale)
        
        results.insert(0, f"Locale Files ({len(available_locales)} available):")
        
        return {
            'title': "Locale Resources Validation",
            'content': results,
            'status': 'error' if missing_locales else 'success'
        }

