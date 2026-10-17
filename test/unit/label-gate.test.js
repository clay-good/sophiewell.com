// spec-v1628 section 1: the older tools that read figures from a watched FDA label without labelRow() fail
// closed through lib/label-gate.js, on the page and through the MCP server.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { LEGACY_LABEL_TOOLS, NOT_GATED, labelGate } from '../../lib/label-gate.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const rows = JSON.parse(readFileSync('scripts/data/label-editions.json', 'utf8'));

test('the gated list is every watched-label tool whose libraries never call labelRow, less the named exceptions', () => {
  // Each tool's compute library: the import whose alias (or named export) its adapter entry calls.
  const libsOf = {};
  for (const a of readdirSync('mcp/adapters')) {
    const s = readFileSync(`mcp/adapters/${a}`, 'utf8');
    const ns = Object.fromEntries([...s.matchAll(/import \* as (\w+) from '\.\.\/\.\.\/lib\/([^']+)'/g)].map((m) => [m[1], m[2]]));
    const named = [...s.matchAll(/import \{([^}]*)\} from '\.\.\/\.\.\/lib\/([^']+)'/g)].flatMap((m) => m[1].split(',').map((x) => [x.trim().split(/\s+as\s+/).pop(), m[2]]));
    const blocks = s.split(/\n {2}\{\n/);
    for (const b of blocks) {
      const id = /id: '([a-z0-9-]+)'/.exec(b);
      if (!id) continue;
      const libs = new Set();
      for (const [alias, lib] of Object.entries(ns)) if (new RegExp(`\\b${alias}\\.`).test(b)) libs.add(lib);
      for (const [name, lib] of named) if (name && new RegExp(`\\b${name}\\b`).test(b)) libs.add(lib);
      libsOf[id[1]] = [...libs];
    }
  }
  const tools = new Set(rows.flatMap((r) => r.tools || []));
  const usesRow = (t) => (libsOf[t] || []).some((l) => { try { return /labelRow\(|label-row\.js|label-dose\.js/.test(readFileSync(`lib/${l}`, 'utf8')); } catch { return false; } });
  const expected = [...tools].filter((t) => !usesRow(t)).sort();
  assert.deepEqual([...Object.keys(LEGACY_LABEL_TOOLS), ...Object.keys(NOT_GATED)].sort(), expected);
  for (const [t, ids] of Object.entries(LEGACY_LABEL_TOOLS)) assert.deepEqual(ids, rows.filter((r) => (r.tools || []).includes(t)).map((r) => r.setId), t);
});

test('a current label lets the tool answer; a superseded or lapsed one withholds it, naming why', () => {
  const now = new Date('2026-10-15T12:00:00Z');
  assert.equal(labelGate('digoxin', now), null);
  assert.equal(labelGate('not-a-gated-tool', now), null);
  const id = LEGACY_LABEL_TOOLS.digoxin[0];
  const g = labelGate('digoxin', now, { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-14' } });
  assert.match(g.message, /^No answer is given: this tool's figures come from FDA labels, and the label's text has changed since version \d+ of the /);
  assert.equal(g.withheld[0].url, `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${id}`);
  assert.match(labelGate('anticoag-reversal', new Date('2031-01-01T12:00:00Z')).message, /more than 12 months ago.*Read the current labels on DailyMed/);
});

test('several labels withheld for one reason share one clause, and every label is still named', () => {
  const later = new Date('2031-01-01T12:00:00Z');
  const g = labelGate('tpn-macro', later);
  assert.equal((g.message.match(/more than 12 months ago/g) || []).length, 1);
  assert.match(g.message, /and 6 labels were last confirmed more than 12 months ago \(version \d+ of the /);
  for (const w of g.withheld) assert.ok(g.message.includes(w.edition), w.edition);
  // A superseded label beside lapsed ones keeps its own clause.
  const id = LEGACY_LABEL_TOOLS['tpn-macro'][0];
  const mixed = labelGate('tpn-macro', later, { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-14' } });
  assert.match(mixed.message, /the label's text has changed since version \d+ .*; 5 labels were last confirmed/);
});
