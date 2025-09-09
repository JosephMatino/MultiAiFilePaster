/*
 * ================================================================================
 * Multi-AI File Paster Chrome Extension | Production Release v1.1.0
 * ================================================================================
 *
 * MODULE: src/content/index.js
 * FUNCTION: Main content script coordinator for AI platform integration
 * ARCHITECTURE: Chrome Extension Manifest V3 with Factory Pattern
 *
 * DEVELOPMENT TEAM:
 * • Lead Developer: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • Scrum Master: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 *
 * ORGANIZATION: WekTurbo Designs - Hostwek LTD | https://hostwek.com/wekturbo
 * REPOSITORY: https://github.com/JosephMatino/MultiAiFilePaster
 * TECHNICAL SUPPORT: wekturbo@hostwek.com
 *
 * PLATFORM INTEGRATIONS: ChatGPT, Claude, Gemini, DeepSeek, Grok
 * CORE DEPENDENCIES: Platform Factory, Language Detector, File Attachment System
 *
 * Copyright (c) 2025 WekTurbo Designs - Hostwek LTD. All rights reserved.
 * Licensed under MIT License | https://opensource.org/licenses/MIT
 * ================================================================================
 */

/* ============================== STATE =================================== */
const PLATFORM_TIMEOUTS = (window.GPTPF_CONFIG && window.GPTPF_CONFIG.PLATFORM_TIMEOUTS) || {
  chatgpt: 2000,
  claude: 3000,
  deepseek: 3000,
  gemini: 5000,
  grok: 4000,
  default: 3000
};

let settings = { debugMode:false, wordLimit:500, autoAttachEnabled:true, useDelay:false, delaySeconds:2, fileFormat:"auto", claudeOverride:false };
let busy = false;
let lastHash = "";
let claudeProcessing = false;

let toastComponent = null;
let loaderComponent = null;
let modalComponent = null;
let fileAttachComponent = null;
let platformHandler = null;
function getCurrentPlatform() {
  if (window.PlatformFactory) {
    return window.PlatformFactory.getCurrentPlatform();
  }
  const map = (window.GPTPF_CONFIG && window.GPTPF_CONFIG.PLATFORM_DOMAINS) || {};
  const host = window.location.hostname;
  for (const name in map) {
    const list = map[name] || [];
    if (list.some(d => host.includes(d))) return name;
  }
  return 'unknown';
}


function trackFileCreation(file, platform) {
  try {
    const storage = (typeof chrome !== 'undefined' && chrome?.storage?.local) ? chrome.storage.local : null;
    if (!storage || typeof storage.get !== 'function' || typeof storage.set !== 'function') {

      return;
    }

    storage.get(['telemetryEnabled'], (result = {}) => {
      try {
        if (!result.telemetryEnabled) return;

        const fileExt = (file?.name?.split('.')?.pop()) || 'unknown';
        const timestamp = Date.now();

        storage.get(['__analytics_data'], (data = {}) => {
          try {
            const analytics = data.__analytics_data || {
              totalFiles: 0,
              platforms: {},
              formats: {},
              history: []
            };

            analytics.totalFiles = (analytics.totalFiles || 0) + 1;
            analytics.platforms[platform] = (analytics.platforms[platform] || 0) + 1;
            analytics.formats[fileExt] = (analytics.formats[fileExt] || 0) + 1;

            analytics.history.push({ timestamp, platform, format: fileExt, filename: file?.name || '' });
            if (analytics.history.length > 500) {
              analytics.history.sort((a, b) => b.timestamp - a.timestamp);
              analytics.history = analytics.history.slice(0, 300);
            }
            storage.set({ __analytics_data: analytics });
          } catch (err) {
            void err;
          }
        });
      } catch (err) {
        void err;
      }
    });
  } catch (err) {
    void err;
  }
}


function getPlatformSettings() {
  if (window.PlatformFactory) {
    return window.PlatformFactory.getPlatformSettings(settings);
  }
  const platform = getCurrentPlatform();
  const baseSettings = { ...settings };
  const timeout = PLATFORM_TIMEOUTS[platform] || PLATFORM_TIMEOUTS.default;
  const platformSettings = { ...baseSettings, timeout };
  
  if (platform === 'gemini') {
    platformSettings.useDelay = false;
    platformSettings.delaySeconds = 0;
  }
  
  return platformSettings;
}


