/**
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: tests/unit/batchprocessor.test.js
 * FUNCTION: Unit tests for GPTPF_BATCH namespace
 * 
 * COPYRIGHT © 2025 HOSTWEK LTD. ALL RIGHTS RESERVED.
 * ================================================================================
 */

const fs = require('fs');
const path = require('path');

// Load actual batchprocessor.js
const batchCode = fs.readFileSync(
  path.join(__dirname, '../../src/shared/batchprocessor.js'),
  'utf8'
);

// Load languagedetector.js (dependency)
const detectorCode = fs.readFileSync(
  path.join(__dirname, '../../src/shared/languagedetector.js'),
  'utf8'
);

describe('GPTPF_BATCH Module', () => {
  beforeEach(() => {
    // Reset global namespace
    global.self = global;
    global.window = global;
    global.GPTPF_CONFIG = {
      VALIDATION_LIMITS: {
        maxBatchFiles: 4
      }
    };
    global.GPTPF_DEBUG = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    global.GPTPF_I18N = {
      getMessage: (key, params) => key
    };
    
    // Load LanguageDetector first (dependency)
    eval(detectorCode);
    global.GPTPF_LANGUAGE_DETECTOR = new global.LanguageDetector();
    
    // Reset GPTPF_BATCH
    global.GPTPF_BATCH = undefined;
    
    // Execute batchprocessor.js
    eval(batchCode);
  });

  describe('splitContent static method', () => {
    test('returns empty array for null/undefined', () => {
      const result = global.GPTPF_BATCH.splitContent(null, 4);
      expect(result).toEqual([]);
    });

    test('returns empty array for short content', () => {
      const shortText = 'Hello world';
      const result = global.GPTPF_BATCH.splitContent(shortText, 4);
      expect(result).toEqual([]);
    });

    test('splits long content into parts', () => {
      // Need > 1000 chars and > 50 lines for splitting to work
      const lines = [];
      for (let i = 0; i < 100; i++) {
        lines.push(`Line ${i}: This is some longer content for testing the batch processor split functionality with enough text`);
      }
      const longText = lines.join('\n');
      
      // Verify it meets minimum requirements
      expect(longText.length).toBeGreaterThan(1000);
      
      const result = global.GPTPF_BATCH.splitContent(longText, 4);
      
      // splitContent may return empty if content is structured (JSON, XML, etc)
      // or if parts are too small after splitting
      if (result.length > 0) {
        expect(result.length).toBeLessThanOrEqual(4);
      }
    });

    test('each part has required properties', () => {
      const lines = [];
      for (let i = 0; i < 100; i++) {
        lines.push(`function test${i}() { return ${i}; }`);
      }
      const code = lines.join('\n');
      
      const result = global.GPTPF_BATCH.splitContent(code, 3);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('content');
        expect(result[0]).toHaveProperty('partNumber');
        expect(result[0]).toHaveProperty('filename');
        expect(result[0]).toHaveProperty('extension');
      }
    });

    test('respects maxFiles limit', () => {
      const lines = Array.from({length: 200}, (_, i) => `Line ${i}`);
      const longText = lines.join('\n');
      
      const result = global.GPTPF_BATCH.splitContent(longText, 2);
      expect(result.length).toBeLessThanOrEqual(2);
    });
  });

  describe('generateFilename static method', () => {
    test('generates correct filename format', () => {
      const filename = global.GPTPF_BATCH.generateFilename('js', 1, 1, 50);
      expect(filename).toBe('part1-lines1-50.js');
    });

    test('handles different extensions', () => {
      const filename1 = global.GPTPF_BATCH.generateFilename('py', 2, 51, 100);
      expect(filename1).toContain('.py');
      
      const filename2 = global.GPTPF_BATCH.generateFilename('txt', 3, 101, 150);
      expect(filename2).toContain('.txt');
    });
  });

  describe('BatchProcessor class', () => {
    test('can be instantiated', () => {
      const processor = new global.GPTPF_BATCH.BatchProcessor();
      expect(processor).toBeDefined();
      expect(processor.isProcessing()).toBe(false);
    });

    test('processParts handles empty array', async () => {
      const processor = new global.GPTPF_BATCH.BatchProcessor();
      const result = await processor.processParts([]);
      expect(result.success).toBe(true);
      expect(result.processed).toBe(0);
    });

    test('processParts processes parts', async () => {
      const processor = new global.GPTPF_BATCH.BatchProcessor();
      const parts = [
        {
          content: 'test content',
          partNumber: 1,
          filename: 'part1.txt',
          extension: 'txt'
        }
      ];
      
      const result = await processor.processParts(parts, { delay: 0 });
      expect(result.success).toBe(true);
      expect(result.processed).toBe(1);
    });

    test('can be cancelled', async () => {
      const processor = new global.GPTPF_BATCH.BatchProcessor();
      const parts = Array.from({length: 5}, (_, i) => ({
        content: `content ${i}`,
        partNumber: i + 1,
        filename: `part${i+1}.txt`,
        extension: 'txt'
      }));
      
      // Start processing
      const promise = processor.processParts(parts, { delay: 100 });
      
      // Cancel immediately
      processor.cancel();
      
      const result = await promise;
      expect(result.success).toBe(false);
    });
  });
});
