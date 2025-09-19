---
applyTo: '---
type: "always_apply"
description: "Example description"
---

### 1. COMPLETE FILE READING REQUIREMENT (ABSOLUTE RULE)
**NEVER edit ANY file without reading it COMPLETELY first.**

**What this means:**
- Read the ENTIRE file from start to finish
- Understand ALL existing functionality and dependencies
- Identify ALL errors and their root causes
- Comprehend the complete structure before making ANY changes
- Even for single-line edits, read the whole file to understand context

**Why this matters:**
- Prevents breaking existing functionality
- Avoids introducing new errors
- Ensures changes fit into the overall system architecture
- Prevents hallucinated solutions that don't match actual code

**Implementation:**
- NEVER use view_range like "Read lines 1-50" - this is STRICTLY PROHIBITED
- Never make assumptions about code structure
- Always understand the complete context before editing

**AI must maintain conversation context and remember previous work within the same chat session.**

**What this means:**
- Remember all previous edits, code structure, and project patterns within the same chat
- Never respond as if it's a new conversation when it's the same session
- Build on previous knowledge and context from earlier in the conversation
- Understand the project's architecture from previous interactions

**Why this matters:**
- User is learning and needs consistent, contextual help
- Prevents repeating mistakes or asking for information already provided
- Maintains efficient workflow without starting over each time
- Builds trust through consistent, knowledgeable assistance

**Implementation:**
- Reference previous edits and decisions made in the same conversation
- Build on established patterns and preferences shown earlier
- Maintain awareness of project structure learned in previous interactions
- Continue work seamlessly without asking for repeated information

### 2. MCP TOOL UPDATES REQUIREMENT (CRITICAL MAINTENANCE)
**When fixing deep system issues, update MCP tools and configuration to reflect the fixes.**

**What this means:**
- After fixing environment detection issues, update MCP server capabilities
- When updating project structure (like ai-scripts), ensure MCP tools know about it
- When fixing amateur coding patterns, update tools to prevent future occurrences
- Keep MCP configuration aligned with current project state

**Why this matters:**
- Ensures MCP tools provide accurate analysis of fixed systems
- Prevents regression to amateur patterns that were specifically corrected
- Maintains consistency between project reality and tool understanding
- Enables effective future development with proper tooling support

**Implementation:**
- Update MCP server tools after environment awareness fixes
- Ensure analysis tools understand current project structure including ai-scripts
- Validate that MCP configuration reflects internal quality standards now enforced
- Test MCP functionality after major architectural improvements

**MCP Conceptual Section Requirement:**
- docs/internal/ENV_MCP.md MUST contain: what MCP is (plain language), why used here, tool lifecycle (activation → tool list → invocation), how to extend safely, and difference between MCP tools vs extension runtime logic
- If missing or outdated, update it during any MCP-related change
- Keep wording neutral (no banned adjectives) while remaining clear

**Allowed Use of Banned Words Contextually:**
- Banned vocabulary MAY appear ONLY inside explicit "Forbidden Words" listing blocks for enforcement clarity
- Do not use banned words elsewhere in explanations, summaries, or examples

### 3. BULK EDITING REQUIREMENT (EFFICIENCY STANDARD)
**Edit files in bulk operations, never one line at a time.**

**What this means:**
- Read complete file first, then make ALL necessary changes in single operation
- Use systematic bulk edits that address multiple related issues at once
- Never waste time with incremental line-by-line edits
- Plan all changes before implementing any changes

**Why this matters:**
- Saves time and increases efficiency
- Ensures consistent changes across related code sections
- Reduces risk of missing related changes
- Maintains professional development pace

### 3. CENTRALIZED ARCHITECTURE (NO AMATEUR FALLBACKS)
**ALL configuration, messages, and settings MUST be centralized.**

**Universal Requirements:**
- NO amateur fallback patterns using `||` operators with hardcoded user-facing strings
- NO hardcoded text anywhere in components, HTML, or JavaScript
- ALL user-facing messages from centralized message system
- ALL configuration from centralized config system
- When centralizing, update ALL instances across entire codebase systematically

