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

### 15. VALIDATION PATTERNS (COMPREHENSIVE)
- Check HTML data attributes: `data-i18n`, `data-i18n-html`, `data-i18n-placeholder`
- Check JavaScript getMessage patterns and GPTPF_DEBUG calls
- Check manifest.json __MSG__ patterns for Chrome extension i18n
- Include dynamic key families in validation logic
- Show all supported locales (en, ar, sw, es, ja, fr, ru, zh, pt) with key counts

### 16. LANGUAGE SYNCHRONIZATION (CRITICAL)
- ALL language changes in main popup MUST sync to content scripts in real-time
- Use message passing pattern identical to theme synchronization
- Content popup modal must respond to language changes without page refresh
- NO "please wait" overlays in content scripts (popup-only UI elements)
- Language sync function must be available globally on window object
- Content script must listen for 'setLanguage' action messages
- Existing modal event listeners for 'gptpf:translations-updated' must work seamlessly

### 17. MEMORY AND RULES UPDATES (CRITICAL)
- ALWAYS update rules.md when learning new requirements from user
- When user provides new instructions, add them to rules immediately
- Keep rules current with all user preferences and requirements
- Rules must be complete reference for all development standards
- Update memories AND rules together - never update one without the other

### 18. NEW LANGUAGE ADDITION WORKFLOW (CRITICAL)
- Create complete locale file (_locales/{lang}/messages.json) with ALL 672 keys
- Update i18n system (src/shared/i18n.js) to include new language in ALL validation functions
- Add language option to popup UI (src/popup/index.html) with proper flag CSS class
- Add CSS flag styling (src/popup/styles.css) with color variables and flag design
- MUST add new locale to web_accessible_resources in manifest.json following established pattern
- Add missing language keys (language_{lang}, language_abbreviation_{lang}) to ALL existing locales
- Run i18n validation tool to verify 100% completion with no false positives
- ALL steps must be completed systematically - no partial implementations allowed

### 19. TRANSLATION METHODOLOGY REQUIREMENTS (CRITICAL)
- **SYSTEMATIC CHUNK APPROACH**: Work in 175-200 line chunks for maximum efficiency
- **DUAL FILE READING**: Read BOTH English AND Swahili files for EACH chunk to understand SHORT UI patterns
- **BRAND NAME PRESERVATION**: NEVER translate brand names (Multi-AI File Paster, ChatGPT, Claude, etc.) BUT BETA must be translated in all locales as it's a status indicator, not a brand name
- **JSON STRUCTURE INTEGRITY**: PRESERVE all placeholders and complex JSON structures exactly
- **COMPLETION REQUIREMENT**: Must achieve 672/672 keys (100% completion) with valid JSON structure
- **VALIDATION REQUIREMENT**: Validate JSON syntax and key count after completion

### 20. TRANSLATION APPROACH REQUIREMENTS (CRITICAL)
- **FULL TRANSLATIONS REQUIRED**: Descriptions, tooltips, modal content, help text, explanatory messages
  - Translate completely and naturally for target audience
  - Users expect full, clear explanations in their language
  - Maintain professional quality and cultural appropriateness
  - Technical documentation requires complete translation
- **SHORT TRANSLATIONS ONLY**: UI elements that directly affect layout (buttons, toggles, labels, badges, dropdowns)
  - These can be shortened like toast messages to prevent layout breaking
  - Focus on elements that cause container overflow or visual issues
  - Examples: "Auto", "Retour", "Config", "Manuel", "Délai"
- **CONTEXT-AWARE APPROACH**: Understand message purpose and translate appropriately
  - Button/toggle text = layout-conscious translation following Swahili SHORT patterns
  - Error messages = clear, complete translation
  - Always check existing Swahili locale for SHORT UI text patterns to follow

### 21. VALIDATION TOOL REQUIREMENTS (MANDATORY)
- Use validation tool at `.github/hooks/check-i18n.py` for all i18n work
- Tool must be completely accurate with zero false positives
- Update tool to automatically detect available locales instead of hardcoded language checks
- Tool should scan `_locales` directory and validate all found language folders
- Ensure tool works with CI/CD pipelines and returns proper exit codes
- Show all supported locales (en, ar, sw, es, ja, fr, ru, zh, pt, de) with key counts

---

**These rules ensure production-quality Chrome extension development with accurate tooling, proper validation, and professional standards that must be followed without exception.**
- ALWAYS USE git.sh TOOL INSTEAD OF RAW GIT COMMANDS
- ENHANCED i18n VALIDATION MUST BE USED FOR ALL INTERNATIONALIZATION WORK
- REMOVE ALL COMMENTS FROM PRODUCTION CODE USING THE COMMENT REMOVAL TOOL
- FOCUS ON USER'S SPECIFIC CHROME EXTENSION REQUIREMENTS, NOT GENERIC ADVICE