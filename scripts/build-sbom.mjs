#!/usr/bin/env node
// Generate a Software Bill of Materials for Sophie Well.
//
// Outputs:
//   sbom.json       CycloneDX 1.5 minimal structure (machine-readable)
//   sbom.md         Human-readable summary
//
// Sophie Well ships no packaged runtime dependency. Cloudflare Turnstile is a
// reviewed external script loaded only when a user opens the report dialog.
// Dev/build tools are pinned to exact versions in package.json.

import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, relative } from 'node:path';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const pkg = JSON.parse(await readFile(resolve(ROOT, 'package.json'), 'utf8'));
const rootLock = JSON.parse(await readFile(resolve(ROOT, 'package-lock.json'), 'utf8'));
const mcpPkg = JSON.parse(await readFile(resolve(ROOT, 'mcp/package.json'), 'utf8'));
const mcpLock = JSON.parse(await readFile(resolve(ROOT, 'mcp/package-lock.json'), 'utf8'));

// Runtime files shipped to the browser. Hashed for reviewer reproducibility.
const RUNTIME_FILES = [
  'index.html',
  'styles.css',
  'app.js',
  'report-feedback.js',
  'report-policy.js',
  'theme.js',
  'file-origin-guard.js',
  'sw.js',
  'site.webmanifest',
  'robots.txt',
  'sitemap.xml',
  '_headers',
  'logo.png',
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
];

// Runtime files deployed to the isolated report Worker. report-policy.js is
// intentionally shared so the browser and edge enforce the same privacy rule.
const EDGE_RUNTIME_FILES = [
  'report-worker.mjs',
  'report-catalog.js',
  'report-policy.js',
];

async function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue;
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else yield p;
  }
}

async function listSourceTree() {
  const dirs = ['lib', 'views', 'mcp', 'vendored'];
  const out = [];
  for (const d of dirs) {
    if (!existsSync(join(ROOT, d))) continue;
    for await (const f of walk(join(ROOT, d))) {
      if (f.endsWith('.js') || d === 'vendored') out.push(relative(ROOT, f));
    }
  }
  return out.sort();
}

const runtime = [];
for (const f of RUNTIME_FILES) {
  const p = resolve(ROOT, f);
  if (!existsSync(p)) continue;
  const s = await stat(p);
  const h = await sha256(await readFile(p));
  runtime.push({ path: f, bytes: s.size, sha256: h });
}

const edgeRuntime = [];
for (const f of EDGE_RUNTIME_FILES) {
  const p = resolve(ROOT, f);
  if (!existsSync(p)) continue;
  const s = await stat(p);
  const h = await sha256(await readFile(p));
  edgeRuntime.push({ path: f, bytes: s.size, sha256: h });
}

const source = [];
for (const f of await listSourceTree()) {
  const p = resolve(ROOT, f);
  const s = await stat(p);
  const h = await sha256(await readFile(p));
  source.push({ path: f, bytes: s.size, sha256: h });
}

// CycloneDX 1.5 minimal structure
const buildDigest = createHash('sha256')
  .update(runtime.map((r) => r.sha256).join('')
    + edgeRuntime.map((r) => r.sha256).join('')
    + source.map((r) => r.sha256).join(''))
  .digest('hex');
const buildId = buildDigest.slice(0, 16);
const uuidHex = `${buildDigest.slice(0, 12)}5${buildDigest.slice(13, 16)}8${buildDigest.slice(17, 32)}`;
const serialUuid = `${uuidHex.slice(0, 8)}-${uuidHex.slice(8, 12)}-${uuidHex.slice(12, 16)}-${uuidHex.slice(16, 20)}-${uuidHex.slice(20)}`;

function fileComponent(entry, scope) {
  return {
    'bom-ref': `urn:sophiewell:file:${scope}:${entry.path}`,
    type: 'file',
    name: entry.path,
    hashes: [{ alg: 'SHA-256', content: entry.sha256 }],
    properties: [
      { name: 'sophiewell:scope', value: scope },
      { name: 'sophiewell:bytes', value: String(entry.bytes) },
    ],
  };
}

