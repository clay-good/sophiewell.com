#!/usr/bin/env node
// spec-seo §6.3: generate one 1200x630 PNG Open-Graph card per
// pre-rendered tool page (plus home, hubs, and topics) so wide-card
// link consumers (Twitter/X, Facebook, LinkedIn, Slack, iMessage)
// stop letterboxing the square logo.png.
//
// Pure Node - no native deps. PNG via scripts/lib/png-writer.mjs,
// text via scripts/lib/bitmap-font.mjs (5x7 hand-encoded ASCII).
//
// Source-of-truth: UTILITIES in app.js for tile ids+names+groups.
// Wired into build.mjs after build-tool-pages.mjs.
//
// Output:
//   dist/og/home.png
//   dist/og/tools/<id>.png         (one per tile)
//   dist/og/for/<slug>.png         (one per audience hub)
//   dist/og/topics/<slug>.png      (one per topic)

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { encodePNG, makeCanvas, fillRect } from './lib/png-writer.mjs';
import { drawText, textWidth, wrapText, GLYPH_H } from './lib/bitmap-font.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = join(ROOT, 'dist');
const OG_DIR = join(DIST, 'og');

const W = 1200;
const H = 630;

// Sophie's dark palette (matches the home CSS dark-theme tokens).
const BG       = [11, 18, 32, 255];     // #0b1220
const ACCENT   = [125, 211, 252, 255];  // #7dd3fc light cyan (rule + eyebrow)
const FG       = [248, 250, 252, 255];  // #f8fafc near-white
const MUTED    = [148, 163, 184, 255];  // #94a3b8 slate-400
const HAIRLINE = [30, 41, 59, 255];     // #1e293b slate-800

// Pick the largest font scale where the title wraps into <= `maxLines`
// rows within `maxWidth`. Bounded between 6 (small) and 16 (large).
function pickTitleScale(text, maxWidth, maxLines = 3) {
  for (let scale = 16; scale >= 6; scale--) {
    const lines = wrapText(text, maxWidth, scale, maxLines);
    const widest = Math.max(...lines.map((l) => textWidth(l, scale)));
    if (widest <= maxWidth && lines.length <= maxLines) return { scale, lines };
  }
  return { scale: 6, lines: wrapText(text, maxWidth, 6, maxLines) };
}

function composeCard(opts) {
  const { eyebrow, title, tagline, footer } = opts;
  const buf = makeCanvas(W, H, BG);

  // Accent bar down the left edge.
  fillRect(buf, W, H, 0, 0, 18, H, ACCENT);

  // Top hairline rule under the eyebrow (subtle band).
  fillRect(buf, W, H, 60, 110, W - 120, 2, HAIRLINE);
  // Bottom hairline rule above the footer.
  fillRect(buf, W, H, 60, H - 110, W - 120, 2, HAIRLINE);

  // Eyebrow ("SOPHIE WELL") top-left.
  const eyebrowScale = 4;
  drawText(buf, W, 60, 56, eyebrow, eyebrowScale, ACCENT);

  // Title - largest scale that fits in up to 3 lines.
  const maxTitleWidth = W - 120;
  const { scale: titleScale, lines } = pickTitleScale(title, maxTitleWidth, 3);
  const lineHeight = GLYPH_H * titleScale + titleScale * 2;
  const blockHeight = lines.length * lineHeight - titleScale * 2;
  const titleY = Math.round((H - blockHeight) / 2) - 10;
  lines.forEach((line, i) => {
    drawText(buf, W, 60, titleY + i * lineHeight, line, titleScale, FG);
  });

  // Tagline below title (or at fixed slot near bottom).
  const taglineScale = 3;
  drawText(buf, W, 60, H - 92, tagline, taglineScale, MUTED);

  // Footer URL bottom-right.
  const footerScale = 3;
  const footerW = textWidth(footer, footerScale);
  drawText(buf, W, W - 60 - footerW, H - 92, footer, footerScale, ACCENT);

  return encodePNG(W, H, buf);
}

async function loadUtilities() {
  const src = await readFile(join(ROOT, 'app.js'), 'utf8');
  const arr = src.match(/const UTILITIES = \[([\s\S]*?)\n\];/);
  if (!arr) throw new Error('build-og-images: could not find UTILITIES in app.js');
  const tiles = [];
  for (const line of arr[1].split('\n')) {
    const id = line.match(/id:\s*'([^']+)'/);
    const name = line.match(/name:\s*'([^']+)'/);
    if (id && name) tiles.push({ id: id[1], name: name[1] });
  }
  if (tiles.length === 0) throw new Error('build-og-images: zero tiles parsed.');
  return tiles;
}

