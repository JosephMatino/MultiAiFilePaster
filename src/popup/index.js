/*
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: src/popup/index.js
 * FUNCTION: Main popup interface controller and settings management
 * ARCHITECTURE: Chrome Extension Manifest V3, modular event-driven design
 * SECURITY: Client-side processing, zero data transmission, privacy-first
 * PERFORMANCE: Optimized for Chrome V3 Manifest, lazy loading, efficient DOM
 * COMPATIBILITY: Chrome 88+, Edge 88+, Opera 74+, modern browser APIs
 * RELIABILITY: Production error handling, graceful degradation, stable operation
 *
 * DEVELOPMENT TEAM & PROJECT LEADERSHIP:
 * • LEAD DEVELOPER: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • SCRUM MASTER & PROJECT FUNDING: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 * • QUALITY ASSURANCE: Automated testing pipeline with CircleCI integration
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
 * TECHNICAL ARCHITECTURE & INTEGRATIONS:
 * • PLATFORM INTEGRATIONS: Popup UI layer interacting with shared systems
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
  const $ = sel => document.querySelector(sel);

  let morePage = 0;
  let extendedPages = [
    ['ts','java','cs','cpp','c','go','rs'],
    ['rb','css','php','xml','sql','csv','sh','custom']
  ];

  function renderMore(pageIndex, selected) {
    const moreFormats = document.getElementById('moreFormats');
    if (!moreFormats) return;

    const opts = [];
    opts.push({v:'back', t: window.GPTPF_MESSAGES.getMessage('FILE_FORMAT', 'BACK_TO_MAIN')});

    extendedPages[pageIndex].forEach(v => {
      opts.push({v, t: v === 'custom' ? window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'CUSTOM_FORMAT_LABEL') : `.${v}`});
    });

    if (pageIndex > 0) opts.push({v:'prev', t: window.GPTPF_MESSAGES.getMessage('FILE_FORMAT', 'PREVIOUS_PAGE')});
    if (pageIndex < extendedPages.length - 1) opts.push({v:'next', t: window.GPTPF_MESSAGES.getMessage('FILE_FORMAT', 'NEXT_PAGE')});

    moreFormats.innerHTML = opts.map(o => `<option value="${o.v}">${o.t}</option>`).join('');

    if (selected && extendedPages[pageIndex].includes(selected)) {
      moreFormats.value = selected;
    } else {
      moreFormats.selectedIndex = -1;
    }
  }

  const flash = (msg, type = 'info') => {
    const sr = document.getElementById('gptpf-flash');
    if (sr) {
      sr.textContent = msg;
      const timings = window.GPTPF_CONFIG?.UI_TIMINGS;
      setTimeout(() => { if (sr.textContent === msg) sr.textContent = ''; }, timings.flashTimeout);
    }

    try {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs && tabs[0];
        const u = tab?.url;
        const map = window.GPTPF_CONFIG?.PLATFORM_DOMAINS;
        const list = Object.values(map).reduce((a,b)=>a.concat(b), []);
        let host = '';
        try { host = new URL(u).hostname; } catch(err) { void err; }
        const onChat = list.some(d => host.includes(d));
        if (tab && onChat && chrome?.tabs?.sendMessage) {
          chrome.tabs.sendMessage(tab.id, { type: 'SHOW_TOAST', message: msg, level: type }, () => {
            if (chrome.runtime.lastError && sr) {
              sr.textContent = `${type.toUpperCase()}: ${msg}`;
            }
          });
        } else if (sr) {
          sr.textContent = `${type.toUpperCase()}: ${msg}`;
        }
      });
    } catch(e) {
      if (sr) sr.textContent = `${type.toUpperCase()}: ${msg}`;
    }
  };

  window.GPTPF_FLASH = flash;

  let __saveBatchTimer = 0;
  let __savePending = false;
  const saveSetting = (key, val, oldSettings = {}) => {
    __savePending = true;
    if (!__saveBatchTimer) {
      const savingMsg = window.GPTPF_MESSAGES.getMessage('SETTINGS', 'SAVING');
      flash(savingMsg, 'info');
    }
    clearTimeout(__saveBatchTimer);

    chrome.storage.local.set({ [key]: val }, () => {
      __saveBatchTimer = setTimeout(() => {
        if (__savePending) {
          const successMsg = window.GPTPF_MESSAGES.getSettingMessage(key, val, oldSettings);
          flash(successMsg, 'success');
        }
        __savePending = false;
        __saveBatchTimer = 0;
      }, window.GPTPF_CONFIG?.UI_TIMINGS?.settingsSaveDelay);
    });
  };

  function updateBatchDelayState(useDelay) {
    const delaySlider = $('#processingDelaySlider');
    const delayValue = $('#processingDelayValue');

    if (delaySlider) {
      delaySlider.disabled = useDelay;
      delaySlider.className = useDelay ? 'disabled-state' : 'enabled-state';
    }

    if (delayValue) {
      delayValue.className = useDelay ? 'disabled-state' : 'enabled-state';
    }
  }



  function updateCompressionControlsState() {
    chrome.storage.local.get(['batchMode', 'enableCompression'], (result) => {
      const batchMode = result.batchMode;
      const enableCompression = result.enableCompression;

      const compressionToggle = $('#compressionToggle');
      const compressionLabel = compressionToggle?.closest('.row')?.querySelector('.label');
      const compressionHelp = compressionToggle?.closest('.row')?.querySelector('.help');

      const batchCompressionToggle = $('#batchCompressionToggle');
      const batchCompressionLabel = batchCompressionToggle?.closest('.row')?.querySelector('.label');

      // Fixed logic: Main compression is only disabled when batch mode is active
      // When batch mode is off, batchCompression state should not affect main compression
      const shouldDisableMainCompression = batchMode;
      const shouldDisableBatchCompression = enableCompression;

      if (compressionToggle) {
        compressionToggle.disabled = shouldDisableMainCompression;
        compressionToggle.closest('.switch').className = shouldDisableMainCompression ? 'switch disabled-state' : 'switch enabled-state';
      }

      if (compressionLabel) {
        compressionLabel.className = shouldDisableMainCompression ? 'label disabled-state' : 'label enabled-state';

        const existingBadge = compressionLabel.querySelector('.batch-disabled-badge');
        if (shouldDisableMainCompression && !existingBadge) {
          const badge = document.createElement('span');
          badge.className = 'batch-disabled-badge';
          badge.textContent = window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'BATCH_ACTIVE_BADGE');
          compressionLabel.appendChild(badge);
        } else if (!shouldDisableMainCompression && existingBadge) {
          existingBadge.remove();
        }
      }

      if (compressionHelp) {
        const originalTip = compressionHelp.getAttribute('data-original-tip') || compressionHelp.getAttribute('data-tip');
        if (!compressionHelp.getAttribute('data-original-tip') && originalTip) {
          compressionHelp.setAttribute('data-original-tip', originalTip);
        }

        if (shouldDisableMainCompression) {
          compressionHelp.setAttribute('data-tip', window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'BATCH_ACTIVE_TIP'));
        } else if (originalTip) {
          compressionHelp.setAttribute('data-tip', originalTip);
        }
      }

      if (batchCompressionToggle) {
        batchCompressionToggle.disabled = shouldDisableBatchCompression;
        batchCompressionToggle.closest('.switch').className = shouldDisableBatchCompression ? 'switch disabled-state' : 'switch enabled-state';
      }

      if (batchCompressionLabel) {
        batchCompressionLabel.className = shouldDisableBatchCompression ? 'label disabled-state' : 'label enabled-state';
        batchCompressionLabel.title = shouldDisableBatchCompression ? window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'DISABLED_COMPRESSION_TOOLTIP') : '';
      }
    });
  }

  function updateMainDelayState(batchMode) {
    const delayToggle = $('#delayToggle');
    const delayLabel = delayToggle?.closest('.row')?.querySelector('.label');
    const helpButton = delayToggle?.closest('.row')?.querySelector('.help');

    if (delayToggle) {
      delayToggle.disabled = batchMode;
      delayToggle.closest('.switch').className = batchMode ? 'switch disabled-state' : 'switch enabled-state';
    }

    if (delayLabel) {
      delayLabel.className = batchMode ? 'label disabled-state' : 'label enabled-state';

      const existingBadge = delayLabel.querySelector('.batch-disabled-badge');
      if (batchMode && !existingBadge) {
        const badge = document.createElement('span');
        badge.className = 'batch-disabled-badge';
        badge.textContent = window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'BATCH_ACTIVE_BADGE');
        delayLabel.appendChild(badge);
      } else if (!batchMode && existingBadge) {
        existingBadge.remove();
      }
    }

    if (helpButton) {
      const originalTip = helpButton.getAttribute('data-original-tip') || helpButton.getAttribute('data-tip');
      if (!helpButton.getAttribute('data-original-tip')) {
        helpButton.setAttribute('data-original-tip', originalTip);
      }

      if (batchMode) {
        helpButton.setAttribute('data-tip', window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'BATCH_DELAY_TIP'));
      } else {
        helpButton.setAttribute('data-tip', originalTip);
      }
    }
  }

  function updateAutoAttachState(batchMode) {
    const attachToggle = $('#attachToggle');
    const attachLabel = attachToggle?.closest('.row')?.querySelector('.label');
    const helpButton = attachToggle?.closest('.row')?.querySelector('.help');

    if (attachToggle) {
      attachToggle.disabled = batchMode;
      attachToggle.closest('.switch').className = batchMode ? 'switch disabled-state' : 'switch enabled-state';
    }

    if (attachLabel) {
      attachLabel.className = batchMode ? 'label disabled-state' : 'label enabled-state';

      const existingBadge = attachLabel.querySelector('.batch-disabled-badge');
      if (batchMode && !existingBadge) {
        const badge = document.createElement('span');
        badge.className = 'batch-disabled-badge';
        badge.textContent = window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'BATCH_ACTIVE_BADGE');
        attachLabel.appendChild(badge);
      } else if (!batchMode && existingBadge) {
        existingBadge.remove();
      }
    }

    if (helpButton) {
      const originalTip = helpButton.getAttribute('data-original-tip') || helpButton.getAttribute('data-tip');
      if (!helpButton.getAttribute('data-original-tip') && originalTip) {
        helpButton.setAttribute('data-original-tip', originalTip);
      }

      if (batchMode) {
        helpButton.setAttribute('data-tip', window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'BATCH_AUTO_ATTACH_TIP'));
      } else if (originalTip) {
        helpButton.setAttribute('data-tip', originalTip);
      }
    }
  }

  function initializeSettings() {
    GPTPF_CONFIG.getConfig(() => {
      chrome.storage.local.get([
        'wordLimit', 'useDelay', 'delaySeconds', 'fileFormat', 'batchMode', 'maxBatchFiles', 'batchProcessingDelay', 'batchCompression', 'telemetryEnabled', 'showDebug', 'autoAttachEnabled', 'claudeOverride'
      ], res => {
        const defaults = window.GPTPF_CONFIG?.DEFAULTS;
        const wordLimitEl = $('#wordLimit');
        const delayToggleEl = $('#delayToggle');
        const delaySecondsEl = $('#delaySeconds');

        if (wordLimitEl) wordLimitEl.value = res.wordLimit;
        if (delayToggleEl) delayToggleEl.checked = res.useDelay;
        const delayWrap = document.getElementById('delaySecondsWrap');
        if (delayWrap) delayWrap.hidden = !res.useDelay;
        if (delaySecondsEl) delaySecondsEl.value = res.delaySeconds;
        
        const fileFormat = res.fileFormat;
        const customInput = document.getElementById('customFormat');
        const moreFormats = document.getElementById('moreFormats');
        const mainFormats = ['auto', 'txt', 'js', 'py', 'html', 'json', 'md'];
        const inAnyExtended = (v) => extendedPages.some(p => p.includes(v));
        const customInputRow = document.getElementById('customInputRow');

        if (fileFormat.startsWith('.') && ![...mainFormats].includes(fileFormat)) {
          const clean = fileFormat.replace(/^\./,'');
          if (inAnyExtended(clean)) {
            morePage = extendedPages.findIndex(p => p.includes(clean));
            $('#formatSelect').classList.add('hidden');
            moreFormats.classList.remove('hidden');
            if (customInputRow) customInputRow.classList.add('hidden');
            renderMore(morePage, clean);
          } else {
            $('#formatSelect').classList.add('hidden');
            moreFormats.classList.remove('hidden');
            renderMore(extendedPages.length-1);
            moreFormats.value = 'custom';
            customInput.value = clean;
            if (customInputRow) customInputRow.classList.remove('hidden');
          }
        } else if (inAnyExtended(fileFormat)) {
          morePage = extendedPages.findIndex(p => p.includes(fileFormat));
          $('#formatSelect').classList.add('hidden');
          moreFormats.classList.remove('hidden');
          if (customInputRow) customInputRow.classList.add('hidden');
          renderMore(morePage, fileFormat);
        } else {
          $('#formatSelect').value = fileFormat;
          moreFormats.classList.add('hidden');
          if (customInputRow) customInputRow.classList.add('hidden');
        }
        
        const telemetryToggleEl = $('#telemetryToggle');
        const batchToggleEl = $('#batchToggle');

        if (telemetryToggleEl) telemetryToggleEl.checked = res.telemetryEnabled !== false;
        if (batchToggleEl) batchToggleEl.checked = !!res.batchMode;
        const batchOptions = document.getElementById('batchOptions');
        if (batchOptions) {
          if (res.batchMode) {
            batchOptions.classList.remove('hidden');
          } else {
            batchOptions.classList.add('hidden');
          }
        }

        const maxFiles = res.maxBatchFiles ?? (defaults.maxBatchFiles ?? 3);
        const delay = res.batchProcessingDelay ?? (defaults.batchProcessingDelay ?? 500);
        $('#maxFilesSlider').value = maxFiles;
        $('#maxFilesValue').textContent = maxFiles;
        $('#processingDelaySlider').value = delay;
        $('#processingDelayValue').textContent = `${delay}ms`;
        const batchCompressionToggleEl = $('#batchCompressionToggle');
        const compressionToggleEl = $('#compressionToggle');

        if (batchCompressionToggleEl) batchCompressionToggleEl.checked = res.batchCompression ?? (defaults.batchCompression ?? false);

        updateBatchDelayState(res.useDelay ?? (defaults.useDelay ?? false));
        updateCompressionControlsState();
        updateMainDelayState(res.batchMode ?? (defaults.batchMode ?? false));
        updateAutoAttachState(res.batchMode ?? (defaults.batchMode ?? false));
        if (compressionToggleEl) compressionToggleEl.checked = !!res.enableCompression;
        $('#compressionThreshold').value = res.compressionThreshold ?? 1024;
        $('#compressionThresholdWrap').hidden = !res.enableCompression;
        if (res.showDebug) {
          $('#debugRow').classList.remove('hidden');
        } else {
          $('#debugRow').classList.add('hidden');
        }
        const attachToggleEl = $('#attachToggle');
        const claudeOverrideToggleEl = $('#claudeOverrideToggle');

        if (attachToggleEl) attachToggleEl.checked = res.autoAttachEnabled !== false;
        if (claudeOverrideToggleEl) claudeOverrideToggleEl.checked = res.claudeOverride !== false;

        const analyticsSection = document.getElementById('analyticsSection');
        if (analyticsSection) {
          const telemetryEnabled = res.telemetryEnabled !== false;
          if (telemetryEnabled) {
            analyticsSection.classList.remove('hidden');
          } else {
            analyticsSection.classList.add('hidden');
          }
          if (telemetryEnabled && window.GPTPF_ANALYTICS) {
            window.GPTPF_ANALYTICS.showAnalyticsLoading();
            setTimeout(() => {
              window.GPTPF_ANALYTICS.loadAnalytics();
              window.GPTPF_ANALYTICS.hideAnalyticsLoading();
            }, window.GPTPF_CONFIG?.UI_TIMINGS?.analyticsLoadDelay ?? 200);
          }
        }

        initializePlatformDetection();
        initializeLinks();
      });
    });
  }

  let detectedModelName = window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'AI_MODEL_DEFAULT');

  function updateStatusIndicator(isOnPlatform = null) {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = statusIndicator?.querySelector('.status-text');
    const statusPulse = statusIndicator?.querySelector('.status-pulse');

    if (!statusIndicator || !statusText || !statusPulse) return;

    if (isOnPlatform === null) {
      chrome.runtime.sendMessage({ type: 'IS_ACTIVE_AI_PLATFORM' }, r => {
        updateStatusIndicator(!!r?.isChatGPT);
      });
      return;
    }

    if (!isOnPlatform) {
      statusIndicator.hidden = true;
      return;
    }

    const autoAttachEnabled = document.getElementById('attachToggle')?.checked;
    const currentModel = detectedModelName || window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'AI_MODEL_DEFAULT');

    if (autoAttachEnabled) {
      statusText.textContent = window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'CONNECTED_TO').replace('$MODEL$', currentModel);
      statusIndicator.className = 'status-indicator status-connected';
      statusPulse.className = 'status-pulse pulse-connected';
    } else {
      statusText.textContent = window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'STOPPED_ON').replace('$MODEL$', currentModel);
      statusIndicator.className = 'status-indicator status-stopped';
      statusPulse.className = 'status-pulse pulse-stopped';
    }

    statusIndicator.hidden = false;
  }

  function initializePlatformDetection() {
    chrome.runtime.sendMessage({ type: 'IS_ACTIVE_AI_PLATFORM' }, r => {
      const isChat = !!r?.isChatGPT;
      const banner = document.getElementById('ctxBanner');
      const statusIndicator = document.getElementById('statusIndicator');
      const currentModel = document.getElementById('currentModel');
      const saveBtn = document.getElementById('saveNow');
      const card = document.querySelector('.card');
      const claudeRow = document.getElementById('claudeRow');

      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs && tabs[0];
        const url = tab?.url;
        let isOnClaude = false;
        try {
          const host = new URL(url).hostname;
          const list = window.GPTPF_CONFIG?.PLATFORM_DOMAINS?.claude;
          isOnClaude = list?.some(d => host.includes(d));
        } catch(err) { void err; }
        if (claudeRow) claudeRow.hidden = !isOnClaude;

        if (isChat && statusIndicator && currentModel) {
          let modelName = window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'AI_MODEL_DEFAULT');
          try {
            const host = new URL(url).hostname;
            const pd = window.GPTPF_CONFIG?.PLATFORM_DOMAINS;
            if (pd.chatgpt?.some(d=>host.includes(d))) modelName = 'ChatGPT';
            else if (pd.claude?.some(d=>host.includes(d))) modelName = 'Claude';
            else if (pd.gemini?.some(d=>host.includes(d))) modelName = 'Gemini';
            else if (pd.deepseek?.some(d=>host.includes(d))) modelName = 'DeepSeek';
            else if (pd.grok?.some(d=>host.includes(d))) modelName = 'Grok';
          } catch(err) { void err; }

          detectedModelName = modelName;
          currentModel.textContent = modelName;
          updateStatusIndicator(true);
        } else if (statusIndicator) {
          statusIndicator.hidden = true;
        }
      });

      if (banner) {
        banner.hidden = isChat;
        const bannerText = document.getElementById('bannerText');
        if (bannerText) {
          bannerText.textContent = window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'BANNER_NOT_SUPPORTED');
        }
      }
      if (card) {
        if (isChat) {
          card.classList.remove('disabled');
        } else {
          card.classList.add('disabled');
        }
      }
      if (saveBtn) {
        saveBtn.disabled = !isChat;
        saveBtn.setAttribute('aria-disabled', String(!isChat));
        if (!isChat) saveBtn.title = window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'DISABLED_TITLE'); else saveBtn.removeAttribute('title');
      }
    });
  }

  function initializeLinks() {
    try {
      const links = window.GPTPF_CONFIG && window.GPTPF_CONFIG.OFFICIAL_LINKS;
      if (links) {
        const map = new Map([
          ['https://github.com/JosephMatino/MultiAiFilePaster', links.repo],
          ['https://hostwek.com/wekturbo', links.website],
          ['https://hostwek.com', links.companySite],
          ['https://josephmatino.com', links.developerSite],
          ['https://majokdeng.com', links.ceoSite]
        ]);
        document.querySelectorAll('a[href]').forEach(a => {
          const v = a.getAttribute('href');
          if (map.has(v)) a.setAttribute('href', map.get(v));
        });
      }
    } catch(err) { void err; }

    try {
      const cfg = window.GPTPF_CONFIG;
      const listEl = document.getElementById('platformsList');
      const pd = cfg && cfg.PLATFORM_DOMAINS;
      if (listEl && pd) {
        const out = [];
        if (pd.chatgpt && pd.chatgpt.length) {
          const message = window.GPTPF_MESSAGES.getMessage('PLATFORMS', 'CHATGPT');
          if (message) out.push(`<li>${message}</li>`);
        }
        if (pd.claude && pd.claude.length) {
          const message = window.GPTPF_MESSAGES.getMessage('PLATFORMS', 'CLAUDE');
          if (message) out.push(`<li>${message}</li>`);
        }
        if (pd.gemini && pd.gemini.length) {
          const message = window.GPTPF_MESSAGES.getMessage('PLATFORMS', 'GEMINI');
          if (message) out.push(`<li>${message}</li>`);
        }
        if (pd.deepseek && pd.deepseek.length) {
          const message = window.GPTPF_MESSAGES.getMessage('PLATFORMS', 'DEEPSEEK');
          if (message) out.push(`<li>${message}</li>`);
        }
        if (pd.grok && pd.grok.length) {
          const message = window.GPTPF_MESSAGES.getMessage('PLATFORMS', 'GROK');
          if (message) out.push(`<li>${message}</li>`);
        }
        listEl.innerHTML = out.join('\n');
      }
    } catch(err) { void err; }
  }

  function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const updateThemeToggle = (isDark) => {
      themeToggle.className = `theme-toggle ${isDark ? 'dark' : 'light'}`;
    };

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;

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

  function initializeEventListeners() {
    $('#wordLimit').addEventListener('change', e => saveSetting('wordLimit', parseInt(e.target.value, 10)));
    $('#delayToggle').addEventListener('change', e => {
      const on = e.target.checked;
      const wrap = document.getElementById('delaySecondsWrap');
      if (wrap) wrap.hidden = !on;
      saveSetting('useDelay', on);
    });
    $('#delaySeconds').addEventListener('change', e => saveSetting('delaySeconds', parseInt(e.target.value, 10)));

    $('#formatSelect').addEventListener('change', e => {
      const value = e.target.value;
      const moreFormats = document.getElementById('moreFormats');
      const customInputRow = document.getElementById('customInputRow');

      if (value === 'more') {
        $('#formatSelect').classList.add('hidden');
        moreFormats.classList.remove('hidden');
        if (customInputRow) customInputRow.classList.add('hidden');
        morePage = 0;

        chrome.storage.local.get(['fileFormat'], (result) => {
          const currentFormat = result.fileFormat;
          renderMore(morePage, currentFormat);
        });

        moreFormats.focus();
        const moreFormatsMsg = window.GPTPF_MESSAGES.getMessage('FILE_FORMAT', 'MORE_FORMATS_LOADED');
        flash(moreFormatsMsg, 'info');
      } else {
        if (customInputRow) customInputRow.classList.add('hidden');
        saveSetting('fileFormat', value);
        const formatMsg = window.GPTPF_MESSAGES.getMessage('FILE_FORMAT', 'CHANGED');
        flash(formatMsg || `File format changed to: ${value}`, 'success');
      }
    });

    $('#moreFormats').addEventListener('change', e => {
      const value = e.target.value;
      const formatSelect = document.getElementById('formatSelect');
      const customInput = document.getElementById('customFormat');
      const customInputRow = document.getElementById('customInputRow');

      if (value === 'back') {
        $('#moreFormats').classList.add('hidden');
        formatSelect.classList.remove('hidden');
        if (customInputRow) customInputRow.classList.add('hidden');
        formatSelect.focus();
        const backMsg = window.GPTPF_MESSAGES.getMessage('FILE_FORMAT', 'BACK_TO_MAIN');
        flash(backMsg, 'success');
        return;
      }

      if (value === 'next') {
        morePage = Math.min(morePage + 1, extendedPages.length - 1);
        renderMore(morePage);
        const nextMsg = window.GPTPF_MESSAGES.getMessage('FILE_FORMAT', 'NEXT_PAGE');
        flash(nextMsg, 'success');
        return;
      }

      if (value === 'prev') {
        morePage = Math.max(morePage - 1, 0);
        renderMore(morePage);
        const prevMsg = window.GPTPF_MESSAGES.getMessage('FILE_FORMAT', 'PREVIOUS_PAGE');
        flash(prevMsg, 'success');
        return;
      }

      if (value === 'custom') {
        if (customInputRow) customInputRow.classList.remove('hidden');
        customInput.focus();
        const customMsg = window.GPTPF_MESSAGES.getMessage('FILE_FORMAT', 'ENTER_CUSTOM');
        flash(customMsg, 'info');
        return;
      }

      if (value && !['back', 'next', 'prev', 'custom'].includes(value)) {
        if (customInputRow) customInputRow.classList.add('hidden');
        saveSetting('fileFormat', value);
        const formatMsg = window.GPTPF_MESSAGES.getMessage('FILE_FORMAT', 'FORMAT_SELECTED', value);
        flash(formatMsg, 'success');
      }
    });

    $('#customFormat').addEventListener('blur', e => {
      const input = e.target.value?.trim();
      if (!input) return;

      const result = window.GPTPF_VALIDATION?.validateCustomExtension(input);
      if (!result) {
        const validationMsg = window.GPTPF_MESSAGES.getMessage('VALIDATION', 'SYSTEM_UNAVAILABLE');
        flash(validationMsg, 'error');
        return;
      }

      if (!result.valid) {
        const errorMsg = window.GPTPF_MESSAGES.getMessage('VALIDATION', result.error.includes('Security') ? 'SECURITY_RISK' :
                        result.error.includes('required') ? 'EXTENSION_REQUIRED' : 'LETTERS_NUMBERS_ONLY');
        flash(errorMsg, 'error');
        e.target.value = '';
        return;
      }

      saveSetting('fileFormat', result.extension);
      const customFormatMsg = window.GPTPF_MESSAGES.getMessage('FILE_FORMAT', 'CUSTOM_FORMAT_SET', result.extension);
      flash(customFormatMsg, 'success');
      e.target.value = result.extension.replace('.', '');
    });

    $('#customFormat').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.target.blur();
      }
    });

    $('#debugToggle').addEventListener('change', e => saveSetting('showDebug', e.target.checked));
    $('#telemetryToggle').addEventListener('change', e => {
      const enabled = e.target.checked;
      saveSetting('telemetryEnabled', enabled);

      const analyticsSection = document.getElementById('analyticsSection');
      if (analyticsSection) {
        if (enabled) {
          analyticsSection.classList.remove('hidden');
        } else {
          analyticsSection.classList.add('hidden');
        }
        if (enabled && window.GPTPF_ANALYTICS) {
          window.GPTPF_ANALYTICS.showAnalyticsLoading();
          setTimeout(() => {
            window.GPTPF_ANALYTICS.loadAnalytics();
            window.GPTPF_ANALYTICS.hideAnalyticsLoading();
          }, window.GPTPF_CONFIG?.UI_TIMINGS?.analyticsLoadDelay ?? 200);
        }
      }
    });
    $('#batchToggle').addEventListener('change', e => {
      const isChecked = e.target.checked;
      saveSetting('batchMode', isChecked);
      const batchOptions = document.getElementById('batchOptions');
      if (batchOptions) {
        if (isChecked) {
          batchOptions.classList.remove('hidden');
        } else {
          batchOptions.classList.add('hidden');
        }
      }
      updateMainDelayState(isChecked);
      updateAutoAttachState(isChecked);
      updateCompressionControlsState();
    });
    $('#compressionToggle').addEventListener('change', e => {
      saveSetting('enableCompression', e.target.checked);
      $('#compressionThresholdWrap').hidden = !e.target.checked;
      updateCompressionControlsState();
    });
    $('#compressionThreshold').addEventListener('change', e => saveSetting('compressionThreshold', parseInt(e.target.value)));

    $('#maxFilesSlider').addEventListener('input', e => {
      const value = parseInt(e.target.value);
      $('#maxFilesValue').textContent = value;
      saveSetting('maxBatchFiles', value);
    });

    $('#processingDelaySlider').addEventListener('input', e => {
      const value = parseInt(e.target.value);
      $('#processingDelayValue').textContent = `${value}ms`;
      saveSetting('batchProcessingDelay', value);
    });

    $('#batchCompressionToggle').addEventListener('change', e => {
      const isChecked = e.target.checked;
      saveSetting('batchCompression', isChecked);
      updateCompressionControlsState();
    });

    $('#delayToggle').addEventListener('change', e => {
      updateBatchDelayState(e.target.checked);
    });



    $('#attachToggle').addEventListener('change', e => {
      saveSetting('autoAttachEnabled', e.target.checked);
      updateStatusIndicator();
    });
    $('#claudeOverrideToggle').addEventListener('change', e => saveSetting('claudeOverride', e.target.checked));

    $('#saveNow').addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'SAVE_CURRENT_MESSAGE' }, resp => {
        if (chrome.runtime.lastError) {
          const extensionErrorMsg = window.GPTPF_MESSAGES.getMessage('ERRORS', 'EXTENSION_CONTEXT');
          flash(extensionErrorMsg, 'error');
        } else if (resp && resp.ok) {
          const successMsg = window.GPTPF_MESSAGES.getMessage('FILE_OPERATIONS', 'MANUAL_SAVE_SUCCESS');
          flash(successMsg, 'success');
        } else if (resp && resp.ok === false) {
          let errorMsg;
          switch (resp.reason) {
            case 'empty':
              errorMsg = window.GPTPF_MESSAGES.getMessage('ERRORS', 'NO_TEXT_INPUT');
              break;
            case 'busy':
              errorMsg = window.GPTPF_MESSAGES.getMessage('ERRORS', 'BUSY_PROCESSING');
              break;
            case 'below_min':
            case 'too_short':
              errorMsg = window.GPTPF_MESSAGES.getMessage('ERRORS', 'TEXT_TOO_SHORT_MANUAL');
              break;
            case 'not_supported':
              errorMsg = window.GPTPF_MESSAGES.getMessage('ERRORS', 'PLATFORM_NOT_SUPPORTED');
              break;
            case 'no_input':
              errorMsg = window.GPTPF_MESSAGES.getMessage('ERRORS', 'NO_INPUT_FIELD');
              break;
            case 'failed':
              errorMsg = window.GPTPF_MESSAGES.getMessage('ERRORS', 'ATTACHMENT_FAILED');
              break;
            case 'context_invalidated':
              errorMsg = window.GPTPF_MESSAGES.getMessage('ERRORS', 'EXTENSION_RELOADED');
              break;
            case 'no_file_input':
              errorMsg = window.GPTPF_MESSAGES.getMessage('ERRORS', 'NO_FILE_INPUT');
              break;
            case 'connection_failed':
              errorMsg = window.GPTPF_MESSAGES.getMessage('ERRORS', 'CONNECTION_FAILED');
              break;
            case 'no_response':
              errorMsg = window.GPTPF_MESSAGES.getMessage('ERRORS', 'NO_RESPONSE');
              break;
            case 'no_tab':
              errorMsg = window.GPTPF_MESSAGES.getMessage('ERRORS', 'NO_TAB_ACCESS');
              break;
            default:
              errorMsg = window.GPTPF_MESSAGES.getMessage('ERRORS', 'ATTACHMENT_FAILED');
          }
          flash(errorMsg, 'error');

          chrome.storage.local.get('telemetryEnabled', res => {
            if (res.telemetryEnabled) {
              chrome.runtime.sendMessage({
                type: 'METRIC_EVENT',
                payload: { event: 'manual_save_failed', reason: resp.reason, ts: Date.now() }
              });
            }
          });
        } else {
          const platformMsg = window.GPTPF_MESSAGES.getMessage('SUCCESS', 'NOT_ON_PLATFORM');
          flash(platformMsg, 'error');
        }
      });
    });

    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn && chrome?.tabs?.create) {
      likeBtn.addEventListener('click', () => {
        const repo = window.GPTPF_CONFIG?.OFFICIAL_LINKS?.repo;
        chrome.tabs.create({ url: repo });
        const starMsg = window.GPTPF_MESSAGES.getMessage('SUCCESS', 'GITHUB_STAR');
        flash(starMsg, 'success');

        chrome.storage.local.get('telemetryEnabled', res => {
          if (res.telemetryEnabled) {
            chrome.runtime.sendMessage({
              type: 'METRIC_EVENT',
              payload: { event: 'github_star_clicked', ts: Date.now() }
            });
          }
        });
      });
    }

    const feedbackBtn = document.getElementById('feedbackBtn');
    const feedbackModal = document.getElementById('feedbackModal');

    if (feedbackBtn && feedbackModal) {
      feedbackBtn.addEventListener('click', () => {
        feedbackModal.hidden = false;
        feedbackModal.querySelector('.modal-card').focus();
      });

      // Handle modal close
      feedbackModal.addEventListener('click', (e) => {
        if (e.target.dataset.close === '1' || e.target.closest('[data-close="1"]')) {
          feedbackModal.hidden = true;
          return;
        }

        const option = e.target.closest('.feedback-option');
        if (option) {
          const email = option.dataset.email;
          const subject = option.dataset.subject;
          const type = option.dataset.type;

          const version = window.GPTPF_CONFIG?.VERSION;
          const repoUrl = window.GPTPF_CONFIG?.OFFICIAL_LINKS?.repo;

          const body = `Hi there!

I'm reaching out regarding Multi-AI File Paster Chrome Extension.

Type: ${type.charAt(0).toUpperCase() + type.slice(1)}

[Please describe your ${type === 'support' ? window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'FEEDBACK_SUPPORT_DESCRIPTION') : type === 'improvement' ? window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'FEEDBACK_IMPROVEMENT_DESCRIPTION') : window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'FEEDBACK_DEFAULT_DESCRIPTION')} here]

Extension Version: ${version}
Repository: ${repoUrl}
Browser: ${navigator.userAgent}

Thank you!`;

          const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

          if (chrome?.tabs?.create) {
            chrome.tabs.create({ url: mailtoUrl });
          } else {
            window.open(mailtoUrl);
          }

          feedbackModal.hidden = true;

          const feedbackMsg = window.GPTPF_MESSAGES.getMessage('SUCCESS', 'FEEDBACK_SENT');
          flash(feedbackMsg, 'success');

          chrome.storage.local.get('telemetryEnabled', res => {
            if (res.telemetryEnabled) {
              chrome.runtime.sendMessage({
                type: 'METRIC_EVENT',
                payload: { event: 'feedback_sent', data: { type }, ts: Date.now() }
              });
            }
          });
        }
      });
    }

    document.getElementById('timePeriod')?.addEventListener('change', (e) => {
      if (window.GPTPF_ANALYTICS) {
        const period = e.target.value;
        const periodLabels = {
          '7': window.GPTPF_MESSAGES.getMessage('ANALYTICS', 'LAST_7_DAYS'),
          '30': window.GPTPF_MESSAGES.getMessage('ANALYTICS', 'LAST_30_DAYS'),
          '90': window.GPTPF_MESSAGES.getMessage('ANALYTICS', 'LAST_90_DAYS'),
          'all': window.GPTPF_MESSAGES.getMessage('ANALYTICS', 'ALL_TIME')
        };

        const selectedLabel = periodLabels[period] || period;
        flash(window.GPTPF_MESSAGES.getMessage('ANALYTICS', 'ANALYTICS_UPDATED').replace('$PERIOD$', selectedLabel), 'info');

        window.GPTPF_ANALYTICS.setTimePeriod(period);
        window.GPTPF_ANALYTICS.showAnalyticsLoading();
        setTimeout(() => {
          window.GPTPF_ANALYTICS.loadAnalytics();
          window.GPTPF_ANALYTICS.hideAnalyticsLoading();
        }, window.GPTPF_CONFIG?.UI_TIMINGS?.settingsSaveDelay ?? 300);
      }
    });

    document.getElementById('exportData')?.addEventListener('click', () => {
      chrome.storage.local.get(['__analytics_data'], (result) => {
        try {
          const data = result.__analytics_data;
          const now = new Date();
          const ver = window.GPTPF_CONFIG?.VERSION;
          const exportData = {
            ...data,
            metadata: {
              exported: now.toISOString(),
              exportedBy: window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'EXPORT_BY_PREFIX') + ver,
              totalEntries: data.history?.length,
              dateRange: {
                earliest: data.history && data.history.length > 0 ?
                  new Date(Math.min(...data.history.map(h => h.timestamp))).toISOString() : null,
                latest: data.history && data.history.length > 0 ?
                  new Date(Math.max(...data.history.map(h => h.timestamp))).toISOString() : null
              }
            },
            version: ver
          };

          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'EXPORT_FILENAME_PREFIX')}${now.toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);

          const exportMsg = window.GPTPF_MESSAGES.getMessage('SUCCESS', 'ANALYTICS_EXPORTED');
          flash(exportMsg, 'success');
        } catch (error) {
          const exportErrorMsg = window.GPTPF_MESSAGES.getMessage('ERRORS', 'EXPORT_FAILED');
          flash(exportErrorMsg, 'error');
        }
      });
    });

    if (window.GPTPF_TOOLTIPS) {
      window.GPTPF_TOOLTIPS.initTooltips();
    }
    if (window.GPTPF_MODALS) {
      window.GPTPF_MODALS.initModals();
    }
    if (window.GPTPF_ANALYTICS) {
      window.GPTPF_ANALYTICS.setupViewportLoading();
      window.GPTPF_ANALYTICS.initPeriodSelector();
      window.GPTPF_ANALYTICS.initChartSelector();
      window.GPTPF_ANALYTICS.applyModelTheming();
    }
    initThemeToggle();
    centralizeUIText();
  }

  function rebuildDynamicUI() {
    try { initializeLinks(); } catch(e) { void e; }
    try { centralizeUIText(); } catch(e) { void e; }
    try { updateStatusIndicator(); } catch(e) { void e; }
  }

  document.addEventListener('gptpf:translations-updated', () => {
    rebuildDynamicUI();
  });

  function centralizeUIText() {
    // Update hardcoded HTML text with centralized messages
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.title = window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'TOGGLE_THEME');
    }

    const customFormat = document.getElementById('customFormat');
    if (customFormat) {
      customFormat.placeholder = window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'CUSTOM_FORMAT_PLACEHOLDER');
    }

    const aboutClose = document.getElementById('aboutClose');
    if (aboutClose) {
      aboutClose.setAttribute('aria-label', window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'CLOSE'));
    }

    const feedbackClose = document.querySelector('#feedbackModal .modal-close');
    if (feedbackClose) {
      feedbackClose.setAttribute('aria-label', window.GPTPF_MESSAGES.getMessage('UI_COMPONENTS', 'CLOSE'));
    }
  }

  initializeSettings();
  initializeEventListeners();

  if (window.GPTPF_I18N) {
    window.GPTPF_I18N.initializeI18n();
  }
})();
