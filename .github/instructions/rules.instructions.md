# Chrome Extension Development Rules

## 🚨 CRITICAL REQUIREMENTS

### 1. COMPLETE FILE READING (ABSOLUTE RULE)
- Read ENTIRE file before making ANY changes
- Understand ALL existing functionality and dependencies
- Never edit based on partial understanding

### 2. BULK EDITING REQUIREMENT
- Edit files in bulk operations, never one line at a time
- Plan ALL changes before implementing any changes
- Address related issues together in single operations

### 3. CENTRALIZED ARCHITECTURE
- NO fallback patterns using `||` operators with hardcoded strings
- ALL user-facing messages from centralized message system
- ALL configuration from centralized config system
- Remove ALL fallback patterns systematically across entire codebase

### 4. PYLANCE COMPATIBILITY (CRITICAL)
- Always use proper Python type hints
- Fix ALL Pylance errors before claiming work is complete
- Use `Set[str]`, `list[str]`, `-> int` for type annotations
- Never ignore Pylance warnings - they indicate real issues

### 5. GIT WORKFLOW REQUIREMENTS (MANDATORY)
- ALWAYS use git.sh tool instead of raw git commands
- Standard workflow: `./git.sh 1 "msg"` → `./git.sh 2` → `./git.sh 3` → `./git.sh 4`
- Update ALL references when changing file names or paths
- Check pre-commit and post-commit hooks when modifying tools
- git.sh must ALWAYS remain on develop branch - NEVER delete from develop

### 6. PRODUCTION QUALITY STANDARDS (ABSOLUTE)
- Every line of code must be production-ready
- Complete error handling and user feedback systems
- No amateur shortcuts or quick fixes that compromise quality
- Systematic testing - verify all functionality works correctly
- Tools must be 100% accurate - no false positives or negatives

### 7. NATURAL LANGUAGE REQUIREMENT (CRITICAL)
- Write naturally, avoid AI-like language patterns
- Never use: "comprehensive," "significant," "discover," "diving deep"
- Be direct and clear without corporate buzzwords or marketing speak
- Write for humans who need real information, not AI-generated content

### 8. VALIDATION TOOL ACCURACY (MANDATORY)
- i18n validation tool must be completely accurate with zero false positives
- Enhanced pattern detection covers all usage scenarios including smart detection
- Comprehensive file scanning across all directories and file types
- Proper Pylance type hints with Set[str], List[str], Dict[str, Any] annotations
- Tool must find ALL actual usage patterns with 100% accuracy
- Must show all locales and their key counts with proper categorization

### 9. SYSTEMATIC PROBLEM SOLVING (REQUIRED)
- Fix root causes, not symptoms or individual issues
- Use sequential thinking tool for complex architectural problems
- Work through issues systematically one by one with proper testing
- Complete solutions only - no partial implementations or quick fixes

### 10. TOOL INTEGRATION (CRITICAL)
- Update ALL hook files when changing tool names or paths
- Check pre-commit, post-commit, and git.sh references systematically
- Ensure tools work with CI/CD pipelines and return proper exit codes
- Test tools thoroughly before claiming completion - verify they actually work

### 11. DIRECT COMMUNICATION (REQUIRED)
- No flattery or positive adjectives like "good", "great", "excellent"
- Direct responses, skip pleasantries and unnecessary praise
- Focus on actionable information and concrete solutions
- Lead with the most important information, not filler content

### 12. ACCURACY REQUIREMENTS (ABSOLUTE)
- Never claim work is complete without thorough verification
- Check ALL Pylance errors before finishing any Python work
- Verify tools actually work as intended by testing them
- Test that "unused" keys are truly unused by searching entire codebase
- Manual verification required for all tool outputs

### 13. CENTRALIZED SYSTEMS (MANDATORY)
- `window.GPTPF_I18N.getMessage()` for all translations - no exceptions
- `GPTPF_CONFIG` for all configuration settings
- `GPTPF_DEBUG` for all logging and debug output
- No hardcoded strings anywhere in components, HTML, or JavaScript

