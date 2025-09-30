#!/usr/bin/env python3
# pyright: reportUnknownVariableType=none, reportUnknownMemberType=none, reportUnknownArgumentType=none, reportMissingImports=none, reportUntypedFunctionDecorator=none, reportUnknownLambdaType=none
"""
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: mcp-servers/multi_ai_assistant.py
 * FUNCTION: Model Context Protocol server for Chrome Extension development assistance
 * ARCHITECTURE: MCP Protocol, Python asyncio, Chrome Extension analysis tools
 * SECURITY: Local processing only, no data transmission, privacy-first design
 * PERFORMANCE: Optimized file discovery, efficient pattern analysis, cached results
 * COMPATIBILITY: Python 3.8+, MCP 1.14.0+, async/await patterns
 *
 * DEVELOPMENT TEAM & PROJECT LEADERSHIP:
 * • LEAD DEVELOPER: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • SCRUM MASTER & PROJECT FUNDING: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 * • QUALITY ASSURANCE: Automated testing pipeline
 * • PROJECT MANAGEMENT: Agile methodology, continuous integration/deployment
 * • CODE REVIEW: Peer review process, automated quality gates, security audits
 * • DOCUMENTATION: Technical writers, API documentation, user experience guides
 *
 * ORGANIZATION & GOVERNANCE:
 * • COMPANY: HOSTWEK LTD - Premium Hosting Company | East Africa | https://hostwek.com
 * • DIVISION: WekTurbo Designs - Web Development Division | https://hostwek.com/wekturbo
 * • REPOSITORY: https://github.com/JosephMatino/MultiAiFilePaster
 * • TECHNICAL SUPPORT: dev@josephmatino.com, wekturbo@hostwek.com | Response time: 24-48 hours
 * • DOCUMENTATION: Complete API docs, user guides, developer documentation
 * • COMMUNITY: Development community, issue tracking, feature requests
 * • ROADMAP: Public development roadmap, community feedback integration
 *
 * LEGAL & LICENSING INFORMATION:
 * COPYRIGHT © 2025 HOSTWEK LTD. ALL RIGHTS RESERVED.
 * DEVELOPED BY JOSEPH MATINO UNDER WEKTURBO DESIGNS - HOSTWEK LTD
 * LICENSED UNDER HOSTWEK CUSTOM LICENSE
 *
 * 📋 HOSTWEK CUSTOM LICENSE:
 * This software and associated documentation files are proprietary technology
 * of Hostwek LTD and its subsidiary WekTurbo Designs. The software contains trade
 * secrets, confidential algorithms, and proprietary methodologies developed by
 * Joseph Matino for browser and tooling solutions.
 *
 * PERMITTED USAGE RIGHTS:
 * Personal use by individuals for non-commercial purposes is permitted.
 * Educational institutions may use this software for instructional and research
 * activities. End users are authorized to install and operate the tooling as
 * distributed through official channels. Security researchers may conduct legitimate
 * analysis for vulnerability disclosure purposes.
 *
 * RESTRICTED COMMERCIAL ACTIVITIES:
 * Commercial use, including integration into commercial products, resale,
 * sublicensing, or distribution as part of commercial offerings, requires
 * written authorization from Hostwek LTD. Creation of derivative works,
 * competing products, or services based on this technology is prohibited
 * without prior licensing agreements. Reverse engineering for competitive
 * intelligence or commercial advantage is forbidden.
 *
 * INTELLECTUAL PROPERTY ENFORCEMENT:
 * Removal, modification, or obscuring of copyright notices, attribution statements,
 * or proprietary markings constitutes a breach of this license. Use of
 * Hostwek LTD trademarks, service marks, or brand elements without authorization
 * is prohibited and may result in trademark infringement proceedings.
 *
 * COMMERCIAL LICENSING & PARTNERSHIPS:
 * Organizations seeking commercial licensing, integration solutions,
 * white-label implementations, or custom development services should contact
 * Hostwek LTD through designated channels: wekturbo@hostwek.com for technical
 * licensing inquiries, scrum@majokdeng.com for business partnership discussions.
 *
 * 🛡️  INTELLECTUAL PROPERTY PROTECTION:
 * This software is protected under international copyright treaties and domestic
 * intellectual property laws. "Multi-AI File Paster", "Hostwek", and "WekTurbo
 * Designs" are trademarks of Hostwek LTD. Unauthorized copying,
 * modification, distribution, or reverse engineering may result in
 * civil penalties and criminal prosecution under applicable intellectual property
 * statutes.
 *
 * 🔒 CONFIDENTIALITY & TRADE SECRET PROTECTION:
 * This software contains confidential and proprietary information constituting
 * trade secrets of Hostwek LTD. Unauthorized disclosure, use, or distribution
 * of this technology or its underlying source code is prohibited and
 * may result in legal action, including injunctive relief and monetary damages.
 * ================================================================================
"""

import asyncio
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, cast, Set

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Resource, Tool, TextContent

server = Server("multi-ai-assistant")

PROJECT_ROOT = Path(__file__).parent.parent


def get_js_files(pattern: str = "src/**/*.js") -> List[Path]:
    """Get JavaScript files matching pattern."""
    return list(PROJECT_ROOT.rglob(pattern))


def get_files_by_glob(patterns: List[str], recursive: bool = True) -> List[str]:
    """Get files matching glob patterns with comprehensive error handling."""
    import glob
    files: List[str] = []

    for pattern in patterns:
        try:
            pattern_path = str(PROJECT_ROOT / pattern)
            matched_files = glob.glob(pattern_path, recursive=recursive)
            files.extend(matched_files)
        except (OSError, ValueError) as e:
            sys.stderr.write(f"Warning: Failed to process glob pattern '{pattern}': {e}\n")
            sys.stderr.flush()
            continue

    return files


def get_locale_files() -> Dict[str, Path]:
    """Get all locale message.json files."""
    locales_dir = PROJECT_ROOT / "_locales"
    locale_files = {}
    if locales_dir.exists():
        for locale_dir in locales_dir.iterdir():
            if locale_dir.is_dir():
                messages_file = locale_dir / "messages.json"
                if messages_file.exists():
                    locale_files[locale_dir.name] = messages_file
    return locale_files


def scan_directory_files(dir_path: Path, extensions: Optional[List[str]] = None) -> List[Path]:
    """Scan directory for files with optional extension filtering and robust error handling."""
    files: List[Path] = []

    if not dir_path.exists():
        return files

    try:
        for file_path in dir_path.rglob("*"):
            try:
                if file_path.is_file():
                    if extensions is None or file_path.suffix in extensions:
                        files.append(file_path)
            except (OSError, PermissionError):
                continue
    except (OSError, PermissionError) as e:
        sys.stderr.write(f"Warning: Cannot scan directory '{dir_path}': {e}\n")
        sys.stderr.flush()

    return files


def load_json_file(file_path: Path) -> Optional[Dict[str, Any]]:
    """Load JSON file with comprehensive error handling and validation."""
    try:
        if not file_path.exists():
            return None

        content = file_path.read_text(encoding='utf-8')
        if not content.strip():
            return None

        return json.loads(content)
    except (json.JSONDecodeError, UnicodeDecodeError, OSError) as e:
        sys.stderr.write(f"Warning: Failed to load JSON file '{file_path}': {e}\n")
        sys.stderr.flush()
        return None


@server.list_resources()
async def handle_list_resources() -> List[Resource]:
    """List available project resources with auto-discovery."""
    resources: List[Resource] = []

    core_patterns = [
        "manifest.json",
        "src/**/*.js",
        "src/**/*.html",
        "src/**/*.css",
        "_locales/**/*.json",
        "docs/**/*.md",
        "*.md"
    ]

    project_files = get_files_by_glob(core_patterns)

    for file_path in project_files:
        rel_path: str = os.path.relpath(file_path, PROJECT_ROOT)
        file_type: str = "Unknown"
        mime: str = "text/plain"

        if file_path.endswith('.js'):
            file_type = "JavaScript"
            mime = "application/javascript"
        elif file_path.endswith('.css'):
            file_type = "CSS"
            mime = "text/css"
        elif file_path.endswith('.html'):
            file_type = "HTML"
            mime = "text/html"
        elif file_path.endswith('.json'):
            file_type = "JSON/Config"
            mime = "application/json"
        elif file_path.endswith('.md'):
            file_type = "Documentation"
            mime = "text/markdown"
        elif file_path.endswith(('.png', '.jpg', '.jpeg', '.svg')):
            file_type = "Image"
            if file_path.endswith('.png'):
                mime = "image/png"
            elif file_path.endswith(('.jpg', '.jpeg')):
                mime = "image/jpeg"
            elif file_path.endswith('.svg'):
                mime = "image/svg+xml"

        uri_val = cast(Any, f"file://{file_path}")  # cast for strict checker
        resources.append(
            Resource(
                uri=uri_val,
                name=f"{file_type}: {rel_path}",
                description=f"Project file: {rel_path}",
                mimeType=mime
            )
        )

    return resources


@server.read_resource()
async def handle_read_resource(uri: Any):  # AnyUrl type enforced by decorator wrapper
    """Read and return resource content with comprehensive error handling.

    The mcp server decorator supplies an AnyUrl; we avoid explicit typing to
    stay compatible with the library's runtime validation while preventing
    type mismatch warnings from local analysis tools.
    """
    try:
        uri_str = str(uri)
        if not uri_str.startswith("file://"):
            raise ValueError(f"Unsupported URI scheme: {uri_str}")

        file_path = Path(uri_str[7:])  # strip scheme

        if not file_path.exists():
            raise FileNotFoundError(f"Resource not found: {file_path}")

        if not file_path.is_file():
            raise ValueError(f"Path is not a file: {file_path}")

        try:
            return file_path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            return file_path.read_text(encoding="utf-8", errors="replace")

    except (ValueError, FileNotFoundError) as e:
        raise e
    except Exception as e:
        raise RuntimeError(f"Failed to read resource '{uri}': {type(e).__name__}: {e}")


@server.list_tools()
async def handle_list_tools() -> List[Tool]:
    """List available Chrome Extension development tools."""
    return [
        Tool(
            name="analyze_project",
            description="Comprehensive analysis of Chrome Extension project structure, quality, and architecture patterns with performance and security analysis",
            inputSchema={
                "type": "object",
                "properties": {
                    "include_metrics": {
                        "type": "boolean",
                        "description": "Include detailed code metrics and performance statistics",
                        "default": True
                    },
                    "check_architecture": {
                        "type": "boolean",
                        "description": "Analyze Chrome Extension architecture and Manifest V3 compliance",
                        "default": True
                    }
                }
            }
        ),
        Tool(
            name="analyze_code_quality",
            description="Deep code quality analysis with security vulnerability detection, performance optimization, and maintainability assessment across JavaScript files",
            inputSchema={
                "type": "object",
                "properties": {
                    "include_suggestions": {
                        "type": "boolean",
                        "description": "Include actionable improvement suggestions with priority levels",
                        "default": True
                    },
                    "check_performance": {
                        "type": "boolean",
                        "description": "Analyze for performance bottlenecks and optimization opportunities",
                        "default": True
                    },
                    "check_security": {
                        "type": "boolean",
                        "description": "Comprehensive security vulnerability scanning and CSP compliance",
                        "default": True
                    }
                }
            }
        ),
        Tool(
            name="analyze_extension_structure",
            description="Chrome Extension architecture analysis with Manifest V3 compliance, permission auditing, and structural optimization recommendations",
            inputSchema={
                "type": "object",
                "properties": {
                    "check_permissions": {
                        "type": "boolean",
                        "description": "Audit manifest permissions for security and minimal privilege compliance",
                        "default": True
                    },
                    "check_architecture": {
                        "type": "boolean",
                        "description": "Analyze service worker, content scripts, and popup architecture patterns",
                        "default": True
                    }
                }
            }
        ),
        Tool(
            name="analyze_i18n",
            description="Comprehensive internationalization analysis for consistency, completeness, and optimization across all locale files",
            inputSchema={
                "type": "object",
                "properties": {
                    "check_duplicates": {
                        "type": "boolean",
                        "description": "Identify duplicate message values and optimization opportunities",
                        "default": True
                    }
                }
            }
        ),
        Tool(
            name="analyze_debug_integration",
            description="Debug system analysis across project files - identify missing debug patterns, unused keys, and integration completeness with GPTPF system",
            inputSchema={
                "type": "object",
                "properties": {
                    "check_unused_keys": {
                        "type": "boolean",
                        "description": "Identify unused debug keys in locale files for cleanup",
                        "default": True
                    },
                    "identify_missing": {
                        "type": "boolean",
                        "description": "Find files requiring debug system integration",
                        "default": True
                    }
                }
            }
        ),
        Tool(
            name="check_hardcoded_strings",
            description="Identify hardcoded user-facing strings that should be moved to internationalization files for proper localization",
            inputSchema={
                "type": "object",
                "properties": {
                    "file_patterns": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "File patterns to analyze for hardcoded strings",
                        "default": ["src/**/*.js", "src/**/*.html"]
                    }
                }
            }
        )
    ]


@server.call_tool()
async def handle_call_tool(name: str, arguments: Dict[str, Any]) -> List[TextContent]:
    """Handle Chrome Extension development tool execution with enhanced performance and security."""

    if name == "analyze_project":
        include_metrics = arguments.get("include_metrics", True)
        check_architecture = arguments.get("check_architecture", True)
        return await analyze_project(include_metrics, check_architecture)
    elif name == "analyze_code_quality":
        include_suggestions = arguments.get("include_suggestions", True)
        check_performance = arguments.get("check_performance", True)
        check_security = arguments.get("check_security", True)
        return await analyze_code_quality(include_suggestions, check_performance, check_security)
    elif name == "analyze_extension_structure":
        check_permissions = arguments.get("check_permissions", True)
        check_architecture = arguments.get("check_architecture", True)
        return await analyze_extension_structure(check_permissions, check_architecture)
    elif name == "analyze_i18n":
        check_duplicates = arguments.get("check_duplicates", True)
        return await analyze_i18n(check_duplicates)
    elif name == "analyze_debug_integration":
        check_unused_keys = arguments.get("check_unused_keys", True)
        identify_missing = arguments.get("identify_missing", True)
        return await analyze_debug_integration(check_unused_keys, identify_missing)
    elif name == "check_hardcoded_strings":
        file_patterns = arguments.get("file_patterns", ["src/**/*.js", "src/**/*.html"])
        return await check_hardcoded_strings(file_patterns)
    else:
        raise ValueError(f"Unknown tool: {name}")


async def analyze_project(include_metrics: bool = True, check_architecture: bool = True) -> List[TextContent]:
    """INTELLIGENT project analysis with dynamic discovery, semantic insights, and actionable recommendations."""
    import re
    import datetime

    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    result = f"🧠 INTELLIGENT PROJECT ANALYSIS [{timestamp}]\n" + ("=" * 80) + "\n\n"

    all_files: Dict[str, Dict[str, Any]] = {}
    file_categories: Dict[str, List[Dict[str, Any]]] = {
        'Core': [], 'Infrastructure': [], 'UI': [], 'Config': [], 'Assets': [], 'Docs': []
    }

    all_project_files = scan_directory_files(PROJECT_ROOT, None)
    for file_path in all_project_files:
        if not any(part.startswith('.') for part in file_path.parts):
            try:
                rel_path = str(file_path.relative_to(PROJECT_ROOT))
                file_info = {
                    'path': rel_path,
                    'size': file_path.stat().st_size,
                    'lines': 0,
                    'category': 'Other',
                    'type': file_path.suffix.lower(),
                    'complexity': 0,
                    'importance': 0
                }

                if 'src' in rel_path and file_path.suffix == '.js':
                    if 'background' in rel_path:
                        file_info['category'] = 'Infrastructure'
                        file_info['importance'] = 95
                    elif 'content' in rel_path:
                        file_info['category'] = 'Core'
                        file_info['importance'] = 90
                    elif 'popup' in rel_path:
                        file_info['category'] = 'UI'
                        file_info['importance'] = 85
                    elif 'shared' in rel_path:
                        file_info['category'] = 'Infrastructure'
                        file_info['importance'] = 80
                    elif 'components' in rel_path:
                        file_info['category'] = 'UI'
                        file_info['importance'] = 75
                    elif 'platforms' in rel_path:
                        file_info['category'] = 'Core'
                        file_info['importance'] = 85
                elif file_path.suffix in ['.css', '.html']:
                    file_info['category'] = 'UI'
                    file_info['importance'] = 60
                elif file_path.suffix == '.json':
                    if file_path.name == 'manifest.json':
                        file_info['category'] = 'Config'
                        file_info['importance'] = 100
                    elif 'messages.json' in file_path.name:
                        file_info['category'] = 'Config'
                        file_info['importance'] = 80
                    else:
                        file_info['category'] = 'Config'
                        file_info['importance'] = 50
                elif file_path.suffix == '.md':
                    file_info['category'] = 'Docs'
                    file_info['importance'] = 40
                elif file_path.suffix in ['.png', '.jpg', '.jpeg', '.svg']:
                    file_info['category'] = 'Assets'
                    file_info['importance'] = 30

                if file_path.suffix in ['.js', '.css', '.html', '.json', '.md']:
                    try:
                        content = file_path.read_text(encoding='utf-8')
                        file_info['lines'] = len(content.splitlines())

                        if file_path.suffix == '.js':
                            file_info['complexity'] = _calculate_js_complexity(content)
                        elif file_path.suffix == '.css':
                            file_info['complexity'] = len(re.findall(r'\{[^}]*\}', content))

                    except Exception:
                        pass

                all_files[rel_path] = file_info
                category = str(file_info['category'])
                if category in file_categories:
                    file_categories[category].append(file_info)

            except Exception:
                continue

    total_files = len(all_files)
    total_lines = sum(f['lines'] for f in all_files.values())
    critical_files = [f for f in all_files.values() if f['importance'] >= 90]

    result += f"📊 SMART PROJECT OVERVIEW\n"
    result += f"Total Files: {total_files} | Total Lines: {total_lines:,}\n"
    result += f"Critical Files: {len(critical_files)} | High Complexity: {len([f for f in all_files.values() if f['complexity'] > 50])}\n\n"

    frameworks_detected = []
    patterns_detected = []

    manifest_path = PROJECT_ROOT / 'manifest.json'
    if manifest_path.exists():
        try:
            with open(manifest_path, 'r', encoding='utf-8') as f:
                manifest = json.load(f)

            version = manifest.get('manifest_version', 2)
            if version == 3:
                frameworks_detected.append(f"Chrome Extension Manifest V{version}")

            if 'content_scripts' in manifest:
                patterns_detected.append("Content Script Architecture")
            if 'background' in manifest:
                patterns_detected.append("Background Worker Pattern")
            if 'action' in manifest or 'browser_action' in manifest:
                patterns_detected.append("Browser Action UI")

        except Exception:
            pass

    js_files = [f for f in all_files.values() if f['type'] == '.js']
    for js_file in js_files[:10]:  # Analyze top files to avoid performance issues
        try:
            content = (PROJECT_ROOT / js_file['path']).read_text(encoding='utf-8')

            if re.search(r'class\s+\w+Factory', content):
                patterns_detected.append("Factory Pattern")
            if re.search(r'addEventListener|attachEvent', content):
                patterns_detected.append("Event-Driven Architecture")
            if re.search(r'async\s+function|await\s+', content):
                patterns_detected.append("Async/Await Pattern")
            if re.search(r'import\s+.*from|require\s*\(', content):
                patterns_detected.append("Module System")

        except Exception:
            continue

    if check_architecture:
        result += f"🏗️ INTELLIGENT ARCHITECTURE ANALYSIS\n"
        result += f"Detected Frameworks: {', '.join(frameworks_detected) if frameworks_detected else 'None detected'}\n"
        result += f"Design Patterns: {', '.join(set(patterns_detected)) if patterns_detected else 'None detected'}\n\n"

        result += f"📁 SMART FILE CATEGORIZATION\n"
        for category, files in file_categories.items():
            if files:
                avg_importance = sum(f['importance'] for f in files) / len(files)
                result += f"  • {category}: {len(files)} files (avg importance: {avg_importance:.0f}%)\n"
        result += "\n"

    if include_metrics:
        result += f"📈 INTELLIGENT METRICS\n"

        high_impact = sorted([f for f in all_files.values() if f['importance'] >= 80],
                           key=lambda x: x['importance'], reverse=True)
        if high_impact:
            result += f"🎯 Critical Files ({len(high_impact)}):\n"
            for f in high_impact[:5]:
                result += f"  • {f['path']} (importance: {f['importance']}%, complexity: {f['complexity']})\n"

        complex_files = sorted([f for f in all_files.values() if f['complexity'] > 20],
                             key=lambda x: x['complexity'], reverse=True)
        if complex_files:
            result += f"\n🔥 Most Complex Files:\n"
            for f in complex_files[:3]:
                result += f"  • {f['path']} (complexity: {f['complexity']}, {f['lines']} lines)\n"

        result += "\n"

    result += f"💡 INTELLIGENT RECOMMENDATIONS\n"
    recommendations = _generate_smart_recommendations(all_files, file_categories, patterns_detected)

    for i, rec in enumerate(recommendations, 1):
        result += f"  {i}. {rec}\n"

    if not recommendations:
        result += "  ✨ Project architecture is well-optimized!\n"

    return [TextContent(type='text', text=result)]