function initializeComponents() {
  try {
    if (window.ToastComponent) toastComponent = new window.ToastComponent();
    if (window.LoaderComponent) loaderComponent = new window.LoaderComponent();
    if (window.RenameModal) modalComponent = new window.RenameModal();
    if (window.FileAttachComponent) fileAttachComponent = new window.FileAttachComponent();

    if (window.PlatformFactory) {
      platformHandler = window.PlatformFactory.createPlatformHandler();
    }
  } catch (error) {
  }
}

chrome.runtime.sendMessage({ type:"GET_SETTINGS" }, r => {
  if (r?.ok) {
    const merged = { ...settings, ...r.settings };
    if (typeof merged.autoAttachEnabled === 'undefined' && typeof merged.autoPasteEnabled !== 'undefined') {
      merged.autoAttachEnabled = !!merged.autoPasteEnabled;
    }
    settings = merged;
  }
  initializeComponents();
});
chrome.storage.onChanged.addListener((c,a)=>{
  if(a==="local"){
    for(const k in c){ settings[k]=c[k].newValue; }
    if (typeof c.autoAttachEnabled === 'undefined' && typeof c.autoPasteEnabled !== 'undefined') settings.autoAttachEnabled = !!c.autoPasteEnabled.newValue;

    const reactiveKeys = ['claudeOverride','autoAttachEnabled','useDelay','delaySeconds','fileFormat','batchMode','wordLimit','telemetryEnabled','debugMode'];
    if (Object.keys(c).some(k => reactiveKeys.includes(k))) {
      lastHash = "";
      claudeProcessing = false;
      busy = false;


    }
  }
});

/* ============================== UI ====================================== */
function toast(text, ok=true, action){
  if (toastComponent) {
    toastComponent.show(text, ok, action);
  }
}


function loader(text){
  if (loaderComponent) {
    loaderComponent.show(text);
  }
}
function hideLoader(){
  if (loaderComponent) {
    loaderComponent.hide();
  }
}


function delayCountdown(ms){
  if (loaderComponent) {
    return loaderComponent.delayCountdown(ms);
  }
  return Promise.resolve();
}


function renameModal(){
  if (modalComponent) {
    return modalComponent.show();
  }
  return Promise.reject(new Error('Modal component not available'));
}

/* ============================== DOM HELPERS ============================== */
const isTA = el => el && el.tagName === "TEXTAREA";
const isCE = el => el && el.getAttribute && el.getAttribute("contenteditable") === "true";

function getComposer(){
  if (platformHandler && platformHandler.getComposer) {
    return platformHandler.getComposer();
  }
  const a = document.activeElement; if (a && (isCE(a)||isTA(a))) return a;

  const __p = getCurrentPlatform();
  if (__p === 'claude') {
    return document.querySelector('div[contenteditable="true"].ProseMirror')
        || document.querySelector('div[contenteditable="true"]') || null;
  }
  if (__p === 'gemini') {
    return document.querySelector('div[contenteditable="true"]')
        || document.querySelector('textarea[aria-label*="prompt" i]')
        || document.querySelector('div[role="textbox"]') || null;
  }
  if (__p === 'deepseek') {
    return document.querySelector('textarea[placeholder*="message" i]')
        || document.querySelector('div[contenteditable="true"]')
        || document.querySelector('textarea') || null;
  }
  return document.querySelector('[contenteditable="true"][role="textbox"]')
      || document.querySelector('div[role="textbox"][contenteditable="true"]')
      || document.querySelector("textarea") || null;
}

function readComposerText(el){
  if (!el) return "";
  if (isTA(el)) return el.value || "";
  if (isCE(el)) return el.innerText || el.textContent || "";
  return "";
}

