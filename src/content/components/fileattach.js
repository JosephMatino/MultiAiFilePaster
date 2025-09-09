/*
 * ================================================================================
 * Multi-AI File Paster Chrome Extension | Production Release v1.1.0
 * ================================================================================
 *
 * MODULE: src/content/components/fileattach.js
 * FUNCTION: File creation and attachment component
 * ARCHITECTURE: File Processing Component with Format Detection
 *
 * DEVELOPMENT TEAM:
 * • Lead Developer: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • Scrum Master: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 *
 * ORGANIZATION: WekTurbo Designs - Hostwek LTD | https://hostwek.com/wekturbo
 * REPOSITORY: https://github.com/JosephMatino/MultiAiFilePaster
 * TECHNICAL SUPPORT: wekturbo@hostwek.com
 *
 * PLATFORM INTEGRATIONS: File creation, format detection, attachment processing
 * CORE DEPENDENCIES: Language detector, file system APIs, DOM manipulation
 *
 * Copyright (c) 2025 WekTurbo Designs - Hostwek LTD. All rights reserved.
 * Licensed under MIT License | https://opensource.org/licenses/MIT
 * ================================================================================
 */

class FileAttachComponent {
  constructor() {
    this.fileCounter = 0;
  }

  nextName(ext) {
    this.fileCounter += 1;
    return `paste.${this.fileCounter}.${ext}`;
  }

  makeFile(content, fmt, customName = "") {
    try {
      if (fmt === 'auto' && window.LanguageDetector) {
        const detector = new window.LanguageDetector();
        fmt = detector.getFileExtension(String(content || ''), 'txt');
      }
    } catch(err) { void err; }

    let body = content, mime = "text/plain";
    if (fmt === "md") mime = "text/markdown";
    if (fmt === "json") {
      mime = "application/json";
      try {
        body = JSON.stringify({ content }, null, 2);
      } catch(err) { void err; }
    }
    let filename;
    if (customName) {
      const cleanName = window.GPTPF_VALIDATION?.sanitizeFileName(customName)?.sanitized || customName;
      const cleanFmt = fmt.replace(/^\.+/, '');
      filename = `${cleanName}.${cleanFmt}`;
    } else {
      filename = this.nextName(fmt);
    }

    const blob = new Blob([body], { type: mime });
    return new File([blob], filename, { type: mime, lastModified: Date.now() });
  }

  getPlusButton() {
    { const __host = window.location.hostname; const __claude = (window.GPTPF_CONFIG && window.GPTPF_CONFIG.PLATFORM_DOMAINS && window.GPTPF_CONFIG.PLATFORM_DOMAINS.claude) || []; if (__claude.some(d => __host.includes(d))) {
      return document.querySelector('input[type="file"]')?.closest('button')
          || document.querySelector('button[aria-label*="attach" i]')
          || document.querySelector('button[title*="attach" i]');
    }}

    { const __host = window.location.hostname; const __gemini = (window.GPTPF_CONFIG && window.GPTPF_CONFIG.PLATFORM_DOMAINS && window.GPTPF_CONFIG.PLATFORM_DOMAINS.gemini) || []; if (__gemini.some(d => __host.includes(d))) {
      return document.querySelector('button[aria-label*="attach" i]')
          || document.querySelector('button[aria-label*="upload" i]')
          || document.querySelector('button[data-test-id*="uploader"]')
          || document.querySelector('input[type="file"]')?.closest('button')
          || document.querySelector('button[title*="attach" i]');
    }}

    { const __host = window.location.hostname; const __deepseek = (window.GPTPF_CONFIG && window.GPTPF_CONFIG.PLATFORM_DOMAINS && window.GPTPF_CONFIG.PLATFORM_DOMAINS.deepseek) || []; if (__deepseek.some(d => __host.includes(d))) {
      return document.querySelector('button[aria-label*="attach" i]')
          || document.querySelector('button[aria-label*="upload" i]')
          || document.querySelector('input[type="file"]')?.closest('button')
          || document.querySelector('button[title*="file" i]');
    }}

    return document.querySelector('button[aria-label="Add photos & files"]')
        || document.querySelector('button[aria-label*="file" i]')
        || document.querySelector('button[aria-label*="attach" i]')
        || document.querySelector('button[aria-label*="upload" i]');
  }

  getFileInput() {
    const allInputs = Array.from(document.querySelectorAll('input[type="file"]'));
    return allInputs.find(el => !el.disabled && el.offsetParent !== null)
        || allInputs.find(el => !el.disabled)
        || null;
  }

  async ensureFileInput(wait = 2000) {
    let inp = this.getFileInput();
    if (inp) return inp;

    { const __host = window.location.hostname; const __gemini = (window.GPTPF_CONFIG && window.GPTPF_CONFIG.PLATFORM_DOMAINS && window.GPTPF_CONFIG.PLATFORM_DOMAINS.gemini) || []; if (__gemini.some(d => __host.includes(d))) {
      return await this.ensureGeminiFileInput(wait);
    }}

    const plus = this.getPlusButton();
    if (plus) plus.click();

    const t0 = performance.now();
    while(!inp && performance.now()-t0 < wait){
      await new Promise(r=>setTimeout(r,90));
      inp = this.getFileInput();
    }
    return inp;
  }

  async ensureGeminiFileInput(wait = 2000) {
    const attachBtn = document.querySelector('button[aria-label*="attach" i]')
                   || document.querySelector('button[aria-label*="upload" i]');
    if (attachBtn) {
      attachBtn.click();
      await new Promise(r => setTimeout(r, 150));
    }

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

    const uploadBtn = document.querySelector('button[data-test-id="local-image-file-uploader-button"]')
                    || Array.from(document.querySelectorAll('button'))
                         .find(b => /upload files/i.test(b.textContent || ''))
                    || null;

    let removeInterceptor = null;
    let observer = null;
    let resolveInput;
    const inputPromise = new Promise(res => { resolveInput = res; });

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

    function deepQSA(selector, root=document) {
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
    const pre = deepQSA('input[type="file"]').find(el => !el.disabled) || null;
    if (pre) { try { observer?.disconnect(); } catch(err) { void err; } resolveInput(pre); }

    let inp = null;
    const timeoutPromise = new Promise(res => setTimeout(() => res(null), Math.max(200, wait-50)));
    inp = await Promise.race([inputPromise, timeoutPromise]);

    if (removeInterceptor) { try { removeInterceptor(); } catch(err) { void err; } }
    return inp;
  }

  attachFileToInput(file, input) {
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    input.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  }
}

window.FileAttachComponent = FileAttachComponent;
