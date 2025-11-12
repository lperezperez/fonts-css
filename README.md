![Banner.svg](/Banner.svg "Roche Colors")

[![npm version](https://img.shields.io/npm/v/@lperezperez/fonts-css.svg?style=flat&logo=npm)](https://www.npmjs.com/package/@lperezperez/fonts-css) [![npm downloads](https://img.shields.io/npm/dm/@lperezperez/fonts-css.svg?style=flat&logo=npm)](https://www.npmjs.com/package/@lperezperez/fonts-css) [![Node.js version](https://img.shields.io/node/v/@lperezperez/fonts-css.svg?style=flat&logo=nodedotjs)](https://nodejs.org) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat&logo=opensourceinitiative&logoColor=white)](LICENSE.md) [![Contributor Covenant 2.1.0](https://img.shields.io/badge/Contributor%20Covenant-2.1.0-7d0096?logo=contributorcovenant)](https://www.contributor-covenant.org/version/2/1/)

> **Automated font CSS generator**  
> Generate CSS `@font-face` declarations and interactive HTML specimens from font files with intelligent auto-detection of font properties.

**Table of Contents**
- [Background](#background)
	- [Prerequisites](#prerequisites)
	- [Installation](#installation)
		- [From NPM (Recommended)](#from-npm-recommended)
		- [From Source](#from-source)
	- [Dependencies](#dependencies)
- [Usage](#usage)
	- [Quick Start](#quick-start)
	- [CLI Options](#cli-options)
	- [Basic Examples](#basic-examples)
		- [Example 1: Default Structure](#example-1-default-structure)
		- [Example 2: Custom Output Directory](#example-2-custom-output-directory)
		- [Example 3: CSS Only (Production)](#example-3-css-only-production)
		- [Example 4: Subdirectories by Family](#example-4-subdirectories-by-family)
	- [File Naming Convention](#file-naming-convention)
	- [Output](#output)
		- [Generated CSS](#generated-css)
		- [HTML Specimens](#html-specimens)
	- [Integration](#integration)
		- [HTML](#html)
		- [React / Next.js](#react--nextjs)
		- [Vue / Nuxt](#vue--nuxt)
		- [Blazor](#blazor)
	- [NPM Scripts Integration](#npm-scripts-integration)
	- [Publishing to npm](#publishing-to-npm)
		- [Commit Message Format](#commit-message-format)
		- [Release Process](#release-process)
- [Changelog](#changelog)
- [Maintainer](#maintainer)
- [Contribute](#contribute)
- [License](#license)
# Background
Managing web fonts often requires manually creating `@font-face` declarations and maintaining documentation for each font variant. This becomes tedious and error-prone when dealing with multiple font families and styles.

**fonts-css** automates this process by:
- **Scanning** font directories (flat or organized by family)
- **Parsing** font properties from filenames (weight, style, stretch)
- **Generating** production-ready CSS with proper `@font-face` rules
- **Creating** interactive HTML specimens for visual documentation
- **Supporting** multiple formats (WOFF2, WOFF, TTF, OTF) in a single declaration

The tool intelligently groups font variants, calculates relative paths, and produces clean, alphabetically sorted output ready for production use.
## Prerequisites
- **[Node.js](https://nodejs.org/en/download) v14** or higher
## Installation
### From [NPM](https://docs.npmjs.com/) (Recommended)
```bash
# Install globally
npm install -g @lperezperez/fonts-css
# Or use with npx (no installation needed)
npx @lperezperez/fonts-css
```
### From Source
```bash
# Clone the repository
git clone https://github.com/lperezperez/fonts-css.git
cd fonts-css
# Install dependencies
npm install
# Link globally (optional)
npm link
```
## Dependencies
- `fs-extra` - Enhanced file system operations
- `handlebars` - Template engine for specimen generation
# Usage
## Quick Start
```bash
# Using global installation
fonts-css
# Using npx (no installation)
npx fonts-css
# With custom paths
fonts-css <input-folder> [output-folder]
# Generate only CSS (skip specimens)
fonts-css --no-specimens
fonts-css --css-only
# Show help
fonts-css --help
# Show version
fonts-css --version
```
## CLI Options
| Option | Description |
|--------|-------------|
| `input-dir` | Directory containing font files (default: `./fonts`) |
| `output-dir` | Directory for generated files (default: same as input) |
| `--no-specimens` | Generate only CSS, skip HTML specimens |
| `--css-only` | Alias for `--no-specimens` |
| `-h, --help` | Show help message |
| `-v, --version` | Show version number |

## Basic Examples
### Example 1: Default Structure
```bash
fonts-css
```
Processes `./fonts` and generates:
- `fonts/fonts.css` - All `@font-face` declarations
- `fonts/specimen-{family}.html` - Interactive previews per font family
### Example 2: Custom Output Directory
```bash
fonts-css ./assets/fonts ./dist
```
Processes fonts from `./assets/fonts` and outputs to `./dist` with correct relative paths.
### Example 3: CSS Only (Production)
```bash
fonts-css ./fonts ./dist --css-only
```
Generates only the CSS file without HTML specimens (ideal for production builds).
### Example 4: Subdirectories by Family
```bash
fonts-css ./custom-fonts
```
Works with both structures:
- **Flat**: `fonts/FontName-Bold-Italic.woff2`
- **Organized**: `fonts/FontName/normal-700-italic.woff2`
## File Naming Convention
Format: `<stretch>-<weight>-<style>.<ext>`
| Filename | Result |
|----------|--------|
| `normal-400-normal.woff2` | Regular |
| `bold-italic.woff2` | Bold Italic |
| `condensed-700-normal.ttf` | Condensed Bold |
| `300-italic.woff` | Light Italic |
**Supported weights**: `100-900` (thin, light, regular, medium, semibold, bold, extrabold, black)  
**Supported styles**: `normal`, `italic`, `oblique`  
**Supported formats**: `.woff2`, `.woff`, `.ttf`, `.otf`
## Output
### Generated CSS
```css
@font-face {
	font-family: "Font Name";
	font-weight: 700;
	font-style: italic;
	src: url("./FontName/normal-700-italic.woff2") format("woff2"),
		url("./FontName/normal-700-italic.woff") format("woff");
}
```
### HTML Specimens
Interactive previews with:
- All font variants displayed
- Copyable CSS rules
- Character coverage samples
- Modern gradient design
## Integration
### HTML
```html
<!-- Link the generated CSS -->
<link rel="stylesheet" href="fonts/fonts.css">
<style>
  body {
    font-family: "Your Font", sans-serif;
    font-weight: 400;
  }
</style>
```
### React / Next.js
```jsx
// app/layout.jsx or pages/_app.jsx
import '../fonts/fonts.css';
export default function RootLayout({ children }) {
  return (
    <html>
      <body style={{ fontFamily: '"Your Font", sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
```
### Vue / Nuxt
```vue
<!-- layouts/default.vue or app.vue -->
<style>
@import '@/assets/fonts/fonts.css';

body {
  font-family: "Your Font", sans-serif;
}
</style>
```
### Blazor
```html
<!-- wwwroot/index.html or Pages/_Host.cshtml -->
<link rel="stylesheet" href="fonts/fonts.css">
```
## NPM Scripts Integration
Add to your `package.json`:
```json
{
  "scripts": {
    "fonts": "fonts-css ./assets/fonts ./public",
    "fonts:css": "fonts-css ./assets/fonts ./public --css-only",
    "prebuild": "npm run fonts:css"
  }
}
```
This automatically generates fonts CSS before each build.
For more examples and detailed documentation, see:
- [Implementation Summary](IMPLEMENTACION-RESUMEN.md) (Spanish)
- [Quick Start Guide](GUIA-USO-RAPIDA.md) (Spanish)
## Publishing to npm
This package uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning and publishing.
### Commit Message Format
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation changes
chore: maintenance tasks
```
### Release Process
1. Merge to `main` branch
2. GitHub Actions automatically:
   - Analyzes commits
   - Determines version bump
   - Updates CHANGELOG.md
   - Publishes to npm
   - Creates GitHub release
# Changelog
See the [Changelog](CHANGELOG.md) for more details.
# Maintainer
[@Luiyi](https://github.com/lperezperez)
# Contribute
This repository follows the [Contributors covenant code of conduct](https://www.contributor-covenant.org/version/2/0).
# License
Under [MIT license](LICENSE.md) terms.