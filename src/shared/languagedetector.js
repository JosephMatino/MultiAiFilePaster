
/*
 * ================================================================================
 * Multi-AI File Paster Chrome Extension | Production Release v1.1.0
 * ================================================================================
 *
 * MODULE: src/shared/languagedetector.js
 * FUNCTION: Smart language detection with pattern recognition for 20+ file formats
 * ARCHITECTURE: Pattern Recognition Engine with Confidence Scoring
 *
 * DEVELOPMENT TEAM:
 * • Lead Developer: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • Scrum Master: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 *
 * ORGANIZATION: WekTurbo Designs - Hostwek LTD | https://hostwek.com/wekturbo
 * REPOSITORY: https://github.com/JosephMatino/MultiAiFilePaster
 * TECHNICAL SUPPORT: wekturbo@hostwek.com
 *
 * PLATFORM INTEGRATIONS: Language pattern analysis, file format detection
 * CORE DEPENDENCIES: Pattern matching algorithms, syntax analysis
 *
 * Copyright (c) 2025 WekTurbo Designs - Hostwek LTD. All rights reserved.
 * Licensed under MIT License | https://opensource.org/licenses/MIT
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

    this.CONFIDENCE_THRESHOLD = 0.35;
    this.STRONG_SIGNAL_WEIGHT = 15;
    this.PATTERN_WEIGHT = 3;
    this.HTML_TAG_BOOST = 25;
    this.TAG_PENALTY = 15;
    this.CSS_BOOST = 5;

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
    const tags = (text.match(/<\w[^>]*>/g) || []).length + (text.match(/<\/\w+>/g) || []).length;
    const len = Math.max(1, text.length);
    return Math.min(1, tags / Math.max(10, len/120));
  }

  detectLanguage(text){
    if (!text || typeof text !== 'string') return { language:'text', extension:'txt', confidence:0 };
    const t = text.trim();

    const hint = this.fenceHint(t);
    if (hint) return { language: hint, extension: hint, confidence: 0.99 };

    if (/^\s*<\?xml\b/i.test(t)) return { language:'xml', extension:'xml', confidence:0.98 };
    if (/<!DOCTYPE\s+html>/i.test(t) || /<html[^>]*>/i.test(t)) return { language:'html', extension:'html', confidence:0.98 };
    const mdSignals = [( /^#{1,6}\s+/m ), ( /^```/m ), ( /^>\s+/m ), ( /^\[.*\]\(.*\)/m )];
    const tagLike = (t.match(/<\w[^>]*>/g) || []).length;
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
      for (const re of (cfg.strong || [])) s += ((t.match(re)||[]).length) * this.STRONG_SIGNAL_WEIGHT;
      for (const re of (cfg.patterns || [])) s += ((t.match(re)||[]).length) * this.PATTERN_WEIGHT;
      s *= cfg.weight || 1;
      if (lang === 'html') s += density * this.HTML_TAG_BOOST;
      if ((lang === 'python' || lang === 'javascript' || lang === 'typescript') && density > 0.2) {
        s -= density * this.TAG_PENALTY;
      }
      if (lang === 'css' && density < 0.1) s += this.CSS_BOOST;
      scores[lang]=s;
    }

    const sorted = Object.entries(scores).sort((a,b)=>b[1]-a[1]);
    const [bestLang, bestScore] = sorted[0] || ['text', 0];
    const sum = sorted.reduce((acc, [,v])=>acc+v, 0) || 1;
    const conf = Math.max(0, Math.min(1, bestScore / sum));

    const ext = (this.patterns[bestLang]?.extensions?.[0]) || 'txt';
    return { language: bestLang, extension: ext, confidence: Math.round(conf*100)/100 };
  }

  /**
   * Get appropriate file extension for text content
   * @param {string} text - Content to analyze
   * @param {string} fallback - Default extension if detection confidence is low
   * @returns {string} File extension (without dot)
   */
  getFileExtension(text, fallback='txt'){
    const det = this.detectLanguage(text);
    return det.confidence >= this.CONFIDENCE_THRESHOLD ? det.extension : fallback;
  }
}

if (typeof window !== 'undefined') window.LanguageDetector = LanguageDetector;
if (typeof module !== 'undefined' && module.exports) module.exports = LanguageDetector;
