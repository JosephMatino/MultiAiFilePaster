/*
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: src/popup/modals.js
 * FUNCTION: Modal dialog management for popup interface
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
 * • PLATFORM INTEGRATIONS: Popup UI modal utilities
 * • CORE DEPENDENCIES: Chrome Extension APIs
 * • FEATURES: About modal, clear analytics modal, accessibility focus traps
 * • TESTING: Automated unit tests and integration validation across supported platforms
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

(() => {
  let lastFocus = null;

  function openAboutModal() {
    const aboutModal = document.getElementById('aboutModal');
    const aboutBtn = document.getElementById('aboutBtn');
    if (!aboutModal) return;
    
    lastFocus = document.activeElement;
    aboutModal.hidden = false;
    aboutBtn && aboutBtn.setAttribute('aria-expanded','true');

    if (window.GPTPF_TOOLTIPS) {
      window.GPTPF_TOOLTIPS.hideTooltip();
    }
    document.documentElement.classList.add('tips-disabled');
    const card = aboutModal.querySelector('.modal-card');
    card && card.focus();
    document.addEventListener('keydown', trapEsc, true);
    document.addEventListener('focus', trapFocus, true);
  }

  function closeAboutModal() {
    const aboutModal = document.getElementById('aboutModal');
    const aboutBtn = document.getElementById('aboutBtn');
    if (!aboutModal) return;
    
    aboutModal.hidden = true;
    aboutBtn && aboutBtn.setAttribute('aria-expanded','false');
    document.documentElement.classList.remove('tips-disabled');
    document.removeEventListener('keydown', trapEsc, true);
    document.removeEventListener('focus', trapFocus, true);
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  function trapEsc(e) { 
    if (e.key === 'Escape') { 
      e.preventDefault(); 
      closeAboutModal(); 
    } 
  }

  function trapFocus(e) {
    const aboutModal = document.getElementById('aboutModal');
    if (!aboutModal || aboutModal.hidden) return;
    if (!aboutModal.contains(e.target)){
      const card = aboutModal.querySelector('.modal-card');
      card && card.focus();
      e.preventDefault();
    }
  }

  function openClearModal() {
    const clearModal = document.getElementById('clearDataModal');
    if (!clearModal) return;

    lastFocus = document.activeElement;
    clearModal.hidden = false;

    if (window.GPTPF_TOOLTIPS) {
      window.GPTPF_TOOLTIPS.hideTooltip();
    }
    document.documentElement.classList.add('tips-disabled');

    const card = clearModal.querySelector('.modal-card');
    card && card.focus();

    document.addEventListener('keydown', trapEscClear, true);
    document.addEventListener('focus', trapFocusClear, true);

    setTimeout(() => document.getElementById('confirmClear')?.focus(), 100);
  }

  function closeClearModal() {
    const clearModal = document.getElementById('clearDataModal');
    if (!clearModal) return;

    clearModal.hidden = true;
    document.documentElement.classList.remove('tips-disabled');
    document.removeEventListener('keydown', trapEscClear, true);
    document.removeEventListener('focus', trapFocusClear, true);
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  function trapEscClear(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeClearModal();
    }
  }

  function trapFocusClear(e) {
    const clearModal = document.getElementById('clearDataModal');
    if (!clearModal || clearModal.hidden) return;
    if (!clearModal.contains(e.target)){
      const card = clearModal.querySelector('.modal-card');
      card && card.focus();
      e.preventDefault();
    }
  }

  function loadModalContent() {
    // Modal content is already in HTML with i18n attributes
    // This function can be used for dynamic content loading if needed
  }

  function initModals() {
    loadModalContent();

    const aboutBtn = document.getElementById('aboutBtn');
    const aboutClose = document.getElementById('aboutClose');
    const aboutModal = document.getElementById('aboutModal');
    const clearStatsBtn = document.getElementById('clearStats');
    const clearModal = document.getElementById('clearDataModal');
    const cancelClear = document.getElementById('cancelClear');
    const confirmClear = document.getElementById('confirmClear');

    aboutBtn && aboutBtn.addEventListener('click', () => openAboutModal());
    aboutClose && aboutClose.addEventListener('click', () => closeAboutModal());
    aboutModal && aboutModal.addEventListener('click', (e) => {
      const el = e.target;
      if (el && el.getAttribute && el.getAttribute('data-close')) closeAboutModal();
    });

    if (clearStatsBtn && clearModal) {
      clearStatsBtn.addEventListener('click', openClearModal);

      if (cancelClear) {
        cancelClear.addEventListener('click', closeClearModal);
      }

      clearModal.addEventListener('click', (e) => {
        const el = e.target;
        if (el && el.getAttribute && el.getAttribute('data-close')) closeClearModal();
      });

      if (confirmClear) {
        confirmClear.addEventListener('click', () => {
          if (window.GPTPF_ANALYTICS) {
            window.GPTPF_ANALYTICS.showAnalyticsLoading(true);
          }
          closeClearModal();

          setTimeout(() => {
            chrome.storage.local.remove(['__analytics_data'], () => {
              if (window.GPTPF_ANALYTICS) {
                window.GPTPF_ANALYTICS.loadAnalytics();
              }
              if (window.GPTPF_FLASH) {
                window.GPTPF_FLASH(window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'DATA_CLEARED_SUCCESS'), 'success');
              }
            });
          }, 500);
        });
      }
    }
  }

  window.GPTPF_MODALS = {
    openAboutModal,
    closeAboutModal,
    openClearModal,
    closeClearModal,
    initModals
  };
})();
