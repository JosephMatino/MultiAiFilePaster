#!/usr/bin/env python3
# pyright: reportUnknownVariableType=none, reportUnknownMemberType=none, reportUnknownArgumentType=none
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
from pathlib import Path
from typing import Any, Dict, List, Tuple, Optional, cast

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Resource, Tool, TextContent

# Initialize the MCP server
server = Server("multi-ai-assistant")

# Project root directory
PROJECT_ROOT = Path(__file__).parent.parent


@server.list_resources()
async def handle_list_resources() -> List[Resource]:
    """List available project resources with auto-discovery."""
    resources: List[Resource] = []
    
    # Auto-discover all project files
    project_files: List[str] = []
    
    # Core extension files
    core_patterns = [
        "manifest.json",
        "src/**/*.js",
        "src/**/*.html", 
        "src/**/*.css",
        "_locales/**/*.json",
        "docs/**/*.md",
        "*.md"
    ]
    
    import glob
    for pattern in core_patterns:
        files = glob.glob(str(PROJECT_ROOT / pattern), recursive=True)
        project_files.extend(files)
    
    # Convert to resources with better mime types
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
    """Read and return resource content.

    The mcp server decorator supplies an AnyUrl; we avoid explicit typing to
    stay compatible with the library's runtime validation while preventing
    type mismatch warnings from local analysis tools.
    """
    uri_str = str(uri)
    if not uri_str.startswith("file://"):
        raise ValueError(f"Unsupported URI scheme: {uri_str}")

    file_path = Path(uri_str[7:])  # strip scheme
    if not file_path.exists():
        raise FileNotFoundError(f"Resource not found: {file_path}")
    try:
        return file_path.read_text(encoding="utf-8")
    except Exception as e:  # pragma: no cover - defensive
        raise RuntimeError(f"Failed to read resource: {e}")


@server.list_tools()
async def handle_list_tools() -> List[Tool]:
    """List available development tools."""
    return [
        Tool(
            name="analyze_project",
            description="Comprehensive analysis of entire project structure, quality, and patterns",
            inputSchema={
                "type": "object",
                "properties": {
                    "include_metrics": {
                        "type": "boolean",
                        "description": "Include detailed code metrics and statistics",
                        "default": True
                    },
                    "check_architecture": {
                        "type": "boolean", 
                        "description": "Analyze project architecture and patterns",
                        "default": True
                    }
                }
            }
        ),
        Tool(
            name="brand_assets",
            description="List core brand assets (logos/icons) with file paths and mime types",
            inputSchema={
                "type": "object",
                "properties": {},
                "required": []
            }
        ),
        Tool(
            name="validate_manifest",
            description="Validate Chrome Extension manifest.json structure and permissions",
            inputSchema={
                "type": "object",
                "properties": {},
                "required": []
            }
        ),
        Tool(
            name="i18n_coverage",
            description="Report i18n used/defined/missing/unused counts (uses Node checker when available)",
            inputSchema={
                "type": "object",
                "properties": {},
                "required": []
            }
        ),
        Tool(
            name="analyze_i18n",
            description="Analyze internationalization files for duplicates, missing keys, and consistency",
            inputSchema={
                "type": "object",
                "properties": {
                    "check_duplicates": {
                        "type": "boolean",
                        "description": "Check for duplicate message values",
                        "default": True
                    }
                }
            }
        ),
        Tool(
            name="analyze_css",
            description="Analyze CSS files for design consistency, duplicates, and optimization opportunities",
            inputSchema={
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "Path to CSS file to analyze (relative to project root)"
                    }
                },
                "required": ["file_path"]
            }
        ),
        Tool(
            name="check_hardcoded_strings",
            description="Find hardcoded strings that should be moved to i18n files",
            inputSchema={
                "type": "object",
                "properties": {
                    "file_patterns": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "File patterns to search (e.g., ['src/**/*.js', 'src/**/*.html'])",
                        "default": ["src/**/*.js", "src/**/*.html"]
                    }
                }
            }
        ),
        Tool(
            name="platform_analysis",
            description="Analyze platform-specific code organization and suggest improvements",
            inputSchema={
                "type": "object",
                "properties": {},
                "required": []
            }
        ),
        Tool(
            name="run_analysis_suite",
            description="Run AI development analysis scripts (project, i18n, coverage, or all)",
            inputSchema={
                "type": "object",
                "properties": {
                    "analysis_type": {
                        "type": "string",
                        "enum": ["project", "i18n", "coverage", "all"],
                        "description": "Type of analysis to run",
                        "default": "all"
                    }
                },
                "required": ["analysis_type"]
            }
        ),
        Tool(
            name="analyze_documentation",
            description="Analyze documentation files and check for internal vs public content separation",
            inputSchema={
                "type": "object",
                "properties": {
                    "check_separation": {
                        "type": "boolean",
                        "description": "Check for proper internal/public documentation separation",
                        "default": True
                    },
                    "update_needed": {
                        "type": "boolean",
                        "description": "Check if documentation needs updates based on recent code changes",
                        "default": True
                    }
                }
            }
        ),
        Tool(
            name="license_audit",
            description="Audit repository files for Hostwek Custom License header and report non-compliant files",
            inputSchema={
                "type": "object",
                "properties": {
                    "paths": {
                        "type": "array",
                        "items": { "type": "string" },
                        "description": "Optional glob patterns to limit the scan (default scans src, docs, hooks)",
                        "default": [
                            "src/**/*.js", "src/**/*.css", "src/**/*.html",
                            "docs/**/*.md", ".github/hooks/*", "mcp-servers/**/*.py"
                        ]
                    },
                    "header_window": {
                        "type": "integer",
                        "description": "Lines from top of file to search for header markers",
                        "default": 80
                    }
                }
            }
        )
    ]


