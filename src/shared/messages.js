/*
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: src/shared/messages.js
 * FUNCTION: Centralized message system for consistent user feedback
 * ARCHITECTURE: Message Categories with Context-Aware Dynamic Content
 * SECURITY: Client-side processing, zero data transmission, privacy-first
 * PERFORMANCE: Optimized message lookup, efficient string interpolation
 * COMPATIBILITY: Chrome 88+, Edge 88+, Opera 74+, universal message system
 * RELIABILITY: Quality error handling, graceful degradation, stable operation
 *
 * DEVELOPMENT TEAM & PROJECT LEADERSHIP:
 * • LEAD DEVELOPER: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • SCRUM MASTER & PROJECT FUNDING: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 * • QUALITY ASSURANCE: Automated testing pipeline with CircleCI integration
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
 * TECHNICAL ARCHITECTURE & INTEGRATIONS:
 * • PLATFORM INTEGRATIONS: Toast notifications, error feedback, success messages
 * • CORE DEPENDENCIES: None (standalone message utilities)
 * • FEATURES: Centralized messaging, dynamic content, context-aware feedback
 * • TESTING: Automated unit tests, integration tests, message validation
 * • MONITORING: Performance metrics, error tracking, user analytics (opt-in)
 * • SCALABILITY: Modular design, plugin architecture, extensible configuration
 *
 * BUILD & DEPLOYMENT PIPELINE:
 * • BUILD SYSTEM: Node.js build pipeline, ESLint validation, automated testing
 * • DEPLOYMENT: Chrome Web Store distribution, automated release pipeline
 * • VERSION CONTROL: Git workflow with develop/main branches, semantic versioning
 * • CODE QUALITY: High standards, error handling
 * • SECURITY: Static analysis, dependency scanning, vulnerability assessment
 * • PERFORMANCE: Bundle optimization, lazy loading, efficient resource management
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
 * Joseph Matino for browser extension solutions.
 *
 * PERMITTED USAGE RIGHTS:
 * Personal use by individuals for non-commercial purposes is permitted.
 * Educational institutions may use this software for instructional and research
 * activities. End users are authorized to install and operate the extension as
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
 */

