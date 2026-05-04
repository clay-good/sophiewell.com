#!/usr/bin/env node
// Generate the favicon set from a master logo.
//
// Source: logo.png at the repo root (transparent background master).
//
// Outputs (always written to repo root):
//   logo.png              512x512  master (kept verbatim if already present)
//   favicon-16x16.png     16x16
//   favicon-32x32.png     32x32
//   apple-touch-icon.png  180x180
//   favicon.ico           multi-resolution 16/32/48 (PNG-encoded ICO)
//
// Backends, in order of preference:
//   1. `sharp` if installed (npm i -D sharp)
//   2. macOS `sips` for PNG resizing (always available on darwin)
//
// The ICO file is assembled by hand from the resized PNGs so we don't need
// any third-party encoder. The Windows ICO format embeds whole PNG payloads
// for entries marked with the PNG signature; Windows 10 / 11 and modern
// browsers honour this.

import { readFile, writeFile, copyFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tmpdir, platform } from 'node:os';
import { mkdtempSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const TARGETS = [
  { name: 'logo.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-16x16.png', size: 16 },
];

async function pickSource() {
  const png = join(ROOT, 'logo.png');
  if (existsSync(png)) {
    const s = await stat(png);
    if (s.size > 0) return { path: png, kind: 'png' };
  }
  return null;
}

async function loadSharp() {
  try { return (await import('sharp')).default; } catch { return null; }
}

async function generateWithSharp(sharp, src) {
  for (const t of TARGETS) {
    const out = join(ROOT, t.name);
    // Master logo.png at 512: only generate if not already a PNG source of
    // the right size (preserve user-provided transparent master).
    if (t.name === 'logo.png' && src.kind === 'png') {
      if (resolve(src.path) === resolve(out)) continue;
      await copyFile(src.path, out);
      continue;
    }
    await sharp(src.path)
      .resize(t.size, t.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(out);
  }
  // ICO: assemble from 16, 32, 48 PNG payloads.
  const ico16 = await sharp(src.path).resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const ico32 = await sharp(src.path).resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const ico48 = await sharp(src.path).resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  await writeFile(join(ROOT, 'favicon.ico'), buildIco([
    { size: 16, png: ico16 },
    { size: 32, png: ico32 },
    { size: 48, png: ico48 },
  ]));
}

async function generateWithSips(src) {
  // sips can't add an alpha channel to a JPEG, but it can resize and write PNG
  // (the resulting PNG retains the JPEG's opaque background). For a polished
  // transparent-background favicon, supply logo.png; this is the documented
  // fallback path.
  for (const t of TARGETS) {
    const out = join(ROOT, t.name);
    if (t.name === 'logo.png' && src.kind === 'png') {
      // Master already in place; nothing to do.
      if (resolve(src.path) === resolve(out)) continue;
      const r = spawnSync('cp', [src.path, out]);
      if (r.status !== 0) throw new Error('cp failed: ' + r.stderr.toString());
      continue;
    }
    const r = spawnSync('sips', [
      '-s', 'format', 'png',
      '-z', String(t.size), String(t.size),
      src.path, '--out', out,
    ], { stdio: 'pipe' });
    if (r.status !== 0) throw new Error('sips failed: ' + r.stderr.toString());
  }
  // ICO assembly from the 16 + 32 PNGs we just produced, plus a 48px temp.
  const tmp = mkdtempSync(join(tmpdir(), 'sw-fav-'));
  const ico48Path = join(tmp, 'ico48.png');
  spawnSync('sips', ['-s', 'format', 'png', '-z', '48', '48', src.path, '--out', ico48Path], { stdio: 'pipe' });
  const [p16, p32, p48] = await Promise.all([
    readFile(join(ROOT, 'favicon-16x16.png')),
    readFile(join(ROOT, 'favicon-32x32.png')),
    readFile(ico48Path),
  ]);
  await writeFile(join(ROOT, 'favicon.ico'), buildIco([
    { size: 16, png: p16 },
    { size: 32, png: p32 },
    { size: 48, png: p48 },
  ]));
}

// Build a Windows ICO file that embeds whole PNG payloads.
// ICO header: 6 bytes; per-entry directory: 16 bytes; then the payloads.
// Reference: https://learn.microsoft.com/en-us/previous-versions/ms997538(v=msdn.10)
function buildIco(entries) {
  const count = entries.length;
  const headerSize = 6;
  const dirSize = 16 * count;
  let offset = headerSize + dirSize;
  const dirEntries = [];
  for (const e of entries) {
    const dim = e.size >= 256 ? 0 : e.size;
    const buf = Buffer.alloc(16);
    buf.writeUInt8(dim, 0);            // width
    buf.writeUInt8(dim, 1);            // height
    buf.writeUInt8(0, 2);              // colour palette: 0 (no palette)
    buf.writeUInt8(0, 3);              // reserved
    buf.writeUInt16LE(1, 4);           // colour planes
    buf.writeUInt16LE(32, 6);          // bits per pixel
    buf.writeUInt32LE(e.png.length, 8); // image size
    buf.writeUInt32LE(offset, 12);     // image offset
    dirEntries.push(buf);
    offset += e.png.length;
  }
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);          // reserved
  header.writeUInt16LE(1, 2);          // type: 1 = icon
  header.writeUInt16LE(count, 4);      // number of images
  return Buffer.concat([header, ...dirEntries, ...entries.map((e) => e.png)]);
}

async function main() {
  const src = await pickSource();
  if (!src) {
    console.error('build-favicons: no logo.png found at repo root.');
    process.exit(1);
  }

  const sharp = await loadSharp();
  if (sharp) {
    console.log(`build-favicons: using sharp, source=${src.path}`);
    await generateWithSharp(sharp, src);
  } else if (platform() === 'darwin') {
    console.log(`build-favicons: using sips fallback, source=${src.path}`);
    await generateWithSips(src);
  } else {
    console.error('build-favicons: install `sharp` (npm i -D sharp) or run on macOS for sips fallback.');
    process.exit(1);
  }
  console.log('build-favicons: wrote logo.png, favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png, favicon.ico');
}

await main();