@server.call_tool()
async def handle_call_tool(name: str, arguments: Dict[str, Any]) -> List[TextContent]:
    """Handle tool execution."""
    
    if name == "analyze_project":
        include_metrics = arguments.get("include_metrics", True)
        check_architecture = arguments.get("check_architecture", True)
        return await analyze_project(include_metrics, check_architecture)
    elif name == "brand_assets":
        return await brand_assets()
    elif name == "validate_manifest":
        return await validate_manifest()
    elif name == "i18n_coverage":
        return await i18n_coverage()
    elif name == "analyze_i18n":
        check_duplicates = arguments.get("check_duplicates", True)
        return await analyze_i18n(check_duplicates)
    elif name == "analyze_css":
        file_path = arguments["file_path"]
        return await analyze_css(file_path)
    elif name == "check_hardcoded_strings":
        file_patterns = arguments.get("file_patterns", ["src/**/*.js", "src/**/*.html"])
        return await check_hardcoded_strings(file_patterns)
    elif name == "platform_analysis":
        return await platform_analysis()
    elif name == "run_analysis_suite":
        analysis_type = arguments["analysis_type"]
        return await run_analysis_suite(analysis_type)
    elif name == "analyze_documentation":
        check_separation = arguments.get("check_separation", True)
        update_needed = arguments.get("update_needed", True)
        return await analyze_documentation(check_separation, update_needed)
    elif name == "license_audit":
        paths = arguments.get("paths")
        header_window = int(arguments.get("header_window", 80))
        return await license_audit(paths, header_window)
    else:
        raise ValueError(f"Unknown tool: {name}")


