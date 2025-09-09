/*
 * ================================================================================
 * Multi-AI File Paster Chrome Extension | Production Release v1.1.0
 * ================================================================================
 *
 * MODULE: src/content/platforms/gemini.js
 * FUNCTION: Gemini-specific platform integration and file attachment handling
 * ARCHITECTURE: Platform Handler with DOM Manipulation and File Processing
 *
 * DEVELOPMENT TEAM:
 * • Lead Developer: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • Scrum Master: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 *
 * ORGANIZATION: WekTurbo Designs - Hostwek LTD | https://hostwek.com/wekturbo
 * REPOSITORY: https://github.com/JosephMatino/MultiAiFilePaster
 * TECHNICAL SUPPORT: wekturbo@hostwek.com
 *
 * PLATFORM INTEGRATIONS: Google Gemini interface, file attachment system
 * CORE DEPENDENCIES: DOM manipulation, file processing, platform factory
 *
 * Copyright (c) 2025 WekTurbo Designs - Hostwek LTD. All rights reserved.
 * Licensed under MIT License | https://opensource.org/licenses/MIT
 * ================================================================================
 */

class GeminiPlatform {
  constructor() {
    this.name = 'gemini';
  }

  isCurrentPlatform() {
    const host = window.location.hostname;
    const list = (window.GPTPF_CONFIG && window.GPTPF_CONFIG.PLATFORM_DOMAINS && window.GPTPF_CONFIG.PLATFORM_DOMAINS.gemini) || [];
    return list.some(d => host.includes(d));
  }

  getPlatformSettings(baseSettings) {
    return {
      ...baseSettings,
      useDelay: false,
      delaySeconds: 0,
      timeout: 5000
    };
  }

  getComposer() {
    const a = document.activeElement;
    if (a && (this.isContentEditable(a) || this.isTextarea(a))) return a;

    return document.querySelector('div[contenteditable="true"]')
        || document.querySelector('textarea[aria-label*="prompt" i]')
        || document.querySelector('div[role="textbox"]')
        || null;
  }

  getAttachButton() {
    return document.querySelector('button[aria-label*="attach" i]')
        || document.querySelector('button[aria-label*="upload" i]')
        || document.querySelector('button[data-test-id*="uploader"]')
        || document.querySelector('input[type="file"]')?.closest('button')
        || document.querySelector('button[title*="attach" i]');
  }

  getFileInput() {
    const allInputs = Array.from(document.querySelectorAll('input[type="file"]'));
    return allInputs.find(el => !el.disabled && el.offsetParent !== null) 
        || allInputs.find(el => !el.disabled) 
        || null;
  }

  async ensureFileInput(wait = 5000) {
    let inp = this.getFileInput();
    if (inp) return inp;

    const attachBtn = this.getAttachButton();
    if (attachBtn) {
      attachBtn.click();
      await new Promise(r => setTimeout(r, 150));
    }
    const uploadBtn = document.querySelector('button[data-test-id="local-image-file-uploader-button"]')
                    || Array.from(document.querySelectorAll('button'))
                         .find(b => /upload files/i.test(b.textContent || ''))
                    || null;

    let removeInterceptor = null;
    let observer = null;
    let resolveInput;
    const inputPromise = new Promise(res => { resolveInput = res; });


    function interceptFileDialogOnce(){
      let done = false;
      function onClick(ev){
        try {
          const t = ev.target;
          const inp = (t && (t.matches?.('input[type="file"]') ? t : t.closest?.('input[type="file"]')));
          if (inp && !done) { ev.stopImmediatePropagation(); ev.preventDefault(); done = true; }
        } catch(err) { void err; }
      }
      document.addEventListener('click', onClick, true);
      return () => document.removeEventListener('click', onClick, true);
    }

    function startObserver(){
      try {
        observer = new MutationObserver(muts => {
          for (const m of muts) {
            for (const n of m.addedNodes) {
              try {
                if (n && n.querySelectorAll) {
                  const cand = n.querySelectorAll('input[type="file"]');
                  for (const el of cand) { 
                    if (!el.disabled) { 
                      resolveInput(el); 
                      observer?.disconnect(); 
                      return; 
                    } 
                  }
                }
                if (n && n.tagName === 'INPUT' && n.type === 'file' && !n.disabled) {
                  resolveInput(n); 
                  observer?.disconnect(); 
                  return;
                }
              } catch(err) { void err; }
            }
          }
        });
        observer.observe(document.documentElement || document.body, { childList:true, subtree:true });
      } catch(err) { void err; }
    }

    startObserver();

    if (uploadBtn) {
      removeInterceptor = interceptFileDialogOnce();
      uploadBtn.click();
    }


    const pre = this.deepQSA('input[type="file"]').find(el => !el.disabled) || null;
    if (pre) { try { observer?.disconnect(); } catch(err) { void err; } resolveInput(pre); }


    const timeoutPromise = new Promise(res => setTimeout(() => res(null), Math.max(200, wait-50)));
    inp = await Promise.race([inputPromise, timeoutPromise]);

    if (removeInterceptor) { try { removeInterceptor(); } catch(err) { void err; } }
    return inp;
  }