function clearComposer(el){
  if (!el) return;
  try {
    if (isTA(el)) {
      el.value = "";
      el.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (isCE(el)) {
      el.innerHTML = "";
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  } catch (error) {
    void error;
  }
}


let pendingRestore = null;
function captureCaret(el){
  try {
    if (isTA(el)) {
      return { type: 'ta', start: el.selectionStart ?? (el.value ? el.value.length : 0), end: el.selectionEnd ?? (el.value ? el.value.length : 0) };
    }
    if (isCE(el)) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount) {
        const r = sel.getRangeAt(0).cloneRange();
        return { type: 'ce', range: r };
      }
    }
  } catch(err) { void err; }
  return { type: 'none' };
}

function restorePaste(ctx){
  if (!ctx || !ctx.comp || !ctx.text) return;
  const el = ctx.comp;
  try {
    if (isTA(el)) {
      const v = el.value || '';
      const s = Math.max(0, Math.min(v.length, ctx.snapshot?.start ?? v.length));
      const e = Math.max(0, Math.min(v.length, ctx.snapshot?.end ?? s));
      el.value = v.slice(0, s) + ctx.text + v.slice(e);
      const pos = s + ctx.text.length;
      el.selectionStart = el.selectionEnd = pos;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }
    if (isCE(el)) {
      let r = ctx.snapshot?.range;
      if (!r || !el.contains(r.startContainer)) {
        r = document.createRange();
        r.selectNodeContents(el);
        r.collapse(false);
      }
      r.deleteContents();
      r.insertNode(document.createTextNode(ctx.text));
      r.collapse(false);
      const sel = window.getSelection();
      if (sel) { sel.removeAllRanges(); sel.addRange(r); }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }
  } catch(err) { void err; }

  try {
    if (isTA(el)) { el.value += ctx.text; el.dispatchEvent(new Event('input', { bubbles: true })); return; }
    if (isCE(el)) { el.appendChild(document.createTextNode(ctx.text)); el.dispatchEvent(new Event('input', { bubbles: true })); return; }
  } catch(err) { void err; }
}

/* ============================== FILE + UPLOAD ============================ */
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const wc    = s => (s?.trim().match(/\b\w+\b/g) || []).length;
const hash  = s => s ? String(s.length)+":"+s.slice(0,32) : "";


function makeFile(content, fmt, customName=""){
  if (fileAttachComponent) {
    return fileAttachComponent.makeFile(content, fmt, customName);
  }

  const blob = new Blob([content], { type: "text/plain" });
  return new File([blob], `paste.${Date.now()}.${fmt}`, { type: "text/plain" });
}


const plusBtn = () => {
  if (fileAttachComponent) {
    return fileAttachComponent.getPlusButton();
  }
  return null;
};
const fileInput = () => {
  if (fileAttachComponent) {
    return fileAttachComponent.getFileInput();
  }
  return null;
};


async function ensureFileInput(wait=2000){
  if (fileAttachComponent) {
    return await fileAttachComponent.ensureFileInput(wait);
  }
  return null;
}