async def analyze_project(include_metrics: bool = True, check_architecture: bool = True) -> List[TextContent]:
    """Comprehensive project analysis covering all files and patterns."""
    import glob

    result = "🔍 COMPREHENSIVE PROJECT ANALYSIS\n" + ("=" * 50) + "\n\n"

    all_files: Dict[str, int] = {}
    file_types: Dict[str, List[str]] = {k: [] for k in ['JavaScript','CSS','HTML','JSON','Markdown','Images']}
    patterns: List[Tuple[str, str]] = [
        ("src/**/*.js", 'JavaScript'),
        ("src/**/*.css", 'CSS'),
        ("src/**/*.html", 'HTML'),
        ("**/*.json", 'JSON'),
        ("**/*.md", 'Markdown'),
        ("logo/*.png", 'Images')
    ]
    total_files = 0
    total_lines = 0
    for pattern, ptype in patterns:
        files = glob.glob(str(PROJECT_ROOT / pattern), recursive=True)
        file_types[ptype].extend(files)
        total_files += len(files)
        if ptype in ['JavaScript','CSS','HTML','JSON','Markdown']:
            for fp in files:
                try:
                    with open(fp, 'r', encoding='utf-8') as fh:
                        count = len(fh.readlines())
                        total_lines += count
                        all_files[os.path.relpath(fp, PROJECT_ROOT)] = count
                except Exception:
                    continue

    result += f"📊 PROJECT OVERVIEW\nTotal Files: {total_files}\nTotal Lines of Code: {total_lines:,}\n\n"

    result += "📁 FILE TYPE BREAKDOWN\n"
    for k, v in file_types.items():
        if v:
            result += f"  • {k}: {len(v)} files\n"
    result += "\n"

    if include_metrics:
        result += "📈 DETAILED METRICS\n"
        sorted_files = sorted(all_files.items(), key=lambda x: x[1], reverse=True)
        result += "🔥 Largest Files:\n"
        for fp, ln in sorted_files[:5]:
            result += f"  • {fp}: {ln:,} lines\n"
        result += "\n"
        platform_files = [f for f in file_types['JavaScript'] if 'platforms' in f]
        if platform_files:
            result += f"🌐 Platform Support: {len(platform_files)} platforms\n"
            for pf in platform_files:
                result += f"  • {os.path.basename(pf).replace('.js','')}\n"
            result += "\n"

    structure_score = 0
    checks: List[str] = []
    if check_architecture:
        result += "🏗️ ARCHITECTURE ANALYSIS\n"
        manifest_path = PROJECT_ROOT / 'manifest.json'
        if manifest_path.exists():
            structure_score += 20; checks.append("✅ manifest.json present")
        else:
            checks.append("❌ manifest.json missing")
        if any('background' in f for f in file_types['JavaScript']):
            structure_score += 15; checks.append("✅ Background script architecture")
        if any('content' in f for f in file_types['JavaScript']):
            structure_score += 15; checks.append("✅ Content script architecture")
        if any('popup' in f for f in file_types['HTML']):
            structure_score += 15; checks.append("✅ Popup interface present")
        locales_dir = PROJECT_ROOT / '_locales'
        if locales_dir.exists():
            structure_score += 20
            locale_count = len([d for d in locales_dir.iterdir() if d.is_dir()])
            checks.append(f"✅ i18n support ({locale_count} locales)")
        if any('shared' in f for f in file_types['JavaScript']):
            structure_score += 15; checks.append("✅ Shared utilities architecture")
        result += f"Architecture Score: {structure_score}/100\n\n"
        for c in checks: result += f"  {c}\n"
        result += "\n🎯 QUALITY INDICATORS\n"
        quality_checks: List[str] = []
        js_headers = 0
        for jsf in file_types['JavaScript']:
            try:
                with open(jsf,'r',encoding='utf-8') as fh:
                    part = fh.read(500)
                    if 'MULTI-AI FILE PASTER' in part and 'PRODUCTION RELEASE' in part:
                        js_headers += 1
            except Exception:
                continue
        if js_headers:
            pct = (js_headers/len(file_types['JavaScript']))*100 if file_types['JavaScript'] else 0
            quality_checks.append(f"📝 Professional headers: {pct:.0f}% coverage")
        if any('components' in f for f in file_types['JavaScript']):
            quality_checks.append("🧩 Component-based architecture")
        cfg_files = [f for f in file_types['JavaScript'] if 'config' in f.lower()]
        if cfg_files:
            quality_checks.append(f"⚙️ Configuration management ({len(cfg_files)} files)")
        for q in quality_checks: result += f"  {q}\n"
        result += "\n"

    result += "💡 RECOMMENDATIONS\n"
    recommendations: List[str] = []
    large_files = [f for f, ln in all_files.items() if ln > 1000]
    if large_files:
        recommendations.append("Consider breaking down large files: " + ', '.join(large_files[:3]))
    docs_files = len(file_types['Markdown'])
    if docs_files < 3:
        recommendations.append("Add more documentation (README, CONTRIBUTING, etc.)")
    if structure_score < 80:
        recommendations.append("Improve project structure to meet professional standards")
    for i, rec in enumerate(recommendations, 1):
        result += f"  {i}. {rec}\n"
    if not recommendations:
        result += "  ✨ Project structure looks excellent!\n"
    return [TextContent(type='text', text=result)]