**Legitimate vs Amateur Fallbacks:**
```javascript
✅ window.GPTPF_CONFIG?.PLATFORM_DOMAINS ?? {}  // API safety
✅ timeouts[platform] ?? timeouts.default ?? 3000  // Config chain
✅ detection.extension || 'txt'  // Language detection fallback
✅ (error && error.message) || ''  // Error handling
❌ buttonText || 'Click here'  // Should use getMessage()
❌ alert('Error occurred')  // Should use centralized toast system
```

**Core Patterns:**
```javascript
✅ getMessage('CATEGORY', 'KEY')
✅ const config = getCentralizedConfig()
✅ textContent = getUIText('COMPONENT', 'LABEL')
✅ console.log(getLogMessage('CATEGORY', 'EVENT'))
```

### 4. ENVIRONMENT AWARENESS REQUIREMENT
**Always detect and adapt to the execution environment correctly.**

**Environment Detection Standards:**
- Detect operating system and adjust paths accordingly
- Use proper path separators and executable names
- WSL environments require Unix-style execution but may have Windows paths
- Never hardcode platform-specific paths or commands

**Implementation Patterns:**
```python
✅ import platform; platform.system() == "Windows"
✅ import shutil; shutil.which("python3")
✅ Path detection with fallbacks: .venv/Scripts/python.exe vs .venv/bin/python
✅ Environment-aware execution: adapt to WSL, Linux, Windows
❌ Hardcoded "python.exe" or "/usr/bin/python"
❌ Amateur fallbacks with shell scripts when Python scripts exist
❌ Using Windows paths in WSL bash commands
```

**MCP Server Requirements:**
- NO shell script fallbacks when Python tools are available
- Use proper environment detection for Python executable
- Run Python scripts directly, not through shell wrappers
- Handle cross-platform paths correctly

### 5. SYSTEMATIC PROBLEM SOLVING
**Fix root causes, not symptoms.**

**Implementation Standards:**
- Don't patch individual errors - fix the underlying architecture
- If multiple files have the same issue, fix it systematically across all files
- Use centralized systems instead of individual module detection
- Complete 100% of functionality - no partial implementations

**Examples:**
- ✅ Fix architecture to load dependencies properly
- ❌ Add fallback patterns to individual files
- ✅ Use centralized configuration system
- ❌ Add custom detection in each module

### 5. PRODUCTION QUALITY STANDARDS
**Every line of code must be production-ready.**

**Quality Requirements:**
- Complete error handling and user feedback
- Complete functionality - every feature must work properly
- Proper integration - all modules work together seamlessly
- Established engineering patterns - follow existing project conventions

### 6. SYSTEMATIC APPROACH REQUIREMENT
**Use task-based systematic approach to all development work.**

**Implementation Standards:**
- Never claim all issues are resolved at once
- Work through issues systematically one by one
- Perform full file-by-file self-QA audits before implementation
- Target production quality with detailed error identification
- Complete solutions only - no half-measures
- Continue to next logical steps without asking permission for obvious fixes

### 7. DEEP THINKING REQUIREMENT (CRITICAL)
**Always use sequential thinking tool for complex problems and understand technologies properly.**

**MANDATORY: Think Hard Before Implementing**
- NEVER create fake or poor implementations when real APIs exist
- ALWAYS understand the technology properly before coding
- Act as a careful guide who helps users make good decisions
- IMPLEMENT complete solutions from the start, not multiple iterations of fixes
- AVOID rushing through implementations that require multiple corrections

**When to Use Thinking Tool:**
- When user asks for "deep work" or mentions multiple interconnected issues
- When dealing with architectural problems that affect multiple files
- When state management or core functionality is involved
- When user says "think hard" or "don't rush" - this is a direct instruction
- BEFORE implementing any complex feature or API integration
- When working with unfamiliar technologies or APIs

**Thinking Process:**
- Think through root causes, not just symptoms
- Consider how changes affect the entire system architecture
- Plan fixes systematically before implementing
- Question assumptions and challenge initial approaches
- Break down complex tasks into logical steps
- Research and understand APIs/technologies before implementing

