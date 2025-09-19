#!/usr/bin/env python3
"""
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: mcp-servers/env.py
 * FUNCTION: Cross-platform MCP environment bootstrap and server launcher
 * ARCHITECTURE: Auto-detection, virtual environment management, dependency installation
 * SECURITY: Local processing only, no data transmission, privacy-first design
 * PERFORMANCE: Optimized environment setup, cached dependency checks, fast startup
 * COMPATIBILITY: Windows, Linux, macOS, Python 3.8+, automatic environment detection
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

import os
import sys
import subprocess
import platform
import hashlib
from pathlib import Path
from typing import Tuple
import argparse
log_to_stderr = True  # default; will be flipped for status / print modes
ascii_mode = os.environ.get("MFP_ASCII", "0") == "1"
plain_mode = os.environ.get("MFP_PLAIN", "0") == "1"
os.environ.setdefault("PYTHONNOUSERSITE", "1")


_ansi_escape = None

def safe_print(text: str) -> None:
    target = sys.stderr if log_to_stderr else sys.stdout
    if plain_mode:
        # Lazy compile
        global _ansi_escape
        if _ansi_escape is None:
            import re as _re
            _ansi_escape = _re.compile(r"\x1B\[[0-9;]*[A-Za-z]")
        text = _ansi_escape.sub("", text)
    if ascii_mode:
        text = text.encode('ascii', errors='replace').decode('ascii')
    try:
        target.write(text + "\n")
    except UnicodeEncodeError:
        encoding = getattr(target, "encoding", "utf-8") or "utf-8"
        target.write(text.encode(encoding, errors="replace").decode(encoding, errors="replace") + "\n")



def detect_python_executable() -> str:
    """Detect a Python 3 executable robustly across Windows, WSL, Linux, macOS.

    Preference order:
    1. Existing project virtual environment interpreter if already created
    2. python3
    3. python
    4. py (Windows launcher)
    """
    # Use existing venv interpreter first if present to avoid recreating deps
    root_dir = Path(__file__).parent.parent
    venv_python, _ = get_venv_paths(root_dir)
    if venv_python.exists():
        return str(venv_python)

    candidates = ["python3", "python", "py"]
    for candidate in candidates:
        try:
            result = subprocess.run([candidate, "-c", "import sys; print(sys.version)"],
                                    capture_output=True, text=True, timeout=5)
            if result.returncode == 0 and result.stdout.startswith("3"):
                return candidate
        except (subprocess.TimeoutExpired, FileNotFoundError):
            continue
    raise RuntimeError("No suitable Python 3 executable found in PATH")


def get_venv_paths(root_dir: Path) -> Tuple[Path, Path]:
    """Get virtual environment paths for current platform."""
    venv_dir = root_dir / ".venv"
    
    if platform.system() == "Windows":
        python_exe = venv_dir / "Scripts" / "python.exe"
        pip_exe = venv_dir / "Scripts" / "pip.exe"
    else:
        python_exe = venv_dir / "bin" / "python"
        pip_exe = venv_dir / "bin" / "pip"
    
    return python_exe, pip_exe


def create_virtual_environment(root_dir: Path, python_cmd: str) -> bool:
    """Create virtual environment if it does not exist."""
    venv_dir = root_dir / ".venv"
    python_exe, _ = get_venv_paths(root_dir)
    
    if python_exe.exists():
        safe_print(f"✅ Virtual environment already exists: {venv_dir}")
        return True

    safe_print(f"🔧 Creating virtual environment: {venv_dir}")
    try:
        subprocess.run([python_cmd, "-m", "venv", str(venv_dir)],
                      check=True, cwd=str(root_dir))
        safe_print(f"✅ Virtual environment created successfully")
        return True
    except subprocess.CalledProcessError as e:
        safe_print(f"❌ Failed to create virtual environment: {e}")
        return False


def check_dependencies_installed(root_dir: Path) -> bool:
    python_exe, _ = get_venv_paths(root_dir)
    if not python_exe.exists():
        return False
    try:
        result = subprocess.run([str(python_exe), "-c", "import mcp"], capture_output=True, text=True, timeout=5)
        return result.returncode == 0
    except (subprocess.TimeoutExpired, subprocess.CalledProcessError):
        return False


def requirements_hash(root_dir: Path) -> str:
    req = root_dir / "requirements.txt"
    if not req.exists():
        return "no-file"
    data = req.read_bytes()
    return hashlib.sha256(data).hexdigest()


def load_saved_hash(root_dir: Path) -> str:
    marker = root_dir / ".venv" / ".deps_hash"
    if marker.exists():
        try:
            return marker.read_text().strip()
        except OSError:
            return ""
    return ""


def save_hash(root_dir: Path, value: str) -> None:
    marker = root_dir / ".venv" / ".deps_hash"
    try:
        marker.write_text(value)
    except OSError:
        pass


def install_requirements(root_dir: Path, force: bool, quick: bool, verbose: bool) -> bool:
    requirements_file = root_dir / "requirements.txt"
    if not requirements_file.exists():
        safe_print("⚠️  No requirements.txt found, skipping dependency installation")
        return True
    python_exe, pip_exe = get_venv_paths(root_dir)
    if not python_exe.exists():
        safe_print("❌ Virtual environment not found")
        return False
    current_hash = requirements_hash(root_dir)
    saved = load_saved_hash(root_dir)
    if quick and check_dependencies_installed(root_dir):
        safe_print("✅ Quick mode: assuming dependencies OK")
        return True
    if not force and saved == current_hash and check_dependencies_installed(root_dir):
        safe_print("✅ Dependencies unchanged (hash match), skipping installation")
        return True
    safe_print("📦 Installing dependencies (quiet mode)..." if not verbose else "📦 Installing dependencies (verbose)...")
    env = os.environ.copy()
    # Disable pip version check noise
    env["PIP_DISABLE_PIP_VERSION_CHECK"] = "1"
    # Prefer no python version warning (pip currently only respects disable version check)
    # Upgrade pip (non-fatal) - suppress output unless verbose
    try:
        upgrade_proc = subprocess.run(
            [str(pip_exe), "install", "--upgrade", "pip"],
            cwd=str(root_dir),
            env=env,
            capture_output=not verbose,
            text=True,
            check=False,
        )
        if verbose and upgrade_proc.stdout:
            safe_print(upgrade_proc.stdout.rstrip())
        if verbose and upgrade_proc.stderr:
            safe_print(upgrade_proc.stderr.rstrip())
    except Exception as e:  # pragma: no cover - defensive
        safe_print(f"⚠️  Pip upgrade step skipped: {e}")

    try:
        install_proc = subprocess.run(
            [str(pip_exe), "install", "-r", str(requirements_file)],
            cwd=str(root_dir),
            env=env,
            capture_output=not verbose,
            text=True,
            check=False,
        )
        if install_proc.returncode != 0:
            if verbose:
                # Show full captured output already printed if verbose (since not captured)
                pass
            else:
                combined = (install_proc.stdout or "") + (install_proc.stderr or "")
                lines = [ln for ln in combined.splitlines() if ln.strip()]
                tail = "\n".join(lines[-20:]) if lines else "(no output)"
                safe_print("❌ pip install failed (last lines):\n" + tail)
            return False
        if verbose:
            if install_proc.stdout:
                safe_print(install_proc.stdout.rstrip())
            if install_proc.stderr:
                safe_print(install_proc.stderr.rstrip())
        save_hash(root_dir, current_hash)
        safe_print("✅ Dependencies installed successfully")
        return True
    except Exception as e:  # pragma: no cover - defensive
        safe_print(f"❌ Failed to install dependencies: {e}")
        return False


def launch_mcp_server(root_dir: Path) -> None:
    python_exe, _ = get_venv_paths(root_dir)
    server_script = root_dir / "mcp-servers" / "multi_ai_assistant.py"
    if not server_script.exists():
        raise FileNotFoundError(f"MCP server script not found: {server_script}")
    safe_print(f"🚀 Launching MCP server: {server_script}")
    os.execv(str(python_exe), [str(python_exe), str(server_script)])


def test_mcp_server(root_dir: Path) -> bool:
    """Test MCP server startup with visible output for diagnostics."""
    python_exe, _ = get_venv_paths(root_dir)
    server_script = root_dir / "mcp-servers" / "multi_ai_assistant.py"

    if not server_script.exists():
        safe_print(f"❌ MCP server script not found: {server_script}")
        return False

    safe_print(f"🧪 Testing MCP server startup: {server_script}")
    safe_print(f"🐍 Using Python: {python_exe}")

    try:
        # Test basic import first
        result = subprocess.run([str(python_exe), "-c", "import mcp; print('MCP import: OK')"],
                               capture_output=True, text=True, timeout=10)
        if result.returncode != 0:
            safe_print(f"❌ MCP import failed: {result.stderr}")
            return False
        safe_print(f"✅ {result.stdout.strip()}")

        # Test server script syntax
        server_script = root_dir / "mcp-servers" / "multi_ai_assistant.py"
        result = subprocess.run([str(python_exe), "-m", "py_compile", str(server_script)],
                               capture_output=True, text=True, timeout=10)
        if result.returncode != 0:
            safe_print(f"❌ Server script syntax error: {result.stderr}")
            return False
        safe_print("✅ Server script syntax: OK")

        # Test server startup (with timeout - server should run indefinitely)
        safe_print("🔄 Testing server startup (will timeout after 3 seconds - this is expected)...")
        try:
            result = subprocess.run([str(python_exe), str(server_script)],
                                   capture_output=True, text=True, timeout=3)
            # If we get here, the server exited unexpectedly
            safe_print(f"❌ Server exited unexpectedly with code {result.returncode}")
            if result.stderr:
                safe_print(f"Error output: {result.stderr}")
            if result.stdout:
                safe_print(f"Standard output: {result.stdout}")
            return False
        except subprocess.TimeoutExpired:
            safe_print("✅ Server started successfully (running indefinitely as expected)")
            return True

    except Exception as e:
        safe_print(f"❌ Server test failed: {e}")
        return False


def validate_environment(root_dir: Path) -> bool:
    """Comprehensive environment validation."""
    safe_print("🔍 Validating MCP environment...")

    python_exe, _ = get_venv_paths(root_dir)

    # Check virtual environment
    if not python_exe.exists():
        safe_print("❌ Virtual environment Python not found")
        return False
    safe_print(f"✅ Virtual environment: {python_exe}")

    # Check Python version
    try:
        result = subprocess.run([str(python_exe), "--version"], capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            safe_print(f"✅ Python version: {result.stdout.strip()}")
        else:
            safe_print("❌ Could not get Python version")
            return False
    except Exception as e:
        safe_print(f"❌ Python version check failed: {e}")
        return False

    # Check MCP installation
    try:
        result = subprocess.run([str(python_exe), "-c", "import mcp; print('MCP import: OK')"],
                               capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            safe_print(f"✅ {result.stdout.strip()}")
        else:
            safe_print(f"❌ MCP not properly installed: {result.stderr}")
            return False
    except Exception as e:
        safe_print(f"❌ MCP check failed: {e}")
        return False

    # Check server script
    server_script = root_dir / "mcp-servers" / "multi_ai_assistant.py"
    if not server_script.exists():
        safe_print(f"❌ Server script not found: {server_script}")
        return False
    safe_print(f"✅ Server script: {server_script}")

    # Check platform compatibility
    safe_print(f"✅ Platform: {platform.system()} {platform.release()}")

    # Check WSL detection
    if platform.system() == "Linux":
        try:
            with open("/proc/version", "r") as f:
                version_info = f.read()
                if "microsoft" in version_info.lower() or "wsl" in version_info.lower():
                    safe_print("✅ WSL environment detected")
                else:
                    safe_print("✅ Native Linux environment")
        except:
            safe_print("✅ Linux environment (version check failed)")

    safe_print("✅ Environment validation completed")
    return True


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="env.py",
        description="Multi-AI File Paster MCP environment bootstrap"
    )
    parser.add_argument("--quick", "-q", action="store_true", help="Skip hash and deep dependency checks if core packages import")
    parser.add_argument("--force-reinstall", "-f", action="store_true", help="Force reinstall dependencies even if hash matches")
    parser.add_argument("--no-launch", action="store_true", help="Prepare environment only, do not start MCP server")
    parser.add_argument("--print-python", action="store_true", help="Print resolved Python interpreter path and exit")
    parser.add_argument("--status", action="store_true", help="Show environment status (python path, venv presence, hash state) and exit")
    parser.add_argument("--verbose", action="store_true", help="Verbose dependency installation (show full pip output)")
    parser.add_argument("--test-server", action="store_true", help="Test MCP server startup with visible output (diagnostic mode)")
    parser.add_argument("--validate-env", action="store_true", help="Validate complete environment setup and dependencies")
    return parser.parse_args()


def main() -> None:
    try:
        args = parse_args()
        script_dir = Path(__file__).parent
        root_dir = script_dir.parent
        global log_to_stderr
        if args.print_python or args.status or args.no_launch:
            log_to_stderr = False
        # Auto-detect if console encoding rejects check mark; if so enable ASCII mode dynamically
        global ascii_mode
        try:
            (sys.stderr if log_to_stderr else sys.stdout).write("✅\n")
        except UnicodeEncodeError:
            ascii_mode = True
        safe_print("🔧 Multi-AI File Paster MCP Environment Bootstrap")
        safe_print(f"📁 Project root: {root_dir}")
        safe_print(f"🖥️  Platform: {platform.system()} {platform.release()}")
        python_cmd = detect_python_executable()
        safe_print(f"🐍 Python executable: {python_cmd}")
        if args.print_python:
            return
        if args.status:
            venv_python, _ = get_venv_paths(root_dir)
            safe_print("🔍 Status:")
            safe_print(f"  • Venv present: {'yes' if venv_python.exists() else 'no'}")
            if venv_python.exists():
                safe_print(f"  • Venv interpreter: {venv_python}")
            req_hash = requirements_hash(root_dir)
            saved_hash = load_saved_hash(root_dir)
            safe_print(f"  • requirements.txt hash: {req_hash}")
            safe_print(f"  • Stored hash marker: {saved_hash if saved_hash else 'none'}")
            safe_print(f"  • Hash up-to-date: {'yes' if saved_hash and saved_hash == req_hash else 'no'}")
            safe_print(f"  • Core deps import check: {'ok' if check_dependencies_installed(root_dir) else 'missing'}")
            return
        if args.validate_env:
            if not validate_environment(root_dir):
                sys.exit(1)
            return
        if args.test_server:
            if not create_virtual_environment(root_dir, python_cmd):
                sys.exit(1)
            if not install_requirements(root_dir, force=args.force_reinstall, quick=args.quick, verbose=args.verbose):
                sys.exit(1)
            if not test_mcp_server(root_dir):
                sys.exit(1)
            return
        if not create_virtual_environment(root_dir, python_cmd):
            sys.exit(1)
        if not install_requirements(root_dir, force=args.force_reinstall, quick=args.quick, verbose=args.verbose):
            sys.exit(1)
        if args.no_launch:
            safe_print("ℹ️  Environment prepared; skipping launch (--no-launch)")
            return
        launch_mcp_server(root_dir)
    except Exception as e:
        safe_print(f"❌ Bootstrap failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
