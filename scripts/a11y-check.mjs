#!/usr/bin/env node
// Static accessibility lint for index.html and the renderer source files.
// Zero runtime dependencies. Catches the common failures the spec calls out:
//   - missing <html lang>
//   - more than one <h1> in index.html
//   - heading-level skips inside index.html
//   - <input> elements without an associated <label for=...>
//   - <img> without alt
//   - empty <a> elements (links with no text content)
//
// CI also runs axe-core against the running page in test:a11y; this static
// check catches structural drift before a browser is launched.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function findAll(re, html) {
  const out = [];
  let m; re.lastIndex = 0;
  while ((m = re.exec(html)) !== null) out.push(m);
  return out;
}

function lineOf(html, idx) {
  return html.slice(0, idx).split(/\r?\n/).length;
}

const violations = [];
function fail(file, line, msg) { violations.push({ file, line, msg }); }

async function checkIndex() {
  const file = 'index.html';
  const html = await readFile(join(ROOT, file), 'utf8');

  if (!/<html\s[^>]*\blang=/.test(html)) fail(file, 1, '<html> missing lang attribute');

  const h1s = findAll(/<h1\b/gi, html);
  if (h1s.length !== 1) fail(file, h1s[0] ? lineOf(html, h1s[0].index) : 1, `expected exactly one <h1>, found ${h1s.length}`);

  // Heading skips: scan for h1..h6 in order and ensure no jump > 1 within a section.
  let last = 0;
  for (const m of findAll(/<h([1-6])\b/gi, html)) {
    const lvl = Number(m[1]);
    if (last && lvl > last + 1) fail(file, lineOf(html, m.index), `heading skip from h${last} to h${lvl}`);
    last = lvl;
  }

  // Inputs must have an associated label[for] (search the full document).
  for (const m of findAll(/<input\b([^>]*)>/gi, html)) {
    const attrs = m[1];
    if (/\btype=["']?(hidden|submit|reset|button)["']?/.test(attrs)) continue;
    const idMatch = attrs.match(/\bid=["']([^"']+)["']/);
    if (!idMatch) { fail(file, lineOf(html, m.index), 'input without id (cannot bind a label)'); continue; }
    const id = idMatch[1];
    const labelRe = new RegExp(`<label[^>]*\\bfor=["']${id}["']`);
    if (!labelRe.test(html)) fail(file, lineOf(html, m.index), `input #${id} has no associated <label for>`);
  }

  // Images need alt.
  for (const m of findAll(/<img\b([^>]*)>/gi, html)) {
    if (!/\balt=/.test(m[1])) fail(file, lineOf(html, m.index), '<img> missing alt');
  }

  // Empty anchors (no text content between tags).
  for (const m of findAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, html)) {
    const inner = m[1].replace(/<[^>]+>/g, '').trim();
    if (!inner) fail(file, lineOf(html, m.index), '<a> has no text content');
  }
}

async function checkRendererSources() {
  // Renderer modules build inputs dynamically. Make sure every dynamic input
  // is paired with a label (heuristic: an `el('input', { id, ...})` line is
  // followed within ~4 lines by a previous `el('label', { for: id, ...})`).
  const files = [
    'app.js',
    'views/group-a.js', 'views/group-c.js',
    'views/group-e.js', 'views/group-f.js',
    'views/group-g.js', 'views/group-h.js',
    'views/group-i.js', 'views/group-j.js',
    'views/group-klmno.js', 'views/group-v5.js',
    'views/group-v6.js',
  ];
  for (const f of files) {
    const src = await readFile(join(ROOT, f), 'utf8');
    // Look for inputs declared with explicit id; flag if no label[for: id] appears in the same file.
    for (const m of src.matchAll(/el\(['"]input['"]\s*,\s*\{[^}]*?\bid:\s*['"]([^'"]+)['"]/g)) {
      const id = m[1];
      const labelPattern = new RegExp(`el\\(['"]label['"]\\s*,\\s*\\{[^}]*?\\bfor:\\s*['"]${id}['"]`);
      if (!labelPattern.test(src) && !/type:\s*['"](hidden|submit|reset|button)['"]/.test(m[0])) {
        const line = src.slice(0, m.index).split(/\r?\n/).length;
        fail(f, line, `dynamic input #${id} has no matching label[for] in same file`);
      }
    }
  }
}

await checkIndex();
await checkRendererSources();

if (violations.length === 0) {
  console.log('a11y-check: clean.');
  process.exit(0);
}
console.error('a11y-check: violations found.');
for (const v of violations) console.error(`  ${v.file}:${v.line}  ${v.msg}`);
process.exit(1);
