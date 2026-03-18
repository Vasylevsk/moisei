#!/usr/bin/env node
/**
 * Brand assets: favicon pack + Google/social logo (square PNG) + OG share image.
 * Run from project root: npm run favicons
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const toIco = require("to-ico");

const root = path.join(__dirname, "..");
const logoPath = path.join(root, "assets/images/logo.svg");
const logo = fs.readFileSync(logoPath, "utf8");
let inner = logo.replace(/<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
inner = inner.replace(/<defs>[\s\S]*?<\/defs>/, "");

const cx = 632.64 + 1656.42 / 2;
const cy = 989.53 + 855.25 / 2;
/* Larger mark (~78% of canvas width) for clearer tabs & bookmarks */
const scale = (512 * 0.78) / 1656.42;

const fav = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="moisei-bg" cx="42%" cy="38%" r="72%">
      <stop offset="0%" style="stop-color:#252520"/>
      <stop offset="100%" style="stop-color:#0c0c0c"/>
    </radialGradient>
    <filter id="moisei-soft" x="-8%" y="-8%" width="116%" height="116%">
      <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="114" fill="url(#moisei-bg)"/>
  <rect x="14" y="14" width="484" height="484" rx="98" fill="none" stroke="#c4a86a" stroke-width="5" opacity="0.92"/>
  <g fill="#b8d4a8" filter="url(#moisei-soft)" transform="translate(256 256) scale(${scale}) translate(${-cx} ${-cy})">${inner}</g>
</svg>`;

fs.writeFileSync(path.join(root, "favicon.svg"), fav);
fs.writeFileSync(path.join(root, "assets/images/favicon-app.svg"), fav);

const LOGO_PNG = "assets/images/moisei-brand-mark-512.png";
const OG_JPG = "assets/images/og-moisei-brand.jpg";

async function main() {
  const svgBuf = Buffer.from(fav);
  const sizes = [16, 32, 48, 96, 144, 192, 512];
  for (const s of sizes) {
    await sharp(svgBuf).resize(s, s).png().toFile(path.join(root, `favicon-${s}x${s}.png`));
  }
  await sharp(svgBuf).resize(180, 180).png().toFile(path.join(root, "apple-touch-icon.png"));

  const mark512 = await sharp(svgBuf).resize(512, 512).png().toBuffer();
  fs.writeFileSync(path.join(root, LOGO_PNG), mark512);

  const ico = await toIco([
    fs.readFileSync(path.join(root, "favicon-16x16.png")),
    fs.readFileSync(path.join(root, "favicon-32x32.png")),
  ]);
  fs.writeFileSync(path.join(root, "favicon.ico"), ico);

  /* Open Graph / link preview: dark card + mark + title (readable in Google Discover, FB, etc.) */
  const ogTextSvg = Buffer.from(
    `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <text x="600" y="548" text-anchor="middle" fill="#c4a86a" font-family="Georgia, 'Times New Roman', serif" font-size="56" font-weight="600">Moisei</text>
      <text x="600" y="598" text-anchor="middle" fill="#9a9a95" font-family="system-ui, -apple-system, sans-serif" font-size="26" letter-spacing="0.04em">Ukrainian Restaurant · Brentford, London</text>
    </svg>`
  );
  const markOg = await sharp(svgBuf).resize(380, 380).png().toBuffer();
  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: { r: 18, g: 18, b: 17 },
    },
  })
    .composite([
      { input: markOg, top: 72, left: Math.round((1200 - 380) / 2) },
      { input: await sharp(ogTextSvg).png().toBuffer(), top: 0, left: 0 },
    ])
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(path.join(root, OG_JPG));

  console.log("OK: favicon.*, apple-touch-icon, moisei-brand-mark-512.png, og-moisei-brand.jpg");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
