#!/usr/bin/env node
// Generate a Software Bill of Materials for Sophie Well.
//
// Outputs:
//   sbom.json       CycloneDX 1.5 minimal structure (machine-readable)
//   sbom.md         Human-readable summary
//
// Sophie Well ships zero runtime third-party dependencies (the deployed
// site is index.html + styles.css + app.js + a few JSON shards). The only
// dependencies are dev/build tools, which are pinned to exact versions in
// package.json. This script captures them, the runtime asset SHA-256s,
// and the engines pin so reviewers can reproduce the exact bundle.

import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, relative } from 'node:path';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const pkg = JSON.parse(await readFile(resolve(ROOT, 'package.json'), 'utf8'));

// Runtime files shipped to the browser. Hashed for reviewer reproducibility.
const RUNTIME_FILES = [
  'index.html',
  'styles.css',
  'app.js',
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

async function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else yield p;
  }
}

async function listSourceTree() {
  const dirs = ['lib', 'views'];
  const out = [];
  for (const d of dirs) {
    if (!existsSync(join(ROOT, d))) continue;
    for await (const f of walk(join(ROOT, d))) {
      if (f.endsWith('.js')) out.push(relative(ROOT, f));
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

const source = [];
for (const f of await listSourceTree()) {
  const p = resolve(ROOT, f);
  const s = await stat(p);
  const h = await sha256(await readFile(p));
  source.push({ path: f, bytes: s.size, sha256: h });
}

// CycloneDX 1.5 minimal structure
const buildId = createHash('sha256')
  .update(runtime.map((r) => r.sha256).join('') + source.map((r) => r.sha256).join(''))
  .digest('hex')
  .slice(0, 16);

const sbom = {
  bomFormat: 'CycloneDX',
  specVersion: '1.5',
  serialNumber: `urn:uuid:sophiewell-${buildId}`,
  version: 1,
  metadata: {
    timestamp: new Date().toISOString(),
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
  components: Object.entries(pkg.devDependencies || {}).map(([name, version]) => ({
    'bom-ref': `pkg:npm/${name}@${version}`,
    type: 'library',
    name,
    version,
    scope: 'optional',
    purl: `pkg:npm/${name}@${version}`,
  })),
  properties: [
    { name: 'sophiewell:buildId', value: buildId },
    { name: 'sophiewell:runtimeAssetCount', value: String(runtime.length) },
    { name: 'sophiewell:sourceFileCount', value: String(source.length) },
  ],
};

await writeFile(resolve(ROOT, 'sbom.json'), JSON.stringify(sbom, null, 2) + '\n');

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
lines.push('**None.** Sophie Well ships zero third-party JavaScript at runtime.');
lines.push('No CDN, no analytics, no telemetry, no fonts. Every byte the browser');
lines.push('downloads is committed in this repository and is hashed below.');
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

console.log(`build-sbom: wrote sbom.json and sbom.md (buildId=${buildId}, ${runtime.length} runtime files, ${source.length} source files, ${Object.keys(pkg.devDependencies || {}).length} dev deps)`);
