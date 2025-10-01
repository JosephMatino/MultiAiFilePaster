/*
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: src/content/platforms/chatgpt.js
 * FUNCTION: ChatGPT-specific platform integration and file attachment handling
 * ARCHITECTURE: Chrome Extension Manifest V3, modular event-driven design
 * SECURITY: Client-side processing, zero data transmission, privacy-first
 * PERFORMANCE: Optimized for Chrome V3 Manifest, lazy loading, efficient DOM
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
 * • PLATFORM INTEGRATIONS: ChatGPT-specific DOM handling and file attachment
 * • CORE DEPENDENCIES: Chrome Extension APIs, ChatGPT API interaction, DOM selectors
 * • FEATURES: Platform detection, file input discovery, attachment automation
 * • TESTING: Automated unit tests, integration tests, ChatGPT compatibility testing
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
class ChatGPTPlatform {
  constructor() {
    this.name = 'chatgpt';
  }
  isCurrentPlatform() {
    const host = window.location.hostname;
    const list = window.GPTPF_CONFIG?.PLATFORM_DOMAINS?.chatgpt ?? [];
    return list.some(d => host.includes(d));
  }
  getPlatformSettings(baseSettings) {
    const timeouts = window.GPTPF_CONFIG?.PLATFORM_TIMEOUTS ?? {};
    return {
      ...baseSettings,
      timeout: timeouts.chatgpt ?? timeouts.default ?? 2000
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
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG?.error('console_platform_handler_error', error);
      }
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
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG?.error('console_platform_handler_error', e);
      }
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