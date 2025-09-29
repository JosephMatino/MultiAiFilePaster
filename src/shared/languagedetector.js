/*
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: src/shared/languagedetector.js
 * FUNCTION: Smart language detection with pattern recognition for 20+ file formats
 * ARCHITECTURE: Chrome Extension Manifest V3, modular event-driven design
 * SECURITY: Client-side processing, zero data transmission, privacy-first
 * PERFORMANCE: Optimized for Chrome V3 Manifest, lazy loading, efficient DOM
 * COMPATIBILITY: Chrome 88+, Edge 88+, Opera 74+, modern browser APIs
 * RELIABILITY: Production error handling, graceful degradation, stable operation
 *
 * DEVELOPMENT TEAM & PROJECT LEADERSHIP:
 * • LEAD DEVELOPER: Joseph Matino <dev@josephmatino.com> | https:
 * • SCRUM MASTER & PROJECT FUNDING: Majok Deng <scrum@majokdeng.com> | https:
 * • QUALITY ASSURANCE: Automated testing pipeline
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
 * � CONFIDENTIALITY & TRADE SECRET PROTECTION:
 * This software contains confidential and proprietary information constituting
 * trade secrets of Hostwek LTD. Unauthorized disclosure, use, or distribution
 * of this technology or its underlying source code is prohibited and
 * may result in legal action, including injunctive relief and monetary damages.
 * ================================================================================
 */
