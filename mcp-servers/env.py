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
    env["PIP_DISABLE_PIP_VERSION_CHECK"] = "1"
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
    server_script = root_dir / "mcp-servers" / "server.py"
    if not server_script.exists():
        raise FileNotFoundError(f"MCP server script not found: {server_script}")
    safe_print(f"🚀 Launching MCP server: {server_script}")
    os.execv(str(python_exe), [str(python_exe), str(server_script)])


def test_mcp_server(root_dir: Path) -> bool:
    """Test MCP server startup with visible output for diagnostics."""
    python_exe, _ = get_venv_paths(root_dir)
    server_script = root_dir / "mcp-servers" / "server.py"

    if not server_script.exists():
        safe_print(f"❌ MCP server script not found: {server_script}")
        return False

    safe_print(f"🧪 Testing MCP server startup: {server_script}")
    safe_print(f"🐍 Using Python: {python_exe}")

    try:
        result = subprocess.run([str(python_exe), "-c", "import mcp; print('MCP import: OK')"],
                               capture_output=True, text=True, timeout=10)
        if result.returncode != 0:
            safe_print(f"❌ MCP import failed: {result.stderr}")
            return False
        safe_print(f"✅ {result.stdout.strip()}")

        server_script = root_dir / "mcp-servers" / "server.py"
        result = subprocess.run([str(python_exe), "-m", "py_compile", str(server_script)],
                               capture_output=True, text=True, timeout=10)
        if result.returncode != 0:
            safe_print(f"❌ Server script syntax error: {result.stderr}")
            return False
        safe_print("✅ Server script syntax: OK")

        safe_print("🔄 Testing server startup (will timeout after 3 seconds - this is expected)...")
        try:
            result = subprocess.run([str(python_exe), str(server_script)],
                                   capture_output=True, text=True, timeout=3)
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

    if not python_exe.exists():
        safe_print("❌ Virtual environment Python not found")
        return False
    safe_print(f"✅ Virtual environment: {python_exe}")

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

    server_script = root_dir / "mcp-servers" / "multi_ai_assistant.py"
    if not server_script.exists():
        safe_print(f"❌ Server script not found: {server_script}")
        return False
    safe_print(f"✅ Server script: {server_script}")

    safe_print(f"✅ Platform: {platform.system()} {platform.release()}")

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
    parser.add_argument("--menu", "-m", action="store_true", help="Show interactive menu")
    parser.add_argument("--quick", "-q", action="store_true", help="Skip hash and deep dependency checks if core packages import")
    parser.add_argument("--force-reinstall", "-f", action="store_true", help="Force reinstall dependencies even if hash matches")
    parser.add_argument("--no-launch", action="store_true", help="Prepare environment only, do not start MCP server")
    parser.add_argument("--print-python", action="store_true", help="Print resolved Python interpreter path and exit")
    parser.add_argument("--status", action="store_true", help="Show environment status (python path, venv presence, hash state) and exit")
    parser.add_argument("--verbose", action="store_true", help="Verbose dependency installation (show full pip output)")
    parser.add_argument("--test-server", action="store_true", help="Test MCP server startup with visible output (diagnostic mode)")
    parser.add_argument("--validate-env", action="store_true", help="Validate complete environment setup and dependencies")
    return parser.parse_args()


