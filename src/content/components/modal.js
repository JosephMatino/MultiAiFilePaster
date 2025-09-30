/*
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: src/content/components/modal.js
 * FUNCTION: Modal dialog component for interactive user interfaces
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
 * • CORE DEPENDENCIES: Chrome Extension APIs, DOM manipulation, event handling
 * • FEATURES: Modal dialogs, user interaction, form handling, keyboard shortcuts
 * • TESTING: Automated unit tests, integration tests, user interaction testing
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
class RenameModal {
  constructor() {
    window.GPTPF_DEBUG?.log('debug_modal_constructor');
    this.currentModal = null;
  }
  show() {
    window.GPTPF_DEBUG?.log('debug_modal_show');
    return new Promise((resolve, reject) => {
      try {
        window.GPTPF_DEBUG?.log('debug_modal_show_promise_start');
        const old = document.getElementById('gptpf-rename');
        if (old) old.remove();
        const wrap = document.createElement('div');
        wrap.id = 'gptpf-rename';
        wrap.setAttribute('role','dialog');
        wrap.setAttribute('aria-modal','true');
        const backdrop = document.createElement('div');
        backdrop.className = 'backdrop';
        const card = document.createElement('div');
        card.className = 'card';
        card.tabIndex = -1;
        const title = document.createElement('div');
        title.className = 'title';
        title.textContent = window.GPTPF_I18N.getMessage('ui_components_modal_title');
        const desc = document.createElement('div');
        desc.className = 'description';
        desc.textContent = window.GPTPF_I18N.getMessage('ui_components_modal_description');
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = window.GPTPF_I18N.getMessage('ui_components_modal_placeholder');
        input.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); if(!confirm.disabled){ ok(); } } });
        const hint = document.createElement('div');
        hint.className = 'hint';
        hint.textContent = window.GPTPF_I18N.getMessage('ui_components_modal_hint');
        const hint2 = document.createElement('div');
        hint2.className = 'hint-keys';
        hint2.innerHTML = window.GPTPF_I18N.getMessage('ui_components_modal_keys_hint');
        const err = document.createElement('div');
        err.className = 'error';
        const row = document.createElement('div');s
        row.className = 'buttons';
        const cancel = document.createElement('button');
        cancel.className = 'cancel-btn';
        cancel.textContent = window.GPTPF_I18N.getMessage('cancel');
        const confirm = document.createElement('button');
        confirm.className = 'confirm-btn';
        confirm.textContent = window.GPTPF_I18N.getMessage('ui_components_modal_save');
        row.appendChild(cancel); 
        row.appendChild(confirm);
        card.appendChild(title); 
        card.appendChild(desc); 
        card.appendChild(input); 
        card.appendChild(hint); 
        card.appendChild(hint2); 
        card.appendChild(err); 
        card.appendChild(row);
        wrap.appendChild(backdrop);
        wrap.appendChild(card);
        document.documentElement.appendChild(wrap);
        document.addEventListener('gptpf:translations-updated', () => {
          if (window.GPTPF_I18N) {
            title.textContent = window.GPTPF_I18N.getMessage('ui_components_modal_title');
            desc.textContent = window.GPTPF_I18N.getMessage('ui_components_modal_description');
            input.placeholder = window.GPTPF_I18N.getMessage('ui_components_modal_placeholder');
            hint.textContent = window.GPTPF_I18N.getMessage('ui_components_modal_hint');
            hint2.innerHTML = window.GPTPF_I18N.getMessage('ui_components_modal_keys_hint');
            cancel.textContent = window.GPTPF_I18N.getMessage('cancel');
            confirm.textContent = window.GPTPF_I18N.getMessage('ui_components_modal_save');
          }
        });
        let lastFocus = document.activeElement;
        function close(){ wrap.remove(); try{ lastFocus && lastFocus.focus && lastFocus.focus(); }catch{} }
        function validate(){
          const inputValue = input && input.value !== null && input.value !== undefined ? String(input.value) : '';
          const original = inputValue.trim();
          if (window.GPTPF_VALIDATION) {
            const result = window.GPTPF_VALIDATION.sanitizeFileName(original);
            if (result.hadDots) {
              err.textContent = window.GPTPF_I18N.getMessage('ui_components_modal_hint');
              confirm.disabled = true;
              return '';
            }
            if (!result.sanitized && original) {
              err.textContent = window.GPTPF_I18N.getMessage('letters_numbers_only');
              confirm.disabled = true;
              return;
            }
            err.textContent = '';
            confirm.disabled = false;
            return result.sanitized;
          }
          const fallbackResult = { sanitized: '', hadDots: false };
          fallbackResult.sanitized = original.replace(/\./g, '').replace(/[^A-Za-z0-9 _-]+/g,'-').replace(/\s+/g,'-');
          fallbackResult.sanitized = fallbackResult.sanitized.replace(/^[-_]+|[-_]+$/g,'').slice(0,64);
          fallbackResult.hadDots = original.includes('.');
          if (fallbackResult.hadDots) {
            err.textContent = window.GPTPF_I18N.getMessage('ui_components_modal_hint');
            confirm.disabled = true;
            return '';
          }
          if (!fallbackResult.sanitized && original) {
            err.textContent = window.GPTPF_I18N.getMessage('letters_numbers_only');
            confirm.disabled = true;
            return;
          }
          err.textContent = '';
          confirm.disabled = false;
          return fallbackResult.sanitized;
        }
        input.addEventListener('input', validate);
        function ok(){ const v = validate(); const out = v || ''; close(); window.GPTPF_DEBUG?.log('debug_modal_ok'); resolve(out); }
        function no(){ close(); window.GPTPF_DEBUG?.log('debug_modal_cancel'); reject(new Error('cancelled')); }
        cancel.addEventListener('click', no);
        confirm.addEventListener('click', ok);
        backdrop.addEventListener('click', no);
        document.addEventListener('keydown', onEsc, true);
        document.addEventListener('focus', trapFocus, true);
        function onEsc(e){ if(e.key==='Escape'){ e.preventDefault(); cleanup(); no(); } }
        function trapFocus(e){ if (!wrap.contains(e.target)) { e.preventDefault(); card.focus(); } }
        function cleanup(){ document.removeEventListener('keydown', onEsc, true); document.removeEventListener('focus', trapFocus, true); }
        setTimeout(()=>{ card.focus(); input.focus(); input.select(); }, 0);
        window.GPTPF_DEBUG?.log('debug_modal_show_complete');
        this.currentModal = wrap;
      } catch { 
        window.GPTPF_DEBUG?.error('debug_modal_show_error');
        reject(new Error('cancelled')); 
      }
    });
  }
  hide() {
    window.GPTPF_DEBUG?.log('debug_modal_hide');
    if (this.currentModal) {
      this.currentModal.remove();
      this.currentModal = null;
      window.GPTPF_DEBUG?.log('debug_modal_hidden');
    }
  }
}
window.RenameModal = RenameModal;
