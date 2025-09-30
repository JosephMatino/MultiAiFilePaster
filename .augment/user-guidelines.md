---
applyTo: '---
type: "always_apply"
description: "Example description"
---
NEVER edit ANY file without reading it COMPLETELY first.

Read the ENTIRE file from start to finish
Understand ALL existing functionality and dependencies
Identify ALL errors and their root causes
Comprehend the complete structure before making ANY changes
Even for single-line edits, read the whole file to understand context
Why this matters:

Prevents breaking existing functionality
Avoids introducing new errors
Ensures changes fit into the overall system architecture
Prevents hallucinated solutions that don't match actual code
Implementation:

NEVER use view_range like "Read lines 1-50" - this is STRICTLY PROHIBITED
Never make assumptions about code structure
Always understand the complete context before editing
AI must maintain conversation context and remember previous work within the same chat session.

Remember all previous edits, code structure, and project patterns within the same chat
Never respond as if it's a new conversation when it's the same session
Build on previous knowledge and context from earlier in the conversation
Understand the project's architecture from previous interactions
Why this matters:

User is learning and needs consistent, contextual help
Prevents repeating mistakes or asking for information already provided
Maintains efficient workflow without starting over each time
Builds trust through consistent, knowledgeable assistance
Implementation:

Reference previous edits and decisions made in the same conversation
Build on established patterns and preferences shown earlier
Maintain awareness of project structure learned in previous interactions
Continue work seamlessly without asking for repeated information

3. BULK EDITING REQUIREMENT (EFFICIENCY STANDARD)
Edit files in bulk operations, never one line at a time.

Read complete file first, then make ALL necessary changes in single operation
Use systematic bulk edits that address multiple related issues at once
Never waste time with incremental line-by-line edits
Plan all changes before implementing any changes
Why this matters:

Saves time and increases efficiency
Ensures consistent changes across related code sections
Reduces risk of missing related changes
Maintains professional development pace
3. CENTRALIZED ARCHITECTURE (NO AMATEUR FALLBACKS)
ALL configuration, messages, and settings MUST be centralized.

Universal Requirements:

NO amateur fallback patterns using || operators with hardcoded user-facing strings
NO hardcoded text anywhere in components, HTML, or JavaScript
ALL user-facing messages from centralized message system
ALL configuration from centralized config system
When centralizing, update ALL instances across entire codebase systematically

Use terminal when doing deep searches this is linux like cause even am on windows you need to know my path are on wsl and linux like so dont run windows commands here. use temrinal when you wanan change most files that looks same or lines so that its easy to work fast with your tools and also using my terminal.

5. SYSTEMATIC PROBLEM SOLVING
Fix root causes, not symptoms.

Implementation Standards:

Don't patch individual errors - fix the underlying architecture
If multiple files have the same issue, fix it systematically across all files
Use centralized systems instead of individual module detection
Complete 100% of functionality - no partial implementations

6. SYSTEMATIC APPROACH REQUIREMENT
Use task-based systematic approach to all development work.

Implementation Standards:

Never claim all issues are resolved at once
Work through issues systematically one by one
Perform comprehensive file-by-file self-QA audits before implementation
Target production quality with detailed error identification
Complete solutions only - no half-measures
Continue to next logical steps without asking permission for obvious fixes

8. NATURAL LANGUAGE REQUIREMENT (CRITICAL)
Write naturally and avoid AI-like language - human-first content only.

Forbidden Words/Phrases:

Never use: "comprehensive," "significant," "discover," "diving deep," "whether," "additionally"
Never use: "professional," "enterprise," "robust," "revolutionary," "slash," "scene"
Never use generic tech journalism words or corporate buzzwords
No contractions - use "do not" instead of "don't"
No excessive em-dashes or awkward punctuation
Writing Style:

Write like a human, not like an AI assistant
Be direct and clear without corporate buzzwords
Use simple, natural explanations that real people would write
Avoid generic AI phrases and marketing language
Make it natural and human, not corporate or AI-sounding
Structure Requirements:

Never place one heading directly after another without explanation
Each heading must be followed by clear explanatory paragraph
Proper structure: Heading → Explanatory paragraph → Details/bullets
Always add explanatory paragraphs before bullets/lists
Write for humans who need real information

10. GIT WORKFLOW REQUIREMENTS (MANDATORY)
Use standardized git workflow tools for ALL projects.

Tool Requirements:

ALWAYS use git.sh tool instead of raw git commands when available
NEVER use raw git commands like 'git commit', 'git push', 'git tag' if git.sh exists
If git.sh doesn't support an operation, add it to git.sh rather than using raw git
Maintain consistent workflow across all projects
Standard Workflow (when git.sh available):

./git.sh 1 "commit message" - Commit changes
./git.sh 2 - Push to develop branch
./git.sh 3 - Update main from develop
./git.sh 4 v1.2.0 "description" - Create release tag
Branch Structure Standards:

Develop branch = ALL files including development tools
Main branch = Production files only
Release tags must be user-focused descriptions, not generic developer text
Never bump versions without explicit user permission

DOCUMENTATION STANDARDS (CRITICAL SEPARATION)
Universal documentation requirements with strict internal/public separation.

Content Separation Rules:

README and public .md files should NOT contain internal development info
No git workflows, technical details, or development processes in public files
Internal info belongs ONLY in docs/internal/ folder
Public files focus on user experience and benefits only
Documentation Update Requirements:

CRITICAL: Systematically update ALL .md files whenever code changes are made
Read FULL documentation files before editing - understand complete structure
When updating memories, ALWAYS update RULES.md to stay current
Maintain consistency between code and documentation


14. CSS ORGANIZATION STANDARDS (CRITICAL)
All styling must use centralized root variables and proper CSS file organization.

CSS Root Variables Requirement:

ALL colors must use centralized :root CSS variables
NO custom colors scattered throughout CSS files
Root variables section must be at top of CSS files
Use existing root variables instead of creating new custom styles
Never add CSS directly to HTML files or JavaScript files
CSS File Organization:

Single centralized :root structure at top with all variables
No hardcoded CSS in HTML files
Header/footer must never be scrollable (overflow only on inner content)
CSS must be organized with centralized colors/sizes instead of scattered custom heights/widths
Move all inline CSS from HTML to proper CSS files
Organize CSS with root variables at top followed by inherited styles
Popup Space Optimization:

Reduce excessive padding for popup space constraints
Optimize designs for Chrome extension popup limitations
Use appropriate spacing that fits popup dimensions
Never force large paddings that don't fit popup space
15. DESIGN CONSISTENCY STANDARDS
Always use SVG icons and maintain professional design patterns.

Visual Design Requirements:

SVG Icons: Always use SVG icons, never emoji or basic symbols
Professional Headers: Team information only, no amateur comments
Natural Language: Human-first content, no corporate buzzwords or AI language
Consistent Branding: Maintain established color schemes and visual patterns
Implementation Standards:

Recognize existing design patterns before adding new elements
Use established naming conventions and code organization
Maintain consistency across different project components
Respect user's established design choices and architectural patterns

FINALY DO NOT TRY TO CREATE ANY NEW FILE ON THE PROJECT WITHGOUHT USER PERMISION. DO NOT ADD ANY COMMENT IN ANY CODE CAUSE USER IS CODDING ON PRODCUTION CODEBASE NOT SIMPLE AMATURE WORK. DO NOT FORGET THE HEADER SIGNATURE MUST BE RESPECTED AND ADDED TO FILE STHAT USES TH EHEADER ISGATURE NOT HTML AND .MD FILES. 