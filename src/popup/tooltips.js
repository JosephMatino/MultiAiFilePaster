/*
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: src/popup/tooltips.js
 * FUNCTION: Tooltip system with accessibility support
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
 * • PLATFORM INTEGRATIONS: Popup UI tooltips
 * • CORE DEPENDENCIES: Chrome Extension APIs
 * • FEATURES: Tooltip rendering, positioning, keyboard dismissal
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
  let activeTooltip = null;
  function showTooltip(button) {
    window.GPTPF_DEBUG?.log('debug_tooltip_show');
    hideTooltip();
    const text = button.getAttribute('data-tip');
    if (!text) {
      window.GPTPF_DEBUG?.warn('debug_tooltip_missing_text');
      return;
    }
    const tooltip = document.createElement('div');
    tooltip.className = 'professional-tooltip';
    tooltip.innerHTML = text;
    const arrow = document.createElement('div');
    arrow.className = 'professional-tooltip-arrow';
    tooltip.appendChild(arrow);
    document.body.appendChild(tooltip);
    const buttonRect = button.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    let left = buttonRect.left + (buttonRect.width / 2) - (tooltipRect.width / 2);
    let top = buttonRect.top - tooltipRect.height - 8;
    let arrowTop = tooltipRect.height - 1;
    const padding = 16;
    if (left < padding) left = padding;
    if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding;
    }
    if (top < padding) {
      top = buttonRect.bottom + 8;
      arrowTop = -5;
    }
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    const buttonCenter = buttonRect.left + (buttonRect.width / 2);
    const tooltipLeft = left;
    const arrowLeft = buttonCenter - tooltipLeft - 5;
    arrow.style.left = Math.max(5, Math.min(tooltipRect.width - 15, arrowLeft)) + 'px';
    arrow.style.top = arrowTop + 'px';
    tooltip.classList.add('show');
    button.setAttribute('aria-expanded', 'true');
    activeTooltip = { tooltip, button };
    window.GPTPF_DEBUG?.log('debug_tooltip_displayed');
  }
  function hideTooltip() {
    if (activeTooltip) {
      window.GPTPF_DEBUG?.log('debug_tooltip_hide');
      activeTooltip.tooltip.remove();
      activeTooltip.button.setAttribute('aria-expanded', 'false');
      activeTooltip = null;
      window.GPTPF_DEBUG?.log('debug_tooltip_hidden');
    }
  }
  function initTooltips() {
    window.GPTPF_DEBUG?.log('debug_tooltip_system_init');
    document.addEventListener('click', (e) => {
      const t = e.target;
      if (t && t.classList && t.classList.contains('help')){
        const hasTip = t.hasAttribute('data-tip');
        if (hasTip) {
          window.GPTPF_DEBUG?.log('debug_tooltip_help_clicked');
          e.preventDefault();
          if (activeTooltip && activeTooltip.button === t) {
            hideTooltip();
          } else {
            showTooltip(t);
          }
          return;
        }
      }
      hideTooltip();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.GPTPF_DEBUG?.log('debug_tooltip_escape_pressed');
        hideTooltip();
      }
    });
    window.GPTPF_DEBUG?.log('debug_tooltip_system_ready');
  }
  window.GPTPF_TOOLTIPS = {
    showTooltip,
    hideTooltip,
    initTooltips
  };
  window.addEventListener('beforeunload', () => {
    if (window.GPTPF_DEBUG) {
      window.GPTPF_DEBUG.info('tooltips_cleanup', window.GPTPF_I18N.getMessage('tooltips_cleanup_complete'));
    }
  });
})();