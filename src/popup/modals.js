/*
 * ================================================================================
 * Multi-AI File Paster Chrome Extension | Production Release v1.1.0
 * ================================================================================
 *
 * MODULE: src/popup/modals.js
 * FUNCTION: Modal dialog management for popup interface
 * ARCHITECTURE: Accessible modal dialogs with focus management
 *
 * DEVELOPMENT TEAM:
 * • Lead Developer: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • Scrum Master: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 *
 * ORGANIZATION: WekTurbo Designs - Hostwek LTD | https://hostwek.com/wekturbo
 * REPOSITORY: https://github.com/JosephMatino/MultiAiFilePaster
 * TECHNICAL SUPPORT: wekturbo@hostwek.com
 *
 * PLATFORM INTEGRATIONS: Modal dialogs, accessibility, user interaction
 * CORE DEPENDENCIES: DOM manipulation, keyboard navigation, focus management
 *
 * Copyright (c) 2025 WekTurbo Designs - Hostwek LTD. All rights reserved.
 * Licensed under MIT License | https://opensource.org/licenses/MIT
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
    const cardEl = document.querySelector('.card');
    if (!clearModal) return;

    const scrollTop = cardEl?.scrollTop || 0;
    const cardHeight = cardEl?.clientHeight || 400;
    const centerOffset = scrollTop + (cardHeight / 2) - 120;
    clearModal.style.top = Math.max(scrollTop + 20, centerOffset) + 'px';
    clearModal.style.display = 'flex';

    if (cardEl) { 
      cardEl.prevCardOverflow = cardEl.style.overflow; 
      cardEl.style.overflow = 'hidden'; 
    }

    setTimeout(() => document.getElementById('confirmClear')?.focus(), 0);
  }

  function closeClearModal() {
    const clearModal = document.getElementById('clearDataModal');
    const cardEl = document.querySelector('.card');
    if (!clearModal) return;
    
    clearModal.style.display = 'none';
    if (cardEl) { 
      cardEl.style.overflow = cardEl.prevCardOverflow || 'auto'; 
    }
  }

  function initModals() {
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
        if (e.target === clearModal || e.target.classList.contains('modal-overlay')) {
          closeClearModal();
        }
      });

      if (confirmClear) {
        confirmClear.addEventListener('click', () => {
          chrome.storage.local.remove(['__analytics_data'], () => {
            closeClearModal();
            if (window.GPTPF_ANALYTICS) {
              window.GPTPF_ANALYTICS.loadAnalytics();
            }
            if (window.GPTPF_FLASH) {
              window.GPTPF_FLASH('Data cleared', 'success');
            }
          });
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
