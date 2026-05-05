/**
 * Generates TOC app icons using the DNW globe design
 * DNW globe (blue) with "DNW" at top and gold "TOC" prominent in center
 */
const sharp = require('./node_modules/sharp');
const path  = require('path');
const fs    = require('fs');

const OUT = path.join(__dirname, 'mobile/assets');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// ── SVG: 1024×1024 app icon ──────────────────────────────────────────────────
function makeIconSvg(size, transparent = false) {
  const cx = size / 2;
  const r  = size * 0.46;   // globe radius
  const pad = size * 0.04;

  const bg = transparent
    ? `<rect width="${size}" height="${size}" fill="transparent"/>`
    : `<rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#0a0f2e"/>`;

  // Outer glow ring
  const glowR = r + size * 0.02;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <!-- Globe gradient: deep blue center → electric blue edge -->
    <radialGradient id="globeGrad" cx="40%" cy="35%" r="65%">
      <stop offset="0%"   stop-color="#1a6cf0"/>
      <stop offset="55%"  stop-color="#0d47c8"/>
      <stop offset="100%" stop-color="#071a6e"/>
    </radialGradient>

    <!-- Gold gradient for TOC text -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#ffe566"/>
      <stop offset="45%"  stop-color="#ffcc00"/>
      <stop offset="100%" stop-color="#c8860a"/>
    </linearGradient>

    <!-- Glow filter for TOC -->
    <filter id="tocGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${size * 0.012}" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <!-- Subtle globe inner shadow -->
    <filter id="globeShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="${size * 0.008}" stdDeviation="${size * 0.018}" flood-color="#000" flood-opacity="0.5"/>
    </filter>

    <!-- Circular path for "DNEXTWELT" ring text -->
    <path id="ringPath" d="M ${cx},${cx - r * 0.88} a${r * 0.88},${r * 0.88} 0 1,1 -0.001,0"/>
  </defs>

  <!-- App background -->
  ${bg}

  <!-- Outer glow ring -->
  <circle cx="${cx}" cy="${cx}" r="${glowR}" fill="none"
    stroke="rgba(26,108,240,0.35)" stroke-width="${size * 0.018}"/>

  <!-- Globe body -->
  <circle cx="${cx}" cy="${cx}" r="${r}" fill="url(#globeGrad)" filter="url(#globeShadow)"/>

  <!-- Globe border -->
  <circle cx="${cx}" cy="${cx}" r="${r}" fill="none"
    stroke="rgba(150,210,255,0.55)" stroke-width="${size * 0.007}"/>

  <!-- Latitude lines -->
  <ellipse cx="${cx}" cy="${cx}" rx="${r}" ry="${r * 0.18}"
    fill="none" stroke="white" stroke-width="${size * 0.005}" opacity="0.15"/>
  <ellipse cx="${cx}" cy="${cx}" rx="${r}" ry="${r * 0.55}"
    fill="none" stroke="white" stroke-width="${size * 0.004}" opacity="0.09"/>

  <!-- Longitude line -->
  <ellipse cx="${cx}" cy="${cx}" rx="${r * 0.22}" ry="${r}"
    fill="none" stroke="white" stroke-width="${size * 0.005}" opacity="0.15"/>

  <!-- Highlight glare (top-left) -->
  <ellipse cx="${cx - r * 0.28}" cy="${cx - r * 0.32}" rx="${r * 0.28}" ry="${r * 0.18}"
    fill="white" opacity="0.09" transform="rotate(-30, ${cx - r * 0.28}, ${cx - r * 0.32})"/>

  <!-- "DNW" small label above center -->
  <text x="${cx}" y="${cx - r * 0.18}"
    text-anchor="middle" dominant-baseline="middle"
    font-family="'Segoe UI', Arial, sans-serif"
    font-size="${size * 0.085}" font-weight="900" letter-spacing="${size * 0.006}"
    fill="white" opacity="0.92">DNW</text>

  <!-- Divider line between DNW and TOC -->
  <line x1="${cx - r * 0.38}" y1="${cx + r * 0.03}"
        x2="${cx + r * 0.38}" y2="${cx + r * 0.03}"
    stroke="rgba(255,220,80,0.55)" stroke-width="${size * 0.004}"/>

  <!-- "TOC" — main gold text -->
  <text x="${cx}" y="${cx + r * 0.33}"
    text-anchor="middle" dominant-baseline="middle"
    font-family="'Segoe UI', Arial Black, sans-serif"
    font-size="${size * 0.195}" font-weight="900" letter-spacing="${size * 0.008}"
    fill="url(#goldGrad)" filter="url(#tocGlow)">TOC</text>

  <!-- DNEXTWELT ring text -->
  <text font-family="'Segoe UI', Arial, sans-serif"
    font-size="${size * 0.052}" font-weight="700" fill="#ffe066" opacity="0.82"
    letter-spacing="${size * 0.003}">
    <textPath href="#ringPath" textLength="${Math.round(r * 0.88 * 2 * Math.PI * 0.92)}" lengthAdjust="spacingAndGlyphs">
      DNEXTWELT&#xA0;·&#xA0;DNEXTWELT&#xA0;·&#xA0;
    </textPath>
  </text>
</svg>`;
}

// ── Splash SVG: 1284×2778 portrait ───────────────────────────────────────────
function makeSplashSvg() {
  const W = 1284, H = 2778;
  const cx = W / 2, cy = H / 2;
  const r  = 280;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="45%" r="70%">
      <stop offset="0%"   stop-color="#0d1f6e"/>
      <stop offset="100%" stop-color="#020818"/>
    </radialGradient>
    <radialGradient id="gGlobe" cx="38%" cy="33%" r="65%">
      <stop offset="0%"   stop-color="#1a6cf0"/>
      <stop offset="55%"  stop-color="#0d47c8"/>
      <stop offset="100%" stop-color="#071a6e"/>
    </radialGradient>
    <linearGradient id="gGold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#ffe566"/>
      <stop offset="50%"  stop-color="#ffcc00"/>
      <stop offset="100%" stop-color="#c8860a"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <path id="rp" d="M ${cx},${cy - r * 0.88} a${r * 0.88},${r * 0.88} 0 1,1 -0.001,0"/>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>

  <!-- Subtle grid lines -->
  <line x1="0" y1="${cy}" x2="${W}" y2="${cy}" stroke="rgba(26,108,240,0.08)" stroke-width="1"/>
  <line x1="${cx}" y1="0" x2="${cx}" y2="${H}" stroke="rgba(26,108,240,0.08)" stroke-width="1"/>

  <!-- Globe -->
  <circle cx="${cx}" cy="${cy - 80}" r="${r}" fill="url(#gGlobe)"/>
  <circle cx="${cx}" cy="${cy - 80}" r="${r}" fill="none" stroke="rgba(150,210,255,0.5)" stroke-width="3"/>
  <ellipse cx="${cx}" cy="${cy - 80}" rx="${r}" ry="${r * 0.18}" fill="none" stroke="white" stroke-width="2" opacity="0.14"/>
  <ellipse cx="${cx}" cy="${cy - 80}" rx="${r * 0.22}" ry="${r}" fill="none" stroke="white" stroke-width="2" opacity="0.14"/>
  <ellipse cx="${cx - r * 0.28}" cy="${cy - 80 - r * 0.32}" rx="${r * 0.28}" ry="${r * 0.18}" fill="white" opacity="0.08" transform="rotate(-30,${cx - r * 0.28},${cy - 80 - r * 0.32})"/>

  <!-- DNW -->
  <text x="${cx}" y="${cy - 80 - r * 0.18}"
    text-anchor="middle" dominant-baseline="middle"
    font-family="'Segoe UI',Arial,sans-serif" font-size="68" font-weight="900"
    fill="white" opacity="0.92">DNW</text>

  <line x1="${cx - 110}" y1="${cy - 80 + r * 0.03}" x2="${cx + 110}" y2="${cy - 80 + r * 0.03}"
    stroke="rgba(255,220,80,0.5)" stroke-width="2"/>

  <!-- TOC gold -->
  <text x="${cx}" y="${cy - 80 + r * 0.38}"
    text-anchor="middle" dominant-baseline="middle"
    font-family="'Segoe UI',Arial Black,sans-serif" font-size="148" font-weight="900"
    fill="url(#gGold)" filter="url(#glow)">TOC</text>

  <!-- DNEXTWELT ring -->
  <text font-family="'Segoe UI',Arial,sans-serif" font-size="28" font-weight="700"
    fill="#ffe066" opacity="0.8">
    <textPath href="#rp" textLength="${Math.round(r * 0.88 * 2 * Math.PI * 0.92)}" lengthAdjust="spacingAndGlyphs">
      DNEXTWELT&#xA0;·&#xA0;DNEXTWELT&#xA0;·
    </textPath>
  </text>

  <!-- App name below globe -->
  <text x="${cx}" y="${cy + r + 60}"
    text-anchor="middle" font-family="'Segoe UI',Arial,sans-serif"
    font-size="42" font-weight="300" fill="white" opacity="0.7" letter-spacing="8">
    TRUCK OPTIMIZER
  </text>
  <text x="${cx}" y="${cy + r + 115}"
    text-anchor="middle" font-family="'Segoe UI',Arial,sans-serif"
    font-size="26" font-weight="400" fill="#ffe066" opacity="0.6" letter-spacing="4">
    by DNW-AI
  </text>
</svg>`;
}

async function generate() {
  console.log('Generating TOC app icons...');

  // 1024×1024 icon with rounded square bg
  await sharp(Buffer.from(makeIconSvg(1024, false)))
    .png().toFile(path.join(OUT, 'icon.png'));
  console.log('✓ icon.png (1024×1024)');

  // 1024×1024 adaptive icon — transparent bg, content fills ~80%
  await sharp(Buffer.from(makeIconSvg(1024, true)))
    .png().toFile(path.join(OUT, 'adaptive-icon.png'));
  console.log('✓ adaptive-icon.png (1024×1024, transparent)');

  // Favicon 64×64
  await sharp(Buffer.from(makeIconSvg(64, false)))
    .png().toFile(path.join(OUT, 'favicon.png'));
  console.log('✓ favicon.png (64×64)');

  // Splash 1284×2778
  await sharp(Buffer.from(makeSplashSvg()))
    .png().toFile(path.join(OUT, 'splash.png'));
  console.log('✓ splash.png (1284×2778)');

  console.log('\nAll icons generated in mobile/assets/');
}

generate().catch(err => { console.error(err); process.exit(1); });
