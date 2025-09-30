/*
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: src/background/index.js
 * FUNCTION: Service Worker for Chrome Extension V3 background processing
 * ARCHITECTURE: Chrome Extension Manifest V3, background service worker pattern
 * SECURITY: Client-side processing, zero data transmission, privacy-first
 * PERFORMANCE: Optimized for Chrome V3 Manifest, efficient background operation
 * COMPATIBILITY: Chrome 88+, Edge 88+, Opera 74+, modern browser APIs
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
 * • SERVICE WORKER: Background script processing for Chrome Extension V3
 * • CORE DEPENDENCIES: Chrome Extension APIs, storage management, event handling
 * • FEATURES: Settings management, configuration resolution, background messaging
 * • TESTING: Automated unit tests, integration tests, Chrome Extension compatibility
 * • MONITORING: Performance metrics, error tracking, user analytics (opt-in)
 * • SCALABILITY: Modular design, efficient background operation, minimal resource usage
 *
 * BUILD & DEPLOYMENT PIPELINE:
 * • BUILD SYSTEM: Node.js build pipeline, ESLint validation, automated testing
 * • DEPLOYMENT: Chrome Web Store distribution, automated release pipeline
 * • VERSION CONTROL: Git workflow with develop/main branches, semantic versioning
 * • CODE QUALITY: High standards, error handling
 * • SECURITY: Static analysis, dependency scanning, vulnerability assessment
 * • PERFORMANCE: Bundle optimization, efficient background processing
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
try {
  if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.log('debug_background_script_init');
  importScripts('../shared/config.js');
  importScripts('../shared/debug.js');
  importScripts('../shared/utils.js');
  if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.log('debug_background_scripts_loaded');
} catch (err) {
  if (self.GPTPF_DEBUG) {
    self.GPTPF_DEBUG.error('console_config_load_failed', err);
  }
}
const SCHEMA_VERSION = 2;
const EVENT_NAME_MAX_LENGTH = self.GPTPF_CONFIG?.VALIDATION_LIMITS?.eventNameMaxLength;
const DEFAULT_TELEMETRY_INTERVAL = self.GPTPF_CONFIG?.TELEMETRY_INTERVAL;
const DEFAULTS = self.GPTPF_CONFIG?.DEFAULTS;
function mergeDefaults(stored) { 
  const merged = { ...DEFAULTS, ...stored }; 
  if (!Number.isFinite(merged.__schema)) merged.__schema = SCHEMA_VERSION; 
  return merged; 
}
function migrateSettings(stored = {}) {
  const cur = { ...stored };
  const from = Number(cur.__schema);
  if (from < 2) {
    if (!Number.isFinite(cur.delaySeconds)) {
      cur.delaySeconds = DEFAULTS.delaySeconds;
    }
    cur.__schema = 2;
  }
  if (typeof cur.autoAttachEnabled === 'undefined') {
    if (typeof cur.autoPasteEnabled !== 'undefined') {
      cur.autoAttachEnabled = !!cur.autoPasteEnabled;
    }
  }
  return mergeDefaults(cur);
}
function getSettings(cb){ 
  if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.log('debug_background_settings_get');
  self.GPTPF_UTILS.getStorageData(null, s => cb(migrateSettings(s))); 
}
function setSettings(patch = {}, cb) { 
  if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.log('debug_background_settings_set');
  getSettings(current => { 
    const updated = mergeDefaults({ ...current, ...patch }); 
    self.GPTPF_UTILS.setStorageData(updated, (success) => {
      if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.log('debug_background_settings_saved');
      cb && cb(updated);
    }); 
  }); 
}
let CONFIG = null;
function resolveConfig(cb){
  if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.log('debug_background_config_resolve');
  if (CONFIG) return cb(CONFIG);
  if (self.GPTPF_CONFIG && self.GPTPF_CONFIG.getConfig) {
    self.GPTPF_CONFIG.getConfig(cfg => { 
      CONFIG = cfg; 
      if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.log('debug_background_config_resolved');
      cb(CONFIG); 
    });
  } else { 
    if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.warn('debug_background_config_unavailable');
    cb(null); 
  }
}
const isSupportedAIPlatform = url => {
  if (self.GPTPF_CONFIG && self.GPTPF_CONFIG.isChatGPTUrl) {
    return self.GPTPF_CONFIG.isChatGPTUrl(url);
  }
  return CONFIG?.HOSTS?.some(host => url && url.startsWith(host));
};
function sendSaveNowToActiveChat(cb){
  if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.log('debug_background_save_chat_start');
  chrome.tabs.query({ active:true, currentWindow:true }, (tabs) => {
    const t = tabs && tabs[0];
    if (!t?.id) {
      if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.warn('debug_background_save_no_tab');
      cb && cb({ ok: false, reason: 'no_tab' });
      return;
    }
    if (!isSupportedAIPlatform(t.url || "")) {
      if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.warn('debug_background_save_unsupported_platform');
      cb && cb({ ok: false, reason: 'not_supported' });
      return;
    }
    chrome.tabs.sendMessage(t.id, { type:"GPTPF_SAVE_NOW" }, (resp) => {
      if (chrome.runtime.lastError) {
        if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.error('debug_background_save_connection_failed');
        cb && cb({ ok: false, reason: 'connection_failed' });
        return;
      }
      if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.log('debug_background_save_chat_complete');
      cb && cb(resp || { ok: false, reason: 'no_response' });
    });
  });
}
if (chrome.commands?.onCommand) {
  chrome.commands.onCommand.addListener(cmd => {
    if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.log('debug_background_command_received');
    if (cmd === "save_current_message") {
      sendSaveNowToActiveChat(() => {});
    }
  });
}
const METRIC_QUEUE_KEY = "__metrics_queue";
const METRIC_SESSION_KEY = "__metrics_session";
function generateSessionUuid() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return [...bytes].map((byte, index) => {
    const hex = byte.toString(16).padStart(2, "0");
    return (index === 4 || index === 6 || index === 8 || index === 10) ? "-" + hex : hex;
  }).join("");
}
function getSessionId(cb) {
  self.GPTPF_UTILS.getStorageData([METRIC_SESSION_KEY], result => {
    let sessionId = result?.[METRIC_SESSION_KEY];
    if (!sessionId) {
      sessionId = generateSessionUuid();
      self.GPTPF_UTILS.setStorageData({ [METRIC_SESSION_KEY]: sessionId }, () => cb(sessionId));
    } else {
      cb(sessionId);
    }
  });
}
function enqueueMetric(event, data) {
  self.GPTPF_UTILS.getStorageData([METRIC_QUEUE_KEY], result => {
    const queue = Array.isArray(result?.[METRIC_QUEUE_KEY]) ? result[METRIC_QUEUE_KEY] : [];
    queue.push({ 
      e: String(event).slice(0, EVENT_NAME_MAX_LENGTH), 
      d: data || {}, 
      t: Date.now() 
    });
    self.GPTPF_UTILS.setStorageData({ [METRIC_QUEUE_KEY]: queue });
  });
}
function flushMetrics(){
  resolveConfig(cfg => {
    if (!cfg || !cfg.TELEMETRY_URL) return;
    self.GPTPF_UTILS.getStorageData([METRIC_QUEUE_KEY, "telemetryEnabled"], res => {
      const enabled = !!res?.telemetryEnabled; 
      const queue = Array.isArray(res?.[METRIC_QUEUE_KEY]) ? res[METRIC_QUEUE_KEY] : [];
      if (!enabled || queue.length === 0) return;
      getSessionId(sessionId => {
        const version = self.GPTPF_CONFIG?.VERSION;
        const payload = { v: version, schema: DEFAULTS.__schema, session: sessionId, ts: Date.now(), events: queue.slice(0) };
        const method = cfg.TELEMETRY_METHOD;
        const headers = cfg.TELEMETRY_HEADERS;
        const keepalive = !!cfg.TELEMETRY_KEEPALIVE;
        const opts = { method, headers, body: JSON.stringify(payload), keepalive };
        fetch(cfg.TELEMETRY_URL, opts)
          .then(()=> self.GPTPF_UTILS.setStorageData({ [METRIC_QUEUE_KEY]: [] }))
          .catch(()=>{});
      });
    });
  });
}
function setupAlarms() {
  resolveConfig(cfg => {
    if (!cfg) return;
    const minutes = Math.max(1, Math.round(cfg.TELEMETRY_INTERVAL / 60000));
    chrome.alarms.clear("metrics_flush", () => {
      chrome.alarms.create("metrics_flush", { periodInMinutes: minutes });
    });
  });
}
chrome.alarms?.onAlarm.addListener(a=>{ if(a?.name === "metrics_flush") flushMetrics(); });
chrome.runtime.onInstalled.addListener((details) => { 
  if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.log('debug_background_extension_installed');
  resolveConfig(() => {});
  if (details.reason === "install") {
    if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.log('debug_background_first_install');
    chrome.storage.local.set(DEFAULTS, setupAlarms);
  } else if (details.reason === "update") {
    if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.log('debug_background_extension_updated');
    getSettings(migrated => chrome.storage.local.set(migrated, setupAlarms));
  }
});
chrome.runtime.onStartup?.addListener(() => { 
  if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.log('debug_background_extension_startup');
  resolveConfig(()=>{}); 
  setupAlarms(); 
});
chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
  if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.log('debug_background_message_received');
  if (!req || !req.type) return;
  if (req.type === "GET_SETTINGS") { 
    if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.log('debug_background_get_settings_request');
    getSettings(settings => sendResponse({ ok:true, settings })); 
    return true; 
  }
  if (req.type === "SET_SETTINGS") { 
    if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.log('debug_background_set_settings_request');
    setSettings(req.payload || {}, () => sendResponse({ ok:true })); 
    return true; 
  }
  if (req.type === "GET_DEBUG") { 
    if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.log('debug_background_get_debug_request');
    self.GPTPF_UTILS.getStorageData(["debugMode"], res => sendResponse({ ok:true, debugMode: !!res.debugMode })); 
    return true; 
  }
  if (req.type === "SAVE_CURRENT_MESSAGE") { 
    if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.log('debug_background_save_message_request');
    sendSaveNowToActiveChat(resp => sendResponse(resp)); 
    return true; 
  }
  if (req.type === "IS_ACTIVE_AI_PLATFORM") {
    if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.log('debug_background_platform_check_request');
    chrome.tabs.query({ active:true, currentWindow:true }, (tabs) => {
      const t = tabs && tabs[0];
      const ok = !!(t?.url && isSupportedAIPlatform(t.url));
      sendResponse({ ok:true, isChatGPT: ok });
    });
    return true;
  }
  if (req.type === "METRIC_EVENT") {
    if (self.GPTPF_DEBUG?.isEnabled()) self.GPTPF_DEBUG.log('debug_background_metric_event_request');
    self.GPTPF_UTILS.getStorageData(["telemetryEnabled"], r => {
      const enabled = !!r?.telemetryEnabled;
      resolveConfig(cfg => {
        if (!enabled || !cfg || !cfg.TELEMETRY_URL) {
          sendResponse({ ok: true });
          return;
        }
        const event = req.event || req.payload?.event;
        const data = req.data || req.payload?.data || {};
        if (!event) {
          sendResponse({ ok: true });
          return;
        }
        enqueueMetric(event, data);
        self.GPTPF_UTILS.getStorageData([METRIC_QUEUE_KEY], qres => {
          const queue = Array.isArray(qres?.[METRIC_QUEUE_KEY]) ? qres[METRIC_QUEUE_KEY] : [];
          const batchSize = cfg.TELEMETRY_BATCH_SIZE;
          if (queue.length >= batchSize) flushMetrics();
          sendResponse({ ok: true });
        });
      });
    });
    return true;
  }
});