(() => {
  const root = (typeof self !== 'undefined') ? self : window;
  if (root.GPTPF_MESSAGES) return;

  const MESSAGES = Object.freeze({
    SETTINGS: Object.freeze({
      SAVING: 'Saving settings',
      WORD_LIMIT_UPDATED: (value) => `Word limit updated to ${value} words`,
      DELAY_ENABLED: (seconds) => `Attachment delay enabled for ${seconds} seconds`,
      DELAY_DISABLED: 'Attachment delay disabled',
      BATCH_MODE_ENABLED: 'Batch mode enabled. Auto attach disabled while batch mode is active',
      BATCH_MODE_DISABLED: 'Batch mode disabled. Auto attach restored',
      COMPRESSION_ENABLED: (threshold) => `File compression enabled for files over ${threshold} bytes`,
      COMPRESSION_DISABLED: 'File compression disabled',
      BATCH_COMPRESSION_ENABLED: 'Batch compression enabled',
      BATCH_COMPRESSION_DISABLED: 'Batch compression disabled',
      AUTO_ATTACH_ENABLED: 'Auto attach enabled. Files will attach automatically when you paste',
      AUTO_ATTACH_DISABLED: 'Auto attach disabled. Use the manual save button to attach files',
      CLAUDE_OVERRIDE_ENABLED: 'Claude override enabled. Extension will work on Claude',
      CLAUDE_OVERRIDE_DISABLED: 'Claude override disabled. Claude will use built-in features',
      TELEMETRY_ENABLED: 'Analytics enabled. This helps improve the extension',
      TELEMETRY_DISABLED: 'Analytics disabled. No usage data will be collected',
      DEBUG_ENABLED: 'Debug mode enabled',
      DEBUG_DISABLED: 'Debug mode disabled',
      MAX_BATCH_FILES_UPDATED: (value) => `Maximum batch files set to ${value}`,
      BATCH_DELAY_UPDATED: (value) => `Batch processing delay set to ${value}ms`,
      COMPRESSION_THRESHOLD_UPDATED: (value) => `Compression threshold set to ${value} bytes`
    }),

    FILE_FORMAT: Object.freeze({
      AUTO_SELECTED: 'Auto-detect format enabled',
      FORMAT_SELECTED: (format) => `File format set to .${format}`,
      CUSTOM_FORMAT_SET: (format) => `Custom format set to ${format}`,
      MORE_FORMATS_LOADED: 'More formats loaded',
      BACK_TO_MAIN: 'Back to main formats',
      NEXT_PAGE: 'Next page loaded',
      PREVIOUS_PAGE: 'Previous page loaded',
      ENTER_CUSTOM: 'Enter custom extension',
      CHANGED: 'File format updated'
    }),

    FILE_OPERATIONS: Object.freeze({
      ATTACHMENT_CANCELLED: 'File attachment cancelled',
      ATTACHMENT_SUCCESS: (filename) => `Attached ${filename}`,
      ATTACHMENT_PREPARING: 'Preparing your file',
      ATTACHMENT_UPLOADING: 'Uploading file',
      ATTACHMENT_ATTACHING: 'Attaching file',
      BATCH_DETECTED: (count) => `Large content detected. Splitting into ${count} files`,
      BATCH_PROCESSING_START: (count) => `Processing ${count} files`,
      BATCH_PROCESSING: (current, total, filename) => `Processing file ${current} of ${total}: ${filename}`,
      BATCH_ATTACHING: (filename) => `Attaching ${filename}`,
      BATCH_UPLOADING: (filename) => `Uploading ${filename}`,
      BATCH_SUCCESS: (count) => `Processed ${count} files from batch`,
      COMPRESSION_OPTIMIZED: (originalSize, compressedSize, savings) =>
        `File optimized from ${originalSize} to ${compressedSize} (${savings}% smaller)`,
      MANUAL_SAVE_SUCCESS: 'File attached'
    }),

    VALIDATION: Object.freeze({
      SYSTEM_UNAVAILABLE: 'Validation system not available',
      EXTENSION_REQUIRED: 'Extension is required',
      LETTERS_NUMBERS_ONLY: 'Enter letters or numbers only',
      SECURITY_RISK: 'Security risk: executable extensions are not allowed',
      NO_DOTS_NEEDED: 'No dots or extensions needed - file format is set in the extension popup',
      INVALID_CHARACTERS: 'Only letters, numbers, spaces, dashes and underscores are allowed'
    }),

    ERRORS: Object.freeze({
      EXTENSION_RELOADED: 'Extension was reloaded. Please refresh the page and try again',
      EXTENSION_CONTEXT: 'Extension context issue. Please refresh the page and try again',
      NO_FILE_INPUT: 'Cannot find file upload area. Try clicking the attachment button on the platform first',
      NETWORK_ERROR: 'Network error. Check your internet connection and try again',
      PERMISSION_DENIED: 'Permission denied. Please refresh the page and try again',
      ATTACHMENT_FAILED: 'File attachment failed. Please refresh the page and try again',
      NO_TEXT_INPUT: 'No text found in chat input. Type your message first',
      TEXT_TOO_SHORT: (current, minimum) => `Text too short (${current} words). Minimum ${minimum} words required`,
      TEXT_TOO_SHORT_MANUAL: 'Text too short for manual save. Either add more text or lower the Min Words setting',
      BUSY_PROCESSING: 'Another file attachment is in progress. Please wait',
      PLATFORM_NOT_SUPPORTED: 'This AI platform is not supported. Try ChatGPT, Claude, Gemini, DeepSeek, or Grok',
      NO_INPUT_FIELD: 'Cannot find chat input field. Make sure you are on a supported AI chat page',
      CONNECTION_FAILED: 'Cannot connect to the page. Please refresh and try again',
      NO_RESPONSE: 'No response from the page. Please refresh and try again',
      NO_TAB_ACCESS: 'Cannot access the current tab. Please try again',
      BATCH_PROCESSING_FAILED: (error) => `Batch processing failed: ${error}`,
      EXPORT_FAILED: 'Export failed. Please try again'
    }),

    PLATFORM_SPECIFIC: Object.freeze({
      GEMINI_NO_INPUT: 'Cannot find Gemini file input. Try clicking the paperclip icon first, then retry',
      CHATGPT_NO_INPUT: 'Cannot find ChatGPT file input. Try clicking the attachment button first, then retry',
      CLAUDE_NO_INPUT: 'Cannot find Claude file input. Try clicking the attachment icon first, then retry',
      GENERIC_NO_INPUT: 'Try clicking the attachment button on the platform first, then retry',
      TRY_ATTACHMENT_BUTTON: 'Try clicking the attachment button on the platform first, then retry',
      MANUAL_DRAG_DROP: 'Still cannot find file input. Please attach the file manually by dragging it to the chat'
    }),

    SUCCESS: Object.freeze({
      ANALYTICS_EXPORTED: 'Analytics data exported successfully',
      GITHUB_STAR: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/></svg> Thanks! Opening GitHub to star the repository',
      FEEDBACK_SENT: 'Feedback email opened successfully! Thank you for helping us improve.',
      NOT_ON_PLATFORM: 'Not on a supported AI platform. Open ChatGPT, Claude, Gemini, DeepSeek, or Grok first'
    }),

    ANALYTICS: Object.freeze({
      NO_DATA: 'No data',
      NO_DATA_YET: 'No data yet',
      ERROR_LOADING: 'Error loading data',
      CLEARING_DATA: 'Clearing data...',
      CHART_ERROR: 'Chart error',
      CHART_UNAVAILABLE: 'Chart unavailable',
      TODAY: 'Today',
      YESTERDAY: 'Yesterday',
      DAYS_AGO: '$DAYS$ days ago',
      FILES_LABEL: 'files',
      LAST_7_DAYS: 'Last 7 Days',
      LAST_30_DAYS: 'Last 30 Days',
      LAST_90_DAYS: 'Last 90 Days',
      ALL_TIME: 'All Time',
      ANALYTICS_UPDATED: 'Analytics updated: $PERIOD$'
    }),

    PLATFORMS: Object.freeze({
      CHATGPT: 'ChatGPT: Full integration with chat.openai.com',
      CLAUDE: 'Claude: Native support for claude.ai conversations',
      GEMINI: 'Gemini: Seamless integration with gemini.google.com',
      DEEPSEEK: 'DeepSeek: Complete support for chat.deepseek.com',
      GROK: 'Grok: Full compatibility with x.ai platform'
    }),

    UI_COMPONENTS: Object.freeze({
      MODAL_TITLE: 'Rename file',
      MODAL_DESCRIPTION: 'Enter a filename (without extension). Leave blank to use the default name.',
      MODAL_PLACEHOLDER: 'e.g. conversation-notes',
      MODAL_HINT: 'Allowed: letters, numbers, spaces, dashes, underscores (max 64). No extension.',
      MODAL_KEYS_HINT: 'Press <span class="key">Enter</span> to save · <span class="key">Esc</span> to cancel',
      MODAL_CANCEL: 'Cancel',
      MODAL_SAVE: 'Save',
      LOADER_CANCEL: 'Cancel',
      RETRY: 'Retry',
      SEARCHING_FOR_FILE_INPUT: 'Searching for file input...',
      DELAY_COUNTDOWN: (seconds) => `Attaching in ${seconds} seconds`,
      BANNER_NOT_SUPPORTED: 'Not on a supported site. Open ChatGPT, Claude, Gemini, DeepSeek, or Grok to use Multi-AI File Paster.',
      BATCH_ACTIVE_BADGE: 'BATCH',
      TOGGLE_THEME: 'Toggle theme',
      CUSTOM_FORMAT_PLACEHOLDER: 'e.g. log, cfg, data',
      CLOSE: 'Close',
      DATA_CLEARED_SUCCESS: 'Data cleared successfully',
      CUSTOM_FORMAT_LABEL: 'Custom',
      CONNECTED_TO: 'Connected to $MODEL$',
      STOPPED_ON: 'Stopped on $MODEL$',
      AI_MODEL_DEFAULT: 'AI Model',
      BATCH_ACTIVE_TIP: `<span class='tip-badge batch'>BATCH ACTIVE</span> File Compression is disabled when Batch Mode is enabled. Only one compression method can be active at a time.`,
      BATCH_DELAY_TIP: `<span class='tip-badge batch'>BATCH ACTIVE</span> This setting is disabled when Batch Mode is enabled. Batch Mode uses its own delay setting for file uploads. Turn off Batch Mode to use this delay setting.`,
      BATCH_AUTO_ATTACH_TIP: `<span class='tip-badge batch'>BATCH ACTIVE</span> Auto Attach is disabled when Batch Mode is enabled. Batch Mode handles file attachment automatically for split content. Turn off Batch Mode to use Auto Attach for regular single files.`,
      EXPORT_FILENAME_PREFIX: 'multi-ai-paster-analytics-',
      EXPORT_BY_PREFIX: 'Multi-AI File Paster v',
      FEEDBACK_SUPPORT_DESCRIPTION: 'issue or question',
      FEEDBACK_IMPROVEMENT_DESCRIPTION: 'feature request or improvement idea',
      FEEDBACK_DEFAULT_DESCRIPTION: 'feedback or suggestion',
      DISABLED_TITLE: 'Open AI chat and type text to attach as file',
      LANGUAGE_CHANGED: 'Language changed to $LANGUAGE$'
    }),

    CONSOLE: Object.freeze({
      CONFIG_LOAD_FAILED: 'GPTPF: Failed to load config.js in background worker:',
      MANUAL_SAVE_ERROR: 'Manual save error:',
      PLATFORM_HANDLER_ERROR: 'Platform handler error:',
      COMPONENT_INIT_ERROR: 'Component initialization error:'
    }),

    HTML_SECTIONS: Object.freeze({
      HEADER_SECTION: `<div class="header-content">
        <div class="header-title">
          <img src="../../logo/mfp_128.png" alt="Multi-AI File Paster" class="header-logo" />
          <h1 id="title">Multi-AI File Paster</h1>
        </div>
        <p class="subtitle">Auto-converts long pastes and auto-attaches clean files in ChatGPT, Claude, Gemini, DeepSeek & Grok. Supports Auto-Detect and 20+ formats including code files.</p>
      </div>`,

      CONTROLS_SECTION: `<div class="row" id="debugRow">
        <label for="debugToggle" class="label">Debug Mode</label>
        <label class="switch">
          <input type="checkbox" id="debugToggle" />
          <span class="slider" aria-hidden="true"></span>
        </label>
      </div>
      <div class="row">
        <div class="label">
          <span>Auto Attach</span>
          <button class="help" type="button" aria-label="What is Auto Attach?" aria-expanded="false">?</button>
        </div>
        <label class="switch">
          <input type="checkbox" id="attachToggle" />
          <span class="slider" aria-hidden="true"></span>
        </label>
      </div>
      <div class="row" id="claudeRow" hidden>
        <div class="label">
          <span>Override Claude's Auto-Attach</span>
          <button class="help" type="button" aria-label="Claude Override" aria-expanded="false">?</button>
        </div>
        <label class="switch">
          <input type="checkbox" id="claudeOverrideToggle" />
          <span class="slider" aria-hidden="true"></span>
        </label>
      </div>`,

      FOOTER_SECTION: `<div class="footer-left">
        <span>© 2025 · Multi-AI File Paster · Developed by <a href="https://josephmatino.com" target="_blank" rel="noopener">Joseph Matino</a> | Scrum Master: <a href="https://majokdeng.com" target="_blank" rel="noopener">Majok Deng</a> | powered by <a href="https://hostwek.com" target="_blank" rel="noopener" aria-label="Hostwek website"><img src="../../logo/hostwek.png" alt="Hostwek" class="logo" /></a></span>
      </div>`,

      ABOUT_MODAL_CONTENT: `<div class="modal-section">
        <h3>Smart File Attachment for AI Chats</h3>
        <p>Multi-AI File Paster detects when you paste long text (code, documentation, data) and converts it into properly formatted files. This keeps chats clean and within platform limits.</p>
        <p><strong>Key Features:</strong> Auto-Detect picks the right file type from your content with a guaranteed fallback to .txt. Works across ChatGPT, Claude, Gemini, DeepSeek, and Grok. Supports 20+ file formats including programming languages, markup, data formats, and custom extensions.</p>
        <p><strong>New in v1.1.0:</strong> Batch Mode splits large content into multiple files, GZIP compression reduces file sizes by 60-80%, and improved analytics dashboard tracks your usage patterns.</p>
      </div>
      <div class="modal-section">
        <h3>Configuration</h3>
        <ul>
          <li>Auto Attach: Automatically detects and converts long pastes (customizable word threshold: 50-15,000 words)</li>
          <li>Delay: Optional 1-15 second countdown prevents accidental attachments</li>
          <li>Multi-Format Support: Choose from 20+ file types including programming languages, markup, data formats, and custom extensions</li>
          <li>Platform Optimization: Special handling for each AI platform's unique file attachment system</li>
          <li>Batch Processing: Split large content into 2-4 files with smart line division</li>
          <li>File Compression: GZIP compression reduces file sizes for better performance</li>
          <li>Manual Override: On-demand conversion of typed text to file attachments</li>
          <li>Claude Integration: Works alongside or replaces Claude's built-in paste-to-file feature</li>
          <li>Analytics Dashboard: Track usage patterns and file creation statistics</li>
        </ul>
      </div>
      <div class="modal-section">
        <h3>Supported AI Platforms</h3>
        <p>Integrates with the most popular AI chat platforms:</p>
        <ul>
          <li>ChatGPT: Full integration with chat.openai.com</li>
          <li>Claude: Native support for claude.ai conversations</li>
          <li>Gemini: Seamless integration with gemini.google.com</li>
          <li>DeepSeek: Complete support for chat.deepseek.com</li>
          <li>Grok: Full compatibility with x.ai platform</li>
        </ul>
        <p><strong>Why this matters:</strong> Each platform has different file attachment systems. Our extension handles these differences automatically, ensuring your files attach correctly regardless of which AI you're using.</p>
      </div>
      <div class="modal-section">
        <h3>Privacy</h3>
        <p><strong>Zero Data Collection:</strong> All text processing happens entirely on your device. Your content never leaves your computer - no servers, no cloud processing, no data transmission.</p>
        <p><strong>What we DON'T do:</strong> We never read, store, or transmit your text content, URLs, personal information, or browsing data. Your conversations with AI remain completely private.</p>
        <p><strong>What we DO:</strong> Process your text locally to create file attachments, then immediately discard the processed data. Simple, secure, transparent.</p>
        <div class="privacy-setting">
          <label for="telemetryToggle" class="privacy-label">
            <input type="checkbox" id="telemetryToggle" />
            <strong>Anonymous Usage Analytics (Optional)</strong>
          </label>
          <p class="privacy-desc">Help improve the extension by sharing anonymous usage counts only (files created, errors encountered). Never collects content, URLs, or personal data. Fully optional and can be disabled anytime.</p>
          <p class="privacy-desc"><strong>Note:</strong> Analytics dashboard is only visible when this option is enabled.</p>
        </div>
      </div>
      <div class="modal-section">
        <h3>Development Team & Support</h3>
        <p>
          <strong>Lead Developer:</strong> <a href="https://josephmatino.com" target="_blank" rel="noopener">Joseph Matino</a><br>
          <strong>Scrum Master:</strong> <a href="https://majokdeng.com" target="_blank" rel="noopener">Majok Deng</a><br>
          <strong>Company:</strong> <a href="https://hostwek.com" target="_blank" rel="noopener">WekTurbo Designs - Hostwek LTD</a>
        </p>
        <p>
          <strong>Support Contacts:</strong><br>
          • Extension Support: <a href="mailto:wekturbo@hostwek.com">wekturbo@hostwek.com</a><br>
          • Technical Issues: <a href="mailto:dev@josephmatino.com">dev@josephmatino.com</a>
        </p>
        <p>
          <strong>Resources:</strong> <a href="https://github.com/JosephMatino/MultiAiFilePaster" target="_blank" rel="noopener">GitHub Repository</a> ·
          <a href="https://josephmatino.com" target="_blank" rel="noopener">Developer Website</a> ·
          <a href="https://hostwek.com/wekturbo" target="_blank" rel="noopener">WekTurbo Page</a> ·
          <a href="https://majokdeng.com" target="_blank" rel="noopener">Majok Deng</a>
        </p>
        <p class="hint"><strong>Keyboard Shortcut:</strong> <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> (Manual Save)</p>
      </div>`,

      FEEDBACK_MODAL_CONTENT: `<div class="modal-section">
        <h3>What type of feedback would you like to send?</h3>
        <div class="feedback-options">
          <button class="feedback-option" data-type="support" data-email="wekturbo@hostwek.com" data-subject="Multi-AI File Paster - Support Request">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            <div>
              <strong>Support Request</strong>
              <p>Get help with issues, bugs, or technical problems</p>
            </div>
          </button>
          <button class="feedback-option" data-type="feedback" data-email="wekturbo@hostwek.com" data-subject="Multi-AI File Paster - User Feedback">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 13h-2v-2h2v2zm0-4h-2V7h2v4z"/></svg>
            <div>
              <strong>General Feedback</strong>
              <p>Share your thoughts, suggestions, or user experience</p>
            </div>
          </button>
          <button class="feedback-option" data-type="improvement" data-email="dev@josephmatino.com" data-subject="Multi-AI File Paster - Feature Request">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <div>
              <strong>Feature Request</strong>
              <p>Suggest new features or improvements to make it better</p>
            </div>
          </button>
        </div>
      </div>`
    }),

    MODALS: Object.freeze({
      ABOUT_TITLE: 'About Multi-AI File Paster',
      HELP_TITLE: 'Help & Support',
      HELP_CONTENT: `<div class="modal-section">
        <h3>Getting Started with Multi-AI File Paster</h3>
        <p>Multi-AI File Paster works automatically once installed. Simply start typing in any supported AI chat platform, and the extension will handle the rest. No complex setup required!</p>
        <p><strong>First Time Setup:</strong> The extension is ready to use immediately. Default settings work for most users, but you can customize everything through the popup interface.</p>
      </div>
      <div class="modal-section">
        <h3>Keyboard Shortcuts & Quick Actions</h3>
        <ul>
          <li><kbd>Ctrl+Shift+S</kbd> (or <kbd>Cmd+Shift+S</kbd> on Mac) - Manual save current text as file</li>
          <li><kbd>Escape</kbd> - Close modals and cancel operations</li>
          <li><strong>Click Extension Icon:</strong> Open settings and analytics dashboard</li>
          <li><strong>Right-click Extension:</strong> Quick access to options and help</li>
        </ul>
      </div>
      <div class="modal-section">
        <h3>Settings Explained in Detail</h3>
        <ul>
          <li><strong>Auto Attach:</strong> Automatically converts long pastes into files. Turn off to paste normally and use Manual Save button.</li>
          <li><strong>Min Words to Trigger:</strong> Auto-attach only runs when your paste is at least this long. Recommended: 100+ words so short messages stay inline.</li>
          <li><strong>Use Delay:</strong> Adds a countdown before attaching files. Gives you time to cancel if needed. Useful for preventing accidental attachments.</li>
          <li><strong>File Format:</strong> Choose the file extension for your attachments. Auto-Detect analyzes content and picks the best format automatically.</li>
          <li><strong>Batch Mode (BETA):</strong> Splits very large content into multiple smaller files. Prevents platform upload limits and improves performance.</li>
          <li><strong>File Compression:</strong> Uses GZIP compression to reduce file sizes by 60-80%. Faster uploads and better performance.</li>
          <li><strong>Analytics:</strong> Optional usage tracking to help improve the extension. Completely anonymous and can be disabled anytime.</li>
        </ul>
      </div>
      <div class="modal-section">
        <h3>Advanced Features & Tips</h3>
        <ul>
          <li><strong>Custom File Formats:</strong> Add your own file extensions for specialized content types</li>
          <li><strong>Batch Processing:</strong> Perfect for large codebases, documentation, or data sets</li>
          <li><strong>Platform Detection:</strong> Automatically adapts to each AI platform's specific requirements</li>
          <li><strong>Content Analysis:</strong> Smart detection of code, markdown, JSON, CSV, and other formats</li>
          <li><strong>Performance Optimization:</strong> Compression and batch processing for large files</li>
          <li><strong>Usage Analytics:</strong> Track your productivity and file creation patterns</li>
        </ul>
      </div>
      <div class="modal-section">
        <h3>Troubleshooting & Common Issues</h3>
        <ul>
          <li><strong>Attachment fails:</strong> Try refreshing the page and ensure you're on a supported AI platform</li>
          <li><strong>File not attaching:</strong> Check that the chat input field is active and you have enough text (above Min Words setting)</li>
          <li><strong>Wrong file format:</strong> Use the File Format dropdown to select a specific format, or choose Auto-Detect for smart detection</li>
          <li><strong>Platform not supported:</strong> Currently supports ChatGPT, Claude, Gemini, DeepSeek, and Grok. More platforms coming soon!</li>
          <li><strong>Extension not working:</strong> Try clicking the platform's attachment button first, then retry your paste</li>
          <li><strong>Large files:</strong> Enable Batch Mode to split large content into smaller, manageable files</li>
          <li><strong>Slow performance:</strong> Enable File Compression to reduce file sizes and improve upload speed</li>
        </ul>
      </div>`,
      FEEDBACK_TITLE: 'Send Feedback',
      FEEDBACK_CONTENT: `<div class="modal-section">
        <p>We value your feedback! Choose how you'd like to get in touch:</p>
      </div>
      <div class="feedback-options">
        <button class="feedback-option" data-email="support@hostwek.com" data-type="support">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <path d="M12 17h.01"/>
          </svg>
          <div>
            <strong>Get Support</strong>
            <p>Need help with the extension? Have a technical issue? We're here to help!</p>
          </div>
        </button>
        <button class="feedback-option" data-email="feedback@hostwek.com" data-type="improvement">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <div>
            <strong>Suggest Improvements</strong>
            <p>Have ideas for new features? Want to suggest enhancements? Share your thoughts!</p>
          </div>
        </button>
        <button class="feedback-option" data-email="feedback@hostwek.com" data-type="general">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <div>
            <strong>General Feedback</strong>
            <p>Share your experience, report bugs, or just let us know what you think!</p>
          </div>
        </button>
      </div>`
    }),

    VALIDATION: Object.freeze({
      EXTENSION_REQUIRED: 'Extension is required',
      LETTERS_NUMBERS_ONLY: 'Enter letters or numbers only',
      SECURITY_RISK_EXECUTABLE: 'Security risk: executable extensions are not allowed'
    })
  });

  function getMessage(category, key, ...args) {
    try {
      try {
        const i18n = (typeof window !== 'undefined') ? window.GPTPF_I18N : (typeof self !== 'undefined' ? self.GPTPF_I18N : null);
        if (i18n && typeof i18n.getMessage === 'function') {
          const composedKey = `${String(category || '').toLowerCase()}_${String(key || '').toLowerCase()}`;
          const translated = i18n.getMessage(composedKey, args);
          if (translated && translated !== composedKey) {
            return translated;
          }

          const simpleKey = String(key || '').toLowerCase();
          const simpleTranslated = i18n.getMessage(simpleKey, args);
          if (simpleTranslated && simpleTranslated !== simpleKey) {
            return simpleTranslated;
          }
        }
      } catch(e) { }

      const categoryMessages = MESSAGES[category];
      if (!categoryMessages) return `Unknown category: ${category}`;

      const message = categoryMessages[key];
      if (!message) return `Unknown message: ${category}.${key}`;

      if (typeof message === 'function') {
        return message(...args);
      }

      return message;
    } catch (error) {
      return `Message error: ${category}.${key}`;
    }
  }

  function getSettingMessage(settingKey, value, oldValue) {
    switch (settingKey) {
      case 'wordLimit':
        return getMessage('SETTINGS', 'WORD_LIMIT_UPDATED', value);
      case 'useDelay':
        return value 
          ? getMessage('SETTINGS', 'DELAY_ENABLED', oldValue?.delaySeconds || 3)
          : getMessage('SETTINGS', 'DELAY_DISABLED');
      case 'delaySeconds':
        return getMessage('SETTINGS', 'DELAY_ENABLED', value);
      case 'batchMode':
        return value 
          ? getMessage('SETTINGS', 'BATCH_MODE_ENABLED')
          : getMessage('SETTINGS', 'BATCH_MODE_DISABLED');
      case 'enableCompression':
        return value 
          ? getMessage('SETTINGS', 'COMPRESSION_ENABLED', oldValue?.compressionThreshold || 1024)
          : getMessage('SETTINGS', 'COMPRESSION_DISABLED');
      case 'batchCompression':
        return value 
          ? getMessage('SETTINGS', 'BATCH_COMPRESSION_ENABLED')
          : getMessage('SETTINGS', 'BATCH_COMPRESSION_DISABLED');
      case 'autoAttachEnabled':
        return value 
          ? getMessage('SETTINGS', 'AUTO_ATTACH_ENABLED')
          : getMessage('SETTINGS', 'AUTO_ATTACH_DISABLED');
      case 'claudeOverride':
        return value 
          ? getMessage('SETTINGS', 'CLAUDE_OVERRIDE_ENABLED')
          : getMessage('SETTINGS', 'CLAUDE_OVERRIDE_DISABLED');
      case 'telemetryEnabled':
        return value 
          ? getMessage('SETTINGS', 'TELEMETRY_ENABLED')
          : getMessage('SETTINGS', 'TELEMETRY_DISABLED');
      case 'showDebug':
        return value 
          ? getMessage('SETTINGS', 'DEBUG_ENABLED')
          : getMessage('SETTINGS', 'DEBUG_DISABLED');
      case 'maxBatchFiles':
        return getMessage('SETTINGS', 'MAX_BATCH_FILES_UPDATED', value);
      case 'batchProcessingDelay':
        return getMessage('SETTINGS', 'BATCH_DELAY_UPDATED', value);
      case 'compressionThreshold':
        return getMessage('SETTINGS', 'COMPRESSION_THRESHOLD_UPDATED', value);
      default:
        return getMessage('SETTINGS', 'SAVING');
    }
  }

  root.GPTPF_MESSAGES = Object.freeze({
    getMessage,
    getSettingMessage,
    CATEGORIES: Object.keys(MESSAGES)
  });
})();
