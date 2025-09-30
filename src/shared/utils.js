/*
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: src/shared/utils.js
 * FUNCTION: Unified utility functions for Chrome API operations
 * ARCHITECTURE: Centralized utilities to eliminate code duplication
 * SECURITY: Client-side processing, zero data transmission, privacy-first
 * PERFORMANCE: Optimized for Chrome V3 Manifest, efficient API usage
 * COMPATIBILITY: Chrome 88+, Edge 88+, Opera 74+, modern browser APIs
 * RELIABILITY: Production error handling, graceful degradation, stable operation
 *
 * DEVELOPMENT TEAM & PROJECT LEADERSHIP:
 * • LEAD DEVELOPER: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • SCRUM MASTER & PROJECT FUNDING: Majok Deng <scrum@majokdeng.com> | https:
 * • QUALITY ASSURANCE: Automated testing pipeline with CircleCI integration
 * • PROJECT MANAGEMENT: Agile methodology, continuous integration/deployment
 * • CODE REVIEW: Peer review process, automated quality gates, security audits
 * • DOCUMENTATION: Technical writers, API documentation, user experience guides
 *
 * ORGANIZATION & GOVERNANCE:
 * • COMPANY: HOSTWEK LTD - Premium Hosting Company | East Africa | https://hostwek.com
 * • DIVISION: WekTurbo Designs - Web Development Division | https:
 * • REPOSITORY: https:
 * • TECHNICAL SUPPORT: dev@josephmatino.com, wekturbo@hostwek.com | Response time: 24-48 hours
 * • DOCUMENTATION: Complete API docs, user guides, developer documentation
 * • COMMUNITY: Development community, issue tracking, feature requests
 * • ROADMAP: Public development roadmap, community feedback integration
 *
 * TECHNICAL ARCHITECTURE & INTEGRATIONS:
 * • PLATFORM INTEGRATIONS: ChatGPT, Claude, Gemini, DeepSeek, Grok
 * • CORE DEPENDENCIES: Chrome Extension APIs, Storage APIs, Runtime messaging
 * • FEATURES: Unified Chrome API utilities, storage management, message handling
 * • TESTING: Automated unit tests, integration tests, API validation
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
 * Joseph Matino for browser and tooling solutions.
 *
 * PERMITTED USAGE RIGHTS:
 * Personal use by individuals for non-commercial purposes is permitted.
 * Educational institutions may use this software for instructional and research
 * activities. End users are authorized to install and operate the tooling as
 * distributed through official channels. Security researchers may conduct legitimate
 * analysis for vulnerability disclosure purposes.
 *
 * USAGE RESTRICTIONS:
 * Commercial redistribution is prohibited without written authorization.
 * Modification and derivative works are restricted to personal, non-commercial use.
 * Reverse engineering of proprietary algorithms is strictly forbidden.
 * No warranty or liability is assumed for any usage beyond intended scope.
 * This software may not be used to develop competing commercial products.
 * Security analysis must follow responsible disclosure practices through official channels.
 *
 * For commercial licensing, partnership opportunities, or technical inquiries:
 * Contact: dev@josephmatino.com | wekturbo@hostwek.com
 * ================================================================================
 */

(() => {
  const EXTENSION_VERSION = '1.1.0';
  const root = (typeof self !== 'undefined') ? self : window;
  if (root.GPTPF_UTILS && root.GPTPF_UTILS.__v === EXTENSION_VERSION) return;

  function getStorageData(keys, callback) {
    if (self.GPTPF_DEBUG?.isEnabled()) {
      self.GPTPF_DEBUG.log('debug_utils_storage_get_start');
    }
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        if (self.GPTPF_DEBUG?.isEnabled()) {
          self.GPTPF_DEBUG.error('debug_utils_storage_get_error', chrome.runtime.lastError);
        }
        callback(null);
        return;
      }
      if (self.GPTPF_DEBUG?.isEnabled()) {
        self.GPTPF_DEBUG.log('debug_utils_storage_get_success');
      }
      callback(result);
    });
  }

  function sendRuntimeMessage(message, callback) {
    if (self.GPTPF_DEBUG?.isEnabled()) {
      self.GPTPF_DEBUG.log('debug_utils_message_send_start');
    }
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        if (self.GPTPF_DEBUG?.isEnabled()) {
          self.GPTPF_DEBUG.error('debug_utils_message_send_error', chrome.runtime.lastError);
        }
        callback && callback(null);
        return;
      }
      if (self.GPTPF_DEBUG?.isEnabled()) {
        self.GPTPF_DEBUG.log('debug_utils_message_send_success');
      }
      callback && callback(response);
    });
  }

  function setStorageData(data, callback) {
    if (self.GPTPF_DEBUG?.isEnabled()) {
      self.GPTPF_DEBUG.log('debug_utils_storage_set_start');
    }
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        if (self.GPTPF_DEBUG?.isEnabled()) {
          self.GPTPF_DEBUG.error('debug_utils_storage_set_error', chrome.runtime.lastError);
        }
        callback && callback(false);
        return;
      }
      if (self.GPTPF_DEBUG?.isEnabled()) {
        self.GPTPF_DEBUG.log('debug_utils_storage_set_success');
      }
      callback && callback(true);
    });
  }

  function checkTelemetryEnabled(callback) {
    getStorageData('telemetryEnabled', (result) => {
      const enabled = !!(result && result.telemetryEnabled);
      callback(enabled);
    });
  }

  function handleDebugLevel(level, message, showToast = true) {
    if (!self.GPTPF_DEBUG?.isEnabled()) return false;
    const debugLevel = level.toLowerCase();
    if (debugLevel === 'error') return true;
    if (debugLevel === 'warn') return self.GPTPF_DEBUG.logLevel === 'warnings' || self.GPTPF_DEBUG.logLevel === 'all';
    if (debugLevel === 'info' || debugLevel === 'log') return self.GPTPF_DEBUG.logLevel === 'all';
    return self.GPTPF_DEBUG.logLevel === 'all';
  }

  function processDebugMessage(message) {
    if (!root.GPTPF_I18N || typeof message !== 'string') return message;
    if (message.startsWith('debug_') && !message.includes(' ')) {
      const translated = root.GPTPF_I18N.getMessage(message);
      return translated || message;
    }
    return message;
  }

  root.GPTPF_UTILS = Object.freeze({
    __v: EXTENSION_VERSION,
    getStorageData,
    setStorageData,
    sendRuntimeMessage,
    checkTelemetryEnabled,
    handleDebugLevel,
    processDebugMessage
  });
})();