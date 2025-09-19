/*
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: src/shared/batchprocessor.js
 * FUNCTION: Content splitting processor for dividing large content into multiple files
 * ARCHITECTURE: Chrome Extension Manifest V3, modular event-driven design
 * SECURITY: Client-side processing, zero data transmission, privacy-first
 * PERFORMANCE: Optimized for Chrome V3 Manifest, lazy loading, efficient DOM
 * COMPATIBILITY: Chrome 88+, Edge 88+, Opera 74+, modern browser APIs
 * RELIABILITY: Production error handling, graceful degradation, stable operation
 *
 * DEVELOPMENT TEAM & PROJECT LEADERSHIP:
 * • LEAD DEVELOPER: Joseph Matino <dev@josephmatino.com> | https://josephmatino.com
 * • SCRUM MASTER & PROJECT FUNDING: Majok Deng <scrum@majokdeng.com> | https://majokdeng.com
 * • QUALITY ASSURANCE: Automated testing pipeline with CircleCI integration
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
 * TECHNICAL ARCHITECTURE & INTEGRATIONS:
 * • PLATFORM INTEGRATIONS: Shared batch processing utilities used across all platforms
 * • CORE DEPENDENCIES: Chrome Extension APIs, CompressionStream, FileReader API
 * • FEATURES: Content splitting, optional compression, per-part metadata, progress callbacks
 * • TESTING: Automated unit tests and integration validation across supported platforms
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
 * 🔒 CONFIDENTIALITY & TRADE SECRET PROTECTION:
 * This software contains confidential and proprietary information constituting
 * trade secrets of Hostwek LTD. Unauthorized disclosure, use, or distribution
 * of this technology or its underlying source code is prohibited and
 * may result in legal action, including injunctive relief and monetary damages.
 * ================================================================================
 */

(() => {
  const root = (typeof self !== 'undefined') ? self : window;
  if (root.GPTPF_BATCH) return;

  class BatchProcessor {
    constructor() {
      this.queue = [];
      this.processing = false;
      this.onProgress = null;
      this.onComplete = null;
    }

    static splitContent(text, maxFiles) {
      if (!text || typeof text !== 'string') return [];

      const config = root.GPTPF_CONFIG?.VALIDATION_LIMITS || {};
      const actualMaxFiles = Math.min(maxFiles || 4, config.maxBatchFiles || 4);

      if (actualMaxFiles <= 1) return [];

      const lines = text.split('\n');
      const totalLines = lines.length;
      const linesPerFile = Math.ceil(totalLines / actualMaxFiles);

      const parts = [];
      for (let i = 0; i < actualMaxFiles && i * linesPerFile < totalLines; i++) {
        const startLine = i * linesPerFile;
        const endLine = Math.min((i + 1) * linesPerFile, totalLines);
        const partContent = lines.slice(startLine, endLine).join('\n').trim();

        if (partContent.length > 0) {
          const detector = root.GPTPF_LANGUAGE_DETECTOR || new (root.LanguageDetector || class { detectLanguage() { return { extension: 'txt' }; } })();
          const detection = detector.detectLanguage(partContent);

          const actualEndLine = startLine + partContent.split('\n').length - 1;

          parts.push({
            content: partContent,
            partNumber: i + 1,
            startLine: startLine + 1,
            endLine: actualEndLine + 1,
            extension: detection.extension || 'txt',
            filename: BatchProcessor.generateFilename(detection.extension || 'txt', i + 1, startLine + 1, actualEndLine + 1)
          });
        }
      }

      return parts;
    }

    static generateFilename(extension, partNumber, startLine, endLine) {
      return `part${partNumber}-lines${startLine}-${endLine}.${extension}`;
    }

    async processParts(parts, options = {}) {
      if (this.processing) return { success: false, error: 'Already processing' };

      this.processing = true;
      this.queue = [...parts];

      const results = [];
      const configLimit = root.GPTPF_CONFIG?.VALIDATION_LIMITS?.maxBatchFiles || 4;
      const maxFiles = Math.min(options.maxFiles || configLimit, configLimit);
      const delay = options.delay || 500;

      try {
        for (let i = 0; i < Math.min(parts.length, maxFiles); i++) {
          if (!this.processing) {
            return { success: false, error: 'Processing cancelled', results };
          }
          const part = parts[i];

          if (this.onProgress) {
            this.onProgress({
              current: i + 1,
              total: Math.min(parts.length, maxFiles),
              filename: part.filename,
              size: part.content.length
            });
          }

          let processedContent = part.content;
          let compressionInfo = null;

          if (root.GPTPF_COMPRESSION && options.enableCompression) {
            const compressionResult = await root.GPTPF_COMPRESSION.compressText(
              part.content,
              { threshold: options.compressionThreshold || 1024 }
            );

            if (compressionResult.compressed) {
              compressionInfo = compressionResult;
            }
          }

          results.push({
            ...part,
            processedContent,
            compressionInfo,
            originalSize: part.content.length,
            finalSize: processedContent.length
          });

          if (i < Math.min(parts.length, maxFiles) - 1) {
            if (!this.processing) {
              return { success: false, error: 'Processing cancelled', results };
            }
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }

        if (this.onComplete) {
          this.onComplete({ success: true, results, processed: results.length });
        }

        return { success: true, results, processed: results.length };

      } catch (error) {
        if (this.onComplete) {
          this.onComplete({ success: false, error: error.message });
        }
        return { success: false, error: error.message };
      } finally {
        this.processing = false;
        this.queue = [];
      }
    }

    cancel() {
      this.processing = false;
      this.queue = [];
    }

    isProcessing() {
      return this.processing;
    }
  }

  root.GPTPF_BATCH = Object.freeze({
    BatchProcessor,
    splitContent: BatchProcessor.splitContent.bind(BatchProcessor),
    generateFilename: BatchProcessor.generateFilename.bind(BatchProcessor)
  });
})();
