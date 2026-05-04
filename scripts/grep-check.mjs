#!/usr/bin/env node
// CI grep check. Fails the build on:
//  - innerHTML / outerHTML / insertAdjacentHTML occurrences in source
//  - emoji codepoints in source
//  - em-dashes or en-dashes in source
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

// File whose job is to scan for these patterns is allowed to mention them.
const SELF = 'scripts/grep-check.mjs';
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

main().catch((err) => {
  console.error('grep-check: error', err);
  process.exit(2);
});
