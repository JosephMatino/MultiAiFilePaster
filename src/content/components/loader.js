/*
 * ================================================================================
 * Multi-AI File Paster Chrome Extension | Production Release v1.1.0
 * ================================================================================
 *
 * MODULE: src/content/components/loader.js
 * FUNCTION: Loading indicator component
 * ARCHITECTURE: UI Component with Animation and State Management
 *
 * DEVELOPMENT TEAM:
 * • Lead Developer: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • Scrum Master: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 *
 * ORGANIZATION: WekTurbo Designs - Hostwek LTD | https://hostwek.com/wekturbo
 * REPOSITORY: https://github.com/JosephMatino/MultiAiFilePaster
 * TECHNICAL SUPPORT: wekturbo@hostwek.com
 *
 * PLATFORM INTEGRATIONS: Loading states, user feedback, progress indication
 * CORE DEPENDENCIES: DOM manipulation, CSS animations, state management
 *
 * Copyright (c) 2025 WekTurbo Designs - Hostwek LTD. All rights reserved.
 * Licensed under MIT License | https://opensource.org/licenses/MIT
 * ================================================================================
 */

class LoaderComponent {
  constructor() {
    this.currentLoader = null;
    this.currentDelay = null;
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

  show(text) {
    const box = this.ensureHost("gptpf-loader");

    while (box.firstChild) box.removeChild(box.firstChild);
    const dot = document.createElement("span");
    dot.className = "spinner";
    const txt = document.createElement("span");
    txt.textContent = text;
    box.appendChild(dot);
    box.appendChild(txt);

    this.currentLoader = box;
  }

  hide() {
    const el = document.getElementById("gptpf-loader"); 
    if (el) el.remove();
    this.currentLoader = null;
  }

  delayCountdown(ms) {
    return new Promise((resolve, reject) => {
      try {
        const old = document.getElementById('gptpf-delay');
        if (old) old.remove();

        const box = this.ensureHost('gptpf-delay');

        while (box.firstChild) box.removeChild(box.firstChild);
        const dot = document.createElement('span');
        dot.className = "spinner";
        const txt = document.createElement('span');
        const cancel = document.createElement('button');
        cancel.textContent = 'Cancel';
        box.appendChild(dot);
        box.appendChild(txt);
        box.appendChild(cancel);

        let cancelled = false;
        let rem = Math.max(0, Math.ceil(ms/1000));
        function render(){ txt.textContent = `Attaching in ${rem}s…`; }
        render();
        const iv = setInterval(()=>{ if (rem>0){ rem -= 1; render(); } }, 1000);
        const timer = setTimeout(()=>{ if (cancelled) return; clearInterval(iv); box.remove(); resolve(); }, ms);
        cancel.addEventListener('click', ()=>{ cancelled = true; clearTimeout(timer); clearInterval(iv); box.remove(); reject(new Error('cancelled')); });

        this.currentDelay = { box, timer, iv, cancelled: () => cancelled };
      } catch {
        resolve();
      }
    });
  }
}

window.LoaderComponent = LoaderComponent;
