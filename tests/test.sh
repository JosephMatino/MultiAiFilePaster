#!/bin/bash
# ================================================================================
# MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
# CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
# ================================================================================
#
# SCRIPT: tests/test.sh
# FUNCTION: Interactive test suite menu for Jest testing operations
# ARCHITECTURE: User-friendly CLI interface for common testing workflows
# SECURITY: Local execution only, no external dependencies
# PERFORMANCE: Fast menu navigation with clear feedback
# COMPATIBILITY: Bash 4+, works on Ubuntu, WSL, macOS
#
# COPYRIGHT © 2025 HOSTWEK LTD. ALL RIGHTS RESERVED.
# DEVELOPED BY JOSEPH MATINO UNDER WEKTURBO DESIGNS - HOSTWEK LTD
# LICENSED UNDER HOSTWEK CUSTOM LICENSE
# ================================================================================

set -e

# Color codes for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if node_modules exists
check_dependencies() {
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️  Dependencies not installed!${NC}"
        echo -e "${CYAN}Installing test dependencies...${NC}"
        npm install
        echo -e "${GREEN}✅ Dependencies installed${NC}"
        echo ""
    fi
}

# Display banner
show_banner() {
    clear
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  ${BOLD}Multi-AI File Paster - Test Suite Manager${NC}             ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${MAGENTA}Jest 29.7.0 | 105 Tests | 65% Coverage Target${NC}         ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Display menu
show_menu() {
    echo -e "${BOLD}Testing Operations:${NC}"
    echo ""
    echo -e "  ${GREEN}1${NC}) Run All Tests (fast, no coverage)"
    echo -e "  ${GREEN}2${NC}) Run Tests with Coverage Report"
    echo -e "  ${GREEN}3${NC}) Run Tests in Watch Mode"
    echo -e "  ${GREEN}4${NC}) Run Specific Test File"
    echo -e "  ${GREEN}5${NC}) View Last Test Results Summary"
    echo -e "  ${GREEN}6${NC}) Clean Test Artifacts"
    echo ""
    echo -e "  ${BLUE}7${NC}) View Test Documentation"
    echo -e "  ${BLUE}8${NC}) Check Test Environment"
    echo ""
    echo -e "  ${RED}0${NC}) Exit"
    echo ""
    echo -ne "${BOLD}Select option:${NC} "
}

# Run all tests
run_all_tests() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Running All Tests (No Coverage)${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    node node_modules/jest/bin/jest.js --no-coverage

    echo ""
    echo -e "${GREEN}✅ Test execution complete${NC}"
    read -p "Press Enter to continue..."
}

# Run tests with coverage
run_coverage() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Running Tests with Coverage Analysis${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    node node_modules/jest/bin/jest.js --coverage

    echo ""
    echo -e "${GREEN}✅ Coverage report generated at coverage/lcov-report/index.html${NC}"
    
    # Ask if user wants to open coverage report
    read -p "Open coverage report in browser? (y/n): " open_coverage
    if [[ "$open_coverage" == "y" || "$open_coverage" == "Y" ]]; then
        if command -v xdg-open &> /dev/null; then
            xdg-open coverage/lcov-report/index.html
        elif command -v open &> /dev/null; then
            open coverage/lcov-report/index.html
        else
            echo -e "${YELLOW}Unable to open browser automatically${NC}"
            echo "Open: coverage/lcov-report/index.html"
        fi
    fi
    
    read -p "Press Enter to continue..."
}

# Run tests in watch mode
run_watch() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Running Tests in Watch Mode${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Press 'q' to quit watch mode${NC}"
    echo ""

    node node_modules/jest/bin/jest.js --watch
}

# Run specific test file
run_specific() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Run Specific Test File${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Available test files:"
    echo ""
    echo "Unit Tests:"
    echo "  1) validation.test.js       (12 tests - GPTPF_VALIDATION)"
    echo "  2) batchprocessor.test.js   (11 tests - GPTPF_BATCH)"
    echo "  3) languagedetector.test.js (15 tests - LanguageDetector)"
    echo ""
    echo "Integration Tests:"
    echo "  4) platform-factory.test.js (12 tests - PlatformFactory)"
    echo "  5) config.test.js           (20 tests - Configuration)"
    echo "  6) file-attachment.test.js  (35 tests - File Operations)"
    echo ""
    read -p "Select test file (1-6): " file_choice
    
    case $file_choice in
        1)
            echo ""
            node node_modules/jest/bin/jest.js unit/validation.test.js
            ;;
        2)
            echo ""
            node node_modules/jest/bin/jest.js unit/batchprocessor.test.js
            ;;
        3)
            echo ""
            node node_modules/jest/bin/jest.js unit/languagedetector.test.js
            ;;
        4)
            echo ""
            node node_modules/jest/bin/jest.js integration/platform-factory.test.js
            ;;
        5)
            echo ""
            node node_modules/jest/bin/jest.js integration/config.test.js
            ;;
        6)
            echo ""
            node node_modules/jest/bin/jest.js integration/file-attachment.test.js
            ;;
        *)
            echo -e "${RED}Invalid selection${NC}"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
}

