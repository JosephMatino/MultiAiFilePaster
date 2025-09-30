# MIME Type Mapping Fix for All Supported File Formats

## Problem Identified

The extension was correctly detecting file formats (including `.sh` files) but attaching them with incorrect MIME types to AI platforms. This caused files to be treated as plain text instead of their proper format.

### Root Cause
In `src/content/components/fileattach.js`, the MIME type mapping (lines 145-176) only covered **8 formats**:
- md, json, js, ts, html, css, xml, py

But the extension supports **40+ languages** through `languagedetector.js`:
- js, ts, py, html, css, php, json, xml, sql, csv, md
- java, cs, cpp, c, go, rs, sh, rb, swift, kt, dart
- r, matlab, scala, perl, lua, yaml
- And many more variants

### Specific Issue with .sh Files
1. User pastes shell script content
2. Auto-detection correctly identifies it as `.sh` format
3. File is created with correct `.sh` extension
4. BUT MIME type defaults to `text/plain` (line 146)
5. AI platforms receive file with wrong MIME type
6. File appears as generic text instead of shell script

## Solution Implemented

Added comprehensive MIME type mappings for ALL 40+ supported formats in `fileattach.js`:

### Programming Languages
```javascript
} else if (fmt === "sh" || fmt === "bash" || fmt === "shell" || fmt === "zsh") {
  mime = "application/x-sh";
} else if (fmt === "java") {
  mime = "text/x-java-source";
} else if (fmt === "cs" || fmt === "csharp") {
  mime = "text/x-csharp";
} else if (fmt === "cpp" || fmt === "cc" || fmt === "cxx") {
  mime = "text/x-c++src";
} else if (fmt === "c") {
  mime = "text/x-csrc";
} else if (fmt === "go") {
  mime = "text/x-go";
} else if (fmt === "rs" || fmt === "rust") {
  mime = "text/x-rustsrc";
} else if (fmt === "rb" || fmt === "ruby") {
  mime = "text/x-ruby";
} else if (fmt === "php") {
  mime = "application/x-httpd-php";
} else if (fmt === "swift") {
  mime = "text/x-swift";
} else if (fmt === "kt" || fmt === "kotlin") {
  mime = "text/x-kotlin";
} else if (fmt === "dart") {
  mime = "application/dart";
} else if (fmt === "scala") {
  mime = "text/x-scala";
} else if (fmt === "pl" || fmt === "perl") {
  mime = "text/x-perl";
} else if (fmt === "lua") {
  mime = "text/x-lua";
```

### Data & Configuration Formats
```javascript
} else if (fmt === "sql" || fmt === "mysql" || fmt === "postgresql") {
  mime = "application/sql";
} else if (fmt === "csv" || fmt === "tsv") {
  mime = "text/csv";
} else if (fmt === "yml" || fmt === "yaml") {
  mime = "text/yaml";
```

### Scientific & Statistical
```javascript
} else if (fmt === "r") {
  mime = "text/x-r";
} else if (fmt === "m" || fmt === "matlab") {
  mime = "text/x-matlab";
```

### Enhanced Existing Mappings
```javascript
} else if (fmt === "html" || fmt === "htm") {
  mime = "text/html";
} else if (fmt === "css" || fmt === "scss" || fmt === "sass" || fmt === "less") {
  mime = "text/css";
} else if (fmt === "xml" || fmt === "xhtml" || fmt === "svg") {
  mime = "application/xml";
```

## Benefits

1. **Correct File Type Recognition**: AI platforms now receive proper MIME types for all 40+ supported formats
2. **Better Syntax Highlighting**: Platforms can apply appropriate syntax highlighting based on MIME type
3. **Improved File Handling**: Proper MIME types enable better file processing and display
4. **Complete Coverage**: All formats detected by `languagedetector.js` now have proper MIME mappings
5. **Smart MIME Usage**: MIME types provide semantic information about file content, not just extensions

## Why MIME Types Matter

MIME types serve multiple purposes:
1. **Content Type Declaration**: Tell platforms what kind of data they're receiving
2. **Processing Hints**: Enable appropriate handling (syntax highlighting, validation, etc.)
3. **Security**: Proper MIME types help prevent content type confusion attacks
4. **Standards Compliance**: Follow web standards for file type identification
5. **Platform Integration**: AI platforms use MIME types for better file understanding

## Testing Recommendations

Test file attachment with various formats:
- Shell scripts (`.sh`, `.bash`)
- Programming languages (`.java`, `.go`, `.rs`, `.rb`)
- Data formats (`.sql`, `.csv`, `.yml`)
- Scientific languages (`.r`, `.m`)
- All 40+ supported formats

Verify:
1. Correct file extension in attachment
2. Proper MIME type in File object
3. AI platform recognizes file type correctly
4. Syntax highlighting works (if supported by platform)

## Files Modified

- `src/content/components/fileattach.js` (lines 145-216)
  - Added 20+ new MIME type mappings
  - Enhanced existing mappings with format variants
  - Complete coverage for all supported languages

## Related Documentation

- `src/shared/languagedetector.js` - Language detection and format mapping
- `docs/fixes/auto-attach-corruption-fix.md` - Previous file attachment fixes
- `readme.md` - List of all 20 supported file formats