**When to Ask Permission:**
- Potentially damaging actions (commits, deployments, major architecture changes)
- When unsure about user requirements

### 8. NATURAL LANGUAGE REQUIREMENT (CRITICAL)
**Write naturally and avoid AI-like language - human-first content only.**

**Context Understanding:**
- When user says "professional" they mean internal code quality standards, NOT user-facing content language
- User-facing content (README, documentation, descriptions) must be natural and human
- Internal code standards may reference quality but user content must be conversational

**Forbidden Words/Phrases in User-Facing Content:**
- Never use: "comprehensive," "significant," "discover," "diving deep," "whether," "additionally"
- Never use: "professional," "enterprise," "robust," "revolutionary," "slash," "scene"
- Never use generic tech journalism words or corporate buzzwords
- No contractions - use "do not" instead of "don't"
- No excessive em-dashes or awkward punctuation

**Writing Style for User-Facing Content:**
- Write like a human, not like an AI assistant
- Be direct and clear without corporate buzzwords
- Use simple, natural explanations that real people would write
- Avoid generic AI phrases and marketing language
- Keep tone natural, not corporate or AI-sounding
- Use "we gamers" instead of "I" when appropriate
- Minimize "I" statements - write for all users, not just personal experience

**Structure Requirements:**
- Never place one heading directly after another without explanation
- Each heading must be followed by clear explanatory paragraph
- Proper structure: Heading → Explanatory paragraph → Details/bullets
- Always add explanatory paragraphs before bullets/lists
- Write for humans who need real information from actual research
- Be original, do not copy other writers' phrasing
- Check dates - do not mention expired promotions
- Verify actual information from real sources

**Examples:**
- ✅ "This file handles user settings"
- ❌ "This module provides comprehensive configuration management capabilities"
- ✅ "Fixes the login bug"
- ❌ "Implements robust authentication error handling solutions"
- ✅ "We gamers know how frustrating slow loading can be"
- ❌ "I have discovered that users experience significant delays"

### 9. MEMORY AND RULES UPDATES (CRITICAL)
**AI must ALWAYS update RULES.md when learning new requirements.**

**Mandatory Updates:**
- When updating memories, ALWAYS update RULES.md to stay current
- When user provides new instructions or preferences, add them to RULES.md
- When discovering new patterns or requirements, document them immediately
- This file must reflect all current user requirements and preferences
- Keep this file as the single source of truth for AI development standards

**Update Process:**
- Read complete RULES.md file before updating
- Add new requirements in appropriate sections
- Ensure no redundancy or conflicting rules
- Make rules universal and reusable across all projects
- Test that rules are clear and actionable

## 🔧 UNIVERSAL DEVELOPMENT STANDARDS

### 10. GIT WORKFLOW REQUIREMENTS (MANDATORY)
**Use standardized git workflow tools for ALL projects.**

**Tool Requirements:**
- ALWAYS use git.sh tool instead of raw git commands when available
- NEVER use raw git commands like 'git commit', 'git push', 'git tag' if git.sh exists
- If git.sh doesn't support an operation, add it to git.sh rather than using raw git
- Maintain consistent workflow across all projects

**Standard Workflow (when git.sh available):**
1. `./git.sh 1 "commit message"` - Commit changes
2. `./git.sh 2` - Push to develop branch
3. `./git.sh 3` - Update main from develop
4. `./git.sh 4 v1.2.0 "description"` - Create release tag

**Branch Structure Standards:**
- Develop branch = ALL files including development tools
- Main branch = Production files only
- Release tags must be user-focused descriptions, not generic developer text
- Never bump versions without explicit user permission

### 11. SECURITY REQUIREMENTS
**Universal security standards for all applications.**

**Core Security Principles:**
- Input validation and sanitization for all user inputs
- XSS prevention through safe DOM manipulation
- No eval() usage allowed in any context
- Minimal permission model - request only necessary permissions
- Secure file handling with type validation and size limits
- Proper error handling that doesn't expose sensitive information