async function processText(text, overrideExt){
  try{
    busy = true;
    const platformSettings = getPlatformSettings();

    let newName = '';
    try {
      newName = await renameModal();
    } catch {

      if (pendingRestore) { try { restorePaste(pendingRestore); } catch(err) { void err; } pendingRestore = null; }
      lastHash = "";
      hideLoader();
      toast('Attachment cancelled.', false);
      return;
    }
    loader("Preparing file…");
    const file = makeFile(text, (overrideExt || platformSettings.fileFormat), newName);


    if (platformHandler && platformHandler.attachFile) {
      if (platformSettings.useDelay && platformSettings.delaySeconds > 0) {
        await delayCountdown(platformSettings.delaySeconds * 1000);
      }

      loader("Attaching file…");
      const success = await platformHandler.attachFile(file);

      if (success) {
        hideLoader();
        toast(`Successfully attached: ${file.name}`, true);
        lastHash = "";


        trackFileCreation(file, getCurrentPlatform());
      } else {
        throw new Error('Platform handler failed to attach file');
      }
    } else {

      let input = await ensureFileInput(platformSettings.timeout);
      if (input){
        loader("Uploading file…");
        if (fileAttachComponent) {
          fileAttachComponent.attachFileToInput(file, input);
        } else {
          const dt = new DataTransfer();
          dt.items.add(file);
          input.files = dt.files;
          input.dispatchEvent(new Event("change", { bubbles:true }));
          input.dispatchEvent(new Event("input", { bubbles:true }));
        }
        hideLoader();
        toast(`Successfully attached: ${file.name}`, true);
        lastHash = "";


        trackFileCreation(file, getCurrentPlatform());
      } else {
        hideLoader();
        let handled = false;
        const platform = getCurrentPlatform();
        let errorMsg = "Cannot find file upload area.";
        let suggestion = "";

        if (platform === 'gemini') {
          errorMsg = "Cannot find Gemini file input.";
          suggestion = "Try clicking the paperclip icon first, then retry.";
        } else if (platform === 'chatgpt') {
          errorMsg = "Cannot find ChatGPT file input.";
          suggestion = "Try clicking the attachment button first, then retry.";
        } else if (platform === 'claude') {
          errorMsg = "Cannot find Claude file input.";
          suggestion = "Try clicking the attachment icon first, then retry.";
        } else {
          suggestion = "Try clicking the attachment button on the platform first, then retry.";
        }

        toast(`${errorMsg} ${suggestion}`, false, {
          label: "Retry",
          onClick: async ()=>{
            if (handled) return;
            handled = true;
            loader("Searching for file input...");

            const again = await ensureFileInput(platformSettings.timeout + 1000);

            if (again){
              const dt2 = new DataTransfer();
              dt2.items.add(file);
              again.files = dt2.files;
              again.dispatchEvent(new Event("change", { bubbles:true }));
              again.dispatchEvent(new Event("input", { bubbles:true }));
              hideLoader();
              toast(`Successfully attached: ${file.name}`, true);
              lastHash = "";
            } else if (platform === 'gemini' && platformHandler && await platformHandler.tryDropAttach(file)) {
              hideLoader();
              toast(`Successfully attached: ${file.name}`, true);
              lastHash = "";
            } else {
              hideLoader();
              toast(`Still cannot find file input. Please attach the file manually by dragging it to the chat.`, false);
              lastHash = "";
            }
          }
        });
      }
    }
  } catch (error) {
    hideLoader();
    const msg = (error && (error.message || String(error))) || '';
    if (msg.includes('Extension context invalidated')) {
      toast('Extension was reloaded. Please refresh the page and try again.', false);
    } else if (msg.includes('Cannot read properties of undefined') && msg.includes('(reading \"get\")')) {
      toast('Extension context issue. Please refresh the page and try again.', false);
    } else if (msg.includes('file input')) {
      toast('Cannot find file upload area. Try clicking the attachment button on the platform first.', false);
    } else if (msg.includes('network') || msg.includes('fetch')) {
      toast('Network error. Check your internet connection and try again.', false);
    } else if (msg.includes('permission')) {
      toast('Permission denied. Please refresh the page and try again.', false);
    } else {
      toast('File attachment failed. Please refresh the page and try again.', false);
    }
    lastHash = "";
    throw error;
  } finally {
    busy = false;
    pendingRestore = null;
  }
}

/* ============================== PASTE & SAVE ============================= */