async def validate_manifest() -> List[TextContent]:
    """Validate Chrome Extension manifest.json."""
    manifest_path = PROJECT_ROOT / "manifest.json"
    
    if not manifest_path.exists():
        return [TextContent(type="text", text="❌ manifest.json not found")]
    
    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
        
        issues = []
        
        # Required fields validation
        required_fields = ["manifest_version", "name", "version"]
        for field in required_fields:
            if field not in manifest:
                issues.append(f"❌ Missing required field: {field}")
        
        # Manifest V3 specific checks
        if manifest.get("manifest_version") == 3:
            if "background" in manifest and "scripts" in manifest["background"]:
                issues.append("⚠️  Manifest V3 should use 'service_worker' instead of 'scripts' in background")
        
        # Permission analysis
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
    for p in sorted(logo_dir.glob("*")):
        if p.is_file() and p.suffix.lower() in mime_map:
            entries.append(f"• {p.name}  —  {mime_map[p.suffix.lower()]}  —  {os.path.relpath(p, PROJECT_ROOT)}")

    if not entries:
        return [TextContent(type="text", text="⚠️ No logo files found in logo/")]

    # Prefer extension icons for branding: mfp_128.png (light), mfp_128_light.png (light), mfp_512chrome.png (store)
    result = "🏷️ Brand Assets (logo/)\n\n" + "\n".join(entries)
    return [TextContent(type="text", text=result)]


async def license_audit(paths: Optional[List[str]] = None, header_window: int = 80) -> List[TextContent]:
    """Audit repo for Hostwek Custom License header compliance.

    Only checks executable source code files that require license headers.
    Excludes documentation, HTML content, and configuration files.
    """
    import glob

    # Only check executable source code files, not documentation or content
    default_patterns = [
        "src/**/*.js", "src/**/*.css", ".github/hooks/*.js", "mcp-servers/**/*.py"
    ]
    patterns = paths if paths else default_patterns

    markers = [
        "MULTI-AI FILE PASTER",
        "HOSTWEK CUSTOM LICENSE", 
        "HOSTWEK LTD",
        "WEKTURBO DESIGNS",
        "Joseph Matino"
    ]

    candidates: List[str] = []
    for pattern in patterns:
        candidates.extend(glob.glob(str(PROJECT_ROOT / pattern), recursive=True))

    non_compliant: List[str] = []
    checked = 0
    for fp in candidates:
        # Skip binary assets and non-source files
        if fp.endswith(('.png', '.jpg', '.jpeg', '.svg', '.ico', '.md', '.html', '.json')):
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
        f"\nScope: JavaScript, CSS, Python source files only",
        f"Excluded: Markdown, HTML, JSON (documentation/content files)",
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
    """Run the Node-based check-i18n.js if available; otherwise do a basic Python scan."""
    checker = PROJECT_ROOT / ".github" / "hooks" / "check-i18n.js"
    en_messages = PROJECT_ROOT / "_locales" / "en" / "messages.json"
    if not en_messages.exists():
        return [TextContent(type="text", text="❌ _locales/en/messages.json not found")]

    # Prefer Node checker (authoritative output aligned with pre-commit)
    try:
        import subprocess
        if checker.exists():
            completed = subprocess.run(["node", str(checker)], cwd=str(PROJECT_ROOT), capture_output=True, text=True, timeout=20)
            out = completed.stdout.strip()
            err = completed.stderr.strip()
            text = out + ("\n\n" + err if err else "")
            return [TextContent(type="text", text=text or "(no output)")]
    except Exception:
        pass

    # Fallback basic coverage
    try:
        with open(en_messages, 'r', encoding='utf-8') as f:
            en = json.load(f)
        defined = set(en.keys())

        # Walk src for usage patterns similar to the checker
        used: set[str] = set()
        for root, _, files in os.walk(PROJECT_ROOT / 'src'):
            for fn in files:
                if fn.endswith(('.js', '.html', '.css')):
                    try:
                        txt = (Path(root) / fn).read_text(encoding='utf-8')
                    except Exception:
                        continue
                    for rx in [
                        r"data-i18n=[\"']([a-z0-9_\.\-]+)[\"']",
                        r"data-i18n-html=[\"']([a-z0-9_\.\-]+)[\"']",
                        r"data-i18n-placeholder=[\"']([a-z0-9_\.\-]+)[\"']",
                        r"data-i18n-title=[\"']([a-z0-9_\.\-]+)[\"']",
                        r"data-i18n-aria-label=[\"']([a-z0-9_\.\-]+)[\"']",
                        r"data-tip-i18n=[\"']([a-z0-9_\.\-]+)[\"']",
                        r"chrome\.i18n\.getMessage\(\s*[\"']([a-z0-9_\.\-]+)[\"']",
                    ]:
                        for m in re.finditer(rx, txt, re.IGNORECASE):
                            used.add(m.group(1))

        missing = sorted([k for k in used if k not in defined])
        unused = sorted([k for k in defined if k not in used])
        report = [
            "i18n coverage report (Python fallback)",
            f"Used keys: {len(used)}",
            f"Defined keys: {len(defined)}",
            f"Missing: {len(missing)}",
        ]
        if missing:
            report.extend(["  - " + k for k in missing[:50]])
        report.append(f"Unused: {len(unused)}")
        if unused:
            report.extend(["  - " + k for k in unused[:50]])
        return [TextContent(type="text", text="\n".join(report))]
    except Exception as e:
        return [TextContent(type="text", text=f"❌ i18n coverage failed: {e}")]


