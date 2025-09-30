#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# Multi-AI File Paster - i18n Analysis Tool
# Comprehensive codebase-aware internationalization checker
# Author: Joseph Matino | Hostwek Ltd | WekTurbo Designs

import os
import json
import re
import sys
from typing import Set, Dict, List, Any

# Force UTF-8 encoding for Windows console
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

def find_commented_code() -> List[Dict[str, Any]]:
    """Find ALL inline comments in JavaScript and Python files excluding header signatures."""
    commented_files: List[Dict[str, Any]] = []

    # Scan JavaScript and Python files for ALL inline comments
    for root, dirs, files in os.walk('.'):
        # Skip node_modules, .git, and other irrelevant directories
        dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', 'dist', 'build']]

        for file in files:
            # Skip the check-i18n.py tool itself
            if file == 'check-i18n.py':
                continue

            if file.endswith(('.js', '.jsx', '.ts', '.tsx', '.py', '.html', '.htm')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Skip header comments (first 100 lines typically contain headers)
                    lines = content.split('\n')
                    content_start = 0
                    is_python = file_path.endswith('.py')
                    is_html = file_path.endswith(('.html', '.htm'))

                    for i, line in enumerate(lines):
                        if i > 100:  # Stop looking after 100 lines
                            break
                        # Look for end of header block
                        if '================================================================================' in line and i > 50:
                            content_start = i + 1
                            break
                        elif line.strip().startswith('*/') and i > 50:
                            content_start = i + 1
                            break
                        # For Python, look for end of docstring
                        elif is_python and '"""' in line and i > 10:
                            content_start = i + 1
                            break

                    # Find ALL inline comments in the actual content (excluding headers)
                    content_lines = lines[content_start:]
                    inline_comments: List[Dict[str, Any]] = []

                    for line_idx, line in enumerate(content_lines):
                        stripped = line.strip()
                        actual_line_num = content_start + line_idx + 1

                        # Skip shebang lines
                        if stripped.startswith('#!'):
                            continue

                        # Skip pyright/type checker comments
                        if is_python and (stripped.startswith('# pyright:') or stripped.startswith('# type:')):
                            continue

                        # Find ALL inline comments (// for JS, # for Python, <!-- --> for HTML)
                        if (not is_python and not is_html and stripped.startswith('//')):
                            inline_comments.append({
                                'line': actual_line_num,
                                'content': stripped,
                                'type': 'inline_comment'
                            })
                        elif (is_python and stripped.startswith('#')):
                            inline_comments.append({
                                'line': actual_line_num,
                                'content': stripped,
                                'type': 'inline_comment'
                            })
                        elif (is_html and '<!--' in stripped and '-->' in stripped):
                            inline_comments.append({
                                'line': actual_line_num,
                                'content': stripped,
                                'type': 'inline_comment'
                            })

                    if inline_comments:
                        commented_files.append({
                            'file': file_path.replace('\\', '/'),
                            'comments': inline_comments,
                            'count': len(inline_comments)
                        })

                except Exception:
                    continue

    return sorted(commented_files, key=lambda x: x['file'])

def remove_inline_comments(file_path: str, comments: List[Dict[str, Any]]) -> bool:
    """Remove inline comments from a file while preserving header signatures."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        # Sort comments by line number in reverse order to avoid index shifting
        sorted_comments = sorted(comments, key=lambda x: x['line'], reverse=True)

        # Remove comment lines
        for comment in sorted_comments:
            line_idx = comment['line'] - 1  # Convert to 0-based index
            if 0 <= line_idx < len(lines):
                del lines[line_idx]

        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)

        return True
    except Exception as e:
        print(f"Error removing comments from {file_path}: {e}")
        return False

def auto_fix_comments() -> int:
    """Automatically remove all inline comments from source files."""
    commented_files = find_commented_code()

    if not commented_files:
        print("No inline comments found. Nothing to fix.")
        return 0

    total_comments = sum(f['count'] for f in commented_files)
    print(f"\nAUTO-FIX MODE: Removing {total_comments} inline comments from {len(commented_files)} files...")

    fixed_count = 0
    failed_count = 0

    for file_info in commented_files:
        file_path = file_info['file']
        comments = file_info['comments']

        print(f"\nProcessing {file_path}...")
        print(f"  Removing {len(comments)} comments...")

        if remove_inline_comments(file_path, comments):
            fixed_count += 1
            print(f"  ✓ Successfully removed {len(comments)} comments")
        else:
            failed_count += 1
            print(f"  ✗ Failed to remove comments")

    print(f"\n{'='*50}")
    print(f"AUTO-FIX COMPLETE:")
    print(f"  Files fixed: {fixed_count}")
    print(f"  Files failed: {failed_count}")
    print(f"  Total comments removed: {total_comments}")
    print(f"{'='*50}")

    return 0 if failed_count == 0 else 1

def analyze_locale_configuration() -> Dict[str, Any]:
    """Analyze how locales are configured across all integration points."""
    # Automatically detect available locales from _locales directory
    available_locales: List[str] = []
    try:
        if os.path.exists('_locales'):
            available_locales = [d for d in os.listdir('_locales')
                               if os.path.isfile(os.path.join('_locales', d, 'messages.json'))]
    except Exception:
        available_locales = ['en']  # Fallback to English only

    config: Dict[str, Any] = {
        'expected_locales': sorted(available_locales),  # Use detected locales
        'manifest_web_accessible': [],
        'i18n_setlanguage_validation': [],
        'i18n_promise_preloading': [],
        'i18n_browser_detection': [],
        'i18n_saved_language_validation': [],
        'i18n_flag_mapping': [],
        'i18n_display_name_mapping': [],
        'i18n_abbreviation_mapping': [],
        'popup_language_options': [],
        'locale_files_exist': [],
        'missing_integrations': []
    }
    
    # Check manifest.json web_accessible_resources
    try:
        with open('manifest.json', 'r', encoding='utf-8') as f:
            manifest = json.load(f)
            resources = manifest.get('web_accessible_resources', [{}])[0].get('resources', [])
            for resource in resources:
                if resource.startswith('_locales/') and resource.endswith('/messages.json'):
                    locale = resource.split('/')[1]
                    config['manifest_web_accessible'].append(locale)
    except Exception:
        pass
    
    # Check i18n.js setLanguage validation
    try:
        with open('src/shared/i18n.js', 'r', encoding='utf-8') as f:
            content = f.read()
            # Find setLanguage validation pattern
            setlang_match = re.search(r'lang === \'en\'([^)]+)\)', content)
            if setlang_match:
                validation_part = setlang_match.group(1)
                for locale in config['expected_locales']:
                    if f"lang === '{locale}'" in validation_part or locale == 'en':
                        config['i18n_setlanguage_validation'].append(locale)

            # Find Promise.all loadMessages pattern
            promise_matches = re.findall(r'loadMessages\([\'"]([a-z]+)[\'"]', content)
            config['i18n_promise_preloading'] = list(set(promise_matches))

            # Find browser detection pattern
            browser_matches = re.findall(r'browserLang\.startsWith\([\'"]([a-z]+)[\'"]', content)
            config['i18n_browser_detection'] = list(set(browser_matches))

            # Find saved language validation pattern (CRITICAL FOR PERSISTENCE)
            saved_lang_match = re.search(r'savedLanguage === \'en\'([^)]+)\)', content)
            if saved_lang_match:
                saved_validation_part = saved_lang_match.group(1)
                for locale in config['expected_locales']:
                    if f"savedLanguage === '{locale}'" in saved_validation_part or locale == 'en':
                        config['i18n_saved_language_validation'].append(locale)

            # Find flag mapping pattern (CRITICAL FOR UI DISPLAY)
            # Look for the nested ternary pattern in flag className assignment
            flag_line = re.search(r'currentFlag\.className = currentLanguage === \'([a-z]+)\'.*?\'flag-icon uk-flag\'', content, re.DOTALL)
            if flag_line:
                # Extract all language codes from the nested ternary
                flag_matches = re.findall(r'currentLanguage === \'([a-z]+)\'', flag_line.group(0))
                config['i18n_flag_mapping'] = flag_matches
                if 'en' not in config['i18n_flag_mapping']:
                    config['i18n_flag_mapping'].append('en')  # English is default fallback
            else:
                config['i18n_flag_mapping'] = ['en']  # Fallback to English only

            # Find display name mapping pattern (CRITICAL FOR NOTIFICATIONS)
            # Look for the nested ternary pattern in displayName assignment
            display_name_line = re.search(r'const displayName = \(lang === \'([a-z]+)\'\).*?\'English\'', content, re.DOTALL)
            if display_name_line:
                # Extract all language codes from the nested ternary
                display_matches = re.findall(r'lang === \'([a-z]+)\'', display_name_line.group(0))
                config['i18n_display_name_mapping'] = display_matches
                if 'en' not in config['i18n_display_name_mapping']:
                    config['i18n_display_name_mapping'].append('en')  # English is default fallback
            else:
                config['i18n_display_name_mapping'] = ['en']  # Fallback to English only

            # Find abbreviation mapping pattern (CRITICAL FOR BUTTON DISPLAY)
            # Look for the nested ternary pattern in abbreviation fallback
            abbrev_line = re.search(r'currentLanguage === \'([a-z]+)\' \? \'[A-Z]+\'.*?\'EN\'', content, re.DOTALL)
            if abbrev_line:
                # Extract all language codes from the nested ternary
                abbrev_matches = re.findall(r'currentLanguage === \'([a-z]+)\'', abbrev_line.group(0))
                config['i18n_abbreviation_mapping'] = abbrev_matches
                if 'en' not in config['i18n_abbreviation_mapping']:
                    config['i18n_abbreviation_mapping'].append('en')  # English is default fallback
            else:
                config['i18n_abbreviation_mapping'] = ['en']  # Fallback to English only
    except Exception:
        pass
    
    # Check popup HTML language options
    try:
        with open('src/popup/index.html', 'r', encoding='utf-8') as f:
            content = f.read()
            popup_matches = re.findall(r'data-lang=[\'"]([a-z]+)[\'"]', content)
            config['popup_language_options'] = list(set(popup_matches))
    except Exception:
        pass
    
    # Check locale files exist
    try:
        if os.path.exists('_locales'):
            config['locale_files_exist'] = [d for d in os.listdir('_locales') 
                                          if os.path.isfile(os.path.join('_locales', d, 'messages.json'))]
    except Exception:
        pass
    
    # Find missing integrations
    for locale in config['expected_locales']:
        missing_in: List[str] = []
        if locale not in config['manifest_web_accessible']:
            missing_in.append('manifest.json web_accessible_resources')
        if locale not in config['i18n_setlanguage_validation']:
            missing_in.append('i18n.js setLanguage validation')
        if locale not in config['i18n_promise_preloading']:
            missing_in.append('i18n.js Promise.all preloading')
        if locale not in config['i18n_saved_language_validation']:
            missing_in.append('i18n.js saved language validation (PERSISTENCE ISSUE)')
        if locale not in config['i18n_flag_mapping']:
            missing_in.append('i18n.js flag mapping (UI DISPLAY ISSUE)')
        if locale not in config['i18n_display_name_mapping']:
            missing_in.append('i18n.js display name mapping (NOTIFICATION ISSUE)')
        if locale not in config['i18n_abbreviation_mapping']:
            missing_in.append('i18n.js abbreviation mapping (BUTTON DISPLAY ISSUE)')
        if locale not in config['popup_language_options']:
            missing_in.append('popup.html language options')
        if locale not in config['locale_files_exist']:
            missing_in.append('_locales/{}/messages.json file')

        if missing_in:
            config['missing_integrations'].append({
                'locale': locale,
                'missing_in': missing_in
            })
    
    return config

def analyze_i18n() -> Dict[str, Any]:
    """Comprehensive codebase-aware i18n analysis with intelligent pattern detection."""
    
    # Find used keys in codebase with ALL known patterns
    used_keys: Set[str] = set()
    
    # COMPLETE pattern list based on codebase analysis
    patterns: List[str] = [
        # Primary i18n API calls
        r'window\.GPTPF_I18N\.getMessage\([\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
        r'GPTPF_I18N\.getMessage\([\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
        r'getMessage\([\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
        
        # HTML data attributes (all variants) - FIXED PATTERN
        r'data-i18n=[\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
        r'data-i18n-html=[\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
        r'data-i18n-placeholder=[\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
        r'data-i18n-aria-label=[\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
        r'data-i18n-title=[\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
        r'data-i18n-alt=[\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
        r'data-tip-i18n=[\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
        
        # HTML attributes without quotes (common in templates)
        r'data-i18n=([a-zA-Z0-9_\.\-]+)[\s>]',
        r'data-i18n-html=([a-zA-Z0-9_\.\-]+)[\s>]',
        r'data-i18n-placeholder=([a-zA-Z0-9_\.\-]+)[\s>]',
        r'data-i18n-aria-label=([a-zA-Z0-9_\.\-]+)[\s>]',
        r'data-i18n-title=([a-zA-Z0-9_\.\-]+)[\s>]',
        
        # Debug system patterns
        r'GPTPF_DEBUG\?\.\w+\([\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
        r'GPTPF_DEBUG\.\w+\([\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
        
        # Chrome extension manifest patterns
        r'__MSG_([a-zA-Z0-9_\.\-]+)__',
        
        # Legacy/deprecated patterns (still need to track)
        r'chrome\.i18n\.getMessage\([\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
        
        # Special context patterns for proper categorization
        r'root\.GPTPF_I18N\.getMessage\([\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
        r'self\.GPTPF_I18N\.getMessage\([\'"]([a-zA-Z0-9_\.\-]+)[\'"]',
    ]
    


    # Check manifest.json for __MSG_*__ patterns - CRITICAL FOR CHROME EXTENSIONS
    try:
        with open('manifest.json', 'r', encoding='utf-8') as f:
            manifest_content: str = f.read()
            # Enhanced manifest pattern detection
            manifest_matches: List[str] = re.findall(r'__MSG_([a-zA-Z0-9_\.\-]+)__', manifest_content, re.IGNORECASE)
            used_keys.update(manifest_matches)
    except Exception:
        pass

    # Scan source files with enhanced coverage
    scan_dirs: List[str] = ['src', '.', 'docs', '_locales']
    file_extensions: tuple[str, ...] = ('.js', '.html', '.json', '.md', '.txt')
    
    for scan_dir in scan_dirs:
        if not os.path.exists(scan_dir):
            continue
            
        for root, _, files in os.walk(scan_dir):
            for file in files:
                if file.endswith(file_extensions):
                    filepath: str = os.path.join(root, file)
                    try:
                        with open(filepath, 'r', encoding='utf-8') as f:
                            content: str = f.read()
                        
                        for pattern in patterns:
                            matches: List[str] = re.findall(pattern, content, re.IGNORECASE)
                            used_keys.update(matches)
                    except Exception:
                        continue

    # Load defined keys
    defined_keys: Set[str] = set()
    try:
        with open('_locales/en/messages.json', 'r', encoding='utf-8') as f:
            defined_keys = set(json.load(f).keys())
    except Exception:
        pass

    # Analyze all locales
    locales: List[Dict[str, Any]] = []
    try:
        for locale_dir in os.listdir('_locales'):
            locale_path: str = os.path.join('_locales', locale_dir, 'messages.json')
            if os.path.isfile(locale_path):
                with open(locale_path, 'r', encoding='utf-8') as f:
                    messages: Dict[str, Any] = json.load(f)
                    locales.append({
                        'code': locale_dir,
                        'count': len(messages),
                        'keys': set(messages.keys())
                    })
    except Exception:
        pass

    # Calculate statistics
    missing_keys: Set[str] = used_keys - defined_keys
    unused_keys: Set[str] = defined_keys - used_keys

    # Categorize unused keys - be more intelligent about what's truly unused
    dynamic_prefixes: List[str] = [
        'debug_', 'console_', 'language_abbreviation_', 'ui_components_', 
        'file_', 'platform_', 'modal_', 'aria_', 'html_sections_',
        'errors_', 'success_', 'attachment_', 'batch_', 'compression_'
    ]
    
    # Keys that are intentionally available but not always used (not errors)
    intentional_keys: Set[str] = {
        'analytics', 'errors', 'header_title', 'language_abbreviation',
        'modals_about_title', 'modals_help_content', 'modals_help_title',
        'platforms_chatgpt', 'platforms_claude', 'platforms_deepseek',
        'platforms_gemini', 'platforms_grok', 'extension_support',
        'status_connected', 'validation_invalid_characters', 
        'validation_no_dots_needed', 'validation_security_risk',
        'validation_system_unavailable'
    }
    
    truly_unused: List[str] = []
    dynamic_unused: List[str] = []
    intentional_unused: List[str] = []
    
    for key in unused_keys:
        if key in intentional_keys:
            intentional_unused.append(key)
        elif any(key.startswith(prefix) for prefix in dynamic_prefixes):
            dynamic_unused.append(key)
        else:
            truly_unused.append(key)

    return {
        'used_count': len(used_keys),
        'defined_count': len(defined_keys),
        'missing_keys': sorted(missing_keys),
        'unused_keys': sorted(truly_unused),
        'dynamic_keys': sorted(dynamic_unused),
        'intentional_keys': sorted(intentional_unused),
        'locales': locales,
        'status': 'passed' if not missing_keys else 'failed'
    }

def find_hardcoded_strings() -> List[Dict[str, Any]]:
    """Find ONLY actual hardcoded user-facing strings that should be internationalized."""
    hardcoded_strings: List[Dict[str, Any]] = []

    # FOCUSED patterns for ONLY actual user-facing strings that need i18n
    string_patterns: List[str] = [
        # CRITICAL: Forbidden fallback patterns (|| with hardcoded strings) - THESE ARE REAL ISSUES
        r'GPTPF_I18N\?\.\w+\([^)]+\)\s*\|\|\s*[\'"]([^\'\"]+)[\'"]',
        r'getMessage\([^)]+\)\s*\|\|\s*[\'"]([^\'\"]+)[\'"]',
        r'\?\.\w+\([^)]+\)\s*\|\|\s*[\'"]([^\'\"]+)[\'"]',

        # User-facing alert/confirm/prompt messages
        r'(?:alert|confirm|prompt)\s*\(\s*[\'"]([^\'\"]{5,})[\'"]',

        # Direct text content assignment (likely user-facing)
        r'(?:innerHTML|textContent|innerText)\s*=\s*[\'"]([A-Z][^\'\"]{10,})[\'"]',

        # Toast/notification messages
        r'(?:toast|showMessage|displayError|showNotification|flash)\s*\(\s*[\'"]([^\'\"]{5,})[\'"]',

        # Error messages in throw statements (user-facing errors)
        r'throw new (?:Error|TypeError|ReferenceError)\s*\(\s*[\'"]([A-Z][^\'\"]{10,})[\'"]',
    ]

    # COMPREHENSIVE exclusion patterns for legitimate technical strings
    excluded_patterns: List[str] = [
        # Technical identifiers and single words
        r'^[a-z]+$',  # Single lowercase words like 'txt', 'js', etc.
        r'^\w+\.\w+$',  # File extensions like 'file.txt'
        r'^[a-zA-Z_$][a-zA-Z0-9_$]*$',  # Variable/function names
        r'^[\w\-]+$',  # Single words/identifiers with hyphens

        # Web/HTTP technical strings
        r'^(GET|POST|PUT|DELETE|HEAD|OPTIONS)$',  # HTTP methods
        r'^(application|text|image|audio|video)\/\w+$',  # MIME types
        r'^https?:\/\/\S+$',  # URLs
        r'^\w+[@]\w+\.\w+$',  # Email addresses

        # CSS and styling
        r'^#[0-9a-fA-F]{3,6}$',  # Hex colors
        r'^\d+(\.\d+)?(px|em|rem|%|vh|vw)$',  # CSS units
        r'^(auto|none|inherit|initial|unset)$',  # CSS keywords
        r'^[\w\-]+([\s\w\-]*[\w\-])?$',  # CSS class names and compound classes
        r'^(flag-icon|debug-error|debug-warn|debug-info)[\w\-\s]*$',  # CSS classes with variants
        r'^hsl\([^)]+\)$',  # HSL color values
        r'^url\([^)]+\)$',  # CSS url() values
        r'^M[\d\s\.\,LZlzHhVvCcSsQqTtAa\-]+$',  # SVG path data

        # JavaScript/programming primitives
        r'^(true|false|null|undefined)$',  # JavaScript primitives
        r'^[0-9\s\-\.]+$',  # Numbers and formatting
        r'^\d+$',  # Pure numbers
        r'^\$\{[^}]+\}$',  # Template literal placeholders

        # Dates, versions, and codes
        r'^v?\d+\.\d+\.\d+$',  # Version numbers
        r'^\d{4}-\d{2}-\d{2}$',  # Dates
        r'^[A-Z]{2,5}$',  # Country/language codes

        # Content that's intentionally English (brand names, technical terms)
        r'^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$',  # Days
        r'^(January|February|March|April|May|June|July|August|September|October|November|December)$',  # Months
        r'^(content|format|debug|success|error|warning|info)$',  # Generic technical keys
        r'^(left|right|center|top|bottom|middle)$',  # Position keywords
        r'^(rtl|ltr)$',  # Direction attributes
        r'^(SW|EN|AR|ES|DE|FR|RU|ZH|PT|JA|HI)$',  # Language abbreviations
        r'^(Kiswahili|العربية|Español|English|Deutsch|Français|Русский|中文|Português|日本語|हिंदी)$',  # Language display names

        # File and technical patterns
        r'^paste\.\d+\.\w+$',  # Generated filenames
        r'^part\d+\-lines\d+\-\d+\.\w+$',  # Batch part filenames
        r'^n/a$',  # Not applicable
        r'^\.\.\.+$',  # Ellipsis patterns
        r'^\s+$',  # Whitespace only
        r'^default$',  # The word "default"
        r'^(unknown|none|text|data)$',  # Technical terms

        # Email subjects and technical strings
        r'^Multi-AI File Paster.*$',  # Extension name in subjects/titles
        r'^mailto:.*$',  # Email links

        # Short technical strings that are not user-facing
        r'^.{1,3}$',  # Very short strings (likely technical)
        r'^\w+\s*\+\s*\w+$',  # Concatenation patterns
        r'^[A-Z]+_[A-Z_]+$',  # CONSTANT_NAMES
    ]
    
    scan_dirs: List[str] = ['src']
    file_extensions: tuple[str, ...] = ('.js', '.html')

    def is_excluded_string(text: str) -> bool:
        """Check if a string should be excluded from hardcoding checks."""
        for pattern in excluded_patterns:
            if re.match(pattern, text, re.IGNORECASE):
                return True
        return False

    for scan_dir in scan_dirs:
        if not os.path.exists(scan_dir):
            continue

        for root, _, files in os.walk(scan_dir):
            for file in files:
                if file.endswith(file_extensions):
                    filepath: str = os.path.join(root, file)
                    try:
                        with open(filepath, 'r', encoding='utf-8') as f:
                            content: str = f.read()

                        # Scan for hardcoded strings - ONLY REAL ISSUES
                        for pattern in string_patterns:
                            matches = re.finditer(pattern, content)
                            for match in matches:
                                extracted_string = match.group(1)
                                # Skip excluded patterns
                                if is_excluded_string(extracted_string):
                                    continue
                                line_num = content[:match.start()].count('\n') + 1
                                hardcoded_strings.append({
                                    'file': filepath,
                                    'line': line_num,
                                    'string': extracted_string,
                                    'context': content[max(0, match.start()-20):match.end()+20],
                                    'type': 'hardcoded_string'
                                })
                    except Exception:
                        continue
    
    return hardcoded_strings

def detect_mixed_language_patterns() -> Dict[str, Any]:
    """Detect mixed language patterns and translation inconsistencies across locales."""
    issues: Dict[str, List[Dict[str, Any]]] = {
        'untranslated_terms': [],
        'inconsistent_html': [],
        'brand_name_errors': [],
        'hardcoded_in_html': []
    }
    
    # Load all locale data
    locales_data: Dict[str, Dict[str, Any]] = {}
    try:
        for locale_dir in os.listdir('_locales'):
            locale_path: str = os.path.join('_locales', locale_dir, 'messages.json')
            if os.path.isfile(locale_path):
                with open(locale_path, 'r', encoding='utf-8') as f:
                    locales_data[locale_dir] = json.load(f)
    except Exception:
        return issues
    
    # Check for English terms in non-English locales (except brand names)
    english_terms: List[str] = ['BETA', 'ERROR', 'SUCCESS', 'WARNING', 'INFO']
    brand_terms: List[str] = ['ChatGPT', 'Claude', 'Gemini', 'DeepSeek', 'Grok', 'Multi-AI File Paster']
    
    for locale_code, locale_data in locales_data.items():
        if locale_code == 'en':  # Skip English locale
            continue
            
        for key, value in locale_data.items():
            message: str = value.get('message', '')
            
            # Check for untranslated English terms (not brand names)
            for term in english_terms:
                if term in message and locale_code != 'ar':  # Arabic correctly translates BETA
                    # Check if it's in HTML content where it might be intentional
                    if '<span class=' in message and term in message:
                        issues['untranslated_terms'].append({
                            'locale': locale_code,
                            'key': key,
                            'term': term,
                            'message': message[:100] + '...' if len(message) > 100 else message,
                            'type': 'html_content'
                        })
                    elif term == 'BETA' and key == 'beta':
                        issues['untranslated_terms'].append({
                            'locale': locale_code,
                            'key': key,
                            'term': term,
                            'message': message,
                            'type': 'standalone_key'
                        })
            
            # Check for brand name translation errors
            for brand in brand_terms:
                if brand.lower() in message.lower() and brand not in message:
                    issues['brand_name_errors'].append({
                        'locale': locale_code,
                        'key': key,
                        'expected': brand,
                        'found': message[:100] + '...' if len(message) > 100 else message
                    })
    
    # Skip badge checking entirely - all tip-badge content is intentional design
    # Only check for truly problematic patterns like unescaped user input or missing i18n
    problematic_patterns: List[str] = [
        r'alert\s*\(\s*[\'"]([^\'\"]{10,})[\'"]',  # Hardcoded alert messages
        r'confirm\s*\(\s*[\'"]([^\'\"]{10,})[\'"]',  # Hardcoded confirm messages  
        r'\.textContent\s*=\s*[\'"]([A-Z][^\'\"]{5,})[\'"]'  # Direct text assignment
    ]
    
    for locale_code, locale_data in locales_data.items():
        if locale_code != 'en':  # Only check non-English for true hardcoding issues
            continue
            
        for key, value in locale_data.items():
            message: str = value.get('message', '')
            
            # Check for actual hardcoding problems in source code references
            for pattern in problematic_patterns:
                matches = re.finditer(pattern, message)
                for match in matches:
                    issues['hardcoded_in_html'].append({
                        'locale': locale_code,
                        'key': key,
                        'pattern': match.group(0),
                        'suggestion': 'Replace with getMessage() call'
                    })
    
    return issues

def check_translation_completeness() -> Dict[str, Any]:
    """Check if all locales have complete and consistent translations."""
    completeness: Dict[str, Any] = {
        'all_complete': True,
        'missing_translations': [],
        'key_count_mismatches': []
    }
    
    # Load English as reference
    try:
        with open('_locales/en/messages.json', 'r', encoding='utf-8') as f:
            english_keys: Set[str] = set(json.load(f).keys())
    except Exception:
        return completeness
    
    # Check each locale against English
    try:
        for locale_dir in os.listdir('_locales'):
            if locale_dir == 'en':
                continue
                
            locale_path: str = os.path.join('_locales', locale_dir, 'messages.json')
            if os.path.isfile(locale_path):
                with open(locale_path, 'r', encoding='utf-8') as f:
                    locale_keys: Set[str] = set(json.load(f).keys())
                
                missing: Set[str] = english_keys - locale_keys
                extra: Set[str] = locale_keys - english_keys
                
                if missing or extra:
                    completeness['all_complete'] = False
                    completeness['missing_translations'].append({
                        'locale': locale_dir,
                        'missing_keys': sorted(missing),
                        'extra_keys': sorted(extra),
                        'expected_count': len(english_keys),
                        'actual_count': len(locale_keys)
                    })
                
                if len(locale_keys) != len(english_keys):
                    completeness['key_count_mismatches'].append({
                        'locale': locale_dir,
                        'expected': len(english_keys),
                        'actual': len(locale_keys),
                        'difference': len(english_keys) - len(locale_keys)
                    })
    except Exception:
        pass
    
    return completeness

def main() -> int:
    """Main analysis function - comprehensive reporting with locale configuration overview."""
    # Check for --fix flag
    if '--fix' in sys.argv or '--auto-fix' in sys.argv:
        return auto_fix_comments()

    print("I18N COMPREHENSIVE ANALYSIS REPORT")
    print("=" * 50)

    # LOCALE CONFIGURATION OVERVIEW
    config = analyze_locale_configuration()
    print(f"LOCALE CONFIGURATION STATUS:")
    print(f"Expected locales: {', '.join(config['expected_locales'])}")
    print(f"Manifest web_accessible: {', '.join(config['manifest_web_accessible'])}")
    print(f"I18n setLanguage validation: {', '.join(config['i18n_setlanguage_validation'])}")
    print(f"I18n Promise.all preloading: {', '.join(config['i18n_promise_preloading'])}")
    print(f"I18n saved language validation: {', '.join(config['i18n_saved_language_validation'])}")
    print(f"I18n flag mapping: {', '.join(config['i18n_flag_mapping'])}")
    print(f"I18n display name mapping: {', '.join(config['i18n_display_name_mapping'])}")
    print(f"I18n abbreviation mapping: {', '.join(config['i18n_abbreviation_mapping'])}")
    print(f"Popup language options: {', '.join(config['popup_language_options'])}")
    print(f"Locale files exist: {', '.join(config['locale_files_exist'])}")
    
    if config['missing_integrations']:
        print(f"\n🚨 MISSING LOCALE INTEGRATIONS:")
        for missing in config['missing_integrations']:
            print(f"  {missing['locale']}: Missing in {', '.join(missing['missing_in'])}")
    else:
        print(f"\n✅ All locales properly integrated across all connection points")

    print(f"\n" + "=" * 50)

    # Standard analysis
    analysis = analyze_i18n()
    
    print(f"Used keys: {analysis['used_count']}")
    print(f"Defined keys: {analysis['defined_count']}")
    print(f"Missing keys: {len(analysis['missing_keys'])}")
    print(f"Unused keys: {len(analysis['unused_keys'])}")
    print(f"Dynamic keys: {len(analysis['dynamic_keys'])}")
    
    # Translation completeness check
    completeness = check_translation_completeness()
    
    print(f"\nTRANSLATION COMPLETENESS:")
    if completeness['all_complete']:
        print("  ✓ All locales have complete translations")
    else:
        print("  ✗ Translation issues found")
        for issue in completeness['missing_translations']:
            print(f"    {issue['locale']}: {issue['actual_count']}/{issue['expected_count']} keys")
            if issue['missing_keys']:
                print(f"      Missing: {', '.join(issue['missing_keys'][:3])}{'...' if len(issue['missing_keys']) > 3 else ''}")
    
    # Mixed language pattern detection
    mixed_issues = detect_mixed_language_patterns()
    
    print(f"\nMIXED LANGUAGE ISSUES:")
    
    untranslated = mixed_issues['untranslated_terms']
    if untranslated:
        print(f"  UNTRANSLATED TERMS ({len(untranslated)}):")
        for issue in untranslated:
            if issue['type'] == 'standalone_key':
                print(f"    {issue['locale']}.{issue['key']}: '{issue['term']}' should be translated")
            elif issue['type'] == 'html_content':
                print(f"    {issue['locale']}.{issue['key']}: '{issue['term']}' in HTML should use i18n key")
    else:
        print("  ✓ No untranslated terms found")
    
    hardcoded_html = mixed_issues['hardcoded_in_html']
    if hardcoded_html:
        print(f"\n  ACTUAL HARDCODING ISSUES ({len(hardcoded_html)}):")
        for issue in hardcoded_html[:5]:
            print(f"    {issue['locale']}.{issue['key']}: {issue['pattern']}")
        if len(hardcoded_html) > 5:
            print(f"    ... and {len(hardcoded_html) - 5} more")
    else:
        print(f"  ✓ No hardcoding issues found")
    
    brand_errors = mixed_issues['brand_name_errors']
    if brand_errors:
        print(f"\n  BRAND NAME ERRORS ({len(brand_errors)}):")
        for error in brand_errors[:3]:
            print(f"    {error['locale']}.{error['key']}: Expected '{error['expected']}'")
    
    if analysis['missing_keys']:
        print(f"\nMISSING KEYS ({len(analysis['missing_keys'])}):")
        for key in analysis['missing_keys'][:10]:
            print(f"  {key}")
        if len(analysis['missing_keys']) > 10:
            print(f"  ... and {len(analysis['missing_keys']) - 10} more")
    
    # Only show truly problematic unused keys
    if analysis['unused_keys']:
        print(f"\nTRULY UNUSED KEYS ({len(analysis['unused_keys'])}):")
        for key in analysis['unused_keys'][:10]:
            print(f"  {key}")
        if len(analysis['unused_keys']) > 10:
            print(f"  ... and {len(analysis['unused_keys']) - 10} more")
    
    # Show intentional keys separately (not as problems)
    if analysis.get('intentional_keys'):
        print(f"\nINTENTIONAL KEYS (Available but not always used - NOT PROBLEMS):")
        print(f"  Count: {len(analysis['intentional_keys'])} keys (analytics, modals, platform-specific, etc.)")
    
    # Show dynamic keys separately (not as problems)
    if analysis.get('dynamic_keys'):
        print(f"\nDYNAMIC KEYS (Conditional usage - NOT PROBLEMS):")
        print(f"  Count: {len(analysis['dynamic_keys'])} keys (debug_, console_, etc.)")

    print(f"\nLOCALES:")
    for locale in analysis['locales']:
        print(f"  {locale['code']}: {locale['count']} keys")
    
    # Check for hardcoded strings and comments in source code
    hardcoded = find_hardcoded_strings()
    if hardcoded:
        strings = [item for item in hardcoded if item.get('type') == 'hardcoded_string']
        comments = [item for item in hardcoded if item.get('type') == 'comment']

        print(f"\nHARDCODED STRINGS IN SOURCE ({len(strings)}):")
        for item in strings:
            print(f"  {item['file']}:{item['line']} - \"{item['string']}\"")

        if comments:
            print(f"\nCOMMENTS WITH POTENTIAL ISSUES ({len(comments)}):")
            for item in comments:
                print(f"  {item['file']}:{item['line']} - \"{item['string']}\"")
    else:
        print(f"\nHARDCODED STRINGS IN SOURCE: ✓ None found")

    # Calculate overall status - only count REAL issues
    has_issues: bool = (
        len(analysis['missing_keys']) > 0 or 
        len(untranslated) > 0 or 
        len(hardcoded_html) > 0 or 
        len(brand_errors) > 0 or
        not completeness['all_complete'] or
        len(analysis['unused_keys']) > 0 or  # Only truly unused keys are issues
        len(config['missing_integrations']) > 0  # Missing locale integrations are critical issues
    )
    
    # Check for ALL inline comments
    commented_files = find_commented_code()
    if commented_files:
        total_comments = sum(f['count'] for f in commented_files)
        print(f"\nINLINE COMMENTS DETECTED ({len(commented_files)} files, {total_comments} comments):")
        for file_info in commented_files:
            print(f"  {file_info['file']}: {file_info['count']} comments")
            for comment in file_info['comments'][:3]:  # Show first 3 comments
                print(f"    Line {comment['line']}: {comment['content'][:80]}")
            if file_info['count'] > 3:
                print(f"    ... and {file_info['count'] - 3} more comments")
        print("\nNote: All inline comments (// and #) found excluding header signatures.")
        print("Run with --fix flag to automatically remove these comments.")

    print(f"\nOVERALL STATUS: {'ISSUES FOUND' if has_issues else 'PASSED'}")

    return 1 if has_issues else 0

if __name__ == '__main__':
    exit(main())