  deepQSA(selector, root=document) {
    const out = [];
    const stack = [root];
    const seen = new Set();
    while (stack.length) {
      const node = stack.pop();
      if (!node || seen.has(node)) continue;
      seen.add(node);
      try { node.querySelectorAll && node.querySelectorAll(selector).forEach(el => out.push(el)); } catch(err) { void err; }
      let allKids = [];
      try { allKids = node.querySelectorAll ? node.querySelectorAll('*') : []; } catch(err) { void err; }
      for (const el of allKids) { if (el && el.shadowRoot) stack.push(el.shadowRoot); }
      if (node instanceof ShadowRoot) {
        try { node.querySelectorAll('*').forEach(el => { if (el.shadowRoot) stack.push(el.shadowRoot); }); } catch(err) { void err; }
      }
    }
    return out;
  }


  async tryDropAttach(file) {
    try {
      const target = document.querySelector('div[contenteditable="true"]')
                   || document.querySelector('div[role="textbox"]')
                   || document.querySelector('textarea')
                   || document.body;
      if (!target) return false;


      try { document.dispatchEvent(new KeyboardEvent('keydown', { key:'Escape', bubbles:true })); } catch(err) { void err; }

      const dt = new DataTransfer(); dt.items.add(file);
      const rect = target.getBoundingClientRect();
      const cx = Math.max(10, Math.floor(rect.left + rect.width/2));
      const cy = Math.max(10, Math.floor(rect.top + rect.height/2));
      const opts = { bubbles:true, cancelable:true, composed:true, clientX:cx, clientY:cy, screenX:cx, screenY:cy, pageX:cx+window.scrollX, pageY:cy+window.scrollY };

      const dragEnter = new DragEvent('dragenter', opts);
      Object.defineProperty(dragEnter, 'dataTransfer', { value: dt });
      target.dispatchEvent(dragEnter);

      const dragOver = new DragEvent('dragover', opts);
      Object.defineProperty(dragOver, 'dataTransfer', { value: dt });
      target.dispatchEvent(dragOver);

      const drop = new DragEvent('drop', opts);
      Object.defineProperty(drop, 'dataTransfer', { value: dt });
      target.dispatchEvent(drop);

      await new Promise(r=>setTimeout(r, 500));

      const attached = !!(document.querySelector('[data-test-id*="attachment" i], [data-testid*="attachment" i], [aria-label*="remove" i]'));
      return attached;
    } catch(err) { void err; return false; }
  }


  async attachFile(file) {
    try {
      const input = await this.ensureFileInput(5000);
      if (input) {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
        input.dispatchEvent(new Event("input", { bubbles: true }));
        return true;
      } else {

        return await this.tryDropAttach(file);
      }
    } catch (error) {
      return false;
    }
  }

  isTextarea(el) {
    return el && el.tagName === "TEXTAREA";
  }

  isContentEditable(el) {
    return el && el.getAttribute && el.getAttribute("contenteditable") === "true";
  }

  shouldHandlePaste(e, text, settings) {
    return true;
  }

  async handlePostPaste(text) {
    return true;
  }
}

window.GeminiPlatform = GeminiPlatform;
