#!/usr/bin/env node
// spec-v50: posture commitments check.
//
// Enforces the machine-checkable half of Sophie's eight public commitments:
//
//   §3.1  No outbound network calls
//         -> _headers CSP `connect-src 'self'` is asserted here at build time.
//            (The Playwright runtime assertion is a separate test, scope of
//            a future wave.)
//   §3.2  No third-party scripts
//         -> _headers CSP `script-src 'self'` asserted here. (HTML scan that
//            every <script src> is relative is enforced by grep-check.)
//   §3.4  No persistent storage outside an allowlist
//         -> every localStorage.setItem(...) / sessionStorage.setItem(...)
//            in scanned source must pass a string literal present in
//            scripts/storage-allowlist.json. caches.open(...) must pass a
//            string starting with one of the allowed cache namespace
//            prefixes (interpolated `${BUILD_HASH}` is permitted).
//   §3.6  No AI / LLM dependencies
//         -> no AI-vendor SDK substrings in `import` / `require` / string
//            literal contexts outside docs/.
//         -> package.json `dependencies` + `devDependencies` do not contain
//            any AI-vendor package.
//   §3.7  No login, account, or paid tier
//         -> no auth / paywall vendor packages in dependencies.
//   §3.8  MIT-licensed forever
//         -> package.json `license` === "MIT".
//         -> LICENSE first line begins with "MIT License".
//
// Exit code 0 on success, 1 on any violation.

import { readFile, readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'data', 'docs', 'test-results']);

// AI vendor / SDK substrings forbidden in source (case-insensitive). The
// match is restricted to `import` / `require` / string-literal contexts to
// avoid colliding with prose. We approximate string-literal context by
// looking for the substring inside a single-quoted or double-quoted run.
const AI_VENDOR_NEEDLES = [
  'openai',
  '@openai/',
  'anthropic',
  '@anthropic-ai/',
  'langchain',
  '@langchain/',
  'huggingface',
  '@huggingface/',
  'transformers.js',
  'onnxruntime',
  'gemini-api',
  '@google-ai/',
  'bedrock-runtime',
  'azure-cognitive',
  'cohere',
];

const AUTH_VENDOR_PACKAGES = [
  'oauth', 'oauth2', 'passport', '@auth/', 'auth0', '@auth0/',
  '@clerk/', 'clerk-sdk-node', 'supabase-auth', '@supabase/auth',
  'firebase-auth', '@firebase/auth', '@okta/', 'stripe', '@stripe/',
  'paddle', '@paddle/', 'lemonsqueezy',
];

const AI_VENDOR_PACKAGES = [
  'openai', '@openai/', '@anthropic-ai/', 'anthropic', 'langchain',
  '@langchain/', '@huggingface/', 'huggingface', 'transformers.js',
  'onnxruntime', '@google-ai/', 'cohere-ai', 'cohere',
];

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    if (entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile()) yield full;
  }
}

function relPath(p) { return relative(ROOT, p).split(sep).join('/'); }

const SELF = 'scripts/check-commitments.mjs';
const ALLOWLIST_FILE = 'scripts/storage-allowlist.json';
// The commitments page builder legitimately mentions setItem / caches.open
// inside its enforcement-text strings; exempt it from the source scan.
const COMMITMENTS_PAGE_BUILDER = 'scripts/build-commitments-page.mjs';

async function loadAllowlist() {
  const text = await readFile(join(ROOT, ALLOWLIST_FILE), 'utf8');
  return JSON.parse(text);
}

function isSourceFile(rel) {
  if (rel === SELF) return false;
  if (rel === ALLOWLIST_FILE) return false;
  if (rel === COMMITMENTS_PAGE_BUILDER) return false;
  if (rel.startsWith('test/')) return false;
  return /\.(html|js|mjs|cjs|css)$/.test(rel);
}

