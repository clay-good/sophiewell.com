#!/usr/bin/env node
// CI grep check. Fails the build on:
//  - innerHTML / outerHTML / insertAdjacentHTML occurrences in source
//  - emoji codepoints in source
//  - em-dashes or en-dashes in source
//  - catalog-count drift on user-facing marketing surfaces (spec-v46 §6)
//
// Scans index.html, styles.css, sw.js, all .js / .mjs files outside node_modules,
// dist, data, and docs.
//
// Exit code 0 on success, 1 on any violation.

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();

const SCAN_EXTENSIONS = new Set(['.html', '.css', '.js', '.mjs']);

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'data', 'docs']);

// Files whose job is to scan for these patterns are allowed to mention them.
const SELF = 'scripts/grep-check.mjs';
// The commitments check legitimately lists vendor needles as enforcement data.
const COMMITMENTS_CHECK = 'scripts/check-commitments.mjs';
// The runtime no-network integration tests (spec-v50 §3.1 / §3.5; spec-v52
// §4.3 for the PA pipeline) verify the absence of these APIs and must
// mention them by name.
const COMMITMENTS_RUNTIME_TESTS = new Set([
  'test/integration/no-network.spec.js',
  'test/integration/pa-no-network.spec.js',
]);
// The eslint config legitimately mentions innerHTML in its rule strings.
const ESLINT_CONFIG = '.eslintrc.json';

const FORBIDDEN = [
  { name: 'innerHTML',           regex: /\binnerHTML\b/ },
  { name: 'outerHTML',           regex: /\bouterHTML\b/ },
  { name: 'insertAdjacentHTML',  regex: /\binsertAdjacentHTML\b/ },
  // Em-dash U+2014 and en-dash U+2013.
  { name: 'em-dash or en-dash',  regex: /[–—]/ },
  // Emoji blocks: misc symbols and pictographs, supplemental, dingbats, etc.
  // Conservative match; ASCII text is unaffected.
  { name: 'emoji codepoint',     regex: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}]/u },
  // spec-v50 §3.3: no cookies. document.cookie = ... and Set-Cookie are forbidden in source.
  { name: 'cookie write (spec-v50 §3.3)', regex: /document\.cookie\s*=|Set-Cookie/ },
  // spec-v50 §3.5: no analytics / telemetry / beaconing vendors. Word- or
  // url-bounded to avoid colliding with English prose like "implausible".
  { name: 'analytics vendor (spec-v50 §3.5)', regex: /\b(?:googletagmanager|google-analytics|analytics\.google|segment\.com|segment\.io|mixpanel\.com|@mixpanel|posthog\.com|@posthog|amplitude\.com|@amplitude|plausible\.io|fathom\.com|simpleanalytics\.com|heap\.io|hotjar\.com|fullstory\.com|sentry\.io|bugsnag\.com|datadog-rum|newrelic\.com|logrocket\.com|rollbar\.com|sendBeacon)\b/i },
  // spec-v50 §3.7: no login / paywall vendor identifiers in source.
  { name: 'auth/paywall vendor (spec-v50 §3.7)', regex: /\b(?:auth0\.com|@auth0|clerk\.dev|@clerk\/|supabase-auth|@firebase\/auth|okta\.com|@okta\/|stripe\.com|@stripe\/|lemonsqueezy\.com|paddle\.com|@paddle\/)/i },
];

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    if (entry.name.startsWith('.') && entry.name !== '.eslintrc.json') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

function relPath(p) {
  return relative(ROOT, p).split(sep).join('/');
}

function shouldScan(rel) {
  // Always scan the eslint config and other key root files.
  if (rel === ESLINT_CONFIG) return true;
  if (rel === 'index.html' || rel === 'sw.js' || rel === 'app.js' || rel === 'styles.css') return true;
  if (rel.startsWith('scripts/')) {
    const ext = rel.slice(rel.lastIndexOf('.'));
    return SCAN_EXTENSIONS.has(ext);
  }
  if (rel.startsWith('test/')) {
    const ext = rel.slice(rel.lastIndexOf('.'));
    return SCAN_EXTENSIONS.has(ext);
  }
  return false;
}