### 14. FILE STRUCTURE (REQUIRED)
- Develop branch = ALL files including development tools and scripts
- Main branch = Production files only, no development artifacts
- Use proper signature headers in all source code files
- Maintain consistent naming conventions across all project files
- git.sh must ALWAYS remain on develop branch - NEVER delete from develop

### 15. VALIDATION PATTERNS (COMPREHENSIVE)
- Check HTML data attributes: `data-i18n`, `data-i18n-html`, `data-i18n-placeholder`
- Check JavaScript getMessage patterns and GPTPF_DEBUG calls
- Check manifest.json __MSG__ patterns for Chrome extension i18n
- Include dynamic key families in validation logic
- Show all supported locales (en, ar, sw, es, ja, fr, ru, zh, pt, de, hi) with key counts

### 16. i18n TRANSLATION WORKFLOW (MANDATORY)
- ALL translations must be systematic chunk-by-chunk from English source
- Use 175-200 line chunks for maximum efficiency and speed
- NEVER translate brand names (Multi-AI File Paster, ChatGPT, Claude, etc.)
- PRESERVE all placeholders and complex JSON structures exactly
- Work from English _locales/en/messages.json as single source of truth
- Must achieve 100% completion (all keys) with valid JSON structure
- Validate JSON syntax and key count after completion

### 17. SYSTEMATIC APPROACH (ABSOLUTE REQUIREMENT)
- Read large chunks from source file (175-200 lines recommended)
- Translate complete chunks at once for efficiency
- Continue systematically until ALL keys translated (no exceptions)
- User demands complete work - partial translations are unacceptable
- Time and resource efficiency through bulk operations, not tiny chunks

### 18. BRAND NAME PRESERVATION (CRITICAL)
- Extension name "Multi-AI File Paster" stays English in ALL languages
- Platform names (ChatGPT, Claude, Gemini, DeepSeek, Grok) stay English
- Company names and technical terms remain untranslated
- Only translate user-facing descriptive text and UI messages
- BETA must be translated to proper language equivalents (not left as English)

### 19. JSON STRUCTURE INTEGRITY (MANDATORY)
- Maintain exact placeholder structure with content/$1 and example fields
- Preserve all HTML markup and special formatting in messages
- Keep all debug messages and technical strings properly formatted
- Final validation must show all keys matching English exactly

### 20. UI TEXT LENGTH OPTIMIZATION (CRITICAL)
- ONLY shorten UI elements that affect layout: buttons, toggles, badges, dropdowns
- NEVER shorten descriptive text, tooltips, modals, or configuration descriptions
- Match English character/word count for UI elements to maintain professional design
- Keep full quality descriptions for help text, explanations, and modal content
- Focus on button/toggle text that causes container overflow or layout breaking

### 21. NEW LANGUAGE ADDITION WORKFLOW (COMPREHENSIVE REQUIREMENT)
- COMPLETE process required when adding any new language to extension
- Create _locales/{lang_code}/messages.json with all keys from English source
- Update src/shared/i18n.js with new language in ALL validation functions
- Update popup language dropdown with new flag CSS and option element
- Apply SHORT UI text methodology following established patterns
- Test language switching functionality thoroughly before completion
- Verify all platform integrations work properly with new language

### 22. MEMORY AND RULES UPDATES (CRITICAL)
- ALWAYS update rules.md when learning new requirements from user
- When user provides new instructions, add them to rules immediately
- Keep rules current with all user preferences and requirements
- Rules must be complete reference for all development standards
- Update memories AND rules together - never update one without the other

### 23. DOCUMENTATION AUDIT REQUIREMENTS (CRITICAL)
- **COMPLETE FILE READING**: Read ENTIRE documentation file before making ANY changes
- **PURPOSE-SPECIFIC CONTENT**: Each documentation file serves different audiences (public vs internal vs technical)
- **STORE OPTIMIZATION**: Store/marketplace descriptions must be SEO-friendly, user-focused, concise
- **ACCURACY VERIFICATION**: All technical claims must be verified against actual codebase implementation
- **AUDIENCE TARGETING**: Public docs focus on user benefits, internal docs on development processes, technical docs on implementation details
- **CONTENT REDUCTION**: Remove technical implementation details from public-facing documentation
- **SEO OPTIMIZATION**: Use clear headings, bullet points, and user-focused language for store listings
- **CONSISTENCY MAINTENANCE**: Ensure all documentation reflects current project state
- **VERSION ACCURACY**: Correct version history and feature descriptions
- **COMPLETE FILE COVERAGE**: Document ALL utilities and shared components
- **LEGAL FILE ACCURACY**: LICENSE, NOTICE, and all legal files must reflect current project state