**Web Application Security:**
- Content Security Policy enforcement
- HTTPS-only communication
- Secure authentication and session management
- Protection against common vulnerabilities (OWASP Top 10)

**Chrome Extension Security:**
- Manifest V3 compliance
- On-device processing only - no external data transmission
- Minimal host permissions
- Secure message passing between components

### 12. DOCUMENTATION STANDARDS (CRITICAL SEPARATION)
**Universal documentation requirements with strict internal/public separation.**

**Content Separation Rules:**
- README and public .md files should NOT contain internal development info
- No git workflows, technical details, or development processes in public files
- Internal info belongs ONLY in docs/internal/ folder
- Public files focus on user experience and benefits only

**Documentation Update Requirements:**
- CRITICAL: Systematically update ALL .md files whenever code changes are made
- Read FULL documentation files before editing - understand complete structure
- When updating memories, ALWAYS update RULES.md to stay current
- Maintain consistency between code and documentation

**File Standards:**
- Only essential comments at top of files with team information
- No amateur inline comments like configuration explanations
- File headers should include team information only
- README files should be straightforward without questions or semicolons
- No explicit README 'Keywords' section - use natural wording

**Language Standards:**
- When user says "professional" they mean internal code quality standards
- NEVER use "professional" or corporate words in front-end user-facing content
- Descriptions, README files, release notes must be natural and human
- Focus on what user will experience, not internal technical processes

### 13. TESTING AND VALIDATION REQUIREMENTS
**Systematic testing and validation standards for all projects.**

**Testing Standards:**
- Test ALL functionality systematically
- Use efficient testing methods (double parameters when available)
- Verify configuration loading works properly
- Check error handling for all scenarios
- Ensure no broken functionality remains
- All menu options must be tested systematically
- Verify no console errors
- Check accessibility features

**Validation Requirements:**
- All user inputs must be validated
- Use centralized validation systems when available
- Implement proper error messages for validation failures
- Test edge cases and boundary conditions

### 14. CSS ORGANIZATION STANDARDS (CRITICAL)
**All styling must use centralized root variables and proper CSS file organization.**

**CSS Root Variables Requirement:**
- ALL colors must use centralized :root CSS variables
- NO custom colors scattered throughout CSS files
- Root variables section must be at top of CSS files
- Use existing root variables instead of creating new custom styles
- Never add CSS directly to HTML files or JavaScript files

**CSS File Organization:**
- Single centralized :root structure at top with all variables
- No hardcoded CSS in HTML files
- Header/footer must never be scrollable (overflow only on inner content)
- CSS must be organized with centralized colors/sizes instead of scattered custom heights/widths
- Move all inline CSS from HTML to proper CSS files
- Organize CSS with root variables at top followed by inherited styles

**Popup Space Optimization:**
- Reduce excessive padding for popup space constraints
- Optimize designs for Chrome extension popup limitations
- Use appropriate spacing that fits popup dimensions
- Never force large paddings that don't fit popup space

### 15. DESIGN CONSISTENCY STANDARDS
**Always use SVG icons and maintain professional design patterns.**

**Visual Design Requirements:**
- **SVG Icons**: Always use SVG icons, never emoji or basic symbols
- **Professional Headers**: Team information only, no amateur comments
- **Natural Language**: Human-first content, no corporate buzzwords or AI language
- **Consistent Branding**: Maintain established color schemes and visual patterns

**Implementation Standards:**
- Recognize existing design patterns before adding new elements
- Use established naming conventions and code organization
- Maintain consistency across different project components
- Respect user's established design choices and architectural patterns

### 16. PACKAGE MANAGEMENT RULES
**Always use appropriate package managers for dependency management.**

**Universal Standards:**
- Always use package managers for installing, updating, or removing dependencies
- Never manually edit package configuration files (package.json, requirements.txt, etc.)
- Use correct package manager commands for each language/framework
- Only edit package files directly for complex configuration changes that cannot be accomplished through package manager commands