def show_interactive_menu(root_dir: Path, python_cmd: str) -> None:
    """Interactive menu system for MCP environment management."""
    while True:
        # Check server status
        mcp_running = is_mcp_server_running(root_dir)
        
        safe_print("\n" + "="*70)
        safe_print("🔧 Multi-AI File Paster MCP Environment Manager")
        safe_print("="*70)
        
        # Show server status
        if mcp_running:
            safe_print("🟢 MCP Server Status: RUNNING")
        else:
            safe_print("🔴 MCP Server Status: STOPPED")
        
        safe_print("")
        safe_print("📋 SETUP & INSTALLATION")
        safe_print("  [1] Setup Environment (Create venv + Install dependencies)")
        safe_print("  [2] Setup Environment (Quick mode - skip checks)")
        safe_print("  [3] Force Reinstall Dependencies")
        safe_print("")
        safe_print("🔍 DIAGNOSTICS & VALIDATION")
        safe_print("  [4] Show Environment Status")
        safe_print("  [5] Validate Environment")
        safe_print("  [6] Test Server Startup")
        safe_print("  [7] Print Python Interpreter Path")
        safe_print("")
        safe_print("🚀 LAUNCH & SHUTDOWN")
        
        if mcp_running:
            safe_print("  [8] Launch MCP Server (⚠️  Server already running!)")
        else:
            safe_print("  [8] Launch MCP Server")
        
        safe_print("  [9] Shutdown & Clean Environment")
        safe_print("")
        safe_print("💡 HELP")
        safe_print("  [h] Show Command-Line Usage")
        safe_print("  [q] Quit Menu")
        safe_print("")
        safe_print("="*70)
        
        try:
            choice = input("Enter your choice: ").strip().lower()
        except (KeyboardInterrupt, EOFError):
            safe_print("\n👋 Exiting menu...")
            sys.exit(0)
        
        if choice == "q":
            safe_print("👋 Exiting menu...")
            if mcp_running:
                safe_print("ℹ️  MCP server is still running in the background")
                safe_print("💡 Use option [9] to shutdown the server if needed")
            break
        elif choice == "h":
            show_cli_help()
        elif choice == "1":
            safe_print("\n🔧 Setting up environment...")
            if not create_virtual_environment(root_dir, python_cmd):
                safe_print("❌ Setup failed")
                continue
            if not install_requirements(root_dir, force=False, quick=False, verbose=False):
                safe_print("❌ Setup failed")
                continue
            safe_print("✅ Environment setup completed!")
        elif choice == "2":
            safe_print("\n🔧 Setting up environment (quick mode)...")
            if not create_virtual_environment(root_dir, python_cmd):
                safe_print("❌ Setup failed")
                continue
            if not install_requirements(root_dir, force=False, quick=True, verbose=False):
                safe_print("❌ Setup failed")
                continue
            safe_print("✅ Environment setup completed (quick mode)!")
        elif choice == "3":
            safe_print("\n🔧 Force reinstalling dependencies...")
            if not install_requirements(root_dir, force=True, quick=False, verbose=True):
                safe_print("❌ Reinstall failed")
                continue
            safe_print("✅ Dependencies reinstalled successfully!")
        elif choice == "4":
            safe_print("\n🔍 Environment Status:")
            show_status(root_dir)
        elif choice == "5":
            safe_print("\n🔍 Validating environment...")
            if validate_environment(root_dir):
                safe_print("✅ Environment validation passed!")
            else:
                safe_print("❌ Environment validation failed")
        elif choice == "6":
            safe_print("\n🧪 Testing server startup...")
            if test_mcp_server(root_dir):
                safe_print("✅ Server test passed!")
            else:
                safe_print("❌ Server test failed")
        elif choice == "7":
            safe_print(f"\n🐍 Python Interpreter: {python_cmd}")
            venv_python, _ = get_venv_paths(root_dir)
            if venv_python.exists():
                safe_print(f"🐍 Virtual Environment Python: {venv_python}")
        elif choice == "8":
            if mcp_running:
                safe_print("\n⚠️  WARNING: MCP server is already running!")
                safe_print("� Opening another instance may cause conflicts")
                try:
                    confirm = input("Continue anyway? (yes/no): ").strip().lower()
                except (KeyboardInterrupt, EOFError):
                    safe_print("\n❌ Launch cancelled")
                    continue
                
                if confirm != "yes":
                    safe_print("❌ Launch cancelled")
                    continue
            
            safe_print("\n�🚀 Launching MCP server...")
            safe_print("💡 Server will run in foreground - press Ctrl+C to stop")
            safe_print("💡 Or run 'python3 env.py --menu' in another terminal to manage")
            safe_print("")
            launch_mcp_server(root_dir)
        elif choice == "9":
            safe_print("\n🛑 Shutdown & Clean Environment")
            safe_print("="*70)
            if mcp_running:
                safe_print("⚠️  WARNING: MCP server is currently running!")
                safe_print("💡 This will attempt to terminate the server process")
            shutdown_and_clean(root_dir)
        else:
            safe_print(f"❌ Invalid choice: {choice}")
            safe_print("💡 Please enter a number (1-9), 'h' for help, or 'q' to quit")


