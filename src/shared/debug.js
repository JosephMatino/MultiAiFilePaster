/*
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: src/shared/debug.js
 * FUNCTION: Centralized debug logging and error handling system
 * ARCHITECTURE: Console interception with toast integration
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
 * • CORE DEPENDENCIES: Chrome Extension APIs, CompressionStream, FileReader
 * • FEATURES: Centralized debug logging, console interception, toast integration
 * • TESTING: Automated unit tests, integration tests, debug system validation
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
  if (root.GPTPF_DEBUG && root.GPTPF_DEBUG.__v === EXTENSION_VERSION) return;

  let debugSettings = {
    enabled: false,
    showToasts: false,
    showConsole: true,
    interceptConsole: false,
    logLevel: 'warnings'
  };

  let originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
  };

  let isInitialized = false;
  let isShowingToast = false;
  let lastToastTime = 0;
  let toastQueue = [];

  function updateDebugSettings() {
    const config = root.GPTPF_CONFIG;
    if (!config) return;

    const debugConfig = config.DEBUG;
    if (!debugConfig || !debugConfig.enabled) {
      debugSettings.enabled = false;
      return;
    }

    chrome.storage.local.get(['showDebug', 'debugLevel'], (result) => {
      const userDebugEnabled = result.showDebug || config.DEFAULTS.showDebug;
      const userDebugLevel = result.debugLevel || debugConfig.logLevel;

      debugSettings.enabled = debugConfig.enabled && userDebugEnabled;
      debugSettings.showToasts = debugSettings.enabled && (debugConfig.showToastMessages || debugConfig.toastDebugMessages);
      debugSettings.showConsole = debugSettings.enabled && debugConfig.showConsoleMessages;
      debugSettings.interceptConsole = debugSettings.enabled && debugConfig.interceptConsole;
      debugSettings.logLevel = userDebugLevel;

      if (debugSettings.interceptConsole && !isInitialized) {
        initializeConsoleInterception();
      }
    });
  }

  function initializeConsoleInterception() {
    if (isInitialized) return;
    isInitialized = true;

    console.log = function(...args) {
      originalConsole.log.apply(console, args);
      if (debugSettings.enabled && debugSettings.showToasts && shouldShowLevel('log')) {
        showDebugToast('LOG', args.join(' '));
      }
    };

    console.warn = function(...args) {
      originalConsole.warn.apply(console, args);
      if (debugSettings.enabled && debugSettings.showToasts && shouldShowLevel('warn')) {
        showDebugToast('WARN', args.join(' '));
      }
    };

    console.error = function(...args) {
      originalConsole.error.apply(console, args);
      if (debugSettings.enabled && debugSettings.showToasts && shouldShowLevel('error')) {
        showDebugToast('ERROR', args.join(' '));
      }
    };

    console.info = function(...args) {
      originalConsole.info.apply(console, args);
      if (debugSettings.enabled && debugSettings.showToasts && shouldShowLevel('info')) {
        showDebugToast('INFO', args.join(' '));
      }
    };
  }

  function showDebugToast(level, message) {
    if (!debugSettings.enabled || !debugSettings.showToasts) return;

    const now = Date.now();
    const minInterval = 1000;

    if (now - lastToastTime < minInterval) {
      toastQueue.push({ level, message, timestamp: now });
      setTimeout(() => {
        if (toastQueue.length > 0) {
          const latest = toastQueue[toastQueue.length - 1];
          toastQueue = [];
          showDebugToastImmediate(latest.level, latest.message);
        }
      }, minInterval - (now - lastToastTime));
      return;
    }

    showDebugToastImmediate(level, message);
  }

  function showDebugToastImmediate(level, message) {
    if (isShowingToast) return;

    isShowingToast = true;
    lastToastTime = Date.now();

    const badgeClass = level === 'ERROR' ? 'debug-error' :
                      level === 'WARN' ? 'debug-warn' :
                      level === 'LOG' ? 'debug-info' :
                      level === 'INFO' ? 'debug-info' : 'debug-info';

    const badgeKey = `debug_${level.toLowerCase()}`;
    const badgeText = root.GPTPF_I18N ? root.GPTPF_I18N.getMessage(badgeKey) : '';

    let displayMessage = message;
    if (root.GPTPF_I18N && typeof message === 'string' && !message.includes(' ')) {
      const translatedMessage = root.GPTPF_I18N.getMessage(message);
      if (translatedMessage) {
        displayMessage = translatedMessage;
      }
    }

    const badge = `<span class="tip-badge ${badgeClass}">${badgeText}</span>`;
    const fullMessage = `${badge} ${displayMessage}`;

    if (root.GPTPF_FLASH && typeof root.GPTPF_FLASH === 'function') {
      const flashLevel = level === 'ERROR' ? 'error' : (level === 'WARN' ? 'warning' : 'info');
      root.GPTPF_FLASH(fullMessage, flashLevel);
    }

    setTimeout(() => {
      isShowingToast = false;
    }, 100);
  }

  function shouldShowLevel(level) {
    const currentLevel = debugSettings.logLevel;

    if (level.toLowerCase() === 'error') return true;
    if (level.toLowerCase() === 'warn') return currentLevel === 'warnings' || currentLevel === 'all';
    if (level.toLowerCase() === 'info' || level.toLowerCase() === 'log') return currentLevel === 'all';

    return currentLevel === 'all';
  }

  function debugLog(level, message, data = null) {
    if (!debugSettings.enabled || !shouldShowLevel(level)) return;

    const timestamp = new Date().toISOString();

    let displayMessage = message;
    if (root.GPTPF_I18N && typeof message === 'string' && message.startsWith('debug_')) {
      const i18nMessage = root.GPTPF_I18N.getMessage(message);
      if (i18nMessage) {
        displayMessage = i18nMessage;
      }
    }

    const logMessage = `[${timestamp}] ${displayMessage}`;

    if (debugSettings.showConsole) {
      switch (level.toLowerCase()) {
        case 'error':
          originalConsole.error(logMessage, data);
          break;
        case 'warn':
          originalConsole.warn(logMessage, data);
          break;
        case 'info':
          originalConsole.info(logMessage, data);
          break;
        default:
          originalConsole.log(logMessage, data);
      }
    }

    if (debugSettings.showToasts) {
      showDebugToast(level.toUpperCase(), displayMessage);
    }
  }

  function isDebugEnabled() {
    return debugSettings.enabled;
  }

  function enableDebug(enable = true) {
    chrome.storage.local.set({ showDebug: enable }, () => {
      updateDebugSettings();
      const messageKey = enable ? 'debug_enabled' : 'debug_disabled';
      const message = root.GPTPF_I18N?.getMessage(messageKey);

      if (enable && debugSettings.showToasts && message) {
        showDebugToast('INFO', message);
      }
    });
  }

  if (root.GPTPF_CONFIG && root.GPTPF_I18N) {
    updateDebugSettings();
  } else {
    const checkDependencies = () => {
      if (root.GPTPF_CONFIG && root.GPTPF_I18N) {
        updateDebugSettings();
      } else {
        setTimeout(checkDependencies, 50);
      }
    };
    checkDependencies();
  }

  chrome?.storage?.onChanged?.addListener((changes) => {
    if (changes.showDebug || changes.debugLevel) {
      updateDebugSettings();
    }
  });

  root.GPTPF_DEBUG = Object.freeze({
    __v: EXTENSION_VERSION,
    log: (message, data) => debugLog('log', message, data),
    warn: (message, data) => debugLog('warn', message, data),
    error: (message, data) => debugLog('error', message, data),
    info: (message, data) => debugLog('info', message, data),
    isEnabled: isDebugEnabled,
    enable: enableDebug,
    updateSettings: updateDebugSettings
  });
})();