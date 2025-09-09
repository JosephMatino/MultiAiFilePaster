/*
 * ================================================================================
 * Multi-AI File Paster Chrome Extension | Production Release v1.1.0
 * ================================================================================
 *
 * MODULE: src/popup/analytics.js
 * FUNCTION: Analytics dashboard and data visualization for popup interface
 * ARCHITECTURE: Data visualization with professional charts and breakdowns
 *
 * DEVELOPMENT TEAM:
 * • Lead Developer: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • Scrum Master: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 *
 * ORGANIZATION: WekTurbo Designs - Hostwek LTD | https://hostwek.com/wekturbo
 * REPOSITORY: https://github.com/JosephMatino/MultiAiFilePaster
 * TECHNICAL SUPPORT: wekturbo@hostwek.com
 *
 * PLATFORM INTEGRATIONS: Analytics visualization, data export, usage statistics
 * CORE DEPENDENCIES: Chrome storage APIs, SVG rendering, data aggregation
 *
 * Copyright (c) 2025 WekTurbo Designs - Hostwek LTD. All rights reserved.
 * Licensed under MIT License | https://opensource.org/licenses/MIT
 * ================================================================================
 */

(() => {
  let currentTimePeriod = '7';

  function showAnalyticsLoading() {
    const skeletons = ['totalFilesSkeleton', 'periodFilesSkeleton', 'activePlatformsSkeleton', 'platformBreakdownSkeleton', 'formatBreakdownSkeleton'];
    const content = ['totalFiles', 'periodFiles', 'activePlatforms', 'platformBreakdown', 'formatBreakdown'];

    skeletons.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'block';
    });

    content.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.parentElement) el.parentElement.style.opacity = '0.3';
    });

    const sparklineSkeleton = document.querySelector('.sparkline-skeleton');
    const sparklineContent = document.getElementById('trendSparkline');
    if (sparklineSkeleton) sparklineSkeleton.style.display = 'block';
    if (sparklineContent) sparklineContent.style.opacity = '0.3';
  }

  function hideAnalyticsLoading() {
    const skeletons = ['totalFilesSkeleton', 'periodFilesSkeleton', 'activePlatformsSkeleton', 'platformBreakdownSkeleton', 'formatBreakdownSkeleton'];
    const content = ['totalFiles', 'periodFiles', 'activePlatforms', 'platformBreakdown', 'formatBreakdown'];

    skeletons.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    content.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.parentElement) el.parentElement.style.opacity = '1';
    });

    const sparklineSkeleton = document.querySelector('.sparkline-skeleton');
    const sparklineContent = document.getElementById('trendSparkline');
    if (sparklineSkeleton) sparklineSkeleton.style.display = 'none';
    if (sparklineContent) sparklineContent.style.opacity = '1';
  }

  function loadAnalytics() {
    chrome.storage.local.get(['__analytics_data'], (result) => {
      const data = result.__analytics_data || {
        totalFiles: 0,
        platforms: {},
        formats: {},
        history: []
      };

      updateAnalyticsDisplay(data);
    });
  }

  function renderTrend(history) {
    const el = document.getElementById('trendSparkline');
    const label = document.getElementById('trendSummary');
    if (!el) return;

    try {
      const validHistory = Array.isArray(history) ? history : [];
      const now = Date.now();

      let days;
      if (currentTimePeriod === 'all') {
        days = 30;
      } else {
        const periodDays = parseInt(currentTimePeriod);
        days = Math.min(periodDays, 30);
      }

      const oneDayMs = 24 * 60 * 60 * 1000;

      const points = [];
      const cutoffTime = currentTimePeriod === 'all' ? 0 : (now - parseInt(currentTimePeriod) * oneDayMs);

      for (let i = days - 1; i >= 0; i--) {
        const dayStart = now - (i + 1) * oneDayMs;
        const dayEnd = now - i * oneDayMs;

        const count = validHistory.filter(h =>
          h && typeof h.timestamp === 'number' &&
          h.timestamp >= Math.max(dayStart, cutoffTime) &&
          h.timestamp < dayEnd
        ).length;

        points.push(Math.max(0, count));
      }

      const totalFiles = points.reduce((s,n) => s + n, 0);
      const actualDays = days;
      const avgPerDay = actualDays > 0 ? (totalFiles / actualDays) : 0;

      if (label) label.textContent = `${avgPerDay.toFixed(1)}/day avg`;

      const w = Math.max(100, Math.min(500, el.clientWidth || 280));
      const h = Math.max(30, Math.min(100, el.clientHeight || 48));
      const pad = 2;

      if (points.length === 0 || totalFiles === 0) {
        el.innerHTML = `<svg viewBox="0 0 ${w} ${h}"><text x="${w/2}" y="${h/2}" text-anchor="middle" class="sparkline-no-data" font-size="10">No data</text></svg>`;
        return;
      }

      const maxY = Math.max(1, Math.max(...points));
      const sx = (w - pad*2) / Math.max(1, points.length - 1);
      const sy = (h - pad*2) / maxY;

      const coords = points.map((y, i) => {
        const x = Math.max(0, Math.min(w, pad + i*sx));
        const yPos = Math.max(0, Math.min(h, h - pad - y*sy));
        return [x, yPos];
      });

      const linePath = coords.map((c,i) =>
        `${i ? 'L' : 'M'}${c[0].toFixed(1)},${c[1].toFixed(1)}`
      ).join(' ');

      const areaPath = `M${pad},${h-pad} ${linePath} L${coords[coords.length-1][0]},${h-pad} Z`;

      el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" class="sparkline-gradient-start" />
            <stop offset="100%" class="sparkline-gradient-end" />
          </linearGradient>
        </defs>
        <path class="area" d="${areaPath}" fill="url(#sparklineGradient)"></path>
        <path class="line" d="${linePath}"></path>
      </svg>`;
    } catch (error) {
      if (label) label.textContent = 'Chart error';
      el.innerHTML = '<div class="sparkline-error">Chart unavailable</div>';
    }
  }

  function updateAnalyticsDisplay(data) {
    chrome.storage.local.get(['telemetryEnabled'], (result) => {
      if (!result.telemetryEnabled) {
        const elements = ['totalFiles', 'periodFiles', 'activePlatforms', 'totalChange', 'periodChange', 'platformsChange'];
        elements.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.textContent = id.includes('Change') ? '—' : '0';
        });

        const platformContainer = document.getElementById('platformBreakdown');
        const formatContainer = document.getElementById('formatBreakdown');
        if (platformContainer) {
          platformContainer.innerHTML = '<div class="breakdown-item"><span class="item-name">No data yet</span><span class="item-count">—</span></div>';
        }
        if (formatContainer) {
          formatContainer.innerHTML = '<div class="breakdown-item"><span class="item-name">No data yet</span><span class="item-count">—</span></div>';
        }
        return;
      }

      const now = Date.now();
      const periodMs = currentTimePeriod === 'all' ? Infinity : parseInt(currentTimePeriod) * 24 * 60 * 60 * 1000;
      const cutoffTime = now - periodMs;

      const allHistory = data.history || [];
      let periodHistory;

      if (currentTimePeriod === 'all') {
        periodHistory = allHistory.length > 1000 ?
          allHistory.slice(-1000) : allHistory;
      } else {
        periodHistory = allHistory.filter(entry => entry.timestamp > cutoffTime);
      }

      const totalFiles = data.totalFiles || 0;
      const periodFiles = currentTimePeriod === 'all' ? totalFiles : periodHistory.length;

      const totalEl = document.getElementById('totalFiles');
      const periodEl = document.getElementById('periodFiles');
      const periodLabelEl = document.getElementById('periodLabel');

      if (totalEl) totalEl.textContent = totalFiles.toLocaleString();
      if (periodEl) periodEl.textContent = periodFiles.toLocaleString();

      const periodLabels = {
        '7': 'Last 7 Days',
        '30': 'Last 30 Days',
        '90': 'Last 90 Days',
        'all': 'All Time'
      };
      if (periodLabelEl) periodLabelEl.textContent = periodLabels[currentTimePeriod];

      const hasWindow = Number.isFinite(periodMs);
      let prevPeriodFiles = 0;
      let prevActivePlatforms = 0;
      if (hasWindow) {
        const prevStart = cutoffTime - periodMs;
        const prevEnd = cutoffTime;
        const prevHistory = (data.history || []).filter(e => e.timestamp > prevStart && e.timestamp <= prevEnd);
        prevPeriodFiles = prevHistory.length;
        prevActivePlatforms = Object.keys(prevHistory.reduce((acc, e) => { acc[e.platform] = (acc[e.platform] || 0) + 1; return acc; }, {})).length;
      }

      let totalChange, periodChange;

      if (currentTimePeriod === 'all') {
        totalChange = totalFiles > 0 ? `${totalFiles.toLocaleString()}` : '0';
        periodChange = '—';
      } else {
        totalChange = periodFiles > 0 ? `+${periodFiles}` : '0';
        const delta = periodFiles - prevPeriodFiles;
        periodChange = hasWindow ? (delta === 0 ? '0' : `${delta > 0 ? '+' : ''}${delta}`) : '—';
      }

      const totalChangeEl = document.getElementById('totalChange');
      const periodChangeEl = document.getElementById('periodChange');
      if (totalChangeEl) totalChangeEl.textContent = totalChange;
      if (periodChangeEl) periodChangeEl.textContent = periodChange;

      let currentActivePlatforms, platformsChange;

      if (currentTimePeriod === 'all') {
        currentActivePlatforms = Object.keys(data.platforms || {}).length;
        platformsChange = '—';
      } else {
        currentActivePlatforms = Object.keys(periodHistory.reduce((acc, e) => { acc[e.platform] = 1; return acc; }, {})).length;
        const platformsDelta = hasWindow ? (currentActivePlatforms - prevActivePlatforms) : 0;
        platformsChange = hasWindow ? `${platformsDelta >= 0 ? '+' : ''}${platformsDelta}` : '—';
      }

      const activePlatformsEl = document.getElementById('activePlatforms');
      const platformsChangeEl = document.getElementById('platformsChange');
      if (activePlatformsEl) activePlatformsEl.textContent = currentActivePlatforms;
      if (platformsChangeEl) platformsChangeEl.textContent = platformsChange;

      if (currentTimePeriod === 'all') {
        if (window.GPTPF_BREAKDOWNS) {
          window.GPTPF_BREAKDOWNS.updatePlatformBreakdownAllTime(data.platforms || {});
          window.GPTPF_BREAKDOWNS.updateFormatBreakdownAllTime(data.formats || {});
        }
      } else {
        if (window.GPTPF_BREAKDOWNS) {
          window.GPTPF_BREAKDOWNS.updatePlatformBreakdown(periodHistory);
          window.GPTPF_BREAKDOWNS.updateFormatBreakdown(periodHistory);
        }
      }

      const sparklineHistory = currentTimePeriod === 'all' ? (data.history || []) : periodHistory;
      renderTrend(sparklineHistory);
    });
  }

  window.GPTPF_ANALYTICS = {
    showAnalyticsLoading,
    hideAnalyticsLoading,
    loadAnalytics,
    updateAnalyticsDisplay,
    setTimePeriod: (period) => { currentTimePeriod = period; }
  };
})();
