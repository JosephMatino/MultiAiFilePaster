/*
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: src/content/platforms/gemini.js
 * FUNCTION: Gemini-specific platform integration and file attachment handling
 * ARCHITECTURE: Chrome Extension Manifest V3, modular event-driven design
 * SECURITY: Client-side processing, zero data transmission, privacy-first
 * PERFORMANCE: Optimized for Chrome V3 Manifest, lazy loading, efficient DOM
 * COMPATIBILITY: Chrome 88+, Edge 88+, Opera 74+, modern browser APIs
 * RELIABILITY: Production error handling, graceful degradation, stable operation
 *
 * DEVELOPMENT TEAM & PROJECT LEADERSHIP:
 * • LEAD DEVELOPER: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • SCRUM MASTER & PROJECT FUNDING: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 * • QUALITY ASSURANCE: Automated testing pipeline with CircleCI integration
 * • PROJECT MANAGEMENT: Agile methodology, continuous integration/deployment
 * • CODE REVIEW: Peer review process, automated quality gates, security audits
 * • DOCUMENTATION: Technical writers, API documentation, user experience guides
 *
 * ORGANIZATION & GOVERNANCE:
 * • COMPANY: HOSTWEK LTD - Premium Hosting Company | East Africa | https://hostwek.com
 * • DIVISION: WekTurbo Designs - Web Development Division | https://hostwek.com/wekturbo
 * • REPOSITORY: https://github.com/JosephMatino/MultiAiFilePaster
 * • TECHNICAL SUPPORT: dev@josephmatino.com, wekturbo@hostwek.com | Response time: 24-48 hours
 * • DOCUMENTATION: Complete API docs, user guides, developer documentation
 * • COMMUNITY: Development community, issue tracking, feature requests
 * • ROADMAP: Public development roadmap, community feedback integration
 *
 * TECHNICAL ARCHITECTURE & INTEGRATIONS:
 * • PLATFORM INTEGRATIONS: Google Gemini AI platform integration and automation
 * • CORE DEPENDENCIES: Chrome Extension APIs, CompressionStream, FileReader API
 * • FEATURES: Gemini-specific DOM handling, file attachment, state management
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

class GeminiPlatform {
  constructor() {
    this.name = 'gemini';
  }

  isCurrentPlatform() {
    const host = window.location.hostname;
    const list = window.GPTPF_CONFIG?.PLATFORM_DOMAINS?.gemini;
    return list?.some(d => host.includes(d));
  }

  getPlatformSettings(baseSettings) {
    const timeouts = window.GPTPF_CONFIG?.PLATFORM_TIMEOUTS;
    return {
      ...baseSettings,
      useDelay: false,
      delaySeconds: 0,
      timeout: timeouts.gemini
    };
  }

  getComposer() {
    const a = document.activeElement;
    if (a && (this.isContentEditable(a) || this.isTextarea(a))) return a;

    return document.querySelector('div[contenteditable="true"]')
        || document.querySelector('textarea[aria-label*="prompt" i]')
        || document.querySelector('div[role="textbox"]');
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
        || allInputs.find(el => !el.disabled);
  }

  async ensureFileInput(wait) {
    let inp = this.getFileInput();
    if (inp) return inp;

    const attachBtn = this.getAttachButton();
    if (attachBtn) {
      attachBtn.click();
      await new Promise(r => setTimeout(r, 150));
    }
    const uploadBtn = document.querySelector('button[data-test-id="local-image-file-uploader-button"]')
                    || Array.from(document.querySelectorAll('button'))
                         .find(b => /upload files/i.test(b.textContent));

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
        observer.observe(document.documentElement, { childList:true, subtree:true });
      } catch(err) { void err; }
    }

    startObserver();

    if (uploadBtn) {
      removeInterceptor = interceptFileDialogOnce();
      uploadBtn.click();
    }


    const pre = this.deepQSA('input[type="file"]').find(el => !el.disabled);
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
      if (!node) continue;
      if (seen.has(node)) continue;
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
                   || document.querySelector('textarea');
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
