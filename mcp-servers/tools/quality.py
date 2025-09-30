#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: mcp-servers/tools/quality.py
 * FUNCTION: Code quality analysis tool with .github/hooks integration
 * ARCHITECTURE: Codebase-aware quality checks with production readiness validation
 * SECURITY: Local processing only, no data transmission, privacy-first design
 * PERFORMANCE: Optimized file scanning, efficient pattern matching
 * COMPATIBILITY: Python 3.8+, integrates with check-i18n.py and git hooks
 *
 * COPYRIGHT © 2025 HOSTWEK LTD. ALL RIGHTS RESERVED.
 * DEVELOPED BY JOSEPH MATINO UNDER WEKTURBO DESIGNS - HOSTWEK LTD
 * LICENSED UNDER HOSTWEK CUSTOM LICENSE
 * ================================================================================
 """

import os
import re
import subprocess
import sys
from typing import Dict, Any, List, Optional
from mcp.types import Tool
from .base import BaseTool


class QualityTool(BaseTool):
    """
    Run .github/hooks scripts, check file signatures, verify production readiness.

    Cross-platform compatible: Works on Windows WSL and Linux Ubuntu.
    """

    SIGNATURE_KEYWORDS: List[str] = [
        'MULTI-AI FILE PASTER',
        'HOSTWEK CUSTOM LICENSE',
        'HOSTWEK LTD',
        'WEKTURBO DESIGNS',
        'Joseph Matino'
    ]

    def __init__(self):
        super().__init__(
            name="check_quality",
            description="Run .github/hooks scripts, check file signatures, verify production readiness (Windows WSL + Linux compatible)"
        )
        self._python_cmd: Optional[str] = None

    def _get_python_command(self) -> str:
        """Detect correct Python command for cross-platform compatibility."""
        if self._python_cmd is not None:
            return self._python_cmd

        for cmd in ['python3', 'python']:
            try:
                result = subprocess.run(
                    [cmd, '--version'],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                if result.returncode == 0:
                    self._python_cmd = cmd
                    return self._python_cmd
            except (FileNotFoundError, subprocess.TimeoutExpired):
                continue

        self._python_cmd = 'python3'
        return self._python_cmd
    
    def get_definition(self) -> Tool:
        return Tool(
            name=self.name,
            description=self.description,
            inputSchema={
                "type": "object",
                "properties": {
                    "run_i18n_check": {
                        "type": "boolean",
                        "description": "Run .github/hooks/check-i18n.py script",
                        "default": True
                    },
                    "check_signatures": {
                        "type": "boolean",
                        "description": "Verify Hostwek signature headers in source files",
                        "default": True
                    },
                    "check_centralization": {
                        "type": "boolean",
                        "description": "Check for hardcoded strings and fallback patterns",
                        "default": True
                    },
                    "run_tests": {
                        "type": "boolean",
                        "description": "Execute Jest test suite and analyze coverage (38 tests)",
                        "default": False
                    },
                    "coverage_report": {
                        "type": "boolean",
                        "description": "Generate detailed coverage report with recommendations",
                        "default": False
                    }
                }
            }
        )
    
    async def execute(self, arguments: Dict[str, Any]) -> str:
        run_i18n_check = arguments.get('run_i18n_check', True)
        check_signatures = arguments.get('check_signatures', True)
        check_centralization = arguments.get('check_centralization', True)
        run_tests = arguments.get('run_tests', False)
        coverage_report = arguments.get('coverage_report', False)
        
        sections: List[Dict[str, Any]] = []
        
        if run_i18n_check:
            i18n_result = self._run_i18n_check()
            sections.append(i18n_result)
        
        if check_signatures:
            signatures = self._check_file_signatures()
            sections.append(signatures)
        
        if check_centralization:
            centralization = self._check_centralization()
            sections.append(centralization)
        
        if run_tests:
            test_results = self._run_tests(with_coverage=coverage_report)
            sections.append(test_results)
        
        return self.format_result("CODE QUALITY ANALYSIS", sections)

    def _run_i18n_check(self) -> Dict[str, Any]:
        """Run the .github/hooks/check-i18n.py script (cross-platform)."""
        script_path = os.path.join(self.project_root, '.github', 'hooks', 'check-i18n.py')

        if not os.path.exists(script_path):
            return {
                'title': "I18N Check Script",
                'content': ["❌ check-i18n.py not found at .github/hooks/"],
                'status': 'error'
            }

        python_cmd = self._get_python_command()

        try:
            result = subprocess.run(
                [python_cmd, script_path],
                capture_output=True,
                text=True,
                timeout=60,
                cwd=self.project_root,
                env=os.environ.copy()
            )

            output_lines = result.stdout.split('\n')

            summary_keywords: List[str] = [
                'Used keys:', 'Defined keys:', 'Missing keys:', 'Unused keys:',
                'OVERALL STATUS:', 'LOCALE CONFIGURATION:', 'Expected locales:',
                'TRANSLATION COMPLETENESS:', 'MIXED LANGUAGE ISSUES:'
            ]

            summary_lines: List[str] = []
            for line in output_lines:
                if any(keyword in line for keyword in summary_keywords):
                    summary_lines.append(line.strip())

            if result.returncode == 0:
                return {
                    'title': "I18N Validation (check-i18n.py - 901 lines)",
                    'content': summary_lines if summary_lines else ["✅ All i18n checks passed"],
                    'status': 'success'
                }
            else:
                error_lines = result.stderr.split('\n') if result.stderr else []
                content = summary_lines if summary_lines else ["❌ I18N validation failed"]
                if error_lines:
                    content.extend(["", "Errors:"] + [e.strip() for e in error_lines if e.strip()][:5])

                return {
                    'title': "I18N Validation (check-i18n.py - 901 lines)",
                    'content': content,
                    'status': 'error'
                }

        except subprocess.TimeoutExpired:
            return {
                'title': "I18N Check Script",
                'content': ["❌ Script timeout (>60s) - check for infinite loops"],
                'status': 'error'
            }
        except FileNotFoundError:
            return {
                'title': "I18N Check Script",
                'content': [f"❌ Python command '{python_cmd}' not found", "Install Python 3.8+ for your system"],
                'status': 'error'
            }
        except Exception as e:
            return {
                'title': "I18N Check Script",
                'content': [f"❌ Error: {str(e)}", f"Platform: {sys.platform}"],
                'status': 'error'
            }

    def _check_file_signatures(self) -> Dict[str, Any]:
        """Check for Hostwek signature headers in source files (JS and PY only, NOT CSS/HTML)."""
        results: List[str] = []
        missing_signatures: List[str] = []
        checked_files = 0

        # ONLY check JS and PY files - CSS and HTML don't need comment headers
        file_extensions: List[str] = ['.js', '.py']
        directories: List[str] = ['src', 'mcp-servers', '.github/hooks']

        for directory in directories:
            dir_path = os.path.join(self.project_root, directory)
            if not os.path.exists(dir_path):
                continue

            files = self.list_files(directory)
            for file_path in files:
                if any(file_path.endswith(ext) for ext in file_extensions):
                    checked_files += 1
                    content = self.read_file(file_path)
                    if not content:
                        continue

                    header = content[:3000]

                    required_keywords = ['MULTI-AI FILE PASTER', 'HOSTWEK']
                    has_signature = all(keyword in header for keyword in required_keywords)

                    if not has_signature:
                        missing_signatures.append(file_path)

        results.append(f"Checked Files: {checked_files}")
        results.append(f"Files with Signatures: {checked_files - len(missing_signatures)}")
        results.append(f"Files Missing Signatures: {len(missing_signatures)}")
        results.append("")

        if missing_signatures:
            results.append("❌ Files missing signature headers:")
            for file_path in missing_signatures[:15]:
                results.append(f"  • {file_path}")
            if len(missing_signatures) > 15:
                results.append(f"  • ... and {len(missing_signatures) - 15} more")
        else:
            results.append("✅ All source files have proper Hostwek signature headers")

        return {
            'title': "File Signature Headers (Hostwek Custom License)",
            'content': results,
            'status': 'error' if missing_signatures else 'success'
        }

    def _check_centralization(self) -> Dict[str, Any]:
        """Check for hardcoded strings and fallback patterns."""
        results: List[str] = []
        violations: List[str] = []
        checked_files = 0

        fallback_patterns: List[str] = [
            r'\?\?\s*[\'"][^\'\"]+[\'"]',
            r'\|\|\s*[\'"][^\'\"]+[\'"]',
        ]

        safe_patterns: List[str] = [
            "''", '""', "'txt'", '"txt"', "'auto'", '"auto"',
            "'unknown'", '"unknown"', "'AI Model'", '"AI Model"',
            "'default'", '"default"', "'none'", '"none"',
            "'errors'", '"errors"', "'text'", '"text"',  # Valid default values
            "'warnings'", '"warnings"', "'all'", '"all"'  # Valid debug levels
        ]

        js_files = self.list_files('src', '.js')

        for file_path in js_files:
            checked_files += 1
            content = self.read_file(file_path)
            if not content:
                continue

            for pattern in fallback_patterns:
                matches = list(re.finditer(pattern, content))
                for match in matches:
                    matched_text = match.group(0)

                    is_safe = any(safe in matched_text for safe in safe_patterns)
                    if is_safe:
                        continue

                    line_num = content[:match.start()].count('\n') + 1
                    violations.append(f"{file_path}:{line_num} - {matched_text[:60]}...")

        results.append(f"Checked Files: {checked_files}")
        results.append(f"Violations Found: {len(violations)}")
        results.append("")

        if violations:
            results.append("❌ Fallback pattern violations (should use GPTPF_I18N.getMessage()):")
            for violation in violations[:12]:
                results.append(f"  • {violation}")
            if len(violations) > 12:
                results.append(f"  • ... and {len(violations) - 12} more")
        else:
            results.append("✅ No hardcoded fallback patterns found")
            results.append("✅ All user-facing strings use centralized i18n system")

        return {
            'title': "Centralization Standards (GPTPF_I18N.getMessage)",
            'content': results,
            'status': 'error' if violations else 'success'
        }

    def _run_tests(self, with_coverage: bool = False) -> Dict[str, Any]:
        """Execute Jest test suite and analyze results with optional coverage report."""
        test_dir = os.path.join(self.project_root, 'tests')
        
        if not os.path.exists(test_dir):
            return {
                'title': "Jest Test Suite Execution",
                'content': ["❌ Tests directory not found at project root"],
                'status': 'error'
            }
        
        # Check if node_modules exists
        node_modules = os.path.join(test_dir, 'node_modules')
        if not os.path.exists(node_modules):
            return {
                'title': "Jest Test Suite Execution",
                'content': [
                    "❌ Test dependencies not installed",
                    "Run: cd tests && npm install"
                ],
                'status': 'error'
            }
        
        results: List[str] = []
        
        try:
            # Determine command based on coverage flag
            cmd = ['npm', 'test']
            if not with_coverage:
                cmd.append('--')
                cmd.append('--no-coverage')
            
            # Execute tests
            result = subprocess.run(
                cmd,
                cwd=test_dir,
                capture_output=True,
                text=True,
                timeout=120,
                env=os.environ.copy()
            )
            
            output_lines = result.stdout.split('\n')
            
            # Extract test summary
            test_summary: List[str] = []
            coverage_summary: List[str] = []
            in_coverage = False
            
            for line in output_lines:
                # Test results
                if 'Test Suites:' in line or 'Tests:' in line or 'Snapshots:' in line or 'Time:' in line:
                    test_summary.append(line.strip())
                
                # Coverage results
                if '----------|---------|----------|---------|---------|' in line:
                    in_coverage = True
                    continue
                
                if in_coverage and line.strip():
                    if line.startswith('All files'):
                        coverage_summary.append(line.strip())
                        in_coverage = False
                    elif '|' in line:
                        coverage_summary.append(line.strip())
            
            # Analyze test results
            if 'Tests:' in result.stdout:
                # Extract pass/fail counts
                for line in test_summary:
                    if 'Tests:' in line:
                        results.append(f"📊 {line}")
                    elif 'Test Suites:' in line:
                        results.append(f"📦 {line}")
                    elif 'Time:' in line:
                        results.append(f"⏱️  {line}")
            
            results.append("")
            
            # Add coverage if available
            if with_coverage and coverage_summary:
                results.append("📈 Coverage Report:")
                results.append("")
                for line in coverage_summary[:10]:  # Limit to top 10 lines
                    results.append(f"  {line}")
                
                # Analyze coverage percentages
                if 'All files' in result.stdout:
                    results.append("")
                    results.append("🎯 Coverage Analysis:")
                    
                    # Check if we meet 80% thresholds
                    coverage_metrics = self._parse_coverage_metrics(result.stdout)
                    if coverage_metrics:
                        recommendations = self._generate_coverage_recommendations(coverage_metrics)
                        results.extend(recommendations)
            
            # Determine status
            failed_tests = 'failed' in result.stdout.lower() and ', 0 failed' not in result.stdout.lower()
            status = 'error' if (result.returncode != 0 or failed_tests) else 'success'
            
            if status == 'success':
                results.append("")
                results.append("✅ All tests passing - ready for production")
            else:
                results.append("")
                results.append("❌ Test failures detected - review required")
            
            return {
                'title': "Jest Test Suite Execution (38 tests)",
                'content': results,
                'status': status
            }
            
        except subprocess.TimeoutExpired:
            return {
                'title': "Jest Test Suite Execution",
                'content': ["❌ Tests timed out after 120 seconds", "Check for infinite loops or hanging tests"],
                'status': 'error'
            }
        except FileNotFoundError:
            return {
                'title': "Jest Test Suite Execution",
                'content': ["❌ npm command not found", "Install Node.js 16+ and npm"],
                'status': 'error'
            }
        except Exception as e:
            return {
                'title': "Jest Test Suite Execution",
                'content': [f"❌ Test execution failed: {str(e)}"],
                'status': 'error'
            }
    
    def _parse_coverage_metrics(self, output: str) -> Optional[Dict[str, float]]:
        """Parse coverage percentages from Jest output."""
        try:
            # Look for "All files" line with coverage percentages
            for line in output.split('\n'):
                if 'All files' in line:
                    parts = line.split('|')
                    if len(parts) >= 5:
                        return {
                            'statements': float(parts[1].strip().replace('%', '')),
                            'branches': float(parts[2].strip().replace('%', '')),
                            'functions': float(parts[3].strip().replace('%', '')),
                            'lines': float(parts[4].strip().replace('%', ''))
                        }
        except (ValueError, IndexError):
            pass
        return None
    
    def _generate_coverage_recommendations(self, metrics: Dict[str, float]) -> List[str]:
        """Generate recommendations based on coverage metrics."""
        recommendations: List[str] = []
        threshold = 80.0
        
        below_threshold = {k: v for k, v in metrics.items() if v < threshold}
        
        if not below_threshold:
            recommendations.append("  ✅ All coverage metrics meet 80% threshold")
            recommendations.append("  🎯 Consider adding integration tests for platform handlers")
            recommendations.append("  🎯 Consider adding E2E tests for full workflows")
        else:
            recommendations.append("  ⚠️  Coverage below 80% threshold:")
            for metric, value in below_threshold.items():
                gap = threshold - value
                recommendations.append(f"    • {metric.capitalize()}: {value:.1f}% (need {gap:.1f}% more)")
            
            recommendations.append("")
            recommendations.append("  💡 Recommendations:")
            
            if metrics.get('branches', 100) < threshold:
                recommendations.append("    • Add tests for edge cases and error conditions")
                recommendations.append("    • Test null/undefined inputs and boundary values")
            
            if metrics.get('functions', 100) < threshold:
                recommendations.append("    • Ensure all exported functions have test coverage")
                recommendations.append("    • Focus on utility functions in shared/ directory")
            
            if metrics.get('lines', 100) < threshold:
                recommendations.append("    • Add tests for uncovered code paths")
                recommendations.append("    • Review try-catch blocks and error handlers")
        
        return recommendations