def show_cli_help() -> None:
    """Show command-line usage help."""
    safe_print("\n" + "="*70)
    safe_print("📚 COMMAND-LINE USAGE")
    safe_print("="*70)
    safe_print("")
    safe_print("BASIC USAGE:")
    safe_print("  python3 mcp-servers/env.py                    # Setup and launch server")
    safe_print("  python3 mcp-servers/env.py --menu             # Show this interactive menu")
    safe_print("")
    safe_print("SETUP OPTIONS:")
    safe_print("  --quick, -q                   # Quick setup (skip detailed checks)")
    safe_print("  --force-reinstall, -f         # Force reinstall all dependencies")
    safe_print("  --no-launch                   # Setup only, don't launch server")
    safe_print("  --verbose                     # Show detailed pip output")
    safe_print("")
    safe_print("DIAGNOSTIC OPTIONS:")
    safe_print("  --status                      # Show environment status")
    safe_print("  --validate-env                # Validate complete environment")
    safe_print("  --test-server                 # Test server startup")
    safe_print("  --print-python                # Show Python interpreter path")
    safe_print("")
    safe_print("EXAMPLES:")
    safe_print("  # First time setup on WSL/Ubuntu")
    safe_print("  python3 mcp-servers/env.py --no-launch")
    safe_print("")
    safe_print("  # Quick setup and launch")
    safe_print("  python3 mcp-servers/env.py --quick")
    safe_print("")
    safe_print("  # Check if everything is working")
    safe_print("  python3 mcp-servers/env.py --validate-env")
    safe_print("")
    safe_print("  # Fix broken dependencies")
    safe_print("  python3 mcp-servers/env.py --force-reinstall --verbose")
    safe_print("")
    safe_print("="*70)