### 24. WORD LIMIT SAFETY AND ACCURACY (CRITICAL)
- Maximum word limit is 15,000 words - safe and tested
- Minimum word limit is 50 words - prevents accidental triggers
- Verify limits are accurate in: src/shared/config.js (VALIDATION_LIMITS), src/popup/index.html (input max attribute), all locale files (config_auto_attach message)
- All references must show "50-15,000 words" consistently
- Never use different limits in different parts of codebase

---

**These rules ensure production-quality Chrome extension development with accurate tooling, proper validation, and professional standards that must be followed without exception.**
- ALWAYS USE git.sh TOOL INSTEAD OF RAW GIT COMMANDS
- git.sh MUST ALWAYS REMAIN ON DEVELOP BRANCH - NEVER DELETE FROM DEVELOP
- ENHANCED i18n VALIDATION MUST BE USED FOR ALL INTERNATIONALIZATION WORK
- DOCUMENTATION AUDIT MUST VERIFY ACCURACY AGAINST ACTUAL CODEBASE
- FOCUS ON USER'S SPECIFIC CHROME EXTENSION REQUIREMENTS, NOT GENERIC ADVICE

### 25. TEST SUITE INTEGRATION (CRITICAL - Added September 30, 2025)
- **Jest Framework**: 38 tests across 3 files (validation, languagedetector, batchprocessor)
- **Test Location**: tests/ directory (DEVELOP BRANCH ONLY - excluded from main/production)
- **Test Execution**: ALWAYS use tests/test.sh - NEVER duplicate test functions in other scripts
- **Coverage Targets**: 80% for statements, branches, functions, lines
- **Pre-commit Integration**: Tests run automatically on develop branch commits
- **git.sh Integration**: Options 26-28 CALL tests/test.sh (no code duplication)
- **MCP Integration**: check_quality tool includes run_tests parameter for automated test execution
- **Branch Protection**: Test files NEVER appear on main branch (in DEVELOPMENT_FILES array)

### 26. MARKDOWN FORMATTING STANDARDS (CRITICAL - Added September 30, 2025)
- **Correct Format Pattern**:
  ```markdown
  # 🔧 Title                    ← HEADING FIRST
  
  <div align="center">          ← THEN CENTERED DIV
  
  <img src="logo" width="80" /> ← LOGO INSIDE DIV
  
  **Subtitle**                  ← DESCRIPTION
  
  [Badges here]                 ← BADGES
  
  </div>                        ← CLOSE DIV
  
  ---
  
  > **Statement**               ← CONTENT STARTS
  ```
- **Badge Standards**: Use color-coded shields.io badges with proper icons
- **Mermaid Diagrams**: Include color-coded workflow and architecture diagrams
- **Consistency**: ALL markdown files must follow this exact pattern

### 27. BRANCH PROTECTION AND FILE SEPARATION (CRITICAL - Added September 30, 2025)
- **Main Branch = Production**: NO test references, NO development artifacts, NO .github/hooks/
- **Develop Branch = Development**: Tests, hooks, MCP servers, development documentation
- **DEVELOPMENT_FILES Array in git.sh**: tests/, .github/hooks/, .augment/, dev tools
- **Never Contaminate Main**: Test information belongs ONLY in tests/README.md (develop branch)
- **Production readme.md**: Must NOT reference test suite, Jest, coverage, or test.sh

