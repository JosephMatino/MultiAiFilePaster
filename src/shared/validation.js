/*
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: src/shared/validation.js
 * FUNCTION: Centralized input validation and sanitization utilities
 * ARCHITECTURE: Chrome Extension Manifest V3, modular event-driven design
 * SECURITY: Client-side processing, zero data transmission, privacy-first
 * PERFORMANCE: Optimized for Chrome V3 Manifest, lazy loading, efficient DOM
 * COMPATIBILITY: Chrome 88+, Edge 88+, Opera 74+, modern browser APIs
 * RELIABILITY: Production error handling, graceful degradation, stable operation
 *
 * DEVELOPMENT TEAM & PROJECT LEADERSHIP:
 * • LEAD DEVELOPER: Joseph Matino <dev@josephmatino.com> | https:
 * • SCRUM MASTER & PROJECT FUNDING: Majok Deng <scrum@majokdeng.com> | https:
 * • QUALITY ASSURANCE: Automated testing pipeline
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
 * � CONFIDENTIALITY & TRADE SECRET PROTECTION:
 * This software contains confidential and proprietary information constituting
 * trade secrets of Hostwek LTD. Unauthorized disclosure, use, or distribution
 * of this technology or its underlying source code is prohibited and
 * may result in legal action, including injunctive relief and monetary damages.
 * ================================================================================
 */
(() => {
  const root = (typeof self !== 'undefined') ? self : window;
  if (root.GPTPF_VALIDATION) return;
  root.GPTPF_DEBUG?.log('debug_validation_system_init');
  const RISKY_EXTENSIONS = ['.exe', '.bat', '.cmd', '.scr', '.com', '.pif', '.vbs', '.msi', '.dll'];
  function validateCustomExtension(input) {
    root.GPTPF_DEBUG?.log('debug_validation_extension_start');
    if (!input || typeof input !== 'string') {
      root.GPTPF_DEBUG?.warn('debug_validation_extension_invalid_input');
      return { valid: false, extension: '', error: root.GPTPF_I18N?.getMessage('validation_extension_required') };
    }
    let clean = input.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!clean) {
      root.GPTPF_DEBUG?.warn('debug_validation_extension_empty');
      return { valid: false, extension: '', error: root.GPTPF_I18N?.getMessage('validation_letters_numbers_only') };
    }
    if (clean.length > 5) {
      clean = clean.slice(0, 5);
      root.GPTPF_DEBUG?.log('debug_validation_extension_truncated');
    }
    const extension = '.' + clean;
    if (RISKY_EXTENSIONS.includes(extension)) {
      root.GPTPF_DEBUG?.warn('debug_validation_extension_risky');
      return {
        valid: false,
        extension: '',
        error: root.GPTPF_I18N?.getMessage('validation_security_risk_executable')
      };
    }
    root.GPTPF_DEBUG?.log('debug_validation_extension_valid');
    return { valid: true, extension, error: '' };
  }
  function sanitizeFileName(input) {
    root.GPTPF_DEBUG?.log('debug_validation_filename_start');
    if (!input || typeof input !== 'string') {
      root.GPTPF_DEBUG?.warn('debug_validation_filename_invalid_input');
      return { sanitized: '', hadDots: false, error: '' };
    }
    const original = input.trim();
    const hadDots = original.includes('.');
    const lastDotIndex = original.lastIndexOf('.');
    const hasValidExtension = lastDotIndex > 0 &&
                             lastDotIndex < original.length - 1 &&
                             original.length - lastDotIndex <= 6 &&
                             /^[a-zA-Z0-9]+$/.test(original.substring(lastDotIndex + 1));
    let sanitized;
    if (hasValidExtension) {
      const namepart = original.substring(0, lastDotIndex);
      const extension = original.substring(lastDotIndex);
      let cleanName = namepart.replace(/\./g, '');
      cleanName = cleanName.replace(/[^A-Za-z0-9 _-]+/g, '-').replace(/\s+/g, '-');
      cleanName = cleanName.replace(/^[-_]+|[-_]+$/g, '');
      sanitized = (cleanName + extension).slice(0, 64);
      root.GPTPF_DEBUG?.log('debug_validation_filename_with_extension');
    } else {
      sanitized = original.replace(/\./g, '');
      sanitized = sanitized.replace(/[^A-Za-z0-9 _-]+/g, '-').replace(/\s+/g, '-');
      sanitized = sanitized.replace(/^[-_]+|[-_]+$/g, '').slice(0, 64);
      root.GPTPF_DEBUG?.log('debug_validation_filename_no_extension');
    }
    root.GPTPF_DEBUG?.log('debug_validation_filename_complete');
    return { sanitized, hadDots, error: '' };
  }
  function sanitizeEventName(input) {
    root.GPTPF_DEBUG?.log('debug_validation_event_name');
    if (!input || typeof input !== 'string') return '';
    return String(input).slice(0, 32).replace(/[^a-zA-Z0-9_]/g, '_');
  }
  function isSafeForDisplay(input) {
    root.GPTPF_DEBUG?.log('debug_validation_display_safety');
    if (!input || typeof input !== 'string') return false;
    const isSafe = !/[<>&"'`]/.test(input) && input.length <= 1000;
    if (!isSafe) {
      root.GPTPF_DEBUG?.warn('debug_validation_display_unsafe');
    }
    return isSafe;
  }
  function escapeHtml(input) {
    root.GPTPF_DEBUG?.log('debug_validation_html_escape');
    if (!input || typeof input !== 'string') return '';
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  const wc = s => s?.trim().match(/\b\w+\b/g)?.length;
  const hash = s => s ? String(s.length)+":"+s.slice(0,32) : "";
  root.GPTPF_VALIDATION = Object.freeze({
    validateCustomExtension,
    sanitizeFileName,
    sanitizeEventName,
    isSafeForDisplay,
    escapeHtml,
    clamp,
    wc,
    hash,
    RISKY_EXTENSIONS: Object.freeze([...RISKY_EXTENSIONS])
  });
  root.GPTPF_DEBUG?.log('debug_validation_system_ready');
})();
