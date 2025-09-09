/*
 * ================================================================================
 * Multi-AI File Paster Chrome Extension | Production Release v1.1.0
 * ================================================================================
 *
 * MODULE: src/content/components/toast.js
 * FUNCTION: Toast notification component
 * ARCHITECTURE: UI Component with Auto-dismiss and Action Buttons
 *
 * DEVELOPMENT TEAM:
 * • Lead Developer: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • Scrum Master: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 *
 * ORGANIZATION: WekTurbo Designs - Hostwek LTD | https://hostwek.com/wekturbo
 * REPOSITORY: https://github.com/JosephMatino/MultiAiFilePaster
 * TECHNICAL SUPPORT: wekturbo@hostwek.com
 *
 * PLATFORM INTEGRATIONS: User notifications, success/error feedback, action buttons
 * CORE DEPENDENCIES: DOM manipulation, timer management, accessibility APIs
 *
 * Copyright (c) 2025 WekTurbo Designs - Hostwek LTD. All rights reserved.
 * Licensed under MIT License | https://opensource.org/licenses/MIT
 * ================================================================================
 */

class ToastComponent {
  constructor() {
    this.currentToast = null;
  }

  ensureHost(id) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      document.documentElement.appendChild(el);
    }
    return el;
  }

  show(text, ok = true, action = null, level = (ok ? 'success' : 'error')) {
    const el = this.ensureHost("gptpf-toast");

    const cls = level === 'error' ? 'error' : (level === 'success' ? 'success' : 'info');
    el.className = cls;

    try {
      el.setAttribute('role', cls === 'error' ? 'alert' : 'status');
      el.setAttribute('aria-live', cls === 'error' ? 'assertive' : 'polite');
      el.setAttribute('aria-atomic','true');
    } catch(err) { void err; }

    while (el.firstChild) el.removeChild(el.firstChild);

    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden','true');
    icon.className = 'gptpf-toast-icon';

    if (cls === 'success') {
      icon.classList.add('gptpf-toast-icon-success');
      icon.innerHTML = '<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M9 1L3.5 6.5L1 4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    } else if (cls === 'error') {
      icon.classList.add('gptpf-toast-icon-error');
      icon.innerHTML = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7.5 2.5L2.5 7.5M2.5 2.5L7.5 7.5" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>';
    } else {
      icon.classList.add('gptpf-toast-icon-info');
      const dot = document.createElement('span');
      dot.className = 'gptpf-toast-spinner';
      icon.appendChild(dot);
    }
    el.appendChild(icon);

    const span = document.createElement("span");
    span.textContent = text;
    el.appendChild(span);

    let timeout = cls === 'info' ? 1600 : 2400;
    if (action && action.label && typeof action.onClick === "function"){
      const btn = document.createElement("button");
      btn.textContent = action.label;
      btn.addEventListener("click", (e)=>{
        e.preventDefault();
        btn.disabled = true;
        action.onClick(btn);
      });
      el.appendChild(btn);
      timeout = 4200;
    }

    el.classList.add('show');
    clearTimeout(el._h);
    el._h = setTimeout(()=>{
      el.classList.remove('show');
      el.classList.add('hide');
    }, timeout);

    this.currentToast = el;
  }

  hide() {
    if (this.currentToast) {
      this.currentToast.classList.remove('show');
      this.currentToast.classList.add('hide');
      setTimeout(() => {
        if (this.currentToast && this.currentToast.parentNode) {
          this.currentToast.remove();
        }
      }, 200);
      this.currentToast = null;
    }
  }

  success(text, action = null) {
    this.show(text, true, action);
  }

  error(text, action = null) {
    this.show(text, false, action);
  }
}

window.ToastComponent = ToastComponent;