async def analyze_i18n(check_duplicates: bool = True) -> List[TextContent]:
    """Analyze internationalization files."""
    locales_dir = PROJECT_ROOT / "_locales"
    
    if not locales_dir.exists():
        return [TextContent(type="text", text="❌ No _locales directory found")]
    
    locales = {}
    
    # Load all locale files
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
    
    # Check for missing keys across locales
    all_keys = set()
    for locale_messages in locales.values():
        all_keys.update(locale_messages.keys())
    
    missing_keys = {}
    for locale, messages in locales.items():
        missing = all_keys - set(messages.keys())
        if missing:
            missing_keys[locale] = missing
    
    if missing_keys:
        result += f"⚠️  Missing Keys:\n"
        for locale, keys in missing_keys.items():
            result += f"  • {locale}: {len(keys)} missing keys\n"
            for key in sorted(keys)[:5]:  # Show first 5
                result += f"    - {key}\n"
            if len(keys) > 5:
                result += f"    ... and {len(keys) - 5} more\n"
        result += "\n"
    
    # Prepare duplicates mapping to avoid unbound variable warnings even if skipping duplicate check
    duplicates = {}

    # Check for duplicate values if requested
    if check_duplicates:
        for locale, messages in locales.items():
            value_counts = {}
            for key, msg_obj in messages.items():
                if isinstance(msg_obj, dict) and "message" in msg_obj:
                    value = msg_obj["message"]
                    if value in value_counts:
                        value_counts[value].append(key)
                    else:
                        value_counts[value] = [key]
            
            duplicates = {v: keys for v, keys in value_counts.items() if len(keys) > 1}
            if duplicates:
                result += f"🔄 Duplicate values in {locale}:\n"
                for value, keys in list(duplicates.items())[:3]:  # Show first 3
                    result += f"  • \"{value[:50]}...\" used in: {', '.join(keys)}\n"
                if len(duplicates) > 3:
                    result += f"  ... and {len(duplicates) - 3} more duplicates\n"
                result += "\n"
    
    if not missing_keys and not duplicates:
        result += "✅ No issues found in i18n files"
    
    return [TextContent(type="text", text=result)]


async def analyze_css(file_path: str) -> List[TextContent]:
    """Analyze CSS file for issues and improvements."""
    css_file = PROJECT_ROOT / file_path
    
    if not css_file.exists():
        return [TextContent(type="text", text=f"❌ CSS file not found: {file_path}")]
    
    try:
        content = css_file.read_text(encoding='utf-8')
        
        # Basic analysis
        lines = content.split('\n')
        total_lines = len(lines)
        non_empty_lines = len([line for line in lines if line.strip()])
        
        # Find potential issues
        issues = []
        
        # Check for hardcoded colors
        color_pattern = r'#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)'
        hardcoded_colors = re.findall(color_pattern, content)
        unique_colors = list(set(hardcoded_colors))
        
        if len(unique_colors) > 10:
            issues.append(f"⚠️  Many hardcoded colors ({len(unique_colors)}), consider design tokens")
        
        # Check for repeated values
        repeated_values = {}
        for match in re.finditer(r':\s*([^;]+);', content):
            value = match.group(1).strip()
            if value in repeated_values:
                repeated_values[value] += 1
            else:
                repeated_values[value] = 1
        
        common_repeated = {v: count for v, count in repeated_values.items() 
                          if count > 3 and len(v) > 5}
        
        result = f"🎨 CSS Analysis: {file_path}\n\n"
        result += f"📊 File Stats:\n"
        result += f"  • Total lines: {total_lines:,}\n"
        result += f"  • Non-empty lines: {non_empty_lines:,}\n"
        result += f"  • File size: {len(content):,} characters\n\n"
        
        if unique_colors:
            result += f"🎨 Colors found: {len(unique_colors)} unique colors\n"
            if len(unique_colors) <= 5:
                result += f"  • {', '.join(unique_colors[:5])}\n"
            result += "\n"
        
        if common_repeated:
            result += f"🔄 Frequently repeated values:\n"
            def _freq_key(item: Tuple[str, int]) -> int:
                return item[1]
            for value, count in sorted(common_repeated.items(), key=_freq_key, reverse=True)[:5]:
                result += f"  • \"{value[:30]}...\" appears {count} times\n"
            result += "\n"
        
        if issues:
            result += f"⚠️  Recommendations:\n"
            for issue in issues:
                result += f"  • {issue}\n"
        else:
            result += "✅ CSS looks well organized"
        
        return [TextContent(type="text", text=result)]
        
    except Exception as e:
        return [TextContent(type="text", text=f"❌ Error analyzing CSS: {e}")]


