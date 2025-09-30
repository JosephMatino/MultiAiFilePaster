/**
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: tests/unit/validation.test.js
 * FUNCTION: Unit tests for validation utilities (GPTPF_VALIDATION namespace)
 * 
 * COPYRIGHT © 2025 HOSTWEK LTD. ALL RIGHTS RESERVED.
 * ================================================================================
 */

const fs = require('fs');
const path = require('path');

// Load actual validation.js
const validationCode = fs.readFileSync(
  path.join(__dirname, '../../src/shared/validation.js'),
  'utf8'
);

describe('GPTPF_VALIDATION Module', () => {
  beforeEach(() => {
    // Reset global namespace
    global.GPTPF_DEBUG = { log: jest.fn(), warn: jest.fn() };
    global.GPTPF_I18N = { getMessage: (key) => key };
    global.GPTPF_VALIDATION = undefined;
    
    // Execute validation.js to create GPTPF_VALIDATION
    eval(validationCode);
  });

  describe('sanitizeFileName', () => {
    test('handles empty string', () => {
      const result = global.GPTPF_VALIDATION.sanitizeFileName('');
      expect(result.sanitized).toBe('');
      expect(result.hadDots).toBe(false);
    });

    test('handles null/undefined', () => {
      expect(global.GPTPF_VALIDATION.sanitizeFileName(null).sanitized).toBe('');
      expect(global.GPTPF_VALIDATION.sanitizeFileName(undefined).sanitized).toBe('');
    });

    test('sanitizes invalid characters', () => {
      // The actual code replaces invalid chars with '-' and removes the '?'
      const result = global.GPTPF_VALIDATION.sanitizeFileName('test*file?.txt');
      expect(result.sanitized).toBe('test-file.txt');
    });

    test('removes path separators', () => {
      const result = global.GPTPF_VALIDATION.sanitizeFileName('../../../passwd');
      expect(result.sanitized).not.toContain('..');
    });

    test('preserves valid extension', () => {
      const result = global.GPTPF_VALIDATION.sanitizeFileName('doc.pdf');
      expect(result.sanitized).toBe('doc.pdf');
      expect(result.hadDots).toBe(true);
    });

    test('truncates long filenames', () => {
      const long = 'a'.repeat(100) + '.txt';
      const result = global.GPTPF_VALIDATION.sanitizeFileName(long);
      expect(result.sanitized.length).toBeLessThanOrEqual(64);
    });
  });

  describe('validateCustomExtension', () => {
    test('validates simple extension', () => {
      const result = global.GPTPF_VALIDATION.validateCustomExtension('txt');
      expect(result.valid).toBe(true);
      expect(result.extension).toBe('.txt');
    });

    test('rejects empty extension', () => {
      const result = global.GPTPF_VALIDATION.validateCustomExtension('');
      expect(result.valid).toBe(false);
    });

    test('rejects dangerous extensions', () => {
      const result = global.GPTPF_VALIDATION.validateCustomExtension('exe');
      expect(result.valid).toBe(false);
    });
  });

  describe('wc (word count)', () => {
    test('counts words correctly', () => {
      expect(global.GPTPF_VALIDATION.wc('hello world')).toBe(2);
      expect(global.GPTPF_VALIDATION.wc('  spaced  words  ')).toBe(2);
      expect(global.GPTPF_VALIDATION.wc('')).toBeUndefined();
    });
  });

  describe('clamp', () => {
    test('constrains values to range', () => {
      expect(global.GPTPF_VALIDATION.clamp(5, 0, 10)).toBe(5);
      expect(global.GPTPF_VALIDATION.clamp(-5, 0, 10)).toBe(0);
      expect(global.GPTPF_VALIDATION.clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('escapeHtml', () => {
    test('escapes HTML entities', () => {
      const result = global.GPTPF_VALIDATION.escapeHtml('<script>');
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
    });
  });
});
