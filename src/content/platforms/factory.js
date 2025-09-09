/*
 * ================================================================================
 * Multi-AI File Paster Chrome Extension | Production Release v1.1.0
 * ================================================================================
 *
 * MODULE: src/content/platforms/factory.js
 * FUNCTION: Platform factory for creating platform-specific handlers
 * ARCHITECTURE: Factory Pattern with Centralized Configuration Management
 *
 * DEVELOPMENT TEAM:
 * • Lead Developer: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • Scrum Master: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 *
 * ORGANIZATION: WekTurbo Designs - Hostwek LTD | https://hostwek.com/wekturbo
 * REPOSITORY: https://github.com/JosephMatino/MultiAiFilePaster
 * TECHNICAL SUPPORT: wekturbo@hostwek.com
 *
 * PLATFORM INTEGRATIONS: Platform detection, handler instantiation, configuration
 * CORE DEPENDENCIES: Platform handlers, centralized configuration system
 *
 * Copyright (c) 2025 WekTurbo Designs - Hostwek LTD. All rights reserved.
 * Licensed under MIT License | https://opensource.org/licenses/MIT
 * ================================================================================
 */

class PlatformFactory {
  static platforms = (() => {
    const map = { chatgpt: 'ChatGPTPlatform', claude: 'ClaudePlatform', gemini: 'GeminiPlatform', deepseek: 'DeepSeekPlatform', grok: 'GrokPlatform' };
    const doms = (window.GPTPF_CONFIG && window.GPTPF_CONFIG.PLATFORM_DOMAINS) || {};
    return Object.keys(map).map(name => ({ name, class: map[name], urls: doms[name] || [] }));
  })();

  static getCurrentPlatform() {
    const url = window.location.href;
    
    for (const platform of this.platforms) {
      if (platform.urls.some(u => url.includes(u))) {
        return platform.name;
      }
    }
    
    return 'unknown';
  }

  static createPlatformHandler() {
    const currentPlatform = this.getCurrentPlatform();
    
    for (const platform of this.platforms) {
      if (platform.name === currentPlatform) {
        const PlatformClass = window[platform.class];
        if (PlatformClass) {
          return new PlatformClass();
        }
      }
    }
    
    return null;
  }

  static getPlatformSettings(baseSettings) {
    const platform = this.getCurrentPlatform();
    const timeouts = (window.GPTPF_CONFIG && window.GPTPF_CONFIG.PLATFORM_TIMEOUTS) || {};
    const merged = {
      ...baseSettings,
      timeout: timeouts[platform] || timeouts.default || 3000,
      ...(platform === 'gemini' ? { useDelay: false, delaySeconds: 0 } : {})
    };

    const handler = this.createPlatformHandler();
    if (handler && typeof handler.getPlatformSettings === 'function') {
      const hs = handler.getPlatformSettings(merged) || merged;
      return {
        ...hs,
        timeout: merged.timeout,
        ...(platform === 'gemini' ? { useDelay: merged.useDelay, delaySeconds: merged.delaySeconds } : {})
      };
    }
    return merged;
  }

  static isSupportedPlatform() {
    return this.getCurrentPlatform() !== 'unknown';
  }

  static getSupportedPlatforms() {
    return this.platforms.map(p => p.name);
  }
}

window.PlatformFactory = PlatformFactory;
