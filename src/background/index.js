
/*
 * ================================================================================
 * Multi-AI File Paster Chrome Extension | Production Release v1.1.0
 * ================================================================================
 *
 * MODULE: src/background/index.js
 * FUNCTION: Chrome Extension Manifest V3 service worker for global state management
 * ARCHITECTURE: Background Service Worker with Chrome Extension APIs
 *
 * DEVELOPMENT TEAM:
 * • Lead Developer: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • Scrum Master: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 *
 * ORGANIZATION: WekTurbo Designs - Hostwek LTD | https://hostwek.com/wekturbo
 * REPOSITORY: https://github.com/JosephMatino/MultiAiFilePaster
 * TECHNICAL SUPPORT: wekturbo@hostwek.com
 *
 * PLATFORM INTEGRATIONS: Extension lifecycle, settings sync, keyboard shortcuts
 * CORE DEPENDENCIES: Chrome Extension APIs, Configuration System, Metrics
 *
 * Copyright (c) 2025 WekTurbo Designs - Hostwek LTD. All rights reserved.
 * Licensed under MIT License | https://opensource.org/licenses/MIT
 * ================================================================================
 */

try { importScripts('../shared/config.js'); } catch (err) { void err; }


const SCHEMA_VERSION = 2;
const EVENT_NAME_MAX_LENGTH = 32;
const DEFAULT_TELEMETRY_INTERVAL = 120000;

const DEFAULTS = {
  __schema: SCHEMA_VERSION,
  debugMode: false,
  showDebug: false,
  wordLimit: 500,
  autoAttachEnabled: true,
  useDelay: false,
  delaySeconds: 2,
  fileFormat: "auto",
  batchMode: false,
  telemetryEnabled: true,
  claudeOverride: true
};

function mergeDefaults(stored) { 
  const merged = { ...DEFAULTS, ...stored }; 
  if (!Number.isFinite(merged.__schema)) merged.__schema = SCHEMA_VERSION; 
  return merged; 
}
function migrateSettings(stored={}){
  const cur = { ...stored };
  const from = Number(cur.__schema || 1);
  if (from < 2) { if (!Number.isFinite(cur.delaySeconds)) cur.delaySeconds = 2; cur.__schema = 2; }
  if (typeof cur.autoAttachEnabled === 'undefined') {
    if (typeof cur.autoPasteEnabled !== 'undefined') cur.autoAttachEnabled = !!cur.autoPasteEnabled;
  }
  return mergeDefaults(cur);
}
function getSettings(cb){ chrome.storage.local.get(null, s => cb(migrateSettings(s))); }
function setSettings(patch = {}, cb) { 
  getSettings(current => { 
    const updated = mergeDefaults({ ...current, ...patch }); 
    chrome.storage.local.set(updated, () => cb && cb(updated)); 
  }); 
}


let CONFIG = null;
function resolveConfig(cb){
  if (CONFIG) return cb(CONFIG);
  if (self.GPTPF_CONFIG && self.GPTPF_CONFIG.getConfig) {
    self.GPTPF_CONFIG.getConfig(cfg => { CONFIG = cfg; cb(CONFIG); });
  } else { cb(null); }
}

const isSupportedAIPlatform = url => {
  if (self.GPTPF_CONFIG && self.GPTPF_CONFIG.isChatGPTUrl) {
    return self.GPTPF_CONFIG.isChatGPTUrl(url);
  }
  return (CONFIG?.HOSTS || []).some(host => url && url.startsWith(host));
};