**Language-Specific Package Managers:**
- **JavaScript/Node.js**: npm, yarn, pnpm
- **Python**: pip, poetry, conda
- **Rust**: cargo
- **Go**: go mod
- **Ruby**: gem, bundler
- **PHP**: composer
- **C#/.NET**: dotnet, NuGet
- **Java**: Maven, Gradle

## 🎯 COMMUNICATION AND WORKFLOW STANDARDS

### 17. COMMUNICATION STYLE REQUIREMENTS
**Professional, direct communication without AI-like language.**

**Communication Standards:**
- No flattery or positive adjectives like "good", "great", "excellent"
- Direct responses, skip pleasantries
- Autonomous continuation for obvious next steps
- Professional implementation required, no partial fixes
- Focus on actionable information and solutions

**Response Structure:**
- Lead with the most important information
- Provide clear, specific steps when giving instructions
- Use bullet points and structured formatting for clarity
- Avoid unnecessary explanations unless specifically requested

### 18. SYSTEMATIC SRC FOLDER AUDIT REQUIREMENTS
**File-by-file audit methodology for complete codebase quality.**

**Audit Process:**
- NEVER claim work is complete without systematic verification
- Work continuously until user says stop or everything is truly finished
- Track which files have proper MIT signature headers
- Apply ALL rules to each file during audit
- Remove comments (user hates them) except signature headers
- Fix wrong fallbacks and centralize all systems
- Move CSS from wrong files to correct CSS files
- Be honest about progress and continue until complete

**Quality Standards:**
- 10/10 production quality rating for each file
- Complete file reading before any edits (never partial ranges)
- Bulk editing operations for all changes in a file
- Systematic approach - one file at a time with full completion

## 🏗️ ARCHITECTURAL STANDARDS

### 19. SYSTEMATIC THINKING & DEBUGGING METHODOLOGY (CRITICAL)
**Universal standards for complex problem solving and architecture decisions.**

**Mandatory: Use Sequential Thinking Tool**
- ALWAYS use thinking tool for complex problems, debugging, and architecture decisions
- Think before acting - Analyze the problem systematically before making changes
- Question assumptions - Challenge initial approaches and consider alternatives
- Plan comprehensively - Break down complex tasks into logical steps
- Verify solutions - Check that fixes address root causes, not just symptoms

**Architecture Understanding Requirements:**
- Read ALL files completely before making ANY changes - no exceptions
- Understand existing patterns before adding new functions or logic
- Identify centralized systems - Use existing architecture instead of creating duplicates
- Map dependencies - Understand how components interact before modifying them
- Respect professional patterns - Follow established conventions and design patterns

**State Management Rules:**
- Avoid duplicate functions - One centralized function is better than multiple partial ones
- Comprehensive state checks - Consider ALL conditions, not just partial states
- Bidirectional control - Ensure state changes work in both directions
- Professional conflict resolution - Handle competing states systematically
- Centralized over distributed - Use centralized state management when possible

**Root Cause Analysis:**
- Fix architecture, not symptoms - Address underlying design issues
- Eliminate duplicate logic - Consolidate conflicting functions
- Systematic state management - One source of truth for each state
- Professional error handling - Comprehensive validation and user feedback

### 20. ARCHITECTURAL THINKING REQUIREMENTS
**Always consider full system architecture impact.**

**System Impact Analysis:**
- When fixing one component, consider how it affects all interconnected files
- Understand the role of main controllers in the architecture
- Shared files and utilities are used by multiple components
- Fix shared systems properly so all dependent files work correctly
- Don't deteriorate existing work by making incomplete architectural fixes
- Understand file relationships before making changes

**Architecture Principles:**
- Single responsibility principle - each module has one clear purpose
- Dependency inversion - depend on abstractions, not concretions
- Open/closed principle - open for extension, closed for modification
- Interface segregation - many specific interfaces better than one general
- Don't repeat yourself (DRY) - eliminate duplicate code and logic

### 21. STATE MANAGEMENT AND UI CONTROLS
**Bidirectional control systems must work both ways.**

