/*
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: src/content/platforms/claude.js
 * FUNCTION: Claude-specific platform integration and file attachment handling
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
 * • PLATFORM INTEGRATIONS: Claude AI platform integration and automation
 * • CORE DEPENDENCIES: Chrome Extension APIs, FileReader API
 * • FEATURES: Claude-specific DOM handling, file attachment, state management
 * • TESTING: Automated unit tests, integration tests, cross-browser validation
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
 * Hostwek LTD through designated channels: scrum@majokdeng.com for business
 * partnership discussions, dev@josephmatino.com for technical licensing inquiries.
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
class ClaudePlatform {
  constructor() {
    this.name = 'claude';
    this.processing = false;
  }
  isCurrentPlatform() {
    const host = window.location.hostname;
    const list = window.GPTPF_CONFIG?.PLATFORM_DOMAINS?.claude;
    return list?.some(d => host.includes(d));
  }
  getPlatformSettings(baseSettings) {
    const timeouts = window.GPTPF_CONFIG?.PLATFORM_TIMEOUTS;
    return {
      ...baseSettings,
      timeout: timeouts.claude
    };
  }
  getComposer() {
    const a = document.activeElement;
    if (a && (this.isContentEditable(a) || this.isTextarea(a))) return a;
    return document.querySelector('div[contenteditable="true"].ProseMirror')
        || document.querySelector('div[contenteditable="true"]');
  }
  getAttachButton() {
    return document.querySelector('input[type="file"]')?.closest('button')
        || document.querySelector('button[aria-label*="attach" i]')
        || document.querySelector('button[title*="attach" i]');
  }
  getFileInput() {
    const allInputs = Array.from(document.querySelectorAll('input[type="file"]'));
    return allInputs.find(el => !el.disabled && el.offsetParent !== null)
        || allInputs.find(el => !el.disabled);
  }
  async ensureFileInput(wait) {
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

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG.error('claude_invalid_text', { text, type: typeof text });
      }
      return;
    }

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
              if (window.GPTPF_DEBUG) {
                window.GPTPF_DEBUG.info('claude_removing_pasted_element', window.GPTPF_I18N?.getMessage('debug_claude_replacing_pasted'));
              }
              removeBtn.click();
              setTimeout(async () => {
                try {
                  if (!text || text.trim().length === 0) {
                    throw new Error(window.GPTPF_I18N?.getMessage('errors_text_content_empty'));
                  }

                  const customName = await renameModal();
                  
                  if (window.GPTPF_DEBUG) {
                    window.GPTPF_DEBUG.info('claude_creating_file', {
                      contentLength: text.length,
                      format: settings.fileFormat,
                      customName: customName || window.GPTPF_I18N?.getMessage('default_auto_generated')
                    });
                  }

                  const file = makeFile(text, settings.fileFormat, customName);
                  
                  if (!file || !(file instanceof File)) {
                    throw new Error(window.GPTPF_I18N?.getMessage('errors_file_creation_failed'));
                  }

                  const input = await ensureFileInput();
                  if (input) {
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    input.files = dt.files;
                    input.dispatchEvent(new Event("change", { bubbles: true }));
                    
                    if (window.GPTPF_DEBUG) {
                      window.GPTPF_DEBUG.info('claude_file_attached', {
                        name: file.name,
                        size: file.size,
                        type: file.type
                      });
                    }

                    const successMsg = window.GPTPF_I18N.getMessage('attachment_success', [file.name]);
                    toast(successMsg, true);
                  } else {
                    throw new Error(window.GPTPF_I18N?.getMessage('errors_no_file_input'));
                  }
                } catch (err) {
                  if (window.GPTPF_DEBUG) {
                    window.GPTPF_DEBUG?.error('console_platform_handler_error', err);
                  }
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
