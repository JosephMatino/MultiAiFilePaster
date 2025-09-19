/*
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: src/shared/i18n.js
 * FUNCTION: Chrome Extension i18n system for multi-language support
 * ARCHITECTURE: Chrome Extension Manifest V3, Chrome i18n API integration
 * SECURITY: Client-side processing, zero data transmission, privacy-first
 * PERFORMANCE: Optimized message lookup, efficient DOM updates
 * COMPATIBILITY: Chrome 88+, Edge 88+, Opera 74+, Chrome i18n API
 * RELIABILITY: Production error handling, graceful degradation, stable operation
 *
 * DEVELOPMENT TEAM & PROJECT LEADERSHIP:
 * • LEAD DEVELOPER: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • SCRUM MASTER & PROJECT FUNDING: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 * • QUALITY ASSURANCE: Automated testing pipeline
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
  if (root.GPTPF_I18N) return;

  let currentLanguage = 'en';
  let messageCache = {};

  function getCurrentLanguage() {
    return currentLanguage;
  }

  async function loadMessages(lang) {
    if (messageCache[lang]) {
      return messageCache[lang];
    }

    try {
      const response = await fetch(chrome.runtime.getURL(`_locales/${lang}/messages.json`));
      const messages = await response.json();
      messageCache[lang] = messages;
      return messages;
    } catch (error) {
      console.error(`Failed to load messages for ${lang}:`, error);
      return {};
    }
  }

  async function setLanguage(lang) {
    if (lang && (lang === 'en' || lang === 'sw' || lang === 'ar')) {
      showLanguageLoading();

      await loadMessages(lang);

      currentLanguage = lang;
      localStorage.setItem('gptpf_language', lang);

      try {
        const html = document.documentElement;
        if (html) {
          html.setAttribute('lang', currentLanguage);
          html.setAttribute('dir', currentLanguage === 'ar' ? 'rtl' : 'ltr');
        }
      } catch(_) {}

      updateAllTranslations();
      updateLanguageSelector();

      const overlayMs = (window.GPTPF_CONFIG?.UI_TIMINGS?.languageOverlayMs ?? 3000);
      await new Promise(r => setTimeout(r, overlayMs));
      hideLanguageLoading();

      if (window.GPTPF_FLASH && window.GPTPF_MESSAGES) {
        const displayName = (lang === 'sw') ? 'Kiswahili' : (lang === 'ar' ? 'العربية' : 'English');
        const message = window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'LANGUAGE_CHANGED', displayName);
        window.GPTPF_FLASH(message, 'success');
      }
    }
  }

  function getMessage(key, substitutions = []) {
    const messages = messageCache[currentLanguage];
    if (messages && messages[key]) {
      const entry = messages[key];
      let result = entry.message;

      if (substitutions && substitutions.length > 0) {
        substitutions.forEach((sub, index) => {
          result = result.replace(new RegExp(`\\$${index + 1}(?![0-9])`, 'g'), String(sub));
        });
      }

      try {
        const ph = entry.placeholders;
        if (ph && typeof ph === 'object') {
          for (const name of Object.keys(ph)) {
            const content = ph[name]?.content || '';
            const match = content.match(/\$(\d+)/);
            if (match) {
              const idx = parseInt(match[1], 10) - 1;
              if (idx >= 0 && substitutions[idx] !== undefined) {
                result = result.replace(new RegExp(`\\$${name.toUpperCase()}\\$`, 'g'), String(substitutions[idx]));
              }
            }
          }
        }
      } catch (_) {}

      return result;
    }
    try {
      const fallback = chrome.i18n.getMessage(key, substitutions);
      return fallback || key;
    } catch (_) {
      return key;
    }
  }

  function updateAllTranslations() {
    const htmlElements = document.querySelectorAll('[data-i18n-html]');
    htmlElements.forEach(element => {
      const key = element.getAttribute('data-i18n-html');
      if (key) {
        const message = getMessage(key);
        if (message && message !== key) {
          element.innerHTML = message;
        }
      }
    });

    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (key) {
        const message = getMessage(key);
        if (message && message !== key) {
          element.textContent = message;
        }
      }
    });

    const tooltipElements = document.querySelectorAll('[data-tip-i18n]');
    tooltipElements.forEach(element => {
      const key = element.getAttribute('data-tip-i18n');
      if (key) {
        const message = getMessage(key);
        if (message && message !== key) {
          element.setAttribute('data-tip', message);
        }
      }
    });

    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      if (key) {
        const message = getMessage(key);
        if (message && message !== key) {
          element.placeholder = message;
        }
      }
    });

    const titleElements = document.querySelectorAll('[data-i18n-title]');
    titleElements.forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      if (key) {
        const message = getMessage(key);
        if (message && message !== key) {
          element.title = message;
        }
      }
    });

    const ariaLabelElements = document.querySelectorAll('[data-i18n-aria-label]');
    ariaLabelElements.forEach(element => {
      const key = element.getAttribute('data-i18n-aria-label');
      if (key) {
        const message = getMessage(key);
        if (message && message !== key) {
          element.setAttribute('aria-label', message);
        }
      }
    });

    try {
      const evt = new CustomEvent('gptpf:translations-updated', { detail: { language: currentLanguage } });
      document.dispatchEvent(evt);
    } catch(_) {}
  }

  function updateLanguageSelector() {
    const currentLanguageSpan = document.getElementById('currentLanguage');
    const currentFlag = document.getElementById('currentFlag');

    if (currentLanguageSpan) {
      currentLanguageSpan.textContent = currentLanguage === 'sw' ? 'SW' : (currentLanguage === 'ar' ? 'AR' : 'EN');
    }

    if (currentFlag) {
      currentFlag.className = currentLanguage === 'sw' ? 'flag-icon tanzania-flag' : (currentLanguage === 'ar' ? 'flag-icon arabic-flag' : 'flag-icon uk-flag');
    }
  }

  function showLanguageLoading() {
    const overlay = document.getElementById('languageLoadingOverlay');
    if (overlay) {
      overlay.hidden = false;
      overlay.classList.add('show');
    }
  }

  function hideLanguageLoading() {
    const overlay = document.getElementById('languageLoadingOverlay');
    if (overlay) {
      overlay.classList.remove('show');
      setTimeout(() => {
        overlay.hidden = true;
      }, 180);
    }
  }

  function initializeLanguageSelector() {
    const languageBtn = document.getElementById('languageBtn');
    const languageDropdown = document.getElementById('languageDropdown');
    const languageBackdrop = document.getElementById('languageBackdrop');
    const languageOptions = document.querySelectorAll('.language-option');

    if (!languageBtn || !languageDropdown || !languageBackdrop) return;

    function showDropdown() {
      languageDropdown.hidden = false;
      languageBackdrop.hidden = false;
      setTimeout(() => languageBackdrop.classList.add('show'), 10);
      languageBtn.parentElement.setAttribute('aria-expanded', 'true');
    }

    function hideDropdown() {
      languageBackdrop.classList.remove('show');
      setTimeout(() => {
        languageDropdown.hidden = true;
        languageBackdrop.hidden = true;
      }, 200);
      languageBtn.parentElement.setAttribute('aria-expanded', 'false');
    }

    languageBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (languageDropdown.hidden) {
        showDropdown();
      } else {
        hideDropdown();
      }
    });

    languageOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = option.getAttribute('data-lang');
        if (lang) {
          setLanguage(lang);
          hideDropdown();
        }
      });
    });

    languageBackdrop.addEventListener('click', hideDropdown);

    document.addEventListener('click', (e) => {
      if (!languageBtn.contains(e.target) && !languageDropdown.contains(e.target)) {
        hideDropdown();
      }
    });
  }

  async function initializeI18n() {
    try {
      const html = document.documentElement;
      if (html) html.setAttribute('data-booting', '1');
    } catch(_) {}

    const savedLanguage = localStorage.getItem('gptpf_language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'sw' || savedLanguage === 'ar')) {
      currentLanguage = savedLanguage;
    } else {
      const cfg = (typeof window !== 'undefined' ? window.GPTPF_CONFIG : (typeof self !== 'undefined' ? self.GPTPF_CONFIG : null)) || {};
      const fallbackLang = (typeof cfg.LANGUAGE_DEFAULT === 'string' && cfg.LANGUAGE_DEFAULT) ? cfg.LANGUAGE_DEFAULT : 'en';
      const browserLang = chrome?.i18n?.getUILanguage?.() || navigator.language || fallbackLang;
      currentLanguage = browserLang.startsWith('sw') ? 'sw' : (browserLang.startsWith('ar') ? 'ar' : fallbackLang);
    }

    await Promise.all([
      loadMessages('en'),
      loadMessages('sw'),
      loadMessages('ar')
    ]);

    try {
      const html = document.documentElement;
      if (html) {
        html.setAttribute('lang', currentLanguage);
        html.setAttribute('dir', currentLanguage === 'ar' ? 'rtl' : 'ltr');
      }
    } catch(_) {}

    updateAllTranslations();
    updateLanguageSelector();
    initializeLanguageSelector();

    try {
      const container = document.querySelector('main.container');
      if (container) container.hidden = false;
    } catch(_) {}

    try {
      const html = document.documentElement;
      if (html) html.removeAttribute('data-booting');
    } catch(_) {}
  }

  root.GPTPF_I18N = Object.freeze({
    getMessage,
    getCurrentLanguage,
    setLanguage,
    updateAllTranslations,
    initializeI18n
  });
})();
