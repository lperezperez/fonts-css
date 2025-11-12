#!/usr/bin/env node
const fs = require("fs-extra");
const path = require("path");
const handlebars = require("handlebars");
// Handlebars helpers
handlebars.registerHelper("eq", (a, b) => a === b);
// Font dictionaries
const FONT_EXTENSIONS = { eot: "embedded-opentype", otf: "opentype", svg: "svg", ttf: "truetype", woff: "woff", woff2: "woff2" };
const FONT_STRETCHES = { "ultra-condensed": "ultra-condensed", ultracondensed: "ultra-condensed", "extra-condensed": "extra-condensed", extracondensed: "extra-condensed", condensed: "condensed", "semi-condensed": "semi-condensed", semicondensed: "semi-condensed", normal: "normal", "semi-expanded": "semi-expanded", semiexpanded: "semi-expanded", expanded: "expanded", "extra-expanded": "extra-expanded", extraexpanded: "extra-expanded", "ultra-expanded": "ultra-expanded", ultraexpanded: "ultra-expanded" };
const FONT_WEIGHTS = { 100: 100, thin: 100, 200: 200, extralight: 200, "extra-light": 200, ultralight: 200, "ultra-light": 200, 300: 300, light: 300, 400: 400, normal: 400, regular: 400, 500: 500, medium: 500, 600: 600, semibold: 600, "semi-bold": 600, demibold: 600, "demi-bold": 600, 700: 700, bold: 700, 800: 800, extrabold: 800, "extra-bold": 800, ultrabold: 800, "ultra-bold": 800, 900: 900, black: 900, heavy: 900 };
const FONT_WEIGHT_NAMES = { 100: "Thin", 200: "Extra Light", 300: "Light", 400: "Regular", 500: "Medium", 600: "Semi Bold", 700: "Bold", 800: "Extra Bold", 900: "Black" };
const FONT_STYLES = { italic: "italic", oblique: "oblique", normal: "normal" };
const toKebabCase = str => str.replace(/\s+/g, "-").toLowerCase();
/**
 * Parse font properties from filename
 * @param {string} filename - Filename without extension (e.g., "condensed-700-italic")
 * @returns {object} - { stretch, weight, style }
 */
function parseFontProperties(filename) {
	const parts = filename.toLowerCase().split("-").map(p => p.trim()).filter(Boolean);
	let stretch = "normal", weight = 400, style = "normal";
	const stretchPatterns = [["ultra", "condensed"], ["ultra", "expanded"], ["extra", "condensed"], ["extra", "expanded"], ["semi", "condensed"], ["semi", "expanded"]];
	for (const pattern of stretchPatterns) {
		const index = parts.indexOf(pattern[0]);
		if (index !== -1 && parts[index + 1] === pattern[1]) {
			stretch = `${pattern[0]}-${pattern[1]}`;
			parts.splice(index, 2);
			break;
		}
	}
	if (stretch === "normal") {
		for (const part of parts) {
			if (FONT_STRETCHES[part]) {
				stretch = FONT_STRETCHES[part];
				parts.splice(parts.indexOf(part), 1);
				break;
			}
		}
	}
	for (const part of parts) {
		if (FONT_STYLES[part]) {
			style = FONT_STYLES[part];
			parts.splice(parts.indexOf(part), 1);
			break;
		}
	}
	for (const part of parts) {
		if (FONT_WEIGHTS[part] !== undefined) {
			weight = FONT_WEIGHTS[part];
			parts.splice(parts.indexOf(part), 1);
			break;
		}
	}
	return { stretch, weight, style };
}
/**
 * Extract family name from filename (e.g., "RocheSans-Bold-Italic" -> "Roche Sans")
 * @param {string} filename - Font filename without extension
 * @returns {string} - Extracted and formatted family name
 */
function extractFamilyFromFilename(filename) {
	const parts = filename.split("-");
	const keywords = [...Object.keys(FONT_WEIGHTS), ...Object.keys(FONT_STYLES), ...Object.keys(FONT_STRETCHES)];
	let familyParts = [];
	for (let i = 0; i < parts.length; i++) {
		const part = parts[i].toLowerCase();
		if (keywords.includes(part)) break;
		familyParts.push(parts[i]);
	}
	let family = familyParts.join("");
	family = family.replace(/([A-Z])/g, " $1").trim();
	return family || filename;
}
/**
 * Scan fonts directory and collect font metadata
 * @param {string} fontsDir - Root directory containing font subdirectories or files
 * @returns {Promise<Array>} - Array of font objects with metadata
 */
