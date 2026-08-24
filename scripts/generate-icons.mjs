/**
 * PWA Icon Generation Script
 * Generates app icons from the shopping-cart.svg using sharp.
 *
 * Usage: node scripts/generate-icons.mjs
 */

import sharp from "sharp";
import { mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public");
const ICONS_DIR = join(PUBLIC, "icons");

// Brand colours
const BRAND_GREEN = "#1a6641";

// Build an SVG that renders a white shopping cart on a green background at a given size.
// The cart is scaled to 60% of the canvas for standard icons (visible padding).
// For maskable icons it is scaled to 75% so the icon fills the safe zone.
function buildCompositeIconSvg(size, maskable = false) {
  const cartScale = maskable ? 0.75 : 0.6;
  const cartSize = Math.round(size * cartScale);
  const offset = Math.round((size - cartSize) / 2);

  // Original viewBox is 24×24
  const svgPath = `M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM17 17H9.29395C8.83288 17 8.60193 17 8.41211 16.918C8.24466 16.8456 8.09938 16.7291 7.99354 16.5805C7.8749 16.414 7.82719 16.1913 7.73274 15.7505L5.27148 4.26465C5.17484 3.81363 5.12587 3.58838 5.00586 3.41992C4.90002 3.27135 4.75477 3.15441 4.58732 3.08205C4.39746 3 4.16779 3 3.70653 3H3M6 6H18.8732C19.595 6 19.9555 6 20.1978 6.15036C20.41 6.28206 20.5653 6.48862 20.633 6.729C20.7104 7.00343 20.611 7.34996 20.411 8.04346L19.0264 12.8435C18.9068 13.2581 18.8469 13.465 18.7256 13.6189C18.6185 13.7547 18.4772 13.861 18.317 13.9263C18.1361 14 17.9211 14 17.4921 14H7.73047M8 21C6.89543 21 6 20.1046 6 19C6 17.8954 6.89543 17 8 17C9.10457 17 10 17.8954 10 19C10 20.1046 9.10457 21 8 21Z`;

  return Buffer.from(`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${BRAND_GREEN}" rx="${maskable ? 0 : Math.round(size * 0.18)}"/>
  <g transform="translate(${offset}, ${offset}) scale(${cartSize / 24})">
    <path d="${svgPath}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>
</svg>`);
}

async function generateIcon(size, filename, maskable = false) {
  const svg = buildCompositeIconSvg(size, maskable);
  const outPath = join(ICONS_DIR, filename);
  await sharp(svg).png().toFile(outPath);
  console.log(`✓ ${outPath.replace(ROOT, "")}`);
}

async function main() {
  mkdirSync(ICONS_DIR, { recursive: true });

  // Standard icons (for manifest, Android Chrome)
  await generateIcon(192, "icon-192x192.png", false);
  await generateIcon(512, "icon-512x512.png", false);

  // Maskable icons (full-bleed, no rounded corners, safe zone = inner 80%)
  await generateIcon(192, "icon-maskable-192x192.png", true);
  await generateIcon(512, "icon-maskable-512x512.png", true);

  // Apple touch icon (180×180, no rounded corners — iOS clips it)
  const appleSvg = buildCompositeIconSvg(180, false);
  const appleOut = join(PUBLIC, "apple-touch-icon.png");
  // Override: for apple icon, use full-bleed green (iOS adds its own radius)
  const appleSvgFullBleed = Buffer.from(
    appleSvg.toString().replace(/rx="\d+"/, 'rx="0"')
  );
  await sharp(appleSvgFullBleed).png().toFile(appleOut);
  console.log(`✓ /public/apple-touch-icon.png`);

  console.log("\nAll icons generated successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
