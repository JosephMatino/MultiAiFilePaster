/*
 * ================================================================================
 * Multi-AI File Paster Chrome Extension | Production Release v1.1.0
 * ================================================================================
 *
 * MODULE: src/content/platforms/chatgpt.js
 * FUNCTION: ChatGPT-specific platform integration and file attachment handling
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
 * PLATFORM INTEGRATIONS: OpenAI ChatGPT interface, file attachment system
 * CORE DEPENDENCIES: DOM manipulation, file processing, platform factory
 *
 * Copyright (c) 2025 WekTurbo Designs - Hostwek LTD. All rights reserved.
 * Licensed under MIT License | https://opensource.org/licenses/MIT
 * ================================================================================
 */

class ChatGPTPlatform {
  constructor() {
    this.name = 'chatgpt';
  }

  isCurrentPlatform() {
    const host = window.location.hostname;
    const list = (window.GPTPF_CONFIG && window.GPTPF_CONFIG.PLATFORM_DOMAINS && window.GPTPF_CONFIG.PLATFORM_DOMAINS.chatgpt) || [];
    return list.some(d => host.includes(d));
  }

  getPlatformSettings(baseSettings) {
    return {
      ...baseSettings,
      timeout: 2000
    };
  }

  getComposer() {
    const a = document.activeElement;
    if (a && (this.isContentEditable(a) || this.isTextarea(a))) return a;

    return document.querySelector('[contenteditable="true"][role="textbox"]')
        || document.querySelector('div[role="textbox"][contenteditable="true"]')
        || document.querySelector("textarea")
        || null;
  }

  getAttachButton() {
    return document.querySelector('button[data-testid="composer-plus-btn"]')
        || document.querySelector('button[aria-label="Add photos & files"]')
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
      const dropSuccess = await this.tryDropAttach(file);
      if (dropSuccess) {
        await this.waitForUploadComplete(file.name, 10000);
        return true;
      }

      const input = await this.ensureFileInput(3000);
      if (!input) {
        return false;
      }

      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;

      input.dispatchEvent(new Event("change", { bubbles: true }));

      await this.waitForUploadComplete(file.name, 10000);
      return true;
    } catch (error) {
      return false;
    }
  }

  async waitForUploadComplete(filename, timeout = 10000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const fileAttachment = document.querySelector('[data-testid*="file"]')
                          || document.querySelector('.file-attachment')
                          || document.querySelector('[class*="attachment"]')
                          || document.querySelector('[class*="file-chip"]');

      if (fileAttachment) {
        const hasSpinner = fileAttachment.querySelector('[class*="spinner"]')
                        || fileAttachment.querySelector('[class*="loading"]')
                        || fileAttachment.querySelector('svg[class*="animate"]');

        if (!hasSpinner) {
          return true;
        }
      }

      await new Promise(r => setTimeout(r, 200));
    }

    return false;
  }

  async tryDropAttach(file) {
    try {
      const dt = new DataTransfer();
      dt.items.add(file);
      const data = dt;
      const target = document.querySelector('[contenteditable="true"][role="textbox"]')?.parentElement
                  || document.querySelector('form')
                  || document.querySelector('main')
                  || document.body;
      if (!target) return false;

      const mk = (type) => new DragEvent(type, { bubbles:true, cancelable:true, dataTransfer: data });
      target.dispatchEvent(mk('dragenter'));
      target.dispatchEvent(mk('dragover'));
      target.dispatchEvent(mk('drop'));

      await new Promise(r => setTimeout(r, 100));
      target.dispatchEvent(mk('dragleave'));
      const dragOverlay = document.querySelector('[class*="drag"]')
                       || document.querySelector('[class*="drop"]')
                       || document.querySelector('[data-testid*="drag"]');
      if (dragOverlay && dragOverlay.style) {
        dragOverlay.style.display = 'none';
        dragOverlay.remove();
      }

      return true;
    } catch (e) {
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

window.ChatGPTPlatform = ChatGPTPlatform;