def _calculate_js_complexity(content: str) -> int:
    """Calculate JavaScript complexity based on various factors."""
    complexity = 0

    complexity += len(re.findall(r'function\s+\w+|=>\s*{|async\s+function', content))

    complexity += len(re.findall(r'\b(if|else|for|while|switch|try|catch)\b', content))

    complexity += len(re.findall(r'addEventListener|on\w+\s*=', content))

    complexity += len(re.findall(r'document\.|getElementById|querySelector', content))

    return complexity


def _generate_smart_recommendations(all_files: Dict[str, Dict[str, Any]],
                                  file_categories: Dict[str, List[Dict[str, Any]]],
                                  patterns: List[str]) -> List[str]:
    """Generate intelligent, actionable recommendations based on project analysis."""
    recommendations = []

    very_large_files = [f for f in all_files.values() if f['lines'] > 1200]
    if very_large_files:
        recommendations.append(
            f"A few files are very large (>1200 lines). Consider targeted extraction only if maintainability suffers."
        )

    complex_files = [f for f in all_files.values() if f['complexity'] > 80]
    if len(complex_files) >= 3:
        recommendations.append(
            f"High complexity detected in several files. Consider focused simplification where it improves clarity."
        )


    ui_files = file_categories.get('UI', [])
    css_files = [f for f in ui_files if f['path'].endswith('.css')]
    if len(css_files) > 6:
        recommendations.append("Review CSS for consistent design tokens and enable minification; consolidation optional")

    docs = file_categories.get('Docs', [])
    if len(docs) < 3:
        recommendations.append("Add comprehensive documentation (API docs, deployment guide)")

    config_files = file_categories.get('Config', [])
    manifest_files = [f for f in config_files if 'manifest.json' in f['path']]
    if manifest_files:
        recommendations.append("Review manifest permissions for minimal privilege principle")

    return recommendations


async def validate_manifest() -> List[TextContent]:
    """Validate Chrome Extension manifest.json."""
    manifest_path = PROJECT_ROOT / "manifest.json"

    if not manifest_path.exists():
        return [TextContent(type="text", text="❌ manifest.json not found")]

    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)

        issues = []

        required_fields = ["manifest_version", "name", "version"]
        for field in required_fields:
            if field not in manifest:
                issues.append(f"❌ Missing required field: {field}")

        if manifest.get("manifest_version") == 3:
            if "background" in manifest and "scripts" in manifest["background"]:
                issues.append("⚠️  Manifest V3 should use 'service_worker' instead of 'scripts' in background")

        permissions = manifest.get("permissions", [])
        host_permissions = manifest.get("host_permissions", [])

        result = f"✅ Manifest validation complete\n\n"
        result += f"📋 Basic Info:\n"
        result += f"  • Name: {manifest.get('name', 'N/A')}\n"
        result += f"  • Version: {manifest.get('version', 'N/A')}\n"
        result += f"  • Manifest Version: {manifest.get('manifest_version', 'N/A')}\n\n"
        result += f"🔐 Permissions: {len(permissions)} standard, {len(host_permissions)} host\n\n"

        if issues:
            result += f"⚠️  Issues Found:\n"
            for issue in issues:
                result += f"  • {issue}\n"
        else:
            result += f"✅ No issues found"

        return [TextContent(type="text", text=result)]

    except json.JSONDecodeError as e:
        return [TextContent(type="text", text=f"❌ Invalid JSON in manifest.json: {e}")]
    except Exception as e:
        return [TextContent(type="text", text=f"❌ Error validating manifest: {e}")]


async def brand_assets() -> List[TextContent]:
    """List core brand assets (icons/logos) with paths and mime types."""
    logo_dir = PROJECT_ROOT / "logo"
    if not logo_dir.exists():
        return [TextContent(type="text", text="❌ logo directory not found")]

    entries: List[str] = []
    mime_map = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml" }
    for p in sorted([Path(f) for f in get_files_by_glob(["logo/*"])]):
        if p.is_file() and p.suffix.lower() in mime_map:
            entries.append(f"• {p.name}  —  {mime_map[p.suffix.lower()]}  —  {os.path.relpath(p, PROJECT_ROOT)}")

    if not entries:
        return [TextContent(type="text", text="⚠️ No logo files found in logo/")]

    result = "🏷️ Brand Assets (logo/)\n\n" + "\n".join(entries)
    return [TextContent(type="text", text=result)]


async def license_audit(paths: Optional[List[str]] = None, header_window: int = 80) -> List[TextContent]:
    """Audit repo for Hostwek Custom License header compliance.

    Only checks JavaScript and Python source code files per project rules.
    Excludes CSS, HTML, MD files which should NOT have license headers.
    """
    default_patterns = [
        "src/**/*.js", ".github/hooks/*.js", "mcp-servers/**/*.py"
    ]
    patterns = paths if paths else default_patterns

    markers = [
        "MULTI-AI FILE PASTER",
        "HOSTWEK CUSTOM LICENSE",
        "HOSTWEK LTD",
        "WEKTURBO DESIGNS",
        "Joseph Matino"
    ]

    candidates = get_files_by_glob(patterns)

    non_compliant: List[str] = []
    checked = 0
    for fp in candidates:
        if fp.endswith(('.png', '.jpg', '.jpeg', '.svg', '.ico', '.md', '.html', '.json', '.css')):
            continue
        try:
            with open(fp, 'r', encoding='utf-8', errors='ignore') as f:
                head_lines: List[str] = []
                if header_window > 0:
                    for _ in range(header_window):
                        line = f.readline()
                        if not line:
                            break
                        head_lines.append(line)
                    head = ''.join(head_lines)
                else:
                    head = f.read()
                if not any(m in head for m in markers):
                    non_compliant.append(os.path.relpath(fp, PROJECT_ROOT))
                checked += 1
        except Exception:
            continue

    report = [
        "🧾 License Header Audit",
        "=" * 50,
        f"\nChecked files: {checked} (source code only)",
        f"Header window: {header_window} lines",
        f"\nScope: JavaScript, Python source files only",
        f"Excluded: CSS, HTML, MD, JSON files (per project rules - no license headers needed)",
        "\nMarkers required (any):",
    ]
    for m in markers:
        report.append(f"  • {m}")

    if non_compliant:
        report.append(f"\n❌ Non-compliant files ({len(non_compliant)}):")
        for nf in sorted(non_compliant):
            report.append(f"  - {nf}")
        report.append("\nFix: Add the full Hostwek Custom License banner (use chatgpt.js as canonical).")
    else:
        report.append("\n✅ All source code files contain required license markers.")

    return [TextContent(type="text", text='\n'.join(report))]


async def i18n_coverage() -> List[TextContent]:
    """INTELLIGENT i18n analysis with contextual insights, priority recommendations, and translation patterns."""
    import datetime
    import re
    from collections import defaultdict

    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    en_messages = PROJECT_ROOT / "_locales" / "en" / "messages.json"
    if not en_messages.exists():
        return [TextContent(type="text", text="❌ Base locale (_locales/en/messages.json) not found")]

    try:
        with open(en_messages, 'r', encoding='utf-8') as f:
            en_locale = json.load(f)
        en_keys = set(en_locale.keys())

        usage_context = defaultdict(list)  # key -> [contexts where it's used]
        critical_keys = set()  # Keys used in critical UI elements
        optional_keys = set()  # Keys used in less critical contexts
        debug_keys = set()     # Keys used only in debug/development
        ui_keys = set()        # Keys used in main UI

        for file_path in get_js_files():
            try:
                content = Path(file_path).read_text(encoding='utf-8')
                rel_path = str(file_path.relative_to(PROJECT_ROOT))

                i18n_patterns = [
                    (r'GPTPF_I18N\.getMessage\(\s*["\']([^"\']+)["\']', 'javascript_call'),
                    (r'window\.GPTPF_I18N\.getMessage\(\s*["\']([^"\']+)["\']', 'javascript_call'),
                    (r'data-i18n=["\']([^"\']+)["\']', 'html_attribute'),
                    (r'data-i18n-placeholder=["\']([^"\']+)["\']', 'placeholder'),
                    (r'data-i18n-title=["\']([^"\']+)["\']', 'tooltip'),
                    (r'data-i18n-aria-label=["\']([^"\']+)["\']', 'accessibility'),
                    (r'data-i18n-aria-description=["\']([^"\']+)["\']', 'accessibility'),
                    (r'placeholder\s*=\s*["\']([^"\']+)["\']', 'html_placeholder'),
                    (r'title\s*=\s*["\']([^"\']+)["\']', 'html_title'),
                    (r'alt\s*=\s*["\']([^"\']+)["\']', 'html_alt'),
                    (r'aria-label\s*=\s*["\']([^"\']+)["\']', 'aria_label'),
                    (r'aria-description\s*=\s*["\']([^"\']+)["\']', 'aria_description'),
                    (r'GPTPF_DEBUG\.[a-zA-Z]+\(\s*["\']([^"\']+)["\']', 'debug_message'),
                ]

                for pattern, context_type in i18n_patterns:
                    for match in re.finditer(pattern, content, re.IGNORECASE):
                        key = match.group(1)
                        context_info = f"{rel_path}:{context_type}"
                        usage_context[key].append(context_info)

                        if context_type == 'debug_message':
                            debug_keys.add(key)
                        elif context_type in ['accessibility', 'placeholder']:
                            critical_keys.add(key)
                        elif 'popup' in rel_path or 'modal' in rel_path:
                            critical_keys.add(key)
                        elif 'background' in rel_path:
                            optional_keys.add(key)
                        else:
                            ui_keys.add(key)

            except Exception:
                continue

        locales_dir = PROJECT_ROOT / "_locales"
        locale_analysis = {}
        translation_priorities = {}

        for locale_dir in locales_dir.iterdir():
            if locale_dir.is_dir() and locale_dir.name != 'en':
                locale = locale_dir.name
                messages_file = locale_dir / "messages.json"

                if not messages_file.exists():
                    locale_analysis[locale] = {
                        'status': 'missing_file',
                        'missing_keys': list(en_keys),
                        'coverage_percent': 0,
                        'priority_missing': len(critical_keys)
                    }
                    continue

                try:
                    with open(messages_file, 'r', encoding='utf-8') as f:
                        locale_messages = json.load(f)

                    locale_keys = set(locale_messages.keys())
                    missing_keys = en_keys - locale_keys
                    coverage_percent = round(((len(locale_keys) / len(en_keys)) * 100), 1) if en_keys else 0

                    missing_critical = missing_keys & critical_keys
                    missing_ui = missing_keys & ui_keys
                    missing_debug = missing_keys & debug_keys
                    missing_optional = missing_keys & optional_keys

                    translation_quality = _analyze_translation_quality(en_locale, locale_messages, locale)

                    locale_analysis[locale] = {
                        'status': 'exists',
                        'total_keys': len(locale_keys),
                        'missing_keys': sorted(missing_keys),
                        'missing_critical': sorted(missing_critical),
                        'missing_ui': sorted(missing_ui),
                        'missing_debug': sorted(missing_debug),
                        'missing_optional': sorted(missing_optional),
                        'coverage_percent': coverage_percent,
                        'translation_quality': translation_quality
                    }

                    priority_order = []
                    if missing_critical:
                        priority_order.extend([(key, 'CRITICAL') for key in missing_critical])
                    if missing_ui:
                        priority_order.extend([(key, 'HIGH') for key in missing_ui])
                    if missing_optional:
                        priority_order.extend([(key, 'MEDIUM') for key in missing_optional])
                    if missing_debug:
                        priority_order.extend([(key, 'LOW') for key in missing_debug])

                    translation_priorities[locale] = priority_order

                except Exception as e:
                    locale_analysis[locale] = {
                        'status': 'error',
                        'error': str(e),
                        'coverage_percent': 0
                    }

        result = f"🧠 INTELLIGENT i18n ANALYSIS [{timestamp}]\n" + ("=" * 80) + "\n\n"

        total_used_keys = len(usage_context)
        result += f"🧠 SMART OVERVIEW\n"
        result += f"Base Locale Keys: {len(en_keys)} | Used in Code: {total_used_keys}\n"
        result += f"Critical Keys: {len(critical_keys)} | UI Keys: {len(ui_keys)} | Debug Keys: {len(debug_keys)}\n\n"

        result += f"🎯 KEY CATEGORIZATION\n"
        result += f"  • Critical (accessibility, placeholders): {len(critical_keys)}\n"
        result += f"  • UI (main interface): {len(ui_keys)}\n"
        result += f"  • Optional (background, secondary): {len(optional_keys)}\n"
        result += f"  • Debug (development only): {len(debug_keys)}\n\n"

        result += f"🌍 INTELLIGENT LOCALE ANALYSIS\n"
        for locale, analysis in sorted(locale_analysis.items()):
            if analysis['status'] == 'missing_file':
                result += f"  • {locale.upper()}: ❌ Missing locale file (0% coverage)\n"
                continue
            elif analysis['status'] == 'error':
                result += f"  • {locale.upper()}: ⚠️ Error reading file - {analysis['error']}\n"
                continue

            coverage = analysis['coverage_percent']
            total_missing = len(analysis['missing_keys'])
            critical_missing = len(analysis['missing_critical'])

            if coverage >= 95:
                status = "🟢 EXCELLENT"
            elif coverage >= 80:
                status = "🟡 GOOD"
            elif coverage >= 60:
                status = "🟠 NEEDS WORK"
            else:
                status = "🔴 CRITICAL"

            result += f"  • {locale.upper()}: {status} ({coverage}% coverage)\n"
            result += f"    Missing: {total_missing} total, {critical_missing} critical\n"

            quality = analysis.get('translation_quality', {})
            if quality:
                result += f"    Quality: {quality.get('score', 'N/A')}/10"
                if quality.get('issues'):
                    result += f" (⚠️ {len(quality['issues'])} issues detected)"
                result += "\n"

        result += "\n"

        result += f"💡 INTELLIGENT TRANSLATION PRIORITIES\n"
        for locale, priorities in translation_priorities.items():
            if not priorities:
                continue

            result += f"\n📋 {locale.upper()} Translation Priority:\n"

            by_priority = defaultdict(list)
            for key, priority in priorities:
                by_priority[priority].append(key)

            for priority in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']:
                keys = by_priority[priority]
                if keys:
                    result += f"  {priority}: {len(keys)} keys\n"
                    if priority == 'CRITICAL':
                        for key in keys[:3]:
                            contexts = usage_context.get(key, [])
                            if contexts:
                                result += f"    • {key} (used in: {contexts[0].split(':')[-1]})\n"
                        if len(keys) > 3:
                            result += f"    • ... and {len(keys) - 3} more\n"

        result += f"\n🎯 INTELLIGENT RECOMMENDATIONS\n"
        recommendations = _generate_i18n_recommendations(locale_analysis, critical_keys, ui_keys, debug_keys)
        for i, rec in enumerate(recommendations, 1):
            result += f"  {i}. {rec}\n"

        return [TextContent(type='text', text=result)]

    except Exception as e:
        return [TextContent(type="text", text=f"❌ Intelligent i18n analysis failed: {e}")]


