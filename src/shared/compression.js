/*
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: src/shared/compression.js
 * FUNCTION: File compression utilities for large attachments
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
 * • PLATFORM INTEGRATIONS: Shared compression utilities used across all platforms
 * • CORE DEPENDENCIES: Chrome Extension APIs, CompressionStream, FileReader API
 * • FEATURES: Text compression/decompression, compression heuristics, size formatting utilities
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
  if (root.GPTPF_COMPRESSION) return;

  class CompressionUtils {
    static async compressText(text, options = {}) {
      const {
        threshold = 1024,
        format = 'gzip',
        level = 'default'
      } = options;

      if (!text || text.length < threshold) {
        return { compressed: false, data: text, originalSize: text.length };
      }

      try {
        if (!window.CompressionStream) {
          return { compressed: false, data: text, originalSize: text.length, error: 'Compression not supported' };
        }

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        const input = encoder.encode(text);

        const compressionStream = new CompressionStream(format);
        const writer = compressionStream.writable.getWriter();
        const reader = compressionStream.readable.getReader();

        writer.write(input);
        writer.close();

        const chunks = [];
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) chunks.push(value);
        }

        const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          compressed.set(chunk, offset);
          offset += chunk.length;
        }

        const compressionRatio = compressed.length / input.length;

        if (compressionRatio > 0.9) {
          return { compressed: false, data: text, originalSize: text.length, reason: 'Poor compression ratio' };
        }

        const base64Data = btoa(String.fromCharCode(...compressed));

        return {
          compressed: true,
          data: text,
          compressedData: base64Data,
          originalSize: text.length,
          compressedSize: compressed.length,
          compressionRatio: compressionRatio,
          format: format
        };

      } catch (error) {
        return { compressed: false, data: text, originalSize: text.length, error: error.message };
      }
    }

    static async decompressText(compressedData, format = 'gzip') {
      try {
        if (!window.DecompressionStream) {
          throw new Error('Decompression not supported');
        }

        const binaryString = atob(compressedData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const decompressionStream = new DecompressionStream(format);
        const writer = decompressionStream.writable.getWriter();
        const reader = decompressionStream.readable.getReader();
        
        writer.write(bytes);
        writer.close();
        
        const chunks = [];
        let done = false;
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) chunks.push(value);
        }
        
        const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          decompressed.set(chunk, offset);
          offset += chunk.length;
        }
        
        const decoder = new TextDecoder();
        return decoder.decode(decompressed);
        
      } catch (error) {
        throw new Error(`Decompression failed: ${error.message}`);
      }
    }

    static shouldCompress(text, threshold = 1024) {
      return text && text.length >= threshold && window.CompressionStream;
    }

    static formatSize(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    static getCompressionInfo(result) {
      if (!result.compressed) return null;
      
      const savings = result.originalSize - result.compressedSize;
      const savingsPercent = Math.round((savings / result.originalSize) * 100);
      
      return {
        originalSize: this.formatSize(result.originalSize),
        compressedSize: this.formatSize(result.compressedSize),
        savings: this.formatSize(savings),
        savingsPercent: savingsPercent,
        ratio: result.compressionRatio.toFixed(2)
      };
    }
  }

  root.GPTPF_COMPRESSION = Object.freeze({
    compressText: CompressionUtils.compressText.bind(CompressionUtils),
    decompressText: CompressionUtils.decompressText.bind(CompressionUtils),
    shouldCompress: CompressionUtils.shouldCompress.bind(CompressionUtils),
    formatSize: CompressionUtils.formatSize.bind(CompressionUtils),
    getCompressionInfo: CompressionUtils.getCompressionInfo.bind(CompressionUtils)
  });
})();
