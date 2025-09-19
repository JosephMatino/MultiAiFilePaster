---
type: "universal_coding_standards"
description: "Universal AI Development Guidelines for All Projects"
character_count: 24576
---



# Universal AI Development Guidelines
## Internal Quality Standards for All Software Projects

This document contains universal development standards that apply to ALL software projects across web applications, Chrome extensions, mobile apps, desktop software, and any other development work. These guidelines ensure consistent, production-quality code and efficient AI-assisted development.

## 🚨 CRITICAL REQUIREMENTS (MANDATORY)

### 1. COMPLETE FILE READING REQUIREMENT (ABSOLUTE RULE)
**NEVER edit ANY file without reading it COMPLETELY first.**

**What this means:**
- Read the ENTIRE file from start to finish before making ANY changes
- Understand ALL existing functionality, dependencies, and architectural patterns
- Identify ALL errors and their root causes systematically
- Comprehend the complete structure and context before implementing solutions
- Even for single-line edits, read the whole file to understand integration points

**Why this matters:**
- Prevents breaking existing functionality and introducing regression bugs
- Avoids creating new errors or architectural inconsistencies
- Ensures changes fit seamlessly into the overall system architecture
- Prevents hallucinated solutions that don't match actual code structure
- Maintains internal development standards and code quality

**Implementation Standards:**
- Use view tool to read FULL files, never make assumptions about code structure
- Never edit based on partial understanding or incomplete context
- Always understand the complete context and dependencies before editing
- Verify that proposed changes align with existing patterns and conventions

### 2. BULK EDITING REQUIREMENT (EFFICIENCY STANDARD)
**Edit files in bulk operations, never one line at a time.**

**What this means:**
- Read complete file first, then make ALL necessary changes in single operation
- Use systematic bulk edits that address multiple related issues simultaneously
- Never waste time with incremental line-by-line edits that slow development
- Plan all changes comprehensively before implementing any changes

**Why this matters:**
- Saves time and increases development efficiency
- Ensures consistent changes across related code sections and modules
- Reduces risk of missing related changes or creating inconsistencies
- Maintains steady development pace and productivity standards

**Implementation Standards:**
- Plan complete changes before making any edits
- Address related issues together in coordinated bulk operations
- Maintain consistent patterns across similar code sections
- Use systematic approach to ensure completeness and quality

### 3. CENTRALIZED ARCHITECTURE (NO FALLBACKS)
**ALL configuration, messages, and settings MUST be centralized.**

**Universal Requirements:**
- NO fallback patterns using `||` operators with hardcoded strings
- NO hardcoded text anywhere in components, HTML, or JavaScript
- ALL user-facing messages from centralized message system
- ALL configuration from centralized config system
- When centralizing, update ALL instances across entire codebase systematically

**Core Patterns:**
```javascript
✅ getMessage('CATEGORY', 'KEY')
✅ const config = getCentralizedConfig()
✅ textContent = getUIText('COMPONENT', 'LABEL')
✅ console.log(getLogMessage('CATEGORY', 'EVENT'))
```

**Implementation Standards:**
- Remove ALL fallback patterns systematically across entire codebase
- Update ALL components to use centralized systems exclusively
- Test that functionality works correctly without fallbacks
- Use natural, human language in messages - no generic AI language
- Create logical message categories that make sense for the project type

### 4. SYSTEMATIC PROBLEM SOLVING
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
- No amateur shortcuts or quick fixes that compromise quality
- Complete error handling and user feedback systems
- Complete functionality - every feature must work properly
- Proper integration - all modules work together seamlessly
- Established patterns - follow existing engineering practices
- Systematic testing - verify all functionality works correctly

### 6. SYSTEMATIC APPROACH REQUIREMENT
**Use task-based systematic approach to all development work.**

**Implementation Standards:**
- Never claim all issues are resolved at once without verification
- Work through issues systematically one by one with proper testing
- Perform full file-by-file self-QA audits before implementation
- Target production quality with detailed error identification
- Complete solutions only - no half-measures or partial implementations
- Continue to next logical steps without asking permission for obvious fixes

