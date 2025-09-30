/**
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: tests/setup.js
 * FUNCTION: Jest test environment setup with Chrome API mocks
 * ARCHITECTURE: Global test configuration and mocks
 * 
 * COPYRIGHT © 2025 HOSTWEK LTD. ALL RIGHTS RESERVED.
 * DEVELOPED BY JOSEPH MATINO UNDER WEKTURBO DESIGNS - HOSTWEK LTD
 * ================================================================================
 */

// Mock Chrome APIs
global.chrome = {
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        callback({});
      }),
      set: jest.fn((items, callback) => {
        if (callback) callback();
      })
    },
    sync: {
      get: jest.fn((keys, callback) => {
        callback({});
      }),
      set: jest.fn((items, callback) => {
        if (callback) callback();
      })
    }
  },
  runtime: {
    sendMessage: jest.fn((message, callback) => {
      if (callback) callback({ ok: true });
    }),
    onMessage: {
      addListener: jest.fn()
    },
    getManifest: jest.fn(() => ({
      version: '1.1.0',
      name: 'Multi-AI File Paster'
    }))
  },
  i18n: {
    getMessage: jest.fn((key) => key),
    getUILanguage: jest.fn(() => 'en')
  },
  alarms: {
    create: jest.fn(),
    clear: jest.fn(),
    get: jest.fn((name, callback) => {
      if (callback) callback(null);
    }),
    onAlarm: {
      addListener: jest.fn()
    }
  }
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock File and Blob APIs
global.File = class File {
  constructor(bits, name, options = {}) {
    this.name = name;
    this.type = options.type || '';
    this.lastModified = options.lastModified || Date.now();
    this.size = bits.reduce((acc, bit) => {
      if (typeof bit === 'string') return acc + bit.length;
      if (bit instanceof Blob) return acc + bit.size;
      if (bit.length !== undefined) return acc + bit.length;
      return acc;
    }, 0);
  }
};

global.Blob = class Blob {
  constructor(bits = [], options = {}) {
    this.type = options.type || '';
    this.size = bits.reduce((acc, bit) => {
      if (typeof bit === 'string') return acc + bit.length;
      if (bit instanceof Blob) return acc + bit.size;
      if (bit.length !== undefined) return acc + bit.length;
      return acc;
    }, 0);
  }
};

// Mock FileReader
global.FileReader = class FileReader {
  constructor() {
    this.readyState = 0;
    this.result = null;
    this.error = null;
  }

  readAsText(file) {
    setTimeout(() => {
      this.readyState = 2;
      this.result = 'mock file content';
      if (this.onload) this.onload();
    }, 0);
  }
};

// Mock DataTransfer for drag-drop testing
global.DataTransfer = class DataTransfer {
  constructor() {
    this.files = [];
    this.items = [];
    this.types = [];

    this.items.add = (file) => {
      this.files.push(file);
    };
  }
};

// Console suppression for cleaner test output
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn()
};