class LanguageDetector {
  constructor() {
    this.langMap = {
      js: 'js', javascript: 'js', jsx: 'js',
      ts: 'ts', typescript: 'ts', tsx: 'ts',
      py: 'py', python: 'py', python3: 'py',
      html: 'html', htm: 'html',
      css: 'css', scss: 'css', sass: 'css', less: 'css',
      php: 'php',
      json: 'json', jsonc: 'json',
      xml: 'xml', xhtml: 'xml', svg: 'xml',
      sql: 'sql', mysql: 'sql', postgresql: 'sql',
      csv: 'csv', tsv: 'csv',
      md: 'md', markdown: 'md', mdown: 'md',
      java: 'java',
      csharp: 'cs', cs: 'cs', 'c#': 'cs',
      cpp: 'cpp', 'c++': 'cpp', cc: 'cpp', cxx: 'cpp',
      c: 'c',
      go: 'go', golang: 'go',
      rs: 'rs', rust: 'rs',
      sh: 'sh', shell: 'sh', bash: 'sh', zsh: 'sh',
      rb: 'rb', ruby: 'rb',
      swift: 'swift',
      kt: 'kt', kotlin: 'kt',
      dart: 'dart',
      r: 'r',
      matlab: 'm',
      scala: 'scala',
      perl: 'pl',
      lua: 'lua',
      yaml: 'yml', yml: 'yml'
    };
    const config = (typeof window !== 'undefined' && window.GPTPF_CONFIG?.LANGUAGE_DETECTION) ?? {};
    this.CONFIDENCE_THRESHOLD = config.confidenceThreshold ?? 0.4;
    this.STRONG_SIGNAL_WEIGHT = config.strongSignalWeight ?? 20;
    this.PATTERN_WEIGHT = config.patternWeight ?? 4;
    this.WEAK_PATTERN_WEIGHT = config.weakPatternWeight ?? 1;
    this.HTML_TAG_BOOST = config.htmlTagBoost ?? 30;
    this.TAG_PENALTY = config.tagPenalty ?? 20;
    this.CSS_BOOST = config.cssBoost ?? 8;
    this.patterns = {

      javascript: {
        extensions: ['js','mjs','jsx'],
        strong: [/function\s+\w+\s*\([^)]*\)\s*{/, /const\s+\w+\s*=/, /let\s+\w+\s*=/, /=>\s*[{(]/, /import\s+.*from/, /export\s+(default\s+)?/],
        patterns: [/var\s+\w+\s*=/, /require\s*\(['"`]/, /console\.(log|error|warn)/, /document\.(querySelector|getElementById)/, /window\.\w+/, /\breturn\s+(true|false|\w+)/, /\bif\s*\([^)]+\)\s*{/, /\bfor\s*\([^)]+\)\s*{/, /async\s+function/, /await\s+\w+/],
        antiPatterns: [/:\s*(string|number|boolean)/, /interface\s+\w+/, /type\s+\w+\s*=/, /^\s*#!/m, /\becho\s+/, /def\s+\w+\s*\(/],
        weight: 1.2
      },
      typescript: {
        extensions: ['ts','tsx'],
        strong: [/interface\s+\w+\s*{/, /type\s+\w+\s*=/, /export\s+type/, /import\s+type/, /:\s*(string|number|boolean|any|void)/],
        patterns: [/\w+\?\s*:/, /as\s+\w+/, /<\w+>/, /public\s+\w+/, /private\s+\w+/, /readonly\s+\w+/, /enum\s+\w+/],
        antiPatterns: [/^\s*#!/m, /\becho\s+/, /def\s+\w+\s*\(/, /\$\w+/],
        weight: 1.3
      },
      html: {
        extensions: ['html','htm'],
        strong: [/<!DOCTYPE\s+html>/i, /<html[^>]*>/i, /<head[^>]*>/i, /<body[^>]*>/i, /<title[^>]*>/],
        patterns: [/<\w+[^>]*>/, /<\/\w+>/, /class\s*=\s*["'][^"']+["']/, /id\s*=\s*["'][^"']+["']/, /<meta[^>]*>/, /<link[^>]*>/],
        antiPatterns: [/^\s*def\s+/, /^\s*class\s+\w+\([^)]*\):/m, /function\s*\(/, /const\s+\w+/, /let\s+\w+/],
        weight: 1.3
      },
      css: {
        extensions: ['css','scss','sass','less'],
        strong: [/@import\s+/, /@media\s+/, /@keyframes\s+/, /\$[\w-]+\s*:/, /&\s*{/, /@mixin\s+/],
        patterns: [/\.[\w-]+\s*{/, /#[\w-]+\s*{/, /[\w-]+\s*:\s*[^;]+;/, /@[\w-]+/, /::?(before|after|hover|focus)/],
        antiPatterns: [/<\w+/, /def\s+/, /function\s*\(/, /const\s+\w+/, /let\s+\w+/, /\becho\s+/],
        weight: 1.2
      },
      php: {
        extensions: ['php'],
        strong: [/<\?php/i, /<\?=/, /\$\w+\s*=/, /echo\s+/, /function\s+\w+\s*\(/],
        patterns: [/class\s+\w+/, /namespace\s+/, /use\s+\w+/, /\$this->/, /array\s*\(/, /foreach\s*\(/],
        antiPatterns: [/const\s+\w+/, /let\s+\w+/, /def\s+\w+\s*\(/],
        weight: 1.4
      },

      python: {
        extensions: ['py'],
        strong: [/^\s*def\s+\w+\([^)]*\):/m, /^\s*class\s+\w+(\([^)]*\))?:/m, /if\s+__name__\s*==\s*['"]__main__['"]/, /from\s+\w+\s+import/],
        patterns: [/print\s*\(/, /import\s+\w+/, /^\s*#\s*!/m, /\bself\b/, /\bTrue\b|\bFalse\b|\bNone\b/, /^\s*@\w+/m, /\[.*for\s+\w+\s+in.*\]/, /with\s+\w+.*:/],
        antiPatterns: [/<\w+/, /function\s*\(/, /var\s+\w+/, /const\s+\w+/, /let\s+\w+/, /\$\w+/],
        weight: 1.2
      },
      java: {
        extensions: ['java'],
        strong: [/public\s+class\s+\w+/, /public\s+static\s+void\s+main/, /package\s+[\w.]+;/],
        patterns: [/import\s+[\w.]+;/, /System\.(out|err)\.print/, /private\s+\w+/, /public\s+\w+/, /\bnew\s+\w+\s*\(/, /\bthis\./],
        antiPatterns: [/def\s+/, /function\s*\(/, /const\s+\w+/, /let\s+\w+/],
        weight: 1.1
      },
      csharp: {
        extensions: ['cs'],
        strong: [/using\s+System/, /namespace\s+\w+/, /public\s+class\s+\w+/],
        patterns: [/Console\.(WriteLine|Write)/, /public\s+static/, /private\s+\w+/, /\bnew\s+\w+\s*\(/, /\bthis\./],
        antiPatterns: [/def\s+/, /function\s*\(/, /const\s+\w+/, /let\s+\w+/],
        weight: 1.1
      },
      cpp: {
        extensions: ['cpp','cc','cxx','hpp'],
        strong: [/#include\s*<iostream>/, /std::(cout|cin|endl)/, /using\s+namespace\s+std/, /cout\s*<</, /cin\s*>>/],
        patterns: [/#include\s*<.*>/, /std::/, /class\s+\w+\s*{/, /int\s+main\s*\(/, /namespace\s+\w+/, /template\s*</],
        antiPatterns: [/def\s+/, /function\s*\(/, /print\s*\(/, /const\s+\w+\s*=/, /printf\s*\(/],
        weight: 1.1
      },
      c: {
        extensions: ['c','h'],
        strong: [/#include\s*<stdio\.h>/, /int\s+main\s*\(/, /printf\s*\(/],
        patterns: [/#include\s*<.*\.h>/, /scanf\s*\(/, /malloc\s*\(/, /free\s*\(/, /struct\s+\w+/],
        antiPatterns: [/std::/, /class\s+/, /def\s+/, /function\s*\(/],
        weight: 0.95
      },
      go: {
        extensions: ['go'],
        strong: [/package\s+main/, /func\s+main\s*\(\)/, /import\s*\(/],
        patterns: [/func\s+\w+\s*\(/, /fmt\.(Print|Println)/, /var\s+\w+/, /\bgo\s+\w+/, /defer\s+/],
        antiPatterns: [/def\s+/, /function\s*\(/, /const\s+\w+\s*=/, /let\s+\w+\s*=/],
        weight: 1.1
      },
      rust: {
        extensions: ['rs'],
        strong: [/fn\s+main\s*\(\)/, /use\s+std::/, /extern\s+crate/],
        patterns: [/fn\s+\w+\s*\(/, /let\s+(mut\s+)?\w+/, /println!\s*\(/, /match\s+\w+/, /impl\s+\w+/, /struct\s+\w+/],
        antiPatterns: [/def\s+/, /function\s*\(/, /const\s+\w+\s*=/, /var\s+\w+\s*=/],
        weight: 1.1
      },
      ruby: {
        extensions: ['rb'],
        strong: [/^\s*class\s+\w+/m, /^\s*module\s+\w+/m],
        patterns: [/\bdef\s+\w+/, /\bend\b/, /puts\s+/, /require\s+['"]/, /@\w+/, /\|\w+\|/],
        antiPatterns: [/function\s*\(/, /def\s+\w+\s*\(/, /const\s+\w+/, /let\s+\w+/],
        weight: 1.0
      },
      shell: {
        extensions: ['sh','bash','zsh'],
        strong: [/^#!/m, /^\s*function\s+\w+\s*\(\)\s*{/m, /\becho\s+["'].*["']/, /\bif\s+\[\s*.*\s*\]/],
        patterns: [/\$\{?\w+\}?/, /\bfor\s+\w+\s+in/, /\bwhile\s+\[/, /\|\s*\w+/, /\bexport\s+\w+=/, /\bsource\s+/, /\b\.\s+\w+/],
        antiPatterns: [/def\s+/, /function\s*\(/, /const\s+\w+/, /let\s+\w+/, /var\s+\w+/],
        weight: 1.0
      },
      sql: {
        extensions: ['sql'],
        strong: [/SELECT\s+.*\s+FROM\s+/i, /CREATE\s+TABLE\s+/i, /INSERT\s+INTO/i],
        patterns: [/UPDATE\s+\w+\s+SET/i, /DELETE\s+FROM/i, /WHERE\s+\w+/i, /JOIN\s+\w+/i, /GROUP\s+BY/i, /ORDER\s+BY/i],
        antiPatterns: [/def\s+/, /function\s*\(/, /const\s+\w+/, /let\s+\w+/],
        weight: 1.3
      },

      json: {
        extensions: ['json','jsonc'],
        strong: [/^\s*{[\s\S]*}$/m, /^\s*\[[\s\S]*\]$/m, /"[^"]+"\s*:\s*("[^"]*"|\d+|true|false|null)/],
        patterns: [/^\s*[{\[]/, /[}\]]\s*$/, /,\s*"[^"]+"\s*:/],
        antiPatterns: [/def\s+/, /function\s*\(/, /<\w+/, /const\s+\w+/, /let\s+\w+/],
        weight: 1.4
      },
      xml: {
        extensions: ['xml','xhtml','svg'],
        strong: [/^\s*<\?xml\b/i, /xmlns\s*=/, /<\w+[^>]*\/>/],
        patterns: [/<\/[\w:]+>/, /<\w+[^>]*>[\s\S]*<\/\w+>/, /<!--[\s\S]*?-->/],
        antiPatterns: [/<!DOCTYPE\s+html>/i, /<html/i, /function\s*\(/, /const\s+\w+/],
        weight: 1.2
      },
      yaml: {
        extensions: ['yml','yaml'],
        strong: [/^---\s*$/m, /^\w+:\s*$/m, /^\s*-\s+\w+:/],
        patterns: [/^\s*-\s+\w+/, /^\w+:\s+[^{[]/, /^\s+\w+:\s+/, /^#.*$/m],
        antiPatterns: [/def\s+/, /function\s*\(/, /<\w+/, /const\s+\w+/, /let\s+\w+/],
        weight: 1.2
      },
      csv: {
        extensions: ['csv','tsv'],
        strong: [/^[^,\n]*,[^,\n]*,[^,\n]*/m, /^"[^"]*","[^"]*","[^"]*"/m],
        patterns: [/^\w+,\w+,\w+/m, /,\s*\d+(\.\d+)?\s*,/, /^[^,\n]+,[^,\n]+$/m],
        antiPatterns: [/def\s+/, /function\s*\(/, /<\w+/, /const\s+\w+/, /let\s+\w+/],
        weight: 1.3
      },
      markdown: {
        extensions: ['md','markdown'],
        strong: [/^#{1,6}\s+.+$/m, /^```\w*$/m, /^\|.*\|.*\|/m],
        patterns: [/^\*\*[^*]+\*\*/, /^\*[^*]+\*/, /^\[.*\]\(.*\)/, /^>\s+/, /^\d+\.\s+/, /^[-*+]\s+/],
        antiPatterns: [/def\s+/, /function\s*\(/, /<html/i, /const\s+\w+/, /let\s+\w+/],
        weight: 1.3
      }
    };
  }
  fenceHint(text) {
    const m = /^```\s*([a-zA-Z0-9+#._-]+)\s*[\r\n]/.exec(text.trim());
    if (!m) return null;
    const k = (m[1]||'').toLowerCase();
    return this.langMap[k] || null;
  }
  isValidJSON(text){
    try {
      JSON.parse(text.trim());
      return true;
    } catch(err) {
      return false;
    }
  }

  _stripLiterals(s) {
    if (!s) return '';
    return String(s)

      .replace(/\/(?:\\\/|[^\/\n])+\/[gimsuy]*/g, ' ')
      .replace(/`(?:\\.|[^`\\])*`/g, ' ')
      .replace(/'(?:\\.|[^'\\])*'/g, ' ')
      .replace(/"(?:\\.|[^"\\])*"/g, ' ')

      .replace(/"""[\s\S]*?"""/g, ' ')
      .replace(/'''[\s\S]*?'''/g, ' ')
      .replace(/f"(?:\\.|[^"\\])*"/g, ' ')
      .replace(/f'(?:\\.|[^'\\])*'/g, ' ')
      .replace(/r"(?:\\.|[^"\\])*"/g, ' ')
      .replace(/r'(?:\\.|[^'\\])*'/g, ' ')

      .replace(/<<<\w+[\s\S]*?\w+/g, ' ')
      .replace(/<<<'\w+'[\s\S]*?\w+/g, ' ')

      .replace(/content\s*:\s*["'](?:\\.|[^"'\\])*["']/g, ' ')
      .replace(/\/\*[\s\S]*?\*\//g, ' ')

      .replace(/\/\/.*$/gm, ' ')
      .replace(/#.*$/gm, ' ');
  }
  _countMatches(text, re) {
    try {
      const m = text.match(re);
      return m ? m.length : 0;
    } catch (_) { return 0; }
  }
  tagDensityScore(text){
    const s = this._stripLiterals(text);
    const tags = (s.match(/<\w[^>]*>/g) ?? []).length + (s.match(/<\/\w+>/g) ?? []).length;
    const len = Math.max(1, s.length);
    const divisor = (typeof window !== 'undefined' && window.GPTPF_CONFIG?.LANGUAGE_DETECTION?.tagDensityDivisor) ?? 120;
    return Math.min(1, tags / Math.max(10, len/divisor));
  }
  detectLanguage(text){
    const startTime = performance?.now ? performance.now() : Date.now();

    if (!text || typeof text !== 'string') {
      if (root.GPTPF_METRICS) {
        root.GPTPF_METRICS.record('language_detection_empty', {
          duration: (performance?.now ? performance.now() : Date.now()) - startTime
        });
      }
      return { language:'text', extension:'txt', confidence:0 };
    }
    
    let t = text;
    const originalLength = t.length;
    const MAX_ANALYZE = 200000;
    if (t.length > MAX_ANALYZE) {
      const head = t.slice(0, 120000);
      const tail = t.slice(-60000);
      t = head + '\n...\n' + tail;
    }
    t = t.trim();

    if (!t) return { language:'text', extension:'txt', confidence:0 };

    const hint = this.fenceHint(t);
    if (hint) return { language: hint, extension: hint, confidence: 0.99 };

    const tSanEarly = this._stripLiterals(t);
    if (/^\s*<\?xml\b/i.test(t)) return { language:'xml', extension:'xml', confidence:0.98 };
    if (/<!DOCTYPE\s+html>/i.test(tSanEarly) || /<html[^>]*>/i.test(tSanEarly)) return { language:'html', extension:'html', confidence:0.98 };
    if (/<\?php/i.test(t)) return { language:'php', extension:'php', confidence:0.98 };

    if (this.isValidJSON(t)) {
      const jsonPatterns = [/"[^"]+"\s*:/, /^\s*[{\[]/, /[}\]]\s*$/];
      const jsonScore = jsonPatterns.reduce((s, re) => s + (re.test(t) ? 1 : 0), 0);
      if (jsonScore >= 2) return { language:'json', extension:'json', confidence:0.95 };
    }

    if (originalLength < 50) {
      return { language: 'text', extension: 'txt', confidence: 0.8, reason: 'too_short' };
    }
    const scores = {};
    const density = this.tagDensityScore(t);
    const textLength = t.length;
    const tSan = this._stripLiterals(t);

    const jsCfg = this.patterns.javascript || { strong: [], patterns: [] };
    let jsSignal = 0;
    for (const re of (jsCfg.strong || [])) jsSignal += this._countMatches(t, re);
    for (const re of (jsCfg.patterns || [])) jsSignal += this._countMatches(t, re);

    for (const [lang, cfg] of Object.entries(this.patterns)){
      let score = 0;

      const useStripped = ['html', 'xml', 'javascript', 'typescript', 'python', 'php', 'css', 'java', 'csharp', 'cpp', 'c'].includes(lang);
      const source = useStripped ? tSan : t;

      for (const re of (cfg.strong ?? [])) {
        const matches = this._countMatches(source, re);
        score += matches * this.STRONG_SIGNAL_WEIGHT;
      }

      for (const re of (cfg.patterns ?? [])) {
        const matches = this._countMatches(source, re);
        score += matches * this.PATTERN_WEIGHT;
      }

      for (const re of (cfg.antiPatterns ?? [])) {
        const matches = this._countMatches(t, re);
        score -= matches * (this.PATTERN_WEIGHT * 2);
      }

      score *= cfg.weight ?? 1;

      if (lang === 'html') {
        score += density * this.HTML_TAG_BOOST;

        if (jsSignal >= 3) {
          score -= jsSignal * (this.PATTERN_WEIGHT * 1.5);
        }
      }

      if (['python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'go', 'rust'].includes(lang) && density > 0.2) {
        score -= density * this.TAG_PENALTY;
      }

      if (lang === 'css' && density < 0.1) {
        score += this.CSS_BOOST;
      }

      if (textLength < 100) {
        score *= 0.8;
      } else if (textLength > 1000) {
        score *= 1.1;
      }
      scores[lang] = Math.max(0, score);
    }

    const sorted = Object.entries(scores).sort((a,b) => b[1] - a[1]);
    let winner = (sorted[0]?.[0]) || 'text';
    let winnerScore = (sorted[0]?.[1]) || 0;
    const totalScore = sorted.reduce((acc, [,v]) => acc + v, 0) || 1;
    const secondBest = sorted[1]?.[1] ?? 0;

    if (winner === 'html') {
      const htmlScore = scores['html'] || 0;
      const jsScore = scores['javascript'] || 0;
      if (jsSignal >= 2 && jsScore >= 0.75 * htmlScore) {
        winner = 'javascript';
        winnerScore = jsScore;
      }
    }

    let confidence = winnerScore / totalScore;
    if (winnerScore > secondBest * 2) confidence *= 1.2;
    confidence = Math.max(0, Math.min(1, confidence));

    const minConfidence = textLength < 200 ? 0.6 : (textLength < 1000 ? 0.5 : 0.35);
    
    if (confidence < minConfidence) {
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG.info('language_detection_fallback', { 
          winner, 
          confidence, 
          minConfidence, 
          textLength,
          reason: 'confidence_too_low'
        });
      }
      return { language: 'text', extension: 'txt', confidence: Math.round(confidence * 100) / 100, fallback: true };
    }

    if (winner === 'text' || !winner) {
      return { language: 'text', extension: 'txt', confidence: 0.8, fallback: true };
    }

    const ext = (this.patterns[winner]?.extensions?.[0]) ? this.patterns[winner].extensions[0] : 'txt';
    
    const duration = (performance?.now ? performance.now() : Date.now()) - startTime;

    if (window.GPTPF_DEBUG) {
      window.GPTPF_DEBUG.info('language_detection_success', {
        language: winner,
        extension: ext,
        confidence: Math.round(confidence * 100) / 100,
        textLength,
        duration
      });
    }

    if (root.GPTPF_METRICS) {
      root.GPTPF_METRICS.record('language_detection_success', {
        language: winner,
        confidence: Math.round(confidence * 100) / 100,
        duration,
        textLength,
        originalLength
      });
    }

    return {
      language: winner,
      extension: ext,
      confidence: Math.round(confidence * 100) / 100,
      debug: (typeof window !== 'undefined' && window.GPTPF_DEBUG) ? { scores: sorted.slice(0, 3), density, textLength } : undefined
    };
  }
  getFileExtension(text, fallback='txt'){
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return fallback;
    }

    const det = this.detectLanguage(text);
    
    if (det.fallback) {
      if (window.GPTPF_DEBUG) {
        window.GPTPF_DEBUG.info('file_extension_fallback', { 
          detectedExtension: det.extension, 
          fallback, 
          confidence: det.confidence 
        });
      }
      return fallback;
    }

    let threshold = this.CONFIDENCE_THRESHOLD;
    if (text && text.length < 100) {
      threshold = 0.7;
    } else if (text && text.length < 500) {
      threshold = 0.6;
    } else if (text && text.length > 2000) {
      threshold = 0.3;
    }

    const useDetected = det.confidence >= threshold;
    
    if (window.GPTPF_DEBUG) {
      window.GPTPF_DEBUG.info('file_extension_decision', { 
        confidence: det.confidence, 
        threshold, 
        detected: det.extension, 
        fallback, 
        using: useDetected ? det.extension : fallback 
      });
    }

    return useDetected ? det.extension : fallback;
  }

  detectWithContext(text, filename = '', userHint = '') {
    if (!text || typeof text !== 'string') {
      return { language: 'text', extension: 'txt', confidence: 0, source: 'fallback' };
    }

    if (userHint && this.langMap[userHint.toLowerCase()]) {
      const ext = this.langMap[userHint.toLowerCase()];
      return { language: userHint.toLowerCase(), extension: ext, confidence: 0.99, source: 'user_hint' };
    }

    if (filename) {
      const fileExt = filename.split('.').pop()?.toLowerCase();
      if (fileExt && this.langMap[fileExt]) {
        const lang = this.langMap[fileExt];

        const contentDetection = this.detectLanguage(text);
        if (contentDetection.language === lang || contentDetection.confidence < 0.3) {
          return { language: lang, extension: fileExt, confidence: 0.95, source: 'filename' };
        }
      }
    }

    const detection = this.detectLanguage(text);
    detection.source = 'content_analysis';
    return detection;
  }

  getLanguageCandidates(text, limit = 3) {
    if (!text || typeof text !== 'string') return [];
    const detection = this.detectLanguage(text);
    if (detection.debug && detection.debug.scores) {
      return detection.debug.scores.slice(0, limit).map(([lang, score]) => ({
        language: lang,
        extension: this.patterns[lang]?.extensions?.[0] || 'txt',
        confidence: Math.round((score / (detection.debug.scores[0][1] || 1)) * 100) / 100
      }));
    }
    return [{ language: detection.language, extension: detection.extension, confidence: detection.confidence }];
  }
}
if (typeof window !== 'undefined') window.LanguageDetector = LanguageDetector;
if (typeof module !== 'undefined' && module.exports) module.exports = LanguageDetector;