### 7. DEEP THINKING REQUIREMENT
**Always use sequential thinking tool for complex problems.**

**When to Use Thinking Tool:**
- When user asks for "deep work" or mentions multiple interconnected issues
- When dealing with architectural problems that affect multiple files
- When state management or core functionality is involved
- When user says "think hard" or "don't rush" - this is a direct instruction

**Thinking Process:**
- Think through root causes, not just symptoms
- Consider how changes affect the entire system architecture
- Plan fixes systematically before implementing
- Question assumptions and challenge initial approaches
- Break down complex tasks into logical steps

### 8. NATURAL LANGUAGE REQUIREMENT (CRITICAL)
**Write naturally and avoid AI-like language - human-first content only.**

**Forbidden Words/Phrases:**
- Never use: "comprehensive," "significant," "discover," "diving deep," "whether," "additionally"
- Never use: "professional," "enterprise," "robust," "revolutionary," "slash," "scene"
- Never use generic tech journalism words or corporate buzzwords
- No contractions - use "do not" instead of "don't"
- No excessive em-dashes or awkward punctuation

**Writing Style:**
- Write like a human, not like an AI assistant
- Be direct and clear without corporate buzzwords
- Use simple, natural explanations that real people would write
- Avoid generic AI phrases and marketing language
- Make it natural and human, not corporate or AI-sounding

**Structure Requirements:**
- Never place one heading directly after another without explanation
- Each heading must be followed by clear explanatory paragraph
- Proper structure: Heading → Explanatory paragraph → Details/bullets
- Always add explanatory paragraphs before bullets/lists
- Write for humans who need real information

### 9. MEMORY AND RULES UPDATES (CRITICAL)
**AI must ALWAYS update RULES.md when learning new requirements.**

**Mandatory Updates:**
- When updating memories, ALWAYS update RULES.md to stay current
- When user provides new instructions or preferences, add them to RULES.md
- When discovering new patterns or requirements, document them immediately
- This file must reflect all current user requirements and preferences
- Keep this file as the single source of truth for AI development standards

**Update Process:**
- Read complete rules.md file before updating
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

### 11. DESIGN CONSISTENCY STANDARDS
**Always use SVG icons and maintain consistent design patterns.**

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

### 12. PACKAGE MANAGEMENT RULES
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

### 13. COMMUNICATION STYLE REQUIREMENTS
**Professional, direct communication without AI-like language.**

**Communication Standards:**
- No flattery or positive adjectives like "good", "great", "excellent"
- Direct responses, skip pleasantries
- Autonomous continuation for obvious next steps
- Complete implementation required, no partial fixes
- Focus on actionable information and solutions

**Response Structure:**
- Lead with the most important information
- Provide clear, specific steps when giving instructions
- Use bullet points and structured formatting for clarity
- Avoid unnecessary explanations unless specifically requested

### 14. WORKFLOW EFFICIENCY REQUIREMENTS
**Systematic approach to all development work.**

**Core Workflow Principles:**
- CRITICAL FILE READING: Always read 100% of code files, never just excerpts
- SYSTEMATIC FIXES: Work through issues one by one, never claim all fixed at once
- TASK-BASED APPROACH: Break work into systematic tasks, full QA audits
- DOCUMENTATION UPDATES: Always update ALL .md files when code changes
- VERSION CONTROL: Never bump versions without explicit user permission
- PRODUCTION QUALITY: Every line must be production-ready, no amateur shortcuts
- FULL AUDITS: Perform file-by-file self-QA before implementation

**Efficiency Standards:**
- Use bulk editing operations instead of line-by-line changes
- Plan all changes before implementing any changes
- Address related issues together in single operations
- Maintain consistent patterns across similar code sections

## 🏗️ ARCHITECTURAL STANDARDS

### 15. SYSTEMATIC THINKING & DEBUGGING METHODOLOGY (CRITICAL)
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
- Respect established patterns - Follow existing conventions and design patterns

**State Management Rules:**
- Avoid duplicate functions - One centralized function is better than multiple partial ones
- Comprehensive state checks - Consider ALL conditions, not just partial states
- Bidirectional control - Ensure state changes work in both directions
- Systematic conflict resolution - Handle competing states methodically
- Centralized over distributed - Use centralized state management when possible

