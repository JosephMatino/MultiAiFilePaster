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
 * • LEAD DEVELOPER: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • SCRUM MASTER & PROJECT FUNDING: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 * • QUALITY ASSURANCE: Automated testing pipeline
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
      js: 'js', javascript: 'js',
      ts: 'ts', typescript: 'ts',
      py: 'py', python: 'py',
      html: 'html', css: 'css', php: 'php',
      json: 'json', xml: 'xml', sql: 'sql', csv: 'csv',
      md: 'md', markdown: 'md',
      java: 'java', csharp: 'cs', cs: 'cs',
      cpp: 'cpp', c: 'c', go: 'go', golang: 'go',
      rs: 'rs', rust: 'rs', sh: 'sh', shell: 'sh', bash: 'sh'
    };

    const config = (typeof window !== 'undefined' && window.GPTPF_CONFIG?.LANGUAGE_DETECTION) ?? {};
    this.CONFIDENCE_THRESHOLD = config.confidenceThreshold ?? 0.35;
    this.STRONG_SIGNAL_WEIGHT = config.strongSignalWeight ?? 15;
    this.PATTERN_WEIGHT = config.patternWeight ?? 3;
    this.HTML_TAG_BOOST = config.htmlTagBoost ?? 25;
    this.TAG_PENALTY = config.tagPenalty ?? 15;
    this.CSS_BOOST = config.cssBoost ?? 5;

    this.patterns = {
      php: {
        extensions: ['php'],
        strong: [/<\?php/i],
        patterns: [/\$\w+/, /echo\s+/, /function\s+\w+\s*\(/],
        weight: 1.4
      },
      html: {
        extensions: ['html','htm'],
        strong: [/<!DOCTYPE\s+html>/i, /<html[^>]*>/i],
        patterns: [/<\w+[^>]*>/, /<\/\w+>/, /class\s*=\s*["'][^"']+["']/],
        weight: 1.2
      },
      json: {
        extensions: ['json'],
        strong: [],
        patterns: [/"[^"]+"\s*:\s*("[^"]*"|\d+|true|false|null)/],
        weight: 1.3
      },
      markdown: {
        extensions: ['md'],
        strong: [],
        patterns: [/^#{1,6}\s+/, /^\*\*[^*]+\*\*/, /^\*[^*]+\*/, /^\[.*\]\(.*\)/, /^```[\w]*/, /^\|.*\|/, /^>\s+/, /^\d+\.\s+/, /^[-*+]\s+/m],
        weight: 1.35
      },

      javascript: { extensions:['js','mjs'], strong: [], patterns:[/\b(function|const|let|var)\s+\w+/, /=>\s*{/, /require\(['"`]/, /import\s+.*from/, /console\.log/], weight:1.0 },
      typescript: { extensions:['ts','tsx'], strong: [], patterns:[/:\s*(string|number|boolean|any|void)/, /interface\s+\w+/, /type\s+\w+\s*=/, /\w+\?\s*:/], weight:1.15 },
      python: { extensions:['py'], strong: [], patterns:[/^\s*def\s+\w+\([^)]*\):/m, /^\s*class\s+\w+\([^)]*\):/m, /print\s*\(/, /from\s+\w+\s+import/, /if\s+__name__\s*==\s*['"]__main__['"]/], weight:1.0 },
      java: { extensions:['java'], strong: [], patterns:[/public\s+class\s+\w+/, /public\s+static\s+void\s+main/, /System\.out\.print/], weight:1.0 },
      csharp: { extensions:['cs'], strong: [], patterns:[/using\s+System/, /namespace\s+\w+/, /public\s+class\s+\w+/, /Console\.WriteLine/], weight:1.0 },
      cpp: { extensions:['cpp','cc','cxx'], strong: [], patterns:[/#include\s*<.*>/, /std::/, /class\s+\w+\s*{/], weight:1.0 },
      c: { extensions:['c','h'], strong: [], patterns:[/#include\s*<.*\.h>/, /int\s+main\s*\(/, /printf\s*\(/], weight:0.95 },
      ruby: { extensions:['rb'], strong: [], patterns:[/\bdef\s+\w+/, /\bclass\s+\w+/, /puts\s+/], weight:1.0 },
      go: { extensions:['go'], strong: [], patterns:[/package\s+main/, /func\s+\w+\s*\(/, /fmt\.Print/], weight:1.0 },
      rust: { extensions:['rs'], strong: [], patterns:[/fn\s+\w+\s*\(/, /let\s+mut\s+/, /println!\s*\(/], weight:1.0 },
      shell: { extensions:['sh'], strong: [], patterns:[/^#!/m, /\becho\s+/, /\bif\s+\[/, /\$\{?\w+\}?/, /\bfunction\s+\w+/], weight:1.0 },
      css: { extensions:['css'], strong: [], patterns:[/\.[\w-]+\s*{/, /@[\w-]+\s+/, /[\w-]+\s*:\s*[^;]+;/], weight:0.95 },
      sql: { extensions:['sql'], strong: [], patterns:[/SELECT\s+.*FROM/i, /INSERT\s+INTO/i, /UPDATE\s+\w+\s+SET/i, /CREATE\s+TABLE/i], weight:1.0 },
      csv: { extensions:['csv'], strong: [], patterns:[/^[^,\n]*,[^,\n]*,/m, /^"[^"]*","[^"]*"/m, /^\w+,\w+,\w+/m], weight:1.0 },
      xml: { extensions:['xml'], strong: [/^\s*<\?xml\b/i], patterns:[/<\w+[^>]*\/>/, /<\/[\w:]+>/], weight:1.0 }
    };
  }

  fenceHint(text) {
    const m = /^```\s*([a-zA-Z0-9+#._-]+)\s*[\r\n]/.exec(text.trim());
    if (!m) return null;
    const k = (m[1]||'').toLowerCase();
    return this.langMap[k] || null;
  }

  isValidJSON(text){ try { JSON.parse(text.trim()); return true; } catch(err) { void err; return false; } }

  tagDensityScore(text){
    const tags = (text.match(/<\w[^>]*>/g) ?? []).length + (text.match(/<\/\w+>/g) ?? []).length;
    const len = Math.max(1, text.length);
    const divisor = (typeof window !== 'undefined' && window.GPTPF_CONFIG?.LANGUAGE_DETECTION?.tagDensityDivisor) ?? 120;
    return Math.min(1, tags / Math.max(10, len/divisor));
  }

  detectLanguage(text){
    if (!text || typeof text !== 'string') return { language:'text', extension:'txt', confidence:0 };

    // Sampling: limit analysis size for extremely large pastes to reduce heavy regex cost
    // Strategy: take head + tail segments when length exceeds 200k chars
    let t = text;
    const MAX_ANALYZE = 200000; // ~200 KB of text
    if (t.length > MAX_ANALYZE) {
      const head = t.slice(0, 120000);
      const tail = t.slice(-60000);
      t = head + '\n...\n' + tail; // marker does not meaningfully affect detection patterns
    }
    t = t.trim();

    const hint = this.fenceHint(t);
    if (hint) return { language: hint, extension: hint, confidence: 0.99 };

    if (/^\s*<\?xml\b/i.test(t)) return { language:'xml', extension:'xml', confidence:0.98 };
    if (/<!DOCTYPE\s+html>/i.test(t) || /<html[^>]*>/i.test(t)) return { language:'html', extension:'html', confidence:0.98 };
    const mdSignals = [( /^#{1,6}\s+/m ), ( /^```/m ), ( /^>\s+/m ), ( /^\[.*\]\(.*\)/m )];
    const tagLike = (t.match(/<\w[^>]*>/g) ?? []).length;
    const mdScore = mdSignals.reduce((s,re)=> s + (re.test(t) ? 1 : 0), 0);
    if (tagLike > 0 && mdScore >= 2 && this.tagDensityScore(t) < 0.2) {
      return { language:'markdown', extension:'md', confidence:0.6 };
    }
    if (/<\?php/i.test(t)) return { language:'php', extension:'php', confidence:0.98 };
    if (this.isValidJSON(t)) return { language:'json', extension:'json', confidence:0.98 };

    const scores = {};
    const density = this.tagDensityScore(t);

    for (const [lang, cfg] of Object.entries(this.patterns)){
      let s = 0;
      for (const re of (cfg.strong ?? [])) s += ((t.match(re)??[]).length) * this.STRONG_SIGNAL_WEIGHT;
      for (const re of (cfg.patterns ?? [])) s += ((t.match(re)??[]).length) * this.PATTERN_WEIGHT;
      s *= cfg.weight ?? 1;
      if (lang === 'html') s += density * this.HTML_TAG_BOOST;
      if ((lang === 'python' || lang === 'javascript' || lang === 'typescript') && density > 0.2) {
        s -= density * this.TAG_PENALTY;
      }
      if (lang === 'css' && density < 0.1) s += this.CSS_BOOST;
      scores[lang]=s;
    }

    const sorted = Object.entries(scores).sort((a,b)=>b[1]-a[1]);
    const [bestLang, bestScore] = sorted[0] ?? ['text', 0];
    const sum = sorted.reduce((acc, [,v])=>acc+v, 0) ?? 1;
    const conf = Math.max(0, Math.min(1, bestScore / sum));

  const ext = (this.patterns[bestLang]?.extensions?.[0]) ? this.patterns[bestLang].extensions[0] : 'txt';
    return { language: bestLang, extension: ext, confidence: Math.round(conf*100)/100 };
  }

  getFileExtension(text, fallback='txt'){
    const det = this.detectLanguage(text);
    return det.confidence >= this.CONFIDENCE_THRESHOLD ? det.extension : fallback;
  }
}

if (typeof window !== 'undefined') window.LanguageDetector = LanguageDetector;
if (typeof module !== 'undefined' && module.exports) module.exports = LanguageDetector;
