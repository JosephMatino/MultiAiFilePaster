/**
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: tests/unit/languagedetector.test.js
 * FUNCTION: Unit tests for LanguageDetector class
 * 
 * COPYRIGHT © 2025 HOSTWEK LTD. ALL RIGHTS RESERVED.
 * ================================================================================
 */

const fs = require('fs');
const path = require('path');

// Load actual languagedetector.js
const detectorCode = fs.readFileSync(
  path.join(__dirname, '../../src/shared/languagedetector.js'),
  'utf8'
);

describe('LanguageDetector Class', () => {
  let LanguageDetector;

  beforeEach(() => {
    // Reset global namespace
    global.window = {
      GPTPF_CONFIG: {},
      GPTPF_DEBUG: { info: jest.fn() }
    };
    
    // Execute languagedetector.js to get LanguageDetector class
    eval(detectorCode);
    LanguageDetector = global.window.LanguageDetector;
  });

  describe('detectLanguage method', () => {
    let detector;

    beforeEach(() => {
      detector = new LanguageDetector();
    });

    test('detects JavaScript', () => {
      // Need longer code with multiple patterns to meet confidence threshold
      const code = `function test() { 
        const x = 5; 
        let y = 10;
        const result = x + y;
        console.log(result);
        return result;
      }
      const data = [1, 2, 3];
      export default test;`;
      const result = detector.detectLanguage(code);
      expect(result.language).toBe('javascript');
      expect(result.extension).toBe('js');
    });

    test('detects Python', () => {
      // Need longer code with multiple Python patterns
      const code = `def hello():
    print("Hello World")
    return True

def main():
    result = hello()
    if result:
        print("Success")
    
if __name__ == "__main__":
    main()`;
      const result = detector.detectLanguage(code);
      expect(result.language).toBe('python');
      expect(result.extension).toBe('py');
    });

    test('detects HTML', () => {
      const code = '<!DOCTYPE html><html><head><title>Test</title></head><body></body></html>';
      const result = detector.detectLanguage(code);
      expect(result.language).toBe('html');
      expect(result.extension).toBe('html');
    });

    test('detects CSS', () => {
      // Need longer CSS with multiple patterns
      const code = `.class { 
        color: red; 
        font-size: 16px;
        padding: 10px;
      } 
      #id { 
        margin: 10px; 
        background: #fff;
      }
      .container {
        display: flex;
        justify-content: center;
      }`;
      const result = detector.detectLanguage(code);
      expect(result.language).toBe('css');
      expect(result.extension).toBe('css');
    });

    test('detects JSON', () => {
      const code = '{"name": "test", "value": 123, "active": true}';
      const result = detector.detectLanguage(code);
      expect(result.language).toBe('json');
      expect(result.extension).toBe('json');
    });

    test('falls back to text for unknown', () => {
      const code = 'random text without clear patterns';
      const result = detector.detectLanguage(code);
      expect(result.language).toBe('text');
      expect(result.extension).toBe('txt');
    });

    test('handles empty string', () => {
      const result = detector.detectLanguage('');
      expect(result.language).toBe('text');
      expect(result.extension).toBe('txt');
      expect(result.confidence).toBe(0);
    });

    test('handles null/undefined', () => {
      const result1 = detector.detectLanguage(null);
      expect(result1.language).toBe('text');
      
      const result2 = detector.detectLanguage(undefined);
      expect(result2.language).toBe('text');
    });
  });

  describe('getFileExtension method', () => {
    let detector;

    beforeEach(() => {
      detector = new LanguageDetector();
    });

    test('returns extension for JavaScript with sufficient code', () => {
      // Need longer code for confidence threshold
      const code = 'function test() { const x = 5; let y = 10; return x + y; } const result = test(); console.log(result);';
      const ext = detector.getFileExtension(code);
      expect(ext).toBe('js');
    });

    test('uses fallback for empty string', () => {
      const ext = detector.getFileExtension('', 'custom');
      expect(ext).toBe('custom');
    });

    test('uses fallback for low confidence', () => {
      const code = 'abc';
      const ext = detector.getFileExtension(code, 'txt');
      expect(ext).toBe('txt');
    });
  });

  describe('fenceHint method', () => {
    let detector;

    beforeEach(() => {
      detector = new LanguageDetector();
    });

    test('detects fence hint', () => {
      const code = '```javascript\nconst x = 5;\n```';
      const hint = detector.fenceHint(code);
      expect(hint).toBe('js');
    });

    test('returns null for no fence', () => {
      const code = 'const x = 5;';
      const hint = detector.fenceHint(code);
      expect(hint).toBeNull();
    });
  });

  describe('isValidJSON method', () => {
    let detector;

    beforeEach(() => {
      detector = new LanguageDetector();
    });

    test('validates valid JSON', () => {
      expect(detector.isValidJSON('{"key": "value"}')).toBe(true);
      expect(detector.isValidJSON('[1, 2, 3]')).toBe(true);
    });

    test('rejects invalid JSON', () => {
      expect(detector.isValidJSON('{key: value}')).toBe(false);
      expect(detector.isValidJSON('not json')).toBe(false);
    });
  });
});
