#!/usr/bin/env node
/**
 * Refresh vendored voice-ordering data files.
 *
 * Pipeline:
 *   1. Sibling voice-ordering repo's `npm run sync` pulls our menu.json + ingredients.json
 *   2. Sibling voice-ordering repo's `npm run build` produces semantic_menu_v3.json
 *   3. We copy v3 + locations back into src/features/voice-ordering/data/
 *
 * Run this whenever menu.json or ingredients.json change in the prototype.
 *
 * Sibling repo path expected at: ../Menu Images/voice-ordering
 * If that moves, edit VOICE_REPO below.
 */

import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROTOTYPE_ROOT = resolve(__dirname, '..');
const VOICE_REPO = resolve(PROTOTYPE_ROOT, '..', 'Menu Images', 'voice-ordering');
const VENDOR_DIR = resolve(PROTOTYPE_ROOT, 'src', 'features', 'voice-ordering', 'data');

const COPIES = [
  {
    src: resolve(VOICE_REPO, 'data', 'build', 'semantic_menu_v3.json'),
    dst: resolve(VENDOR_DIR, 'semantic_menu_v3.json'),
    label: 'semantic_menu_v3.json',
  },
  {
    src: resolve(VOICE_REPO, 'data', 'scraped', 'wendys_locations.json'),
    dst: resolve(VENDOR_DIR, 'wendys-locations.json'),
    label: 'wendys-locations.json',
  },
];

function fmtBytes(n) {
  if (n > 1024 * 1024) return `${(n / 1024 / 1024).toFixed(2)}MB`;
  if (n > 1024) return `${(n / 1024).toFixed(1)}KB`;
  return `${n}B`;
}

if (!existsSync(VOICE_REPO)) {
  console.error(`✗ Voice-ordering repo not found at: ${VOICE_REPO}`);
  console.error('  Edit VOICE_REPO in scripts/refresh-voice-data.js if it moved.');
  process.exit(1);
}

console.log(`→ Voice repo: ${VOICE_REPO}\n`);

console.log('Step 1/3: sync prototype → voice repo source');
execSync('npm run sync', { cwd: VOICE_REPO, stdio: 'inherit' });

console.log('\nStep 2/3: rebuild semantic_menu_v3.json');
execSync('npm run build', { cwd: VOICE_REPO, stdio: 'inherit' });

console.log('\nStep 3/3: copy build outputs into prototype');
for (const { src, dst, label } of COPIES) {
  if (!existsSync(src)) {
    console.error(`  ✗ ${label} — source missing: ${src}`);
    process.exit(1);
  }
  copyFileSync(src, dst);
  console.log(`  ✓ ${label}  (${fmtBytes(statSync(dst).size)})`);
}

console.log('\n✓ Voice data refreshed. Vendored files in src/features/voice-ordering/data/.');