// Returns the string-literal argument passed as the *first* argument to a
// call like `fn(...)`, if and only if that argument is a single string
// literal (single or double quotes; backticks with no interpolation also
// accepted). Returns null if the first argument is a non-literal expression.
function extractStringLiteralFirstArg(callText) {
  // callText starts at the position of the opening `(`.
  const m = callText.match(/^\(\s*(['"`])((?:\\.|(?!\1).)*?)\1/);
  if (!m) return null;
  if (m[1] === '`' && m[2].includes('${')) return null;
  return m[2];
}

// Like above but allows a single ${BUILD_HASH}-style interpolation suffix
// when the prefix is a string-literal prefix.
function extractCacheNameFirstArg(callText) {
  const m = callText.match(/^\(\s*(['"`])((?:\\.|(?!\1).)*?)\1/);
  if (!m) return null;
  if (m[1] !== '`') return m[2];
  // Template literal: extract the leading static prefix up to `${`.
  const raw = m[2];
  const idx = raw.indexOf('${');
  return idx === -1 ? raw : raw.slice(0, idx);
}

async function checkStorageAllowlist(allow) {
  const violations = [];
  const allowKeys = new Set(allow.keys);
  const cachePrefixes = allow.cacheNamespacePrefixes;
  for await (const file of walk(ROOT)) {
    const rel = relPath(file);
    if (!isSourceFile(rel)) continue;
    const text = await readFile(file, 'utf8');
    // localStorage.setItem(...) and sessionStorage.setItem(...)
    const storageRe = /\b(localStorage|sessionStorage)\.setItem\b/g;
    let m;
    while ((m = storageRe.exec(text)) !== null) {
      const after = text.slice(m.index + m[0].length);
      const key = extractStringLiteralFirstArg(after);
      const lineNo = text.slice(0, m.index).split(/\r?\n/).length;
      if (key === null) {
        violations.push({ file: rel, line: lineNo, msg: `${m[1]}.setItem with non-literal key (spec-v50 §3.4 requires a string literal in the allowlist)` });
        continue;
      }
      if (!allowKeys.has(key)) {
        violations.push({ file: rel, line: lineNo, msg: `${m[1]}.setItem key "${key}" is not in scripts/storage-allowlist.json (spec-v50 §3.4)` });
      }
    }
    // caches.open(...) -- must resolve to a cache-namespace-prefixed name.
    // Accept either a string/template literal directly or an identifier
    // whose top-level `const <id> = \`prefix-...\`` binding earlier in the
    // same file resolves to an allowed prefix.
    const cacheRe = /\bcaches\.open\s*\(\s*([^),]+)/g;
    while ((m = cacheRe.exec(text)) !== null) {
      const arg = m[1].trim();
      const lineNo = text.slice(0, m.index).split(/\r?\n/).length;
      let resolvedPrefix = null;
      if (/^['"`]/.test(arg)) {
        const after = text.slice(m.index + 'caches.open'.length);
        resolvedPrefix = extractCacheNameFirstArg(after);
      } else if (/^[A-Za-z_$][\w$]*$/.test(arg)) {
        const bindingRe = new RegExp(`\\bconst\\s+${arg}\\s*=\\s*\`([^\`$]*)`);
        const b = text.match(bindingRe);
        if (b) resolvedPrefix = b[1];
      }
      if (resolvedPrefix === null) {
        violations.push({ file: rel, line: lineNo, msg: `caches.open argument "${arg}" is not a literal or resolvable identifier (spec-v50 §3.4)` });
        continue;
      }
      if (!cachePrefixes.some((p) => resolvedPrefix.startsWith(p))) {
        violations.push({ file: rel, line: lineNo, msg: `caches.open resolved name "${resolvedPrefix}" is not in storage-allowlist cacheNamespacePrefixes (spec-v50 §3.4)` });
      }
    }
  }
  return violations;
}

async function checkAiVendorSubstrings() {
  const violations = [];
  for await (const file of walk(ROOT)) {
    const rel = relPath(file);
    if (!isSourceFile(rel)) continue;
    if (rel === SELF) continue;
    const text = await readFile(file, 'utf8');
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      // Examine import / require / string-literal contexts only. Cheap
      // approximation: if the line contains `import` or `require(` or any
      // quoted run, scan its quoted runs for the needles.
      const quoted = line.match(/(['"`])(?:\\.|(?!\1).)*?\1/g) || [];
      const importLike = /\b(?:import|require)\s*[(]?/.test(line);
      const corpus = (importLike ? line : '') + ' ' + quoted.join(' ');
      const lower = corpus.toLowerCase();
      for (const needle of AI_VENDOR_NEEDLES) {
        if (lower.includes(needle.toLowerCase())) {
          violations.push({ file: rel, line: i + 1, msg: `AI-vendor substring "${needle}" appears in source (spec-v50 §3.6); allowed only in docs/.` });
        }
      }
    }
  }
  return violations;
}

async function checkPackageJson() {
  const violations = [];
  const pkg = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8'));
  if (pkg.license !== 'MIT') {
    violations.push({ file: 'package.json', line: 0, msg: `license "${pkg.license}" is not "MIT" (spec-v50 §3.8)` });
  }
  const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}), ...(pkg.peerDependencies || {}) };
  const banned = [...AI_VENDOR_PACKAGES, ...AUTH_VENDOR_PACKAGES];
  for (const name of Object.keys(allDeps)) {
    const lower = name.toLowerCase();
    for (const needle of banned) {
      if (lower === needle.toLowerCase() || lower.startsWith(needle.toLowerCase())) {
        const which = AI_VENDOR_PACKAGES.some((n) => needle === n) ? '§3.6 AI vendor' : '§3.7 auth / paywall vendor';
        violations.push({ file: 'package.json', line: 0, msg: `dependency "${name}" matches banned ${which} prefix "${needle}" (spec-v50)` });
      }
    }
  }
  return violations;
}

async function checkLicenseFile() {
  const violations = [];
  const text = await readFile(join(ROOT, 'LICENSE'), 'utf8');
  const firstLine = text.split(/\r?\n/)[0].trim();
  if (!/^MIT License/i.test(firstLine)) {
    violations.push({ file: 'LICENSE', line: 1, msg: `LICENSE first line "${firstLine}" must begin with "MIT License" (spec-v50 §3.8)` });
  }
  return violations;
}

async function checkHeadersCsp() {
  const violations = [];
  const text = await readFile(join(ROOT, '_headers'), 'utf8');
  const m = text.match(/Content-Security-Policy:\s*([^\n]+)/i);
  if (!m) {
    violations.push({ file: '_headers', line: 0, msg: 'no Content-Security-Policy header found (spec-v50 §3.1)' });
    return violations;
  }
  const csp = m[1];
  // Tokenize each directive.
  const directives = csp.split(';').map((d) => d.trim()).filter(Boolean);
  function getDirective(name) {
    for (const d of directives) {
      const parts = d.split(/\s+/);
      if (parts[0].toLowerCase() === name.toLowerCase()) return parts.slice(1);
    }
    return null;
  }
  const connectSrc = getDirective('connect-src');
  if (!connectSrc || connectSrc.length !== 1 || connectSrc[0] !== "'self'") {
    violations.push({ file: '_headers', line: 0, msg: `connect-src must be exactly 'self' (spec-v50 §3.1); found: ${connectSrc ? connectSrc.join(' ') : '(missing)'}` });
  }
  const scriptSrc = getDirective('script-src');
  if (!scriptSrc || !scriptSrc.includes("'self'") || scriptSrc.some((tok) => tok.startsWith('http') || tok === '*' || tok === "'unsafe-inline'")) {
    // Inline hashes (sha256-...) are permitted; 'self' is required; no http or wildcard.
    violations.push({ file: '_headers', line: 0, msg: `script-src must be 'self' (+ inline sha256 hashes only) per spec-v50 §3.2; found: ${scriptSrc ? scriptSrc.join(' ') : '(missing)'}` });
  }
  return violations;
}

async function main() {
  const allow = await loadAllowlist();
  const all = [];
  for (const fn of [
    () => checkStorageAllowlist(allow),
    checkAiVendorSubstrings,
    checkPackageJson,
    checkLicenseFile,
    checkHeadersCsp,
  ]) {
    const v = await fn();
    for (const item of v) all.push(item);
  }
  if (all.length === 0) {
    console.log('check-commitments: clean (storage allowlist + AI/auth deny + license + CSP).');
    process.exit(0);
  }
  console.error('check-commitments: violations.');
  for (const v of all) console.error(`  ${v.file}:${v.line}  ${v.msg}`);
  process.exit(1);
}

main().catch((err) => { console.error('check-commitments: error', err); process.exit(2); });
