#!/usr/bin/env python3
# pyright: reportUnknownVariableType=none, reportUnknownMemberType=none, reportUnknownArgumentType=none
"""
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: ai-scripts/projanalyze.py
 * FUNCTION: Chrome Extension project analysis for AI development assistance
 * ARCHITECTURE: Python pathlib, JSON processing, regex analysis
 * SECURITY: Local processing only, no data transmission, privacy-first design
 * PERFORMANCE: Optimized file discovery, efficient pattern analysis
 * COMPATIBILITY: Python 3.8+, cross-platform path handling
 *
 * DEVELOPMENT TEAM:
 * • LEAD DEVELOPER: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • SCRUM MASTER: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 *
 * ORGANIZATION: WEKTURBO DESIGNS - HOSTWEK LTD | https://hostwek.com/wekturbo
 * REPOSITORY: https://github.com/JosephMatino/MultiAiFilePaster
 * TECHNICAL SUPPORT: wekturbo@hostwek.com | Response time: 24-48 hours
 """

import os
import glob
from pathlib import Path
from typing import Dict, List, Tuple

def analyze_project(project_root: Path, include_metrics: bool = True, check_architecture: bool = True) -> str:
    """Comprehensive project analysis covering all files and patterns."""
    
    result = "🔍 COMPREHENSIVE PROJECT ANALYSIS\n" + ("=" * 50) + "\n\n"

    all_files: Dict[str, int] = {}
    file_types: Dict[str, List[str]] = {k: [] for k in ['JavaScript','CSS','HTML','JSON','Markdown','Images']}
    patterns = [
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
        files = glob.glob(str(project_root / pattern), recursive=True)
        file_types[ptype].extend(files)
        total_files += len(files)
        if ptype in ['JavaScript','CSS','HTML','JSON','Markdown']:
            for fp in files:
                try:
                    with open(fp, 'r', encoding='utf-8') as fh:
                        count = len(fh.readlines())
                        total_lines += count
                        all_files[os.path.relpath(fp, project_root)] = count
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
        sorted_files: List[Tuple[str, int]] = sorted(all_files.items(), key=lambda x: x[1], reverse=True)
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
    checks = []
    if check_architecture:
        result += "🏗️ ARCHITECTURE ANALYSIS\n"
        manifest_path = project_root / 'manifest.json'
        if manifest_path.exists():
            structure_score += 20
            checks.append("✅ manifest.json present")
        else:
            checks.append("❌ manifest.json missing")
        if any('background' in f for f in file_types['JavaScript']):
            structure_score += 15
            checks.append("✅ Background script architecture")
        if any('content' in f for f in file_types['JavaScript']):
            structure_score += 15
            checks.append("✅ Content script architecture")
        if any('popup' in f for f in file_types['HTML']):
            structure_score += 15
            checks.append("✅ Popup interface present")
        locales_dir = project_root / '_locales'
        if locales_dir.exists():
            structure_score += 20
            locale_count = len([d for d in locales_dir.iterdir() if d.is_dir()])
            checks.append(f"✅ i18n support ({locale_count} locales)")
        if any('shared' in f for f in file_types['JavaScript']):
            structure_score += 15
            checks.append("✅ Shared utilities architecture")
        result += f"Architecture Score: {structure_score}/100\n\n"
        for c in checks:
            result += f"  {c}\n"
        result += "\n🎯 QUALITY INDICATORS\n"
        quality_checks = []
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
        for q in quality_checks:
            result += f"  {q}\n"
        result += "\n"

    result += "💡 RECOMMENDATIONS\n"
    recommendations = []
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
    
    return result

if __name__ == "__main__":
    import sys
    project_root = Path.cwd()
    if len(sys.argv) > 1:
        project_root = Path(sys.argv[1])
    
    include_metrics = "--no-metrics" not in sys.argv
    check_architecture = "--no-architecture" not in sys.argv
    
    print(analyze_project(project_root, include_metrics, check_architecture))
