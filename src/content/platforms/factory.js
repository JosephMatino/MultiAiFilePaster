/*
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: src/content/platforms/factory.js
 * FUNCTION: Platform factory for creating platform-specific handlers
 * ARCHITECTURE: Chrome Extension Manifest V3 with Factory Pattern
 * SECURITY: Client-side processing, zero data transmission, privacy-first
 * PERFORMANCE: Optimized content script, efficient DOM manipulation, lazy loading
 * COMPATIBILITY: Chrome 88+, Edge 88+, Opera 74+, cross-platform AI support
 * RELIABILITY: Quality error handling, graceful degradation, stable operation
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
 * • PLATFORM INTEGRATIONS: ChatGPT, Claude, Gemini, DeepSeek, Grok
 * • CORE DEPENDENCIES: Platform Factory, Language Detector, File Attachment System
 * • FEATURES: Multi-platform support, file compression, batch processing, analytics
 * • TESTING: Automated unit tests, integration tests, cross-platform validation
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
 * Hostwek LTD through designated channels: dev@josephmatino.com for technical
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
class PlatformFactory {
  static platforms = (() => {
    const map = { chatgpt: 'ChatGPTPlatform', claude: 'ClaudePlatform', gemini: 'GeminiPlatform', deepseek: 'DeepSeekPlatform', grok: 'GrokPlatform' };
    const doms = window.GPTPF_CONFIG?.PLATFORM_DOMAINS ?? {};
    return Object.keys(map).map(name => ({ name, class: map[name], urls: doms[name] ?? [] }));
  })();
  static getCurrentPlatform() {
    window.GPTPF_DEBUG?.log('debug_factory_get_platform');
    const url = window.location.href;
    for (const platform of this.platforms) {
      if (platform.urls.some(u => url.includes(u))) {
        window.GPTPF_DEBUG?.log('debug_factory_platform_detected', platform.name);
        return platform.name;
      }
    }
    window.GPTPF_DEBUG?.warn('debug_factory_unknown_platform');
    return 'unknown';
  }
  static createPlatformHandler() {
    window.GPTPF_DEBUG?.log('debug_factory_create_handler');
    const currentPlatform = this.getCurrentPlatform();
    for (const platform of this.platforms) {
      if (platform.name === currentPlatform) {
        const PlatformClass = window[platform.class];
        if (PlatformClass) {
          window.GPTPF_DEBUG?.log('debug_factory_handler_created', platform.name);
          return new PlatformClass();
        }
      }
    }
    window.GPTPF_DEBUG?.warn('debug_factory_no_handler');
    return null;
  }
  static getPlatformSettings(baseSettings) {
    window.GPTPF_DEBUG?.log('debug_factory_get_settings');
    const platform = this.getCurrentPlatform();
    const timeouts = window.GPTPF_CONFIG?.PLATFORM_TIMEOUTS ?? {};
    const merged = {
      ...baseSettings,
      timeout: timeouts[platform] ?? timeouts.default ?? 3000,
      ...(platform === 'gemini' ? { useDelay: false, delaySeconds: 0 } : {})
    };
    const handler = this.createPlatformHandler();
    if (handler && typeof handler.getPlatformSettings === 'function') {
      const hs = handler.getPlatformSettings(merged) ?? merged;
      window.GPTPF_DEBUG?.log('debug_factory_settings_configured');
      return {
        ...hs,
        timeout: merged.timeout,
        ...(platform === 'gemini' ? { useDelay: merged.useDelay, delaySeconds: merged.delaySeconds } : {})
      };
    }
    window.GPTPF_DEBUG?.log('debug_factory_default_settings');
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