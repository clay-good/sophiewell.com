#!/usr/bin/env node
// scripts/data/watch-upstream.mjs -- spec-v1517 route A, `hpt-schema` (and any other pinned GitHub source).
//
// A library module that implements a schema published on GitHub names the commit it was written from:
//
//   // Source snapshot: CMSgov/hospital-price-transparency commit 5333564a710f80d7740180b9ffab8dbdcba9b502.
//
// The spec asked to pin a release tag; the CMS price-transparency repository publishes none (no releases,
// no tags), so the pin is the commit, and the watcher asks GitHub's compare API what the default branch
// has added since. A repository that does tag its versions is pinned by tag instead (spec-v1605, the
// Transparency in Coverage schemas):
//
//   // Source tag: CMSgov/price-transparency-guide tag v2.2.1.
//
// and the watcher lists any newer version tag. A FHIR package from packages.fhir.org is pinned by version
// (spec-v1621 §3.7):
//
//   // Source package: hl7.fhir.us.carin-bb version 2.2.0.
//
// and the watcher compares it with the registry's `dist-tags.latest`. Either way the list goes to the weekly data-refresh pull
// request for a person to read ("gate the next"): the watcher never edits a module and never fails the job.
//
// Usage: node scripts/data/watch-upstream.mjs [--json] [--offline]

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { USER_AGENT } from './http.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SNAPSHOT = /Source snapshot: ([\w.-]+\/[\w.-]+) commit ([0-9a-f]{40})\b/g;
const TAG = /Source tag: ([\w.-]+\/[\w.-]+) tag (v?\d+(?:\.\d+)*)\b/g;
const PACKAGE = /Source package: ([a-z0-9][\w.-]*[a-z0-9]) version (\d+(?:\.\d+)*)\b/g;
const RELEASE = /^v?\d+(\.\d+)*$/;

// 'v2.10.0' -> [2, 10, 0]; compareVersions(a, b) < 0 when a is older.
const parts = (t) => String(t).replace(/^v/, '').split('.').map(Number);
export function compareVersions(a, b) {
  const x = parts(a);
  const y = parts(b);
  for (let i = 0; i < Math.max(x.length, y.length); i += 1) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0);
  return 0;
}

// snapshots(libDir) -> [{ repo, sha | tag, modules: [file] } | { package, version, modules }], one per pin.
export function snapshots(libDir = join(ROOT, 'lib')) {
  const out = new Map();
  for (const f of readdirSync(libDir).filter((n) => n.endsWith('.js')).sort()) {
    const text = readFileSync(join(libDir, f), 'utf8');
    for (const [re, kind, name] of [[SNAPSHOT, 'sha', 'repo'], [TAG, 'tag', 'repo'], [PACKAGE, 'version', 'package']]) {
      for (const m of text.matchAll(re)) {
        const key = `${m[1]}@${m[2]}`;
        if (!out.has(key)) out.set(key, { [name]: m[1], [kind]: m[2], modules: [] });
        out.get(key).modules.push(`lib/${f}`);
      }
    }
  }
  return [...out.values()];
}