def show_status(root_dir: Path) -> None:
    """Show detailed environment status."""
    venv_python, _ = get_venv_paths(root_dir)
    safe_print(f"  • Platform: {platform.system()} {platform.release()}")
    
    if platform.system() == "Linux":
        try:
            with open("/proc/version", "r") as f:
                version_info = f.read()
                if "microsoft" in version_info.lower() or "wsl" in version_info.lower():
                    safe_print("  • Environment: WSL (Windows Subsystem for Linux)")
                else:
                    safe_print("  • Environment: Native Linux")
        except:
            safe_print("  • Environment: Linux (unknown variant)")
    
    safe_print(f"  • Virtual environment: {'✅ Exists' if venv_python.exists() else '❌ Not created'}")
    
    if venv_python.exists():
        safe_print(f"  • Venv interpreter: {venv_python}")
        try:
            result = subprocess.run([str(venv_python), "--version"], capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                safe_print(f"  • Python version: {result.stdout.strip()}")
        except:
            pass
    
    req_hash = requirements_hash(root_dir)
    saved_hash = load_saved_hash(root_dir)
    safe_print(f"  • requirements.txt hash: {req_hash[:16]}...")
    safe_print(f"  • Stored hash: {(saved_hash[:16] + '...') if saved_hash else 'none'}")
    safe_print(f"  • Dependencies: {'✅ Up to date' if saved_hash and saved_hash == req_hash else '⚠️  Need installation/update'}")
    
    deps_ok = check_dependencies_installed(root_dir)
    safe_print(f"  • Core packages (MCP): {'✅ Installed' if deps_ok else '❌ Missing'}")
    
    server_script = root_dir / "mcp-servers" / "server.py"
    safe_print(f"  • Server script: {'✅ Found' if server_script.exists() else '❌ Missing'}")


def shutdown_and_clean(root_dir: Path) -> None:
    """Shutdown MCP server and clean virtual environment."""
    import shutil
    
    venv_dir = root_dir / ".venv"
    
    if not venv_dir.exists():
        safe_print("ℹ️  No virtual environment found - nothing to clean")
        safe_print("📂 .venv directory does not exist")
        return
    
    safe_print("⚠️  WARNING: This will permanently delete the virtual environment!")
    safe_print(f"📂 Target directory: {venv_dir}")
    safe_print("")
    safe_print("This action will:")
    safe_print("  • Terminate any running MCP server processes")
    safe_print("  • Delete the entire .venv folder and all installed packages")
    safe_print("  • Remove dependency hash markers")
    safe_print("  • Return to a clean development state")
    safe_print("")
    
    try:
        confirmation = input("Type 'YES' (uppercase) to confirm deletion: ").strip()
    except (KeyboardInterrupt, EOFError):
        safe_print("\n❌ Shutdown cancelled by user")
        return
    
    if confirmation != "YES":
        safe_print("❌ Shutdown cancelled - confirmation did not match 'YES'")
        return
    
    safe_print("\n🛑 Starting shutdown and cleanup...")
    
    # Try to terminate any Python processes from this venv
    venv_python, _ = get_venv_paths(root_dir)
    if venv_python.exists():
        safe_print("🔍 Checking for running MCP server processes...")
        try:
            if platform.system() == "Windows":
                # Windows: tasklist and taskkill
                result = subprocess.run(
                    ["tasklist", "/FI", f"IMAGENAME eq python.exe"],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                if "python.exe" in result.stdout:
                    safe_print("⚠️  Python processes detected - they may be terminated")
            else:
                # Linux/macOS: ps and pkill
                python_path_str = str(venv_python)
                result = subprocess.run(
                    ["pgrep", "-f", python_path_str],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                if result.stdout.strip():
                    pids = result.stdout.strip().split('\n')
                    safe_print(f"🔍 Found {len(pids)} process(es) using venv Python")
                    for pid in pids:
                        try:
                            subprocess.run(["kill", "-9", pid], timeout=2)
                            safe_print(f"✅ Terminated process {pid}")
                        except:
                            safe_print(f"⚠️  Could not terminate process {pid}")
        except (subprocess.TimeoutExpired, FileNotFoundError):
            safe_print("ℹ️  Process check skipped (command not available)")
    
    # Delete .venv directory
    safe_print(f"🗑️  Removing .venv directory: {venv_dir}")
    try:
        shutil.rmtree(venv_dir)
        safe_print("✅ Virtual environment deleted successfully")
    except PermissionError as e:
        safe_print(f"❌ Permission denied - close any programs using the venv")
        safe_print(f"   Error: {e}")
        return
    except Exception as e:
        safe_print(f"❌ Failed to delete .venv: {e}")
        return
    
    safe_print("")
    safe_print("="*70)
    safe_print("✅ SHUTDOWN COMPLETE")
    safe_print("="*70)
    safe_print("📊 Summary:")
    safe_print("  • Virtual environment removed")
    safe_print("  • All packages uninstalled")
    safe_print("  • Clean development state restored")
    safe_print("")
    safe_print("💡 To set up again, choose option [1] from the menu")
    safe_print("="*70)



def is_mcp_server_running(root_dir: Path) -> bool:
    """Check if MCP server is already running."""
    venv_python, _ = get_venv_paths(root_dir)
    if not venv_python.exists():
        return False
    
    try:
        if platform.system() == "Windows":
            # Windows: check for python.exe running server.py
            result = subprocess.run(
                ["tasklist", "/FI", "IMAGENAME eq python.exe", "/FO", "CSV"],
                capture_output=True,
                text=True,
                timeout=3
            )
            return "server.py" in result.stdout
        else:
            # Linux/macOS: check for processes running server.py
            server_script = root_dir / "mcp-servers" / "server.py"
            result = subprocess.run(
                ["pgrep", "-f", str(server_script)],
                capture_output=True,
                text=True,
                timeout=3
            )
            return bool(result.stdout.strip())
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return False


def main() -> None:
    try:
        args = parse_args()
        script_dir = Path(__file__).parent
        root_dir = script_dir.parent
        global log_to_stderr
        if args.print_python or args.status or args.no_launch:
            log_to_stderr = False
        global ascii_mode
        try:
            (sys.stderr if log_to_stderr else sys.stdout).write("✅\n")
        except UnicodeEncodeError:
            ascii_mode = True
        
        python_cmd = detect_python_executable()
        
        # Check if MCP server is already running
        mcp_running = is_mcp_server_running(root_dir)
        
        # If --menu flag OR server is already running, show menu
        if args.menu or mcp_running:
            if mcp_running and not args.menu:
                safe_print("ℹ️  MCP server is already running")
                safe_print("📋 Opening interactive menu for management...\n")
            show_interactive_menu(root_dir, python_cmd)
            return
        
        safe_print("🔧 Multi-AI File Paster MCP Environment Bootstrap")
        safe_print(f"📁 Project root: {root_dir}")
        safe_print(f"🖥️  Platform: {platform.system()} {platform.release()}")
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
        
        safe_print("")
        safe_print("💡 TIP: Use 'python3 env.py --menu' or just 'python3 env.py' when server is running for management menu")
        safe_print("")
        
        launch_mcp_server(root_dir)
    except Exception as e:
        safe_print(f"❌ Bootstrap failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
