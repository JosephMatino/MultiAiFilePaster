<div align="center">

# Multi-AI File Paster - Changelog

<img src="logo/mfp_128.png" alt="Multi-AI File Paster" width="128" height="128">

**Chrome Extension Development History**

[![Version](https://img.shields.io/badge/Version-1.1.0-success?style=for-the-badge&logo=semver&logoColor=white)](#110---2025-01-09---centralized-validation--ui-improvements)
[![Keep a Changelog](https://img.shields.io/badge/Keep%20a-Changelog-blue?style=for-the-badge&logo=markdown&logoColor=white)](https://keepachangelog.com/en/1.1.0/)
[![Semantic Versioning](https://img.shields.io/badge/Semantic-Versioning-green?style=for-the-badge&logo=semver&logoColor=white)](https://semver.org/spec/v2.0.0.html)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285f4?style=for-the-badge&logo=googlechrome&logoColor=white)](../README.md)
[![License MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge&logo=opensource&logoColor=white)](../LICENSE)

</div>

---

All notable changes to the **Multi-AI File Paster** Chrome extension are documented in this file.

**Standards Compliance:**
- Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
- Project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
- Development practices and comprehensive documentation

## [1.1.0] - 2025-01-09 - **CENTRALIZED VALIDATION & UI IMPROVEMENTS**

### Added
- **Centralized Validation System**: New `src/shared/validation.js` module provides consistent input validation across all components
- **Professional Input Sanitization**: Unified validation for custom file extensions, file names, and telemetry events
- **Enhanced Security**: Centralized blocking of risky executable extensions (.exe, .bat, .cmd, .scr, .com, .pif, .vbs, .msi, .dll)
- **Improved File Creation**: Enhanced filename generation prevents double extensions and malformed file names

### Changed
- **Popup Custom Format**: Now uses centralized validation with consistent error messages and security checks
- **Auto Attach Modal**: File naming input now uses centralized validation with helpful user guidance
- **Metrics System**: Event name sanitization now uses centralized validation for consistency
- **File Attachment**: Enhanced file creation logic prevents double dots and validates custom names properly

### Fixed
- **Double Dots Bug**: Eliminated possibility of creating files with double extensions (e.g., test..za, file..txt)
- **Dropdown Navigation**: Fixed "Back to main" option in format dropdown - now works reliably from any page
- **Input Validation**: Consistent validation behavior across popup settings and auto attach modal
- **File Naming**: Proper sanitization of custom file names prevents malformed attachments

### Technical Improvements
- **Code Deduplication**: Removed duplicate validation functions across multiple files
- **Manifest Updates**: Added validation script to content script injection for consistent availability
- **Architecture**: Centralized validation system ensures consistent behavior across all user inputs
- **Maintainability**: Single source of truth for all input validation logic

### Security
- **Enhanced Input Validation**: All user inputs now processed through centralized, security-focused validation
- **Executable Extension Blocking**: Comprehensive protection against risky file types
- **XSS Prevention**: Improved HTML escaping and input sanitization throughout extension

## [1.0.9] - 2025-01-07 - **PRODUCTION READY RELEASE**

### Added
- **Grok AI Platform Support**: Full integration with grok.com including standard auto-attach with input and drag-drop fallback
- **Analytics Dashboard**: Advanced analytics section in main menu showing usage statistics, top platforms, and file formats
- **Privacy-Safe Analytics**: Analytics only display when telemetry is enabled, with complete data hiding when disabled
- **Markdown Language Detection**: Added proper .md file detection to prevent misclassification as .html
- **Complete .github Folder**: Added prtemplate.md, CODEOWNERS, FUNDING.yml, SECURITY.md, and GitHub Actions CI workflow
- **Automated Release Workflow**: GitHub Actions workflow for automated ZIP packaging and release creation
- **Issue Template System**: Comprehensive bug report and feature request templates with team contact information
- **Discussion Templates**: Community engagement templates for structured user feedback and collaboration
- **Codebase Quality**: Systematic review and improvement of all 26 source files
- **Documentation**: Complete README.md, CONTRIBUTING.md, CHANGELOG.md
- **Version Management**: Centralized version control across all files
- **Code Cleanup**: Removed console.log statements and debugging artifacts
- **File Headers**: Consistent headers with team information
- **Error Handling**: Comprehensive error handling throughout extension
- **Accessibility**: Full ARIA support and screen reader compatibility
- **UI Design**: Clean interface with proper spacing
- **Chrome Store Ready**: Manifest V3 compliance with proper permissions

### Changed
- **Contact Structure**: Organized contact hierarchy - technical issues to dev@josephmatino.com, general support to wekturbo@hostwek.com
- **README Structure**: Streamlined public documentation structure for better user experience
- **Analytics UX**: Analytics dashboard now shows/hides based on telemetry setting with responsive design
- Updated all file headers from v1.0.8 to v1.0.9 for version consistency
- Improved toast notification positioning from `bottom: 1rem` to `bottom: 3.5rem` to avoid taskbar overlap
- Enhanced manifest.json with author field and proper short_name
- Refactored hardcoded timeout values to use centralized PLATFORM_TIMEOUTS constants
- Improved code readability by breaking up long function chains and adding meaningful constants
- Enhanced UUID generation function with clearer naming and documentation
- Upgraded language detection with configurable confidence thresholds
- Improved JSDoc documentation across all utility functions
- Enhanced accessibility with proper ARIA labels and semantic HTML structure

### Fixed
- **JavaScript Error**: Fixed `hideTip is not defined` error by correcting function name to `hideTooltip`
- **Language Detection**: Fixed .md files being incorrectly detected as .html by adding proper markdown patterns
- **Analytics UX**: Moved analytics from About modal to main menu for better accessibility and professional design
- **Data Privacy**: Ensured no analytics data displays when telemetry is disabled
- Version inconsistency across all extension files (standardized to 1.0.9)
- Toast positioning that could be obscured by system taskbars
- Hardcoded magic numbers replaced with named constants
- Production code cleanup by removing TODO comments
- Long code lines broken into readable segments
- Input sanitization for telemetry events to prevent XSS

### Security
- Added input sanitization for all user-provided data
- Implemented safe regex patterns for event name filtering
- Enhanced CSP compliance throughout the extension
- Privacy-first data handling with explicit no-transmission guarantees

### Technical Improvements
- **Background Script**: Refactored service worker with better error handling and constants
- **Content Scripts**: Improved platform detection and timeout handling
- **Language Detection**: Enhanced confidence scoring with conservative fallbacks
- **Component Architecture**: Better separation of concerns across UI components
- **Metrics System**: Optional telemetry with strict privacy controls
- **Platform Handlers**: Improved abstraction for multi-AI platform support

### Developer Experience
- Complete development environment setup documentation
- Code contribution guidelines with style requirements
- Issue templates for bug reports and feature requests
- Commit message standards
- Comprehensive testing recommendations

### Breaking Changes
- **None**: This release maintains full backward compatibility with v1.0.8
- **Configuration**: All existing settings are preserved during upgrade
- **Data**: No user data migration required

### Migration Guide
- **From v1.0.8**: Automatic upgrade, no action required
- **From v1.0.0**: Settings will be migrated automatically on first launch
- **Fresh Install**: Zero configuration required, works immediately

## [1.0.8] - 2024-12-30

### Added
- Initial stable release
- Multi-platform AI support (ChatGPT, Claude, Gemini, DeepSeek)
- Auto-detection of 20+ file formats
- Smart language detection system
- Configurable word thresholds (50-15,000 words)
- Optional delay system with countdown
- Batch mode for multiple code blocks
- Manual save functionality
- Keyboard shortcuts (Ctrl/Cmd + Shift + S)

### Features
- **Platform Support**: Full integration with major AI platforms (ChatGPT, Claude, Gemini, DeepSeek, Grok)
- **File Formats**: Support for 20+ formats (.js, .ts, .py, .java, .cs, .cpp, .c, .go, .rs, .rb, .php, .html, .css, .json, .xml, .sql, .csv, .md, .txt, .sh, plus custom extensions)
- **Privacy**: Complete on-device processing with no data transmission
- **UI/UX**: Clean popup interface with accessibility support
- **Customization**: Flexible settings for different use cases

## [1.0.0] - 2024-12-10

### Added
- Initial development release
- Basic file attachment functionality
- Support for ChatGPT and Claude platforms
- Simple text-to-file conversion
- Basic popup UI for settings

---

## Version Support

- **v1.1.0**: Current stable release with centralized validation and UI improvements
- **v1.0.8**: Previous stable release with core functionality
- **v1.0.0**: Initial development version

## Upgrade Notes

### Upgrading to v1.0.9
- No breaking changes from v1.0.8
- New documentation files added (README, CHANGELOG, CONTRIBUTING, LICENSE)
- Enhanced UI messaging and professional presentation
- Improved code quality and maintainability

### Browser Compatibility
- Chrome 88+ (Manifest V3 support)
- Chromium-based browsers (Edge, Opera, Brave)
- Full feature support across all supported AI platforms

## 🚀 Recent Updates

This changelog documents completed changes only. For future plans and roadmap, see [TECHNICAL.md](TECHNICAL.md).

---

<div align="center">

## 📊 Development Statistics

<table>
<tr>
<td><strong>Total Releases</strong></td>
<td>3 major versions (1.0.0, 1.0.8, 1.0.9)</td>
</tr>
<tr>
<td><strong>Development Period</strong></td>
<td>August 2025 - Present</td>
</tr>
<tr>
<td><strong>Supported Platforms</strong></td>
<td>5 AI platforms</td>
</tr>
<tr>
<td><strong>File Formats</strong></td>
<td>20+ formats</td>
</tr>
<tr>
<td><strong>Architecture</strong></td>
<td>Chrome Extension Manifest V3</td>
</tr>
</table>

## 🏆 Project Milestones

- **🚀 v1.0.0** - Initial development release (August 10, 2025)
- **📊 v1.0.8** - First stable release with multi-platform support (August 30, 2025)
- **✨ v1.0.9** - Production-ready release with comprehensive documentation (September 7, 2025)

## 📞 Support & Development

<table>
<tr>
<td><strong>Lead Developer</strong></td>
<td><a href="https://josephmatino.com">Joseph Matino</a></td>
<td><a href="mailto:dev@josephmatino.com">dev@josephmatino.com</a></td>
</tr>
<tr>
<td><strong>Scrum Master</strong></td>
<td><a href="https://majokdeng.com">Majok Deng</a></td>
<td><a href="mailto:scrum@majokdeng.com">scrum@majokdeng.com</a></td>
</tr>
<tr>
<td><strong>Extension Support</strong></td>
<td><a href="https://hostwek.com/wekturbo">WekTurbo Designs</a></td>
<td><a href="mailto:wekturbo@hostwek.com">wekturbo@hostwek.com</a></td>
</tr>
</table>

## 🔗 Resources

- **📖 Documentation**: [README.md](README.md) | [CONTRIBUTING.md](CONTRIBUTING.md)
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/JosephMatino/MultiAiFilePaster/issues/new?assignees=JosephMatino%2CMajok-Deng&labels=bug%2Cneeds-triage&projects=&template=bug_report.md&title=%5BBUG%5D+Brief+description+of+the+issue)
- **💡 Feature Requests**: [GitHub Issues](https://github.com/JosephMatino/MultiAiFilePaster/issues/new?assignees=JosephMatino%2CMajok-Deng&labels=enhancement%2Cneeds-triage&projects=&template=feature_request.md&title=%5BFEATURE%5D+Brief+description+of+the+feature)
- **🤝 Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **🔒 Security**: [SECURITY.md](.github/SECURITY.md)

</div>

---

**Changelog Maintenance**: This document is maintained by Joseph Matino following [Keep a Changelog](https://keepachangelog.com/) and [Semantic Versioning](https://semver.org/) standards.

**Repository**: [Multi-AI File Paster](https://github.com/JosephMatino/MultiAiFilePaster) | **Company**: [WekTurbo Designs - Hostwek LTD](https://hostwek.com/wekturbo)