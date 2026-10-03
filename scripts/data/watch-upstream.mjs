#!/usr/bin/env node
// scripts/data/watch-upstream.mjs -- spec-v1517 route A, `hpt-schema` (and any other pinned GitHub source).
//
// A library module that implements a schema published on GitHub names the commit it was written from:
//
//   // Source snapshot: CMSgov/hospital-price-transparency commit 5333564a710f80d7740180b9ffab8dbdcba9b502.
//
// The spec asked to pin a release tag; the CMS repository publishes none (no releases, no tags), so the
// pin is the commit. This finds every such line in lib/, asks GitHub's compare API what the default branch
// has added since, and lists it -- commits and files -- for the weekly data-refresh pull request. A change
// to the template is for a person to read: the watcher never edits the module and never fails the job.
//
// Usage: node scripts/data/watch-upstream.mjs [--json] [--offline]

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { USER_AGENT } from './http.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SNAPSHOT = /Source snapshot: ([\w.-]+\/[\w.-]+) commit ([0-9a-f]{40})\b/g;

// snapshots(libDir) -> [{ repo, sha, modules: [file] }], one per repo and commit.
export function snapshots(libDir = join(ROOT, 'lib')) {
  const out = new Map();
  for (const f of readdirSync(libDir).filter((n) => n.endsWith('.js')).sort()) {
    for (const m of readFileSync(join(libDir, f), 'utf8').matchAll(SNAPSHOT)) {
      const key = `${m[1]}@${m[2]}`;
      if (!out.has(key)) out.set(key, { repo: m[1], sha: m[2], modules: [] });
      out.get(key).modules.push(`lib/${f}`);
    }
  }
  return [...out.values()];
}

// compare(snapshot, fetchImpl) -> { ...snapshot, status: 'current'|'behind'|'unchecked', commits?, files?, error? }
export async function compare(s, fetchImpl = globalThis.fetch) {
  const headers = { 'user-agent': USER_AGENT, accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
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
    const where = `\`${r.repo}\` (pinned at ${r.sha.slice(0, 12)} by ${r.modules.map((m) => `\`${m}\``).join(', ')})`;
    if (r.status === 'current') lines.push(`- ${where}: no change on ${r.branch} since the pin.`);
    else if (r.status === 'unchecked') lines.push(`- ${where}: not checked (${r.error}).`);
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
