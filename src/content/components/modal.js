/*
 * ================================================================================
 * Multi-AI File Paster Chrome Extension | Production Release v1.1.0
 * ================================================================================
 *
 * MODULE: src/content/components/modal.js
 * FUNCTION: Modal dialog component
 * ARCHITECTURE: UI Component with Validation and Accessibility
 *
 * DEVELOPMENT TEAM:
 * • Lead Developer: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • Scrum Master: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 *
 * ORGANIZATION: WekTurbo Designs - Hostwek LTD | https://hostwek.com/wekturbo
 * REPOSITORY: https://github.com/JosephMatino/MultiAiFilePaster
 * TECHNICAL SUPPORT: wekturbo@hostwek.com
 *
 * PLATFORM INTEGRATIONS: File renaming, user input validation, modal dialogs
 * CORE DEPENDENCIES: DOM manipulation, keyboard navigation, accessibility APIs
 *
 * Copyright (c) 2025 WekTurbo Designs - Hostwek LTD. All rights reserved.
 * Licensed under MIT License | https://opensource.org/licenses/MIT
 * ================================================================================
 */

class RenameModal {
  constructor() {
    this.currentModal = null;
  }

  show() {
    return new Promise((resolve, reject) => {
      try {
        const old = document.getElementById('gptpf-rename');
        if (old) old.remove();

        const wrap = document.createElement('div');
        wrap.id = 'gptpf-rename';
        wrap.setAttribute('role','dialog');
        wrap.setAttribute('aria-modal','true');

        const backdrop = document.createElement('div');
        backdrop.className = 'backdrop';

        const card = document.createElement('div');
        card.className = 'card';
        card.tabIndex = -1;

        const title = document.createElement('div');
        title.className = 'title';
        title.textContent = 'Rename file';

        const desc = document.createElement('div');
        desc.className = 'description';
        desc.textContent = 'Enter a filename (without extension). Leave blank to use the default name.';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'e.g. conversation-notes';
        input.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ ok(); } });

        const hint = document.createElement('div');
        hint.className = 'hint';
        hint.textContent = 'Allowed: letters, numbers, spaces, dashes, underscores (max 64). No extension.';

        const hint2 = document.createElement('div');
        hint2.className = 'hint-keys';
        hint2.innerHTML = 'Press <span class="key">Enter</span> to save · <span class="key">Esc</span> to cancel';

        const err = document.createElement('div');
        err.className = 'error';

        const row = document.createElement('div');
        row.className = 'buttons';
        const cancel = document.createElement('button');
        cancel.className = 'cancel-btn';
        cancel.textContent = 'Cancel';
        const confirm = document.createElement('button');
        confirm.className = 'confirm-btn';
        confirm.textContent = 'Save';

        row.appendChild(cancel); 
        row.appendChild(confirm);
        card.appendChild(title); 
        card.appendChild(desc); 
        card.appendChild(input); 
        card.appendChild(hint); 
        card.appendChild(hint2); 
        card.appendChild(err); 
        card.appendChild(row);
        wrap.appendChild(backdrop); 
        wrap.appendChild(card);
        document.documentElement.appendChild(wrap);

        let lastFocus = document.activeElement;
        function close(){ wrap.remove(); try{ lastFocus && lastFocus.focus && lastFocus.focus(); }catch{} }
        function validate(){
          const original = (input.value || '').trim();

          if (window.GPTPF_VALIDATION) {
            const result = window.GPTPF_VALIDATION.sanitizeFileName(original);

            if (result.hadDots) {
              err.textContent = 'No dots or extensions needed - file format is set in the extension popup.';
              confirm.disabled = false;
              return result.sanitized;
            }

            if (!result.sanitized && original) {
              err.textContent = 'Only letters, numbers, spaces, dashes and underscores are allowed.';
              confirm.disabled = true;
              return;
            }

            err.textContent = '';
            confirm.disabled = false;
            return result.sanitized;
          }

          const fallbackResult = { sanitized: '', hadDots: false };
          fallbackResult.sanitized = original.replace(/\./g, '').replace(/[^A-Za-z0-9 _-]+/g,'-').replace(/\s+/g,'-');
          fallbackResult.sanitized = fallbackResult.sanitized.replace(/^[-_]+|[-_]+$/g,'').slice(0,64);
          fallbackResult.hadDots = original.includes('.');

          if (fallbackResult.hadDots) {
            err.textContent = 'No dots or extensions needed - file format is set in the extension popup.';
            confirm.disabled = false;
            return fallbackResult.sanitized;
          }

          if (!fallbackResult.sanitized && original) {
            err.textContent = 'Only letters, numbers, spaces, dashes and underscores are allowed.';
            confirm.disabled = true;
            return;
          }

          err.textContent = '';
          confirm.disabled = false;
          return fallbackResult.sanitized;
        }
        input.addEventListener('input', validate);
        function ok(){ const v = validate(); const out = v || ''; close(); resolve(out); }
        function no(){ close(); reject(new Error('cancelled')); }

        cancel.addEventListener('click', no);
        confirm.addEventListener('click', ok);
        backdrop.addEventListener('click', no);
        document.addEventListener('keydown', onEsc, true);
        document.addEventListener('focus', trapFocus, true);
        function onEsc(e){ if(e.key==='Escape'){ e.preventDefault(); cleanup(); no(); } }
        function trapFocus(e){ if (!wrap.contains(e.target)) { e.preventDefault(); card.focus(); } }
        function cleanup(){ document.removeEventListener('keydown', onEsc, true); document.removeEventListener('focus', trapFocus, true); }

        setTimeout(()=>{ card.focus(); input.focus(); input.select(); }, 0);
        
        this.currentModal = wrap;
      } catch { 
        reject(new Error('cancelled')); 
      }
    });
  }

  hide() {
    if (this.currentModal) {
      this.currentModal.remove();
      this.currentModal = null;
    }
  }
}

window.RenameModal = RenameModal;
