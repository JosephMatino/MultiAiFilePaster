/*
 * ================================================================================
 * Multi-AI File Paster Chrome Extension | Production Release v1.1.0
 * ================================================================================
 *
 * MODULE: src/popup/breakdowns.js
 * FUNCTION: Platform and format breakdown visualization components
 * ARCHITECTURE: Data breakdown charts with professional styling
 *
 * DEVELOPMENT TEAM:
 * • Lead Developer: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • Scrum Master: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 *
 * ORGANIZATION: WekTurbo Designs - Hostwek LTD | https://hostwek.com/wekturbo
 * REPOSITORY: https://github.com/JosephMatino/MultiAiFilePaster
 * TECHNICAL SUPPORT: wekturbo@hostwek.com
 *
 * PLATFORM INTEGRATIONS: Data visualization, usage breakdowns, statistics
 * CORE DEPENDENCIES: DOM manipulation, data aggregation, chart rendering
 *
 * Copyright (c) 2025 WekTurbo Designs - Hostwek LTD. All rights reserved.
 * Licensed under MIT License | https://opensource.org/licenses/MIT
 * ================================================================================
 */

(() => {
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
        container.innerHTML = '<div class="breakdown-item"><span class="item-name">No data yet</span><span class="item-count">—</span></div>';
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

      container.querySelectorAll('.bar-fill').forEach(bar => {
        const width = bar.getAttribute('data-width');
        if (width) bar.style.width = width + '%';
      });
    } catch (error) {
      container.innerHTML = '<div class="breakdown-item"><span class="item-name">Error loading data</span><span class="item-count">—</span></div>';
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
        container.innerHTML = '<div class="breakdown-item"><span class="item-name">No data yet</span><span class="item-count">—</span></div>';
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

      container.querySelectorAll('.bar-fill').forEach(bar => {
        const width = bar.getAttribute('data-width');
        if (width) bar.style.width = width + '%';
      });
    } catch (error) {
      container.innerHTML = '<div class="breakdown-item"><span class="item-name">Error loading data</span><span class="item-count">—</span></div>';
    }
  }

  function updateFormatBreakdown(history) {
    const container = document.getElementById('formatBreakdown');
    if (!container) return;

    try {
      const validHistory = Array.isArray(history) ? history : [];

      if (validHistory.length === 0) {
        container.innerHTML = '<div class="breakdown-item"><span class="item-name">No data yet</span><span class="item-count">—</span></div>';
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
        container.innerHTML = '<div class="breakdown-item"><span class="item-name">No data yet</span><span class="item-count">—</span></div>';
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

      container.querySelectorAll('.bar-fill').forEach(bar => {
        const width = bar.getAttribute('data-width');
        if (width) bar.style.width = width + '%';
      });
    } catch (error) {
      container.innerHTML = '<div class="breakdown-item"><span class="item-name">Error loading data</span><span class="item-count">—</span></div>';
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
        container.innerHTML = '<div class="breakdown-item"><span class="item-name">No data yet</span><span class="item-count">—</span></div>';
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

      container.querySelectorAll('.bar-fill').forEach(bar => {
        const width = bar.getAttribute('data-width');
        if (width) bar.style.width = width + '%';
      });
    } catch (error) {
      container.innerHTML = '<div class="breakdown-item"><span class="item-name">Error loading data</span><span class="item-count">—</span></div>';
    }
  }

  window.GPTPF_BREAKDOWNS = {
    updatePlatformBreakdown,
    updatePlatformBreakdownAllTime,
    updateFormatBreakdown,
    updateFormatBreakdownAllTime
  };
})();
