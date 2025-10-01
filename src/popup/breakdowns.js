/*
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: src/popup/breakdowns.js
 * FUNCTION: Platform and format breakdown visualization components
 * ARCHITECTURE: Chrome Extension Manifest V3, modular event-driven design
 * SECURITY: Client-side processing, zero data transmission, privacy-first
 * PERFORMANCE: Optimized for Chrome V3 Manifest, lazy loading, efficient DOM
 * COMPATIBILITY: Chrome 88+, Edge 88+, Opera 74+, modern browser APIs
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
 * • FEATURES: Batch processing, file compression, analytics, multi-platform support
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
(() => {
  function animateCount(el, target, duration = 900) {
    if (!el) return;
    const start = 0;
    const diff = Math.max(0, parseInt(target) || 0) - start;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(start + diff * eased);
      el.textContent = val.toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function animateBreakdown(container) {
    container.querySelectorAll('.bar-fill').forEach(bar => {
      const width = bar.getAttribute('data-width');
      bar.style.width = '0%';
      requestAnimationFrame(() => { requestAnimationFrame(() => { bar.style.width = (width ? width : '0') + '%'; }); });
    });
    container.querySelectorAll('.item-count').forEach(countEl => {
      const target = parseInt(countEl.textContent) || 0;
      animateCount(countEl, target);
    });
  }
  function updatePlatformBreakdown(periodHistory) {
    const container = document.getElementById('platformBreakdown');
    if (!container) return;
    try {
      const counts = {};
      const validHistory = Array.isArray(periodHistory) ? periodHistory : [];
      validHistory.forEach(entry => {
        if (entry && typeof entry === 'object') {
          const platform = String(entry.platform || 'unknown').trim();
          if (platform.length > 0 && platform.length < 50) {
            counts[platform] = (counts[platform] || 0) + 1;
          }
        }
      });
      const entries = Object.entries(counts)
        .sort(([,a],[,b]) => b - a)
        .slice(0, 3)
        .filter(([name, count]) => name && count > 0);
      const total = Object.values(counts).reduce((s,n) => s+n, 0) || 1;
      if (entries.length === 0) {
        container.innerHTML = `<div class="breakdown-item"><span class="item-name">${window.GPTPF_I18N.getMessage('no_data_yet')}</span><span class="item-count">—</span></div>`;
        return;
      }
      container.innerHTML = entries.map(([name, count]) => {
        const safeName = String(name).replace(/[<>&"']/g, '');
        const safeCount = Math.max(0, parseInt(count) || 0);
        const pct = Math.min(100, Math.max(0, Math.round((safeCount / total) * 100)));
        return `
          <div class="breakdown-item">
            <span class="item-name">${safeName}</span>
            <span class="item-count">${safeCount}</span>
          </div>
          <div class="mini-bar"><span class="bar-fill" data-width="${pct}"></span></div>
        `;
      }).join('');
      animateBreakdown(container);
    } catch (error) {
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG?.error('console_platform_handler_error', error);
      }
      container.innerHTML = `<div class="breakdown-item"><span class="item-name">${window.GPTPF_I18N.getMessage('analytics_error_loading')}</span><span class="item-count">—</span></div>`;
    }
  }
  function updatePlatformBreakdownAllTime(platforms) {
    const container = document.getElementById('platformBreakdown');
    if (!container) return;
    try {
      const entries = Object.entries(platforms)
        .sort(([,a],[,b]) => b - a)
        .slice(0, 3)
        .filter(([name, count]) => name && count > 0);
      const total = Object.values(platforms).reduce((s,n) => s+n, 0) || 1;
      if (entries.length === 0) {
        container.innerHTML = `<div class="breakdown-item"><span class="item-name">${window.GPTPF_I18N.getMessage('no_data_yet')}</span><span class="item-count">—</span></div>`;
        return;
      }
      container.innerHTML = entries.map(([name, count]) => {
        const safeName = String(name).replace(/[<>&"']/g, '');
        const safeCount = Math.max(0, parseInt(count) || 0);
        const pct = Math.min(100, Math.max(0, Math.round((safeCount / total) * 100)));
        return `
          <div class="breakdown-item">
            <span class="item-name">${safeName}</span>
            <span class="item-count">${safeCount}</span>
          </div>
          <div class="mini-bar"><span class="bar-fill" data-width="${pct}"></span></div>
        `;
      }).join('');
      animateBreakdown(container);
    } catch (error) {
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG?.error('console_platform_handler_error', error);
      }
      container.innerHTML = `<div class="breakdown-item"><span class="item-name">${window.GPTPF_I18N.getMessage('analytics_error_loading')}</span><span class="item-count">—</span></div>`;
    }
  }
  function updateFormatBreakdown(history) {
    const container = document.getElementById('formatBreakdown');
    if (!container) return;
    try {
      const validHistory = Array.isArray(history) ? history : [];
      if (validHistory.length === 0) {
        container.innerHTML = `<div class="breakdown-item"><span class="item-name">${window.GPTPF_I18N.getMessage('no_data_yet')}</span><span class="item-count">—</span></div>`;
        return;
      }
      const counts = {};
      validHistory.forEach(entry => {
        if (entry && typeof entry === 'object') {
          const format = String(entry.format || 'txt').trim().toUpperCase();
          if (format.length > 0 && format.length < 10) {
            counts[format] = (counts[format] || 0) + 1;
          }
        }
      });
      const entries = Object.entries(counts)
        .sort(([,a],[,b]) => b - a)
        .slice(0, 3)
        .filter(([fmt, count]) => fmt && count > 0);
      const total = Object.values(counts).reduce((s,n) => s+n, 0) || 1;
      if (entries.length === 0) {
        container.innerHTML = `<div class="breakdown-item"><span class="item-name">${window.GPTPF_I18N.getMessage('no_data_yet')}</span><span class="item-count">—</span></div>`;
        return;
      }
      container.innerHTML = entries.map(([fmt, count]) => {
        const safeFormat = String(fmt).replace(/[<>&"']/g, '');
        const safeCount = Math.max(0, parseInt(count) || 0);
        const pct = Math.min(100, Math.max(0, Math.round((safeCount / total) * 100)));
        return `
          <div class="breakdown-item">
            <span class="item-name">${safeFormat}</span>
            <span class="item-count">${safeCount}</span>
          </div>
          <div class="mini-bar"><span class="bar-fill" data-width="${pct}"></span></div>
        `;
      }).join('');
      animateBreakdown(container);
    } catch (error) {
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG?.error('console_platform_handler_error', error);
      }
      container.innerHTML = `<div class="breakdown-item"><span class="item-name">${window.GPTPF_I18N.getMessage('analytics_error_loading')}</span><span class="item-count">—</span></div>`;
    }
  }
  function updateFormatBreakdownAllTime(formats) {
    const container = document.getElementById('formatBreakdown');
    if (!container) return;
    try {
      const entries = Object.entries(formats)
        .sort(([,a],[,b]) => b - a)
        .slice(0, 3)
        .filter(([fmt, count]) => fmt && count > 0);
      const total = Object.values(formats).reduce((s,n) => s+n, 0) || 1;
      if (entries.length === 0) {
        container.innerHTML = `<div class="breakdown-item"><span class="item-name">${window.GPTPF_I18N.getMessage('no_data_yet')}</span><span class="item-count">—</span></div>`;
        return;
      }
      container.innerHTML = entries.map(([fmt, count]) => {
        const safeFormat = String(fmt).toUpperCase().replace(/[<>&"']/g, '');
        const safeCount = Math.max(0, parseInt(count) || 0);
        const pct = Math.min(100, Math.max(0, Math.round((safeCount / total) * 100)));
        return `
          <div class="breakdown-item">
            <span class="item-name">${safeFormat}</span>
            <span class="item-count">${safeCount}</span>
          </div>
          <div class="mini-bar"><span class="bar-fill" data-width="${pct}"></span></div>
        `;
      }).join('');
      animateBreakdown(container);
    } catch (error) {
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG?.error('console_platform_handler_error', error);
      }
      container.innerHTML = `<div class="breakdown-item"><span class="item-name">${window.GPTPF_I18N.getMessage('analytics_error_loading')}</span><span class="item-count">—</span></div>`;
    }
  }
  window.GPTPF_BREAKDOWNS = {
    updatePlatformBreakdown,
    updatePlatformBreakdownAllTime,
    updateFormatBreakdown,
    updateFormatBreakdownAllTime
  };
})();