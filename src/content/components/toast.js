/*
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: src/content/components/toast.js
 * FUNCTION: Toast notification component for user feedback and messaging
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
 * • PLATFORM INTEGRATIONS: ChatGPT, Claude, Gemini, DeepSeek, Grok
 * • CORE DEPENDENCIES: Chrome Extension APIs, DOM manipulation, CSS animations
 * • FEATURES: Toast notifications, user feedback, status messages, error handling
 * • TESTING: Automated unit tests, integration tests, visual regression testing
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

class ToastComponent {
  constructor() {
    this.currentToast = null;
  }

  ensureHost(id) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      document.documentElement.appendChild(el);
    }
    return el;
  }

  show(text, ok = true, action = null, level = (ok ? 'success' : 'error')) {
    const el = this.ensureHost("gptpf-toast");

    const cls = level === 'error' ? 'error' : (level === 'success' ? 'success' : 'info');
    el.className = cls;

    try {
      el.setAttribute('role', cls === 'error' ? 'alert' : 'status');
      el.setAttribute('aria-live', cls === 'error' ? 'assertive' : 'polite');
      el.setAttribute('aria-atomic','true');
    } catch(err) { void err; }

    while (el.firstChild) el.removeChild(el.firstChild);

    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden','true');
    icon.className = 'gptpf-toast-icon';

    if (cls === 'success') {
      icon.classList.add('gptpf-toast-icon-success');
      icon.innerHTML = '<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M9 1L3.5 6.5L1 4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    } else if (cls === 'error') {
      icon.classList.add('gptpf-toast-icon-error');
      icon.innerHTML = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7.5 2.5L2.5 7.5M2.5 2.5L7.5 7.5" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>';
    } else {
      icon.classList.add('gptpf-toast-icon-info');
      const dot = document.createElement('span');
      dot.className = 'gptpf-toast-spinner';
      icon.appendChild(dot);
    }
    el.appendChild(icon);

    const span = document.createElement("span");
    span.textContent = text;
    el.appendChild(span);

    const t = window.GPTPF_CONFIG?.UI_TIMINGS || {};
    let timeout = t.toastMs ?? (cls === 'info' ? (t.toastInfoMs ?? 3000) : (cls === 'error' ? (t.toastErrorMs ?? 3000) : (t.toastSuccessMs ?? 3000)));
    if (action && action.label && typeof action.onClick === "function"){
      const btn = document.createElement("button");
      btn.textContent = action.label;
      btn.addEventListener("click", (e)=>{
        e.preventDefault();
        btn.disabled = true;
        action.onClick(btn);
      });
      el.appendChild(btn);
      timeout = t.toastWithActionMs ?? (t.toastMs ?? 3000);
    }

    el.classList.add('show');
    clearTimeout(el._h);
    el._h = setTimeout(()=>{
      el.classList.remove('show');
      el.classList.add('hide');
    }, timeout);

    this.currentToast = el;
  }

  hide() {
    if (this.currentToast) {
      this.currentToast.classList.remove('show');
      this.currentToast.classList.add('hide');
      setTimeout(() => {
        if (this.currentToast && this.currentToast.parentNode) {
          this.currentToast.remove();
        }
      }, 200);
      this.currentToast = null;
    }
  }

  success(text, action = null) {
    this.show(text, true, action);
  }

  error(text, action = null) {
    this.show(text, false, action);
  }
}

window.ToastComponent = ToastComponent;