# View test results summary
view_summary() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Test Results Summary${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ ! -f "../.test-results.tmp" ]; then
        echo -e "${YELLOW}No recent test results found${NC}"
        echo ""
        echo "Run tests first to generate results summary"
    else
        cat ../.test-results.tmp
        echo ""
        echo -e "${GREEN}✅ Latest test run results${NC}"
    fi
    
    echo ""
    
    # Show test file breakdown
    echo -e "${BOLD}Test Suite Breakdown:${NC}"
    echo ""
    echo -e "${BOLD}Unit Tests (38 tests):${NC}"
    echo -e "  ${GREEN}validation.test.js${NC}       - 12 tests"
    echo "    • sanitizeFileName (6 tests)"
    echo "    • validateCustomExtension (3 tests)"
    echo "    • Utility functions (3 tests)"
    echo ""
    echo -e "  ${GREEN}batchprocessor.test.js${NC}   - 11 tests"
    echo "    • splitContent (5 tests)"
    echo "    • generateFilename (2 tests)"
    echo "    • BatchProcessor class (4 tests)"
    echo ""
    echo -e "  ${GREEN}languagedetector.test.js${NC} - 15 tests"
    echo "    • detectLanguage (8 tests)"
    echo "    • getFileExtension (3 tests)"
    echo "    • fenceHint (2 tests)"
    echo "    • isValidJSON (2 tests)"
    echo ""
    echo -e "${BOLD}Integration Tests (67 tests):${NC}"
    echo -e "  ${GREEN}platform-factory.test.js${NC} - 12 tests"
    echo "    • Platform detection and configuration"
    echo ""
    echo -e "  ${GREEN}config.test.js${NC}           - 20 tests"
    echo "    • Configuration management and persistence"
    echo ""
    echo -e "  ${GREEN}file-attachment.test.js${NC}  - 35 tests"
    echo "    • File creation, naming, and MIME types"
    echo ""
    echo -e "${BOLD}Total: 105 tests, Target: 100% pass rate${NC}"
    
    echo ""
    read -p "Press Enter to continue..."
}

# Clean test artifacts
clean_artifacts() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Clean Test Artifacts${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    echo "This will remove:"
    echo "  • coverage/ directory"
    echo "  • .test-results.tmp"
    echo "  • Jest cache"
    echo ""
    read -p "Continue? (y/n): " confirm
    
    if [[ "$confirm" == "y" || "$confirm" == "Y" ]]; then
        echo ""
        echo "Cleaning..."
        
        rm -rf coverage
        rm -f ../.test-results.tmp
        npm cache clean --force 2>/dev/null || true
        
        echo ""
        echo -e "${GREEN}✅ Artifacts cleaned${NC}"
    else
        echo ""
        echo "Cancelled"
    fi
    
    echo ""
    read -p "Press Enter to continue..."
}

# View documentation
view_docs() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Test Documentation${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ -f "README.md" ]; then
        echo -e "${GREEN}Test README available at: tests/README.md${NC}"
        echo ""
        read -p "View README now? (y/n): " view_readme
        
        if [[ "$view_readme" == "y" || "$view_readme" == "Y" ]]; then
            if command -v less &> /dev/null; then
                less README.md
            else
                cat README.md | head -100
                echo ""
                echo "(First 100 lines shown)"
            fi
        fi
    else
        echo -e "${YELLOW}README.md not found${NC}"
    fi
    
    echo ""
    echo -e "${BOLD}Additional Documentation:${NC}"
    echo "  • MCP Integration: ../docs/internal/MCP_TEST_INTEGRATION.md"
    echo "  • Features Status: ../docs/internal/features.md"
    echo "  • Technical Docs: ../docs/internal/TECHNICAL_DOCS.md"
    
    echo ""
    read -p "Press Enter to continue..."
}

# Check test environment
check_environment() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Test Environment Check${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    echo -e "${BOLD}Node.js:${NC}"
    if command -v node &> /dev/null; then
        echo -e "  ✅ $(node --version)"
    else
        echo -e "  ${RED}❌ Not installed${NC}"
    fi
    
    echo ""
    echo -e "${BOLD}npm:${NC}"
    if command -v npm &> /dev/null; then
        echo -e "  ✅ $(npm --version)"
    else
        echo -e "  ${RED}❌ Not installed${NC}"
    fi
    
    echo ""
    echo -e "${BOLD}Dependencies:${NC}"
    if [ -d "node_modules" ]; then
        echo -e "  ✅ Installed"
        
        # Check Jest
        if [ -d "node_modules/jest" ]; then
            jest_version=$(npm list jest --depth=0 2>/dev/null | grep jest@ | sed 's/.*jest@//')
            echo -e "  ✅ Jest $jest_version"
        fi
    else
        echo -e "  ${RED}❌ Not installed (run: npm install)${NC}"
    fi
    
    echo ""
    echo -e "${BOLD}Test Files:${NC}"
    test_count=$(find unit -name "*.test.js" 2>/dev/null | wc -l)
    echo -e "  ✅ $test_count test files found"
    
    echo ""
    echo -e "${BOLD}Configuration:${NC}"
    if [ -f "jest.config.js" ]; then
        echo -e "  ✅ jest.config.js"
    else
        echo -e "  ${RED}❌ jest.config.js missing${NC}"
    fi
    
    if [ -f "setup.js" ]; then
        echo -e "  ✅ setup.js (Chrome API mocks)"
    else
        echo -e "  ${RED}❌ setup.js missing${NC}"
    fi
    
    echo ""
    echo -e "${BOLD}Coverage:${NC}"
    if [ -d "coverage" ]; then
        echo -e "  ✅ coverage/ directory exists"
        echo "     View: coverage/lcov-report/index.html"
    else
        echo -e "  ⚠️  No coverage reports yet (run: npm run test:coverage)"
    fi
    
    echo ""
    read -p "Press Enter to continue..."
}

# Main loop
main() {
    check_dependencies
    
    while true; do
        show_banner
        show_menu
        
        read -r choice
        echo ""
        
        case $choice in
            1) run_all_tests ;;
            2) run_coverage ;;
            3) run_watch ;;
            4) run_specific ;;
            5) view_summary ;;
            6) clean_artifacts ;;
            7) view_docs ;;
            8) check_environment ;;
            0)
                echo -e "${GREEN}Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option. Please try again.${NC}"
                sleep 2
                ;;
        esac
    done
}

# Run main function
main