async def check_hardcoded_strings(file_patterns: List[str]) -> List[TextContent]:
    """Find hardcoded strings that should be in i18n files."""
    import glob
    
    hardcoded_strings = []
    
    for pattern in file_patterns:
        files = glob.glob(str(PROJECT_ROOT / pattern), recursive=True)
        
        for file_path in files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Find quoted strings that look like user-facing text
                string_patterns = [
                    r'"([^"]{10,})"',  # Double quoted strings > 10 chars
                    r"'([^']{10,})'",  # Single quoted strings > 10 chars
                ]
                
                for pattern in string_patterns:
                    matches = re.findall(pattern, content)
                    for match in matches:
                        # Filter out code-like strings
                        if not re.match(r'^[a-zA-Z_$][a-zA-Z0-9_$]*$', match) and \
                           not match.startswith('http') and \
                           not match.startswith('data:') and \
                           ' ' in match:  # Likely user-facing text
                            hardcoded_strings.append({
                                'file': os.path.relpath(file_path, PROJECT_ROOT),
                                'string': match[:50] + ('...' if len(match) > 50 else '')
                            })
                            
            except (UnicodeDecodeError, PermissionError):
                continue
    
    result = f"🔍 Hardcoded String Analysis\n\n"
    
    if hardcoded_strings:
        result += f"⚠️  Found {len(hardcoded_strings)} potential hardcoded strings:\n\n"
        
        # Group by file
        by_file = {}
        for item in hardcoded_strings:
            file = item['file']
            if file not in by_file:
                by_file[file] = []
            by_file[file].append(item['string'])
        
        for file, strings in list(by_file.items())[:5]:  # Show first 5 files
            result += f"📄 {file}:\n"
            for string in strings[:3]:  # Show first 3 strings per file
                result += f"  • \"{string}\"\n"
            if len(strings) > 3:
                result += f"  ... and {len(strings) - 3} more\n"
            result += "\n"
            
        if len(by_file) > 5:
            result += f"... and {len(by_file) - 5} more files\n\n"
            
        result += "💡 Consider moving these to _locales/en/messages.json"
    else:
        result += "✅ No obvious hardcoded strings found"
    
    return [TextContent(type="text", text=result)]


async def platform_analysis() -> List[TextContent]:
    """Analyze platform-specific code organization."""
    platforms_dir = PROJECT_ROOT / "src" / "content" / "platforms"

    if not platforms_dir.exists():
        return [TextContent(type="text", text="❌ Platforms directory not found")]

    platform_files = list(platforms_dir.glob("*.js"))

    result = f"🔧 Platform Analysis\n\n"
    result += f"📊 Found {len(platform_files)} platform files:\n"

    for platform_file in platform_files:
        platform_name = platform_file.stem
        try:
            content = platform_file.read_text(encoding='utf-8')
            lines = len(content.split('\n'))

            # Look for common patterns
            has_selector = 'querySelector' in content or 'querySelectorAll' in content
            has_event_listener = 'addEventListener' in content
            has_mutation_observer = 'MutationObserver' in content

            result += f"  • {platform_name}.js ({lines} lines)\n"
            if has_selector:
                result += f"    ✓ Uses DOM selectors\n"
            if has_event_listener:
                result += f"    ✓ Has event listeners\n"
            if has_mutation_observer:
                result += f"    ✓ Uses MutationObserver\n"
            result += "\n"

        except Exception:
            result += f"  • {platform_name}.js (error reading)\n"

    # Check for factory pattern
    factory_file = platforms_dir / "factory.js"
    if factory_file.exists():
        result += "✅ Factory pattern detected - good architecture\n"
    else:
        result += "💡 Consider adding a factory.js for platform instantiation\n"

    return [TextContent(type="text", text=result)]


