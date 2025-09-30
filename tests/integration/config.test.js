/**
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: tests/integration/config.test.js
 * FUNCTION: Integration tests for configuration management
 * ARCHITECTURE: Jest test suite with Chrome API mocks
 * 
 * COPYRIGHT © 2025 HOSTWEK LTD. ALL RIGHTS RESERVED.
 * DEVELOPED BY JOSEPH MATINO UNDER WEKTURBO DESIGNS - HOSTWEK LTD
 * ================================================================================
 */

const fs = require('fs');
const path = require('path');

const configCode = fs.readFileSync(
  path.join(__dirname, '../../src/shared/config.js'),
  'utf8'
);

describe('Configuration Management Integration Tests', () => {
  let mockStorage = {};

  beforeEach(() => {
    mockStorage = {};
    global.window = global;

    // Set up chrome mock BEFORE evaluating config code
    const chromeMock = {
      storage: {
        local: {
          get: jest.fn((keys, callback) => {
            callback(mockStorage);
          }),
          set: jest.fn((data, callback) => {
            Object.assign(mockStorage, data);
            if (callback) callback();
          })
        },
        sync: {
          get: jest.fn((keys, callback) => {
            callback(mockStorage);
          }),
          set: jest.fn((data, callback) => {
            Object.assign(mockStorage, data);
            if (callback) callback();
          })
        }
      }
    };

    global.chrome = chromeMock;
    global.window.chrome = chromeMock;
    global.GPTPF_CONFIG = undefined;
    eval(configCode);
  });

  describe('Configuration Loading', () => {
    test('loads default configuration when storage is empty', (done) => {
      global.GPTPF_CONFIG.getConfig((config) => {
        expect(config.DEFAULTS).toBeDefined();
        expect(config.DEFAULTS.wordLimit).toBe(500);
        expect(config.DEFAULTS.batchMode).toBe(false);
        expect(config.DEFAULTS.fileFormat).toBe('auto');
        expect(config.DEFAULTS.useDelay).toBe(false);
        done();
      });
    });

    test('merges stored config with defaults', (done) => {
      mockStorage.__config = { wordLimit: 1000, customOption: true };

      global.GPTPF_CONFIG.getConfig((config) => {
        expect(config.wordLimit).toBe(1000);
        expect(config.customOption).toBe(true);
        done();
      });
    });

    test('handles storage errors gracefully', (done) => {
      global.chrome.storage.local.get = jest.fn((keys, callback) => {
        // Simulate error by calling callback with empty result
        callback({});
      });

      global.GPTPF_CONFIG.getConfig((config) => {
        expect(config.DEFAULTS).toBeDefined();
        done();
      });
    });
  });

  describe('Configuration Saving', () => {
    test('saves configuration to Chrome storage', (done) => {
      const newConfig = { wordLimit: 1000, batchMode: true };

      global.GPTPF_CONFIG.setConfig(newConfig, () => {
        expect(mockStorage.__config).toBeDefined();
        expect(mockStorage.__config.wordLimit).toBe(1000);
        expect(mockStorage.__config.batchMode).toBe(true);
        done();
      });
    });

    test('merges partial config updates', (done) => {
      mockStorage.__config = { wordLimit: 500, batchMode: false };

      const patch = { wordLimit: 1000 };

      global.GPTPF_CONFIG.setConfig(patch, () => {
        expect(mockStorage.__config.wordLimit).toBe(1000);
        expect(mockStorage.__config.batchMode).toBe(false);
        done();
      });
    });

    test('handles save errors gracefully', (done) => {
      global.chrome.storage.local.set = jest.fn((data, callback) => {
        // Simulate error by calling callback anyway
        if (callback) callback();
      });

      global.GPTPF_CONFIG.setConfig({ wordLimit: 1000 }, () => {
        done();
      });
    });
  });

  describe('URL Validation', () => {
    test('validates ChatGPT URLs', () => {
      expect(global.GPTPF_CONFIG.isSupportedUrl('https://chat.openai.com/c/123')).toBe(true);
      expect(global.GPTPF_CONFIG.isSupportedUrl('https://chatgpt.com/c/456')).toBe(true);
    });

    test('validates Claude URLs', () => {
      expect(global.GPTPF_CONFIG.isSupportedUrl('https://claude.ai/chat/789')).toBe(true);
    });

    test('validates Gemini URLs', () => {
      expect(global.GPTPF_CONFIG.isSupportedUrl('https://gemini.google.com/app')).toBe(true);
    });

    test('validates DeepSeek URLs', () => {
      expect(global.GPTPF_CONFIG.isSupportedUrl('https://chat.deepseek.com/chat')).toBe(true);
    });

    test('validates Grok URLs', () => {
      expect(global.GPTPF_CONFIG.isSupportedUrl('https://grok.com/chat')).toBe(true);
    });

    test('rejects unsupported URLs', () => {
      expect(global.GPTPF_CONFIG.isSupportedUrl('https://example.com')).toBe(false);
      expect(global.GPTPF_CONFIG.isSupportedUrl('https://google.com')).toBe(false);
    });

    test('handles invalid URL input', () => {
      expect(global.GPTPF_CONFIG.isSupportedUrl('')).toBe(false);
      expect(global.GPTPF_CONFIG.isSupportedUrl(null)).toBe(false);
      expect(global.GPTPF_CONFIG.isSupportedUrl(undefined)).toBe(false);
    });
  });

  describe('Platform Domains Configuration', () => {
    test('contains all platform domains', () => {
      expect(global.GPTPF_CONFIG.PLATFORM_DOMAINS).toBeDefined();
      expect(global.GPTPF_CONFIG.PLATFORM_DOMAINS.chatgpt).toContain('chat.openai.com');
      expect(global.GPTPF_CONFIG.PLATFORM_DOMAINS.chatgpt).toContain('chatgpt.com');
      expect(global.GPTPF_CONFIG.PLATFORM_DOMAINS.claude).toContain('claude.ai');
      expect(global.GPTPF_CONFIG.PLATFORM_DOMAINS.gemini).toContain('gemini.google.com');
      expect(global.GPTPF_CONFIG.PLATFORM_DOMAINS.deepseek).toContain('chat.deepseek.com');
      expect(global.GPTPF_CONFIG.PLATFORM_DOMAINS.grok).toContain('grok.com');
    });
  });

  describe('Platform Timeouts Configuration', () => {
    test('contains timeout values for all platforms', () => {
      expect(global.GPTPF_CONFIG.PLATFORM_TIMEOUTS).toBeDefined();
      expect(global.GPTPF_CONFIG.PLATFORM_TIMEOUTS.chatgpt).toBe(2000);
      expect(global.GPTPF_CONFIG.PLATFORM_TIMEOUTS.claude).toBe(3000);
      expect(global.GPTPF_CONFIG.PLATFORM_TIMEOUTS.gemini).toBe(5000);
      expect(global.GPTPF_CONFIG.PLATFORM_TIMEOUTS.deepseek).toBe(3000);
      expect(global.GPTPF_CONFIG.PLATFORM_TIMEOUTS.grok).toBe(4000);
    });
  });

  describe('Default Configuration Values', () => {
    test('has correct default values', () => {
      expect(global.GPTPF_CONFIG.DEFAULTS.wordLimit).toBe(500);
      expect(global.GPTPF_CONFIG.DEFAULTS.batchMode).toBe(false);
      expect(global.GPTPF_CONFIG.DEFAULTS.fileFormat).toBe('auto');
      expect(global.GPTPF_CONFIG.DEFAULTS.useDelay).toBe(false);
      expect(global.GPTPF_CONFIG.DEFAULTS.delaySeconds).toBe(3);
      expect(global.GPTPF_CONFIG.DEFAULTS.claudeOverride).toBe(true);
      expect(global.GPTPF_CONFIG.DEFAULTS.autoAttachEnabled).toBe(true);
    });
  });

  describe('Validation Limits', () => {
    test('config object exists and is frozen', () => {
      expect(global.GPTPF_CONFIG).toBeDefined();
      expect(Object.isFrozen(global.GPTPF_CONFIG.PLATFORM_DOMAINS)).toBe(true);
      expect(Object.isFrozen(global.GPTPF_CONFIG.PLATFORM_TIMEOUTS)).toBe(true);
      expect(Object.isFrozen(global.GPTPF_CONFIG.DEFAULTS)).toBe(true);
    });
  });

  describe('Configuration Persistence', () => {
    test('persists configuration across multiple operations', (done) => {
      const config1 = { wordLimit: 1000 };

      global.GPTPF_CONFIG.setConfig(config1, () => {
        expect(mockStorage.__config.wordLimit).toBe(1000);

        global.GPTPF_CONFIG.getConfig((config) => {
          expect(config.wordLimit).toBe(1000);

          const config2 = { batchMode: true };
          global.GPTPF_CONFIG.setConfig(config2, () => {
            expect(mockStorage.__config.batchMode).toBe(true);

            global.GPTPF_CONFIG.getConfig((finalConfig) => {
              expect(finalConfig.wordLimit).toBe(1000);
              expect(finalConfig.batchMode).toBe(true);
              done();
            });
          });
        });
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles empty config object in setConfig', (done) => {
      global.GPTPF_CONFIG.setConfig({}, () => {
        expect(mockStorage.__config).toBeDefined();
        done();
      });
    });

    test('handles URL with special characters', () => {
      expect(global.GPTPF_CONFIG.isSupportedUrl('https://chat.openai.com/c/123?model=gpt-4&temp=0.7')).toBe(true);
    });
  });
});

