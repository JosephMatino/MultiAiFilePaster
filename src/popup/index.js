/*
 * ================================================================================
 * Multi-AI File Paster Chrome Extension | Production Release v1.1.0
 * ================================================================================
 *
 * MODULE: src/popup/index.js
 * FUNCTION: Main popup interface controller and settings management
 * ARCHITECTURE: Chrome Extension Popup with Modular Components
 *
 * DEVELOPMENT TEAM:
 * • Lead Developer: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • Scrum Master: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 *
 * ORGANIZATION: WekTurbo Designs - Hostwek LTD | https://hostwek.com/wekturbo
 * REPOSITORY: https://github.com/JosephMatino/MultiAiFilePaster
 * TECHNICAL SUPPORT: wekturbo@hostwek.com
 *
 * PLATFORM INTEGRATIONS: Settings management, platform detection, user interface
 * CORE DEPENDENCIES: Chrome Extension APIs, Configuration System, Modular Components
 *
 * Copyright (c) 2025 WekTurbo Designs - Hostwek LTD. All rights reserved.
 * Licensed under MIT License | https://opensource.org/licenses/MIT
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
    opts.push({v:'back', t:'← Back to main'});

    extendedPages[pageIndex].forEach(v => {
      opts.push({v, t: v === 'custom' ? 'Custom' : `.${v}`});
    });

    if (pageIndex > 0) opts.push({v:'prev', t:'← Previous'});
    if (pageIndex < extendedPages.length - 1) opts.push({v:'next', t:'Next →'});

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
      setTimeout(() => { if (sr.textContent === msg) sr.textContent = ''; }, 2500);
    }

    try {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs && tabs[0];
        const u = tab?.url || '';
        const map = (window.GPTPF_CONFIG && window.GPTPF_CONFIG.PLATFORM_DOMAINS) || {};
        const list = Object.values(map).reduce((a,b)=>a.concat(b||[]), []);
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
  const saveSetting = (key, val) => {
    __savePending = true;
    if (!__saveBatchTimer) {
      flash('Saving settings…', 'info');
    }
    clearTimeout(__saveBatchTimer);

    chrome.storage.local.set({ [key]: val }, () => {
      __saveBatchTimer = setTimeout(() => {
        if (__savePending) {
          flash('Settings saved.', 'success');
        }
        __savePending = false;
        __saveBatchTimer = 0;
      }, 300);
    });
  };

  function initializeSettings() {
    GPTPF_CONFIG.getConfig(() => {
      chrome.storage.local.get([
        'wordLimit', 'useDelay', 'delaySeconds', 'fileFormat', 'batchMode', 'telemetryEnabled', 'showDebug', 'autoAttachEnabled', 'claudeOverride'
      ], res => {
        $('#wordLimit').value = res.wordLimit ?? 200;
        $('#delayToggle').checked = !!res.useDelay;
        const delayWrap = document.getElementById('delaySecondsWrap');
        if (delayWrap) delayWrap.hidden = !res.useDelay;
        $('#delaySeconds').value = res.delaySeconds ?? 3;
        
        const fileFormat = res.fileFormat || 'auto';
        const customInput = document.getElementById('customFormat');
        const moreFormats = document.getElementById('moreFormats');
        const mainFormats = ['auto', 'txt', 'js', 'py', 'html', 'json', 'md'];
        const inAnyExtended = (v) => extendedPages.some(p => p.includes(v));
        const customInputRow = document.getElementById('customInputRow');

        if (fileFormat.startsWith('.') && ![...mainFormats].includes(fileFormat)) {
          const clean = fileFormat.replace(/^\./,'');
          if (inAnyExtended(clean)) {
            morePage = extendedPages.findIndex(p => p.includes(clean));
            $('#formatSelect').style.display = 'none';
            moreFormats.style.display = 'block';
            if (customInputRow) customInputRow.style.display = 'none';
            renderMore(morePage, clean);
          } else {
            $('#formatSelect').style.display = 'none';
            moreFormats.style.display = 'block';
            renderMore(extendedPages.length-1);
            moreFormats.value = 'custom';
            customInput.value = clean;
            if (customInputRow) customInputRow.style.display = 'flex';
          }
        } else if (inAnyExtended(fileFormat)) {
          morePage = extendedPages.findIndex(p => p.includes(fileFormat));
          $('#formatSelect').style.display = 'none';
          moreFormats.style.display = 'block';
          if (customInputRow) customInputRow.style.display = 'none';
          renderMore(morePage, fileFormat);
        } else {
          $('#formatSelect').value = fileFormat;
          moreFormats.style.display = 'none';
          if (customInputRow) customInputRow.style.display = 'none';
        }
        
        $('#telemetryToggle').checked = res.telemetryEnabled !== false;
        $('#batchToggle').checked = !!res.batchMode;
        $('#debugRow').style.display = res.showDebug ? 'flex' : 'none';
        $('#attachToggle').checked = res.autoAttachEnabled !== false;
        $('#claudeOverrideToggle').checked = res.claudeOverride !== false;

        const analyticsSection = document.getElementById('analyticsSection');
        if (analyticsSection) {
          const telemetryEnabled = res.telemetryEnabled !== false;
          analyticsSection.style.display = telemetryEnabled ? 'block' : 'none';
          if (telemetryEnabled && window.GPTPF_ANALYTICS) {
            window.GPTPF_ANALYTICS.showAnalyticsLoading();
            setTimeout(() => {
              window.GPTPF_ANALYTICS.loadAnalytics();
              window.GPTPF_ANALYTICS.hideAnalyticsLoading();
            }, 200);
          }
        }

        initializePlatformDetection();
        initializeLinks();
      });
    });
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
        const url = tab?.url || '';
        let isOnClaude = false;
        try {
          const host = new URL(url).hostname;
          const list = (window.GPTPF_CONFIG && window.GPTPF_CONFIG.PLATFORM_DOMAINS && window.GPTPF_CONFIG.PLATFORM_DOMAINS.claude) || [];
          isOnClaude = list.some(d => host.includes(d));
        } catch(err) { void err; }
        if (claudeRow) claudeRow.hidden = !isOnClaude;

        if (isChat && statusIndicator && currentModel) {
          let modelName = 'AI Model';
          try {
            const host = new URL(url).hostname;
            const pd = (window.GPTPF_CONFIG && window.GPTPF_CONFIG.PLATFORM_DOMAINS) || {};
            if ((pd.chatgpt||[]).some(d=>host.includes(d))) modelName = 'ChatGPT';
            else if ((pd.claude||[]).some(d=>host.includes(d))) modelName = 'Claude';
            else if ((pd.gemini||[]).some(d=>host.includes(d))) modelName = 'Gemini';
            else if ((pd.deepseek||[]).some(d=>host.includes(d))) modelName = 'DeepSeek';
            else if ((pd.grok||[]).some(d=>host.includes(d))) modelName = 'Grok';
          } catch(err) { void err; }

          currentModel.textContent = modelName;
          statusIndicator.hidden = false;
        } else if (statusIndicator) {
          statusIndicator.hidden = true;
        }
      });

      if (banner) banner.hidden = isChat;
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
        if (!isChat) saveBtn.title = 'Open AI chat and type text to attach as file'; else saveBtn.removeAttribute('title');
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
          const dom = pd.chatgpt.map(d => `<code>${d}</code>`).join(' and ');
          out.push(`<li><strong>OpenAI ChatGPT:</strong> Full support for both ${dom}</li>`);
        }
        if (pd.claude && pd.claude.length) {
          out.push(`<li><strong>Anthropic Claude:</strong> Advanced integration with <code>${pd.claude[0]}</code> including override for built-in features</li>`);
        }
        if (pd.gemini && pd.gemini.length) {
          out.push(`<li><strong>Google Gemini:</strong> Optimized file handling for <code>${pd.gemini[0]}</code></li>`);
        }
        if (pd.deepseek && pd.deepseek.length) {
          out.push(`<li><strong>DeepSeek AI:</strong> Complete compatibility with <code>${pd.deepseek[0]}</code></li>`);
        }
        if (pd.grok && pd.grok.length) {
          out.push(`<li><strong>Grok:</strong> Standard integration with <code>${pd.grok[0]}</code> (attach button + drag-drop)</li>`);
        }
        listEl.innerHTML = out.join('\n');
      }
    } catch(err) { void err; }
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
        $('#formatSelect').style.display = 'none';
        moreFormats.style.display = 'block';
        if (customInputRow) customInputRow.style.display = 'none';
        morePage = 0;
        renderMore(morePage);
        moreFormats.focus();
        flash('More formats loaded', 'info');
      } else {
        if (customInputRow) customInputRow.style.display = 'none';
        saveSetting('fileFormat', value);
      }
    });

    $('#moreFormats').addEventListener('change', e => {
      const value = e.target.value;
      const formatSelect = document.getElementById('formatSelect');
      const customInput = document.getElementById('customFormat');
      const customInputRow = document.getElementById('customInputRow');

      if (value === 'back') {
        $('#moreFormats').style.display = 'none';
        formatSelect.style.display = 'block';
        if (customInputRow) customInputRow.style.display = 'none';
        formatSelect.focus();
        flash('Back to main formats', 'success');
        return;
      }

      if (value === 'next') {
        morePage = Math.min(morePage + 1, extendedPages.length - 1);
        renderMore(morePage);
        flash('Next page loaded', 'success');
        return;
      }

      if (value === 'prev') {
        morePage = Math.max(morePage - 1, 0);
        renderMore(morePage);
        flash('Previous page loaded', 'success');
        return;
      }

      if (value === 'custom') {
        if (customInputRow) customInputRow.style.display = 'flex';
        customInput.focus();
        flash('Enter custom extension', 'info');
        return;
      }

      if (value && !['back', 'next', 'prev', 'custom'].includes(value)) {
        if (customInputRow) customInputRow.style.display = 'none';
        saveSetting('fileFormat', value);
        flash(`Format set to .${value}`, 'success');
      }
    });

    $('#customFormat').addEventListener('blur', e => {
      const input = (e.target.value || '').trim();
      if (!input) return;

      const result = window.GPTPF_VALIDATION?.validateCustomExtension(input);
      if (!result) {
        flash('Validation system not available', 'error');
        return;
      }

      if (!result.valid) {
        flash(result.error, 'error');
        e.target.value = '';
        return;
      }

      saveSetting('fileFormat', result.extension);
      flash(`Custom format set to ${result.extension}`, 'success');
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
        analyticsSection.style.display = enabled ? 'block' : 'none';
        if (enabled && window.GPTPF_ANALYTICS) {
          window.GPTPF_ANALYTICS.showAnalyticsLoading();
          setTimeout(() => {
            window.GPTPF_ANALYTICS.loadAnalytics();
            window.GPTPF_ANALYTICS.hideAnalyticsLoading();
          }, 200);
        }
      }
    });
    $('#batchToggle').addEventListener('change', e => saveSetting('batchMode', e.target.checked));
    $('#attachToggle').addEventListener('change', e => saveSetting('autoAttachEnabled', e.target.checked));
    $('#claudeOverrideToggle').addEventListener('change', e => saveSetting('claudeOverride', e.target.checked));

    $('#saveNow').addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'SAVE_CURRENT_MESSAGE' }, resp => {
        if (chrome.runtime.lastError) {
          flash('Extension error: ' + chrome.runtime.lastError.message, 'error');
        } else if (resp && resp.ok) {
          flash('Successfully attached text as file', 'success');
        } else if (resp && resp.ok === false) {
          if (resp.reason === 'empty') {
            flash('No text found in chat input. Type your message first.', 'error');
          } else if (resp.reason === 'busy') {
            flash('Another file attachment is in progress. Please wait.', 'error');
          } else if (resp.reason === 'below_min') {
            flash('Text too short for manual save. Either add more text or lower the Min Words setting.', 'error');
          } else if (resp.reason === 'too_short') {
            flash('Text too short. Manual save requires at least 5 words.', 'error');
          } else if (resp.reason === 'not_supported') {
            flash('This AI platform is not supported. Try ChatGPT, Claude, Gemini, DeepSeek, or Grok.', 'error');
          } else if (resp.reason === 'no_input') {
            flash('Cannot find chat input field. Make sure you are on a supported AI chat page.', 'error');
          } else if (resp.reason === 'failed') {
            flash('File attachment failed. Check your internet connection and try again.', 'error');
          } else if (resp.reason === 'context_invalidated') {
            flash('Extension was reloaded. Please refresh the AI chat page and try again.', 'error');
          } else if (resp.reason === 'no_file_input') {
            flash('Cannot find file upload area. Try clicking the attachment button on the platform first.', 'error');
          } else if (resp.reason === 'connection_failed') {
            flash('Cannot connect to the page. Please refresh and try again.', 'error');
          } else if (resp.reason === 'no_response') {
            flash('No response from the page. Please refresh and try again.', 'error');
          } else if (resp.reason === 'no_tab') {
            flash('Cannot access the current tab. Please try again.', 'error');
          } else {
            flash('Unable to attach file. Refresh the page and try again.', 'error');
          }

          chrome.storage.local.get('telemetryEnabled', res => {
            if (res.telemetryEnabled) {
              chrome.runtime.sendMessage({
                type: 'METRIC_EVENT',
                payload: { event: 'manual_save_failed', reason: resp.reason || 'unknown', ts: Date.now() }
              });
            }
          });
        } else {
          flash('Not on a supported AI platform. Open ChatGPT, Claude, Gemini, DeepSeek, or Grok first.', 'error');
        }
      });
    });

    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn && chrome?.tabs?.create) {
      likeBtn.addEventListener('click', () => {
        const repo = (window.GPTPF_CONFIG && window.GPTPF_CONFIG.OFFICIAL_LINKS && window.GPTPF_CONFIG.OFFICIAL_LINKS.repo) || 'https://github.com/JosephMatino/MultiAiFilePaster';
        chrome.tabs.create({ url: repo });
        flash('⭐ Thanks! Opening GitHub to star the repository.', 'success');

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

    document.getElementById('timePeriod')?.addEventListener('change', (e) => {
      if (window.GPTPF_ANALYTICS) {
        window.GPTPF_ANALYTICS.setTimePeriod(e.target.value);
        window.GPTPF_ANALYTICS.showAnalyticsLoading();
        setTimeout(() => {
          window.GPTPF_ANALYTICS.loadAnalytics();
          window.GPTPF_ANALYTICS.hideAnalyticsLoading();
        }, 300);
      }
    });

    document.getElementById('exportData')?.addEventListener('click', () => {
      chrome.storage.local.get(['__analytics_data'], (result) => {
        try {
          const data = result.__analytics_data || {};
          const now = new Date();
          const ver = (window.GPTPF_CONFIG && (window.GPTPF_CONFIG.VERSION || window.GPTPF_CONFIG.__v)) || 'unknown';
          const exportData = {
            ...data,
            metadata: {
              exported: now.toISOString(),
              exportedBy: 'Multi-AI File Paster v' + ver,
              totalEntries: (data.history || []).length,
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
          a.download = `multi-ai-paster-analytics-${now.toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);

          flash('Analytics data exported successfully', 'success');
        } catch (error) {
          flash('Export failed. Please try again.', 'error');
        }
      });
    });

    if (window.GPTPF_TOOLTIPS) {
      window.GPTPF_TOOLTIPS.initTooltips();
    }
    if (window.GPTPF_MODALS) {
      window.GPTPF_MODALS.initModals();
    }
  }

  initializeSettings();
  initializeEventListeners();
})();
