// A build gate's reason is a claim about a URL on a date. data/build-gates.json is the dated part and
// scripts/probe-build-gates.mjs re-checks it; this keeps the two honest against the generated index of
// unbuilt tools, and tests the probe's judgment calls, which are the parts a status code cannot make.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadGates, readsAsShell, movedHost, parseArgs } from '../../scripts/probe-build-gates.mjs';

const doc = loadGates();
const byTool = new Map(doc.gates.map((g) => [g.tool, g]));
const KINDS = new Set(['publisher-paywall', 'priced-publication', 'waf-blocked', 'script-rendered',
  'not-yet-published', 'policy-unsettled', 'date-conditioned', 'dropped']);

test('every row is complete, and its kind is one of the eight', () => {
  assert.ok(doc.gates.length >= 10);
  assert.match(doc.probedOn, /^\d{4}-\d{2}-\d{2}$/);
  for (const g of doc.gates) {
    assert.ok(g.tool, 'a row needs a tool');
    assert.ok(g.spec, `${g.tool}: a row needs the spec that gated it`);
    assert.ok(g.source, `${g.tool}: a row needs the source it waits on`);
    assert.ok(KINDS.has(g.kind), `${g.tool}: "${g.kind}" is not a known kind`);
    assert.ok(g.note && g.note.length > 20, `${g.tool}: a row needs a note saying what was found`);
  }
});

test('a row with no URL is one of the kinds that cannot have one', () => {
  // These three have nothing to fetch: the document does not exist yet, the policy is unsettled, or
  // the date has not arrived. Any other kind must name the URL its claim is about.
  const noUrlKinds = new Set(['not-yet-published', 'policy-unsettled', 'date-conditioned', 'dropped']);
  for (const g of doc.gates) {
    if (g.url === null) {
      assert.ok(noUrlKinds.has(g.kind), `${g.tool}: kind "${g.kind}" must name a URL`);
      assert.equal(g.lastStatus, null, `${g.tool}: no URL means no status`);
    } else {
      assert.match(g.url, /^https:\/\//, `${g.tool}: ${g.url}`);
    }
  }
});

// Every id the index lists, from both of its tables: the numbered spec rows and the
// openspec-only rows the generator gained in spec-v1695.
function indexIds() {
  const md = readFileSync(new URL('../../docs/unbuilt-tools.md', import.meta.url), 'utf8');
  const numbered = [...md.matchAll(/^\|\s*\d+\.\s*`([^`]+)`/gm)].map((m) => m[1]);
  const openspecOnly = [...md.matchAll(/^\|\s*`([a-z0-9-]+)`\s*\|\s*\[/gm)].map((m) => m[1]);
  return { numbered, openspecOnly, all: [...numbered, ...openspecOnly] };
}

test('every tool in the generated unbuilt index has a gate row', () => {
  // docs/unbuilt-tools.md is generated, so it is the list that moves when a tool ships. A tool that
  // is unbuilt and unexplained here is the gap this file exists to close.
  const { all } = indexIds();
  assert.ok(all.length > 5, `expected the index to list tools, found ${all.length}`);
  const missing = all.filter((id) => !byTool.has(id));
  assert.deepEqual(missing, [], `unbuilt with no gate row: ${missing.join(', ')}`);
});

test('the index lists the openspec-only tools, which it could not see before', () => {
  // tpa-eligibility is specified only as an openspec change with no spec-v document. Until the
  // generator learned to collect those, it was unbuilt and absent from the one page that answers
  // "what is left".
  // It shipped in spec-v1708, so the index must now leave it out, and any openspec-only row it does list
  // must still be missing from the catalog.
  const { openspecOnly } = indexIds();
  assert.ok(!openspecOnly.includes('tpa-eligibility'), 'tpa-eligibility shipped in spec-v1708 and must leave the index');
  const app = readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
  for (const id of openspecOnly) assert.ok(!app.includes(`id: '${id}'`), `${id} is in the catalog but still listed as unbuilt`);
});

test('a gate row for a tool that has shipped is stale and fails', () => {
  // The rows that are not in the index are the ones that describe something other than a listed
  // tool -- a sub-part of a shipped tool, or a source cited for a name only. Those are allowed, but
  // each must say so, so a row cannot quietly outlive the tool it gated.
  const listed = new Set(indexIds().all);
  for (const g of doc.gates) {
    if (listed.has(g.tool)) continue;
    assert.match(g.note + g.source, /shipped|name only|three-level|not wanted|dropped|task 1\.5|NOT IN docs\/unbuilt-tools\.md/i,
      `${g.tool} is not in the unbuilt index, so its row must say what it still describes`);
  }
});

test('readsAsShell catches a page that answers 200 with no document', () => {
  // The QualityNet shape: a small HTML body whose only links are its own bundle.
  const shell = Buffer.from('<html><head><link href="styles-D7QRO3QY.css"><link href="favicon.ico">'
    + '<script src="chunk-AM62RWVF.js"></script></head><body><app-root></app-root><a href="/">Home</a></body></html>');
  assert.equal(readsAsShell(shell, 'text/html; charset=utf-8'), true);

  // A page that actually links a document is not a shell.
  const real = Buffer.from('<html><body><a href="https://example.gov/manual.pdf">Manual</a></body></html>');
  assert.equal(readsAsShell(real, 'text/html'), false);

  // A PDF is never a shell, however small, and neither is a large page.
  assert.equal(readsAsShell(Buffer.from('%PDF-1.7 ...'), 'application/pdf'), false);
  assert.equal(readsAsShell(Buffer.alloc(25000, 60), 'text/html'), false);
  assert.equal(readsAsShell(null, 'text/html'), false);
});

test('movedHost reports a redirect that changed the host, and stays quiet otherwise', () => {
  // The OPTN shape: the recorded host no longer serves the site.
  assert.equal(movedHost('https://optn.transplant.hrsa.gov/x', 'https://www.hrsa.gov/optn'),
    'optn.transplant.hrsa.gov -> www.hrsa.gov');
  // A redirect within the same host is not a move.
  assert.equal(movedHost('https://who.int/a', 'https://who.int/b'), null);
  assert.equal(movedHost('https://who.int/a', null), null);
  assert.equal(movedHost(null, 'https://who.int/a'), null);
});

test('the probe takes its flags, and one row at a time', () => {
  assert.deepEqual(parseArgs([]), { json: false, offline: false, tool: null });
  assert.deepEqual(parseArgs(['--json', '--offline']), { json: true, offline: true, tool: null });
  assert.equal(parseArgs(['--tool', 'kdri-kdpi']).tool, 'kdri-kdpi');
});

test('importing the probe does not run it', () => {
  // The entry-point guard matters here more than usual: this is the one script that reaches the
  // network, and a unit suite must never do that. Importing it above has already proved the point;
  // this asserts the guard is present so it cannot be dropped.
  const src = readFileSync(new URL('../../scripts/probe-build-gates.mjs', import.meta.url), 'utf8');
  assert.match(src, /process\.argv\[1\][\s\S]{0,80}endsWith\('probe-build-gates\.mjs'\)/);
});
