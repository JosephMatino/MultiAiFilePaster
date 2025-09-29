/*
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: src/shared/config.js
 * FUNCTION: Centralized configuration for all extension components
 * ARCHITECTURE: Global Configuration Object with Platform Mappings
 * SECURITY: Client-side processing, zero data transmission, privacy-first
 * PERFORMANCE: Optimized for Chrome V3 Manifest, lazy loading, efficient memory
 * COMPATIBILITY: Chrome 88+, Edge 88+, Opera 74+, cross-platform support
 * RELIABILITY: Production error handling, graceful degradation, stable operation
 *
 * DEVELOPMENT TEAM & PROJECT LEADERSHIP:
 * • LEAD DEVELOPER: Joseph Matino <dev@josephmatino.com> | https:
 * • SCRUM MASTER & PROJECT FUNDING: Majok Deng <scrum@majokdeng.com> | https:
 * • QUALITY ASSURANCE: Automated testing pipeline with CircleCI integration
 * • PROJECT MANAGEMENT: Agile methodology, continuous integration/deployment
 * • CODE REVIEW: Peer review process, automated quality gates, security audits
 * • DOCUMENTATION: Technical writers, API documentation, user experience guides
 *
 * ORGANIZATION & GOVERNANCE:
 * • COMPANY: HOSTWEK LTD - Premium Hosting Company | East Africa | https:
 * • DIVISION: WekTurbo Designs - Web Development Division | https:
 * • REPOSITORY: https:
 * • TECHNICAL SUPPORT: dev@josephmatino.com, wekturbo@hostwek.com | Response time: 24-48 hours
 * • DOCUMENTATION: Complete API docs, user guides, developer documentation
 * • COMMUNITY: Development community, issue tracking, feature requests
 * • ROADMAP: Public development roadmap, community feedback integration
 *
 * TECHNICAL ARCHITECTURE & INTEGRATIONS:
 * • PLATFORM INTEGRATIONS: ChatGPT, Claude, Gemini, DeepSeek, Grok
 * • CORE DEPENDENCIES: Chrome Extension APIs, FileReader API
 * • FEATURES: Centralized configuration, platform detection, settings management
 * • TESTING: Automated unit tests, integration tests, configuration validation
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
  const EXTENSION_VERSION = '1.1.0';
  const root = (typeof self !== 'undefined') ? self : window;
  if (root.GPTPF_CONFIG && root.GPTPF_CONFIG.__v === EXTENSION_VERSION) return;
  root.GPTPF_DEBUG?.log('debug_config_system_init');
  const DEFAULT_CONFIG = Object.freeze({
    __v: EXTENSION_VERSION,
    __schema: 2,
    VERSION: EXTENSION_VERSION,
    APP_NAME: 'Multi-AI File Paster',
    LANGUAGE_DEFAULT: 'en',
    HOSTS: [
      'https://chat.openai.com/',
      'https://chatgpt.com/',
      'https://claude.ai/',
      'https://gemini.google.com/',
      'https://chat.deepseek.com/',
      'https://grok.com/'
    ],
    PLATFORM_DOMAINS: Object.freeze({
      chatgpt: ['chat.openai.com', 'chatgpt.com'],
      claude: ['claude.ai'],
      gemini: ['gemini.google.com'],
      deepseek: ['chat.deepseek.com'],
      grok: ['grok.com']
    }),
    OFFICIAL_LINKS: Object.freeze({
      repo: 'https://github.com/JosephMatino/MultiAiFilePaster',
      website: 'https://hostwek.com/wekturbo',
      companySite: 'https://hostwek.com',
      developerSite: 'https://josephmatino.com',
      ceoSite: 'https://majokdeng.com',
      supportEmail: 'wekturbo@hostwek.com'
    }),
    PLATFORM_TIMEOUTS: Object.freeze({
      chatgpt: 2000,
      claude: 3000,
      deepseek: 3000,
      gemini: 5000,
      grok: 4000,
      default: 3000
    }),
    DEBUG: Object.freeze({
      enabled: true,
      logLevel: 'warnings',
      showConsoleMessages: true,
      showToastMessages: true,
      showDebugPanel: true,
      logCategories: ['errors', 'warnings', 'all'],
      centralizedErrorHandling: true,
      toastDebugMessages: true,
      interceptConsole: true
    }),
    DEFAULTS: Object.freeze({
      __schema: 2,
      debugMode: true,
      showDebug: false,
      wordLimit: 500,
      autoAttachEnabled: true,
      useDelay: false,
      delaySeconds: 3,
      fileFormat: "auto",
      batchMode: false,
      maxBatchFiles: 3,
      batchProcessingDelay: 500,
      telemetryEnabled: true,
      claudeOverride: true,
      defaultTheme: 'dark',
      selectedTheme: 'default',
      debugLevel: 'errors'
    }),
    PLATFORM_COLORS: Object.freeze({
      chatgpt: {
        primary: '142 71% 45%',
        secondary: '142 76% 36%',
        accent: '142 69% 58%'
      },
      claude: {
        primary: '20 85% 45%',
        secondary: '25 80% 40%',
        accent: '30 75% 50%'
      },
      gemini: {
        primary: '217 85% 55%',
        secondary: '213 80% 60%',
        accent: '199 75% 45%'
      },
      deepseek: {
        primary: '200 85% 45%',
        secondary: '195 80% 50%',
        accent: '205 75% 40%'
      },
      grok: {
        primary: '270 60% 52%',
        secondary: '270 55% 44%',
        accent: '270 70% 62%'
      },
      debug: {
        primary: '258 90% 66%',
        secondary: '271 81% 56%',
        accent: '217 91% 60%'
      }
    }),
    TELEMETRY_URL: null,
    TELEMETRY_METHOD: 'POST',
    TELEMETRY_HEADERS: { 'Content-Type': 'application/json' },
    TELEMETRY_BATCH_SIZE: 20,
    TELEMETRY_INTERVAL: 120000,
    TELEMETRY_KEEPALIVE: true,
    UI_TIMINGS: Object.freeze({
      flashTimeout: 3000,
      toastMs: 3000,
      toastInfoMs: 3000,
      toastSuccessMs: 3000,
      toastErrorMs: 3000,
      toastWithActionMs: 3000,
      languageOverlayMs: 3000,
      settingsSaveDelay: 300,
      analyticsLoadDelay: 200,
      batchProcessDelay: 500
    }),
    ANALYTICS_LIMITS: Object.freeze({
      maxHistoryItems: 500,
      trimToItems: 300
    }),
    VALIDATION_LIMITS: Object.freeze({
      minWordLimit: 50,
      maxWordLimit: 15000,
      eventNameMaxLength: 32,
      maxBatchFiles: 4,
      maxFileSize: 10485760
    }),
    LANGUAGE_DETECTION: Object.freeze({
      confidenceThreshold: 0.35,
      strongSignalWeight: 15,
      patternWeight: 3,
      htmlTagBoost: 25,
      tagPenalty: 15,
      cssBoost: 5,
      tagDensityDivisor: 120
    })
  });
  function isSupportedUrl(url) {
    const isSupported = DEFAULT_CONFIG.HOSTS.some(h => url && url.startsWith(h));
    root.GPTPF_DEBUG?.log('debug_config_url_check');
    return isSupported;
  }
  function isChatGPTUrl(url) {
    return isSupportedUrl(url);
  }
  function getConfig(cb) {
    root.GPTPF_DEBUG?.log('debug_config_get_start');
    chrome.storage.local.get(['__config'], (res) => {
      const ovr = res.__config || {};
      const hosts = Array.isArray(ovr.HOSTS) ? ovr.HOSTS : DEFAULT_CONFIG.HOSTS;
      const finalConfig = { ...DEFAULT_CONFIG, ...ovr, HOSTS: hosts };
      root.GPTPF_DEBUG?.log('debug_config_get_complete');
      cb(finalConfig);
    });
  }
  function setConfig(patch, cb) {
    root.GPTPF_DEBUG?.log('debug_config_set_start');
    chrome.storage.local.get(['__config'], (res) => {
      const prev = res.__config || {};
      const next = { ...prev, ...patch };
      chrome.storage.local.set({ __config: next }, () => {
        root.GPTPF_DEBUG?.log('debug_config_set_complete');
        cb && cb(true);
      });
    });
  }
  root.GPTPF_CONFIG = Object.freeze({
    ...DEFAULT_CONFIG,
    isSupportedUrl,
    isChatGPTUrl,
    getConfig,
    setConfig
  });
  root.GPTPF_DEBUG?.log('debug_config_system_ready');
})();