**Control System Standards:**
- When one toggle disables another, the reverse must also work properly
- Use professional badge systems matching existing design, not inline CSS styling
- All disabled controls must show visual feedback (opacity, cursor, badges)
- State management functions must properly re-enable controls when conditions change
- Never leave controls permanently disabled due to poor state management logic
- Remove badges when controls are re-enabled, don't leave orphaned badges

**UI Consistency Requirements:**
- Consistent visual feedback across all interactive elements
- Clear indication of why controls are disabled
- Professional styling that matches overall design system
- Accessible controls that work with screen readers and keyboard navigation

### 22. SHOOTING STARS DESIGN REQUIREMENTS (GROK PLATFORM)
**Shooting stars must be realistic, fast-moving meteors with varied characteristics.**

**Motion Requirements:**
- Fast bullet-like speed (1.8s-2.4s duration, not slow 4s+ animations)
- Vertical downward movement like real meteors falling from space
- Non-uniform motion with different delays and slight horizontal drift
- Realistic fade-in/fade-out with proper opacity transitions

**Visual Design Standards:**
- Dramatically varied sizes (large: 3px×120px, small: 2px×80px)
- Vertical meteor appearance with bright head at bottom, fading tail upward
- Limited quantity (2 meteors maximum to avoid visual clutter)
- Enhanced glow effects with realistic brightness variations
- Pure vertical gradients (180deg) for proper falling meteor appearance

---

## 📋 SUMMARY

**Remember: Follow these guidelines systematically across ALL projects.**

These rules ensure:
- **Consistent Quality**: Every project meets production standards
- **Efficient Development**: Systematic approach saves time and reduces errors
- **Maintainable Code**: Centralized systems and clear architecture
- **Professional Results**: Code that works reliably in production environments
- **Reusable Patterns**: Standards that apply across different project types

**There are no shortcuts in professional software development. Every component must meet high standards for reliability, usability, and quality.**

## 🛠️ TOOL USAGE MASTERY (CRITICAL)

### 22. AUGMENT CONTEXT ENGINE EXPERTISE
**Master the world's best codebase context engine for maximum efficiency.**

The Augment context engine is the most powerful tool available. Use it strategically:

**When to Use codebase-retrieval:**
- Finding specific functions, classes, or patterns across the entire codebase
- Understanding how similar features were implemented previously
- Locating configuration files, message systems, or centralized utilities
- Getting comprehensive context about unfamiliar code sections
- Always use BEFORE making any edits to understand existing patterns

**Advanced Usage Patterns:**
- Use specific, detailed queries: "Find all toast message implementations and centralized message usage patterns"
- Search for architectural patterns: "Show me how file attachment is handled across different platforms"
- Locate related functionality: "Find all batch processing logic and configuration settings"

**When to Use git-commit-retrieval:**
- Understanding how similar changes were made in the past
- Learning from previous implementation patterns
- Finding the history of specific features or bug fixes
- Understanding the evolution of architectural decisions

### 23. SEQUENTIAL THINKING TOOL MASTERY
**Always use thinking tool for complex problems - you must be the expert.**

**Mandatory Usage Scenarios:**
- Any architectural decisions affecting multiple files
- Complex debugging that involves system interactions
- When user mentions "deep work", "think hard", or "don't rush"
- State management issues or bidirectional control problems
- Integration challenges between different system components
- Performance optimization or security considerations

**Advanced Thinking Patterns:**
- Question initial assumptions and explore alternatives
- Consider system-wide impact of proposed changes
- Plan comprehensive solutions before implementing
- Verify that fixes address root causes, not symptoms
- Break complex problems into logical, manageable steps

### 24. PARALLEL TOOL EXECUTION MASTERY
**Maximize efficiency through strategic parallel tool calls.**

**Always Use Parallel Calls For:**
- Reading multiple files simultaneously
- Running multiple view commands for different directories
- Executing multiple search operations across different areas
- Checking multiple configuration files at once
- Gathering comprehensive context from different sources

