/*
 * ================================================================================
 * Multi-AI File Paster Chrome Extension | Production Release v1.1.0
 * ================================================================================
 *
 * MODULE: src/shared/validation.js
 * FUNCTION: Centralized input validation and sanitization utilities
 * ARCHITECTURE: Shared validation functions for consistent input handling
 *
 * DEVELOPMENT TEAM:
 * • Lead Developer: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • Scrum Master: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 *
 * ORGANIZATION: WekTurbo Designs - Hostwek LTD | https://hostwek.com/wekturbo
 * REPOSITORY: https://github.com/JosephMatino/MultiAiFilePaster
 * TECHNICAL SUPPORT: wekturbo@hostwek.com
 *
 * PLATFORM INTEGRATIONS: Input validation, file naming, extension cleaning
 * CORE DEPENDENCIES: None (standalone validation utilities)
 *
 * Copyright (c) 2025 WekTurbo Designs - Hostwek LTD. All rights reserved.
 * Licensed under MIT License | https://opensource.org/licenses/MIT
 * ================================================================================
 */

(() => {
  const root = (typeof self !== 'undefined') ? self : window;
  if (root.GPTPF_VALIDATION) return;

  const RISKY_EXTENSIONS = ['.exe', '.bat', '.cmd', '.scr', '.com', '.pif', '.vbs', '.msi', '.dll'];

  function validateCustomExtension(input) {
    if (!input || typeof input !== 'string') {
      return { valid: false, extension: '', error: 'Extension is required' };
    }

    let clean = input.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    if (!clean) {
      return { valid: false, extension: '', error: 'Enter letters or numbers only' };
    }

    if (clean.length > 5) {
      clean = clean.slice(0, 5);
    }

    const extension = '.' + clean;

    if (RISKY_EXTENSIONS.includes(extension)) {
      return {
        valid: false,
        extension: '',
        error: 'Security risk: executable extensions are not allowed'
      };
    }

    return { valid: true, extension, error: '' };
  }

  function sanitizeFileName(input) {
    if (!input || typeof input !== 'string') {
      return { sanitized: '', hadDots: false, error: '' };
    }

    const original = input.trim();
    const hadDots = original.includes('.');

    let sanitized = original.replace(/\./g, '');
    sanitized = sanitized.replace(/[^A-Za-z0-9 _-]+/g, '-').replace(/\s+/g, '-');
    sanitized = sanitized.replace(/^[-_]+|[-_]+$/g, '').slice(0, 64);

    return { sanitized, hadDots, error: '' };
  }

  function sanitizeEventName(input) {
    if (!input || typeof input !== 'string') return '';
    return String(input).slice(0, 32).replace(/[^a-zA-Z0-9_]/g, '_');
  }

  function isSafeForDisplay(input) {
    if (!input || typeof input !== 'string') return false;
    return !/[<>&"'`]/.test(input) && input.length <= 1000;
  }

  function escapeHtml(input) {
    if (!input || typeof input !== 'string') return '';
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  root.GPTPF_VALIDATION = Object.freeze({
    validateCustomExtension,
    sanitizeFileName,
    sanitizeEventName,
    isSafeForDisplay,
    escapeHtml,
    RISKY_EXTENSIONS: Object.freeze([...RISKY_EXTENSIONS])
  });
})();
