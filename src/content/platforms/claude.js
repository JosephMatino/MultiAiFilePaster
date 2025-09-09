/*
 * ================================================================================
 * Multi-AI File Paster Chrome Extension | Production Release v1.1.0
 * ================================================================================
 *
 * MODULE: src/content/platforms/claude.js
 * FUNCTION: Claude-specific platform integration and file attachment handling
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
 * PLATFORM INTEGRATIONS: Anthropic Claude interface, file attachment system
 * CORE DEPENDENCIES: DOM manipulation, file processing, platform factory
 *
 * Copyright (c) 2025 WekTurbo Designs - Hostwek LTD. All rights reserved.
 * Licensed under MIT License | https://opensource.org/licenses/MIT
 * ================================================================================
 */

class ClaudePlatform {
  constructor() {
    this.name = 'claude';
    this.processing = false;
  }

  isCurrentPlatform() {
    const host = window.location.hostname;
    const list = (window.GPTPF_CONFIG && window.GPTPF_CONFIG.PLATFORM_DOMAINS && window.GPTPF_CONFIG.PLATFORM_DOMAINS.claude) || [];
    return list.some(d => host.includes(d));
  }

  getPlatformSettings(baseSettings) {
    return {
      ...baseSettings,
      timeout: 3000
    };
  }

  getComposer() {
    const a = document.activeElement;
    if (a && (this.isContentEditable(a) || this.isTextarea(a))) return a;

    return document.querySelector('div[contenteditable="true"].ProseMirror')
        || document.querySelector('div[contenteditable="true"]')
        || null;
  }

  getAttachButton() {
    return document.querySelector('input[type="file"]')?.closest('button')
        || document.querySelector('button[aria-label*="attach" i]')
        || document.querySelector('button[title*="attach" i]');
  }

  getFileInput() {
    const allInputs = Array.from(document.querySelectorAll('input[type="file"]'));
    return allInputs.find(el => !el.disabled && el.offsetParent !== null)
        || allInputs.find(el => !el.disabled)
        || null;
  }

  async ensureFileInput(wait = 3000) {
    let inp = this.getFileInput();
    if (inp) return inp;

    const plus = this.getAttachButton();
    if (plus) plus.click();

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

  isTextarea(el) {
    return el && el.tagName === "TEXTAREA";
  }

  isContentEditable(el) {
    return el && el.getAttribute && el.getAttribute("contenteditable") === "true";
  }

  shouldHandlePaste(_e, _text, settings) {
    return settings.claudeOverride;
  }

  async handlePostPaste(text, dependencies) {
    const { makeFile, ensureFileInput, renameModal, toast, settings } = dependencies;
    if (this.processing) return;
    this.processing = true;
    
    let attempts = 0;
    const maxAttempts = 15;

    const findAndReplacePasted = () => {
      const pastedElements = document.querySelectorAll('*');
      
      for (const el of pastedElements) {
        if (el.textContent === 'pasted' || el.textContent === 'PASTED') {
          let container = el;
          for (let i = 0; i < 10; i++) {
            container = container.parentElement;
            if (!container) break;
            
            const buttons = container.querySelectorAll('button');
            if (buttons.length >= 2) {
              const removeBtn = buttons[buttons.length - 1];
              removeBtn.click();
              
              setTimeout(async () => {
                try {
                  const customName = await renameModal();
                  const file = makeFile(text, settings.fileFormat, customName);
                  const input = await ensureFileInput();
                  
                  if (input) {
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    input.files = dt.files;
                    input.dispatchEvent(new Event("change", { bubbles: true }));
                    toast(`Attached: ${file.name}`, true);
                  }
                } catch (err) {
                  void err;
                } finally {
                  this.processing = false;
                }
              }, 50);
              return true;
            }
          }
        }
      }
      return false;
    };
    
    const checkLoop = () => {
      if (findAndReplacePasted()) return;
      
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(checkLoop, 100);
      } else {
        this.processing = false;
      }
    };
    
    setTimeout(checkLoop, 300);
  }

  hash(s) {
    return s ? String(s.length)+":"+s.slice(0,32) : "";
  }
}

window.ClaudePlatform = ClaudePlatform;