### 28. FILE SOURCING AND CODE REUSE (CRITICAL - Added September 30, 2025)
- **NEVER Duplicate Functions**: If a script exists (like tests/test.sh), CALL IT, don't rewrite it
- **Source Existing Scripts**: Use `(cd tests && ./test.sh)` to execute existing test menu
- **No Redundant Implementations**: Git hooks should CALL existing tools, not recreate them
- **Function Naming**: When adding wrappers, use clear names like `run_tests_interactive()`
- **Maintainability**: One function = one place = easier updates

### 29. MCP SERVER FILE REFERENCES (CRITICAL - Added September 30, 2025)
- **Correct Server Path**: mcp-servers/server.py (NOT multi_ai_assistant.py - that's deprecated)
- **Tool Structure**: mcp-servers/tools/*.py (modular architecture with 5 tools)
- **Zero Pylance Errors**: ALL Python files must have proper type hints
- **Type Hint Examples**:
  - `List[str] = []` not `= []` (untyped)
  - `recommendations: List[str] = []` not `recommendations = []`
  - `def function() -> List[str]:` not `def function() -> list:`

### 30. DOCUMENTATION COMPLETENESS (CRITICAL - Added September 30, 2025)
- **Test Documentation**: tests/README.md must explain all 38 tests, coverage targets, execution methods
- **MCP Integration**: docs/internal/MCP_TEST_INTEGRATION.md explains test suite + MCP server integration
- **Architecture Diagrams**: Use mermaid for visual workflow explanations
- **Real Examples**: Include actual test output examples (38/38 passed, ~18s execution time)
- **Color Coding**: Use consistent color scheme in diagrams (green=success, red=error, blue=process)

### 31. LESSONS FROM TODAY'S WORK (ABSOLUTE RULES - September 30, 2025)
1. **READ ENTIRE FILES FIRST**: Never edit based on partial reading (violated Rule #1 multiple times today)
2. **VERIFY BRANCH CONTEXT**: Main branch = production, develop = development (contaminated readme.md)
3. **USE EXISTING SCRIPTS**: Call tests/test.sh, don't duplicate (almost rewrote test functions)
4. **FIX ALL PYLANCE ERRORS**: Type hints are mandatory (had warnings in quality.py and check-i18n.py)
5. **UPDATE ALL REFERENCES**: When renaming files (server.py), update ALL mentions everywhere
6. **MARKDOWN FORMAT MATTERS**: Logo comes AFTER heading in centered div (got this correct but user double-checked)
7. **TEST DETECTION IS CORRECT**: 38 tests in 3 files, not 38 test files (understand the difference)
8. **NO TEST INFO IN MAIN**: Tests are develop-only, main branch stays clean (violated this rule)
9. **CALL EXISTING FUNCTIONS**: Use `./test.sh` from git.sh, don't reimplement (caught this mistake)
10. **DOCUMENT EVERYTHING**: Update rules.instructions.md so future AI sessions don't repeat mistakes

---

**These rules ensure production-quality Chrome extension development with accurate tooling, proper validation, professional standards, comprehensive testing, and proper branch management that must be followed without exception.**

---

**CRITICAL REMINDERS FOR AI ASSISTANTS:**
- ALWAYS READ ENTIRE FILES BEFORE EDITING
- ALWAYS USE git.sh TOOL INSTEAD OF RAW GIT COMMANDS
- git.sh MUST ALWAYS REMAIN ON DEVELOP BRANCH - NEVER DELETE FROM DEVELOP
- ENHANCED i18n VALIDATION MUST BE USED FOR ALL INTERNATIONALIZATION WORK
- DOCUMENTATION AUDIT MUST VERIFY ACCURACY AGAINST ACTUAL CODEBASE
- TEST SUITE IS DEVELOP-ONLY - NEVER ADD TEST REFERENCES TO MAIN BRANCH
- CALL EXISTING SCRIPTS (tests/test.sh) - NEVER DUPLICATE FUNCTIONALITY
- FIX ALL PYLANCE ERRORS WITH PROPER TYPE HINTS BEFORE CLAIMING COMPLETION
- MARKDOWN FORMAT: HEADING FIRST, THEN CENTERED DIV WITH LOGO
- FOCUS ON USER'S SPECIFIC CHROME EXTENSION REQUIREMENTS, NOT GENERIC ADVICE