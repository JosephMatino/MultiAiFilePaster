#!/usr/bin/env node
/*
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: .github/hooks/check-i18n.js
 * FUNCTION: Git hook for validating internationalization completeness
 * ARCHITECTURE: Node.js script for development tooling
 * SECURITY: Local development tool, no external dependencies
 * PERFORMANCE: Fast file system operations for CI/CD pipelines
 * COMPATIBILITY: Node.js 14+, standard file system APIs
 * RELIABILITY: Automated quality gate for translation coverage
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
 * DEVELOPMENT STANDARDS & PRACTICES:
 * • CODE QUALITY: ESLint + Prettier, rigorous peer review process
 * • TESTING: Unit testing with Jest, integration testing, manual QA procedures
 * • DOCUMENTATION: JSDoc comments, architectural decision records, user guides
 * • SECURITY: OWASP compliance, dependency auditing, secure coding practices
 * • PERFORMANCE: Chrome DevTools profiling, memory optimization, efficient algorithms
 * • ACCESSIBILITY: WCAG 2.1 AA compliance, screen reader compatibility, keyboard navigation
 * • BROWSER SUPPORT: Chrome 88+, Edge 88+, Opera 74+, progressive enhancement
 * • PLATFORM INTEGRATIONS: ChatGPT, Claude, Gemini, DeepSeek, Grok platform APIs
 * • MONITORING: Performance metrics, error tracking, user analytics (opt-in)
 * • DEPLOYMENT: Chrome Web Store distribution, automated release pipeline
 *
 * LICENSING & DISTRIBUTION:
 * • LICENSE: Hostwek Custom License - see LICENSE file for complete terms
 * • COMMERCIAL USE: Restricted - requires written authorization from Hostwek LTD
 * • DISTRIBUTION: Official Chrome Web Store and authorized channels only
 * • ATTRIBUTION: Copyright notices and credits must remain intact in all distributions
 * • COMPLIANCE: Chrome Web Store policies, international copyright law, privacy regulations
 *
 * PRIVACY & SECURITY COMPLIANCE:
 * • DATA PROCESSING: Local processing only, no external server communication
 * • USER CONSENT: Explicit opt-in for analytics, comprehensive privacy controls
 * • GDPR COMPLIANCE: Right to data portability, deletion, and access controls
 * • CCPA COMPLIANCE: Consumer privacy rights and data transparency measures
 * • SECURITY AUDITS: Regular security reviews and vulnerability assessments
 * ================================================================================
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const EN_MESSAGES = path.join(ROOT, '_locales', 'en', 'messages.json');

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(js|html|css)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

function extractKeysFromFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const keys = new Set();

  const attrRegexes = [
    /data-i18n=["']([a-z0-9_\.\-]+)["']/gi,
    /data-i18n-html=["']([a-z0-9_\.\-]+)["']/gi,
    /data-i18n-placeholder=["']([a-z0-9_\.\-]+)["']/gi,
    /data-i18n-title=["']([a-z0-9_\.\-]+)["']/gi,
    /data-i18n-aria-label=["']([a-z0-9_\.\-]+)["']/gi,
    /data-tip-i18n=["']([a-z0-9_\.\-]+)["']/gi,
  ];
  for (const rx of attrRegexes) {
    let m; while ((m = rx.exec(text))) keys.add(m[1]);
  }

  const gmRegex = /GPTPF_MESSAGES\.getMessage\(\s*["']([A-Z_]+)["']\s*,\s*["']([A-Z0-9_]+)["']\s*(?:,|\))/g;
  let m;
  while ((m = gmRegex.exec(text))) {
    const cat = m[1].toLowerCase();
    const key = m[2].toLowerCase();
    keys.add(`${cat}_${key}`);
  }

  const ci18n = /chrome\.i18n\.getMessage\(\s*["']([a-z0-9_\.\-]+)["']/gi;
  while ((m = ci18n.exec(text))) keys.add(m[1]);

  return keys;
}

function main() {
  const files = walk(path.join(ROOT, 'src'));
  const htmlFiles = walk(path.join(ROOT, 'src', 'popup'));
  const allFiles = Array.from(new Set([...files, ...htmlFiles]));

  const usedKeys = new Set();
  for (const file of allFiles) {
    try {
      const keys = extractKeysFromFile(file);
      keys.forEach(k => usedKeys.add(k));
    } catch (_) {}
  }

  const manifestPath = path.join(ROOT, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifestText = fs.readFileSync(manifestPath, 'utf8');
      const msgRx = /__MSG_([a-z0-9_\.\-]+)__+/gi;
      let m;
      while ((m = msgRx.exec(manifestText))) usedKeys.add(m[1]);
    } catch (_) {}
  }

  const messages = JSON.parse(fs.readFileSync(EN_MESSAGES, 'utf8'));
  const definedKeys = new Set(Object.keys(messages));

  const missing = [];
  const unused = [];

  for (const k of usedKeys) {
    if (!definedKeys.has(k)) missing.push(k);
  }
  for (const k of definedKeys) {
    if (!usedKeys.has(k)) unused.push(k);
  }

  console.log(`i18n coverage report`);
  console.log(`Used keys: ${usedKeys.size}`);
  console.log(`Defined keys: ${definedKeys.size}`);
  console.log(`Missing: ${missing.length}`);
  if (missing.length) console.log(missing.sort().map(k => `  - ${k}`).join('\n'));
  console.log(`Unused: ${unused.length}`);
  if (unused.length) console.log(unused.sort().slice(0,50).map(k => `  - ${k}`).join('\n'));

  const localeReports = [];
  const locales = ['ar', 'sw'];
  for (const loc of locales) {
    const locPath = path.join(ROOT, '_locales', loc, 'messages.json');
    if (!fs.existsSync(locPath)) {
      localeReports.push({ loc, exists: false, missing: [] });
      continue;
    }
    const locMessages = JSON.parse(fs.readFileSync(locPath, 'utf8'));
    const locKeys = new Set(Object.keys(locMessages));
    const locMissing = [];
    for (const k of usedKeys) {
      if (definedKeys.has(k) && !locKeys.has(k)) locMissing.push(k);
    }
    localeReports.push({ loc, exists: true, missing: locMissing });
  }

  console.log(`Locale coverage:`);
  for (const r of localeReports) {
    if (!r.exists) {
      console.log(`  ${r.loc}: missing locale file`);
      continue;
    }
    console.log(`  ${r.loc}: ${r.missing.length} missing keys`);
    if (r.missing.length) console.log(r.missing.sort().slice(0,50).map(k => `    - ${k}`).join('\n'));
  }

  process.exit(missing.length ? 1 : 0);
}

if (require.main === module) main();
