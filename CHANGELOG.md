# 1.0.0 (2025-11-12)


### Bug Fixes

* add package-lock.json for npm ci in GitHub Actions ([d9e1633](https://github.com/lperezperez/fonts-css/commit/d9e16338f212a7037ec98c111f020360d93067fb))
* change package name to @lperezperez/fonts-css due to npm naming conflict ([d3b7254](https://github.com/lperezperez/fonts-css/commit/d3b7254acc84b020b59ac11d81ec3839cfe7eb00))


### Features

* automated font CSS generation (initial release) ([fd7129d](https://github.com/lperezperez/fonts-css/commit/fd7129da2ad037394d8351f1293e897857eb4919))

# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
## [Unreleased]
## [0.0.1] - 2025-11-12
### Added
- Core font generation engine with automatic structure detection
- CLI executable (`fonts-css`) for global npm installation
- Support for both flat and subdirectory-based font organization
- Intelligent font property parsing from filenames (stretch, weight, style)
- Automatic grouping of multiple font formats in single `@font-face` rules
- CSS generation with alphabetically sorted and properly structured declarations
- Optional HTML specimen generation per font family with visual previews
- `--no-specimens` / `--css-only` flags for CSS-only generation
- `--help` and `--version` CLI options
- Relative path calculation for flexible output directory configuration
- Support for all major web font formats: WOFF2, WOFF, TTF, OTF, EOT, SVG
- Case-insensitive property name matching (bold = Bold = BOLD)
- Handling of folder names with spaces
- Handlebars template system for HTML specimen generation
- Interactive specimen features:
  - Copyable CSS rules with click-to-copy
  - Character coverage samples (alphabet, numbers, symbols)
  - Day/night animated gradient background
  - Responsive design
- Comprehensive documentation:
  - English README with npm installation instructions
  - Spanish guides (GUIA-USO-RAPIDA.md, IMPLEMENTACION-RESUMEN.md)
- Package optimization:
  - Moved runtime dependencies from devDependencies
  - Removed unused `sass` dependency
  - Added `.npmignore` for smaller package size
  - Configured `files` field in package.json
- Automated release workflow:
  - GitHub Actions workflow for CI/CD
  - Semantic-release configuration
  - Automated CHANGELOG generation
  - Automated npm publishing