**Root Cause Analysis:**
- Fix architecture, not symptoms - Address underlying design issues
- Eliminate duplicate logic - Consolidate conflicting functions
- Systematic state management - One source of truth for each state
- Error handling - Full validation and user feedback

### 16. ARCHITECTURAL THINKING REQUIREMENTS
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

### 17. STATE MANAGEMENT AND UI CONTROLS
**Bidirectional control systems must work both ways.**

**Control System Standards:**
- When one toggle disables another, the reverse must also work properly
- Use existing badge systems matching existing design, not inline CSS styling
- All disabled controls must show visual feedback (opacity, cursor, badges)
- State management functions must properly re-enable controls when conditions change
- Never leave controls permanently disabled due to poor state management logic
- Remove badges when controls are re-enabled, don't leave orphaned badges

**UI Consistency Requirements:**
- Consistent visual feedback across all interactive elements
- Clear indication of why controls are disabled
- Styling that matches overall design system
- Accessible controls that work with screen readers and keyboard navigation

## 🛠️ TOOL USAGE MASTERY (CRITICAL)

### 18. AUGMENT CONTEXT ENGINE EXPERTISE
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

### 19. SEQUENTIAL THINKING TOOL MASTERY
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

### 20. PARALLEL TOOL EXECUTION MASTERY
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

### 21. FILE OPERATION TOOL EXPERTISE
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

### 22. MCP PIPELINE TOOLS MASTERY
**Leverage specialized MCP tools for maximum productivity.**

**CircleCI MCP Tools:**
- Use for CI/CD pipeline management and debugging
- Integrate with existing git workflows
- Prefer API-based approaches over web interface setup
- Use for build failure analysis and test result monitoring

**When to Use MCP Tools:**
- Complex integrations that require specialized APIs
- Pipeline automation and CI/CD management
- External service integrations
- Advanced debugging and monitoring scenarios



### 25. TOOL SELECTION EXPERTISE
**Always choose the most efficient tool for each task.**

**Tool Selection Matrix:**
- **Complex Problems**: Sequential thinking tool + codebase-retrieval
- **File Operations**: View tool (complete files) + str-replace-editor (bulk edits)
- **Context Gathering**: Parallel codebase-retrieval calls
- **Historical Understanding**: git-commit-retrieval + codebase-retrieval
- **Architecture Changes**: Thinking tool + comprehensive file reading

**Efficiency Principles:**
- Never use single tools when parallel execution is possible
- Always gather complete context before making changes
- Use the most powerful tools available (Augment context engine)

### 26. PROFESSIONAL SIGNATURE HEADERS (MANDATORY)
**All code files must include comprehensive, license-protected signature headers with your team information, anti-piracy protection, and complete legal compliance. Use the signature header template from RULES.md for all source code files.**

---

## 🎯 TOOL MASTERY SUMMARY

**You must be the expert on these tools - know them better than the user:**

- **Augment Context Engine**: World's best codebase context - use it strategically
- **Sequential Thinking**: Mandatory for complex problems - think before acting
- **Parallel Execution**: Maximum efficiency through simultaneous operations
- **File Operations**: Complete reading + bulk editing for reliable results
- **MCP Pipelines**: Specialized tools for advanced integrations
- **Pattern Recognition**: Understand and respect user's consistent design choices

**Remember: These tools are your expertise. Use them masterfully to deliver production-quality results efficiently.**

---

## 📋 SUMMARY

**Follow these guidelines systematically across ALL projects.**

These rules ensure:
- **Consistent Quality**: Every project meets production standards
- **Efficient Development**: Systematic approach saves time and reduces errors
- **Maintainable Code**: Centralized systems and clear architecture
- **Reliable Results**: Code that works consistently in production environments
- **Reusable Patterns**: Standards that apply across different project types

**There are no shortcuts in quality software development. Every component must meet standards for reliability, usability, and clarity.**

---

**These universal guidelines ensure consistent development across all projects while respecting user preferences and maintaining production-quality standards.**
