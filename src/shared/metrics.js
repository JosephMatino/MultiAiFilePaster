/*
 * ================================================================================
 * Multi-AI File Paster Chrome Extension | Production Release v1.1.0
 * ================================================================================
 *
 * MODULE: src/shared/metrics.js
 * FUNCTION: Privacy-safe analytics and usage metrics collection system
 * ARCHITECTURE: Opt-in Telemetry with Local Storage and Aggregation
 *
 * DEVELOPMENT TEAM:
 * • Lead Developer: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • Scrum Master: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 *
 * ORGANIZATION: WekTurbo Designs - Hostwek LTD | https://hostwek.com/wekturbo
 * REPOSITORY: https://github.com/JosephMatino/MultiAiFilePaster
 * TECHNICAL SUPPORT: wekturbo@hostwek.com
 *
 * PLATFORM INTEGRATIONS: Usage analytics, performance metrics, error tracking
 * CORE DEPENDENCIES: Chrome storage APIs, privacy-safe data collection
 *
 * Copyright (c) 2025 WekTurbo Designs - Hostwek LTD. All rights reserved.
 * Licensed under MIT License | https://opensource.org/licenses/MIT
 * ================================================================================
 */



(() => {
  const root = (typeof self !== 'undefined') ? self : window;
  if (root.GPTPF_METRICS && root.GPTPF_METRICS.__v === ((root.GPTPF_CONFIG && root.GPTPF_CONFIG.__v) || "unknown")) return;

  /**
   * Records an anonymous usage metric event
   * @param {string} event - Event name (max 32 chars, alphanumeric + underscore)
   * @param {Object} data - Optional event data (must be JSON serializable)
   */
  function record(event, data) {
    try {
      if (!('chrome' in root) || !chrome.runtime || !chrome.runtime.sendMessage) return;

      if (!event || typeof event !== 'string' || event.length === 0) return;

      const cleanEvent = root.GPTPF_VALIDATION?.sanitizeEventName(event) || String(event).slice(0, 32).replace(/[^a-zA-Z0-9_]/g, '_');
      
      chrome.runtime.sendMessage({ 
        type: 'METRIC_EVENT', 
        event: cleanEvent, 
        data: data || {} 
      }, () => {
        void (chrome.runtime && chrome.runtime.lastError);
      });
    } catch(err) {
      void err;
    }
  }
  root.GPTPF_METRICS = Object.freeze({ __v: (root.GPTPF_CONFIG && root.GPTPF_CONFIG.__v) || "unknown", record });
})();
