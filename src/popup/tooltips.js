/*
 * ================================================================================
 * Multi-AI File Paster Chrome Extension | Production Release v1.1.0
 * ================================================================================
 *
 * MODULE: src/popup/tooltips.js
 * FUNCTION: Professional tooltip system with accessibility support
 * ARCHITECTURE: Dynamic tooltip positioning with keyboard navigation
 *
 * DEVELOPMENT TEAM:
 * • Lead Developer: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • Scrum Master: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 *
 * ORGANIZATION: WekTurbo Designs - Hostwek LTD | https://hostwek.com/wekturbo
 * REPOSITORY: https://github.com/JosephMatino/MultiAiFilePaster
 * TECHNICAL SUPPORT: wekturbo@hostwek.com
 *
 * PLATFORM INTEGRATIONS: UI tooltips, accessibility, user guidance
 * CORE DEPENDENCIES: DOM manipulation, event handling, positioning
 *
 * Copyright (c) 2025 WekTurbo Designs - Hostwek LTD. All rights reserved.
 * Licensed under MIT License | https://opensource.org/licenses/MIT
 * ================================================================================
 */

(() => {
  let activeTooltip = null;

  function showTooltip(button) {
    hideTooltip();

    const text = button.getAttribute('data-tip');
    if (!text) return;

    const tooltip = document.createElement('div');
    tooltip.className = 'professional-tooltip';
    tooltip.textContent = text;

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
  }

  function hideTooltip() {
    if (activeTooltip) {
      activeTooltip.tooltip.remove();
      activeTooltip.button.setAttribute('aria-expanded', 'false');
      activeTooltip = null;
    }
  }

  function initTooltips() {
    document.addEventListener('click', (e) => {
      const t = e.target;
      if (t && t.classList && t.classList.contains('help')){
        const hasTip = t.hasAttribute('data-tip');
        if (hasTip) {
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
      if (e.key === 'Escape') hideTooltip();
    });
  }

  window.GPTPF_TOOLTIPS = {
    showTooltip,
    hideTooltip,
    initTooltips
  };
})();
