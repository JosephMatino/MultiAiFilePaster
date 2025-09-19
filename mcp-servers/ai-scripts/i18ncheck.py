#!/usr/bin/env python3
# pyright: reportUnknownVariableType=none, reportUnknownMemberType=none, reportUnknownArgumentType=none
"""
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: ai-scripts/i18ncheck.py
 * FUNCTION: i18n analysis and coverage tool for AI development assistance
 * ARCHITECTURE: Python pathlib, JSON processing, regex analysis
 * SECURITY: Local processing only, no data transmission, privacy-first design
 * PERFORMANCE: Optimized pattern matching, efficient file scanning
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

import json
import os
import re
from pathlib import Path
from typing import Dict, Any, Set, List

def analyze_i18n(project_root: Path, check_duplicates: bool = True) -> str:
    """Analyze internationalization files for coverage and issues."""
    locales_dir: Path = project_root / "_locales"
    
    if not locales_dir.exists():
        return "❌ No _locales directory found"
    
    locales: Dict[str, Dict[str, Dict[str, Any]]] = {}
    
    for locale_dir in locales_dir.iterdir():
        if locale_dir.is_dir():
            messages_file = locale_dir / "messages.json"
            if messages_file.exists():
                try:
                    with open(messages_file, 'r', encoding='utf-8') as f:
                        data_obj: Any = json.load(f)
                        if isinstance(data_obj, dict):
                            typed_messages: Dict[str, Dict[str, Any]] = {}
                            for item in list(data_obj.items()):
                                k_item, v_item = item[0], item[1]
                                if isinstance(k_item, str) and isinstance(v_item, dict):
                                    typed_messages[k_item] = dict(v_item)
                            locales[locale_dir.name] = typed_messages
                except json.JSONDecodeError:
                    continue
    
    if not locales:
        return "❌ No valid locale files found"
    
    result = "🌍 i18n Analysis Results\n\n"
    result += f"📊 Found {len(locales)} locales: {', '.join(locales.keys())}\n\n"
    
    all_keys: Set[str] = set()
    for locale_messages in locales.values():
        all_keys.update(list(locale_messages.keys()))
    
    missing_keys: Dict[str, Set[str]] = {}
    for locale, messages in locales.items():
        missing: Set[str] = all_keys - set(messages.keys())
        if missing:
            missing_keys[locale] = missing
    
    if missing_keys:
        result += f"⚠️  Missing Keys:\n"
        for locale, keys in missing_keys.items():
            result += f"  • {locale}: {len(keys)} missing keys\n"
            for key in sorted(keys)[:5]:
                result += f"    - {key}\n"
            if len(keys) > 5:
                result += f"    ... and {len(keys) - 5} more\n"
        result += "\n"
    
    duplicates: Dict[str, List[str]] = {}
    if check_duplicates:
        for locale, messages in locales.items():
            value_counts: Dict[str, List[str]] = {}
            for key, msg_obj in messages.items():
                raw_val: Any = msg_obj.get("message")
                value: str = raw_val if isinstance(raw_val, str) else ("" if raw_val is None else str(raw_val))
                if value:
                    if value in value_counts:
                        value_counts[value].append(key)
                    else:
                        value_counts[value] = [key]
            duplicates = {v: keys for v, keys in value_counts.items() if len(keys) > 1}
            if duplicates:
                result += f"🔄 Duplicate values in {locale}:\n"
                for value, keys in list(duplicates.items())[:3]:
                    result += f"  • \"{value[:50]}...\" used in: {', '.join(keys)}\n"
                if len(duplicates) > 3:
                    result += f"  ... and {len(duplicates) - 3} more duplicates\n"
                result += "\n"
    
    if not missing_keys and not duplicates:
        result += "✅ No issues found in i18n files"
    
    return result

def check_i18n_coverage(project_root: Path) -> str:
    """Check i18n coverage by scanning source files for usage."""
    en_messages = project_root / "_locales" / "en" / "messages.json"
    if not en_messages.exists():
        return "❌ _locales/en/messages.json not found"

    try:
        with open(en_messages, 'r', encoding='utf-8') as f:
            en = json.load(f)
        defined = set(en.keys())

        used: Set[str] = set()
        for root, _, files in os.walk(project_root / 'src'):
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
        
        report: List[str] = [
            "🔍 i18n Coverage Report",
            f"Used keys: {len(used)}",
            f"Defined keys: {len(defined)}",
            f"Missing: {len(missing)}",
        ]
        if missing:
            report.append("Missing keys:")
            report.extend(["  - " + k for k in missing[:20]])
            if len(missing) > 20:
                report.append(f"  ... and {len(missing) - 20} more")
        report.append(f"Unused: {len(unused)}")
        if unused:
            report.append("Unused keys:")
            report.extend(["  - " + k for k in unused[:20]])
            if len(unused) > 20:
                report.append(f"  ... and {len(unused) - 20} more")
        return "\n".join(report)
    except Exception as e:
        return f"❌ i18n coverage failed: {e}"

if __name__ == "__main__":
    import sys
    # Determine project root from first non-flag argument (if provided)
    project_root = Path.cwd()
    non_flag_args = [a for a in sys.argv[1:] if not a.startswith('-')]
    if non_flag_args:
        project_root = Path(non_flag_args[0])

    if "--coverage" in sys.argv:
        print(check_i18n_coverage(project_root))
    else:
        check_duplicates = "--no-duplicates" not in sys.argv
        print(analyze_i18n(project_root, check_duplicates))
