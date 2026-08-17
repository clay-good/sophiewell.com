// The worked example on `/tools/<id>/` is a join: `META.example.fields` is
// keyed by DOM id, and the MCP field registry carries the same DOM id with a
// human label and a unit. The page builder prints the example only when every
// key in the example matches a field, because a partial join would state an
// example that is missing one of the values that produced the result.
//
// That join is silent when it breaks: renaming a DOM id on one side drops the
// whole Example block off the page with no error and no failing build. This
// test is the gate.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';
import { getCalculator } from '../../mcp/catalog.js';

// Measured at 1,564 tiles: 1,538 pages carry an example block. The rest are
// tiles with no MCP adapter (no field registry to join against) or no worked
// example at all. A drop below this means a rename broke the join.
const MIN_JOINED = 1538;

function joined() {
  const ok = [];
  const broken = [];
  for (const [id, meta] of Object.entries(META)) {
    const fields = meta?.example?.fields;
    if (!fields || !meta?.example?.expected) continue;
    let rec = null;
    try { rec = getCalculator(id); } catch { rec = null; }
    if (!rec || !Array.isArray(rec.fields)) continue; // no adapter, nothing to join
    const doms = new Set(rec.fields.map((f) => f.dom));
    const missing = Object.keys(fields).filter((k) => !doms.has(k));
    if (missing.length) { broken.push(`${id}: ${missing.join(', ')}`); continue; }
    // A tile whose example sets no value at all (every box left unchecked) has
    // no rows to print, and the page falls back to stating the result alone.
    const printable = Object.values(fields).filter((v) => String(v ?? '').trim());
    if (printable.length) ok.push(id);
  }
  return { ok, broken };
}

test('every worked example joins to the field registry it is drawn from', () => {
  const { broken } = joined();
  assert.deepEqual(broken, [], `example field ids with no matching MCP field:\n${broken.join('\n')}`);
});

test('the worked example reaches at least as many tool pages as it did', () => {
  const { ok } = joined();
  assert.ok(ok.length >= MIN_JOINED, `only ${ok.length} tiles join cleanly, was ${MIN_JOINED}`);
});

// Every printed row needs a label to name it. A blank example value is not a
// defect: seven tiles leave a select on its blank default, and those rows are
// omitted from the page rather than printed as an empty cell.
test('every field behind a joined example has a label to print', () => {
  const { ok } = joined();
  for (const id of ok) {
    const rec = getCalculator(id);
    const byDom = new Map(rec.fields.map((f) => [f.dom, f]));
    for (const dom of Object.keys(META[id].example.fields)) {
      const label = byDom.get(dom).label;
      assert.ok(typeof label === 'string' && label.trim(), `${id}/${dom} has no label`);
    }
  }
});
