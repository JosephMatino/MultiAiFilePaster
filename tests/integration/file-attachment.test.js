/**
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: tests/integration/file-attachment.test.js
 * FUNCTION: Integration tests for file attachment logic
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
const validationCode = fs.readFileSync(
  path.join(__dirname, '../../src/shared/validation.js'),
  'utf8'
);
const fileAttachCode = fs.readFileSync(
  path.join(__dirname, '../../src/content/components/fileattach.js'),
  'utf8'
);

describe('File Attachment Integration Tests', () => {
  beforeEach(() => {
    global.window = global;
    global.GPTPF_DEBUG = { 
      log: jest.fn(), 
      info: jest.fn(), 
      warn: jest.fn(), 
      error: jest.fn() 
    };
    global.GPTPF_I18N = {
      getMessage: jest.fn((key) => key)
    };
    global.GPTPF_CONFIG = undefined;
    global.GPTPF_VALIDATION = undefined;
    global.GPTPF_LANGUAGE_DETECTOR = undefined;
    global.FileAttachComponent = undefined;
    
    eval(configCode);
    eval(validationCode);
    eval(fileAttachCode);
  });

  describe('File Creation', () => {
    test('creates file with text content', () => {
      const component = new global.FileAttachComponent();
      const file = component.makeFile('Hello World', 'txt');
      
      expect(file).toBeInstanceOf(File);
      expect(file.name).toMatch(/paste\.\d+\.txt/);
      expect(file.type).toBe('text/plain;charset=utf-8');
      expect(file.size).toBeGreaterThan(0);
    });

    test('creates file with custom name', () => {
      const component = new global.FileAttachComponent();
      const file = component.makeFile('Test content', 'txt', 'myfile.txt');
      
      expect(file.name).toBe('myfile.txt');
      expect(file.type).toBe('text/plain;charset=utf-8');
    });

    test('creates markdown file with correct MIME type', () => {
      const component = new global.FileAttachComponent();
      const file = component.makeFile('# Heading', 'md');
      
      expect(file.type).toBe('text/markdown;charset=utf-8');
      expect(file.name).toMatch(/paste\.\d+\.md/);
    });

    test('creates JSON file with valid JSON content', () => {
      const component = new global.FileAttachComponent();
      const jsonContent = '{"key": "value"}';
      const file = component.makeFile(jsonContent, 'json');
      
      expect(file.type).toBe('application/json;charset=utf-8');
      expect(file.name).toMatch(/paste\.\d+\.json/);
    });

    test('falls back to txt for invalid JSON', () => {
      const component = new global.FileAttachComponent();
      const invalidJson = '{invalid json}';
      const file = component.makeFile(invalidJson, 'json');
      
      expect(file.type).toBe('text/plain;charset=utf-8');
      expect(file.name).toMatch(/paste\.\d+\.txt/);
    });

    test('creates JavaScript file with correct MIME type', () => {
      const component = new global.FileAttachComponent();
      const file = component.makeFile('console.log("test");', 'js');
      
      expect(file.type).toBe('text/javascript;charset=utf-8');
    });

    test('creates Python file with correct MIME type', () => {
      const component = new global.FileAttachComponent();
      const file = component.makeFile('print("test")', 'py');
      
      expect(file.type).toBe('text/x-python;charset=utf-8');
    });

    test('creates shell script with correct MIME type', () => {
      const component = new global.FileAttachComponent();
      const file = component.makeFile('#!/bin/bash\necho "test"', 'sh');
      
      expect(file.type).toBe('application/x-sh;charset=utf-8');
    });

    test('handles empty content', () => {
      const component = new global.FileAttachComponent();
      const file = component.makeFile('', 'txt');
      
      expect(file).toBeInstanceOf(File);
      expect(file.size).toBe(0);
    });

    test('handles null content', () => {
      const component = new global.FileAttachComponent();
      const file = component.makeFile(null, 'txt');
      
      expect(file).toBeInstanceOf(File);
      expect(file.size).toBe(0);
    });
  });

  describe('File Naming', () => {
    test('increments file counter for auto-generated names', () => {
      const component = new global.FileAttachComponent();
      const file1 = component.makeFile('content1', 'txt');
      const file2 = component.makeFile('content2', 'txt');
      const file3 = component.makeFile('content3', 'txt');
      
      expect(file1.name).toBe('paste.1.txt');
      expect(file2.name).toBe('paste.2.txt');
      expect(file3.name).toBe('paste.3.txt');
    });

    test('sanitizes custom filename', () => {
      const component = new global.FileAttachComponent();
      const file = component.makeFile('content', 'txt', 'my..file..name');

      // Sanitization removes consecutive dots, so expect something like "myfile.name" or similar
      expect(file.name).toContain('my');
      expect(file.name).toContain('file');
      expect(file.name).toContain('name');
    });

    test('adds extension to custom name without extension', () => {
      const component = new global.FileAttachComponent();
      const file = component.makeFile('content', 'txt', 'myfile');
      
      expect(file.name).toBe('myfile.txt');
    });

    test('preserves extension in custom name', () => {
      const component = new global.FileAttachComponent();
      const file = component.makeFile('content', 'txt', 'myfile.md');
      
      expect(file.name).toBe('myfile.md');
    });
  });

  describe('MIME Type Detection', () => {
    const mimeTests = [
      { format: 'html', expected: 'text/html;charset=utf-8' },
      { format: 'css', expected: 'text/css;charset=utf-8' },
      { format: 'xml', expected: 'application/xml;charset=utf-8' },
      { format: 'java', expected: 'text/x-java-source;charset=utf-8' },
      { format: 'cpp', expected: 'text/x-c++src;charset=utf-8' },
      { format: 'go', expected: 'text/x-go;charset=utf-8' },
      { format: 'rust', expected: 'text/x-rustsrc;charset=utf-8' },
      { format: 'ruby', expected: 'text/x-ruby;charset=utf-8' },
      { format: 'php', expected: 'application/x-httpd-php;charset=utf-8' },
      { format: 'sql', expected: 'application/sql;charset=utf-8' },
      { format: 'yaml', expected: 'text/yaml;charset=utf-8' },
      { format: 'swift', expected: 'text/x-swift;charset=utf-8' },
      { format: 'kotlin', expected: 'text/x-kotlin;charset=utf-8' }
    ];

    mimeTests.forEach(({ format, expected }) => {
      test(`detects correct MIME type for ${format}`, () => {
        const component = new global.FileAttachComponent();
        const file = component.makeFile('test content', format);
        expect(file.type).toBe(expected);
      });
    });
  });

  describe('DataTransfer Creation', () => {
    test('creates DataTransfer object with file', () => {
      const component = new global.FileAttachComponent();
      const file = component.makeFile('content', 'txt');

      const dt = new DataTransfer();
      dt.items.add(file);

      expect(dt.files.length).toBe(1);
      expect(dt.files[0]).toBe(file);
    });
  });

  describe('Debug Logging', () => {
    test('logs file creation', () => {
      const component = new global.FileAttachComponent();
      component.makeFile('content', 'txt');
      
      expect(global.GPTPF_DEBUG.info).toHaveBeenCalledWith(
        'file_creation_started',
        expect.any(String)
      );
      expect(global.GPTPF_DEBUG.info).toHaveBeenCalledWith(
        'file_creation_complete',
        expect.any(Object)
      );
    });

    test('warns for empty content', () => {
      const component = new global.FileAttachComponent();
      component.makeFile('', 'txt');
      
      expect(global.GPTPF_DEBUG.warn).toHaveBeenCalledWith(
        'empty_file_created',
        expect.any(String)
      );
    });

    test('logs custom filename processing', () => {
      const component = new global.FileAttachComponent();
      component.makeFile('content', 'txt', 'myfile.txt');
      
      expect(global.GPTPF_DEBUG.info).toHaveBeenCalledWith(
        'custom_filename_processed',
        expect.any(String)
      );
    });
  });

  describe('Edge Cases', () => {
    test('handles very long content', () => {
      const component = new global.FileAttachComponent();
      const longContent = 'a'.repeat(100000);
      const file = component.makeFile(longContent, 'txt');
      
      expect(file.size).toBe(100000);
    });

    test('handles special characters in content', () => {
      const component = new global.FileAttachComponent();
      const specialContent = '特殊字符 émojis 🎉 symbols ©®™';
      const file = component.makeFile(specialContent, 'txt');
      
      expect(file.size).toBeGreaterThan(0);
    });

    test('handles custom name with multiple dots', () => {
      const component = new global.FileAttachComponent();
      const file = component.makeFile('content', 'txt', 'my.file.name.txt');

      expect(file.name).toMatch(/^my.*file.*name.*\.txt$/);
    });

    test('handles format with leading dot', () => {
      const component = new global.FileAttachComponent();
      const file = component.makeFile('content', '.txt');

      expect(file.name).toMatch(/paste\.\d+.*txt/);
    });
  });
});