async function main() {
  const violations = [];
  for await (const file of walk(ROOT)) {
    const rel = relPath(file);
    if (!shouldScan(rel)) continue;
    if (rel === SELF) continue;
    if (rel === COMMITMENTS_CHECK) continue;
    if (COMMITMENTS_RUNTIME_TESTS.has(rel)) continue;
    const text = await readFile(file, 'utf8');
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      for (const rule of FORBIDDEN) {
        if (rule.regex.test(line)) {
          // Allow eslint config to mention forbidden DOM names in its rule strings.
          if (rel === ESLINT_CONFIG && (rule.name === 'innerHTML' || rule.name === 'outerHTML' || rule.name === 'insertAdjacentHTML')) {
            continue;
          }
          violations.push({ file: rel, line: i + 1, name: rule.name, text: line.trim() });
        }
      }
    }
  }
  // spec-v46 §6: catalog-count drift rule.
  const truth = await readUtilitiesLength();
  const catalogViolations = await scanCatalogCountDrift(truth);
  for (const v of catalogViolations) violations.push(v);

  if (violations.length === 0) {
    console.log('grep-check: clean.');
    process.exit(0);
  }
  console.error('grep-check: violations found.');
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  ${v.name}  >>  ${v.text}`);
  }
  process.exit(1);
}

// spec-v46 §6 ---------------------------------------------------------------
//
// A 3-digit decimal literal [100, 999] adjacent to one of the catalog-count
// words is a "putative tile count" and must equal `UTILITIES.length`. The
// rule applies to user-facing surfaces only; historical spec docs, the per-
// tile audit logs under docs/audits/**, and any line carrying the explicit
// `<!-- catalog-truth:historical -->` escape are exempt.

const CATALOG_WORDS = /(tiles?|tools?|calculators?|utilit|deterministic)/i;
const CATALOG_ESCAPE = /catalog-truth:historical/;

async function readUtilitiesLength() {
  const appJs = await readFile(join(ROOT, 'app.js'), 'utf8');
  const start = appJs.indexOf('const UTILITIES = [');
  if (start === -1) throw new Error('grep-check: cannot locate UTILITIES in app.js');
  let depth = 0;
  let i = appJs.indexOf('[', start);
  let end = -1;
  for (; i < appJs.length; i += 1) {
    const ch = appJs[i];
    if (ch === '[') depth += 1;
    else if (ch === ']') {
      depth -= 1;
      if (depth === 0) { end = i; break; }
    }
  }
  const body = appJs.slice(start, end);
  return (body.match(/^\s{2}\{ id: '[^']+',/gm) || []).length;
}

function catalogScanRanges(rel, text) {
  // Returns an array of [startLine, endLineInclusive] 1-indexed line ranges
  // to scan. Empty array means skip the file.
  const lines = text.split(/\r?\n/);
  if (rel === 'index.html' || rel === 'README.md' || rel === 'package.json' || rel === 'site.webmanifest') {
    return [[1, lines.length]];
  }
  if (rel === 'CHANGELOG.md') {
    // Per spec-v46 §6: scan only above the most recent [Unreleased] header.
    // Past spec-wave narrative inside [Unreleased] subsections is treated as
    // historical (each `### Added (spec-vN ...)` block is a snapshot of that
    // wave's catalog count and must not be rewritten).
    for (let i = 0; i < lines.length; i += 1) {
      if (/^##\s*\[Unreleased\]/i.test(lines[i])) return i === 0 ? [] : [[1, i]];
    }
    return [];
  }
  if (rel.startsWith('docs/') && rel.endsWith('.md')) {
    if (/^docs\/spec-v\d+(?:-checklist)?\.md$/.test(rel)) return [];
    if (rel.startsWith('docs/audits/')) return [];
    // spec-v46 wave 46-2: two additional spec-equivalent docs are excluded.
    // - docs/spec-seo.md is a spec doc by intent (just named for its topic
    //   rather than a version number); its historical SEO audit narrative
    //   carries snapshot counts that must not be rewritten.
    // - docs/scope-mdcalc-parity.md is the long-horizon scope statement
    //   whose ledger paragraph records the per-wave catalog close-count
    //   history. The *current* close-count is already validated by
    //   check-catalog-truth.mjs surface #14 (lastCapture of "is N.)"), so
    //   the file is not unguarded — the historical snapshots are excluded
    //   here exactly because the current value is checked separately.
    if (rel === 'docs/spec-seo.md') return [];
    if (rel === 'docs/scope-mdcalc-parity.md') return [];
    return [[1, lines.length]];
  }
  return [];
}

async function* walkAll(dir) {
  // Catalog-truth scan: same skip set as the forbidden-pattern scan *except*
  // we descend into docs/ (the spec-v46 §6 catalog-count rule explicitly
  // applies to docs/*.md). Previously this function copy-pasted SKIP_DIRS
  // including 'docs', so the docs subtree was silently skipped and no
  // docs-resident historical count ever fired a violation.
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git' || entry.name === 'data') continue;
    if (entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkAll(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

async function scanCatalogCountDrift(truth) {
  const violations = [];
  const TARGETS = new Set(['index.html', 'README.md', 'CHANGELOG.md', 'package.json', 'site.webmanifest']);
  // Walk includes docs/*.md per catalogScanRanges.
  for await (const file of walkAll(ROOT)) {
    const rel = relPath(file);
    const isTopTarget = TARGETS.has(rel);
    const isDocsMd = rel.startsWith('docs/') && rel.endsWith('.md');
    if (!isTopTarget && !isDocsMd) continue;
    const text = await readFile(file, 'utf8');
    const ranges = catalogScanRanges(rel, text);
    if (ranges.length === 0) continue;
    const lines = text.split(/\r?\n/);
    // Two-pass: build a Set of 1-indexed line numbers that carry an escape
    // either inline or on the immediately-preceding line.
    const escaped = new Set();
    for (let i = 0; i < lines.length; i += 1) {
      if (CATALOG_ESCAPE.test(lines[i])) {
        escaped.add(i + 1);
        escaped.add(i + 2); // escape applies to the line immediately below
      }
    }
    for (const [from, to] of ranges) {
      for (let lineNo = from; lineNo <= to; lineNo += 1) {
        const line = lines[lineNo - 1] || '';
        if (escaped.has(lineNo)) continue;
        // Find every 3-digit literal on the line.
        const numRe = /(?<![\d.])(\d{3})(?![\d.])/g;
        let m;
        while ((m = numRe.exec(line)) !== null) {
          const num = Number(m[1]);
          if (num < 100 || num > 999) continue;
          // Adjacency window: within 40 chars on either side of the number,
          // on the same line, look for one of the catalog words.
          const lo = Math.max(0, m.index - 40);
          const hi = Math.min(line.length, m.index + m[1].length + 40);
          const window = line.slice(lo, hi);
          if (!CATALOG_WORDS.test(window)) continue;
          if (num === truth) continue;
          violations.push({
            file: rel,
            line: lineNo,
            name: `catalog-count drift (expected ${truth}, found ${num})`,
            text: line.trim().slice(0, 140),
          });
        }
      }
    }
  }
  return violations;
}

main().catch((err) => {
  console.error('grep-check: error', err);
  process.exit(2);
});