async def run_analysis_suite(analysis_type: str) -> List[TextContent]:
    """Run Python analysis scripts directly using workspace environment."""
    root = PROJECT_ROOT / "mcp-servers" / "ai-scripts"
    
    # Detect environment and use appropriate Python executable
    import platform
    import shutil
    
    # Find Python executable in workspace venv
    python_exe = None
    if platform.system() == "Windows":
        # On Windows, try Scripts path first
        venv_py = PROJECT_ROOT / ".venv" / "Scripts" / "python.exe"
        if venv_py.exists():
            python_exe = str(venv_py)
    else:
        # On Unix/Linux/macOS, try bin path
        venv_py = PROJECT_ROOT / ".venv" / "bin" / "python"
        if venv_py.exists():
            python_exe = str(venv_py)
    
    # Environment detection for MCP running under WSL with Windows paths
    if not python_exe and shutil.which("python3"):
        python_exe = "python3"
    elif not python_exe and shutil.which("python"):
        python_exe = "python"
    
    if not python_exe:
        return [TextContent(type="text", text="❌ No Python executable found (workspace venv or system)")]

    async def run_script(script_path: Path, args: Optional[List[str]] = None) -> str:
        """Execute Python script with environment awareness."""
        if not script_path.exists():
            return f"❌ Script not found: {script_path.name}"
        
        cmd = [python_exe, str(script_path)]
        if args:
            cmd.extend(args)
            
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            cwd=str(PROJECT_ROOT),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()
        
        if proc.returncode != 0:
            error_output = stderr.decode("utf-8", errors="replace").strip()
            return f"❌ {script_path.name} failed (exit {proc.returncode}):\n{error_output}"
        
        return stdout.decode("utf-8", errors="replace").strip()

    outputs: List[str] = []
    analysis_type = analysis_type.lower()

    # Execute appropriate analysis based on type
    if analysis_type in ("project", "all"):
        result = await run_script(root / "projanalyze.py")
        outputs.append(f"📊 PROJECT ANALYSIS:\n{result}")

    if analysis_type in ("i18n", "coverage", "all"):
        if analysis_type == "coverage":
            result = await run_script(root / "i18ncheck.py", ["--coverage"])
            outputs.append(f"📈 I18N COVERAGE:\n{result}")
        else:
            result = await run_script(root / "i18ncheck.py")
            outputs.append(f"🌍 I18N ANALYSIS:\n{result}")

    return [TextContent(type="text", text="\n\n".join(outputs) if outputs else "❌ No analysis performed")]


