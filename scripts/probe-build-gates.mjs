#!/usr/bin/env node
// scripts/probe-build-gates.mjs -- re-probe the sources that gate an unbuilt tool.
//
// WHY THIS EXISTS. A build gate's reason is a claim about a URL on a date: "the publisher returned a
// bot check on October 19, 2026", "optn.transplant.hrsa.gov refused the request". Those claims get
// inherited by the next session and read as properties of the document, and on November 7, 2026 two of
// them turned out to be wrong in opposite directions:
//
//   - The WHO Hand Hygiene Technical Reference Manual was recorded as a bot-check page. It downloads in
//     one call with an ordinary user-agent; only one fetcher was being refused. The tool it gated had
//     been waiting since October (spec-v1689).
//   - The OPTN guides were recorded as a refusal by optn.transplant.hrsa.gov. That host no longer
//     serves the site at all -- it answers 301 to hrsa.gov/optn -- so the recorded reason pointed at a
//     domain that could only ever refuse (spec-v1690's notes).
//
// And one turned out to be right for a reason a status code cannot see: QualityNet answers 200 with a
// single-page-application shell that carries no document at all.
//
// So this probes each row of data/build-gates.json and prints the status beside the one recorded, with
// the changes called out. It is a FINDER: it asserts nothing, fails nothing, and is not in `npm run
// lint` or `npm test`, because it is the only script here that needs the network to tell the truth.
//
// A reachable row is not a buildable tool. It means the document can be fetched; it still has to be
// read, and the tool written against it. The `kind` field says what sort of wall it is, and three of
// them -- not-yet-published, policy-unsettled, date-conditioned -- have no URL to probe at all.
//
// Usage:
//   node scripts/probe-build-gates.mjs            probe every row with a URL
//   node scripts/probe-build-gates.mjs --json     the same, as JSON
//   node scripts/probe-build-gates.mjs --tool ID  one row
//   node scripts/probe-build-gates.mjs --offline  print what is recorded, fetch nothing

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const GATES = join(ROOT, 'data', 'build-gates.json');

// A browser-shaped user-agent, deliberately. The point of this script is to find out what a person
// with a browser would get, which is what the gate notes are really claiming.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';

export function parseArgs(argv) {
  const out = { json: false, offline: false, tool: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--json') out.json = true;
    else if (argv[i] === '--offline') out.offline = true;
    else if (argv[i] === '--tool') { out.tool = argv[i + 1]; i += 1; }
  }
  return out;
}

export function loadGates(path = GATES) {
  const doc = JSON.parse(readFileSync(path, 'utf8'));
  if (!Array.isArray(doc.gates)) throw new Error('build-gates.json: expected a `gates` array');
  return doc;
}

// A 200 is not always an open door. A page small enough to be a script shell, or one whose body
// carries no document link, is reported as such -- that is the QualityNet shape, and a bare status
// code would read it as reachable.
export function readsAsShell(bytes, contentType) {
  if (!bytes || !/html/i.test(contentType || '')) return false;
  const text = bytes.toString('utf8');
  if (text.length > 20000) return false;
  const hrefs = [...text.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  const substantive = hrefs.filter((h) => !/^(\/|#|favicon|styles?|chunk|main|runtime|polyfill)/i.test(h) && !/\.(css|js)(\?|$)/i.test(h));
  return substantive.length === 0;
}

async function probe(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': UA, accept: '*/*' },
    });
    const buf = Buffer.from(await res.arrayBuffer().catch(() => new ArrayBuffer(0)));
    return {
      status: res.status,
      finalUrl: res.url,
      contentType: res.headers.get('content-type') || '',
      bytes: buf.length,
      shell: readsAsShell(buf, res.headers.get('content-type')),
    };
  } catch (err) {
    return { status: null, error: err.name === 'AbortError' ? 'timed out' : String(err.message || err) };
  } finally {
    clearTimeout(timer);
  }
}

// moved(recorded, finalUrl) -> the host changed under us, which is the OPTN shape.
export function movedHost(url, finalUrl) {
  if (!url || !finalUrl) return null;
  try {
    const a = new URL(url).host;
    const b = new URL(finalUrl).host;
    return a === b ? null : `${a} -> ${b}`;
  } catch { return null; }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const doc = loadGates();
  const rows = doc.gates.filter((g) => !args.tool || g.tool === args.tool);
  if (!rows.length) {
    console.error(`probe-build-gates: no gate named ${args.tool}`);
    process.exit(1);
  }

  const results = [];
  for (const g of rows) {
    if (!g.url || args.offline) {
      results.push({ ...g, probed: false });
      continue;
    }
    const r = await probe(g.url);
    results.push({ ...g, probed: true, ...r, hostMoved: movedHost(g.url, r.finalUrl) });
  }

  if (args.json) {
    console.log(JSON.stringify({ probedOn: new Date().toISOString().slice(0, 10), recordedOn: doc.probedOn, results }, null, 2));
    return;
  }

  console.log(`probe-build-gates: ${results.length} gate(s); recorded ${doc.probedOn}`);
  const changed = [];
  for (const r of results) {
    if (!r.probed) {
      console.log(`  ${r.tool}  [${r.kind}]  nothing to probe -- ${r.note.slice(0, 80)}`);
      continue;
    }
    const was = r.lastStatus === null ? 'none' : r.lastStatus;
    const now = r.status === null ? `error (${r.error})` : r.status;
    const flags = [
      r.shell ? 'script shell, no document' : null,
      r.hostMoved ? `host moved ${r.hostMoved}` : null,
    ].filter(Boolean);
    const same = r.status === r.lastStatus;
    console.log(`  ${r.tool}  [${r.kind}]  recorded ${was} -> now ${now}${flags.length ? `  (${flags.join('; ')})` : ''}`);
    if (!same) changed.push(`${r.tool}: ${was} -> ${now}`);
  }

  if (changed.length) {
    console.log('\nCHANGED since the recorded probe, so the gate note is out of date:');
    for (const c of changed) console.log(`  ${c}`);
    console.log('\nA changed status is not permission to build. Read the document, then write the tool');
    console.log('against it -- and update data/build-gates.json with what the probe found.');
  } else {
    console.log('\nNo change: every probed gate answers as recorded.');
  }
}

if (process.argv[1] && process.argv[1].endsWith('probe-build-gates.mjs')) {
  await main();
}