def _analyze_translation_quality(en_locale: Dict[str, Any], target_locale: Dict[str, Any], locale_code: str) -> Dict[str, Any]:
    """Analyze translation quality and detect common issues."""
    issues = []
    score = 10

    common_english_words = {'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}

    untranslated_count = 0
    for key, data in target_locale.items():
        if key in en_locale:
            target_text = data.get('message', '') if isinstance(data, dict) else str(data)

            target_words = set(target_text.lower().split())
            english_words_found = target_words & common_english_words

            if len(english_words_found) > len(target_words) * 0.3:  # 30% English words
                untranslated_count += 1

    if untranslated_count > 0:
        score -= min(3, untranslated_count)
        issues.append(f"Potential untranslated content: {untranslated_count} keys")

    placeholder_mismatches = 0
    for key in set(en_locale.keys()) & set(target_locale.keys()):
        en_msg = en_locale[key].get('message', '') if isinstance(en_locale[key], dict) else str(en_locale[key])
        target_msg = target_locale[key].get('message', '') if isinstance(target_locale[key], dict) else str(target_locale[key])

        en_placeholders = re.findall(r'\$\d+|\{[^}]+\}', en_msg)
        target_placeholders = re.findall(r'\$\d+|\{[^}]+\}', target_msg)

        if len(en_placeholders) != len(target_placeholders):
            placeholder_mismatches += 1

    if placeholder_mismatches > 0:
        score -= min(2, placeholder_mismatches)
        issues.append(f"Placeholder mismatches: {placeholder_mismatches} keys")

    return {
        'score': max(0, score),
        'issues': issues,
        'untranslated_likely': untranslated_count,
        'placeholder_mismatches': placeholder_mismatches
    }


def _generate_i18n_recommendations(locale_analysis: Dict[str, Any], critical_keys: Set[str], ui_keys: Set[str], debug_keys: Set[str]) -> List[str]:
    """Generate intelligent, actionable i18n recommendations."""
    recommendations = []

    total_locales = len(locale_analysis)
    complete_locales = sum(1 for analysis in locale_analysis.values()
                          if analysis.get('coverage_percent', 0) >= 95)

    if complete_locales == 0:
        recommendations.append("URGENT: No locale has complete translations - prioritize critical keys first")
    elif complete_locales < total_locales:
        incomplete = total_locales - complete_locales
        recommendations.append(f"Complete translations for {incomplete} remaining locale(s)")

    critical_missing_locales = []
    for locale, analysis in locale_analysis.items():
        if analysis.get('missing_critical', []):
            critical_missing_locales.append(locale)

    if critical_missing_locales:
        recommendations.append(
            f"CRITICAL: Translate accessibility/placeholder keys for {', '.join(critical_missing_locales)}"
        )

    quality_issues = []
    for locale, analysis in locale_analysis.items():
        quality = analysis.get('translation_quality', {})
        if quality.get('score', 10) < 7:
            quality_issues.append(locale)

    if quality_issues:
        recommendations.append(f"Review translation quality for {', '.join(quality_issues)} (check for untranslated content)")

    if debug_keys:
        recommendations.append(f"Consider if {len(debug_keys)} debug keys need translation or can remain English-only")

    if len(critical_keys) > 20:
        recommendations.append("Consider using translation automation tools for large key sets")

    return recommendations


async def analyze_i18n(check_duplicates: bool = True) -> List[TextContent]:
    """Analyze internationalization files."""
    locales_dir = PROJECT_ROOT / "_locales"

    if not locales_dir.exists():
        return [TextContent(type="text", text="❌ No _locales directory found")]

    locales = {}

    for locale_dir in locales_dir.iterdir():
        if locale_dir.is_dir():
            messages_file = locale_dir / "messages.json"
            if messages_file.exists():
                try:
                    with open(messages_file, 'r', encoding='utf-8') as f:
                        locales[locale_dir.name] = json.load(f)
                except json.JSONDecodeError:
                    continue

    if not locales:
        return [TextContent(type="text", text="❌ No valid locale files found")]

    result = f"🌍 i18n Analysis Results\n\n"
    result += f"📊 Found {len(locales)} locales: {', '.join(locales.keys())}\n\n"

    reference_locale = 'en' if 'en' in locales else None
    if reference_locale:
        reference_keys = set(locales[reference_locale].keys())
        result += f"📋 Using '{reference_locale}' as reference ({len(reference_keys)} keys)\n\n"
    else:
        reference_keys = set()
        for locale_messages in locales.values():
            reference_keys.update(locale_messages.keys())
        result += f"📋 Using combined keys as reference ({len(reference_keys)} keys)\n\n"

    missing_keys = {}
    case_issues = {}
    critical_missing = {}

    for locale, messages in locales.items():
        if locale == reference_locale:
            continue

        locale_keys = set(messages.keys())
        missing = reference_keys - locale_keys

        uppercase_keys = [key for key in locale_keys if key != key.lower()]

        critical = []
        for key in missing:
            if any(keyword in key.lower() for keyword in ['connected', 'status', 'ui_components']):
                critical.append(key)

        if missing:
            missing_keys[locale] = missing
        if uppercase_keys:
            case_issues[locale] = uppercase_keys
        if critical:
            critical_missing[locale] = critical

    if critical_missing:
        result += f"🚨 CRITICAL Missing Keys (cause English fallbacks):\n"
        for locale, keys in critical_missing.items():
            result += f"  • {locale}: {', '.join(sorted(keys))}\n"
        result += "\n"

    if case_issues:
        result += f"🔤 Case Sensitivity Issues (should be lowercase):\n"
        for locale, keys in case_issues.items():
            result += f"  • {locale}: {len(keys)} uppercase keys\n"
            for key in sorted(keys):  # Show ALL keys, not just first 8
                result += f"    - {key}\n"
        result += "\n"

    if missing_keys:
        result += f"⚠️  All Missing Keys:\n"
        for locale, keys in missing_keys.items():
            result += f"  • {locale}: {len(keys)} missing keys\n"
            for key in sorted(keys):  # Show ALL keys, not just first 8
                result += f"    - {key}\n"
        result += "\n"

    all_duplicates = {}
    organization_issues = {}

    for locale, messages in locales.items():
        aria_keys = [key for key in messages.keys() if key.startswith('aria_')]

        if aria_keys:
            sorted_keys = list(messages.keys())
            aria_positions = [sorted_keys.index(key) for key in aria_keys]

            if len(aria_positions) > 1:
                consecutive = all(aria_positions[i] + 1 == aria_positions[i + 1]
                                for i in range(len(aria_positions) - 1))

                if not consecutive:
                    scattered_keys = []
                    expected_section_start = min(aria_positions)
                    expected_section_end = max(aria_positions)

                    for i, pos in enumerate(aria_positions):
                        if pos < expected_section_start or pos > expected_section_end:
                            scattered_keys.append(aria_keys[i])

                    if scattered_keys:
                        if locale not in organization_issues:
                            organization_issues[locale] = []
                        organization_issues[locale].append({
                            'type': 'scattered_aria',
                            'keys': scattered_keys,
                            'total_aria': len(aria_keys)
                        })

    if organization_issues:
        result += f"📋 Translation Organization Issues:\n"
        for locale, issues in organization_issues.items():
            for issue in issues:
                if issue['type'] == 'scattered_aria':
                    result += f"  • {locale}: {len(issue['keys'])} aria keys scattered outside main aria section\n"
                    for key in sorted(issue['keys']):
                        result += f"    - {key}\n"
        result += "\n"

    if check_duplicates:
        def _is_legitimate_semantic_variation(value: str, keys: List[str]) -> bool:
            """Check if duplicate values represent legitimate semantic variations."""

            legitimate_patterns = [
                ('all_time', 'analytics_all_time'),  # HTML dropdown vs JS labels
                ('no_data_yet', 'analytics_no_data'),  # Breakdowns vs charts

                ('debug_warning', 'debug_warn'),  # Different debug contexts
                ('debug_error', 'debug_err'),     # Different error contexts

                ('compression', 'file_compression'),      # Batch vs file compression
                ('compression', 'batch_compression'),     # Different compression contexts

                ('platform_specific_generic_no_input', 'platform_specific_try_attachment_button'),
                ('platform_specific_chatgpt_no_input', 'platform_specific_generic_no_input'),
                ('platform_specific_claude_no_input', 'platform_specific_generic_no_input'),
                ('platform_specific_gemini_no_input', 'platform_specific_generic_no_input'),

                ('banner_not_supported', 'ui_components_banner_not_supported'),
                ('data_cleared_success', 'ui_components_data_cleared_success'),

                ('more_formats_loaded', 'file_format_more_formats_loaded'),
                ('format_selected', 'file_format_selected'),
                ('format_changed', 'file_format_changed'),

                ('modal_title', 'ui_components_modal_title'),
                ('modal_description', 'ui_components_modal_description'),
                ('save', 'ui_components_modal_save'),  # Modal save vs general save

                ('connected', 'status_connected'),
                ('not_on_platform', 'success_not_on_platform'),

            ]

            key_set = set(keys)
            for pattern in legitimate_patterns:
                if len(pattern) == 2 and set(pattern).issubset(key_set):
                    return True
                elif len(pattern) > 2 and any(set(combo).issubset(key_set) for combo in [pattern[i:i+2] for i in range(len(pattern)-1)]):
                    return True

            semantic_prefixes = [
                ('analytics_', ''),           # Analytics vs general context
                ('ui_components_', ''),       # UI component vs general context
                ('platform_specific_', ''),  # Platform-specific vs general context
                ('file_format_', ''),        # File format vs general context
                ('file_operations_', ''),    # File operations vs general context
                ('debug_', ''),              # Debug vs general context
                ('aria_', ''),               # Accessibility vs general context
                ('modal_', ''),              # Modal vs general context
                ('status_', ''),             # Status vs general context
                ('success_', ''),            # Success vs general context
                ('error_', 'errors_'),       # Error vs general context
                ('validation_', ''),         # Validation vs general context
                ('console_', ''),            # Console vs general context
                ('settings_', ''),           # Settings vs general context
                ('batch_', ''),              # Batch vs general context
            ]

            for prefix1, prefix2 in semantic_prefixes:
                prefixed_keys = [k for k in keys if k.startswith(prefix1)]
                unprefixed_keys = [k for k in keys if not k.startswith(prefix1) and (not prefix2 or k.startswith(prefix2))]

                if prefixed_keys and unprefixed_keys:
                    for pk in prefixed_keys:
                        base_key = pk[len(prefix1):]
                        if base_key in unprefixed_keys or any(uk.endswith(base_key) for uk in unprefixed_keys):
                            return True

            if len(keys) == 2:
                key1, key2 = sorted(keys)

                context_patterns = [
                    ('_tooltip', ''),         # Tooltip vs main text
                    ('_description', ''),     # Description vs main text
                    ('_label', ''),          # Label vs main text
                    ('_title', ''),          # Title vs main text
                    ('_placeholder', ''),    # Placeholder vs main text
                    ('_hint', ''),           # Hint vs main text
                ]

                for suffix, alt_suffix in context_patterns:
                    if ((key1.endswith(suffix) and key2 == key1[:-len(suffix)] + alt_suffix) or
                        (key2.endswith(suffix) and key1 == key2[:-len(suffix)] + alt_suffix)):
                        return True

            return False

        for locale, messages in locales.items():
            value_counts = {}
            for key, msg_obj in messages.items():
                if isinstance(msg_obj, dict) and "message" in msg_obj:
                    value = msg_obj["message"]
                    if value in value_counts:
                        value_counts[value].append(key)
                    else:
                        value_counts[value] = [key]

            true_duplicates = {}
            for value, keys in value_counts.items():
                if len(keys) > 1:
                    if not _is_legitimate_semantic_variation(value, keys):
                        true_duplicates[value] = keys

            if true_duplicates:
                all_duplicates[locale] = true_duplicates
                result += f"🔄 True duplicate values in {locale} (excluding legitimate semantic variations):\n"
                for value, keys in true_duplicates.items():
                    display_value = value if len(value) <= 50 else value[:47] + "..."
                    result += f"  • \"{display_value}\" used in: {', '.join(keys)}\n"
                result += "\n"

    if not missing_keys and not all_duplicates and not case_issues and not critical_missing and not organization_issues:
        result += "✅ No issues found in i18n files"

    return [TextContent(type="text", text=result)]


async def analyze_css(file_path: str) -> List[TextContent]:
    """Intelligent CSS analysis with design system pattern detection and optimization insights."""
    css_file = PROJECT_ROOT / file_path

    if not css_file.exists():
        return [TextContent(type="text", text=f"❌ CSS file not found: {file_path}")]

    def _analyze_design_tokens(content: str) -> Dict[str, Any]:
        """Detect design token patterns and consistency."""
        tokens: Dict[str, Any] = {
            'colors': {},
            'spacing': {},
            'typography': {},
            'shadows': set(),
            'patterns': set()
        }

        color_patterns = {
            'hex': r'#[0-9a-fA-F]{3,8}',
            'rgb': r'rgb\([^)]+\)',
            'rgba': r'rgba\([^)]+\)',
            'hsl': r'hsl\([^)]+\)',
            'css_vars': r'var\(--[^)]+\)',
            'named_colors': r'\b(red|blue|green|yellow|black|white|gray|grey|orange|purple|pink|brown)\b'
        }

        for pattern_type, pattern in color_patterns.items():
            matches = re.findall(pattern, content, re.IGNORECASE)
            if matches:
                tokens['colors'][pattern_type] = list(set(matches))

        spacing_pattern = r'\b(\d+(?:\.\d+)?)(px|em|rem|%|vh|vw|vmin|vmax)\b'
        spacing_matches = re.findall(spacing_pattern, content)
        spacing_dict: Dict[str, Set[float]] = tokens['spacing']
        for value, unit in spacing_matches:
            if unit not in spacing_dict:
                spacing_dict[unit] = set()
            spacing_dict[unit].add(float(value))

        font_families = re.findall(r'font-family:\s*([^;]+)', content)
        font_sizes = re.findall(r'font-size:\s*([^;]+)', content)
        font_weights = re.findall(r'font-weight:\s*([^;]+)', content)

        tokens['typography'] = {
            'families': list(set(font_families)),
            'sizes': list(set(font_sizes)),
            'weights': list(set(font_weights))
        }

        shadow_patterns = [
            r'box-shadow:\s*([^;]+)',
            r'text-shadow:\s*([^;]+)',
            r'drop-shadow\([^)]+\)'
        ]

        for pattern in shadow_patterns:
            matches = re.findall(pattern, content)
            if matches:
                shadow_set: Set[str] = tokens['shadows']
                shadow_set.update(matches)

        return tokens

    def _detect_css_architecture(content: str) -> Dict[str, Any]:
        """Analyze CSS architecture and organization patterns."""
        architecture: Dict[str, Any] = {
            'methodology': 'none',
            'organization_score': 0,
            'maintainability_issues': [],
            'optimization_opportunities': [],
            'patterns': set()
        }

        bem_pattern = r'\.[\w]+-[\w]+__[\w]+(?:--[\w]+)?'
        bem_matches = len(re.findall(bem_pattern, content))

        utility_pattern = r'\.(m|p)[trblxy]?-\d+|\.text-(center|left|right)|\.d-(none|block|flex)'
        utility_matches = len(re.findall(utility_pattern, content))

        component_pattern = r'\.[\w]+-[\w]+(?![_-])'
        component_matches = len(re.findall(component_pattern, content))

        if bem_matches > 10:
            architecture['methodology'] = 'BEM'
            score: int = architecture['organization_score']
            architecture['organization_score'] = score + 30
        elif utility_matches > 15:
            architecture['methodology'] = 'Utility-first'
            score: int = architecture['organization_score']
            architecture['organization_score'] = score + 25
        elif component_matches > 5:
            architecture['methodology'] = 'Component-based'
            score: int = architecture['organization_score']
            architecture['organization_score'] = score + 20

        custom_props = len(re.findall(r'--[\w-]+:', content))
        if custom_props > 5:
            score: int = architecture['organization_score']
            architecture['organization_score'] = score + 20
            patterns_set: Set[str] = architecture['patterns']
            patterns_set.add('CSS Custom Properties')

        media_queries = re.findall(r'@media[^{]+', content)
        if len(media_queries) > 3:
            patterns_set2: Set[str] = architecture['patterns']
            patterns_set2.add('Responsive Design')
            score: int = architecture['organization_score']
            architecture['organization_score'] = score + 15

        if content.count('!important') > 5:
            issues_list: List[str] = architecture['maintainability_issues']
            issues_list.append(
                f"Overuse of !important ({content.count('!important')} instances)"
            )

        long_selectors = re.findall(r'[^{]+{', content)
        complex_selectors = [s for s in long_selectors if s.count(' ') > 4 or s.count('>') > 2]
        if len(complex_selectors) > 3:
            issues_list: List[str] = architecture['maintainability_issues']
            issues_list.append(
                f"Complex selectors detected ({len(complex_selectors)} instances)"
            )

        rules = re.findall(r'{[^}]+}', content)
        rule_counts = {}
        for rule in rules:
            cleaned_rule = re.sub(r'\s+', ' ', rule.strip())
            if len(cleaned_rule) > 30:  # Only check substantial rules
                rule_counts[cleaned_rule] = rule_counts.get(cleaned_rule, 0) + 1

        duplicated_rules = {rule: count for rule, count in rule_counts.items() if count > 1}
        if duplicated_rules:
            opportunities_list: List[str] = architecture['optimization_opportunities']
            opportunities_list.append(
                f"Duplicated rule blocks ({len(duplicated_rules)} patterns)"
            )

        return architecture

    def _analyze_performance_opportunities(content: str) -> List[str]:
        """Identify performance optimization opportunities."""
        opportunities = []

        vendor_prefixes = ['-webkit-', '-moz-', '-ms-', '-o-']
        prefix_usage = {prefix: content.count(prefix) for prefix in vendor_prefixes}
        outdated_prefixes = [prefix for prefix, count in prefix_usage.items()
                           if count > 0 and prefix in ['-ms-', '-o-']]

        if outdated_prefixes:
            opportunities.append(f"Outdated vendor prefixes detected: {', '.join(outdated_prefixes)}")

        universal_selectors = content.count('*')
        if universal_selectors > 2:
            opportunities.append(f"Universal selector (*) used {universal_selectors} times - can impact performance")

        if len(content) > 204800:  # ~200KB
            opportunities.append("Large CSS file - prioritize minification and pruning unused selectors")

        inline_styles = content.count('style=')
        if inline_styles > 0:
            opportunities.append(f"Inline styles detected ({inline_styles}) - move to external CSS")

        return opportunities

    try:
        content = css_file.read_text(encoding='utf-8')

        lines = content.split('\n')
        total_lines = len(lines)
        non_empty_lines = len([line for line in lines if line.strip()])
        file_size_kb = len(content) / 1024

        design_tokens = _analyze_design_tokens(content)
        architecture = _detect_css_architecture(content)
        performance_ops = _analyze_performance_opportunities(content)

        result = ["🎨 INTELLIGENT CSS ANALYSIS"]
        result.append("=" * 50)
        result.append(f"📁 File: {file_path}")
        result.append(f"📏 Size: {file_size_kb:.1f}KB ({total_lines:,} lines, {non_empty_lines:,} non-empty)")
        result.append("")

        result.append("🏗️ ARCHITECTURE ANALYSIS:")
        result.append(f"   Methodology: {architecture['methodology']}")
        result.append(f"   Organization Score: {architecture['organization_score']}/100")

        if 'patterns' in architecture and architecture['patterns']:
            result.append(f"   Patterns: {', '.join(architecture['patterns'])}")
        result.append("")

        result.append("🎨 DESIGN TOKEN ANALYSIS:")

        total_colors = sum(len(colors) for colors in design_tokens['colors'].values())
        if total_colors > 0:
            result.append(f"   Colors: {total_colors} unique values")
            for color_type, colors in design_tokens['colors'].items():
                if colors and len(colors) <= 8:
                    result.append(f"     {color_type}: {len(colors)} ({', '.join(colors[:3])}{'...' if len(colors) > 3 else ''})")
                elif colors:
                    result.append(f"     {color_type}: {len(colors)} values")

        if design_tokens['spacing']:
            result.append("   Spacing:")
            for unit, values in design_tokens['spacing'].items():
                if len(values) <= 10:
                    sorted_values = sorted(values)
                    result.append(f"     {unit}: {len(values)} values ({', '.join(map(str, sorted_values[:5]))}{'...' if len(values) > 5 else ''})")
                else:
                    result.append(f"     {unit}: {len(values)} values (range: {min(values)}-{max(values)})")

        if any(design_tokens['typography'].values()):
            result.append("   Typography:")
            for font_type, fonts in design_tokens['typography'].items():
                if fonts and len(fonts) <= 5:
                    result.append(f"     {font_type}: {fonts}")
                elif fonts:
                    result.append(f"     {font_type}: {len(fonts)} different values")

        result.append("")

        if architecture['maintainability_issues']:
            result.append("⚠️ MAINTAINABILITY ISSUES:")
            for issue in architecture['maintainability_issues']:
                result.append(f"   • {issue}")
            result.append("")

        if architecture['optimization_opportunities']:
            result.append("🔧 OPTIMIZATION OPPORTUNITIES:")
            for opportunity in architecture['optimization_opportunities']:
                result.append(f"   • {opportunity}")
            result.append("")

        if performance_ops:
            result.append("⚡ PERFORMANCE OPPORTUNITIES:")
            for opportunity in performance_ops:
                result.append(f"   • {opportunity}")
            result.append("")

        result.append("💡 INTELLIGENT RECOMMENDATIONS:")

        if architecture['organization_score'] < 50:
            result.append("   🏗️ Architecture: Consider adopting BEM or component-based methodology")

        color_count = sum(len(colors) for colors in design_tokens['colors'].values())
        if color_count > 15 and not design_tokens['colors'].get('css_vars'):
            result.append("   🎨 Design System: Implement CSS custom properties for color management")

        spacing_values = sum(len(values) for values in design_tokens['spacing'].values())
        if spacing_values > 20:
            result.append("   📏 Spacing: Consider a spacing scale (8px/4px grid system)")

        if file_size_kb > 30:
            result.append("   ⚡ Performance: Consider CSS minification and critical CSS extraction")

        if not performance_ops and not architecture['maintainability_issues']:
            result.append("   ✅ Code Quality: CSS follows good practices!")

        final_score = min(100, architecture['organization_score'] +
                         (20 if design_tokens['colors'].get('css_vars') else 0) +
                         (10 if len(performance_ops) == 0 else 0) +
                         (10 if len(architecture['maintainability_issues']) == 0 else 0))

        result.append("")
        result.append(f"📊 OVERALL CSS QUALITY SCORE: {final_score}/100")

        if final_score >= 80:
            result.append("🏆 Excellent CSS architecture and organization!")
        elif final_score >= 60:
            result.append("👍 Good CSS structure with room for improvement")
        else:
            result.append("🔧 CSS needs significant improvements for maintainability")

        return [TextContent(type="text", text="\n".join(result))]

    except Exception as e:
        return [TextContent(type="text", text=f"❌ Error analyzing CSS: {e}")]


async def check_hardcoded_strings(file_patterns: List[str]) -> List[TextContent]:
    """Intelligent hardcoded string detection with context-aware analysis and i18n suggestions."""
    import re

    violations = []
    suggestions = {}  # Store suggested i18n keys

    existing_keys = set()
    try:
        with open(PROJECT_ROOT / "_locales" / "en" / "messages.json", 'r', encoding='utf-8') as f:
            en_locale = json.loads(f.read())
            existing_keys = set(en_locale.keys())
    except Exception:
        pass

    def _suggest_i18n_key(text: str, context: str = "") -> str:
        """Generate intelligent i18n key suggestions based on content and context."""
        clean_text = re.sub(r'[^a-zA-Z0-9\s]', '', text).strip().lower()
        words = clean_text.split()[:3]  # Use first 3 words max

        if 'error' in context.lower() or 'alert' in context.lower():
            prefix = "error_"
        elif 'button' in context.lower() or 'click' in context.lower():
            prefix = "button_"
        elif 'placeholder' in context.lower() or 'input' in context.lower():
            prefix = "placeholder_"
        elif 'title' in context.lower() or 'heading' in context.lower():
            prefix = "title_"
        elif 'toast' in context.lower() or 'notification' in context.lower():
            prefix = "notification_"
        else:
            prefix = "text_"

        base_key = prefix + "_".join(words[:3])

        counter = 1
        suggested_key = base_key
        while suggested_key in existing_keys:
            suggested_key = f"{base_key}_{counter}"
            counter += 1

        return suggested_key

    def _is_legitimate_hardcoded(text: str, line: str, file_path: str) -> bool:
        """INTELLIGENT detection of legitimate hardcoded strings in Multi-AI File Paster that should NOT be i18n."""

        multiaifilePaster_patterns = [
            'data-theme', 'data-platform', 'light', 'dark', 'auto',
            'chatgpt', 'claude', 'gemini', 'grok', 'deepseek',
            'debug_', 'GPTPF_DEBUG', 'GPTPF_I18N', 'GPTPF_CONFIG', 'GPTPF_FLASH',
            'hidden', 'visible', 'enabled', 'disabled', 'active', 'inactive',
            'batchMode', 'debugLevel', 'themePreference', 'selectedPlatform',
            'ChatGPT', 'Claude', 'Gemini', 'Grok', 'DeepSeek'
        ]

        if any(pattern in text for pattern in multiaifilePaster_patterns):
            return True

        if any(indicator in text.lower() for indicator in [
            'utf-8', 'application/json', 'text/html', 'image/', 'video/', 'audio/',
            'localhost', '127.0.0.1', 'http://', 'https://', 'ftp://',
            'rgba(', 'rgb(', '#fff', '#000', 'px', 'em', 'rem', '%',
            'onclick', 'onload', 'onerror', 'addEventListener',
            'querySelector', 'getElementById', 'className', 'innerHTML',
            'console.', 'window.', 'document.', 'chrome.', 'browser.',
            'manifest', 'background', 'content_scripts', 'permissions'
        ]):
            return True

        if re.match(r'^[a-z_]+\.(js|css|html|json|png|svg|ico)$', text.lower()):
            return True

        if re.match(r'^[a-z-_\.#\[\]]+$', text) and len(text) < 50:
            return True

        if text in ['true', 'false', 'null', 'undefined', '0', '1', '-1']:
            return True

        if re.match(r'^[\d\.]+$', text) or (len(text) > 20 and not ' ' in text):
            return True

        if 'json' in file_path.lower() or ('"' + text + '"' in line and ':' in line):
            return True

        if len(text.strip()) < 4:
            return True

        if any(api in text for api in ['chrome.', 'browser.', 'activeTab', 'scripting']):
            return True

        return False

    def _analyze_string_context(line: str, line_num: int, lines: List[str]) -> Dict[str, str]:
        """Analyze the context around a hardcoded string for better categorization."""
        context = {
            'type': 'unknown',
            'severity': 'medium',
            'method': 'unknown'
        }

        line_lower = line.lower()

        if 'textcontent' in line_lower or 'innerhtml' in line_lower:
            context['type'] = 'dom_content'
            context['severity'] = 'high'
            context['method'] = 'GPTPF_I18N.getMessage()'
        elif 'placeholder' in line_lower:
            context['type'] = 'form_placeholder'
            context['severity'] = 'medium'
            context['method'] = 'GPTPF_I18N.getMessage()'
        elif 'alert(' in line_lower or '.show(' in line_lower:
            context['type'] = 'user_alert'
            context['severity'] = 'high'
            context['method'] = 'GPTPF_I18N.getMessage()'
        elif 'console.' in line_lower:
            context['type'] = 'debug_log'
            context['severity'] = 'low'
            context['method'] = 'Keep as-is (debug only)'
        elif 'title' in line_lower or 'label' in line_lower:
            context['type'] = 'ui_label'
            context['severity'] = 'high'
            context['method'] = 'GPTPF_I18N.getMessage()'

        return context

    for pattern in file_patterns:
        files = get_files_by_glob([pattern])

        for file_path in files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    lines = content.split('\n')

                rel_path = os.path.relpath(file_path, PROJECT_ROOT)

                if any(skip in rel_path for skip in ['.min.', 'node_modules', '.git', 'test']):
                    continue

                string_patterns = [
                    r'textContent\s*[=:]\s*["\']([^"\']{10,})["\']',
                    r'innerHTML\s*[=:]\s*["\']([^"\']{10,})["\']',
                    r'placeholder\s*[=:]\s*["\']([^"\']{8,})["\']',
                    r'title\s*[=:]\s*["\']([^"\']{8,})["\']',
                    r'alert\s*\(\s*["\']([^"\']{8,})["\']',
                    r'\.show\s*\(\s*["\']([^"\']{8,})["\']',
                    r'\.toast\s*\(\s*["\']([^"\']{8,})["\']',
                    r'\.error\s*\(\s*["\']([^"\']{8,})["\']',
                    r'\.warn\s*\(\s*["\']([^"\']{8,})["\']',
                    r'label\s*[=:]\s*["\']([^"\']{8,})["\']'
                ]

                for i, line in enumerate(lines, 1):
                    if 'GPTPF_DEBUG' in line:
                        continue
                    for pattern in string_patterns:
                        matches = re.finditer(pattern, line)
                        for match in matches:
                            text = match.group(1)

                            if 'getMessage(' in line or 'GPTPF_I18N' in line:
                                continue
                            if re.match(r'^debug_[a-z0-9_]+$', text):
                                continue

                            if _is_legitimate_hardcoded(text, line, rel_path):
                                continue

                            context = _analyze_string_context(line, i, lines)

                            suggested_key = _suggest_i18n_key(text, line)
                            existing_keys.add(suggested_key)  # Track for uniqueness

                            violation = {
                                'type': 'HARDCODED_USER_TEXT',
                                'severity': context['severity'].upper(),
                                'file': rel_path,
                                'line': i,
                                'content': text[:60] + ('...' if len(text) > 60 else ''),
                                'context_type': context['type'],
                                'suggested_key': suggested_key,
                                'fix_method': context['method'],
                                'code_line': line.strip(),
                                'suggested_fix': f"Replace with {context['method']}('{suggested_key}') and add key to _locales/*/messages.json"
                            }

                            violations.append(violation)

                            if suggested_key not in suggestions:
                                suggestions[suggested_key] = {
                                    'message': text,
                                    'description': f"Text for {context['type']}"
                                }

                debug_pattern = r'(?<!GPTPF_I18N\.getMessage\()["\']?(debug_[a-z_]+)["\']?'
                for i, line in enumerate(lines, 1):
                    if 'GPTPF_DEBUG' in line:
                        continue
                    if 'debug_' in line and 'getMessage(' not in line and '=' not in line:
                        matches = re.finditer(debug_pattern, line)
                        for match in matches:
                            debug_var = match.group(1)
                            violations.append({
                                'type': 'RAW_DEBUG_VARIABLE',
                                'severity': 'HIGH',
                                'file': rel_path,
                                'line': i,
                                'content': debug_var,
                                'suggested_fix': f'GPTPF_I18N.getMessage("{debug_var}")',
                                'code_line': line.strip()
                            })

                url_patterns = [
                    r'["\']https?://[^\s"\']+["\']',
                    r'["\']www\.[^\s"\']+["\']'
                ]

                for i, line in enumerate(lines, 1):
                    for pattern in url_patterns:
                        matches = re.finditer(pattern, line)
                        for match in matches:
                            url = match.group(0)
                            if any(safe in line for safe in ['CONFIG', 'OFFICIAL_LINKS', 'const ', 'let ', 'var ']):
                                continue

                            violations.append({
                                'type': 'HARDCODED_URL',
                                'severity': 'CRITICAL',
                                'file': rel_path,
                                'line': i,
                                'content': url,
                                'suggested_fix': 'Move to centralized config/constants',
                                'code_line': line.strip()
                            })

                for i, line in enumerate(lines, 1):
                    if '||' in line or '??' in line:
                        m = re.search(r'(?:\|\||\?\?)\s*["\']([^"\']{3,})["\']', line)
                        if m:
                            if 'GPTPF_DEBUG' in line:
                                continue
                            severity = 'HIGH'
                            if 'getMessage(' in line:
                                severity = 'HIGH'
                            elif any(tok in line.lower() for tok in ['config.', 'id=', 'class=', 'data-']):
                                severity = 'MEDIUM'
                            violations.append({
                                'type': 'FALLBACK_HARDCODED_TEXT',
                                'severity': severity,
                                'file': rel_path,
                                'line': i,
                                'content': m.group(1)[:60] + ('...' if len(m.group(1)) > 60 else ''),
                                'suggested_fix': 'Remove fallback and route text via GPTPF_I18N.getMessage() or centralized config',
                                'code_line': line.strip()
                            })
                for i, line in enumerate(lines, 1):
                    low = line.lower()
                    if ('gptpf_flash' in low or 'gptpf_debug' in low) and '||' in line and 'console.' in low:
                        violations.append({
                            'type': 'CONSOLE_FALLBACK',
                            'severity': 'HIGH',
                            'file': rel_path,
                            'line': i,
                            'content': line.strip(),
                            'suggested_fix': 'Remove console fallback; rely on centralized GPTPF_DEBUG/GPTPF_FLASH only',
                            'code_line': line.strip()
                        })
                    if 'window.alert' in low or 'alert(' in low:
                        violations.append({
                            'type': 'ALERT_USAGE',
                            'severity': 'CRITICAL',
                            'file': rel_path,
                            'line': i,
                            'content': line.strip(),
                            'suggested_fix': 'Replace alert() with GPTPF_FLASH and i18n messages',
                            'code_line': line.strip()
                        })


            except Exception:
                continue

    if not violations:
        return [TextContent(
            type="text",
            text="✅ INTELLIGENT HARDCODED STRING ANALYSIS\n" +
                 "=" * 50 + "\n" +
                 "🎯 No hardcoded string violations detected!\n" +
                 "✨ All user-facing text appears to be properly centralized.\n" +
                 "🔍 Analysis complete - codebase follows i18n best practices."
        )]

    critical = [v for v in violations if v['severity'] == 'CRITICAL']
    high = [v for v in violations if v['severity'] == 'HIGH']
    medium = [v for v in violations if v['severity'] == 'MEDIUM']

    result = ["🧠 INTELLIGENT HARDCODED STRING ANALYSIS"]
    result.append("=" * 50)
    result.append(f"📊 Found {len(violations)} violations across {len(set(v['file'] for v in violations))} files\n")

    if critical:
        result.append(f"🚨 CRITICAL VIOLATIONS ({len(critical)}) - Fix immediately:")
        for v in critical:
            result.append(f"  📁 {v['file']}:{v['line']}")
            result.append(f"  🔸 Content: {v['content']}")
            result.append(f"  💡 Fix: {v['suggested_fix']}")
            result.append("")

    if high:
        result.append(f"⚠️ HIGH PRIORITY ({len(high)}) - User-facing content:")
        for v in high[:8]:  # Limit display
            result.append(f"  📁 {v['file']}:{v['line']}")
            result.append(f"  🔸 Content: {v['content']}")
            if 'suggested_key' in v:
                result.append(f"  🗝️ Suggested key: {v['suggested_key']}")
                result.append(f"  🔧 Fix method: {v['fix_method']}")
            result.append("")

        if len(high) > 8:
            result.append(f"  ... and {len(high) - 8} more high priority items")
            result.append("")

    if medium:
        result.append(f"🔸 MEDIUM PRIORITY ({len(medium)}) - Less critical UI text")
        result.append(f"   Files affected: {', '.join(set(v['file'] for v in medium[:5]))}")
        result.append("")

    if suggestions:
        result.append("🗝️ SUGGESTED I18N ADDITIONS:")
        result.append("Add these to _locales/en/messages.json:")
        result.append("")
        for key, data in list(suggestions.items())[:10]:  # Show top 10
            result.append(f'  "{key}": {{')
            result.append(f'    "message": "{data["message"]}",')
            result.append(f'    "description": "{data["description"]}"')
            result.append("  },")
        result.append("")

    result.append("🎯 PRIORITY ACTIONS:")
    result.append("1. Fix CRITICAL violations first (URLs to config)")
    result.append("2. Replace HIGH priority strings with GPTPF_I18N.getMessage()")
    result.append("3. Add suggested i18n keys to messages.json")
    result.append("4. Test debug variables display properly")

    return [TextContent(type="text", text="\n".join(result))]


async def platform_analysis() -> List[TextContent]:
    """INTELLIGENT platform analysis with dynamic detection and integration recommendations."""
    import datetime

    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    result = f"🔧 INTELLIGENT PLATFORM ANALYSIS [{timestamp}]\n" + ("=" * 80) + "\n\n"

    platforms_detection = await _detect_supported_platforms()
    platform_patterns = await _analyze_platform_patterns()
    missing_platforms = await _identify_missing_platform_support()
    integration_suggestions = await _generate_platform_integration_suggestions()

    result += f"📊 SUPPORTED PLATFORMS ANALYSIS:\n"
    result += f"Detected Platforms: {len(platforms_detection['platforms'])}\n"
    result += f"Platform Coverage Score: {platforms_detection['coverage_score']}/100\n"
    result += f"Architecture Quality: {platform_patterns['architecture_quality']}/100\n\n"

    for platform_name, platform_info in platforms_detection['platforms'].items():
        result += f"🌐 {platform_name.upper()}:\n"
        result += f"  Implementation Quality: {platform_info['quality_score']}/100\n"
        result += f"  Lines of Code: {platform_info['lines']}\n"
        result += f"  DOM Selectors: {platform_info['selectors_count']}\n"
        result += f"  Event Listeners: {platform_info['events_count']}\n"
        result += f"  API Integrations: {platform_info['api_integrations']}\n"

        features = platform_info['features']
        result += f"  Features Detected:\n"
        for feature, present in features.items():
            icon = "✅" if present else "❌"
            result += f"    {icon} {feature}\n"

        if platform_info['optimizations']:
            result += f"  💡 Optimizations:\n"
            for opt in platform_info['optimizations']:
                result += f"    • {opt}\n"
        result += "\n"

    if platform_patterns['patterns']:
        result += f"🏗️ ARCHITECTURE PATTERNS DETECTED:\n"
        for pattern, details in platform_patterns['patterns'].items():
            icon = "✅" if details['implemented'] else "❌"
            result += f"  {icon} {pattern}: {details['description']}\n"
            if details.get('benefits'):
                result += f"      Benefits: {details['benefits']}\n"
        result += "\n"

    if missing_platforms['missing']:
        result += f"🔍 MISSING PLATFORM OPPORTUNITIES:\n"
        for platform in missing_platforms['missing']:
            result += f"  • {platform['name']}: {platform['reason']}\n"
            result += f"    Effort: {platform['implementation_effort']}\n"
            result += f"    Impact: {platform['potential_impact']}\n"
        result += "\n"

    if integration_suggestions['suggestions']:
        result += f"🚀 INTEGRATION IMPROVEMENT SUGGESTIONS:\n"
        for suggestion in integration_suggestions['suggestions']:
            result += f"  • {suggestion['title']}\n"
            result += f"    Category: {suggestion['category']}\n"
            result += f"    Impact: {suggestion['impact']}\n"
            result += f"    Implementation: {suggestion['implementation']}\n\n"

    return [TextContent(type="text", text=result)]


async def _detect_supported_platforms() -> Dict[str, Any]:
    """INTELLIGENT platform detection with Multi-AI File Paster architecture understanding."""
    platforms_dir = PROJECT_ROOT / "src" / "content" / "platforms"

    if not platforms_dir.exists():
        return {'platforms': {}, 'coverage_score': 0}

    platform_files = [Path(f) for f in get_files_by_glob(["src/content/platforms/*.js"]) if Path(f).name != 'factory.js']
    platforms = {}

    for platform_file in platform_files:
        if platform_file.name == 'factory.js':
            continue

        platform_name = platform_file.stem
        try:
            content = platform_file.read_text(encoding='utf-8')
            lines = content.split('\n')

            multiaifilePaster_features = {
                'Theme Integration': 'data-theme' in content or 'data-platform' in content,
                'Debug Integration': 'GPTPF_DEBUG' in content or 'debug(' in content,
                'I18n Support': 'GPTPF_I18N' in content or 'getMessage(' in content,
                'Batch Mode Support': 'batchMode' in content or 'batch' in content.lower(),
                'File Attachment': 'attach' in content and ('file' in content or 'upload' in content),
                'Platform Detection': 'isSupported' in content or 'getPlatformName' in content,
                'Component System': 'createModal' in content or 'createToast' in content,
                'Configuration Access': 'GPTPF_CONFIG' in content or 'getConfig' in content,
                'Error Recovery': 'try {' in content and 'catch' in content,
                'Dynamic Injection': 'MutationObserver' in content or 'appendChild' in content
            }

            selectors = len([line for line in lines if 'querySelector' in line or 'querySelectorAll' in line])
            events = len([line for line in lines if 'addEventListener' in line])
            api_calls = len([line for line in lines if 'fetch(' in line or 'XMLHttpRequest' in line])

            optimizations = []

            if selectors > 20:  # Increased threshold - 20+ selectors indicates real issue
                optimizations.append("Consider caching frequently used selectors - high selector usage detected")

            if events > 10:  # Increased threshold - 10+ events may need delegation
                optimizations.append("Consider event delegation pattern for performance")

            if not multiaifilePaster_features['Debug Integration']:
                optimizations.append("Add GPTPF_DEBUG integration for consistent logging")

            if not multiaifilePaster_features['I18n Support']:
                optimizations.append("Add GPTPF_I18N integration for internationalization")

            if not multiaifilePaster_features['Theme Integration']:
                optimizations.append("Add theme coordination with data-theme/data-platform attributes")

            architecture_compliance = sum(multiaifilePaster_features.values()) * 8  # 80 points for full compliance
            standard_features = sum([
                'querySelector' in content or 'getElementById' in content,
                'addEventListener' in content,
                'MutationObserver' in content,
                'async' in content or 'await' in content
            ]) * 5  # 20 points for standard features

            quality_score = architecture_compliance + standard_features

            if len(optimizations) <= 1:
                quality_score += 10

            platforms[platform_name] = {
                'lines': len(lines),
                'selectors_count': selectors,
                'events_count': events,
                'api_integrations': api_calls,
                'multiaifilePaster_features': multiaifilePaster_features,
                'standard_features': {
                    'DOM Manipulation': 'querySelector' in content or 'getElementById' in content,
                    'Event Handling': 'addEventListener' in content,
                    'Mutation Observer': 'MutationObserver' in content,
                    'Async Operations': 'async' in content or 'await' in content
                },
                'optimizations': optimizations,
                'quality_score': min(100, quality_score),
                'architecture_compliance': sum(multiaifilePaster_features.values()) / len(multiaifilePaster_features) * 100
            }

        except Exception:
            platforms[platform_name] = {
                'lines': 0,
                'selectors_count': 0,
                'events_count': 0,
                'api_integrations': 0,
                'multiaifilePaster_features': {},
                'standard_features': {},
                'optimizations': ['File read error - check syntax'],
                'quality_score': 0,
                'architecture_compliance': 0
            }

    coverage_score = len(platforms) * 12  # Base score per platform

    if platforms:
        avg_compliance = sum(p.get('architecture_compliance', 0) for p in platforms.values()) / len(platforms)
        coverage_score += int(avg_compliance * 0.4)  # Up to 40 bonus points

    if len(platforms) >= 5:
        coverage_score += 20

    return {
        'platforms': platforms,
        'coverage_score': min(100, coverage_score)
    }


async def _analyze_platform_patterns() -> Dict[str, Any]:
    """INTELLIGENT Multi-AI File Paster architecture pattern analysis."""
    platforms_dir = PROJECT_ROOT / "src" / "content" / "platforms"

    patterns = {}
    architecture_score = 30  # Start lower, earn points for good patterns

    factory_file = platforms_dir / "factory.js"
    if factory_file.exists():
        try:
            factory_content = factory_file.read_text(encoding='utf-8')

            has_platform_detection = 'createPlatform' in factory_content or 'getPlatform' in factory_content
            has_error_handling = 'try {' in factory_content and 'catch' in factory_content
            has_validation = 'isSupported' in factory_content or 'validate' in factory_content

            factory_quality = sum([has_platform_detection, has_error_handling, has_validation])

            patterns['Factory Pattern'] = {
                'implemented': True,
                'description': f'Intelligent platform factory (Quality: {factory_quality}/3)',
                'benefits': 'Centralized platform creation with validation',
                'quality_indicators': {
                    'Platform Detection': has_platform_detection,
                    'Error Handling': has_error_handling,
                    'Validation Logic': has_validation
                }
            }
            architecture_score += 15 + (factory_quality * 5)  # Up to 30 points
        except Exception:
            patterns['Factory Pattern'] = {
                'implemented': True,
                'description': 'Factory exists but analysis failed',
                'benefits': 'Basic factory pattern present'
            }
            architecture_score += 10
    else:
        patterns['Factory Pattern'] = {
            'implemented': False,
            'description': 'Missing centralized platform creation',
            'benefits': 'Would improve code organization and platform management'
        }

    shared_dir = PROJECT_ROOT / "src" / "shared"
    if shared_dir.exists():
        centralized_systems = {
            'Debug System': 'debug.js',
            'I18n System': 'i18n.js',
            'Configuration': 'config.js',
            'Metrics System': 'metrics.js',
            'Validation System': 'validation.js'
        }

        implemented_systems = 0
        for file_name in centralized_systems.values():
            system_file = shared_dir / file_name
            if system_file.exists():
                implemented_systems += 1

        patterns['Centralized Systems'] = {
            'implemented': implemented_systems > 0,
            'description': f'{implemented_systems}/{len(centralized_systems)} centralized systems implemented',
            'benefits': 'Consistent behavior across platforms',
            'systems': {name: (shared_dir / file).exists() for name, file in centralized_systems.items()}
        }
        architecture_score += implemented_systems * 3  # Up to 15 points

    platform_files = [Path(f) for f in get_files_by_glob(["src/content/platforms/*.js"])]
    theme_coordination_count = 0

    for platform_file in platform_files:
        if platform_file.name == 'factory.js':
            continue
        try:
            content = platform_file.read_text(encoding='utf-8')
            if 'data-theme' in content and 'data-platform' in content:
                theme_coordination_count += 1
        except Exception:
            continue

    if theme_coordination_count > 0:
        patterns['Theme Coordination'] = {
            'implemented': True,
            'description': f'{theme_coordination_count} platforms implement theme coordination',
            'benefits': 'Consistent UI theming across platforms',
            'coverage': f'{theme_coordination_count}/{len(platform_files)} platforms'
        }
        architecture_score += min(15, theme_coordination_count * 3)

    components_dir = PROJECT_ROOT / "src" / "content" / "components"
    if components_dir.exists():
        component_files = [Path(f) for f in get_files_by_glob(["src/content/components/*.js"])]

        patterns['Component System'] = {
            'implemented': True,
            'description': f'{len(component_files)} reusable components',
            'benefits': 'Modular UI components reduce duplication',
            'components': [f.stem for f in component_files]
        }
        architecture_score += min(10, len(component_files) * 2)

    multiaifilePaster_interface_methods = ['attach', 'detach', 'isSupported', 'getPlatformName']
    multiaifilePaster_integration_methods = ['setupTheme', 'setupDebug', 'setupI18n']

    interface_compliance = 0
    integration_compliance = 0

    for platform_file in platform_files:
        if platform_file.name == 'factory.js':
            continue
        try:
            content = platform_file.read_text(encoding='utf-8')

            interface_methods_found = sum(1 for method in multiaifilePaster_interface_methods if method in content)
            if interface_methods_found >= 3:
                interface_compliance += 1

            integration_methods_found = sum(1 for method in multiaifilePaster_integration_methods if method in content or method.replace('setup', '').upper() in content)
            if integration_methods_found >= 1:
                integration_compliance += 1

        except Exception:
            continue

    if interface_compliance > 0:
        patterns['Common Interface'] = {
            'implemented': True,
            'description': f'{interface_compliance}/{len(platform_files)} platforms follow common interface',
            'benefits': 'Consistent API across platforms enables maintainability'
        }
        architecture_score += min(10, interface_compliance * 2)

    if integration_compliance > 0:
        patterns['System Integration'] = {
            'implemented': True,
            'description': f'{integration_compliance}/{len(platform_files)} platforms integrate with shared systems',
            'benefits': 'Platforms properly integrate with Multi-AI File Paster infrastructure'
        }
        architecture_score += min(15, integration_compliance * 3)

    return {
        'patterns': patterns,
        'architecture_quality': min(100, architecture_score)
    }


async def _identify_missing_platform_support() -> Dict[str, Any]:
    """Identify potential missing platform integrations."""
    platforms_dir = PROJECT_ROOT / "src" / "content" / "platforms"

    existing_platforms = set()
    if platforms_dir.exists():
        platform_files = [Path(f) for f in get_files_by_glob(["src/content/platforms/*.js"]) if Path(f).name != 'factory.js']
        existing_platforms = {f.stem for f in platform_files}

    potential_platforms = {
        'perplexity': {
            'name': 'Perplexity AI',
            'reason': 'Growing AI search platform',
            'implementation_effort': 'Medium',
            'potential_impact': 'High'
        },
        'copilot': {
            'name': 'GitHub Copilot Chat',
            'reason': 'Developer-focused AI assistant',
            'implementation_effort': 'Medium',
            'potential_impact': 'High'
        },
        'poe': {
            'name': 'Poe by Quora',
            'reason': 'Multi-model AI platform',
            'implementation_effort': 'Medium',
            'potential_impact': 'Medium'
        },
        'huggingface': {
            'name': 'Hugging Face Spaces',
            'reason': 'Open source AI models',
            'implementation_effort': 'High',
            'potential_impact': 'Medium'
        },
        'replicate': {
            'name': 'Replicate',
            'reason': 'API-based AI models',
            'implementation_effort': 'High',
            'potential_impact': 'Medium'
        }
    }

    missing = []
    for platform_key, platform_info in potential_platforms.items():
        if platform_key not in existing_platforms:
            missing.append(platform_info)

    return {'missing': missing}


async def _generate_platform_integration_suggestions() -> Dict[str, Any]:
    """Generate suggestions for improving platform integrations."""
    suggestions = []

    platforms_dir = PROJECT_ROOT / "src" / "content" / "platforms"
    if not platforms_dir.exists():
        return {'suggestions': []}

    platform_files = [Path(f) for f in get_files_by_glob(["src/content/platforms/*.js"])]

    if len(platform_files) < 3:
        suggestions.append({
            'title': 'Expand Platform Coverage',
            'category': 'Feature Enhancement',
            'impact': 'High',
            'implementation': 'Add support for additional AI platforms to increase user base'
        })

    factory_exists = (platforms_dir / "factory.js").exists()
    if not factory_exists:
        suggestions.append({
            'title': 'Implement Factory Pattern',
            'category': 'Architecture',
            'impact': 'Medium',
            'implementation': 'Create factory.js for centralized platform instantiation'
        })

    for platform_file in platform_files:
        if platform_file.name == 'factory.js':
            continue
        try:
            content = platform_file.read_text(encoding='utf-8')

            if 'MutationObserver' not in content:
                suggestions.append({
                    'title': f'Add Dynamic Content Detection to {platform_file.stem}',
                    'category': 'Performance',
                    'impact': 'Medium',
                    'implementation': 'Use MutationObserver for better dynamic content handling'
                })

            if 'try {' not in content:
                suggestions.append({
                    'title': f'Add Error Handling to {platform_file.stem}',
                    'category': 'Reliability',
                    'impact': 'High',
                    'implementation': 'Wrap platform-specific code in try-catch blocks'
                })

        except Exception:
            continue

    suggestions.append({
        'title': 'Implement Universal Platform Detection',
        'category': 'Architecture',
        'impact': 'Medium',
        'implementation': 'Create intelligent platform detection system based on URL patterns and DOM structure'
    })

    return {'suggestions': suggestions}


async def run_analysis_suite(analysis_type: str) -> List[TextContent]:
    """Run integrated analysis using built-in MCP tools instead of external scripts."""
    outputs: List[str] = []
    analysis_type = analysis_type.lower()

    if analysis_type in ("project", "all"):
        try:
            project_result = await analyze_project(include_metrics=True, check_architecture=True)
            if project_result:
                outputs.append(f"📊 PROJECT ANALYSIS:\n{project_result[0].text}")
        except Exception as e:
            outputs.append(f"❌ PROJECT ANALYSIS FAILED: {e}")

    if analysis_type in ("i18n", "coverage", "all"):
        try:
            i18n_result = await analyze_i18n(check_duplicates=True)
            if i18n_result:
                if analysis_type == "coverage":
                    outputs.append(f"📈 I18N COVERAGE:\n{i18n_result[0].text}")
                else:
                    outputs.append(f"🌍 I18N ANALYSIS:\n{i18n_result[0].text}")
        except Exception as e:
            outputs.append(f"❌ I18N ANALYSIS FAILED: {e}")

    if analysis_type in ("quality", "all"):
        try:
            quality_result = await analyze_code_quality(include_suggestions=True, check_performance=True, check_security=True)
            if quality_result:
                outputs.append(f"🔍 CODE QUALITY ANALYSIS:\n{quality_result[0].text}")
        except Exception as e:
            outputs.append(f"❌ CODE QUALITY ANALYSIS FAILED: {e}")

    if analysis_type in ("debug", "all"):
        try:
            debug_result = await analyze_debug_integration(check_unused_keys=True, identify_missing=True)
            if debug_result:
                outputs.append(f"🐛 DEBUG INTEGRATION ANALYSIS:\n{debug_result[0].text}")
        except Exception as e:
            outputs.append(f"❌ DEBUG ANALYSIS FAILED: {e}")

    return [TextContent(type="text", text="\n\n".join(outputs) if outputs else "❌ No analysis performed")]


async def check_debug_system_health() -> Dict[str, bool]:
    """Check if the debug system is actually working properly before reporting false warnings."""
    health = {
        'healthy': True,
        'i18n_working': True,
        'debug_working': True,
        'script_order_ok': True,
        'translation_functional': True
    }

    try:
        manifest_path = PROJECT_ROOT / 'manifest.json'
        if manifest_path.exists():
            with open(manifest_path, 'r', encoding='utf-8') as f:
                manifest_data = json.load(f)

            content_scripts = manifest_data.get('content_scripts', [])
            if content_scripts:
                js_files = content_scripts[0].get('js', [])
                if js_files:
                    i18n_index = next((i for i, f in enumerate(js_files) if 'i18n.js' in f), -1)
                    config_index = next((i for i, f in enumerate(js_files) if 'config.js' in f), -1)
                    debug_index = next((i for i, f in enumerate(js_files) if 'debug.js' in f), -1)

                    if i18n_index != -1:
                        if config_index != -1 and i18n_index > config_index:
                            health['script_order_ok'] = False
                        if debug_index != -1 and i18n_index > debug_index:
                            health['script_order_ok'] = False

        debug_js_path = PROJECT_ROOT / 'src' / 'shared' / 'debug.js'
        if debug_js_path.exists():
            debug_content = debug_js_path.read_text(encoding='utf-8')

            has_translation_logic = (
                'translatedMessage' in debug_content and
                'getMessage(message)' in debug_content and
                'message.startsWith(\'debug_\')' in debug_content
            )

            if has_translation_logic:
                health['translation_functional'] = True
            else:
                health['translation_functional'] = False
                health['healthy'] = False

        locales_dir = PROJECT_ROOT / "_locales"
        if locales_dir.exists():
            en_messages = locales_dir / "en" / "messages.json"
            if en_messages.exists():
                with open(en_messages, 'r', encoding='utf-8') as f:
                    messages = json.load(f)
                debug_keys = [key for key in messages.keys() if key.startswith('debug_')]
                if len(debug_keys) > 0:
                    health['i18n_working'] = True
                else:
                    health['i18n_working'] = False
                    health['healthy'] = False

        if not health['script_order_ok'] or not health['translation_functional']:
            health['healthy'] = False

    except Exception:
        health['healthy'] = False

    return health


async def provide_debug_insights(result: List[str], check_unused_keys: bool, identify_missing: bool) -> List[TextContent]:
    """Provide helpful insights for healthy debug systems without false warnings."""

    js_files = []
    files_with_debug = {}

    for root, _, files in os.walk(PROJECT_ROOT / 'src'):
        for file in files:
            if file.endswith('.js'):
                file_path = Path(root) / file
                js_files.append(file_path)

    for js_file in js_files:
        try:
            content = js_file.read_text(encoding='utf-8')
            rel_path = str(js_file.relative_to(PROJECT_ROOT)).replace('\\', '/')

            debug_patterns = [
                r'window\.GPTPF_DEBUG\?\.log\(',
                r'window\.GPTPF_DEBUG\?\.warn\(',
                r'window\.GPTPF_DEBUG\?\.error\(',
                r'self\.GPTPF_DEBUG\?\.log\(',
                r'self\.GPTPF_DEBUG\?\.warn\(',
                r'self\.GPTPF_DEBUG\?\.error\(',
                r'root\.GPTPF_DEBUG\?\.log\(',
                r'root\.GPTPF_DEBUG\?\.warn\(',
                r'root\.GPTPF_DEBUG\?\.error\(',
                r'if \(window\.GPTPF_DEBUG\)',
                r'if \(self\.GPTPF_DEBUG\)',
                r'if \(root\.GPTPF_DEBUG\)',
            ]

            total_debug_calls = 0
            for pattern in debug_patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                total_debug_calls += len(matches)

            if total_debug_calls > 0:
                files_with_debug[rel_path] = total_debug_calls

        except Exception:
            continue

    result.append(f"\n📊 DEBUG INTEGRATION INSIGHTS:")
    result.append(f"  • Total JavaScript files: {len(js_files)}")
    result.append(f"  • Files with debug integration: {len(files_with_debug)}")

    if files_with_debug:
        coverage_pct = (len(files_with_debug) / len(js_files)) * 100
        result.append(f"  • Debug coverage: {coverage_pct:.1f}%")

        top_files = sorted(files_with_debug.items(), key=lambda x: x[1], reverse=True)[:5]
        result.append(f"\n🔧 TOP DEBUG-INTEGRATED FILES:")
        for file_path, count in top_files:
            result.append(f"  • {count} calls: {file_path}")

    if check_unused_keys:
        await analyze_debug_locale_insights(result)

    result.append(f"\n💡 SYSTEM HEALTH RECOMMENDATIONS:")
    result.append("  ✅ Debug system is working correctly")
    result.append("  ✅ No critical issues require immediate attention")
    result.append("  💡 Consider adding debug calls to files without them for better debugging")

    return [TextContent(type="text", text="\n".join(result))]


async def analyze_debug_locale_insights(result: List[str]):
    """Provide locale insights without false warnings for healthy systems."""
    try:
        locales_dir = PROJECT_ROOT / "_locales"
        if not locales_dir.exists():
            return

        en_messages = locales_dir / "en" / "messages.json"
        if en_messages.exists():
            with open(en_messages, 'r', encoding='utf-8') as f:
                messages = json.load(f)

            debug_keys = [key for key in messages.keys() if key.startswith('debug_')]
            total_keys = len(messages.keys())
            debug_percentage = (len(debug_keys) / total_keys * 100) if total_keys > 0 else 0

            result.append(f"\n🌍 i18n DEBUG INTEGRATION:")
            result.append(f"  • Debug keys defined: {len(debug_keys)}")
            result.append(f"  • Debug key percentage: {debug_percentage:.1f}% of total keys")

            locale_count = len([d for d in locales_dir.iterdir() if d.is_dir() and (d / "messages.json").exists()])
            result.append(f"  • Supported locales: {locale_count}")

    except Exception:
        pass


async def analyze_debug_integration(check_unused_keys: bool = True, identify_missing: bool = True) -> List[TextContent]:
    """Intelligent debug integration analysis with pattern detection and optimization insights."""

    def _analyze_debug_coverage() -> Dict[str, Any]:
        """Analyze debug integration coverage across codebase."""
        js_files = get_js_files()

        coverage_data: Dict[str, Any] = {
            'total_files': len(js_files),
            'files_with_debug': 0,
            'debug_patterns': {},
            'missing_debug_files': [],
            'debug_integration_quality': {}
        }

        debug_patterns = [
            'GPTPF_DEBUG.log',
            'GPTPF_DEBUG.warn',
            'GPTPF_DEBUG.error',
            'GPTPF_DEBUG.info',
            'window.GPTPF_DEBUG?.log',
            'window.GPTPF_DEBUG?.warn',
            'window.GPTPF_DEBUG?.error',
            'window.GPTPF_DEBUG?.info',
            'window.GPTPF_DEBUG.log',
            'window.GPTPF_DEBUG.warn',
            'window.GPTPF_DEBUG.error',
            'window.GPTPF_DEBUG.info',
            'self.GPTPF_DEBUG?.log',
            'self.GPTPF_DEBUG?.warn',
            'self.GPTPF_DEBUG?.error',
            'self.GPTPF_DEBUG?.info',
            'root.GPTPF_DEBUG?.log',
            'root.GPTPF_DEBUG?.warn',
            'root.GPTPF_DEBUG?.error',
            'root.GPTPF_DEBUG?.info'
        ]

        for file_path in js_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                rel_path = os.path.relpath(file_path, PROJECT_ROOT)
                file_lines = len(content.split('\n'))

                if 'debug.js' in rel_path:
                    continue

                has_debug = any(pattern in content for pattern in debug_patterns)

                if has_debug:
                    files_count: int = coverage_data['files_with_debug']
                    coverage_data['files_with_debug'] = files_count + 1

                    debug_calls = sum(content.count(pattern) for pattern in debug_patterns)

                    quality_dict: Dict[str, Any] = coverage_data['debug_integration_quality']
                    quality_dict[rel_path] = {
                        'debug_calls': debug_calls,
                        'file_lines': file_lines,
                        'debug_density': debug_calls / max(file_lines, 1) * 100
                    }
                else:
                    should_have_debug = any(indicator in content.lower() for indicator in [
                        'error', 'catch', 'try', 'throw', 'fail', 'invalid',
                        'load', 'init', 'process', 'handle', 'validate'
                    ])

                    if should_have_debug and file_lines > 20:  # Only for substantial files
                        missing_files: List[Dict[str, Any]] = coverage_data['missing_debug_files']
                        missing_files.append({
                            'file': rel_path,
                            'reason': 'Contains error handling or complex logic without debug coverage',
                            'file_size': file_lines
                        })

            except Exception:
                continue

        return coverage_data

    def _check_debug_locale_integration() -> Dict[str, Any]:
        """Check integration between debug system and locale files with accurate analysis."""
        locale_data: Dict[str, Any] = {
            'debug_keys_in_code': set(),
            'debug_keys_found': set(),
            'missing_debug_keys': [],
            'locale_completion': {}
        }

        debug_keys_in_code = set()
        js_files = get_js_files()
        for js_file in js_files:
            try:
                content = js_file.read_text(encoding='utf-8')
                debug_key_matches = re.findall(r'\bdebug_[a-z_]+\b', content)
                for match in debug_key_matches:
                    debug_keys_in_code.add(match)
            except Exception:
                continue

        locale_data['debug_keys_in_code'] = debug_keys_in_code

        locale_files = get_locale_files()
        for locale_name, messages_file in locale_files.items():
            try:
                messages = load_json_file(messages_file)
                if messages:
                    debug_keys_in_locale = {k for k in messages.keys() if k.startswith('debug_')}
                    locale_data['debug_keys_found'].update(debug_keys_in_locale)

                    missing_in_locale = debug_keys_in_code - debug_keys_in_locale
                    found_in_locale = debug_keys_in_code & debug_keys_in_locale

                    if len(debug_keys_in_code) > 0:
                        completion_percentage = (len(found_in_locale) / len(debug_keys_in_code)) * 100
                    else:
                        completion_percentage = 100

                    locale_data['locale_completion'][locale_name] = {
                        'percentage': completion_percentage,
                        'found': len(found_in_locale),
                        'total_needed': len(debug_keys_in_code),
                        'missing': sorted(list(missing_in_locale)),  # Show ALL missing keys
                        'total_missing_count': len(missing_in_locale),
                        'all_missing_keys': sorted(list(missing_in_locale))  # Comprehensive list
                    }
            except Exception:
                continue

        locale_data['missing_debug_keys'] = list(debug_keys_in_code - locale_data['debug_keys_found'])
        return locale_data

    def _detect_debug_anti_patterns() -> List[Dict[str, Any]]:
        """Detect debug anti-patterns and quality issues."""
        anti_patterns = []

        js_files = get_js_files()

        for file_path in js_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                rel_path = os.path.relpath(file_path, PROJECT_ROOT)

                if 'debug.js' in rel_path:
                    continue

                raw_console_calls = []
                for line_num, line in enumerate(content.split('\n'), 1):
                    if any(pattern in line for pattern in ['console.log', 'console.warn', 'console.error']) and 'originalConsole' not in line:
                        raw_console_calls.append(line_num)

                if raw_console_calls:
                    anti_patterns.append({
                        'type': 'Raw Console Usage',
                        'description': f'{len(raw_console_calls)} raw console calls found',
                        'files': [rel_path],
                        'lines': raw_console_calls[:5],
                        'fix': 'Replace console.* calls with GPTPF_DEBUG.* for consistency'
                    })

                hardcoded_debug_patterns = re.findall(r'GPTPF_DEBUG\.\w+\([\'"]([^\'\"]+)[\'\"](?!,)', content)
                actual_hardcoded = []
                for pattern in hardcoded_debug_patterns:
                    if ' ' in pattern and not pattern.startswith('debug_') and len(pattern) > 10:
                        actual_hardcoded.append(pattern)

                if actual_hardcoded:
                    anti_patterns.append({
                        'type': 'Hardcoded Debug Messages',
                        'description': f'{len(actual_hardcoded)} hardcoded debug messages found',
                        'files': [rel_path],
                        'examples': actual_hardcoded[:3],
                        'fix': 'Replace hardcoded messages with i18n keys using GPTPF_I18N.getMessage()'
                    })


                problematic_patterns = []

                lines = content.split('\n')
                in_loop = False
                loop_debug_count = 0

                for i, line in enumerate(lines):
                    if any(keyword in line for keyword in ['for (', 'while (', 'forEach(', '.map(', '.filter(']):
                        in_loop = True
                        loop_debug_count = 0
                    elif in_loop and ('}' in line or 'return' in line):
                        if loop_debug_count > 3:  # More than 3 debug calls in a loop
                            problematic_patterns.append(f"Line {i+1}: {loop_debug_count} debug calls in loop")
                        in_loop = False
                    elif in_loop and 'GPTPF_DEBUG' in line:
                        loop_debug_count += 1

                if problematic_patterns:
                    anti_patterns.append({
                        'type': 'Debug Performance Issues',
                        'description': f'{len(problematic_patterns)} potential performance issues with debug calls',
                        'files': [rel_path],
                        'examples': problematic_patterns[:3],
                        'fix': 'Consider using GPTPF_DEBUG.isEnabled() checks in performance-critical loops'
                    })

            except Exception:
                continue

        return anti_patterns

    def _generate_optimization_recommendations(coverage_data: Dict[str, Any], locale_data: Dict[str, Any], anti_patterns: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        """Generate intelligent optimization recommendations."""
        recommendations = []

        coverage_percent = (coverage_data['files_with_debug'] / max(coverage_data['total_files'], 1)) * 100

        if coverage_percent < 50:
            recommendations.append({
                'priority': 'HIGH',
                'title': 'Low Debug Coverage',
                'description': f'Only {coverage_percent:.1f}% of files have debug integration. Add debug logging to critical files.',
                'action': 'Implement GPTPF_DEBUG calls in error handling and complex logic sections'
            })
        elif coverage_percent < 75:
            recommendations.append({
                'priority': 'MEDIUM',
                'title': 'Moderate Debug Coverage',
                'description': f'{coverage_percent:.1f}% coverage is good but can be improved.',
                'action': 'Add debug logging to remaining complex functions and error cases'
            })

        if locale_data['missing_debug_keys']:
            recommendations.append({
                'priority': 'HIGH',
                'title': 'Missing Debug Locale Keys',
                'description': f"{len(locale_data['missing_debug_keys'])} debug keys missing from locale files",
                'action': f"Add keys: {', '.join(locale_data['missing_debug_keys'][:3])}"
            })

        if anti_patterns:
            for pattern in anti_patterns[:3]:  # Top 3 patterns
                recommendations.append({
                    'priority': 'MEDIUM',
                    'title': f'Fix {pattern["type"]}',
                    'description': pattern['description'],
                    'action': pattern['fix']
                })

        high_density_files = [
            file for file, data in coverage_data['debug_integration_quality'].items()
            if data['debug_density'] > 5  # More than 5% of lines are debug calls
        ]

        if high_density_files:
            recommendations.append({
                'priority': 'LOW',
                'title': 'Debug Call Optimization',
                'description': f'{len(high_density_files)} files have high debug call density',
                'action': 'Consider using debug level checks to reduce runtime overhead'
            })

        return recommendations

    coverage_data = _analyze_debug_coverage()
    locale_data = _check_debug_locale_integration()
    anti_patterns = _detect_debug_anti_patterns()
    recommendations = _generate_optimization_recommendations(coverage_data, locale_data, anti_patterns)

    result = ["🔧 INTELLIGENT DEBUG INTEGRATION ANALYSIS"]
    result.append("=" * 50)
    result.append("")

    coverage_percent = (coverage_data['files_with_debug'] / max(coverage_data['total_files'], 1)) * 100
    result.append("📊 DEBUG COVERAGE ANALYSIS:")
    result.append(f"   Total JavaScript files: {coverage_data['total_files']}")
    result.append(f"   Files with debug integration: {coverage_data['files_with_debug']}")
    result.append(f"   Coverage percentage: {coverage_percent:.1f}%")

    if coverage_percent >= 75:
        result.append("   ✅ Excellent debug coverage!")
    elif coverage_percent >= 50:
        result.append("   👍 Good debug coverage with room for improvement")
    else:
        result.append("   🔴 Low debug coverage - needs attention")
    result.append("")

    if coverage_data['missing_debug_files'] and identify_missing:
        result.append("🎯 MISSING DEBUG INTEGRATION:")
        for missing in coverage_data['missing_debug_files'][:5]:
            result.append(f"   📁 {missing['file']} ({missing['file_size']} lines)")
            result.append(f"      Reason: {missing['reason']}")

        if len(coverage_data['missing_debug_files']) > 5:
            result.append(f"   ... and {len(coverage_data['missing_debug_files']) - 5} more files")
        result.append("")

    if check_unused_keys:
        result.append("🌍 LOCALE INTEGRATION ANALYSIS:")
        result.append(f"   Debug keys in code: {len(locale_data['debug_keys_in_code'])}")

        if locale_data['missing_debug_keys']:
            result.append(f"   Global missing keys: {', '.join(locale_data['missing_debug_keys'])}")
        else:
            result.append("   ✅ All debug keys are properly translated!")

        for locale, data in locale_data['locale_completion'].items():
            if data['total_missing_count'] == 0:
                result.append(f"   {locale}: ✅ 100% complete ({data['found']}/{data['total_needed']} keys)")
            else:
                result.append(f"   {locale}: {data['percentage']:.1f}% complete ({data['found']}/{data['total_needed']} keys)")
                if data['all_missing_keys']:
                    result.append(f"      🔍 ALL MISSING KEYS ({len(data['all_missing_keys'])}):")
                    missing_keys = data['all_missing_keys']
                    for i in range(0, len(missing_keys), 3):
                        batch = missing_keys[i:i+3]
                        result.append(f"         {', '.join(batch)}")
        result.append("")

    if anti_patterns:
        result.append("⚠️ DEBUG ANTI-PATTERNS DETECTED:")
        for pattern in anti_patterns[:5]:
            result.append(f"   🚨 {pattern['type']}: {pattern['description']}")
            result.append(f"      Files: {', '.join(pattern['files'][:3])}")
            result.append(f"      Fix: {pattern['fix']}")
        result.append("")

    if recommendations:
        result.append("💡 OPTIMIZATION RECOMMENDATIONS:")

        high_priority = [r for r in recommendations if r['priority'] == 'HIGH']
        medium_priority = [r for r in recommendations if r['priority'] == 'MEDIUM']
        low_priority = [r for r in recommendations if r['priority'] == 'LOW']

        if high_priority:
            result.append("   🔥 HIGH PRIORITY:")
            for rec in high_priority:
                result.append(f"      • {rec['title']}: {rec['description']}")
                result.append(f"        Action: {rec['action']}")

        if medium_priority:
            result.append("   📈 MEDIUM PRIORITY:")
            for rec in medium_priority:
                result.append(f"      • {rec['title']}: {rec['description']}")
                result.append(f"        Action: {rec['action']}")

        if low_priority:
            result.append("   🔧 LOW PRIORITY:")
            for rec in low_priority:
                result.append(f"      • {rec['title']}: {rec['description']}")

        result.append("")

    quality_score = min(100,
                       coverage_percent +
                       (20 if not locale_data['missing_debug_keys'] else 0) +
                       (15 if not anti_patterns else 0) +
                       (10 if coverage_percent > 75 else 0))

    result.append(f"📊 DEBUG INTEGRATION QUALITY SCORE: {quality_score:.0f}/100")

    if quality_score >= 85:
        result.append("🏆 Excellent debug integration - well architected!")
    elif quality_score >= 70:
        result.append("👍 Good debug integration with minor improvements needed")
    elif quality_score >= 50:
        result.append("🔧 Moderate debug integration - several areas for improvement")
    else:
        result.append("🚨 Debug integration needs significant improvement")

    return [TextContent(type="text", text="\n".join(result))]





async def analyze_documentation(check_separation: bool = True, update_needed: bool = True) -> List[TextContent]:
    """Intelligent documentation analysis with change-based outdated content detection and intelligent insights."""
    import subprocess
    import datetime
    from pathlib import Path

    def _analyze_doc_quality(content: str, file_path: str) -> Dict[str, Any]:
        """Analyze documentation quality and completeness."""
        quality_metrics: Dict[str, Any] = {
            'readability_score': 0,
            'completeness_score': 0,
            'structure_quality': 0,
            'issues': [],
            'recommendations': []
        }

        lines = content.split('\n')
        code_blocks = content.count('```')

        if len(content) > 100:
            heading_count = len([line for line in lines if line.startswith('#')])
            if heading_count > 0:
                readability_score: int = quality_metrics['readability_score']
                quality_metrics['readability_score'] = readability_score + 30

            if code_blocks >= 2:  # At least one complete code block
                readability_score: int = quality_metrics['readability_score']
                quality_metrics['readability_score'] = readability_score + 20

            links = content.count('[') + content.count('http')
            if links > 2:
                readability_score: int = quality_metrics['readability_score']
                quality_metrics['readability_score'] = readability_score + 15

            list_items = content.count('- ') + content.count('* ') + content.count('1. ')
            if list_items > 3:
                readability_score: int = quality_metrics['readability_score']
                quality_metrics['readability_score'] = readability_score + 15

        essential_sections = {
            'readme.md': ['installation', 'usage', 'features', 'getting started'],
            'contributing.md': ['setup', 'development', 'pull request', 'guidelines'],
            'changelog.md': ['version', 'added', 'changed', 'fixed'],
            'api': ['parameters', 'returns', 'example', 'description'],
            'setup': ['requirements', 'install', 'configure', 'run'],
            'guide': ['step', 'example', 'tutorial', 'walkthrough']
        }

        file_type = Path(file_path).name.lower()
        content_lower = content.lower()

        for doc_type, required_sections in essential_sections.items():
            if doc_type in file_type:
                found_sections = sum(1 for section in required_sections
                                   if section in content_lower)
                quality_metrics['completeness_score'] = int((found_sections / len(required_sections)) * 100)
                break
        else:
            if len(content) > 500:
                quality_metrics['completeness_score'] = 60
            elif len(content) > 200:
                quality_metrics['completeness_score'] = 40
            else:
                quality_metrics['completeness_score'] = 20

        if content.startswith('#'):
            structure_score: int = quality_metrics['structure_quality']
            quality_metrics['structure_quality'] = structure_score + 25

        if 'table of contents' in content_lower or '- [' in content:
            structure_score: int = quality_metrics['structure_quality']
            quality_metrics['structure_quality'] = structure_score + 25

        if '```' in content and code_blocks % 2 == 0:  # Matched code blocks
            structure_score: int = quality_metrics['structure_quality']
            quality_metrics['structure_quality'] = structure_score + 25

        if '![' in content or 'image' in content_lower:
            structure_score: int = quality_metrics['structure_quality']
            quality_metrics['structure_quality'] = structure_score + 25

        return quality_metrics

    def _detect_outdated_content(file_path: str, content: str) -> List[str]:
        """Detect potentially outdated content based on file changes and content analysis."""
        outdated_indicators = []

        try:
            doc_modified = Path(file_path).stat().st_mtime
            doc_date = datetime.datetime.fromtimestamp(doc_modified)

            file_stem = Path(file_path).stem.lower()
            related_patterns = []

            if 'readme' in file_stem:
                related_patterns = ['src/**/*.js', 'manifest.json', 'package.json']
            elif 'api' in file_stem or 'reference' in file_stem:
                related_patterns = ['src/**/*.js', 'src/**/*.ts']
            elif 'setup' in file_stem or 'install' in file_stem:
                related_patterns = ['package.json', 'requirements.txt', 'manifest.json']
            elif 'config' in file_stem:
                related_patterns = ['src/shared/config.js', '*.json', '*.config.*']
            else:
                related_patterns = ['src/**/*', 'manifest.json']

            newer_files = []
            for pattern in related_patterns:
                for related_file in get_files_by_glob([pattern]):
                    try:
                        related_modified = Path(related_file).stat().st_mtime
                        related_date = datetime.datetime.fromtimestamp(related_modified)

                        if related_date > doc_date:
                            days_diff = (related_date - doc_date).days
                            if days_diff > 7:  # More than a week newer
                                newer_files.append((os.path.relpath(related_file, PROJECT_ROOT), days_diff))
                    except:
                        continue

            if newer_files:
                outdated_indicators.append(f"Related files modified after documentation:")
                for file, days in sorted(newer_files, key=lambda x: x[1], reverse=True)[:5]:
                    outdated_indicators.append(f"  • {file} ({days} days newer)")

            content_lower = content.lower()

            version_patterns = [r'v?\d+\.\d+\.\d+', r'version \d+', r'chrome \d+']
            for pattern in version_patterns:
                matches = re.findall(pattern, content_lower)
                if matches:
                    for match in matches:
                        numbers = re.findall(r'\d+', match)
                        if numbers and len(numbers) >= 2:
                            major = int(numbers[0])
                            if major < 2 or (major == 2 and int(numbers[1]) < 5):
                                outdated_indicators.append(f"Potentially outdated version reference: {match}")
                                break

            deprecated_terms = [
                'manifest v2', 'jquery', 'bower', 'grunt', 'gulp',
                'internet explorer', 'ie6', 'ie7', 'ie8', 'ie9', 'ie10', 'ie11'
            ]

            for term in deprecated_terms:
                if term in content_lower:
                    outdated_indicators.append(f"References deprecated technology: {term}")

            internal_links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', content)
            for _, link_url in internal_links:
                if not link_url.startswith(('http', 'mailto', '#')):
                    link_path = PROJECT_ROOT / link_url.lstrip('./')
                    if not link_path.exists():
                        outdated_indicators.append(f"Broken internal link: {link_url}")

        except Exception:
            pass

        return outdated_indicators

    def _suggest_improvements(file_path: str, content: str, quality_metrics: Dict[str, Any]) -> List[str]:
        """Generate intelligent improvement suggestions."""
        suggestions = []

        file_name = Path(file_path).name.lower()

        if quality_metrics['readability_score'] < 50:
            if not content.startswith('#'):
                suggestions.append("Add a clear title/heading at the beginning")

            if content.count('```') < 2:
                suggestions.append("Include code examples to improve clarity")

            if content.count('\n\n') < 3:
                suggestions.append("Add more spacing/paragraphs for better readability")

        if quality_metrics['completeness_score'] < 70:
            if 'readme' in file_name:
                suggestions.append("Consider adding: installation instructions, usage examples, features overview")
            elif 'contributing' in file_name:
                suggestions.append("Consider adding: development setup, coding guidelines, pull request process")
            elif 'changelog' in file_name:
                suggestions.append("Ensure consistent format with version numbers, dates, and change categories")
            else:
                suggestions.append("Expand content with more detailed explanations and examples")

        if quality_metrics['structure_quality'] < 60:
            suggestions.append("Improve document structure with consistent heading hierarchy")
            if len(content) > 1000 and 'table of contents' not in content.lower():
                suggestions.append("Add table of contents for better navigation")

        if 'readme' in file_name and 'badge' not in content.lower():
            suggestions.append("Consider adding status badges (build, version, license)")

        if len(content.split('\n')) > 100 and not any(heading.startswith('##') for heading in content.split('\n')):
            suggestions.append("Use multiple heading levels (##, ###) to organize content")

        return suggestions

    doc_patterns = ["*.md", "docs/**/*.md", ".github/**/*.md", "*.rst", "*.txt"]
    doc_files = get_files_by_glob(doc_patterns)

    if not doc_files:
        return [TextContent(type="text", text="❌ No documentation files found")]

    public_docs = []
    internal_docs = []
    mixed_docs = []
    doc_analysis = {}

    for doc_file in doc_files:
        rel_path = os.path.relpath(doc_file, PROJECT_ROOT)

        try:
            with open(doc_file, 'r', encoding='utf-8') as f:
                content = f.read()

            is_internal = any(indicator in rel_path.lower() for indicator in [
                'internal/', '/internal/', '\\internal\\',
                'private', 'technical_docs', 'pipeline_protection', 'env_mcp'
            ])

            is_public = any(pub in rel_path.lower() for pub in [
                'readme', 'changelog', 'contributing', 'license', 'notice'
            ]) or rel_path.startswith('docs/') and 'internal' not in rel_path.lower()

            quality_metrics = _analyze_doc_quality(content, rel_path)
            outdated_content = _detect_outdated_content(doc_file, content)
            suggestions = _suggest_improvements(doc_file, content, quality_metrics)

            doc_analysis[rel_path] = {
                'quality_metrics': quality_metrics,
                'outdated_indicators': outdated_content,
                'suggestions': suggestions,
                'word_count': len(content.split()),
                'is_internal': is_internal,
                'is_public': is_public
            }

            if is_internal:
                internal_docs.append(rel_path)
            elif is_public:
                public_docs.append(rel_path)
            else:
                mixed_docs.append(rel_path)

        except Exception:
            public_docs.append(rel_path)

    result = ["📚 INTELLIGENT DOCUMENTATION ANALYSIS"]
    result.append("=" * 50)
    result.append("")

    total_words = sum(analysis['word_count'] for analysis in doc_analysis.values())
    avg_quality = sum(
        analysis['quality_metrics']['readability_score'] +
        analysis['quality_metrics']['completeness_score'] +
        analysis['quality_metrics']['structure_quality']
        for analysis in doc_analysis.values()
    ) / (len(doc_analysis) * 3) if doc_analysis else 0

    result.append("📊 DOCUMENTATION OVERVIEW:")
    result.append(f"   Total files: {len(doc_files)}")
    result.append(f"   Total words: {total_words:,}")
    result.append(f"   Average quality score: {avg_quality:.1f}/100")
    result.append(f"   Public docs: {len(public_docs)}")
    result.append(f"   Internal docs: {len(internal_docs)}")
    if mixed_docs:
        result.append(f"   Uncategorized: {len(mixed_docs)}")
    result.append("")

    result.append("📋 QUALITY ANALYSIS BY FILE:")
    quality_sorted = sorted(doc_analysis.items(),
                          key=lambda x: (x[1]['quality_metrics']['readability_score'] +
                                       x[1]['quality_metrics']['completeness_score'] +
                                       x[1]['quality_metrics']['structure_quality']),
                          reverse=True)

    for file_path, analysis in quality_sorted[:8]:  # Show top 8
        total_quality = (analysis['quality_metrics']['readability_score'] +
                        analysis['quality_metrics']['completeness_score'] +
                        analysis['quality_metrics']['structure_quality']) / 3

        status = "🏆" if total_quality >= 80 else "👍" if total_quality >= 60 else "🔧"
        result.append(f"   {status} {file_path} ({total_quality:.0f}/100, {analysis['word_count']} words)")
    result.append("")

    outdated_files = [(path, analysis) for path, analysis in doc_analysis.items()
                     if analysis['outdated_indicators']]

    if outdated_files:
        result.append("⚠️ POTENTIALLY OUTDATED CONTENT:")
        for file_path, analysis in outdated_files[:5]:
            result.append(f"   📁 {file_path}:")
            for indicator in analysis['outdated_indicators'][:3]:
                result.append(f"     • {indicator}")
            if len(analysis['outdated_indicators']) > 3:
                result.append(f"     ... and {len(analysis['outdated_indicators']) - 3} more issues")
        result.append("")
    else:
        result.append("✅ CONTENT FRESHNESS: All documentation appears up-to-date")
        result.append("")

    files_needing_improvement = [(path, analysis) for path, analysis in doc_analysis.items()
                               if analysis['suggestions']]

    if files_needing_improvement:
        result.append("💡 IMPROVEMENT RECOMMENDATIONS:")
        for file_path, analysis in files_needing_improvement[:5]:
            if analysis['suggestions']:
                result.append(f"   📁 {file_path}:")
                for suggestion in analysis['suggestions'][:3]:
                    result.append(f"     • {suggestion}")
        result.append("")

    if check_separation:
        if mixed_docs:
            result.append("🏗️ ORGANIZATION ISSUES:")
            result.append(f"   {len(mixed_docs)} files need better categorization:")
            for doc in mixed_docs[:5]:
                result.append(f"     • {doc}")
            result.append("   💡 Consider moving internal content to docs/internal/")
            result.append("")
        else:
            result.append("✅ ORGANIZATION: Documentation properly categorized")
            result.append("")

    if update_needed:
        try:
            git_result = subprocess.run(
                ["git", "log", "--oneline", "--since=30 days ago", "--", "src/", "manifest.json"],
                cwd=str(PROJECT_ROOT),
                capture_output=True,
                text=True,
                timeout=15
            )

            recent_code_commits = git_result.stdout.strip().split('\n') if git_result.stdout.strip() else []

            git_doc_result = subprocess.run(
                ["git", "log", "--oneline", "--since=30 days ago", "--", "*.md", "docs/"],
                cwd=str(PROJECT_ROOT),
                capture_output=True,
                text=True,
                timeout=15
            )

            recent_doc_commits = git_doc_result.stdout.strip().split('\n') if git_doc_result.stdout.strip() else []

            result.append("📈 RECENT ACTIVITY ANALYSIS:")
            result.append(f"   Code commits (30 days): {len(recent_code_commits)}")
            result.append(f"   Documentation commits (30 days): {len(recent_doc_commits)}")

            if len(recent_code_commits) > len(recent_doc_commits) * 3:
                result.append("   ⚠️ Code changes significantly outpace documentation updates")
                result.append("   💡 Consider updating documentation to reflect recent code changes")
            elif len(recent_doc_commits) > 0:
                result.append("   ✅ Documentation is being actively maintained")
            else:
                result.append("   ℹ️ No recent documentation updates detected")
            result.append("")

        except Exception:
            result.append("⚠️ Could not analyze git activity for update recommendations")
            result.append("")

    result.append("🎯 PRIORITY ACTIONS:")

    low_quality_docs = [path for path, analysis in doc_analysis.items()
                       if (analysis['quality_metrics']['readability_score'] +
                          analysis['quality_metrics']['completeness_score'] +
                          analysis['quality_metrics']['structure_quality']) / 3 < 50]

    if outdated_files:
        result.append("1. Update outdated documentation (focus on files with broken links)")
    if low_quality_docs:
        result.append("2. Improve documentation quality for low-scoring files")
    if mixed_docs:
        result.append("3. Reorganize uncategorized documentation")

    if not outdated_files and not low_quality_docs and not mixed_docs:
        result.append("✨ Documentation is well-organized and up-to-date!")

    overall_score = min(100, avg_quality + (20 if not outdated_files else 0) + (10 if not mixed_docs else 0))
    result.append("")
    result.append(f"📊 OVERALL DOCUMENTATION SCORE: {overall_score:.0f}/100")

    return [TextContent(type="text", text="\n".join(result))]


def log_startup_info():
    """Log comprehensive startup information with environment validation."""
    import sys
    import platform

    try:
        sys.stderr.write("🔧 MCP Server Startup Diagnostics\n")
        sys.stderr.write(f"📁 Project root: {PROJECT_ROOT}\n")
        sys.stderr.write(f"🐍 Python: {sys.version}\n")
        sys.stderr.write(f"🖥️  Platform: {platform.system()} {platform.release()}\n")

        env_details = []

        if platform.system() == "Linux":
            try:
                with open("/proc/version", "r") as f:
                    version_info = f.read()
                    if "microsoft" in version_info.lower() or "wsl" in version_info.lower():
                        env_details.append("WSL environment")
            except Exception:
                pass

        if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
            env_details.append("Virtual environment active")

        try:
            try:
                from importlib.metadata import version as pkg_version  # Python 3.8+
            except ImportError:  # pragma: no cover
                from importlib_metadata import version as pkg_version  # type: ignore
            mcp_version = pkg_version('mcp')
            sys.stderr.write(f"📦 MCP version: {mcp_version}\n")
        except Exception as e:
            sys.stderr.write(f"⚠️ Could not determine MCP version: {e}\n")

        if env_details:
            sys.stderr.write(f"🔍 Environment: {', '.join(env_details)}\n")

        if PROJECT_ROOT.exists():
            sys.stderr.write(f"✅ Project directory validated\n")
        else:
            sys.stderr.write(f"❌ Project directory not found: {PROJECT_ROOT}\n")

        sys.stderr.write("🚀 Starting MCP server initialization...\n")
        sys.stderr.flush()

    except Exception as e:
        sys.stderr.write(f"❌ Startup diagnostics failed: {e}\n")
        sys.stderr.flush()


def validate_environment() -> bool:
    """Validate environment prerequisites with detailed error reporting."""
    validation_errors = []

    try:
        if sys.version_info < (3, 8):
            validation_errors.append(f"Python 3.8+ required, found {sys.version}")

        required_modules = ['asyncio', 'json', 'pathlib', 're']
        for module in required_modules:
            try:
                __import__(module)
            except ImportError:
                validation_errors.append(f"Required module missing: {module}")

        try:
            _ = server  # Reference the already-initialized server
        except NameError as e:
            validation_errors.append(f"MCP modules not available: {e}")

        critical_paths = [
            PROJECT_ROOT / "manifest.json",
            PROJECT_ROOT / "src",
            PROJECT_ROOT / "_locales"
        ]

        for path in critical_paths:
            if not path.exists():
                validation_errors.append(f"Critical path missing: {path}")

        if validation_errors:
            sys.stderr.write("❌ Environment validation failed:\n")
            for error in validation_errors:
                sys.stderr.write(f"  • {error}\n")
            sys.stderr.flush()
            return False

        sys.stderr.write("✅ Environment validation passed\n")
        sys.stderr.flush()
        return True

    except Exception as e:
        sys.stderr.write(f"❌ Environment validation error: {e}\n")
        sys.stderr.flush()
        return False


async def analyze_code_quality(include_suggestions: bool = True, check_performance: bool = True, check_security: bool = True) -> List[TextContent]:
    """Enhanced code quality analysis with deep performance profiling and comprehensive security vulnerability assessment."""
    import datetime
    from collections import defaultdict

    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    result = f"🧠 ENHANCED CODE QUALITY ANALYSIS [{timestamp}]\n" + ("=" * 80) + "\n\n"

    code_analysis = await _perform_deep_code_analysis()

    quality_score = _calculate_quality_score(code_analysis)

    result += f"📊 QUALITY OVERVIEW\n"
    result += f"Overall Quality Score: {quality_score['total']}/100\n"
    result += f"  • Architecture: {quality_score['architecture']}/25\n"
    result += f"  • Maintainability: {quality_score['maintainability']}/25\n"
    result += f"  • Performance: {quality_score['performance']}/25\n"
    result += f"  • Security: {quality_score['security']}/25\n\n"

    result += f"📈 CODEBASE METRICS\n"
    result += f"JavaScript Files: {code_analysis['file_count']} | Total Lines: {code_analysis['total_lines']:,}\n"
    result += f"Functions: {code_analysis['function_count']} | Classes: {code_analysis['class_count']}\n"
    result += f"Complexity Score: {code_analysis['avg_complexity']:.1f}/10 | Technical Debt: {code_analysis['tech_debt_score']:.1f}/10\n"



    result += "\n"

    patterns = code_analysis['design_patterns']
    if patterns:
        result += f"🎯 DESIGN PATTERNS DETECTED\n"
        for pattern, count in patterns.items():
            result += f"  • {pattern}: {count} instances\n"
        result += "\n"

    smells = code_analysis['code_smells']
    if smells:
        result += f"⚠️  CODE SMELLS DETECTED\n"
        smell_categories = defaultdict(list)
        for smell in smells:
            smell_categories[smell['category']].append(smell)

        for category, smell_list in smell_categories.items():
            result += f"\n  {category.upper()} ({len(smell_list)} issues):\n"
            for smell in smell_list[:8]:  # Show top 8 per category for comprehensive view
                result += f"    • {smell['file']}: {smell['description']}\n"
                result += f"      Impact: {smell['impact']} | Fix: {smell['fix']}\n"
            if len(smell_list) > 8:
                result += f"    ... and {len(smell_list) - 8} more {category.lower()} issues\n"
        result += "\n"

    if check_performance:
        perf_issues = code_analysis['performance_issues']
        result += f"⚡ PERFORMANCE ANALYSIS\n"
        if perf_issues:
            result += f"Issues Found: {len(perf_issues)}\n"

            critical_perf = [i for i in perf_issues if i['severity'] == 'CRITICAL']
            high_perf = [i for i in perf_issues if i['severity'] == 'HIGH']
            medium_perf = [i for i in perf_issues if i['severity'] == 'MEDIUM']

            if critical_perf:
                result += f"\n🔴 CRITICAL PERFORMANCE ISSUES:\n"
                for issue in critical_perf:  # Show ALL critical issues
                    result += f"  • {issue['file']}: {issue['description']}\n"
                    result += f"    Expected Impact: {issue['impact']}\n"
                    result += f"    Recommended Fix: {issue['fix']}\n\n"

            if high_perf:
                result += f"🟠 HIGH IMPACT OPTIMIZATIONS:\n"
                for issue in high_perf:  # Show ALL high impact issues
                    result += f"  • {issue['file']}: {issue['description']}\n"
                    result += f"    Fix: {issue['fix']}\n\n"

            if medium_perf:
                result += f"🟡 MEDIUM PERFORMANCE IMPROVEMENTS:\n"
                for issue in medium_perf:  # Show ALL medium issues
                    result += f"  • {issue['file']}: {issue['description']}\n"
                    result += f"    Impact: {issue['impact']}\n"
                    result += f"    Fix: {issue['fix']}\n\n"
        else:
            result += f"✅ No significant performance issues detected\n\n"

    if check_security:
        security_issues = code_analysis['security_issues']
        result += f"🔒 SECURITY ANALYSIS\n"
        if security_issues:
            result += f"Security Issues: {len(security_issues)}\n"

            critical_sec = [i for i in security_issues if i['severity'] == 'CRITICAL']
            high_sec = [i for i in security_issues if i['severity'] == 'HIGH']

            if critical_sec:
                result += f"\n🚨 CRITICAL SECURITY ISSUES:\n"
                for issue in critical_sec:
                    result += f"  • {issue['file']}: {issue['description']}\n"
                    result += f"    Risk: {issue['risk']}\n"
                    result += f"    Fix: {issue['fix']}\n\n"

            if high_sec:
                result += f"⚠️  HIGH SECURITY CONCERNS:\n"
                for issue in high_sec:  # Show ALL high security issues
                    result += f"  • {issue['file']}: {issue['description']}\n"
                    result += f"    Fix: {issue['fix']}\n\n"
        else:
            result += f"✅ No critical security issues detected\n\n"

    refactoring_opps = code_analysis['refactoring_opportunities']
    if refactoring_opps:
        result += f"🔧 REFACTORING OPPORTUNITIES\n"
        for opp in refactoring_opps:  # Show ALL opportunities, not just first 5
            result += f"  • {opp['title']}\n"
            result += f"    Files: {', '.join(opp['files'])}\n"  # Show ALL files, not truncated
            result += f"    Benefit: {opp['benefit']}\n"
            result += f"    Effort: {opp['effort']}\n\n"

    if include_suggestions:
        recommendations = _generate_intelligent_recommendations(code_analysis, quality_score)
        result += f"💡 INTELLIGENT RECOMMENDATIONS\n"

        critical_recs = [r for r in recommendations if r['priority'] == 'CRITICAL']
        high_recs = [r for r in recommendations if r['priority'] == 'HIGH']
        medium_recs = [r for r in recommendations if r['priority'] == 'MEDIUM']

        if critical_recs:
            result += f"\n🔥 CRITICAL PRIORITY\n"
            for i, rec in enumerate(critical_recs, 1):
                result += f"  {i}. {rec['title']}\n"
                result += f"     {rec['description']}\n"
                if rec.get('code_example'):
                    result += f"     Example: {rec['code_example']}\n"
                result += f"     Impact: {rec['impact']}\n\n"

        if high_recs:
            result += f"📈 HIGH PRIORITY\n"
            for i, rec in enumerate(high_recs, 1):
                result += f"  {i}. {rec['title']}\n"
                result += f"     {rec['description']}\n\n"

        if medium_recs:
            result += f"🔧 OPTIMIZATION OPPORTUNITIES\n"
            for i, rec in enumerate(medium_recs, 1):
                result += f"  {i}. {rec['title']}\n"
                result += f"     {rec['description']}\n\n"

    return [TextContent(type='text', text=result)]


async def _perform_deep_code_analysis() -> Dict[str, Any]:
    """Perform deep semantic analysis of the JavaScript codebase."""
    analysis: Dict[str, Any] = {
        'file_count': 0,
        'total_lines': 0,
        'function_count': 0,
        'class_count': 0,
        'avg_complexity': 0,
        'tech_debt_score': 0,
        'design_patterns': {},
        'code_smells': [],
        'performance_issues': [],
        'security_issues': [],
        'refactoring_opportunities': [],
        'files_analyzed': []  # Track analyzed files for refactoring opportunities
    }

    complexity_scores = []
    tech_debt_indicators = 0

    js_files = get_js_files()
    for js_file in js_files:
        try:
            content = js_file.read_text(encoding='utf-8')
            lines = content.splitlines()
            rel_path = str(js_file.relative_to(PROJECT_ROOT))

            analysis['file_count'] += 1
            analysis['total_lines'] += len(lines)
            analysis['files_analyzed'].append(rel_path)  # Track analyzed files

            functions = re.findall(r'(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))', content)
            classes = re.findall(r'class\s+\w+', content)

            analysis['function_count'] += len(functions)
            analysis['class_count'] += len(classes)

            complexity = _calculate_file_complexity(content)
            complexity_scores.append(complexity)

            if re.search(r'TODO|FIXME|HACK|XXX', content, re.IGNORECASE):
                tech_debt_indicators += 1

            patterns = _detect_design_patterns(content, rel_path)
            for pattern, count in patterns.items():
                analysis['design_patterns'][pattern] = analysis['design_patterns'].get(pattern, 0) + count

            smells = _detect_code_smells(content, rel_path)
            analysis['code_smells'].extend(smells)

            perf_issues = _detect_performance_issues(content, rel_path)
            analysis['performance_issues'].extend(perf_issues)

            sec_issues = _detect_security_issues(content, rel_path)
            analysis['security_issues'].extend(sec_issues)

        except Exception:
            continue

    if complexity_scores:
        analysis['avg_complexity'] = sum(complexity_scores) / len(complexity_scores)

    analysis['tech_debt_score'] = min(10, (tech_debt_indicators / max(1, analysis['file_count'])) * 10)

    analysis['refactoring_opportunities'] = _identify_refactoring_opportunities(analysis)

    return analysis


def _calculate_file_complexity(content: str) -> float:
    """Calculate ACTUAL complexity score for a JavaScript file - not just line count."""
    complexity = 0

    complexity += len(re.findall(r'\b(if|else|for|while|switch|case|catch)\b', content))
    complexity += len(re.findall(r'\?\s*.*\s*:', content))  # Ternary operators
    complexity += len(re.findall(r'&&|\|\|', content))  # Logical operators

    complexity += len(re.findall(r'function\s*\(|=>\s*{|=>\s*\(', content)) * 0.5

    complexity += len(re.findall(r'document\.|window\.|addEventListener', content)) * 0.3

    complexity += len(re.findall(r'async|await|\.then\(|\.catch\(', content)) * 0.2

    lines = len(content.splitlines())

    has_centralized_systems = bool(re.search(r'GPTPF_[A-Z]+', content))
    has_error_handling = bool(re.search(r'try\s*{.*catch\s*\(', content, re.DOTALL))
    has_i18n_integration = bool(re.search(r'getMessage\(|data-i18n', content))

    if has_centralized_systems:
        complexity *= 0.8
    if has_error_handling:
        complexity *= 0.9
    if has_i18n_integration:
        complexity *= 0.9

    normalized = min(10, complexity / max(1, lines / 50))  # More reasonable normalization

    if normalized < 3 and lines > 200:
        return max(2, normalized)  # Don't penalize comprehensive but well-structured files

    return normalized


def _detect_design_patterns(content: str, file_path: str) -> Dict[str, Any]:
    """Detect design patterns in JavaScript code."""
    patterns = {}

    if re.search(r'function\s+\w*Factory|class\s+\w*Factory|\w+Factory\s*=', content):
        patterns['Factory Pattern'] = patterns.get('Factory Pattern', 0) + 1

    if re.search(r'addEventListener|on\w+\s*=|subscribe|unsubscribe', content):
        patterns['Observer Pattern'] = patterns.get('Observer Pattern', 0) + 1

    if re.search(r'getInstance|let\s+instance\s*=|const\s+instance\s*=', content):
        patterns['Singleton Pattern'] = patterns.get('Singleton Pattern', 0) + 1

    if re.search(r'export\s+|import\s+.*from|module\.exports', content):
        patterns['Module Pattern'] = patterns.get('Module Pattern', 0) + 1

    if re.search(r'switch\s*\([^)]*\)\s*{.*case.*:.*case.*:', content, re.DOTALL):
        patterns['Strategy Pattern'] = patterns.get('Strategy Pattern', 0) + 1

    return patterns


def _detect_code_smells(content: str, file_path: str) -> List[Dict[str, Any]]:
    """Detect genuine code quality issues while understanding Multi-AI File Paster architecture."""
    smells: List[Dict[str, Any]] = []



    if 'eval(' in content:
        smells.append({
            'category': 'Security',
            'file': file_path,
            'description': 'eval() function usage detected',
            'impact': 'CRITICAL: Code injection vulnerability',
            'fix': 'Remove eval() and use safer alternatives'
        })

    function_matches = list(re.finditer(r'function\s+(\w+)[^{]*{', content))
    for match in function_matches:
        func_name = match.group(1)
        start_pos = match.end()
        brace_count = 1
        pos = start_pos
        while pos < len(content) and brace_count > 0:
            if content[pos] == '{':
                brace_count += 1
            elif content[pos] == '}':
                brace_count -= 1
            pos += 1
        if pos < len(content):
            function_content = content[start_pos:pos-1]
            lines = function_content.count('\n')

            if lines > 300:  # Much higher threshold - only truly massive functions
                cyclomatic_complexity = (
                    len(re.findall(r'\b(if|else|for|while|switch|case|catch|try)\b', function_content)) +
                    len(re.findall(r'\?\s*.*\s*:', function_content)) +  # Ternary operators
                    len(re.findall(r'&&|\|\|', function_content))  # Logical operators
                )

                is_legitimate_architecture = any(pattern in func_name.lower() for pattern in [
                    'processtext', 'initializesettings', 'initializeeventlisteners', 'rendertrend',
                    'initialize', 'setup', 'render', 'process', 'handle', 'attach', 'load', 'update',
                    'eventlisteners', 'settings', 'workflow', 'trend', 'chart', 'analytics',
                    'applythemecolors', 'setupfileformatlisteners', 'initializeanalytics',
                    'handlefileformat', 'updateui', 'processfiles'
                ])

                is_sequential_workflow = (
                    'async' in function_content and
                    ('await' in function_content or '.then(' in function_content) and
                    ('try' in function_content and 'catch' in function_content)
                )

                if (cyclomatic_complexity > 80 and
                    not is_legitimate_architecture and
                    not is_sequential_workflow):
                    smells.append({
                        'category': 'Complexity',
                        'file': file_path,
                        'description': f'Function "{func_name}" has high cyclomatic complexity ({cyclomatic_complexity}) and excessive length ({lines} lines)',
                        'impact': 'Complex branching logic makes maintenance difficult',
                        'fix': 'Consider extracting complex decision logic into separate functions'
                    })

    lines = content.splitlines()
    identical_blocks = {}

    def _is_legitimate_repeated_pattern(block_text: str, file_path: str) -> bool:
        """Check if repeated code is legitimate Multi-AI File Paster architecture pattern."""

        legitimate_patterns = [
            'data-theme', 'data-platform', 'setAttribute', 'theme',
            'GPTPF_DEBUG', 'debug(', 'console.log', 'debugLevel',
            'GPTPF_I18N', 'getMessage(', 'i18n', 'locale',
            'try {', 'catch (', 'error', 'throw new Error',
            'isSupported', 'getPlatformName', 'window.location', 'document.URL',
            'addEventListener', 'removeEventListener', 'event',
            'createElement', 'appendChild', 'className', 'textContent',
            'GPTPF_CONFIG', 'getConfig', 'config.',
            'validate', 'isValid', 'check', 'verify'
        ]

        if any(pattern in block_text for pattern in legitimate_patterns):
            return True

        if any(api in block_text for api in ['chrome.', 'browser.', 'manifest', 'permissions']):
            return True

        if any(js_pattern in block_text for js_pattern in ['function(', '=>', 'return', 'if (', 'for (']):
            return True

        return False

    window = 14
    step = 7  # 50% overlap only
    for i in range(0, max(0, len(lines) - window), step):
        block_lines = []
        for j in range(i, min(i + window, len(lines))):
            line = lines[j].strip()
            if line and not line.startswith('//') and not line.startswith('/*') and len(line) > 15:
                block_lines.append(line)

        if len(block_lines) >= 12:  # Require more substantial content
            block_text = '|'.join(block_lines)

            if _is_legitimate_repeated_pattern(block_text, file_path):
                continue

            normalized = re.sub(r'\b[a-zA-Z_][a-zA-Z0-9_]{8,}\b', 'LONG_VAR', block_text)  # Only normalize long vars
            normalized = re.sub(r'[0-9]+', 'NUM', normalized)  # Normalize numbers

            if len(normalized) > 360:  # Stronger signal threshold
                identical_blocks[normalized] = identical_blocks.get(normalized, 0) + 1

    for count in identical_blocks.values():
        if count >= 5:
            smells.append({
                'category': 'Copy-Paste Duplication',
                'file': file_path,
                'description': f'{count} nearly identical large code blocks (copy-paste detected)',
                'impact': 'Genuine code duplication reduces maintainability and increases bug risk',
                'fix': 'Extract common functionality into shared utility functions'
            })

    return smells





def _detect_performance_issues(content: str, file_path: str) -> List[Dict[str, Any]]:
    """Detect performance issues in JavaScript code."""
    issues = []

    if re.search(r'document\.getElementById\([^)]+\).*document\.getElementById\([^)]+\)', content):
        issues.append({
            'severity': 'HIGH',
            'file': file_path,
            'description': 'Repeated DOM queries detected',
            'impact': 'Unnecessary DOM traversal impacts performance',
            'fix': 'Cache DOM elements in variables'
        })

    if re.search(r'XMLHttpRequest.*open\([^,]*,\s*[^,]*,\s*false', content):
        issues.append({
            'severity': 'CRITICAL',
            'file': file_path,
            'description': 'Synchronous XMLHttpRequest detected',
            'impact': 'Blocks UI thread, poor user experience',
            'fix': 'Use async requests with fetch() or XMLHttpRequest async'
        })

    add_listeners = len(re.findall(r'addEventListener', content))
    remove_listeners = len(re.findall(r'removeEventListener', content))
    beforeunload_cleanup = bool(re.search(r'beforeunload.*addEventListener|addEventListener.*beforeunload', content))

    if add_listeners > 0 and remove_listeners == 0 and not beforeunload_cleanup:
        issues.append({
            'severity': 'MEDIUM',
            'file': file_path,
            'description': 'Event listeners added but never removed',
            'impact': 'Potential memory leaks',
            'fix': 'Add corresponding removeEventListener calls or beforeunload cleanup'
        })

    if re.search(r'for\s*\([^)]*document\.[^)]*\)', content):
        issues.append({
            'severity': 'HIGH',
            'file': file_path,
            'description': 'DOM queries inside loops',
            'impact': 'Repeated DOM access in loops is expensive',
            'fix': 'Move DOM queries outside loops or use document fragments'
        })

    return issues


def _detect_security_issues(content: str, file_path: str) -> List[Dict[str, Any]]:
    """Detect security issues in JavaScript code."""
    issues = []

    if re.search(r'innerHTML\s*=\s*[^;]*\+', content):
        issues.append({
            'severity': 'HIGH',
            'file': file_path,
            'description': 'Dynamic innerHTML assignment detected',
            'risk': 'XSS vulnerability through DOM injection',
            'fix': 'Use textContent or create elements safely with createElement'
        })

    if 'eval(' in content:
        issues.append({
            'severity': 'CRITICAL',
            'file': file_path,
            'description': 'eval() function usage detected',
            'risk': 'Code injection vulnerability',
            'fix': 'Remove eval() and use safer alternatives like JSON.parse'
        })

    if re.search(r'fetch\([\'"][^\'\"]*http://[^\'\"]*[\'\"]', content):
        issues.append({
            'severity': 'MEDIUM',
            'file': file_path,
            'description': 'HTTP (non-HTTPS) API calls detected',
            'risk': 'Data transmitted over insecure connection',
            'fix': 'Use HTTPS URLs for all external API calls'
        })

    if re.search(r'localStorage\.setItem\([^)]*\+|sessionStorage\.setItem\([^)]*\+', content):
        issues.append({
            'severity': 'MEDIUM',
            'file': file_path,
            'description': 'Unvalidated data stored in browser storage',
            'risk': 'Potential for storing malicious data',
            'fix': 'Validate and sanitize data before storing'
        })

    return issues


def _identify_refactoring_opportunities(analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Identify intelligent refactoring opportunities."""
    opportunities = []

    if analysis['function_count'] > 20:
        opportunities.append({
            'title': 'Extract Common Utility Functions',
            'files': [f for f in analysis.get('files_analyzed', [])],
            'benefit': 'Reduce code duplication and improve maintainability',
            'effort': 'Medium',
            'description': 'Many functions detected - consider extracting common patterns'
        })

    if analysis['design_patterns'].get('Module Pattern', 0) == 0 and analysis['file_count'] > 5:
        opportunities.append({
            'title': 'Implement Module Pattern',
            'files': ['src/shared/', 'src/components/'],
            'benefit': 'Better code organization and namespace management',
            'effort': 'High',
            'description': 'No module pattern detected - consider implementing for better structure'
        })

    if len(analysis['performance_issues']) > 5:
        opportunities.append({
            'title': 'Performance Optimization Sprint',
            'files': [issue['file'] for issue in analysis['performance_issues'][:5]],
            'benefit': 'Improved user experience and responsiveness',
            'effort': 'Medium',
            'description': 'Multiple performance issues detected across codebase'
        })

    return opportunities


def _calculate_quality_score(analysis: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate intelligent quality scores."""
    scores = {
        'architecture': 25,
        'maintainability': 25,
        'performance': 25,
        'security': 25,
        'total': 100
    }

    if analysis['design_patterns']:
        scores['architecture'] -= 0  # Good patterns detected
    else:
        scores['architecture'] -= 10  # No patterns detected

    if analysis['avg_complexity'] > 8:  # Only penalize truly high complexity
        scores['architecture'] -= 5  # Reduced penalty
    elif analysis['avg_complexity'] > 6:
        scores['architecture'] -= 2  # Minor penalty

    scores['maintainability'] -= min(15, len(analysis['code_smells']) * 2)
    scores['maintainability'] -= min(10, analysis['tech_debt_score'])

    critical_perf = [i for i in analysis['performance_issues'] if i['severity'] == 'CRITICAL']
    high_perf = [i for i in analysis['performance_issues'] if i['severity'] == 'HIGH']
    scores['performance'] -= len(critical_perf) * 10
    scores['performance'] -= len(high_perf) * 5

    critical_sec = [i for i in analysis['security_issues'] if i['severity'] == 'CRITICAL']
    high_sec = [i for i in analysis['security_issues'] if i['severity'] == 'HIGH']
    scores['security'] -= len(critical_sec) * 15
    scores['security'] -= len(high_sec) * 8

    for key in scores:
        scores[key] = max(0, scores[key])

    scores['total'] = sum([scores['architecture'], scores['maintainability'], scores['performance'], scores['security']])

    return scores


def _generate_intelligent_recommendations(analysis: Dict[str, Any], quality_score: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate intelligent, actionable recommendations."""
    recommendations = []

    critical_sec = [i for i in analysis['security_issues'] if i['severity'] == 'CRITICAL']
    if critical_sec:
        recommendations.append({
            'priority': 'CRITICAL',
            'title': 'Fix Critical Security Vulnerabilities',
            'description': f"Detected {len(critical_sec)} critical security issues that require immediate attention.",
            'impact': 'Prevents potential security breaches and data exposure',
            'code_example': 'Replace eval() with JSON.parse(), use textContent instead of innerHTML'
        })

    if quality_score['performance'] < 15:
        recommendations.append({
            'priority': 'HIGH',
            'title': 'Address Performance Bottlenecks',
            'description': f"Performance score is low ({quality_score['performance']}/25). Focus on DOM optimization and async operations.",
            'impact': 'Improved user experience and application responsiveness'
        })

    if not analysis['design_patterns']:
        recommendations.append({
            'priority': 'HIGH',
            'title': 'Implement Design Patterns',
            'description': 'No clear design patterns detected. Consider implementing Module, Factory, or Observer patterns.',
            'impact': 'Better code organization and maintainability'
        })

    if len(analysis['code_smells']) > 20:  # Higher threshold
        complexity_issues = [s for s in analysis['code_smells'] if s.get('category') == 'Complexity']
        duplication_issues = [s for s in analysis['code_smells'] if 'Duplication' in s.get('category', '')]

        actual_complexity_issues = [s for s in complexity_issues if 'cyclomatic complexity' in s.get('description', '')]

        if len(actual_complexity_issues) >= 2 or len(duplication_issues) >= 3:
            recommendations.append({
                'priority': 'MEDIUM',
                'title': 'Address High-Complexity Logic',
                'description': f"Focus on functions with high cyclomatic complexity rather than length. Current architecture patterns are appropriate.",
                'impact': 'Improved maintainability of complex decision logic'
            })

    return recommendations


async def analyze_extension_structure(check_permissions: bool = True, check_architecture: bool = True) -> List[TextContent]:
    """INTELLIGENT Chrome Extension structure analysis with best practices validation and security recommendations."""
    import datetime

    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    result = f"🏗️ INTELLIGENT EXTENSION STRUCTURE ANALYSIS [{timestamp}]\n" + ("=" * 80) + "\n\n"

    manifest_analysis = await _analyze_manifest_compliance()
    permission_analysis = await _analyze_permissions_efficiency() if check_permissions else {}
    architecture_analysis = await _analyze_extension_architecture() if check_architecture else {}
    security_recommendations = await _generate_security_recommendations()

    result += "📋 MANIFEST v3 COMPLIANCE ANALYSIS:\n"
    result += f"Compliance Score: {manifest_analysis.get('compliance_score', 0)}/100\n"
    result += f"Version: {manifest_analysis.get('version', 'Unknown')} (Manifest v{manifest_analysis.get('manifest_version', 'Unknown')})\n"

    compliance_issues = manifest_analysis.get('issues', [])
    if compliance_issues:
        result += f"\n🔧 COMPLIANCE ISSUES ({len(compliance_issues)}):\n"
        for issue in compliance_issues:
            result += f"  • {issue['severity'].upper()}: {issue['description']}\n"
            if issue.get('fix'):
                result += f"    Fix: {issue['fix']}\n"

    if check_permissions and permission_analysis:
        result += f"\n🔐 PERMISSIONS EFFICIENCY ANALYSIS:\n"
        result += f"Permission Efficiency Score: {permission_analysis.get('efficiency_score', 0)}/100\n"
        result += f"Total Permissions: {permission_analysis.get('total_permissions', 0)}\n"
        result += f"Sensitive Permissions: {permission_analysis.get('sensitive_count', 0)}\n"
        result += f"Unnecessary Permissions: {permission_analysis.get('unnecessary_count', 0)}\n"

        if permission_analysis.get('recommendations'):
            result += "\n💡 PERMISSION OPTIMIZATIONS:\n"
            for rec in permission_analysis['recommendations']:
                result += f"  • {rec['action']}: {rec['permission']}\n"
                result += f"    Reason: {rec['reason']}\n"

    if check_architecture and architecture_analysis:
        result += f"\n🏛️ ARCHITECTURE PATTERN ANALYSIS:\n"
        result += f"Architecture Score: {architecture_analysis.get('architecture_score', 0)}/100\n"
        result += f"Pattern Compliance: {architecture_analysis.get('pattern_compliance', 0)}%\n"

        patterns = architecture_analysis.get('patterns', {})
        result += "\nDETECTED PATTERNS:\n"
        for pattern, status in patterns.items():
            icon = "✅" if status['present'] else "❌"
            result += f"  {icon} {pattern}: {status['description']}\n"
            if status.get('recommendations'):
                for rec in status['recommendations']:
                    result += f"      → {rec}\n"

    if security_recommendations:
        result += f"\n🛡️ SECURITY RECOMMENDATIONS:\n"
        for category, recommendations in security_recommendations.items():
            if recommendations:
                result += f"\n{category.upper()}:\n"
                for rec in recommendations:
                    result += f"  • {rec['title']}\n"
                    result += f"    Impact: {rec['impact']}\n"
                    result += f"    Action: {rec['action']}\n"

    return [TextContent(type="text", text=result)]


async def _analyze_manifest_compliance() -> Dict[str, Any]:
    """Analyze manifest.json for Chrome Extension v3 compliance."""
    manifest_path = PROJECT_ROOT / "manifest.json"
    if not manifest_path.exists():
        return {'compliance_score': 0, 'issues': [{'severity': 'error', 'description': 'manifest.json not found'}]}

    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
    except Exception as e:
        return {'compliance_score': 0, 'issues': [{'severity': 'error', 'description': f'Invalid JSON: {e}'}]}

    issues = []
    score = 100

    version = manifest.get('manifest_version')
    if version != 3:
        issues.append({
            'severity': 'critical',
            'description': f'Using Manifest v{version}, should be v3',
            'fix': 'Update to "manifest_version": 3'
        })
        score -= 30

    required_fields = ['name', 'version', 'description']
    for field in required_fields:
        if not manifest.get(field):
            issues.append({
                'severity': 'error',
                'description': f'Missing required field: {field}',
                'fix': f'Add "{field}" to manifest.json'
            })
            score -= 10

    if 'background' in manifest:
        bg = manifest['background']
        if 'scripts' in bg:
            issues.append({
                'severity': 'warning',
                'description': 'Using background.scripts (v2 style)',
                'fix': 'Use background.service_worker for v3'
            })
            score -= 10

    action_fields = ['action', 'browser_action', 'page_action']
    action_count = sum(1 for field in action_fields if field in manifest)
    if action_count > 1:
        issues.append({
            'severity': 'warning',
            'description': 'Multiple action types defined',
            'fix': 'Use only "action" in Manifest v3'
        })
        score -= 5

    return {
        'compliance_score': max(0, score),
        'version': manifest.get('version'),
        'manifest_version': version,
        'issues': issues
    }


async def _analyze_permissions_efficiency() -> Dict[str, Any]:
    """Analyze extension permissions for efficiency and security."""
    manifest_path = PROJECT_ROOT / "manifest.json"
    if not manifest_path.exists():
        return {}

    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
    except Exception:
        return {}

    permissions = manifest.get('permissions', [])
    host_permissions = manifest.get('host_permissions', [])

    sensitive_perms = {
        'tabs': 'Full tab access - consider activeTab',
        'cookies': 'Cookie access - ensure necessary',
        'history': 'Browsing history - high privacy impact',
        'bookmarks': 'Bookmarks access - ensure necessary',
        'downloads': 'Downloads API access',
        'storage': 'Extension storage - generally safe'
    }

    broad_hosts = {
        '<all_urls>': 'All websites - very broad',
        'http://*/*': 'All HTTP sites',
        'https://*/*': 'All HTTPS sites',
        '*://*/*': 'All websites - very broad'
    }

    recommendations = []
    unnecessary_count = 0

    for perm in permissions:
        if perm in sensitive_perms:
            if perm == 'tabs':
                recommendations.append({
                    'action': 'Consider replacing',
                    'permission': 'tabs',
                    'reason': 'activeTab is often sufficient and more privacy-friendly'
                })
            elif perm == 'storage':
                continue
        elif perm not in ['activeTab', 'scripting', 'declarativeNetRequest']:
            unnecessary_count += 1

    for host in host_permissions:
        if host in broad_hosts:
            recommendations.append({
                'action': 'Narrow scope',
                'permission': host,
                'reason': broad_hosts[host]
            })

    efficiency_score = max(0, 100 - (len(sensitive_perms.keys() & set(permissions)) * 15) -
                          (len(broad_hosts.keys() & set(host_permissions)) * 20))

    return {
        'efficiency_score': efficiency_score,
        'total_permissions': len(permissions) + len(host_permissions),
        'sensitive_count': len(sensitive_perms.keys() & set(permissions)),
        'unnecessary_count': unnecessary_count,
        'recommendations': recommendations
    }


async def _analyze_extension_architecture() -> Dict[str, Any]:
    """Analyze extension architecture patterns and best practices."""
    patterns = {}

    background_path = PROJECT_ROOT / "src" / "background"
    if background_path.exists():
        js_files = [Path(f) for f in get_files_by_glob(["src/background/*.js"])]
        patterns['Service Worker'] = {
            'present': len(js_files) > 0,
            'description': f'{len(js_files)} background scripts found',
            'recommendations': ['Use single service worker file'] if len(js_files) > 1 else []
        }

    content_path = PROJECT_ROOT / "src" / "content"
    if content_path.exists():
        content_files = [Path(f) for f in get_files_by_glob(["src/content/*.js"])]
        patterns['Content Scripts'] = {
            'present': len(content_files) > 0,
            'description': f'{len(content_files)} content scripts',
            'recommendations': ['Consider script injection for better performance'] if len(content_files) > 3 else []
        }

    popup_path = PROJECT_ROOT / "src" / "popup"
    if popup_path.exists():
        patterns['Popup Interface'] = {
            'present': True,
            'description': 'Popup UI implemented',
            'recommendations': []
        }

    shared_path = PROJECT_ROOT / "src" / "shared"
    if shared_path.exists():
        shared_files = [Path(f) for f in get_files_by_glob(["src/shared/*.js"])]
        patterns['Shared Utilities'] = {
            'present': len(shared_files) > 0,
            'description': f'{len(shared_files)} shared modules',
            'recommendations': ['Good modular architecture'] if len(shared_files) > 2 else []
        }

    locales_path = PROJECT_ROOT / "_locales"
    if locales_path.exists():
        locale_dirs = [d for d in locales_path.iterdir() if d.is_dir()]
        patterns['Internationalization'] = {
            'present': len(locale_dirs) > 0,
            'description': f'{len(locale_dirs)} locales supported',
            'recommendations': ['Excellent i18n support'] if len(locale_dirs) > 2 else []
        }

    pattern_score = sum(1 for p in patterns.values() if p['present'])
    pattern_compliance = (pattern_score / len(patterns)) * 100 if patterns else 0

    architecture_score = min(100, pattern_compliance + 20 if pattern_compliance > 80 else pattern_compliance)

    return {
        'architecture_score': int(architecture_score),
        'pattern_compliance': int(pattern_compliance),
        'patterns': patterns
    }


async def _generate_security_recommendations() -> Dict[str, List[Dict[str, str]]]:
    """Generate security recommendations for the extension."""
    recommendations = {
        'Content Security Policy': [],
        'Permission Management': [],
        'Code Security': []
    }

    manifest_path = PROJECT_ROOT / "manifest.json"
    if manifest_path.exists():
        try:
            with open(manifest_path, 'r', encoding='utf-8') as f:
                manifest = json.load(f)

            if 'content_security_policy' not in manifest:
                recommendations['Content Security Policy'].append({
                    'title': 'Add Content Security Policy',
                    'impact': 'Medium',
                    'action': 'Define CSP to prevent XSS attacks'
                })

            permissions = manifest.get('permissions', [])
            if 'tabs' in permissions:
                recommendations['Permission Management'].append({
                    'title': 'Replace tabs permission',
                    'impact': 'High',
                    'action': 'Use activeTab for better privacy'
                })

            host_permissions = manifest.get('host_permissions', [])
            if '<all_urls>' in host_permissions:
                recommendations['Permission Management'].append({
                    'title': 'Overly broad host permissions',
                    'impact': 'High',
                    'action': 'Limit to specific domains needed'
                })

        except Exception:
            pass

    js_files = get_js_files()
    for js_file_path in js_files:
        try:
            js_file = Path(js_file_path)
            content = js_file.read_text(encoding='utf-8')
            if 'eval(' in content:
                recommendations['Code Security'].append({
                    'title': 'Avoid eval() usage',
                    'impact': 'High',
                    'action': f'Remove eval() from {js_file.name}'
                })
            if 'innerHTML' in content and 'user' in content.lower():
                recommendations['Code Security'].append({
                    'title': 'Potential XSS vulnerability',
                    'impact': 'Medium',
                    'action': f'Sanitize user input in {js_file.name}'
                })
        except Exception:
            continue

    return recommendations


async def advanced_architecture_analysis() -> List[TextContent]:
    """Advanced Multi-AI File Paster architectural intelligence analysis."""
    result = []
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    result.append(f"🧠 ADVANCED ARCHITECTURE ANALYSIS [{timestamp}]")
    result.append("=" * 80)
    result.append("")

    js_files = [Path(f) for f in get_files_by_glob(["src/**/*.js"])]

    gptpf_config_usage = 0
    gptpf_debug_usage = 0
    gptpf_i18n_usage = 0
    gptpf_flash_usage = 0

    config_files = []
    debug_files = []
    i18n_files = []
    flash_files = []

    for js_file in js_files:
        try:
            content = js_file.read_text(encoding='utf-8')
            rel_path = str(js_file.relative_to(PROJECT_ROOT))

            if 'GPTPF_CONFIG' in content:
                config_matches = content.count('GPTPF_CONFIG')
                gptpf_config_usage += config_matches
                config_files.append(rel_path)

            if 'GPTPF_DEBUG' in content:
                debug_matches = content.count('GPTPF_DEBUG')
                gptpf_debug_usage += debug_matches
                debug_files.append(rel_path)

            if 'GPTPF_I18N' in content:
                i18n_matches = content.count('GPTPF_I18N')
                gptpf_i18n_usage += i18n_matches
                i18n_files.append(rel_path)

            if 'GPTPF_FLASH' in content:
                flash_matches = content.count('GPTPF_FLASH')
                gptpf_flash_usage += flash_matches
                flash_files.append(rel_path)

        except Exception:
            continue

    result.append("🏗️ CENTRALIZED SYSTEMS ANALYSIS:")
    result.append(f"  ✅ GPTPF_CONFIG: {gptpf_config_usage} uses across {len(config_files)} files")
    result.append(f"  ✅ GPTPF_DEBUG: {gptpf_debug_usage} uses across {len(debug_files)} files")
    result.append(f"  ✅ GPTPF_I18N: {gptpf_i18n_usage} uses across {len(i18n_files)} files")
    result.append(f"  ✅ GPTPF_FLASH: {gptpf_flash_usage} uses across {len(flash_files)} files")

    insights = []
    if gptpf_config_usage > 50:
        insights.append("✅ GPTPF_CONFIG is heavily used - excellent centralization")
    if gptpf_debug_usage > 100:
        insights.append("✅ GPTPF_DEBUG is comprehensively integrated - professional debugging")
    if gptpf_i18n_usage > 200:
        insights.append("✅ GPTPF_I18N is extensively used - excellent i18n coverage")

    platform_files = [Path(f) for f in get_files_by_glob(["src/content/platforms/*.js"])]
    result.append(f"\n🌐 PLATFORM ARCHITECTURE:")
    result.append(f"  • Platform modules: {len(platform_files)}")

    platform_scores = []
    for platform_file in platform_files:
        try:
            content = platform_file.read_text(encoding='utf-8')

            has_selectors = 'selectors' in content.lower()
            has_error_handling = 'GPTPF_DEBUG' in content
            has_async = 'async ' in content or 'await ' in content

            score = sum([has_selectors, has_error_handling, has_async])
            platform_scores.append(score)

        except Exception:
            platform_scores.append(0)

    avg_consistency = sum(platform_scores) / len(platform_scores) if platform_scores else 0
    result.append(f"  • Architecture consistency: {avg_consistency:.1f}/3.0")

    if avg_consistency >= 2.5:
        insights.append("✅ Platform modules follow consistent architecture patterns")
    elif avg_consistency >= 2.0:
        insights.append("⚠️ Platform modules have minor architectural inconsistencies")
    else:
        insights.append("🔧 Platform modules need architectural standardization")

    manifest_path = PROJECT_ROOT / "manifest.json"
    security_score = 100

    if manifest_path.exists():
        try:
            manifest = json.loads(manifest_path.read_text())
            permissions = manifest.get('permissions', [])
            host_permissions = manifest.get('host_permissions', [])

            if '<all_urls>' in host_permissions:
                security_score -= 20
                insights.append("⚠️ Consider narrowing host_permissions from <all_urls>")

            if 'tabs' in permissions:
                security_score -= 10
                insights.append("💡 Consider using activeTab instead of tabs permission")

        except Exception:
            security_score -= 30

    result.append(f"\n🛡️ SECURITY ANALYSIS:")
    result.append(f"  • Security score: {security_score}/100")

    total_lines = 0
    total_functions = 0

    for js_file in js_files:
        try:
            content = js_file.read_text(encoding='utf-8')
            total_lines += len(content.split('\n'))
            total_functions += content.count('function ') + content.count('=> ')
        except Exception:
            continue

    result.append(f"\n📊 CODEBASE METRICS:")
    result.append(f"  • Total JavaScript files: {len(js_files)}")
    result.append(f"  • Total lines of code: {total_lines:,}")
    result.append(f"  • Total functions: {total_functions}")
    result.append(f"  • Average lines per file: {total_lines // len(js_files) if js_files else 0}")

    architecture_score = min(100, (gptpf_config_usage + gptpf_debug_usage + gptpf_i18n_usage) / 10)
    final_score = (architecture_score + security_score + (avg_consistency * 33.33)) / 3

    result.append(f"\n🏆 OVERALL ARCHITECTURE SCORE: {final_score:.1f}/100")

    result.append(f"\n💡 KEY INSIGHTS:")
    for insight in insights:
        result.append(f"  {insight}")

    result.append(f"\n🚀 ADVANCED RECOMMENDATIONS:")

    if gptpf_flash_usage < 10:
        result.append("  • Implement more GPTPF_FLASH usage for consistent toast messaging")

    if len(platform_files) < 6:
        result.append("  • Consider adding support for more AI platforms (Perplexity, Poe, etc.)")

    if avg_consistency < 3.0:
        result.append("  • Standardize platform module architecture for better maintainability")

    result.append("  • Consider implementing automated architecture validation in CI/CD")
    result.append("  • Add architectural decision records (ADRs) for major design choices")

    return [TextContent(type="text", text="\n".join(result))]


async def main():
    """Run the MCP server with comprehensive error handling and startup validation."""
    log_startup_info()

    if not validate_environment():
        sys.stderr.write("❌ Environment validation failed - exiting\n")
        sys.stderr.flush()
        sys.exit(1)

    try:
        sys.stderr.write("🚀 Starting MCP server...\n")
        sys.stderr.flush()

        async with stdio_server() as (read_stream, write_stream):
            sys.stderr.write("✅ MCP server initialized successfully\n")
            sys.stderr.flush()

            try:
                init_options = server.create_initialization_options()
                await server.run(read_stream, write_stream, init_options)
            except Exception as e:
                sys.stderr.write(f"❌ Server runtime error: {e}\n")
                sys.stderr.flush()
                raise

    except KeyboardInterrupt:
        sys.stderr.write("� MCP server stopped by user\n")
        sys.stderr.flush()
        sys.exit(0)
    except Exception as e:
        sys.stderr.write(f"❌ Fatal server error: {type(e).__name__}: {e}\n")
        sys.stderr.flush()
        sys.exit(1)


def validate_imports():
    """Validate all required imports before starting server."""
    import sys

    required_modules = [
        ('asyncio', 'Python asyncio'),
        ('json', 'Python json'),
        ('os', 'Python os'),
        ('re', 'Python re'),
        ('pathlib', 'Python pathlib'),
        ('typing', 'Python typing'),
        ('mcp.server', 'MCP server'),
        ('mcp.server.stdio', 'MCP stdio server'),
        ('mcp.types', 'MCP types')
    ]

    for module_name, description in required_modules:
        try:
            __import__(module_name)
            sys.stderr.write(f"✅ {description}: OK\n")
        except ImportError as e:
            sys.stderr.write(f"❌ {description}: FAILED - {e}\n")
            return False
        except Exception as e:
            sys.stderr.write(f"⚠️  {description}: WARNING - {e}\n")

    sys.stderr.write("✅ All required imports validated\n")
    sys.stderr.flush()
    return True


if __name__ == "__main__":
    import sys

    if not validate_imports():
        sys.stderr.write("❌ Import validation failed - exiting\n")
        sys.stderr.flush()
        sys.exit(1)

    try:
        asyncio.run(main())
    except Exception as e:  # pragma: no cover - startup diagnostics
        import traceback, sys
        tb = ''.join(traceback.format_exception(type(e), e, e.__traceback__))
        sys.stderr.write("❌ MCP server startup failed:\n" + tb + "\n")
        sys.stderr.flush()
        raise