// Strip non-ASCII chars (the bitmap font is ASCII-only). Renderers
// upstream sometimes emit curly quotes; collapse them to their
// straight equivalents so the wrap math stays predictable.
// Unicode codepoints are written as escapes to keep the grep-check
// (em-dash / en-dash detector) happy.
const RX_CURLY_SINGLE = new RegExp('[‘’ʼ]', 'g');
const RX_CURLY_DOUBLE = new RegExp('[“”]', 'g');
const RX_LONG_DASH    = new RegExp('[\\u2013\\u2014]', 'g');
const RX_MIDDOT       = new RegExp('·', 'g');
const RX_NON_ASCII    = /[^\x20-\x7e]/g;

function sanitize(text) {
  return text
    .replace(RX_CURLY_SINGLE, "'")
    .replace(RX_CURLY_DOUBLE, '"')
    .replace(RX_LONG_DASH, '-')
    .replace(RX_MIDDOT, '-')
    .replace(RX_NON_ASCII, '');
}

async function ensureDir(p) { await mkdir(p, { recursive: true }); }

const HUBS = [
  { slug: 'patients',   name: 'Healthcare Tools for Patients' },
  { slug: 'billers',    name: 'Medical Billing & Coding Tools' },
  { slug: 'clinicians', name: 'Clinical Calculators & References' },
  { slug: 'ems',        name: 'EMS & Field Medicine Tools' },
  { slug: 'educators',  name: 'Healthcare Education Tools' },
];

const TOPICS = [
  { slug: 'cardiology',              name: 'Cardiology Calculators & References' },
  { slug: 'medication-safety',       name: 'Medication Safety Tools' },
  { slug: 'triage',                  name: 'Triage & Acute Care Tools' },
  { slug: 'nephrology',              name: 'Nephrology Calculators' },
  { slug: 'obstetrics-pediatrics',   name: 'Obstetrics & Pediatrics Tools' },
  { slug: 'behavioral-health',       name: 'Behavioral Health Screeners' },
  { slug: 'billing-and-coding',      name: 'Billing & Coding Reference' },
  { slug: 'patient-literacy',        name: 'Patient Literacy Helpers' },
];

const TAGLINE = 'FREE - NO SIGNUP - NO TRACKING';
const FOOTER  = 'SOPHIEWELL.COM';

async function main() {
  await ensureDir(OG_DIR);
  await ensureDir(join(OG_DIR, 'tools'));
  await ensureDir(join(OG_DIR, 'for'));
  await ensureDir(join(OG_DIR, 'topics'));

  let count = 0;

  // Home card.
  const homePng = composeCard({
    eyebrow: 'SOPHIE WELL',
    title:   '178 FREE HEALTHCARE TOOLS',
    tagline: TAGLINE,
    footer:  FOOTER,
  });
  await writeFile(join(OG_DIR, 'home.png'), homePng);
  count++;

  // Per-tile cards.
  const tiles = await loadUtilities();
  for (const tile of tiles) {
    const png = composeCard({
      eyebrow: 'SOPHIE WELL',
      title:   sanitize(tile.name),
      tagline: TAGLINE,
      footer:  FOOTER,
    });
    await writeFile(join(OG_DIR, 'tools', `${tile.id}.png`), png);
    count++;
  }

  // Hub cards.
  for (const hub of HUBS) {
    const png = composeCard({
      eyebrow: 'SOPHIE WELL',
      title:   sanitize(hub.name),
      tagline: TAGLINE,
      footer:  FOOTER,
    });
    await writeFile(join(OG_DIR, 'for', `${hub.slug}.png`), png);
    count++;
  }

  // Topic cards.
  for (const topic of TOPICS) {
    const png = composeCard({
      eyebrow: 'SOPHIE WELL',
      title:   sanitize(topic.name),
      tagline: TAGLINE,
      footer:  FOOTER,
    });
    await writeFile(join(OG_DIR, 'topics', `${topic.slug}.png`), png);
    count++;
  }

  console.log(`build-og-images: wrote ${count} OG card PNGs to dist/og/ (1 home + ${tiles.length} tiles + ${HUBS.length} hubs + ${TOPICS.length} topics).`);
}

main().catch((err) => { console.error('build-og-images: failed', err); process.exit(1); });