async function scanFonts(fontsDir) {
	const fonts = [];
	const entries = await fs.readdir(fontsDir, { withFileTypes: true });
	const subdirs = entries.filter(e => e.isDirectory() && !e.name.startsWith("."));
	const hasSubdirs = subdirs.length > 0;
	if (hasSubdirs) {
		console.log(`📁 Detected ${subdirs.length} subdirectory(ies) - processing fonts inside subdirectories`);
		for (const dirent of subdirs) {
			const family = dirent.name;
			const familyPath = path.join(fontsDir, family);
			const files = await fs.readdir(familyPath);
			for (const file of files) {
				const ext = path.extname(file).toLowerCase().slice(1);
				if (!FONT_EXTENSIONS[ext]) continue;
				const filename = path.basename(file, path.extname(file));
				const { stretch, weight, style } = parseFontProperties(filename);
				const format = FONT_EXTENSIONS[ext];
				fonts.push({ family, filename: file, filepath: path.join(family, file), stretch, weight, style, format, ext, displayName: buildDisplayName(family, stretch, weight, style) });
			}
		}
	}
	else {
		console.log(`📄 No subdirectories detected - processing font files in root`);
		for (const dirent of entries) {
			if (dirent.isDirectory()) continue;
			const file = dirent.name;
			const ext = path.extname(file).toLowerCase().slice(1);
			if (!FONT_EXTENSIONS[ext]) continue;
			const filename = path.basename(file, path.extname(file));
			const family = extractFamilyFromFilename(filename);
			const { stretch, weight, style } = parseFontProperties(filename);
			const format = FONT_EXTENSIONS[ext];
			fonts.push({ family, filename: file, filepath: file, stretch, weight, style, format, ext, displayName: buildDisplayName(family, stretch, weight, style) });
		}
	}
	fonts.sort((a, b) => {
		if (a.family !== b.family) return a.family.localeCompare(b.family);
		if (a.stretch !== b.stretch) return a.stretch.localeCompare(b.stretch);
		if (a.weight !== b.weight) return a.weight - b.weight;
		return a.style.localeCompare(b.style);
	});
	return fonts;
}
/**
 * Build display name for font
 * @param {string} family - Font family name
 * @param {string} stretch - Font stretch value
 * @param {number} weight - Font weight value
 * @param {string} style - Font style value
 * @returns {string} - Formatted display name (e.g., "Arial Bold Italic")
 */
function buildDisplayName(family, stretch, weight, style) {
	let name = family;
	if (stretch !== "normal") name += ` ${stretch.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}`;
	if (weight !== 400) name += ` ${FONT_WEIGHT_NAMES[weight] || weight}`;
	if (style !== "normal") name += ` ${style.charAt(0).toUpperCase() + style.slice(1)}`;
	return name;
}
/**
 * Generate CSS with @font-face declarations
 * @param {Array} fonts - Array of font objects from scanFonts
 * @param {string} outputDir - Output directory path
 * @param {string} fontsDir - Fonts source directory path
 * @returns {string} - Generated CSS content with @font-face rules
 */
function generateCSS(fonts, outputDir, fontsDir) {
	const cssLines = [];
	const grouped = {};
	for (const font of fonts) {
		const key = `${font.family}|${font.stretch}|${font.weight}|${font.style}`;
		if (!grouped[key]) grouped[key] = [];
		grouped[key].push(font);
	}
	for (const [key, variants] of Object.entries(grouped)) {
		const [family, stretch, weight, style] = key.split("|");
		const relPath = path.relative(outputDir, fontsDir).replace(/\\/g, "/");
		const prefix = relPath && relPath !== "." ? `${relPath}/` : "./";
		cssLines.push("@font-face {");
		cssLines.push(`\tfont-family: "${family}";`);
		if (stretch !== "normal") cssLines.push(`\tfont-stretch: ${stretch};`);
		if (style !== "normal") cssLines.push(`\tfont-style: ${style};`);
		if (parseInt(weight) !== 400) cssLines.push(`\tfont-weight: ${weight};`);
		const sources = variants.map(v => `url("${prefix}${v.filepath.replace(/\\/g, "/")}") format("${v.format}")`).join(",\n\t\t");
		cssLines.push(`\tsrc: ${sources};`);
		cssLines.push("}\n");
	}
	return cssLines.join("\n");
}
/**
 * Generate specimen HTML for a specific font family
 * @param {string} family - Font family name
 * @param {Array} fonts - Array of all font objects
 * @param {string} outputDir - Output directory path
 * @param {string} fontsDir - Fonts source directory path
 * @param {string} templatePath - Path to Handlebars template file
 * @param {string} pkgVersion - Package version for footer
 * @returns {Promise<void>}
 */