// compare(snapshot, fetchImpl) -> { ...snapshot, status: 'current'|'behind'|'unchecked', commits?, files?, error? }
export async function compare(s, fetchImpl = globalThis.fetch) {
  const headers = { 'user-agent': USER_AGENT, accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    if (s.package) {
      const res = await fetchImpl(`https://packages.fhir.org/${s.package}`, { headers: { 'user-agent': USER_AGENT, accept: 'application/json' } });
      if (!res.ok) throw new Error(`the registry returned ${res.status}`);
      const latest = ((await res.json())['dist-tags'] || {}).latest;
      if (!RELEASE.test(String(latest || ''))) throw new Error(`the registry's latest version is ${latest ? `"${latest}", not a release number` : 'missing'}`);
      const newer = compareVersions(latest, s.version) > 0 ? [latest] : [];
      return { ...s, status: newer.length ? 'behind' : 'current', newer };
    }
    if (s.tag) {
      const res = await fetchImpl(`https://api.github.com/repos/${s.repo}/tags?per_page=100`, { headers });
      if (!res.ok) throw new Error(`tags returned ${res.status}`);
      const newer = (await res.json()).map((t) => t.name).filter((n) => RELEASE.test(n) && compareVersions(n, s.tag) > 0)
        .sort(compareVersions);
      return { ...s, status: newer.length ? 'behind' : 'current', newer };
    }
    const repo = await (await fetchImpl(`https://api.github.com/repos/${s.repo}`, { headers })).json();
    const branch = repo && repo.default_branch;
    if (!branch) throw new Error('the repository did not answer');
    const res = await fetchImpl(`https://api.github.com/repos/${s.repo}/compare/${s.sha}...${branch}`, { headers });
    if (!res.ok) throw new Error(`compare returned ${res.status}`);
    const c = await res.json();
    const commits = (c.commits || []).map((x) => ({ sha: x.sha.slice(0, 12), date: (x.commit.committer || x.commit.author).date.slice(0, 10), message: x.commit.message.split('\n')[0] }));
    const files = (c.files || []).map((f) => f.filename);
    return { ...s, branch, status: c.ahead_by > 0 ? 'behind' : 'current', commits, files };
  } catch (err) {
    return { ...s, status: 'unchecked', error: err.message };
  }
}

export function markdown(rows) {
  const lines = ['## Pinned upstream schemas', ''];
  for (const r of rows) {
    const where = `\`${r.repo || r.package}\` (pinned at ${r.tag || r.version || r.sha.slice(0, 12)} by ${r.modules.map((m) => `\`${m}\``).join(', ')})`;
    if (r.status === 'unchecked') lines.push(`- ${where}: not checked (${r.error}).`);
    else if (r.package && r.status === 'current') lines.push(`- ${where}: the registry's latest version is the pin.`);
    else if (r.package) lines.push(`- ${where}: the registry's latest version is ${r.newer[0]}. A new version is a new pin: read its change log, then update the module, its tests and its package line together.`);
    else if (r.tag && r.status === 'current') lines.push(`- ${where}: no newer version tag.`);
    else if (r.tag) lines.push(`- ${where}: newer version${r.newer.length === 1 ? '' : 's'} ${r.newer.join(', ')}. A new version is a new pin: read its changes, then update the module, its tests and its tag line together.`);
    else if (r.status === 'current') lines.push(`- ${where}: no change on ${r.branch} since the pin.`);
    else {
      lines.push(`- ${where}: ${r.commits.length} commit${r.commits.length === 1 ? '' : 's'} on ${r.branch} since the pin. Read them; if the template changed, update the module and its snapshot line.`);
      for (const c of r.commits) lines.push(`  - ${c.date} ${c.sha}: ${c.message}`);
      if (r.files.length) lines.push(`  - Files: ${r.files.map((f) => `\`${f}\``).join(', ')}`);
    }
  }
  if (!rows.length) lines.push('No module names a pinned upstream snapshot.');
  return lines.join('\n') + '\n';
}

async function main() {
  const args = process.argv.slice(2);
  const found = snapshots();
  if (args.includes('--offline') || process.env.SOPHIEWELL_OFFLINE === '1') {
    process.stdout.write(`## Pinned upstream schemas\n\nOffline run: ${found.length} pinned snapshot${found.length === 1 ? ' was' : 's were'} not compared.\n`);
    return;
  }
  const rows = [];
  for (const s of found) rows.push(await compare(s));
  process.stdout.write(args.includes('--json') ? JSON.stringify(rows, null, 2) + '\n' : markdown(rows));
}

if (process.argv[1] && process.argv[1].endsWith('watch-upstream.mjs')) {
  main().catch((err) => { process.stdout.write(`## Pinned upstream schemas\n\nThe upstream watcher did not run: ${err.message}\n`); });
}
