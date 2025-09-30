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
 * • PLATFORM INTEGRATIONS: Popup UI layer interacting with shared systems
 * • CORE DEPENDENCIES: Chrome Extension APIs, FileReader API
 * • FEATURES: Batch processing, analytics, multi-platform support
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
    ['rb','css','php','xml','sql','csv','sh'],
    ['swift','kt','dart','scala','r','pl','lua','yml','custom']
  ];
  function renderMore(pageIndex, selected) {
    const moreFormats = document.getElementById('moreFormats');
    if (!moreFormats) return;
    const opts = [];
    opts.push({v:'back', t: window.GPTPF_I18N.getMessage('back_to_main')});
    extendedPages[pageIndex].forEach(v => {
      opts.push({v, t: v === 'custom' ? window.GPTPF_I18N.getMessage('custom_format_label') : `.${v}`});
    });
    if (pageIndex > 0) opts.push({v:'prev', t: window.GPTPF_I18N.getMessage('previous_page')});
    if (pageIndex < extendedPages.length - 1) opts.push({v:'next', t: window.GPTPF_I18N.getMessage('next_page')});
    moreFormats.innerHTML = opts.map(o => `<option value="${o.v}">${o.t}</option>`).join('');
    if (selected && extendedPages[pageIndex].includes(selected)) {
      moreFormats.value = selected;
    } else {
      moreFormats.selectedIndex = -1;
    }
  }
  const flash = (msg, type = 'info') => {
    if (window.GPTPF_DEBUG) {
      window.GPTPF_DEBUG.info('flash_called', `Message: "${msg}", Type: ${type}`);
    }
    const sr = document.getElementById('gptpf-flash');
    if (sr) {
      sr.textContent = msg;
      const timings = window.GPTPF_CONFIG?.UI_TIMINGS;
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG.info('flash_timeout_set', `Timeout: ${timings.flashTimeout}ms`);
      }
      setTimeout(() => { if (sr.textContent === msg) sr.textContent = ''; }, timings.flashTimeout);
    }
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs && tabs[0];
        const u = tab?.url;
        const map = window.GPTPF_CONFIG?.PLATFORM_DOMAINS;
        const list = Object.values(map).reduce((a,b)=>a.concat(b), []);
        let host = '';
        try { host = new URL(u).hostname; } catch(err) {
          if (window.GPTPF_DEBUG) {
            window.GPTPF_DEBUG.error('console_platform_handler_error', err);
          }
        }
        const onChat = list.some(d => host.includes(d));
        if (window.GPTPF_DEBUG) {
          window.GPTPF_DEBUG.info('tab_detection', `Host: ${host}, On chat platform: ${onChat}`);
        }
        if (tab && onChat && chrome?.tabs?.sendMessage) {
          if (window.GPTPF_DEBUG) {
            window.GPTPF_DEBUG.info('sending_message_to_content', `Tab ID: ${tab.id}, Message: ${msg}`);
          }
          chrome.tabs.sendMessage(tab.id, { type: 'SHOW_TOAST', message: msg, level: type }, () => {
            if (chrome.runtime.lastError && sr) {
              sr.textContent = `${type.toUpperCase()}: ${msg}`;
            }
          });
        } else if (sr) {
          if (window.GPTPF_DEBUG) {
            window.GPTPF_DEBUG.info('using_popup_flash', window.GPTPF_I18N.getMessage('debug_using_popup_flash'));
          }
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
    if (window.GPTPF_DEBUG) {
      window.GPTPF_DEBUG.info('setting_save_initiated', `Key: ${key}, Value: ${JSON.stringify(val)}`);
    }
    __savePending = true;
    if (!__saveBatchTimer) {
      const savingMsg = window.GPTPF_I18N.getMessage('saving');
      flash(savingMsg, 'info');
    }
    clearTimeout(__saveBatchTimer);
    chrome.storage.local.set({ [key]: val }, () => {
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG.info('setting_saved_to_storage', `Key: ${key} stored successfully`);
      }
      __saveBatchTimer = setTimeout(() => {
        if (__savePending) {
          let successMsg;
          switch (key) {
            case 'wordLimit':
              successMsg = window.GPTPF_I18N.getMessage('settings_word_limit_updated', [val]);
              break;
            case 'useDelay':
              successMsg = val 
                ? window.GPTPF_I18N.getMessage('settings_delay_enabled', [oldSettings?.delaySeconds || 3])
                : window.GPTPF_I18N.getMessage('settings_delay_disabled');
              break;
            case 'delaySeconds':
              successMsg = window.GPTPF_I18N.getMessage('settings_delay_enabled', [val]);
              break;
            case 'batchMode':
              successMsg = val 
                ? window.GPTPF_I18N.getMessage('settings_batch_mode_enabled')
                : window.GPTPF_I18N.getMessage('settings_batch_mode_disabled');
              break;

            case 'autoAttachEnabled':
              successMsg = val 
                ? window.GPTPF_I18N.getMessage('settings_auto_attach_enabled')
                : window.GPTPF_I18N.getMessage('settings_auto_attach_disabled');
              break;
            case 'claudeOverride':
              successMsg = val 
                ? window.GPTPF_I18N.getMessage('settings_claude_override_enabled')
                : window.GPTPF_I18N.getMessage('settings_claude_override_disabled');
              break;
            case 'telemetryEnabled':
              successMsg = val 
                ? window.GPTPF_I18N.getMessage('settings_telemetry_enabled')
                : window.GPTPF_I18N.getMessage('settings_telemetry_disabled');
              break;
            case 'showDebug':
              successMsg = val 
                ? window.GPTPF_I18N.getMessage('settings_debug_enabled')
                : window.GPTPF_I18N.getMessage('settings_debug_disabled');
              break;
            case 'maxBatchFiles':
              successMsg = window.GPTPF_I18N.getMessage('settings_max_batch_files_updated', [val]);
              break;
            case 'batchProcessingDelay':
              successMsg = window.GPTPF_I18N.getMessage('settings_batch_delay_updated', [val]);
              break;

            default:
              successMsg = window.GPTPF_I18N.getMessage('settings_saving');
          }
          flash(successMsg, 'success');
        }
        __savePending = false;
        __saveBatchTimer = 0;
      }, window.GPTPF_CONFIG?.UI_TIMINGS?.settingsSaveDelay);
    });
  };
  const UIStateManager = {
    updateElementState(element, enabled, options = {}) {
      if (!element) return;

      element.disabled = !enabled;
      const parentRow = element.closest('.row');
      const parentSwitch = element.closest('.switch');
      const label = parentRow?.querySelector('.label');

      if (parentSwitch) {
        parentSwitch.className = enabled ? 'switch enabled-state' : 'switch disabled-state';
      }
      if (label) {
        label.className = enabled ? 'label enabled-state' : 'label disabled-state';

        if (options.badge && !enabled) {
          const existingBadge = label.querySelector('.batch-disabled-badge');
          if (!existingBadge) {
            const badge = document.createElement('span');
            badge.className = 'batch-disabled-badge';
            badge.textContent = window.GPTPF_I18N.getMessage('batch_active_badge');
            label.appendChild(badge);
          }
        } else if (enabled) {
          const existingBadge = label.querySelector('.batch-disabled-badge');
          if (existingBadge) existingBadge.remove();
        }
      }
      if (parentRow && options.opacity) {
        parentRow.style.opacity = enabled ? '1' : '0.5';
      }

      if (options.tooltip && !enabled) {
        const helpButton = parentRow?.querySelector('.help');
        if (helpButton) {
          const originalTip = helpButton.getAttribute('data-original-tip') || helpButton.getAttribute('data-tip');
          if (!helpButton.getAttribute('data-original-tip') && originalTip) {
            helpButton.setAttribute('data-original-tip', originalTip);
          }
          helpButton.setAttribute('data-tip', options.tooltip);
        }
      } else if (enabled) {
        const helpButton = parentRow?.querySelector('.help');
        if (helpButton) {
          const originalTip = helpButton.getAttribute('data-original-tip');
          if (originalTip) {
            helpButton.setAttribute('data-tip', originalTip);
          }
        }
      }
    },

    updateAllStates() {
      window.GPTPF_UTILS.getStorageData(['batchMode', 'autoAttachEnabled', 'useDelay'], (result) => {
        if (!result) return;

        const batchMode = result.batchMode;
        const autoAttachEnabled = result.autoAttachEnabled !== false;
        const useDelay = result.useDelay;

        this.updateMainDelayState(batchMode);
        this.updateBatchDelayState(useDelay);
        this.updateAutoAttachState(batchMode);
        this.updateManualActionState(batchMode);
        this.updateMainUIState(autoAttachEnabled);
      });
    },

    updateMainDelayState(batchMode) {
      const delayToggle = $('#delayToggle');
      this.updateElementState(delayToggle, !batchMode, {
        badge: batchMode,
        tooltip: batchMode ? window.GPTPF_I18N.getMessage('batch_delay_tip') : null
      });
    },

    updateBatchDelayState(useDelay) {
      const delaySlider = $('#processingDelaySlider');
      const delayValue = $('#processingDelayValue');
      if (delaySlider) {
        delaySlider.disabled = useDelay;
        delaySlider.className = useDelay ? 'disabled-state' : 'enabled-state';
      }
      if (delayValue) {
        delayValue.className = useDelay ? 'disabled-state' : 'enabled-state';
      }
    },



    updateAutoAttachState(batchMode) {
      const attachToggle = $('#attachToggle');
      this.updateElementState(attachToggle, !batchMode, {
        badge: batchMode,
        tooltip: batchMode ? window.GPTPF_I18N.getMessage('batch_auto_attach_tip') : null
      });
    },

    updateManualActionState(batchMode) {
      const saveBtn = $('#saveNow');
      if (!saveBtn) return;


      saveBtn.disabled = batchMode;
      saveBtn.style.opacity = batchMode ? '0.5' : '1';
      saveBtn.style.cursor = batchMode ? 'not-allowed' : 'pointer';
      saveBtn.style.pointerEvents = batchMode ? 'none' : 'auto';


      const helpBtn = saveBtn.parentElement?.querySelector('.help');
      if (helpBtn) {
        const tooltipKey = batchMode ? 'ui_components_batch_manual_action_tip' : 'manual_action_tooltip';
        helpBtn.setAttribute('data-tip-i18n', tooltipKey);


        if (window.GPTPF_TOOLTIPS && window.GPTPF_TOOLTIPS.refreshTooltip) {
          window.GPTPF_TOOLTIPS.refreshTooltip(helpBtn);
        }
      }
    },

    updateMainUIState(autoAttachEnabled) {
      const elements = [
        $('#formatSelect'),
        $('#moreFormats'),
        $('#customFormat'),
        $('#delayToggle'),
        $('#batchToggle')
      ];

      elements.forEach(element => {
        this.updateElementState(element, autoAttachEnabled, { opacity: true });
      });


    }
  };

  function updateBatchDelayState(useDelay) {
    UIStateManager.updateBatchDelayState(useDelay);
  }

  function updateMainDelayState(batchMode) {
    UIStateManager.updateMainDelayState(batchMode);
  }
  function updateAutoAttachState(batchMode) {
    UIStateManager.updateAutoAttachState(batchMode);
  }
  function updateManualActionState(batchMode) {
    UIStateManager.updateManualActionState(batchMode);
  }
  function updateUIStateBasedOnAutoAttach(autoAttachEnabled) {
    UIStateManager.updateMainUIState(autoAttachEnabled);
  }
  function initializeSettings() {
    GPTPF_CONFIG.getConfig(() => {
      window.GPTPF_UTILS.getStorageData([
        'wordLimit', 'useDelay', 'delaySeconds', 'fileFormat', 'batchMode', 'maxBatchFiles', 'batchProcessingDelay', 'telemetryEnabled', 'showDebug', 'debugLevel', 'autoAttachEnabled', 'claudeOverride', 'selectedTheme'
      ], res => {
        if (!res) return;
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
        updateBatchDelayState(res.useDelay ?? (defaults.useDelay ?? false));
        updateMainDelayState(res.batchMode ?? (defaults.batchMode ?? false));
        updateAutoAttachState(res.batchMode ?? (defaults.batchMode ?? false));
        updateManualActionState(res.batchMode ?? (defaults.batchMode ?? false));
        const debugConfig = window.GPTPF_CONFIG.DEBUG;
        const debugEnabled = debugConfig.enabled;
        const userDebugSetting = res.showDebug || defaults.showDebug;
        const debugLevel = res.debugLevel || debugConfig.logLevel;
        const userTheme = res.selectedTheme !== undefined ? res.selectedTheme : (defaults.selectedTheme || 'default');
        window.GPTPF_DEBUG?.log('debug_theme_load', [res.selectedTheme, defaults.selectedTheme, userTheme]);
        const miscRow = $('#miscRow');
        const miscToggle = $('#miscToggle');
        const miscOptions = $('#miscOptions');
        const debugLevelSelect = $('#debugLevelSelect');
        const themeSelect = $('#themeSelect');
        if (debugEnabled) {
          miscRow.classList.remove('hidden');
          if (miscToggle) miscToggle.checked = userDebugSetting;
          if (debugLevelSelect) debugLevelSelect.value = debugLevel;
          if (themeSelect) {
            themeSelect.value = userTheme;
            window.GPTPF_DEBUG?.log('debug_theme_dropdown_set', [userTheme]);
          }
          const miscSection = $('.misc-section');
          if (userDebugSetting) {
            miscOptions.classList.add('show');
            if (miscSection) miscSection.classList.add('misc-expanded');
          } else {
            miscOptions.classList.remove('show');
            if (miscSection) miscSection.classList.remove('misc-expanded');
          }
        } else {
          miscRow.classList.add('hidden');
          miscOptions.classList.remove('show');
        }
        applyThemeColors(userTheme);
        sendThemeToContentScript(userTheme);
        if (window.GPTPF_DEBUG) {
          window.GPTPF_DEBUG.updateSettings();
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
        setTimeout(() => {
          refreshBadgeTranslations();
        }, 100);
      });
    });
  }
  let detectedModelName = window.GPTPF_I18N.getMessage('ai_model_default');
  function updateStatusIndicator(isOnPlatform = null) {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = statusIndicator?.querySelector('.status-text');
    const statusPulse = statusIndicator?.querySelector('.status-pulse');
    if (!statusIndicator || !statusText || !statusPulse) return;
    if (isOnPlatform === null) {
      window.GPTPF_UTILS.sendRuntimeMessage({ type: 'IS_ACTIVE_AI_PLATFORM' }, r => {
        updateStatusIndicator(!!r?.isChatGPT);
      });
      return;
    }
    if (!isOnPlatform) {
      statusIndicator.hidden = true;
      return;
    }
    const autoAttachEnabled = document.getElementById('attachToggle')?.checked;
    const currentModel = detectedModelName || window.GPTPF_I18N.getMessage('ai_model_default');
    if (autoAttachEnabled) {
      statusText.textContent = window.GPTPF_I18N.getMessage('connected_to', [currentModel]);
      statusIndicator.className = 'status-indicator status-connected';
      statusPulse.className = 'status-pulse pulse-connected';
    } else {
      statusText.textContent = window.GPTPF_I18N.getMessage('stopped_on', [currentModel]);
      statusIndicator.className = 'status-indicator status-stopped';
      statusPulse.className = 'status-pulse pulse-stopped';
    }
    statusIndicator.hidden = false;
  }
  function initializePlatformDetection() {
    window.GPTPF_UTILS.sendRuntimeMessage({ type: 'IS_ACTIVE_AI_PLATFORM' }, r => {
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
        } catch(err) {
          if (window.GPTPF_DEBUG) {
            window.GPTPF_DEBUG.error('console_platform_handler_error', err);
          }
        }
        if (claudeRow) claudeRow.hidden = !isOnClaude;
        if (statusIndicator && currentModel) {
          let modelName = 'Unknown';
          try {
            const host = new URL(url).hostname;
            const pd = window.GPTPF_CONFIG?.PLATFORM_DOMAINS;
            if (pd.chatgpt?.some(d=>host.includes(d))) modelName = 'ChatGPT';
            else if (pd.claude?.some(d=>host.includes(d))) modelName = 'Claude';
            else if (pd.gemini?.some(d=>host.includes(d))) modelName = 'Gemini';
            else if (pd.deepseek?.some(d=>host.includes(d))) modelName = 'DeepSeek';
            else if (pd.grok?.some(d=>host.includes(d))) modelName = 'Grok';
          } catch(err) {
            if (window.GPTPF_DEBUG) {
              window.GPTPF_DEBUG.error('console_platform_handler_error', err);
            }
          }
          const isOnPlatform = modelName !== 'Unknown';
          detectedModelName = modelName;
          currentModel.textContent = modelName;
          updateStatusIndicator(isOnPlatform);
        } else if (statusIndicator) {
          statusIndicator.hidden = true;
        }
      });
      if (banner) {
        banner.hidden = isChat;
        const bannerText = document.getElementById('bannerText');
        if (bannerText) {
          bannerText.textContent = window.GPTPF_I18N.getMessage('banner_not_supported');
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
        if (!isChat) saveBtn.title = window.GPTPF_I18N.getMessage('disabled_title'); else saveBtn.removeAttribute('title');
      }
    });
  }
  function initializeLinks() {
    try {
      const links = window.GPTPF_CONFIG && window.GPTPF_CONFIG.OFFICIAL_LINKS;
      if (links) {
        document.querySelectorAll('a[href]').forEach(a => {
          const href = a.getAttribute('href');
          if (href && href.includes('github.com/JosephMatino')) {
            a.setAttribute('href', links.repo);
          } else if (href && href.includes('hostwek.com/wekturbo')) {
            a.setAttribute('href', links.website);
          } else if (href && href.includes('hostwek.com') && !href.includes('wekturbo')) {
            a.setAttribute('href', links.companySite);
          } else if (href && href.includes('josephmatino.com')) {
            a.setAttribute('href', links.developerSite);
          } else if (href && href.includes('majokdeng.com')) {
            a.setAttribute('href', links.ceoSite);
          }
        });
      }
    } catch(err) {
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG.error('console_platform_handler_error', err);
      }
    }
    try {
      const cfg = window.GPTPF_CONFIG;
      const listEl = document.getElementById('platformsList');
      const pd = cfg && cfg.PLATFORM_DOMAINS;
      if (listEl && pd) {
        const out = [];
        if (pd.chatgpt && pd.chatgpt.length) {
          const message = window.GPTPF_I18N.getMessage('platform_chatgpt');
          if (message) out.push(`<li>${message}</li>`);
        }
        if (pd.claude && pd.claude.length) {
          const message = window.GPTPF_I18N.getMessage('platform_claude');
          if (message) out.push(`<li>${message}</li>`);
        }
        if (pd.gemini && pd.gemini.length) {
          const message = window.GPTPF_I18N.getMessage('platform_gemini');
          if (message) out.push(`<li>${message}</li>`);
        }
        if (pd.deepseek && pd.deepseek.length) {
          const message = window.GPTPF_I18N.getMessage('platform_deepseek');
          if (message) out.push(`<li>${message}</li>`);
        }
        if (pd.grok && pd.grok.length) {
          const message = window.GPTPF_I18N.getMessage('platform_grok');
          if (message) out.push(`<li>${message}</li>`);
        }
        listEl.innerHTML = out.join('\n');
      }
    } catch(err) {
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG.error('console_platform_handler_error', err);
      }
    }
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
        window.GPTPF_UTILS.getStorageData(['fileFormat'], (result) => {
          if (!result) return;
          const currentFormat = result.fileFormat;
          renderMore(morePage, currentFormat);
        });
        moreFormats.focus();
        const moreFormatsMsg = window.GPTPF_I18N.getMessage('more_formats_loaded');
        flash(moreFormatsMsg, 'info');
      } else {
        if (customInputRow) customInputRow.classList.add('hidden');
        saveSetting('fileFormat', value);
        const formatMsg = window.GPTPF_I18N.getMessage('format_changed');
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
        const backMsg = window.GPTPF_I18N.getMessage('back_to_main');
        flash(backMsg, 'success');
        return;
      }
      if (value === 'next') {
        morePage = Math.min(morePage + 1, extendedPages.length - 1);
        renderMore(morePage);
        const nextMsg = window.GPTPF_I18N.getMessage('next_page');
        flash(nextMsg, 'success');
        return;
      }
      if (value === 'prev') {
        morePage = Math.max(morePage - 1, 0);
        renderMore(morePage);
        const prevMsg = window.GPTPF_I18N.getMessage('previous_page');
        flash(prevMsg, 'success');
        return;
      }
      if (value === 'custom') {
        if (customInputRow) customInputRow.classList.remove('hidden');
        customInput.focus();
        const customMsg = window.GPTPF_I18N.getMessage('enter_custom');
        flash(customMsg, 'info');
        return;
      }
      if (value && !['back', 'next', 'prev', 'custom'].includes(value)) {
        if (customInputRow) customInputRow.classList.add('hidden');
        saveSetting('fileFormat', value);
        const formatMsg = window.GPTPF_I18N.getMessage('format_selected', value);
        flash(formatMsg, 'success');
      }
    });
    $('#customFormat').addEventListener('blur', e => {
      const input = e.target.value?.trim();
      if (!input) return;
      const result = window.GPTPF_VALIDATION?.validateCustomExtension(input);
      if (!result) {
        const validationMsg = window.GPTPF_I18N.getMessage('system_unavailable');
        flash(validationMsg, 'error');
        return;
      }
      if (!result.valid) {
        const errorMsg = window.GPTPF_I18N.getMessage(result.error.includes('Security') ? 'security_risk' :
                        result.error.includes('required') ? 'extension_required' : 'letters_numbers_only');
        flash(errorMsg, 'error');
        e.target.value = '';
        return;
      }
      saveSetting('fileFormat', result.extension);
      const customFormatMsg = window.GPTPF_I18N.getMessage('custom_format_set', result.extension);
      flash(customFormatMsg, 'success');
      e.target.value = result.extension.replace('.', '');
    });
    $('#customFormat').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.target.blur();
      }
    });
    $('#miscToggle').addEventListener('change', e => {
      const enabled = e.target.checked;
      saveSetting('showDebug', enabled);
      const miscOptions = $('#miscOptions');
      const miscSection = $('.misc-section');
      if (miscOptions) {
        if (enabled) {
          miscOptions.classList.add('show');
        } else {
          miscOptions.classList.remove('show');
        }
      }
      if (miscSection) {
        if (enabled) {
          miscSection.classList.add('misc-expanded');
        } else {
          miscSection.classList.remove('misc-expanded');
        }
      }
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG.enable(enabled);
      }
    });
    $('#debugLevelSelect')?.addEventListener('change', e => {
      const level = e.target.value;
      saveSetting('debugLevel', level);
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG.updateSettings();
      }
      const levelNames = {
        'errors': window.GPTPF_I18N.getMessage('debug_level_errors_only'),
        'warnings': window.GPTPF_I18N.getMessage('debug_level_warnings_errors'),
        'all': window.GPTPF_I18N.getMessage('debug_level_all_messages')
      };
      const levelName = levelNames[level];
      flash(window.GPTPF_I18N.getMessage('debug_log_level_changed', [levelName]), 'info');
    });
    $('#themeSelect')?.addEventListener('change', e => {
      const theme = e.target.value;
      window.GPTPF_DEBUG?.log('debug_theme_change_start', [theme]);
      saveSetting('selectedTheme', theme);
      applyThemeColors(theme);
      sendThemeToContentScript(theme);
      const themeNames = {
        'default': window.GPTPF_I18N.getMessage('theme_default'),
        'chatgpt': window.GPTPF_I18N.getMessage('theme_chatgpt'),
        'claude': window.GPTPF_I18N.getMessage('theme_claude'),
        'gemini': window.GPTPF_I18N.getMessage('theme_gemini'),
        'deepseek': window.GPTPF_I18N.getMessage('theme_deepseek'),
        'grok': window.GPTPF_I18N.getMessage('theme_grok')
      };
      const themeName = themeNames[theme] || theme;
      flash(window.GPTPF_I18N.getMessage('theme_changed', [themeName]), 'success');
      window.GPTPF_DEBUG?.log('debug_theme_change_complete', [theme, themeName]);
    });
    $('#resetBtn')?.addEventListener('click', () => {
      showResetModal();
    });
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
      updateManualActionState(isChecked);
      setTimeout(() => {
        refreshBadgeTranslations();
      }, 50);
    });

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

    $('#delayToggle').addEventListener('change', e => {
      updateBatchDelayState(e.target.checked);
    });
    $('#attachToggle').addEventListener('change', e => {
      saveSetting('autoAttachEnabled', e.target.checked);
      updateStatusIndicator();
      updateUIStateBasedOnAutoAttach(e.target.checked);
    });
    $('#claudeOverrideToggle').addEventListener('change', e => {
      const enabled = e.target.checked;
      saveSetting('claudeOverride', enabled);
      UIStateManager.updateMainUIState(enabled);
    });
    $('#saveNow').addEventListener('click', () => {
      window.GPTPF_UTILS.sendRuntimeMessage({ type: 'SAVE_CURRENT_MESSAGE' }, resp => {
        if (chrome.runtime.lastError) {
          const extensionErrorMsg = window.GPTPF_I18N.getMessage('errors_extension_context');
          flash(extensionErrorMsg, 'error');
        } else if (resp && resp.ok) {
          const successMsg = window.GPTPF_I18N.getMessage('file_operations_manual_save_success');
          flash(successMsg, 'success');
        } else if (resp && resp.ok === false) {
          let errorMsg;
          switch (resp.reason) {
            case 'empty':
              errorMsg = window.GPTPF_I18N.getMessage('errors_no_text_input');
              break;
            case 'busy':
              errorMsg = window.GPTPF_I18N.getMessage('errors_busy_processing');
              break;
            case 'batch_mode_active':
              errorMsg = window.GPTPF_I18N.getMessage('ui_components_batch_manual_action_tip');
              break;
            case 'below_min':
            case 'too_short':
              errorMsg = window.GPTPF_I18N.getMessage('errors_text_too_short_manual');
              break;
            case 'not_supported':
              errorMsg = window.GPTPF_I18N.getMessage('errors_platform_not_supported');
              break;
            case 'no_input':
              errorMsg = window.GPTPF_I18N.getMessage('errors_no_input_field');
              break;
            case 'failed':
              errorMsg = window.GPTPF_I18N.getMessage('errors_attachment_failed');
              break;
            case 'context_invalidated':
              errorMsg = window.GPTPF_I18N.getMessage('extension_reloaded');
              break;
            case 'no_file_input':
              errorMsg = window.GPTPF_I18N.getMessage('errors_no_file_input');
              break;
            case 'connection_failed':
              errorMsg = window.GPTPF_I18N.getMessage('errors_connection_failed');
              break;
            case 'no_response':
              errorMsg = window.GPTPF_I18N.getMessage('errors_no_response');
              break;
            case 'no_tab':
              errorMsg = window.GPTPF_I18N.getMessage('errors_no_tab_access');
              break;
            default:
              errorMsg = window.GPTPF_I18N.getMessage('errors_attachment_failed');
          }
          flash(errorMsg, 'error');
          window.GPTPF_UTILS.checkTelemetryEnabled(enabled => {
            if (enabled) {
              window.GPTPF_UTILS.sendRuntimeMessage({
                type: 'METRIC_EVENT',
                payload: { event: 'manual_save_failed', reason: resp.reason, ts: Date.now() }
              });
            }
          });
        } else {
          const platformMsg = window.GPTPF_I18N.getMessage('not_on_platform');
          flash(platformMsg, 'error');
        }
      });
    });
    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn && chrome?.tabs?.create) {
      likeBtn.addEventListener('click', () => {
        const repo = window.GPTPF_CONFIG?.OFFICIAL_LINKS?.repo;
        chrome.tabs.create({ url: repo });
        const starMsg = window.GPTPF_I18N.getMessage('github_star');
        flash(starMsg, 'success');
        window.GPTPF_UTILS.checkTelemetryEnabled(enabled => {
          if (enabled) {
            window.GPTPF_UTILS.sendRuntimeMessage({
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
[Please describe your ${type === 'support' ? window.GPTPF_I18N.getMessage('feedback_support_description') : type === 'improvement' ? window.GPTPF_I18N.getMessage('feedback_improvement_description') : window.GPTPF_I18N.getMessage('feedback_default_description')} here]
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
          const feedbackMsg = window.GPTPF_I18N.getMessage('feedback_sent');
          flash(feedbackMsg, 'success');
          window.GPTPF_UTILS.checkTelemetryEnabled(enabled => {
            if (enabled) {
              window.GPTPF_UTILS.sendRuntimeMessage({
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
          '7': window.GPTPF_I18N.getMessage('analytics_last_7_days'),
          '30': window.GPTPF_I18N.getMessage('analytics_last_30_days'),
          '90': window.GPTPF_I18N.getMessage('analytics_last_90_days'),
          'all': window.GPTPF_I18N.getMessage('analytics_all_time')
        };
        const selectedLabel = periodLabels[period] || period;
        flash(window.GPTPF_I18N.getMessage('analytics_analytics_updated', [selectedLabel]), 'info');
        window.GPTPF_ANALYTICS.setTimePeriod(period);
        window.GPTPF_ANALYTICS.showAnalyticsLoading();
        setTimeout(() => {
          window.GPTPF_ANALYTICS.loadAnalytics();
          window.GPTPF_ANALYTICS.hideAnalyticsLoading();
        }, window.GPTPF_CONFIG?.UI_TIMINGS?.settingsSaveDelay ?? 300);
      }
    });
    document.getElementById('exportData')?.addEventListener('click', () => {
      window.GPTPF_UTILS.getStorageData(['__analytics_data'], (result) => {
        if (!result) return;
        try {
          const data = result.__analytics_data;
          const now = new Date();
          const ver = window.GPTPF_CONFIG?.VERSION;
          const exportData = {
            ...data,
            metadata: {
              exported: now.toISOString(),
              exportedBy: window.GPTPF_I18N.getMessage('export_by_prefix') + ver,
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
          a.download = `${window.GPTPF_I18N.getMessage('export_filename_prefix')}${now.toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
          const exportMsg = window.GPTPF_I18N.getMessage('analytics_exported');
          flash(exportMsg, 'success');
        } catch (error) {
          const exportErrorMsg = window.GPTPF_I18N.getMessage('errors_export_failed');
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
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.title = window.GPTPF_I18N.getMessage('toggle_theme');
    }
    const customFormat = document.getElementById('customFormat');
    if (customFormat) {
      customFormat.placeholder = window.GPTPF_I18N.getMessage('custom_format_placeholder');
    }
    const aboutClose = document.getElementById('aboutClose');
    if (aboutClose) {
      aboutClose.setAttribute('aria-label', window.GPTPF_I18N.getMessage('close'));
    }
    const feedbackClose = document.querySelector('#feedbackModal .modal-close');
    if (feedbackClose) {
      feedbackClose.setAttribute('aria-label', window.GPTPF_I18N.getMessage('close'));
    }
  }
  initializeSettings();
  initializeEventListeners();
  if (window.GPTPF_I18N) {
    window.GPTPF_I18N.initializeI18n();
  }
  UIStateManager.updateAllStates();
  document.addEventListener('gptpf:translations-updated', () => {
    setTimeout(() => {
      refreshBadgeTranslations();
    }, 50);
  });
  function detectActualPlatform() {
    return new Promise((resolve) => {
      try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs[0] && tabs[0].url) {
            const url = tabs[0].url;
            if (url.includes('chatgpt') || url.includes('openai')) {
              resolve('chatgpt');
            } else if (url.includes('claude')) {
              resolve('claude');
            } else if (url.includes('gemini')) {
              resolve('gemini');
            } else if (url.includes('deepseek')) {
              resolve('deepseek');
            } else if (url.includes('grok')) {
              resolve('grok');
            } else {
              resolve('default');
            }
          } else {
            resolve('default');
          }
        });
      } catch (err) {
        window.GPTPF_DEBUG?.error('debug_platform_detection_error', err);
        resolve('default');
      }
    });
  }
  function sendThemeToContentScript(theme) {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'applyTheme',
            theme: theme
          }).catch(() => {
          });
        }
      });
    } catch (err) {
      window.GPTPF_DEBUG?.error('debug_theme_sync_error', err);
    }
  }
  function sendLanguageToContentScript(language) {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'setLanguage',
            language: language
          }).catch(() => {
          });
        }
      });
    } catch (err) {
      window.GPTPF_DEBUG?.error('debug_language_sync_error', err);
    }
  }
  window.sendLanguageToContentScript = sendLanguageToContentScript;
  function applyThemeColors(theme) {
    window.GPTPF_DEBUG?.log('debug_theme_apply_start', [theme]);
    const root = document.documentElement;
    if (theme === 'default') {
      detectActualPlatform().then((actualPlatform) => {
        window.GPTPF_DEBUG?.log('debug_theme_default_detected', [actualPlatform]);
        if (actualPlatform !== 'default') {
          theme = actualPlatform;
          window.GPTPF_DEBUG?.log('debug_theme_default_using', [theme]);
          const platformColors = window.GPTPF_CONFIG?.PLATFORM_COLORS?.[theme];
          if (platformColors) {
            root.style.setProperty('--brand', platformColors.primary);
            root.style.setProperty('--brand-weak', platformColors.accent);
            root.style.setProperty('--brand-strong', platformColors.secondary);
            window.GPTPF_DEBUG?.log('debug_theme_colors_applied', [theme]);
          }
          sendThemeToContentScript(theme);
        } else {
          root.removeAttribute('data-platform');
          root.style.removeProperty('--brand');
          root.style.removeProperty('--brand-weak');
          root.style.removeProperty('--brand-strong');
          window.GPTPF_DEBUG?.log('debug_theme_default_cleared');
          sendThemeToContentScript('default');
        }
      });
      return;
    }
    root.setAttribute('data-platform', theme);
    const platformColors = window.GPTPF_CONFIG?.PLATFORM_COLORS?.[theme];
    if (platformColors) {
      root.style.setProperty('--brand', platformColors.primary);
      root.style.setProperty('--brand-weak', platformColors.accent);
      root.style.setProperty('--brand-strong', platformColors.secondary);
      window.GPTPF_DEBUG?.log('debug_theme_colors_applied', [theme]);
    }
    if (theme === 'grok') {
      const container = document.querySelector('.container');
      if (container && !container.querySelector('.fx')) {
        const fxElements = ['one', 'two', 'three', 'four'];
        fxElements.forEach(className => {
          const fx = document.createElement('div');
          fx.className = `fx ${className}`;
          container.appendChild(fx);
        });
        window.GPTPF_DEBUG?.log('debug_theme_grok_fx_added');
      }
    }
    window.GPTPF_DEBUG?.log('debug_theme_apply_complete', [theme]);
  }
  function showResetModal() {
    const modal = document.createElement('div');
    modal.className = 'reset-modal-overlay';
    modal.innerHTML = `
      <div class="reset-modal">
        <div class="reset-modal-header">
          <svg class="reset-modal-icon" viewBox="0 0 24 24">
            <path d="M1 4v6h6l-2-2c1.69-1.69 4.14-2.03 6.17-.73l1.41-1.41C10.1 4.27 7.4 4.69 5.41 6.59L4 5H1zm4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0 2.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm15-7v6h-6l2-2c-1.69 1.69-4.14 2.03-6.17.73l-1.41 1.41C10.9 19.73 13.6 19.31 15.59 17.41L17 19h3v-6h-6z"/>
          </svg>
          <h3>${window.GPTPF_I18N.getMessage('reset_modal_title')}</h3>
        </div>
        <div class="reset-modal-body">
          <p>${window.GPTPF_I18N.getMessage('reset_modal_question')}</p>
          <div class="reset-changes">
            <h4>${window.GPTPF_I18N.getMessage('reset_modal_changes_title')}</h4>
            <ul>
              <li>${window.GPTPF_I18N.getMessage('reset_modal_theme_item')}</li>
              <li>${window.GPTPF_I18N.getMessage('reset_modal_debug_item')}</li>
            </ul>
          </div>
          <div class="reset-warning">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            <span>${window.GPTPF_I18N.getMessage('reset_modal_warning')}</span>
          </div>
        </div>
        <div class="reset-modal-actions">
          <button class="reset-modal-btn cancel" id="resetModalCancel">${window.GPTPF_I18N.getMessage('cancel')}</button>
          <button class="reset-modal-btn confirm" id="resetModalConfirm">${window.GPTPF_I18N.getMessage('reset_to_default')}</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
    modal.querySelector('#resetModalCancel').addEventListener('click', closeResetModal);
    modal.querySelector('#resetModalConfirm').addEventListener('click', confirmReset);
  }
  function closeResetModal() {
    const modal = document.querySelector('.reset-modal-overlay');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 200);
    }
  }
  function confirmReset() {
    window.GPTPF_DEBUG?.log('debug_settings_reset_start');
    if (!window.GPTPF_CONFIG?.DEFAULTS) {
      window.GPTPF_DEBUG?.error('debug_config_defaults_missing');
      flash(window.GPTPF_I18N.getMessage('ui_components_config_error'), 'error');
      closeResetModal();
      return;
    }
    const defaults = window.GPTPF_CONFIG.DEFAULTS;
    const settingsToReset = Object.keys(defaults).filter(key => key !== '__schema');
    window.GPTPF_DEBUG?.log('debug_settings_reset_count', [settingsToReset.length]);
    chrome.storage.local.clear(() => {
      if (chrome.runtime.lastError) {
        window.GPTPF_DEBUG?.error('debug_settings_reset_error', [chrome.runtime.lastError.message]);
        flash(window.GPTPF_I18N.getMessage('ui_components_reset_failed') + ': ' + chrome.runtime.lastError.message, 'error');
        closeResetModal();
        return;
      }
      settingsToReset.forEach(key => {
        const defaultValue = defaults[key];
        window.GPTPF_UTILS.setStorageData({ [key]: defaultValue });
        window.GPTPF_DEBUG?.log('debug_setting_reset', [key, defaultValue]);
      });
      const themeSelect = $('#themeSelect');
      const debugLevelSelect = $('#debugLevelSelect');
      const miscToggle = $('#miscToggle');
      if (themeSelect) {
        themeSelect.value = defaults.selectedTheme || 'default';
        applyThemeColors(defaults.selectedTheme || 'default');
      }
      if (debugLevelSelect) {
        debugLevelSelect.value = defaults.debugLevel || 'errors';
      }
      if (miscToggle) {
        miscToggle.checked = defaults.showDebug || false;
        const miscOptions = $('#miscOptions');
        if (miscOptions) {
          if (defaults.showDebug) {
            miscOptions.classList.add('show');
          } else {
            miscOptions.classList.remove('show');
          }
        }
      }
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG.updateSettings();
      }
      window.GPTPF_DEBUG?.log('debug_settings_reset_complete');
      closeResetModal();
      setTimeout(() => {
        flash(window.GPTPF_I18N.getMessage('settings_reset'), 'success');
        setTimeout(() => {
          window.GPTPF_DEBUG?.log('debug_ui_refresh_after_reset');
          initializeSettings();
        }, 100);
      }, 300);
    });
  }
  function refreshBadgeTranslations() {
    try {
      const betaBadges = document.querySelectorAll('.beta-badge[data-i18n="beta"]');
      betaBadges.forEach(badge => {
        const message = window.GPTPF_I18N?.getMessage?.('beta');
        if (message) {
          badge.textContent = message;
        }
      });
      const allBetaBadges = document.querySelectorAll('.beta-badge');
      allBetaBadges.forEach(badge => {
        const message = window.GPTPF_I18N?.getMessage?.('beta');
        if (message) {
          badge.textContent = message;
        }
      });
      const batchBadges = document.querySelectorAll('.batch-disabled-badge');
      batchBadges.forEach(badge => {
        const message = window.GPTPF_I18N?.getMessage?.('batch_active_badge');
        if (message) {
          badge.textContent = message;
        }
      });
      window.GPTPF_DEBUG?.log('debug_badges_refreshed');
    } catch (err) {
      window.GPTPF_DEBUG?.error('debug_badge_refresh_error', err);
    }
  }
  window.applyThemeColors = applyThemeColors;
  window.showResetModal = showResetModal;
  window.closeResetModal = closeResetModal;
  window.confirmReset = confirmReset;
  window.refreshBadgeTranslations = refreshBadgeTranslations;
  window.addEventListener('beforeunload', () => {
    if (window.GPTPF_DEBUG) {
      window.GPTPF_DEBUG.info('popup_cleanup', window.GPTPF_I18N.getMessage('popup_cleanup_complete'));
    }
  });
})();
