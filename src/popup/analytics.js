/*
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: src/popup/analytics.js
 * FUNCTION: Analytics dashboard with usage statistics and data visualization
 * ARCHITECTURE: Chrome Extension popup analytics with animated charts
 * SECURITY: Client-side processing, zero data transmission, privacy-first
 * PERFORMANCE: Optimized animations, efficient data processing, lazy loading
 * COMPATIBILITY: Chrome 88+, Edge 88+, Opera 74+, responsive design
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
 * • PLATFORM INTEGRATIONS: Analytics dashboard, usage tracking, data visualization
 * • CORE DEPENDENCIES: Chrome Extension APIs, Chart animations, Data processing
 * • FEATURES: Usage analytics, time period filtering, animated statistics
 * • TESTING: Automated unit tests, integration tests, analytics validation
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
  let currentTimePeriod = '7';
  let currentChartType = 'bar';
  let isInViewport = false;
  function initChartSelector() {
    const chartSelector = document.getElementById('chartTypeSelector');
    if (chartSelector) {
      chartSelector.addEventListener('change', (e) => {
        currentChartType = e.target.value;
        const analyticsSection = document.getElementById('analyticsSection');
        if (analyticsSection && !analyticsSection.classList.contains('hidden')) {
          loadAnalytics();
        }
      });
    }
  }
  function animateNumber(element, targetValue, duration = 1200, startOverride = null) {
    if (!element) return;
    const startValue = (startOverride !== null)
        ? (parseInt(startOverride) || 0)
        : (parseInt(element.textContent.replace(/,/g, '')) || 0);
    const difference = targetValue - startValue;
    if (difference === 0) {
      element.textContent = targetValue.toLocaleString();
      return;
    }
    const startTime = performance.now();
    function updateNumber(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (difference * easeOutCubic));
      element.textContent = currentValue.toLocaleString();
      if (progress < 1 && isInViewport) {
        requestAnimationFrame(updateNumber);
      } else {
        element.textContent = targetValue.toLocaleString();
        try { element.classList.remove('count-anim'); } catch(_) {}
      }
    }
    try { element.classList.add('count-anim'); } catch(_) {}
    requestAnimationFrame(updateNumber);
  }
  function showAnalyticsLoading(clearingData = false) {
    const metrics = [
      { skeleton: 'totalFilesSkeleton', content: 'totalFiles' },
      { skeleton: 'periodFilesSkeleton', content: 'periodFiles' },
      { skeleton: 'activePlatformsSkeleton', content: 'activePlatforms' }
    ];
    metrics.forEach(({ skeleton, content }) => {
      const skeletonEl = document.getElementById(skeleton);
      const contentEl = document.getElementById(content);
      if (skeletonEl) {
        skeletonEl.classList.remove('hidden');
        if (clearingData) {
          const existingText = skeletonEl.querySelector('.clearing-text');
          if (!existingText) {
            const clearingText = document.createElement('div');
            clearingText.className = 'clearing-text';
            clearingText.textContent = window.GPTPF_I18N.getMessage('analytics_clearing_data');
            skeletonEl.classList.add('relative-position');
            skeletonEl.appendChild(clearingText);
          }
        }
      }
      if (contentEl?.parentElement) {
        contentEl.parentElement.classList.add('loading-state');
      }
    });
    const breakdownElements = ['platformBreakdown', 'formatBreakdown'];
    breakdownElements.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.add('loading-state');
        if (clearingData) {
          el.style.position = 'relative';
          el.innerHTML = `<div class="clearing-text">${window.GPTPF_I18N.getMessage('analytics_clearing_data')}</div>`;
        }
      }
    });
    const sparklineContent = document.getElementById('trendSparkline');
    if (sparklineContent) {
      sparklineContent.classList.add('loading-state');
      if (clearingData) {
        let clearingOverlay = document.getElementById('clearingOverlay');
        if (!clearingOverlay) {
          clearingOverlay = document.createElement('div');
          clearingOverlay.id = 'clearingOverlay';
          clearingOverlay.className = 'clearing-text';
          document.body.appendChild(clearingOverlay);
        }
        clearingOverlay.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinner-icon">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
          ${window.GPTPF_I18N.getMessage('analytics_clearing_data')}
        `;
        clearingOverlay.style.display = 'flex';
      }
    }
  }
  function hideAnalyticsLoading() {
    const skeletons = ['totalFilesSkeleton', 'periodFilesSkeleton', 'activePlatformsSkeleton', 'platformBreakdownSkeleton', 'formatBreakdownSkeleton'];
    const content = ['totalFiles', 'periodFiles', 'activePlatforms', 'platformBreakdown', 'formatBreakdown'];
    skeletons.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.add('hidden');
        const clearingText = el.querySelector('.clearing-text');
        if (clearingText) {
          clearingText.remove();
        }
      }
    });
    content.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('loading-state');
        if (el.parentElement) el.parentElement.classList.remove('loading-state');
      }
    });
    const sparklineSkeleton = document.querySelector('.sparkline-skeleton');
    const sparklineContent = document.getElementById('trendSparkline');
    if (sparklineSkeleton) sparklineSkeleton.classList.add('hidden');
    if (sparklineContent) sparklineContent.classList.remove('loading-state');
    const clearingOverlay = document.getElementById('clearingOverlay');
    if (clearingOverlay) clearingOverlay.style.display = 'none';
  }
  function loadAnalytics() {
    const analyticsSection = document.getElementById('analyticsSection');
    if (!analyticsSection || analyticsSection.classList.contains('hidden')) {
      return;
    }
    showAnalyticsLoading();
    setTimeout(() => {
      chrome.storage.local.get(['__analytics_data'], (result) => {
        const data = result.__analytics_data ? result.__analytics_data : {
          totalFiles: 0,
          platforms: {},
          formats: {},
          history: []
        };
        updateAnalyticsDisplay(data);
        hideAnalyticsLoading();
      });
    }, 300);
  }
  function setupViewportLoading() {
    const analyticsSection = document.getElementById('analyticsSection');
    if (!analyticsSection) return;
    const resetAnalyticsView = () => {
      const ids = ['totalFiles','periodFiles','activePlatforms'];
      ids.forEach(id=>{ const el=document.getElementById(id); if(el){ el.textContent='0'; el.classList.remove('count-anim'); }});
      ['totalChange','periodChange','platformsChange'].forEach(id=>{ const el=document.getElementById(id); if(el){ el.textContent='—'; }});
      ['platformBreakdown','formatBreakdown'].forEach(id=>{
        const box=document.getElementById(id);
        if(box){
          box.querySelectorAll('.bar-fill').forEach(b=> b.style.width='0%');
          box.querySelectorAll('.item-count').forEach(c=> c.textContent='0');
        }
      });
      const sparklineSk = document.querySelector('.sparkline-skeleton');
      const sparkline = document.getElementById('trendSparkline');
      const label = document.getElementById('trendSummary');
      if (label) label.textContent = '—';
      if (sparkline) sparkline.innerHTML = '';
      if (sparklineSk) sparklineSk.classList.remove('hidden');
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          isInViewport = true;
          window.__GPTPF_RESET_NUMBERS = true;
          loadAnalytics();
        } else {
          isInViewport = false;
          resetAnalyticsView();
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px'
    });
    observer.observe(analyticsSection);
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
      for (let i = 0; i < days; i++) {
        const dayStart = now - (days - i) * oneDayMs;
        const dayEnd = now - (days - i - 1) * oneDayMs;
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
        el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" class="sparkline-empty">
          <defs>
            <linearGradient id="emptyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="hsl(var(--text-weak))" stop-opacity="0.1"/>
              <stop offset="50%" stop-color="hsl(var(--text-weak))" stop-opacity="0.05"/>
              <stop offset="100%" stop-color="hsl(var(--text-weak))" stop-opacity="0.1"/>
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#emptyGradient)" rx="2"/>
          <text x="${w/2}" y="${h/2}" text-anchor="middle" class="sparkline-no-data" font-size="10" dy="0.35em">${window.GPTPF_I18N.getMessage('analytics_no_data')}</text>
        </svg>`;
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
      if (currentChartType === 'bar') {
        const chartWidth = w - pad * 2;
        const barSpacing = 4;
        const spacePerBar = chartWidth / points.length;
        const barWidth = Math.max(8, spacePerBar - barSpacing);
        const maxValue = Math.max(...points, 1);
        const bars = points.map((value, i) => {
          const x = pad + (i * spacePerBar) + (barSpacing / 2);
          const barHeight = Math.max(4, (value / maxValue) * (h - pad * 2));
          const y = h - pad - barHeight;
          return `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}"
                    class="sparkline-bar" rx="3" data-value="${value}" data-day="${days - i}">
                  </rect>`;
        }).join('');
        el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" class="sparkline-chart">
          <defs>
            <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" class="sparkline-gradient-start" />
              <stop offset="100%" class="sparkline-gradient-end" />
            </linearGradient>
            <filter id="barGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          ${bars}
        </svg>`;
        setTimeout(() => {
          const barElements = el.querySelectorAll('.sparkline-bar');
          barElements.forEach((bar, i) => {
            const value = points[i];
            const day = days - i;
            bar.addEventListener('mouseover', (e) => showBarTooltip(e, value, day));
            bar.addEventListener('mouseout', hideBarTooltip);
          });
        }, 10);
        window.showBarTooltip = (event, value, day) => {
          let tooltip = document.getElementById('barTooltip');
          if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'barTooltip';
            tooltip.className = 'bar-tooltip';
            document.body.appendChild(tooltip);
          }
          const dayLabel = day === 1 ? window.GPTPF_I18N.getMessage('analytics_today') :
                           day === 2 ? window.GPTPF_I18N.getMessage('analytics_yesterday') :
                           window.GPTPF_I18N.getMessage('analytics_days_ago', [day]);
          tooltip.innerHTML = `
            <div class="tooltip-content">
              <div class="tooltip-value">${value}</div>
              <div class="tooltip-label">${window.GPTPF_I18N.getMessage('analytics_files_label')}</div>
              <div class="tooltip-day">${dayLabel}</div>
            </div>`;
          tooltip.style.display = 'block';
          const tooltipRect = tooltip.getBoundingClientRect();
          const leftPos = event.pageX - tooltipRect.width - 10;
          const rightPos = event.pageX + 10;
          tooltip.style.left = (leftPos > 0 ? leftPos : rightPos) + 'px';
          tooltip.style.top = (event.pageY - 50) + 'px';
        };
        window.hideBarTooltip = () => {
          const tooltip = document.getElementById('barTooltip');
          if (tooltip) tooltip.style.display = 'none';
        };
      } else {
        const areaPath = `M${pad},${h-pad} ${linePath} L${coords[coords.length-1][0]},${h-pad} Z`;
        const dataPoints = coords.map(([x, y], i) =>
          `<circle cx="${x}" cy="${y}" r="2.5" class="sparkline-point" data-value="${points[i]}" data-day="${days - i}"/>`
        ).join('');
        el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" class="sparkline-chart">
          <defs>
            <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" class="sparkline-gradient-start" />
              <stop offset="100%" class="sparkline-gradient-end" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path class="sparkline-area" d="${areaPath}" fill="url(#sparklineGradient)"/>
          <path class="sparkline-line" d="${linePath}" filter="url(#glow)"/>
          ${dataPoints}
        </svg>`;
        setTimeout(() => {
          const pointElements = el.querySelectorAll('.sparkline-point');
          pointElements.forEach((point, i) => {
            const value = points[i];
            const day = days - i;
            point.addEventListener('mouseover', (e) => showLineTooltip(e, value, day));
            point.addEventListener('mouseout', hideLineTooltip);
          });
        }, 10);
        window.showLineTooltip = (event, value, day) => {
          let tooltip = document.getElementById('lineTooltip');
          if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'lineTooltip';
            tooltip.className = 'bar-tooltip';
            document.body.appendChild(tooltip);
          }
          const dayLabel = day === 1 ? window.GPTPF_I18N.getMessage('analytics_today') :
                           day === 2 ? window.GPTPF_I18N.getMessage('analytics_yesterday') :
                           window.GPTPF_I18N.getMessage('analytics_days_ago', [day]);
          tooltip.innerHTML = `
            <div class="tooltip-content">
              <div class="tooltip-value">${value}</div>
              <div class="tooltip-label">${window.GPTPF_I18N.getMessage('analytics_files_label')}</div>
              <div class="tooltip-day">${dayLabel}</div>
            </div>`;
          tooltip.style.display = 'block';
          const tooltipRect = tooltip.getBoundingClientRect();
          const leftPos = event.pageX - tooltipRect.width - 10;
          const rightPos = event.pageX + 10;
          tooltip.style.left = (leftPos > 0 ? leftPos : rightPos) + 'px';
          tooltip.style.top = (event.pageY - 50) + 'px';
        };
        window.hideLineTooltip = () => {
          const tooltip = document.getElementById('lineTooltip');
          if (tooltip) tooltip.style.display = 'none';
        };
      }
    } catch (error) {
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG?.error('console_platform_handler_error', error);
      }
      if (label) label.textContent = window.GPTPF_I18N.getMessage('analytics_chart_error');
      el.innerHTML = `<div class="sparkline-error">${window.GPTPF_I18N.getMessage('analytics_chart_unavailable')}</div>`;
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
          platformContainer.innerHTML = `<div class="breakdown-item"><span class="item-name">${window.GPTPF_I18N.getMessage('no_data_yet')}</span><span class="item-count">—</span></div>`;
        }
        if (formatContainer) {
          formatContainer.innerHTML = `<div class="breakdown-item"><span class="item-name">${window.GPTPF_I18N.getMessage('no_data_yet')}</span><span class="item-count">—</span></div>`;
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
      const startOverride = (window.__GPTPF_RESET_NUMBERS ? 0 : null);
      if (totalEl) animateNumber(totalEl, totalFiles, 1200, startOverride);
      if (periodEl) animateNumber(periodEl, periodFiles, 1200, startOverride);
      const periodLabels = {
        '7': window.GPTPF_I18N.getMessage('analytics_last_7_days'),
        '30': window.GPTPF_I18N.getMessage('analytics_last_30_days'),
        '90': window.GPTPF_I18N.getMessage('analytics_last_90_days'),
        'all': window.GPTPF_I18N.getMessage('analytics_all_time')
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
      const startOverride2 = (window.__GPTPF_RESET_NUMBERS ? 0 : null);
      if (activePlatformsEl) animateNumber(activePlatformsEl, currentActivePlatforms, 1200, startOverride2);
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
  function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    const updateThemeToggle = (isDark) => {
      themeToggle.className = `theme-toggle ${isDark ? 'dark' : 'light'}`;
    };
    const getDefaultTheme = () => {
      if (window.GPTPF_CONFIG && window.GPTPF_CONFIG.DEFAULTS && window.GPTPF_CONFIG.DEFAULTS.defaultTheme) {
        return window.GPTPF_CONFIG.DEFAULTS.defaultTheme;
      }
      return 'dark';
    };
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme = getDefaultTheme();
    const isDark = savedTheme ? savedTheme === 'dark' : (defaultTheme === 'dark' || prefersDark);
    updateThemeToggle(isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeToggle(newTheme === 'dark');
    });
  }
  function applyModelTheming() {
    if (!window.GPTPF_CONFIG || !window.GPTPF_CONFIG.PLATFORM_COLORS) return;
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (!tabs[0]) return;
      const url = tabs[0].url;
      let currentPlatform = 'chatgpt';
      if (url.includes('claude.ai')) currentPlatform = 'claude';
      else if (url.includes('gemini.google.com')) currentPlatform = 'gemini';
      else if (url.includes('chat.deepseek.com')) currentPlatform = 'deepseek';
      else if (url.includes('grok.com')) currentPlatform = 'grok';
      const colors = window.GPTPF_CONFIG.PLATFORM_COLORS[currentPlatform];
      if (colors) {
        const root = document.documentElement;
        root.style.setProperty('--brand', colors.primary);
        root.style.setProperty('--brand-weak', colors.secondary);
        root.style.setProperty('--brand-strong', colors.accent);
        root.setAttribute('data-platform', currentPlatform);
      }
    });
  }
  function initPeriodSelector() {
    const timeSelect = document.getElementById('timeSelect');
    if (!timeSelect) return;
    timeSelect.addEventListener('change', (e) => {
      const period = e.target.value;
      currentTimePeriod = period;
      const periodLabels = {
        '7': window.GPTPF_I18N.getMessage('analytics_last_7_days'),
        '30': window.GPTPF_I18N.getMessage('analytics_last_30_days'),
        '90': window.GPTPF_I18N.getMessage('analytics_last_90_days'),
        'all': window.GPTPF_I18N.getMessage('analytics_all_time')
      };
      const selectedLabel = periodLabels[period] || period;
      if (typeof window.flash === 'function') {
        window.flash(window.GPTPF_I18N.getMessage('analytics_analytics_updated', [selectedLabel]), 'info');
      }
      window.__GPTPF_RESET_NUMBERS = true;
      showAnalyticsLoading();
      timeSelect.classList.add('loading-select');
      timeSelect.disabled = true;
      setTimeout(() => {
        chrome.storage.local.get(['__analytics_data'], (result) => {
          const data = result.__analytics_data ? result.__analytics_data : {
            totalFiles: 0,
            platforms: {},
            formats: {},
            history: []
          };
          updateAnalyticsDisplay(data);
          hideAnalyticsLoading();
          timeSelect.classList.remove('loading-select');
          timeSelect.disabled = false;
          window.__GPTPF_RESET_NUMBERS = false;
        });
      }, 400);
    });
  }
  window.GPTPF_ANALYTICS = {
    showAnalyticsLoading,
    hideAnalyticsLoading,
    loadAnalytics,
    updateAnalyticsDisplay,
    setupViewportLoading,
    initThemeToggle,
    initPeriodSelector,
    initChartSelector,
    applyModelTheming,
    setTimePeriod: (period) => { currentTimePeriod = period; }
  };
  window.addEventListener('beforeunload', () => {
    if (window.GPTPF_DEBUG) {
      window.GPTPF_DEBUG.info('analytics_cleanup', window.GPTPF_I18N.getMessage('analytics_cleanup_complete'));
    }
  });
})();