function sendSaveNowToActiveChat(cb){
  chrome.tabs.query({ active:true, currentWindow:true }, (tabs) => {
    const t = tabs && tabs[0];
    if (!t?.id) {
      cb && cb({ ok: false, reason: 'no_tab' });
      return;
    }
    if (!isSupportedAIPlatform(t.url || "")) {
      cb && cb({ ok: false, reason: 'not_supported' });
      return;
    }

    chrome.tabs.sendMessage(t.id, { type:"GPTPF_SAVE_NOW" }, (resp) => {
      if (chrome.runtime.lastError) {
        cb && cb({ ok: false, reason: 'connection_failed' });
        return;
      }
      cb && cb(resp || { ok: false, reason: 'no_response' });
    });
  });
}
chrome.commands?.onCommand.addListener(cmd => { if (cmd === "save_current_message") sendSaveNowToActiveChat(() => {}); });


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
  chrome.storage.local.get([METRIC_SESSION_KEY], result => {
    let sessionId = result?.[METRIC_SESSION_KEY];
    if (!sessionId) {
      sessionId = generateSessionUuid();
      chrome.storage.local.set({ [METRIC_SESSION_KEY]: sessionId }, () => cb(sessionId));
    } else {
      cb(sessionId);
    }
  });
}
function enqueueMetric(event, data) {
  chrome.storage.local.get([METRIC_QUEUE_KEY], result => {
    const queue = Array.isArray(result?.[METRIC_QUEUE_KEY]) ? result[METRIC_QUEUE_KEY] : [];
    queue.push({ 
      e: String(event).slice(0, EVENT_NAME_MAX_LENGTH), 
      d: data || {}, 
      t: Date.now() 
    });
    chrome.storage.local.set({ [METRIC_QUEUE_KEY]: queue });
  });
}
function flushMetrics(){
  resolveConfig(cfg => {
    if (!cfg || !cfg.TELEMETRY_URL) return;
    chrome.storage.local.get([METRIC_QUEUE_KEY, "telemetryEnabled"], res => {
      const enabled = !!res?.telemetryEnabled; 
      const queue = Array.isArray(res?.[METRIC_QUEUE_KEY]) ? res[METRIC_QUEUE_KEY] : [];
      if (!enabled || queue.length === 0) return;
      getSessionId(sessionId => {
        const version = self.GPTPF_CONFIG?.VERSION || self.GPTPF_CONFIG?.__v || "unknown";
        const payload = { v: version, schema: DEFAULTS.__schema, session: sessionId, ts: Date.now(), events: queue.slice(0) };
        const method = (cfg.TELEMETRY_METHOD || 'POST');
        const headers = (cfg.TELEMETRY_HEADERS || { 'Content-Type': 'application/json' });
        const keepalive = !!cfg.TELEMETRY_KEEPALIVE;
        const opts = { method, headers, body: JSON.stringify(payload), keepalive };
        fetch(cfg.TELEMETRY_URL, opts)
          .then(()=> chrome.storage.local.set({ [METRIC_QUEUE_KEY]: [] }))
          .catch(()=>{});
      });
    });
  });
}
function setupAlarms() {
  resolveConfig(cfg => {
    if (!cfg) return;
    const minutes = Math.max(1, Math.round((cfg.TELEMETRY_INTERVAL || DEFAULT_TELEMETRY_INTERVAL) / 60000));
    chrome.alarms.clear("metrics_flush", () => {
      chrome.alarms.create("metrics_flush", { periodInMinutes: minutes });
    });
  });
}
chrome.alarms?.onAlarm.addListener(a=>{ if(a?.name === "metrics_flush") flushMetrics(); });


chrome.runtime.onInstalled.addListener((details) => { 
  resolveConfig(() => {});
  if (details.reason === "install") {
    chrome.storage.local.set(DEFAULTS, setupAlarms);
  } else if (details.reason === "update") {
    getSettings(migrated => chrome.storage.local.set(migrated, setupAlarms));
  }
});
chrome.runtime.onStartup?.addListener(() => { resolveConfig(()=>{}); setupAlarms(); });


chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
  if (!req || !req.type) return;

  if (req.type === "GET_SETTINGS") { getSettings(settings => sendResponse({ ok:true, settings })); return true; }
  if (req.type === "SET_SETTINGS") { setSettings(req.payload || {}, () => sendResponse({ ok:true })); return true; }
  if (req.type === "GET_DEBUG") { chrome.storage.local.get(["debugMode"], res => sendResponse({ ok:true, debugMode: !!res.debugMode })); return true; }

  if (req.type === "SAVE_CURRENT_MESSAGE") { sendSaveNowToActiveChat(resp => sendResponse(resp)); return true; }


  if (req.type === "IS_ACTIVE_AI_PLATFORM") {
    chrome.tabs.query({ active:true, currentWindow:true }, (tabs) => {
      const t = tabs && tabs[0];
      const ok = !!(t?.url && isSupportedAIPlatform(t.url));
      sendResponse({ ok:true, isChatGPT: ok });
    });
    return true;
  }


  if (req.type === "METRIC_EVENT") {
    chrome.storage.local.get(["telemetryEnabled"], r => {
      const enabled = !!r?.telemetryEnabled;
      resolveConfig(cfg => {
        if (!enabled || !cfg || !cfg.TELEMETRY_URL) return;

        const event = req.event || req.payload?.event;
        const data = req.data || req.payload?.data || {};
        if (!event) return;

        enqueueMetric(event, data);
        chrome.storage.local.get([METRIC_QUEUE_KEY], qres => {
          const queue = Array.isArray(qres?.[METRIC_QUEUE_KEY]) ? qres[METRIC_QUEUE_KEY] : [];
          const batchSize = cfg.TELEMETRY_BATCH_SIZE || 20;
          if (queue.length >= batchSize) flushMetrics();
        });
      });
    });
    return true;
  }
});