function npmComponents(lock, lockName) {
  return Object.entries(lock.packages || {})
    .filter(([path, info]) => path && info && info.version && path.includes('node_modules/'))
    .map(([path, info]) => {
      const name = info.name || path.slice(path.lastIndexOf('node_modules/') + 13);
      const component = {
        'bom-ref': `urn:sophiewell:npm:${lockName}:${path}`,
        type: 'library',
        name,
        version: info.version,
        scope: info.dev ? 'optional' : 'required',
        purl: `pkg:npm/${name.replace(/^@/, '%40')}@${info.version}`,
        properties: [{ name: 'sophiewell:lockfile', value: lockName }],
      };
      if (typeof info.integrity === 'string' && info.integrity.startsWith('sha512-')) {
        component.hashes = [{ alg: 'SHA-512', content: Buffer.from(info.integrity.slice(7), 'base64').toString('hex') }];
      }
      if (info.license) component.licenses = [{ license: { id: info.license } }];
      return component;
    });
}

const rootNpm = npmComponents(rootLock, 'package-lock.json');
const mcpNpm = npmComponents(mcpLock, 'mcp/package-lock.json');
const fileComponents = [
  ...runtime.map((entry) => fileComponent(entry, 'browser-entry')),
  ...edgeRuntime.map((entry) => fileComponent(entry, 'report-worker')),
  ...source.map((entry) => fileComponent(entry, entry.path.startsWith('mcp/') ? 'mcp-source' : 'source')),
];

const sbom = {
  bomFormat: 'CycloneDX',
  specVersion: '1.5',
  serialNumber: `urn:uuid:${serialUuid}`,
  version: 1,
  metadata: {
    // spec-v991: filled in below. A fresh clock here made every run of
    // `npm run build` rewrite sbom.json and sbom.md with a new timestamp and
    // otherwise identical bytes, so the documented build always left a dirty
    // tree -- and this file's own instruction, "re-run `npm run sbom` after a
    // clean checkout and compare hashes", could never succeed.
    timestamp: null,
    tools: [{ name: 'scripts/build-sbom.mjs', version: pkg.version }],
    component: {
      'bom-ref': 'pkg:application/sophiewell',
      type: 'application',
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      licenses: [{ license: { id: pkg.license } }],
      externalReferences: [
        { type: 'website', url: pkg.homepage },
        { type: 'vcs', url: pkg.repository.url },
        { type: 'issue-tracker', url: pkg.bugs.url },
      ],
      properties: [
        { name: 'engines.node', value: pkg.engines.node },
        { name: 'engines.npm', value: pkg.engines.npm },
        { name: 'thirdPartyRuntimeDependencies', value: '0' },
      ],
    },
  },
  components: [
    ...fileComponents,
    ...rootNpm,
    {
      'bom-ref': 'pkg:application/sophiewell-mcp',
      type: 'application',
      name: mcpPkg.name,
      version: mcpPkg.version,
      licenses: [{ license: { id: 'MIT' } }],
    },
    ...mcpNpm,
    {
      'bom-ref': 'urn:sophiewell:external:cloudflare-turnstile',
      type: 'library',
      name: 'Cloudflare Turnstile',
      scope: 'optional',
      externalReferences: [{ type: 'website', url: 'https://developers.cloudflare.com/turnstile/' }],
      properties: [{ name: 'sophiewell:delivery', value: 'external, on demand after report dialog opens' }],
    },
  ],
  dependencies: [
    {
      ref: 'pkg:application/sophiewell',
      dependsOn: fileComponents
        .filter((component) => component.properties[0].value !== 'mcp-source')
        .map((component) => component['bom-ref']),
    },
    {
      ref: 'pkg:application/sophiewell-mcp',
      dependsOn: [
        ...fileComponents.filter((component) => component.properties[0].value === 'mcp-source').map((component) => component['bom-ref']),
        ...mcpNpm.filter((component) => component.scope === 'required').map((component) => component['bom-ref']),
      ],
    },
  ],
  properties: [
    { name: 'sophiewell:buildId', value: buildId },
    { name: 'sophiewell:runtimeAssetCount', value: String(runtime.length) },
    { name: 'sophiewell:edgeRuntimeAssetCount', value: String(edgeRuntime.length) },
    { name: 'sophiewell:sourceFileCount', value: String(source.length) },
    { name: 'sophiewell:rootLockedPackageCount', value: String(rootNpm.length) },
    { name: 'sophiewell:mcpLockedPackageCount', value: String(mcpNpm.length) },
  ],
};

