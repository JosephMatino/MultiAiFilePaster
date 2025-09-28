/*
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: src/content/components/fileattach.js
 * FUNCTION: File creation and attachment component with cross-platform support
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
 * • PLATFORM INTEGRATIONS: ChatGPT, Claude, Gemini, DeepSeek, Grok
 * • CORE DEPENDENCIES: Chrome Extension APIs, CompressionStream, FileReader API
 * • FEATURES: File attachment creation, cross-platform compatibility, DOM interaction
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
class FileAttachComponent {
  constructor() {
    this.fileCounter = 0;
  }
  nextName(ext) {
    this.fileCounter += 1;
    return `paste.${this.fileCounter}.${ext}`;
  }
  makeFile(content, fmt, customName = "") {
    if (window.GPTPF_DEBUG) {
      window.GPTPF_DEBUG?.info('file_creation_started', `Format: ${fmt}, Content length: ${content?.length || 0}, Custom name: ${customName || 'none'}`);
    }

    if (!content || typeof content !== 'string') {
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG?.warn('file_creation_empty_content', window.GPTPF_I18N?.getMessage('debug_file_content_empty'));
      }
      content = '';
    }

    try {
      if (fmt === 'auto' && (window.GPTPF_LANGUAGE_DETECTOR || window.LanguageDetector)) {
        const detector = window.GPTPF_LANGUAGE_DETECTOR || (window.LanguageDetector ? new window.LanguageDetector() : null);
        if (detector) {
          const detectionResult = detector.detectWithContext(content, customName);
          fmt = detectionResult.extension || 'txt';
          if (window.GPTPF_DEBUG) {
            window.GPTPF_DEBUG?.info('format_auto_detected', {
              detected: fmt,
              confidence: detectionResult.confidence,
              source: detectionResult.source
            });
          }
        } else {
          fmt = 'txt';
        }
      }
    } catch(err) {
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG?.error('console_platform_handler_error', err);
      }
      fmt = 'txt';
    }

    let body = content;
    let mime = "text/plain";

    if (fmt === "md" || fmt === "markdown") {
      mime = "text/markdown";
    } else if (fmt === "json") {
      mime = "application/json";
      
      try {
        JSON.parse(content);
        if (window.GPTPF_DEBUG) {
          window.GPTPF_DEBUG?.info('json_content_valid', window.GPTPF_I18N?.getMessage('debug_json_content_valid'));
        }
      } catch {
        try {
          body = JSON.stringify({ content }, null, 2);
          if (window.GPTPF_DEBUG) {
            window.GPTPF_DEBUG?.info('json_wrap_applied', window.GPTPF_I18N?.getMessage('debug_json_wrap_applied'));
          }
        } catch(err) {
          if (window.GPTPF_DEBUG) {
            window.GPTPF_DEBUG?.error('console_platform_handler_error', err);
          }
          mime = "text/plain";
        }
      }
    } else if (fmt === "js" || fmt === "javascript") {
      mime = "text/javascript";
    } else if (fmt === "ts" || fmt === "typescript") {
      mime = "text/typescript";
    } else if (fmt === "html") {
      mime = "text/html";
    } else if (fmt === "css") {
      mime = "text/css";
    } else if (fmt === "xml") {
      mime = "application/xml";
    } else if (fmt === "py" || fmt === "python") {
      mime = "text/x-python";
    }
    let filename;
    if (customName && customName.trim()) {
      const cleanName = window.GPTPF_VALIDATION?.sanitizeFileName(customName.trim())?.sanitized || customName.trim();
      if (cleanName.includes('.') && cleanName.split('.').length >= 2) {
        const parts = cleanName.split('.');
        const ext = parts[parts.length - 1].toLowerCase();
        if (ext && ext.length <= 10) {
          filename = cleanName;
        } else {
          const cleanFmt = fmt.replace(/^\.+/, '');
          filename = `${cleanName}.${cleanFmt}`;
        }
      } else {
        const cleanFmt = fmt.replace(/^\.+/, '');
        filename = `${cleanName}.${cleanFmt}`;
      }
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG?.info('custom_filename_processed', `Original: "${customName}", Final: "${filename}"`);
      }
    } else {
      filename = this.nextName(fmt);
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG?.info('auto_filename_generated', `Generated: "${filename}"`);
      }
    }

    if (!body || body.length === 0) {
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG?.warn('empty_file_created', window.GPTPF_I18N?.getMessage('debug_file_no_content'));
      }
      body = '';
    }

    const blob = new Blob([body], { type: mime });
    if (window.GPTPF_DEBUG) {
      window.GPTPF_DEBUG?.info('file_blob_created', {
        size: blob.size,
        mime: mime,
        filename: filename,
        contentPreview: body.substring(0, 100) + (body.length > 100 ? '...' : '')
      });
    }
    
    const file = new File([blob], filename, { type: mime, lastModified: Date.now() });
    
    if (window.GPTPF_DEBUG) {
      window.GPTPF_DEBUG?.info('file_creation_complete', {
        name: file.name,
        size: file.size,
        type: file.type,
        contentLength: body.length
      });
    }

    return file;
  }
  getPlusButton() {
    const host = window.location.hostname;
    const domains = window.GPTPF_CONFIG?.PLATFORM_DOMAINS ?? {};
    if ((domains.claude ?? []).some(d => host.includes(d))) {
      return document.querySelector('input[type="file"]')?.closest('button')
          || document.querySelector('button[aria-label*="attach" i]')
          || document.querySelector('button[title*="attach" i]');
    }
    if ((domains.gemini ?? []).some(d => host.includes(d))) {
      return document.querySelector('button[aria-label*="attach" i]')
          || document.querySelector('button[aria-label*="upload" i]')
          || document.querySelector('button[data-test-id*="uploader"]')
          || document.querySelector('input[type="file"]')?.closest('button')
          || document.querySelector('button[title*="attach" i]');
    }
    if ((domains.deepseek ?? []).some(d => host.includes(d))) {
      return document.querySelector('button[aria-label*="attach" i]')
          || document.querySelector('button[aria-label*="upload" i]')
          || document.querySelector('input[type="file"]')?.closest('button')
          || document.querySelector('button[title*="file" i]');
    }
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
    const host = window.location.hostname;
    const geminiDomains = window.GPTPF_CONFIG?.PLATFORM_DOMAINS?.gemini ?? [];
    if (geminiDomains.some(d => host.includes(d))) {
      return await this.ensureGeminiFileInput(wait);
    }
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
        } catch(err) {
          if (window.GPTPF_DEBUG) {
            window.GPTPF_DEBUG?.error('console_platform_handler_error', err);
          }
        }
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
              } catch(err) {
                if (window.GPTPF_DEBUG) {
                  window.GPTPF_DEBUG?.error('console_platform_handler_error', err);
                }
              }
            }
          }
        });
        observer.observe(document.documentElement || document.body, { childList:true, subtree:true });
      } catch(err) {
        if (window.GPTPF_DEBUG) {
          window.GPTPF_DEBUG?.error('console_platform_handler_error', err);
        }
      }
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
        try { node.querySelectorAll && node.querySelectorAll(selector).forEach(el => out.push(el)); } catch(err) {
          if (window.GPTPF_DEBUG) {
            window.GPTPF_DEBUG?.error('console_platform_handler_error', err);
          }
        }
        let allKids = [];
        try { allKids = node.querySelectorAll ? node.querySelectorAll('*') : []; } catch(err) {
          if (window.GPTPF_DEBUG) {
            window.GPTPF_DEBUG?.error('console_platform_handler_error', err);
          }
        }
        for (const el of allKids) { if (el && el.shadowRoot) stack.push(el.shadowRoot); }
        if (node instanceof ShadowRoot) {
          try { node.querySelectorAll('*').forEach(el => { if (el.shadowRoot) stack.push(el.shadowRoot); }); } catch(err) {
            if (window.GPTPF_DEBUG) {
              window.GPTPF_DEBUG?.error('console_platform_handler_error', err);
            }
          }
        }
      }
      return out;
    }
    const pre = deepQSA('input[type="file"]').find(el => !el.disabled) || null;
    if (pre) {
      try { observer?.disconnect(); } catch(err) {
        if (window.GPTPF_DEBUG) {
          window.GPTPF_DEBUG?.error('console_platform_handler_error', err);
        }
      }
      resolveInput(pre);
    }
    let inp = null;
    const timeoutPromise = new Promise(res => setTimeout(() => res(null), Math.max(200, wait-50)));
    inp = await Promise.race([inputPromise, timeoutPromise]);
    if (removeInterceptor) {
      try { removeInterceptor(); } catch(err) {
        if (window.GPTPF_DEBUG) {
          window.GPTPF_DEBUG?.error('console_platform_handler_error', err);
        }
      }
    }
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
