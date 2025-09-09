/*
 * ================================================================================
 * Multi-AI File Paster Chrome Extension | Production Release v1.1.0
 * ================================================================================
 *
 * MODULE: src/content/platforms/grok.js
 * FUNCTION: Grok-specific platform integration and file attachment handling
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
 * PLATFORM INTEGRATIONS: X.AI Grok interface, file attachment system
 * CORE DEPENDENCIES: DOM manipulation, file processing, platform factory
 *
 * Copyright (c) 2025 WekTurbo Designs - Hostwek LTD. All rights reserved.
 * Licensed under MIT License | https://opensource.org/licenses/MIT
 * ================================================================================
 */

class GrokPlatform {
  constructor() {
    this.name = 'grok';
  }

  isCurrentPlatform() {
    const host = window.location.hostname;
    const list = (window.GPTPF_CONFIG && window.GPTPF_CONFIG.PLATFORM_DOMAINS && window.GPTPF_CONFIG.PLATFORM_DOMAINS.grok) || [];
    return list.some(d => host.includes(d));
  }

  getPlatformSettings(baseSettings) {
    return {
      ...baseSettings,
      timeout: 4000
    };
  }

  getComposer() {
    const a = document.activeElement;
    if (a && (this.isContentEditable(a) || this.isTextarea(a))) return a;

    return document.querySelector('[contenteditable="true"][role="textbox"]')
        || document.querySelector('div[contenteditable="true"]')
        || document.querySelector('textarea')
        || null;
  }

  getAttachButton() {
    return document.querySelector('button[aria-label="Attach"]')
        || document.querySelector('button[title*="attach" i]')
        || null;
  }

  getFileInput() {
    const allInputs = Array.from(document.querySelectorAll('input[type="file"]'));
    return allInputs.find(el => !el.disabled && el.offsetParent !== null)
        || allInputs.find(el => !el.disabled)
        || null;
  }

  async ensureFileInput(wait = 4000) {
    let inp = this.getFileInput();
    if (inp) return inp;

    const btn = this.getAttachButton();
    if (btn) btn.click();

    const t0 = performance.now();
    while(!inp && performance.now()-t0 < wait){
      await new Promise(r=>setTimeout(r,90));
      inp = this.getFileInput();
    }
    return inp;
  }

  async attachFile(file) {
    try {
      const input = await this.ensureFileInput();
      if (!input) return false;

      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.dispatchEvent(new Event("input", { bubbles: true }));

      return true;
    } catch (error) {
      return false;
    }
  }

  isTextarea(el) { return el && el.tagName === 'TEXTAREA'; }
  isContentEditable(el) { return el && el.getAttribute && el.getAttribute('contenteditable') === 'true'; }

  shouldHandlePaste(e, text, settings) { return true; }
  async handlePostPaste(text) { return true; }
}

window.GrokPlatform = GrokPlatform;