**Strategic Parallel Patterns:**
```
✅ Read 5 related files simultaneously
✅ Search multiple directories for patterns at once
✅ Check configuration, messages, and validation files together
✅ Gather context from different system components in parallel
```

### 25. FILE OPERATION TOOL EXPERTISE
**Master efficient file reading and editing patterns.**

**View Tool Mastery:**
- Use regex search for finding specific patterns within files
- Use view_range for large files when you need specific sections
- Always read complete files before editing - never make assumptions
- Use directory views to understand project structure quickly

**str-replace-editor Tool Mastery:**
- Always read complete files first using view tool
- Plan ALL changes before making ANY edits
- Use bulk editing operations - never edit one line at a time
- Make related changes together in single operations
- Always include instruction_reminder for edit size limits

### 26. ANALYTICS DESIGN REQUIREMENTS (CHROME EXTENSION SPECIFIC)
**Analytics must be optimized for popup space with multiple chart options.**

**Chart Design Standards:**
- Multiple chart types available (line, bar, area charts)
- Chart selection system for user choice
- Optimized for popup space constraints - reduce excessive padding
- Professional Tailwind-inspired design using root variables
- Interactive elements with hover effects and smooth transitions

**Popup Optimization:**
- Reduce padding throughout analytics design
- Clearing spinner must be properly centered
- Charts must handle large datasets without performance issues
- Visual hierarchy optimized for small popup space
- Professional styling that matches extension's design system

### 27. PROFESSIONAL SIGNATURE HEADERS (MANDATORY)
**All code files must include comprehensive, license-protected signature headers.**

**Header Requirements:**
- Include complete project identification and version
- List full development team: Joseph Matino (Lead Developer), Majok Deng (Scrum Master)
- Specify technical architecture and security approach
- Document performance optimizations and browser compatibility
- Include comprehensive legal compliance with anti-piracy protection
- Provide WekTurbo Designs - Hostwek LTD organization information
- Add deterrent against code theft and unauthorized copying

### 28. LINUX COMMAND REQUIREMENT (MANDATORY)
**Always use Linux-style commands in terminal operations.**

**Command Standards:**
- ALL terminal commands must be formatted for Linux/Unix systems
- Use forward slashes (/) for paths, not backslashes (\)
- Use Linux-style command syntax and options
- This applies regardless of user's operating system

**Examples:**
```bash
✅ ls -la src/components/
✅ cd src/shared && npm install
✅ grep -r "function" src/
✅ find . -name "*.js" -type f
❌ dir src\components\
❌ cd src\shared & npm install
❌ findstr "function" src\*
```

**Implementation:**
- Assume Linux environment for all command suggestions
- Use standard Unix/Linux tools and syntax
- Format file paths with forward slashes
- Use Linux-style environment variables and shell operators

### 29. CRITICAL FILE READING PROHIBITIONS
**Absolute prohibitions that must never be violated.**

**STRICTLY PROHIBITED Actions:**
- NEVER use view_range with line numbers like "Read lines 1-50"
- NEVER read partial file ranges or excerpts
- NEVER make assumptions about code structure without reading complete files
- NEVER edit files based on incomplete understanding
- NEVER respond as if it's a new conversation in the same chat session

**MANDATORY Actions:**
- ALWAYS read complete files using view tool without line ranges
- ALWAYS maintain conversation context and remember previous work
- ALWAYS understand full file structure before making any edits
- ALWAYS remember project patterns established earlier in the conversation
- ALWAYS build on previous knowledge within the same chat session

---

## 📋 SUMMARY

**Remember: Follow these guidelines systematically across ALL projects.**

These rules ensure:
- **Consistent Quality**: Every project meets production standards
- **Efficient Development**: Systematic approach saves time and reduces errors
- **Maintainable Code**: Centralized systems and clear architecture
- **Professional Results**: Code that works reliably in production environments
- **Reusable Patterns**: Standards that apply across different project types

**There are no shortcuts in professional software development. Every component must meet high standards for reliability, usability, and quality.**
'
---
Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.