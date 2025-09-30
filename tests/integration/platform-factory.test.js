/**
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: tests/integration/platform-factory.test.js
 * FUNCTION: Integration tests for PlatformFactory class
 * ARCHITECTURE: Jest test suite with Chrome API mocks
 * 
 * COPYRIGHT © 2025 HOSTWEK LTD. ALL RIGHTS RESERVED.
 * DEVELOPED BY JOSEPH MATINO UNDER WEKTURBO DESIGNS - HOSTWEK LTD
 * ================================================================================
 */

const fs = require('fs');
const path = require('path');

// Load source files
const configCode = fs.readFileSync(
  path.join(__dirname, '../../src/shared/config.js'),
  'utf8'
);
const factoryCode = fs.readFileSync(
  path.join(__dirname, '../../src/content/platforms/factory.js'),
  'utf8'
);

describe('PlatformFactory Integration Tests', () => {
  beforeEach(() => {
    // Reset global state
    global.window = global;
    global.window.location = { href: '', hostname: '' };
    global.GPTPF_DEBUG = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
    global.GPTPF_CONFIG = undefined;
    global.PlatformFactory = undefined;
    global.ChatGPTPlatform = undefined;
    global.ClaudePlatform = undefined;
    global.GeminiPlatform = undefined;
    global.DeepSeekPlatform = undefined;
    global.GrokPlatform = undefined;

    // Execute config first
    eval(configCode);

    // Mock platform classes
    global.ChatGPTPlatform = class { constructor() { this.name = 'chatgpt'; } };
    global.ClaudePlatform = class { constructor() { this.name = 'claude'; } };
    global.GeminiPlatform = class { constructor() { this.name = 'gemini'; } };
    global.DeepSeekPlatform = class { constructor() { this.name = 'deepseek'; } };
    global.GrokPlatform = class { constructor() { this.name = 'grok'; } };

    // Execute factory code
    eval(factoryCode);
  });

  describe('Platform Detection', () => {
    test('returns unknown for unsupported URL', () => {
      global.window.location = { href: 'https://example.com', hostname: 'example.com' };
      const platform = global.PlatformFactory.getCurrentPlatform();
      expect(platform).toBe('unknown');
    });

    test('factory has platform configuration', () => {
      expect(global.PlatformFactory.platforms).toBeDefined();
      expect(global.PlatformFactory.platforms.length).toBeGreaterThan(0);
    });
  });

  describe('Platform Handler Creation', () => {
    test('returns null for unknown platform', () => {
      global.window.location = { href: 'https://example.com', hostname: 'example.com' };
      const handler = global.PlatformFactory.createPlatformHandler();
      expect(handler).toBeNull();
    });

    test('platform classes are available', () => {
      expect(global.ChatGPTPlatform).toBeDefined();
      expect(global.ClaudePlatform).toBeDefined();
      expect(global.GeminiPlatform).toBeDefined();
      expect(global.DeepSeekPlatform).toBeDefined();
      expect(global.GrokPlatform).toBeDefined();
    });
  });

  describe('Platform Settings', () => {
    test('uses default timeout for unknown platform', () => {
      global.window.location = { href: 'https://example.com', hostname: 'example.com' };
      const settings = global.PlatformFactory.getPlatformSettings({});
      expect(settings.timeout).toBe(3000);
    });

    test('merges base settings', () => {
      global.window.location = { href: 'https://example.com', hostname: 'example.com' };
      const baseSettings = { customOption: true, wordLimit: 500 };
      const settings = global.PlatformFactory.getPlatformSettings(baseSettings);
      expect(settings.customOption).toBe(true);
      expect(settings.wordLimit).toBe(500);
    });
  });

  describe('Platform Support Check', () => {
    test('returns false for unsupported platform', () => {
      global.window.location = { href: 'https://example.com', hostname: 'example.com' };
      const isSupported = global.PlatformFactory.isSupportedPlatform();
      expect(isSupported).toBe(false);
    });
  });

  describe('Supported Platforms List', () => {
    test('returns all supported platform names', () => {
      const platforms = global.PlatformFactory.getSupportedPlatforms();
      expect(platforms).toEqual(['chatgpt', 'claude', 'gemini', 'deepseek', 'grok']);
    });

    test('returns array with correct length', () => {
      const platforms = global.PlatformFactory.getSupportedPlatforms();
      expect(platforms).toHaveLength(5);
    });
  });

  describe('Debug Logging', () => {
    test('warns for unknown platform', () => {
      global.window.location = { href: 'https://example.com', hostname: 'example.com' };
      global.PlatformFactory.getCurrentPlatform();
      expect(global.GPTPF_DEBUG.warn).toHaveBeenCalledWith('debug_factory_unknown_platform');
    });
  });

  describe('Configuration', () => {
    test('has platform timeouts configured', () => {
      expect(global.GPTPF_CONFIG.PLATFORM_TIMEOUTS).toBeDefined();
      expect(global.GPTPF_CONFIG.PLATFORM_TIMEOUTS.chatgpt).toBe(2000);
      expect(global.GPTPF_CONFIG.PLATFORM_TIMEOUTS.claude).toBe(3000);
      expect(global.GPTPF_CONFIG.PLATFORM_TIMEOUTS.gemini).toBe(5000);
    });

    test('has platform domains configured', () => {
      expect(global.GPTPF_CONFIG.PLATFORM_DOMAINS).toBeDefined();
      expect(global.GPTPF_CONFIG.PLATFORM_DOMAINS.chatgpt).toContain('chat.openai.com');
      expect(global.GPTPF_CONFIG.PLATFORM_DOMAINS.claude).toContain('claude.ai');
    });
  });
});