// spec-v991: the timestamp is the ONLY part of this document that is not
// derived from the contents it attests -- buildId is a digest of every file
// hash. So it means "when this bill of materials last changed", and it is
// carried forward unchanged when nothing else moved. A real content change
// still stamps the moment it was generated.
sbom.metadata.timestamp = new Date().toISOString();
const sbomPath = resolve(ROOT, 'sbom.json');
if (existsSync(sbomPath)) {
  try {
    const prev = JSON.parse(await readFile(sbomPath, 'utf8'));
    const prevStamp = prev.metadata?.timestamp;
    if (prevStamp) {
      const compare = (o) => JSON.stringify({ ...o, metadata: { ...o.metadata, timestamp: null } });
      if (compare(prev) === compare(sbom)) sbom.metadata.timestamp = prevStamp;
    }
  } catch { /* an unreadable or non-JSON sbom.json is simply replaced */ }
}

await writeFile(sbomPath, JSON.stringify(sbom, null, 2) + '\n');

// Human-readable companion
const lines = [];
lines.push('# Sophie Well SBOM');
lines.push('');
lines.push(`Build ID: \`${buildId}\``);
lines.push(`Generated: ${sbom.metadata.timestamp}`);
lines.push(`Component: ${pkg.name} ${pkg.version}`);
lines.push(`License: ${pkg.license}`);
lines.push(`Engines: node ${pkg.engines.node}, npm ${pkg.engines.npm}`);
lines.push('');
lines.push('## Runtime third-party dependencies');
lines.push('');
lines.push('**No packaged runtime dependencies.** The ordinary app uses only files');
lines.push('committed here. Cloudflare Turnstile is the one reviewed external script');
lines.push('and loads only after a user opens Report a problem. No analytics or fonts.');
lines.push('');
lines.push('## Build/dev dependencies (pinned)');
lines.push('');
lines.push('| Package | Version | Scope |');
lines.push('|---|---|---|');
for (const [name, ver] of Object.entries(pkg.devDependencies || {})) {
  lines.push(`| \`${name}\` | \`${ver}\` | dev |`);
}
lines.push('');
lines.push('## Runtime asset hashes (SHA-256)');
lines.push('');
lines.push('| Path | Bytes | SHA-256 |');
lines.push('|---|---:|---|');
for (const r of runtime) {
  lines.push(`| \`${r.path}\` | ${r.bytes} | \`${r.sha256}\` |`);
}
lines.push('');
lines.push('## Report Worker runtime hashes (SHA-256)');
lines.push('');
lines.push('| Path | Bytes | SHA-256 |');
lines.push('|---|---:|---|');
for (const r of edgeRuntime) {
  lines.push(`| \`${r.path}\` | ${r.bytes} | \`${r.sha256}\` |`);
}
lines.push('');
lines.push('## Source-of-truth modules (lib + views)');
lines.push('');
lines.push('| Path | Bytes | SHA-256 |');
lines.push('|---|---:|---|');
for (const r of source) {
  lines.push(`| \`${r.path}\` | ${r.bytes} | \`${r.sha256}\` |`);
}
lines.push('');
lines.push('## Verifying this SBOM');
lines.push('');
lines.push('Re-run `npm run sbom` after a clean checkout and compare hashes.');
lines.push('Every shard under `data/` is independently verified by');
lines.push('`npm run data:verify`, which checks SHA-256 against the manifest.');
lines.push('');

await writeFile(resolve(ROOT, 'sbom.md'), lines.join('\n'));

console.log(`build-sbom: wrote sbom.json and sbom.md (buildId=${buildId}, ${runtime.length} browser runtime files, ${edgeRuntime.length} edge runtime files, ${source.length} source files, ${Object.keys(pkg.devDependencies || {}).length} dev deps)`);