function onPasteCapture(e){
  const comp = getComposer(); if (!comp) return;

  const platformSettings = getPlatformSettings();
  if (platformSettings.autoAttachEnabled === false) return;
  if (busy || claudeProcessing) return;

  const userMin = clamp(Number(platformSettings.wordLimit || 500), 50, 15000);
  const text = (e.clipboardData || window['clipboardData'])?.getData("text") || "";
  const words = wc(text); if (words < userMin) return;

  const h = hash(text);
  if (h === lastHash) return;
  if (platformHandler && platformHandler.shouldHandlePaste) {
    if (!platformHandler.shouldHandlePaste(e, text, platformSettings)) {
      return;
    }
  } else {

    const isOnClaude = (getCurrentPlatform() === 'claude');
    if (isOnClaude && !platformSettings.claudeOverride) {
      return;
    }
  }


  lastHash = h;
  busy = true;
  const snapshot = captureCaret(comp);
  pendingRestore = { comp, snapshot, text };


  e.preventDefault();
  const currentPlatform = getCurrentPlatform();
  if (currentPlatform === 'claude') {
    try {
      e.stopImmediatePropagation();
      e.stopPropagation();
    } catch(err) { void err; }
  }


  if (platformSettings.batchMode) {
    const chunks = [];
    const regex = /```([a-zA-Z0-9+#._-]*)\n([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const lang = (match[1] || '').trim().toLowerCase();
      const code = match[2] || '';
      if (code.trim()) {
        chunks.push({ lang, code: code.trim() });
      }
    }
    if (chunks.length > 0) {
      toast(`Processing ${chunks.length} code blocks...`, true);

      (async () => {
        for (let i = 0; i < chunks.length; i++) {
          const { lang, code } = chunks[i];
          const detector = window.LanguageDetector ? new window.LanguageDetector() : null;
          let ext = platformSettings.fileFormat === 'auto' && detector ? detector.getFileExtension(code, 'txt') : (platformSettings.fileFormat || 'txt');

          if (lang) {
            const map = { js:'js', javascript:'js', ts:'ts', typescript:'ts', py:'py', python:'py', html:'html', css:'css', php:'php', json:'json', xml:'xml', sql:'sql', csv:'csv' };
            ext = map[lang] || ext;
          }
          loader(`Attaching file ${i + 1} of ${chunks.length}...`);
          await processText(code, ext);
          await new Promise(r => setTimeout(r, 500));
        }
        hideLoader();
        toast(`Successfully attached ${chunks.length} files!`, true);
      })().catch(() => {
        hideLoader();
        toast('Batch processing failed', false);
      });
      return;
    }
  }

  if (platformSettings.useDelay){
    const ms = clamp(Number(platformSettings.delaySeconds || 2), 1, 15) * 1000;
    delayCountdown(ms)
      .then(()=> processText(text))
      .catch(()=> {
        lastHash = "";
        busy = false;
        toast('Attachment cancelled.', false);
        if (pendingRestore){ try { restorePaste(pendingRestore); } catch(err) { void err; } pendingRestore = null; }
      });
  } else {
    processText(text);
  }
}

window.addEventListener("paste", onPasteCapture, true);
document.addEventListener("paste", onPasteCapture, true);


chrome.runtime.onMessage.addListener((m, _sender, sendResponse) => {
  if (m && m.type === 'SHOW_TOAST') {
    const level = (m.level || 'info').toLowerCase();
    const ok = (level === 'success' || level === 'info');
    try { toast(m.message || '', ok); } catch(err) { void err; }
    sendResponse && sendResponse({ ok: true });
    return true;
  }
});

chrome.runtime.onMessage.addListener((m, _sender, sendResponse) => {
  if (m?.type !== "GPTPF_SAVE_NOW") return;

  if (busy) {
    sendResponse && sendResponse({ ok:false, reason:"busy" });
    return true;
  }

  const comp = getComposer();
  if (!comp) {
    toast("Cannot find chat input field. Make sure you're on a supported AI platform.", false);
    sendResponse && sendResponse({ ok:false, reason:"no_input" });
    return true;
  }

  const val = readComposerText(comp);
  if (!val || !val.trim()) {
    toast("No text found in chat input. Type your message first.", false);
    sendResponse && sendResponse({ ok:false, reason:"empty" });
    return true;
  }

  const words = wc(val);

  if (words < 5) {
    toast(`Text too short (${words} words). Manual save requires at least 5 words.`, false);
    sendResponse && sendResponse({ ok:false, reason:"too_short" });
    return true;
  }

  processText(val)
    .then(() => {
      clearComposer(comp);
      sendResponse && sendResponse({ ok:true });
    })
    .catch((error) => {
      const errorMsg = error?.message || 'Unknown error';
      if (errorMsg.includes('Extension context invalidated')) {
        sendResponse && sendResponse({ ok:false, reason:"context_invalidated" });
      } else if (errorMsg.includes('file input')) {
        sendResponse && sendResponse({ ok:false, reason:"no_file_input" });
      } else {
        sendResponse && sendResponse({ ok:false, reason:"failed" });
      }
    });
  return true;
});
