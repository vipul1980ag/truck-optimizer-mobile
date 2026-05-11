'use strict';

const fs   = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'public');
const DST = path.join(__dirname, 'public-dist');

let obfuscator;
try {
  obfuscator = require('javascript-obfuscator');
} catch (e) {
  console.warn('[build] javascript-obfuscator not installed — copying files as-is');
}

const OBFUSCATE_OPTIONS = {
  compact:                    true,
  renameGlobals:              false,   // keep onclick="fn()" references intact
  identifierNamesGenerator:   'hexadecimal',
  stringArray:                true,
  stringArrayEncoding:        ['base64'],
  stringArrayThreshold:       0.8,
  stringArrayCallsTransform:  true,
  controlFlowFlattening:      false,   // skip — too slow on large files
  deadCodeInjection:          false,
  selfDefending:              true,    // resists beautifier/deobfuscation
  disableConsoleOutput:       true,    // clears console in obfuscated build
  debugProtection:            true,    // loops debugger statement
  debugProtectionInterval:    2000,
};

/* ── Files to obfuscate (everything else is copied verbatim) ── */
const TO_OBFUSCATE = new Set(['portal.js', 'portal-i18n.js', 'app.js']);

if (!fs.existsSync(DST)) fs.mkdirSync(DST, { recursive: true });

const files = fs.readdirSync(SRC);
for (const file of files) {
  const srcPath = path.join(SRC, file);
  const dstPath = path.join(DST, file);

  if (fs.statSync(srcPath).isDirectory()) continue;

  if (obfuscator && TO_OBFUSCATE.has(file)) {
    try {
      const code   = fs.readFileSync(srcPath, 'utf8');
      const result = obfuscator.obfuscate(code, OBFUSCATE_OPTIONS);
      fs.writeFileSync(dstPath, result.getObfuscatedCode(), 'utf8');
      console.log(`[build] obfuscated → ${file}`);
    } catch (err) {
      console.error(`[build] obfuscation failed for ${file}: ${err.message} — copying plain`);
      fs.copyFileSync(srcPath, dstPath);
    }
  } else {
    fs.copyFileSync(srcPath, dstPath);
    console.log(`[build] copied     → ${file}`);
  }
}

console.log('[build] Done — public-dist/ ready');