async def analyze_documentation(check_separation: bool = True, update_needed: bool = True) -> List[TextContent]:
    """Analyze documentation files for internal/public separation and update status."""
    import glob

    result = "📚 Documentation Analysis\n" + ("=" * 50) + "\n\n"

    # Find all documentation files
    doc_patterns = ["*.md", "docs/**/*.md", ".github/**/*.md"]
    doc_files = []

    for pattern in doc_patterns:
        files = glob.glob(str(PROJECT_ROOT / pattern), recursive=True)
        doc_files.extend(files)

    if not doc_files:
        return [TextContent(type="text", text="❌ No documentation files found")]

    # Categorize documentation
    public_docs = []
    internal_docs = []
    mixed_docs = []

    internal_indicators = [
        "development", "internal", "workflow", "git.sh", "pre-commit",
        "technical", "architecture", "debugging", "testing"
    ]

    public_indicators = [
        "README", "user", "guide", "install", "usage", "features",
        "changelog", "license", "contributing"
    ]

    for doc_file in doc_files:
        rel_path = os.path.relpath(doc_file, PROJECT_ROOT)

        try:
            with open(doc_file, 'r', encoding='utf-8') as f:
                content = f.read().lower()

            has_internal = any(indicator in content or indicator in rel_path.lower()
                             for indicator in internal_indicators)
            has_public = any(indicator in content or indicator in rel_path.lower()
                           for indicator in public_indicators)

            if has_internal and has_public:
                mixed_docs.append(rel_path)
            elif has_internal:
                internal_docs.append(rel_path)
            else:
                public_docs.append(rel_path)

        except Exception:
            continue

    result += f"📊 Documentation Overview:\n"
    result += f"  • Total files: {len(doc_files)}\n"
    result += f"  • Public docs: {len(public_docs)}\n"
    result += f"  • Internal docs: {len(internal_docs)}\n"
    result += f"  • Mixed content: {len(mixed_docs)}\n\n"

    if check_separation and mixed_docs:
        result += "⚠️  Mixed Internal/Public Content Found:\n"
        for doc in mixed_docs[:5]:  # Show first 5
            result += f"  • {doc}\n"
        if len(mixed_docs) > 5:
            result += f"  ... and {len(mixed_docs) - 5} more\n"
        result += "\n💡 Consider separating internal content to docs/internal/\n\n"

    if update_needed:
        # Check for recent code changes that might need doc updates
        try:
            import subprocess
            # Get recent commits
            git_result = subprocess.run(
                ["git", "log", "--oneline", "--since=7 days ago"],
                cwd=str(PROJECT_ROOT),
                capture_output=True,
                text=True,
                timeout=10
            )

            recent_commits = git_result.stdout.strip().split('\n') if git_result.stdout.strip() else []

            if recent_commits:
                result += f"🔄 Recent Activity ({len(recent_commits)} commits in last 7 days):\n"
                for commit in recent_commits[:3]:
                    result += f"  • {commit}\n"
                if len(recent_commits) > 3:
                    result += f"  ... and {len(recent_commits) - 3} more\n"
                result += "\n💡 Consider updating documentation to reflect recent changes\n"
            else:
                result += "✅ No recent commits - documentation likely up to date\n"

        except Exception:
            result += "⚠️  Could not check recent git activity\n"

    if not mixed_docs and len(public_docs) > 0:
        result += "✅ Good documentation separation maintained\n"

    return [TextContent(type="text", text=result)]


def log_startup_info():
    """Log startup information for diagnostics."""
    import sys
    import platform

    sys.stderr.write("🔧 MCP Server Startup Diagnostics\n")
    sys.stderr.write(f"📁 Project root: {PROJECT_ROOT}\n")
    sys.stderr.write(f"🐍 Python: {sys.version}\n")
    sys.stderr.write(f"🖥️  Platform: {platform.system()} {platform.release()}\n")

    # Check if we're in WSL
    if platform.system() == "Linux":
        try:
            with open("/proc/version", "r") as f:
                version_info = f.read()
                if "microsoft" in version_info.lower() or "wsl" in version_info.lower():
                    sys.stderr.write("🔍 WSL environment detected\n")
        except:
            pass

    # Check MCP version
    try:
        import pkg_resources
        version = pkg_resources.get_distribution('mcp').version
        sys.stderr.write(f"📦 MCP version: {version}\n")
    except Exception:
        sys.stderr.write(f"📦 MCP version: 1.14.0 (from requirements.txt)\n")

    sys.stderr.write("🚀 Starting MCP server initialization...\n")
    sys.stderr.flush()


async def main():
    """Run the MCP server."""
    # Log startup information for diagnostics
    log_startup_info()

    try:
        async with stdio_server() as (read_stream, write_stream):
            # Explicit pre-initialization log to stderr (safe for protocol)
            try:
                if hasattr(server, "create_initialization_options"):
                    init_opts = server.create_initialization_options()
                else:  # pragma: no cover - unlikely path
                    raise RuntimeError("Server object missing create_initialization_options()")
            except Exception as e:  # pragma: no cover
                import sys, traceback
                sys.stderr.write("❌ Failed to build initialization options: %s\n" % e)
                sys.stderr.write(''.join(traceback.format_exc()))
                return

            import sys
            sys.stderr.write("✅ MCP server initialization options created\n")
            sys.stderr.write("🔄 Starting MCP server run loop...\n")
            sys.stderr.flush()

            await server.run(
                read_stream,
                write_stream,
                init_opts
            )
    except Exception as e:
        import sys, traceback
        sys.stderr.write("❌ MCP server failed during startup:\n")
        sys.stderr.write(f"Error: {e}\n")
        sys.stderr.write(''.join(traceback.format_exc()))
        sys.stderr.flush()
        raise


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

    # Validate imports first
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