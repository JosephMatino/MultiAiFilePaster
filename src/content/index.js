/*
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: src/content/index.js
 * FUNCTION: Main content script coordinator for AI platform integration
 * ARCHITECTURE: Chrome Extension Manifest V3 with Factory Pattern
 * SECURITY: Client-side processing, zero data transmission, privacy-first
 * PERFORMANCE: Optimized content script, efficient DOM manipulation, lazy loading
 * COMPATIBILITY: Chrome 88+, Edge 88+, Opera 74+, cross-platform AI support
 * RELIABILITY: Quality error handling, graceful degradation, stable operation
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
 * • CORE DEPENDENCIES: Platform Factory, Language Detector, File Attachment System
 * • FEATURES: Multi-platform support, file compression, batch processing, analytics
 * • TESTING: Automated unit tests, integration tests, cross-platform validation
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
const PLATFORM_TIMEOUTS = window.GPTPF_CONFIG?.PLATFORM_TIMEOUTS;
let settings = window.GPTPF_CONFIG?.DEFAULTS;
let busy = false;
let lastHash = "";
let claudeProcessing = false;
let toastComponent = null;
let loaderComponent = null;
let modalComponent = null;
let fileAttachComponent = null;
let platformHandler = null;
function getCurrentPlatform() {
  return window.PlatformFactory.getCurrentPlatform();
}
function detectActualPlatform() {
  const url = window.location.href;
  if (url.includes('chatgpt') || url.includes('openai')) return 'chatgpt';
  if (url.includes('claude')) return 'claude';
  if (url.includes('gemini')) return 'gemini';
  if (url.includes('deepseek')) return 'deepseek';
  if (url.includes('grok')) return 'grok';
  return 'default';
}
function applyContentTheme(theme) {
  try {
    if (theme === 'default') {
      const actualPlatform = detectActualPlatform();
      if (actualPlatform !== 'default') {
        theme = actualPlatform;
      }
    }
    document.documentElement.setAttribute('data-platform', theme);
    window.GPTPF_DEBUG?.log('debug_content_theme_applied', [theme]);
  } catch (err) {
    window.GPTPF_DEBUG?.error('debug_content_theme_error', err);
  }
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
        const fileExt = file?.name?.split('.')?.pop();
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
            analytics.history.push({ timestamp, platform, format: fileExt, filename: file?.name });
            const limits = window.GPTPF_CONFIG?.ANALYTICS_LIMITS;
            if (analytics.history.length > (limits?.maxHistoryItems || 1000)) {
              analytics.history.sort((a, b) => b.timestamp - a.timestamp);
              analytics.history = analytics.history.slice(0, limits?.trimToItems || 500);
            }
            storage.set({ __analytics_data: analytics });
          } catch (err) {
            if (window.GPTPF_DEBUG) {
              window.GPTPF_DEBUG.error('console_platform_handler_error', err);
            }
          }
        });
      } catch (err) {
        if (window.GPTPF_DEBUG) {
          window.GPTPF_DEBUG.error('console_platform_handler_error', err);
        }
      }
    });
  } catch (err) {
    if (window.GPTPF_DEBUG) {
      window.GPTPF_DEBUG.error('console_platform_handler_error', err);
    }
  }
}
function getPlatformSettings() {
  return window.PlatformFactory.getPlatformSettings(settings);
}
function initializeComponents() {
  try {
    if (window.ToastComponent) toastComponent = new window.ToastComponent();
    if (window.LoaderComponent) loaderComponent = new window.LoaderComponent();
    if (window.RenameModal) modalComponent = new window.RenameModal();
    if (window.FileAttachComponent) fileAttachComponent = new window.FileAttachComponent();
    if (window.LanguageDetector && !window.GPTPF_LANGUAGE_DETECTOR) {
      try {
        window.GPTPF_LANGUAGE_DETECTOR = new window.LanguageDetector();
      } catch (err) {
        if (window.GPTPF_DEBUG) {
          window.GPTPF_DEBUG.error('console_language_detector_init_failed', err);
        }
        window.GPTPF_LANGUAGE_DETECTOR = null;
      }
    }
    if (window.PlatformFactory) {
      platformHandler = window.PlatformFactory.createPlatformHandler();
    }
    const platform = getCurrentPlatform();
    if (platform !== 'unknown') {
      document.documentElement.setAttribute('data-platform', platform);
    }
    if (window.GPTPF_DEBUG) {
      window.GPTPF_DEBUG.updateSettings();
    }
  } catch (error) {
    if (window.GPTPF_DEBUG) {
      window.GPTPF_DEBUG.error('console_component_init_error', error);
    }
  }
}
chrome.runtime.sendMessage({ type:"GET_SETTINGS" }, r => {
  if (r?.ok) {
    const merged = { ...settings, ...r.settings };
    if (typeof merged.autoAttachEnabled === 'undefined' && typeof merged.autoPasteEnabled !== 'undefined') {
      merged.autoAttachEnabled = !!merged.autoPasteEnabled;
    }
    settings = merged;
    const userTheme = settings.selectedTheme || 'default';
    applyContentTheme(userTheme);
  }
  initializeComponents();
});
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local") {
    for (const key in changes) {
      settings[key] = changes[key].newValue;
    }
    if (typeof changes.autoAttachEnabled === 'undefined' && typeof changes.autoPasteEnabled !== 'undefined') {
      settings.autoAttachEnabled = !!changes.autoPasteEnabled.newValue;
    }
    const reactiveKeys = [
      'claudeOverride', 'autoAttachEnabled', 'useDelay', 'delaySeconds',
      'fileFormat', 'batchMode', 'wordLimit', 'telemetryEnabled', 'debugMode'
    ];
    if (Object.keys(changes).some(key => reactiveKeys.includes(key))) {
      lastHash = "";
      claudeProcessing = false;
      busy = false;
    }
  }
});
function toast(text, ok=true, action){
  if (toastComponent) {
    toastComponent.show(text, ok, action);
  }
}
window.toast = toast;
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
  return Promise.reject(new Error(window.GPTPF_I18N?.getMessage('errors_modal_not_available')));
}
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
  if (isTA(el)) return el.value;
  if (isCE(el)) {
    try {
      return el.textContent || el.innerText || "";
    } catch(err) {
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG.error('console_platform_handler_error', err);
      }
      return "";
    }
  }
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
    if (window.GPTPF_DEBUG) {
      window.GPTPF_DEBUG.error('console_platform_handler_error', error);
    }
  }
}
let pendingRestore = null;
function captureCaret(el){
  try {
    if (isTA(el)) {
      return { type: 'ta', start: el.selectionStart, end: el.selectionEnd };
    }
    if (isCE(el)) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount) {
        const r = sel.getRangeAt(0).cloneRange();
        return { type: 'ce', range: r };
      }
    }
  } catch(err) {
    if (window.GPTPF_DEBUG) {
      window.GPTPF_DEBUG.error('console_platform_handler_error', err);
    }
  }
  return { type: 'none' };
}
function restorePaste(ctx){
  if (!ctx || !ctx.comp || !ctx.text) return;
  const el = ctx.comp;
  try {
    if (isTA(el)) {
      const v = el.value;
      const s = Math.max(0, Math.min(v.length, ctx.snapshot?.start));
      const e = Math.max(0, Math.min(v.length, ctx.snapshot?.end));
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
  } catch(err) {
    if (window.GPTPF_DEBUG) {
      window.GPTPF_DEBUG.error('console_platform_handler_error', err);
    }
  }
  try {
    if (isTA(el)) { el.value += ctx.text; el.dispatchEvent(new Event('input', { bubbles: true })); return; }
    if (isCE(el)) { el.appendChild(document.createTextNode(ctx.text)); el.dispatchEvent(new Event('input', { bubbles: true })); return; }
  } catch(err) {
    if (window.GPTPF_DEBUG) {
      window.GPTPF_DEBUG.error('console_platform_handler_error', err);
    }
  }
}
const clamp = window.GPTPF_VALIDATION.clamp;
const wc = window.GPTPF_VALIDATION.wc;
const hash = window.GPTPF_VALIDATION.hash;
function makeFile(content, fmt, customName=""){
  if (!content || typeof content !== 'string') {
    if (window.GPTPF_DEBUG) {
      window.GPTPF_DEBUG.error('makeFile_invalid_content', { content, type: typeof content });
    }
    throw new Error(window.GPTPF_I18N?.getMessage('errors_makefile_invalid_content'));
  }

  if (!fmt || typeof fmt !== 'string') {
    if (window.GPTPF_DEBUG) {
      window.GPTPF_DEBUG.warn('makeFile_invalid_format', { fmt });
    }
    fmt = 'txt';
  }

  if (fileAttachComponent) {
    try {
      const result = fileAttachComponent.makeFile(content, fmt, customName);
      if (!result || !(result instanceof File)) {
        throw new Error(window.GPTPF_I18N?.getMessage('errors_fileattach_invalid_result'));
      }
      return result;
    } catch (error) {
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG.error('fileAttachComponent_error', error);
      }
      throw error;
    }
  }

  try {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const filename = `paste.${Date.now()}.${fmt}`;
    return new File([blob], filename, { type: "text/plain;charset=utf-8" });
  } catch (error) {
    if (window.GPTPF_DEBUG) {
      window.GPTPF_DEBUG.error('blob_creation_error', error);
    }
    throw new Error(window.GPTPF_I18N?.getMessage('errors_file_creation_failed') + ': ' + error.message);
  }
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
async function processManualText(text, overrideExt){
  try{
    busy = true;
    const platformSettings = getPlatformSettings();
    let newName = '';
    try {
      newName = await renameModal();
    } catch {
      lastHash = "";
      hideLoader();
      const cancelMsg = window.GPTPF_I18N.getMessage('attachment_cancelled');
      toast(cancelMsg, false);
      throw new Error('cancelled');
    }
    const preparingMsg = window.GPTPF_I18N.getMessage('attachment_preparing');
    loader(preparingMsg);
    if (!text || typeof text !== 'string') {
      throw new Error(window.GPTPF_I18N?.getMessage('errors_invalid_content_type'));
    }
    if (text.length === 0) {
      throw new Error(window.GPTPF_I18N?.getMessage('errors_invalid_content_empty'));
    }
    const file = makeFile(text, (overrideExt || platformSettings.fileFormat), newName);
    if (platformHandler && platformHandler.attachFile) {
      if (platformSettings.useDelay && platformSettings.delaySeconds > 0) {
        await delayCountdown(platformSettings.delaySeconds * 1000);
      }
      const attachingMsg = window.GPTPF_I18N.getMessage('attachment_attaching');
      loader(attachingMsg);
      const success = await platformHandler.attachFile(file);
      if (success) {
        hideLoader();
        const successMsg = window.GPTPF_I18N.getMessage('attachment_success', [file.name]);
        toast(successMsg, true);
        lastHash = "";
        trackFileCreation(file, getCurrentPlatform());
      } else {
        throw new Error(window.GPTPF_I18N?.getMessage('errors_platform_attach_failed'));
      }
    } else {
      const platform = getCurrentPlatform();
      if (platform === 'claude') {
        const claudeMsg = window.GPTPF_I18N.getMessage('platform_specific_manual_drag_drop');
        toast(claudeMsg, false, () => {
          const again = document.querySelector('input[type="file"]');
          if (again) {
            const dt2 = new DataTransfer();
            dt2.items.add(file);
            again.files = dt2.files;
            again.dispatchEvent(new Event("change", { bubbles:true }));
            again.dispatchEvent(new Event("input", { bubbles:true }));
            hideLoader();
            const retrySuccessMsg = window.GPTPF_I18N.getMessage('attachment_success', [file.name]);
            toast(retrySuccessMsg, true);
            lastHash = "";
          } else {
            hideLoader();
            const manualDragMsg = window.GPTPF_I18N.getMessage('manual_drag_drop');
            toast(manualDragMsg, false);
            lastHash = "";
          }
        });
      }
    }
  } catch (error) {
    hideLoader();
    const errorMsg = error.message || window.GPTPF_I18N?.getMessage('errors_attachment_failed');
    toast(errorMsg, false);
    lastHash = "";
    throw error;
  } finally {
    busy = false;
  }
}
async function processText(text, overrideExt){
  try{
    busy = true;
    const platformSettings = getPlatformSettings();


    if (platformSettings.batchMode && window.GPTPF_BATCH) {
      const words = wc(text);
      const wordLimit = platformSettings.wordLimit;
      if (words >= wordLimit) {
        const parts = window.GPTPF_BATCH.splitContent(text, platformSettings.maxBatchFiles);
        if (parts.length > 1) {
          const batchDetectedMsg = window.GPTPF_I18N.getMessage('batch_detected', [parts.length.toString()]);
          toast(batchDetectedMsg, true);
          return await processBatchFiles(parts, platformSettings);
        }
      }
    }

    let newName = '';
    try {
      newName = await renameModal();
    } catch {
      if (pendingRestore) {
        try { restorePaste(pendingRestore); } catch(err) {
          if (window.GPTPF_DEBUG) {
            window.GPTPF_DEBUG.error('console_platform_handler_error', err);
          }
        }
        pendingRestore = null;
      }
      lastHash = "";
      hideLoader();
      const cancelMsg = window.GPTPF_I18N.getMessage('attachment_cancelled');
      toast(cancelMsg, false);
      throw new Error('cancelled');
    }
    const preparingMsg = window.GPTPF_I18N.getMessage('attachment_preparing');
    loader(preparingMsg);
    if (!text || typeof text !== 'string') {
      throw new Error(window.GPTPF_I18N?.getMessage('errors_invalid_content_type'));
    }

    if (text.length === 0) {
      throw new Error(window.GPTPF_I18N?.getMessage('errors_invalid_content_empty'));
    }


    const file = makeFile(text, (overrideExt || platformSettings.fileFormat), newName);
    if (platformHandler && platformHandler.attachFile) {
      if (platformSettings.useDelay && platformSettings.delaySeconds > 0) {
        await delayCountdown(platformSettings.delaySeconds * 1000);
      }
      const attachingMsg = window.GPTPF_I18N.getMessage('attachment_attaching');
      loader(attachingMsg);
      const success = await platformHandler.attachFile(file);
      if (success) {
        hideLoader();
        const successMsg = window.GPTPF_I18N.getMessage('attachment_success', [file.name]);
        toast(successMsg, true);
        lastHash = "";
        trackFileCreation(file, getCurrentPlatform());
      } else {
        throw new Error(window.GPTPF_I18N?.getMessage('errors_platform_attach_failed'));
      }
    } else {
      let input = await ensureFileInput(platformSettings.timeout);
      if (input){
        const uploadingMsg = window.GPTPF_I18N.getMessage('attachment_uploading');
        loader(uploadingMsg);
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
        const successMsg2 = window.GPTPF_I18N.getMessage('attachment_success', [file.name]);
        toast(successMsg2, true);
        lastHash = "";
        trackFileCreation(file, getCurrentPlatform());
      } else {
        hideLoader();
        let handled = false;
        const platform = getCurrentPlatform();
        const errorMsg = window.GPTPF_I18N.getMessage('no_file_input');
        const suggestion = window.GPTPF_I18N.getMessage('try_attachment_button');
        toast(`${errorMsg} ${suggestion}`, false, {
          label: window.GPTPF_I18N.getMessage('retry'),
          onClick: async ()=>{
            if (handled) return;
            handled = true;
            loader(window.GPTPF_I18N.getMessage('searching_for_file_input'));
            const again = await ensureFileInput(platformSettings.timeout + 1000);
            if (again){
              const dt2 = new DataTransfer();
              dt2.items.add(file);
              again.files = dt2.files;
              again.dispatchEvent(new Event("change", { bubbles:true }));
              again.dispatchEvent(new Event("input", { bubbles:true }));
              hideLoader();
              const retrySuccessMsg = window.GPTPF_I18N.getMessage('attachment_success', [file.name]);
              toast(retrySuccessMsg, true);
              lastHash = "";
            } else if (platform === 'gemini' && platformHandler && await platformHandler.tryDropAttach(file)) {
              hideLoader();
              const geminiSuccessMsg = window.GPTPF_I18N.getMessage('attachment_success', [file.name]);
              toast(geminiSuccessMsg, true);
              lastHash = "";
            } else {
              hideLoader();
              const manualDragMsg = window.GPTPF_I18N.getMessage('manual_drag_drop');
              toast(manualDragMsg, false);
              lastHash = "";
            }
          }
        });
      }
    }
  } catch (error) {
    hideLoader();
    const msg = (error && (error.message || String(error))) || '';
    if (msg === 'cancelled') {
      lastHash = "";
      throw error;
    }
    let errorMsg;
    if (msg.includes('Extension context invalidated')) {
      errorMsg = window.GPTPF_I18N.getMessage('extension_reloaded');
    } else if (msg.includes('Cannot read properties of undefined') && msg.includes('(reading \"get\")')) {
      errorMsg = window.GPTPF_I18N.getMessage('extension_context');
    } else if (msg.includes('file input')) {
      errorMsg = window.GPTPF_I18N.getMessage('no_file_input');
    } else if (msg.includes('network') || msg.includes('fetch')) {
      errorMsg = window.GPTPF_I18N.getMessage('network_error');
    } else if (msg.includes('permission')) {
      errorMsg = window.GPTPF_I18N.getMessage('permission_denied');
    } else {
      errorMsg = window.GPTPF_I18N.getMessage('attachment_failed');
    }
    toast(errorMsg, false);
    lastHash = "";
    throw error;
  } finally {
    busy = false;
    pendingRestore = null;
  }
}
async function processBatchFiles(parts, platformSettings) {
  try {
    const startMsg = window.GPTPF_I18N.getMessage('file_operations_batch_processing_start', [parts.length]);
    loader(startMsg);
    const processor = new window.GPTPF_BATCH.BatchProcessor();
    let processedCount = 0;
    processor.onProgress = (progress) => {
      const progressMsg = window.GPTPF_I18N.getMessage('file_operations_batch_processing',
        [progress.current, progress.total, progress.filename]);
      loader(progressMsg);
    };
    const batchDelay = platformSettings.useDelay
      ? (platformSettings.delaySeconds * 1000)
      : platformSettings.batchProcessingDelay;
    const result = await processor.processParts(parts, {
      maxFiles: platformSettings.maxBatchFiles,
      delay: batchDelay
    });
    if (!result.success) {
      throw new Error(result.error);
    }
    for (const processedPart of result.results) {
      const file = makeFile(
        processedPart.content,
        processedPart.extension,
        processedPart.filename
      );
      if (platformHandler && platformHandler.attachFile) {
        const attachingMsg = window.GPTPF_I18N.getMessage('file_operations_batch_attaching', [processedPart.filename]);
        loader(attachingMsg);
        const success = await platformHandler.attachFile(file);
        if (success) {
          processedCount++;
          trackFileCreation(file, getCurrentPlatform());
        }
      } else {
        const input = await ensureFileInput(platformSettings.timeout);
        if (input && fileAttachComponent) {
          const uploadingMsg = window.GPTPF_I18N.getMessage('file_operations_batch_uploading', [processedPart.filename]);
          loader(uploadingMsg);
          fileAttachComponent.attachFileToInput(file, input);
          processedCount++;
          trackFileCreation(file, getCurrentPlatform());
        }
      }
      if (processedCount < result.results.length) {
        await new Promise(resolve => setTimeout(resolve, batchDelay));
      }
    }
    hideLoader();
    const batchSuccessMsg = window.GPTPF_I18N.getMessage('file_operations_batch_success', [processedCount]);
    toast(batchSuccessMsg, true);
    lastHash = "";
  } catch (error) {
    hideLoader();
    const batchErrorMsg = window.GPTPF_I18N.getMessage('errors_batch_processing_failed', [error.message]);
    toast(batchErrorMsg, false);
    throw error;
  } finally {
    busy = false;
  }
}
function onPasteCapture(e){
  const comp = getComposer(); if (!comp) return;
  const platformSettings = getPlatformSettings();
  if (platformSettings.autoAttachEnabled === false) return;
  if (busy || claudeProcessing) return;
  const limits = window.GPTPF_CONFIG?.VALIDATION_LIMITS;
  const userMin = clamp(Number(platformSettings.wordLimit), limits.minWordLimit, limits.maxWordLimit);
  const text = (e.clipboardData || window.clipboardData)?.getData("text");
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
    } catch(err) {
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG.error('console_platform_handler_error', err);
      }
    }
  }
  if (platformSettings.useDelay){
    const limits = window.GPTPF_CONFIG?.VALIDATION_LIMITS;
    const ms = clamp(Number(platformSettings.delaySeconds), limits.minDelaySeconds, limits.maxDelaySeconds) * 1000;
    delayCountdown(ms)
      .then(()=> processText(text))
      .catch(()=> {
        lastHash = "";
        busy = false;
        const cancelMsg2 = window.GPTPF_I18N.getMessage('file_operations_attachment_cancelled');
        toast(cancelMsg2, false);
        if (pendingRestore){
          try { restorePaste(pendingRestore); } catch(err) {
            if (window.GPTPF_DEBUG) {
              window.GPTPF_DEBUG.error('console_platform_handler_error', err);
            }
          }
          pendingRestore = null;
        }
      });
  } else {
    processText(text).catch(()=>{});
  }
}
window.addEventListener("paste", onPasteCapture, true);
document.addEventListener("paste", onPasteCapture, true);
chrome.runtime.onMessage.addListener((m, _sender, sendResponse) => {
  if (m && m.type === 'SHOW_TOAST') {
    const level = m.level?.toLowerCase();
    const ok = (level === 'success' || level === 'info');
    try { toast(m.message, ok); } catch(err) {
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG.error('console_platform_handler_error', err);
      }
    }
    sendResponse && sendResponse({ ok: true });
    return true;
  }
  if (m && m.action === 'applyTheme') {
    applyContentTheme(m.theme);
    sendResponse && sendResponse({ ok: true });
    return true;
  }
  if (m && m.action === 'setLanguage') {
    if (window.GPTPF_I18N && m.language) {
      window.GPTPF_I18N.setLanguage(m.language);
      try {
        const evt = new CustomEvent('gptpf:translations-updated', { detail: { language: m.language } });
        document.dispatchEvent(evt);
      } catch(_) {}
    }
    sendResponse && sendResponse({ ok: true });
    return true;
  }
});
if (window.GPTPF_I18N) {
  window.GPTPF_I18N.initializeI18n();
}
chrome.runtime.onMessage.addListener((m, _sender, sendResponse) => {
  if (m?.type !== "GPTPF_SAVE_NOW") return;
  if (busy) {
    sendResponse && sendResponse({ ok:false, reason:"busy" });
    return true;
  }


  const platformSettings = getPlatformSettings();
  if (platformSettings.batchMode) {
    const batchModeActiveMsg = window.GPTPF_I18N.getMessage('ui_components_batch_manual_action_tip');
    toast(batchModeActiveMsg, false);
    sendResponse && sendResponse({ ok:false, reason:"batch_mode_active" });
    return true;
  }

  const comp = getComposer();
  if (!comp) {
    const noInputMsg = window.GPTPF_I18N.getMessage('errors_no_input_field');
    toast(noInputMsg, false);
    sendResponse && sendResponse({ ok:false, reason:"no_input" });
    return true;
  }
  const val = readComposerText(comp);
  if (!val || !val.trim()) {
    const noTextMsg = window.GPTPF_I18N.getMessage('errors_no_text_input');
    toast(noTextMsg, false);
    sendResponse && sendResponse({ ok:false, reason:"empty" });
    return true;
  }
  const words = wc(val);
  chrome.storage.local.get(['wordLimit'], (result) => {
    const minWords = result.wordLimit;
    if (words < minWords) {
      const tooShortMsg = window.GPTPF_I18N.getMessage('errors_text_too_short', [words, minWords]);
      toast(tooShortMsg, false);
      sendResponse && sendResponse({ ok:false, reason:"too_short" });
      return;
    }
    processManualText(val)
      .then(() => {
        clearComposer(comp);
        const manualSuccessMsg = window.GPTPF_I18N.getMessage('file_operations_manual_save_success');
        toast(manualSuccessMsg, true);
        sendResponse && sendResponse({ ok:true });
      })
      .catch(err => {
        if (err.message === 'cancelled') {
          sendResponse && sendResponse({ ok:false, reason:"cancelled" });
        } else {
          if (window.GPTPF_DEBUG) {
            window.GPTPF_DEBUG.error('console_manual_save_error', err);
          }
          sendResponse && sendResponse({ ok:false, reason:"error" });
        }
      });
  });
  return true;
});
window.addEventListener('beforeunload', () => {
  if (window.GPTPF_DEBUG) {
    window.GPTPF_DEBUG.info('content_cleanup', window.GPTPF_I18N.getMessage('content_cleanup_complete'));
  }
});