async function generateSpecimen(family, fonts, outputDir, fontsDir, templatePath, pkgVersion) {
	const familyFonts = fonts.filter(f => f.family === family);
	const relPath = path.relative(outputDir, fontsDir).replace(/\\/g, "/");
	const cssPath = relPath ? `${relPath}/fonts.css` : "fonts.css";
	const template = await fs.readFile(templatePath, "utf-8");
	const compiled = handlebars.compile(template);
	const html = compiled({
		pkg: { version: pkgVersion },
		family,
		fonts: familyFonts.map(f => ({
			family: f.family,
			filename: f.filepath.replace(/\\/g, "/"),
			name: f.displayName,
			stretch: f.stretch,
			style: f.style,
			weight: f.weight
		})),
		cssPath,
		fontFamily: family
	});
	const outputFile = path.join(outputDir, `specimen-${toKebabCase(family)}.html`);
	await fs.writeFile(outputFile, html, "utf-8");
	console.log(`✓ Generated: ${path.relative(process.cwd(), outputFile)}`);
}
/**
 * Show CLI help message with usage examples and options
 * @returns {void}
 */
function showHelp() {
	console.log(`
fonts-css - Web Font CSS Generator

Usage:
  fonts-css [input-dir] [output-dir] [options]

Arguments:
  input-dir   Directory containing font files (default: ./fonts)
  output-dir  Directory for generated files (default: same as input)

Options:
  --no-specimens    Generate only CSS, skip HTML specimens
  --css-only        Alias for --no-specimens
  -h, --help        Show this help message
  -v, --version     Show version number

Examples:
  fonts-css
  fonts-css ./my-fonts
  fonts-css ./fonts ./dist
  fonts-css ./fonts --no-specimens
  fonts-css ./assets/fonts ./public --css-only

File Naming Convention:
  <stretch>-<weight>-<style>.<ext>
  
  Examples:
    normal-400-normal.woff2  → Regular
    bold-italic.woff2        → Bold Italic
    condensed-700-normal.ttf → Condensed Bold
    300-italic.woff          → Light Italic

Supported Formats:
  .woff2, .woff, .ttf, .otf

For more information: https://github.com/lperezperez/fonts-css
`);
}
/**
 * Main CLI function - parses arguments and orchestrates font generation
 * @returns {Promise<void>}
 */
async function main() {
	const args = process.argv.slice(2);
	
	// Check for help or version flags
	if (args.includes("-h") || args.includes("--help")) {
		showHelp();
		process.exit(0);
	}
	
	if (args.includes("-v") || args.includes("--version")) {
		const pkg = require("../package.json");
		console.log(`v${pkg.version}`);
		process.exit(0);
	}
	// Parse options
	const noSpecimens = args.includes("--no-specimens") || args.includes("--css-only");
	const positionalArgs = args.filter(a => !a.startsWith("-"));
	const fontsDir = path.resolve(positionalArgs[0] || "./fonts");
	const outputDir = path.resolve(positionalArgs[1] || fontsDir);
	console.log(`\n🔍 Scanning fonts in: ${fontsDir}`);
	console.log(`📁 Output directory: ${outputDir}`);
	if (noSpecimens) console.log(`📋 Mode: CSS only (no specimens)`);
	console.log();
	// Check if fonts directory exists
	if (!await fs.pathExists(fontsDir)) {
		console.error(`❌ Error: Directory not found: ${fontsDir}`);
		process.exit(1);
	}
	await fs.ensureDir(outputDir);
	const fonts = await scanFonts(fontsDir);
	if (fonts.length === 0) {
		console.error("❌ No fonts found!");
		process.exit(1);
	}
	console.log(`✓ Found ${fonts.length} font file(s)\n`);
	// Generate CSS
	const css = generateCSS(fonts, outputDir, fontsDir);
	const cssPath = path.join(outputDir, "fonts.css");
	await fs.writeFile(cssPath, css, "utf-8");
	console.log(`✓ Generated: ${path.relative(process.cwd(), cssPath)}\n`);
	// Generate specimens if not disabled
	if (!noSpecimens) {
		const families = [...new Set(fonts.map(f => f.family))];
		const pkg = require("../package.json");
		const templatePath = path.join(__dirname, "../src/specimen.hbs");
		for (const family of families)
			await generateSpecimen(family, fonts, outputDir, fontsDir, templatePath, pkg.version);
		console.log(`\n✅ Done! Generated ${families.length} specimen(s) and 1 CSS file.\n`);
	} else
		console.log(`\n✅ Done! Generated CSS file.\n`);
}
main().catch(error => {
	console.error("❌ Error:", error.message);
	process.exit(1);
});