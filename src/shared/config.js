
/*
 * ================================================================================
 * Multi-AI File Paster Chrome Extension | Production Release v1.1.0
 * ================================================================================
 *
 * MODULE: src/shared/config.js
 * FUNCTION: Centralized configuration for all extension components
 * ARCHITECTURE: Global Configuration Object with Platform Mappings
 *
 * DEVELOPMENT TEAM:
 * • Lead Developer: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • Scrum Master: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 *
 * ORGANIZATION: WekTurbo Designs - Hostwek LTD | https://hostwek.com/wekturbo
 * REPOSITORY: https://github.com/JosephMatino/MultiAiFilePaster
 * TECHNICAL SUPPORT: wekturbo@hostwek.com
 *
 * PLATFORM INTEGRATIONS: Domain mappings, timeout configurations, official links
 * CORE DEPENDENCIES: None (standalone configuration module)
 *
 * Copyright (c) 2025 WekTurbo Designs - Hostwek LTD. All rights reserved.
 * Licensed under MIT License | https://opensource.org/licenses/MIT
 * ================================================================================
 */

(() => {
  const EXTENSION_VERSION = '1.1.0';

  const root = (typeof self !== 'undefined') ? self : window;
  if (root.GPTPF_CONFIG && root.GPTPF_CONFIG.__v === EXTENSION_VERSION) return;

  const DEFAULT_CONFIG = Object.freeze({
    __v: EXTENSION_VERSION,
    __schema: 2,
    VERSION: EXTENSION_VERSION,
    APP_NAME: 'Multi-AI File Paster',
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



    TELEMETRY_URL: null,
    TELEMETRY_METHOD: 'POST',
    TELEMETRY_HEADERS: { 'Content-Type': 'application/json' },
    TELEMETRY_BATCH_SIZE: 20,
    TELEMETRY_INTERVAL: 120000,
    TELEMETRY_KEEPALIVE: true
  });

  function isSupportedUrl(url) {
    return DEFAULT_CONFIG.HOSTS.some(h => url && url.startsWith(h));
  }

  function isChatGPTUrl(url) {
    return isSupportedUrl(url);
  }

  function getConfig(cb) {
    chrome.storage.local.get(['__config'], (res) => {
      const ovr = res.__config || {};
      const hosts = Array.isArray(ovr.HOSTS) ? ovr.HOSTS : DEFAULT_CONFIG.HOSTS;
      cb({ ...DEFAULT_CONFIG, ...ovr, HOSTS: hosts });
    });
  }

  function setConfig(patch, cb) {
    chrome.storage.local.get(['__config'], (res) => {
      const prev = res.__config || {};
      const next = { ...prev, ...patch };
      chrome.storage.local.set({ __config: next }, () => cb && cb(true));
    });
  }

  root.GPTPF_CONFIG = Object.freeze({
    ...DEFAULT_CONFIG,
    isSupportedUrl,
    isChatGPTUrl,
    getConfig,
    setConfig
  });
})();
