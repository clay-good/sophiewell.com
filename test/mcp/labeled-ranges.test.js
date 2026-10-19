// spec-v1646: a number field whose label states its range declares that range.
//
// The label is what an agent reads, and 22 tools said "(0-3)" or "(1-4)" without
// enforcing it. Past the end, libs clamped (Aldrete activity 3 scored as 2),
// summed (CIWA nausea 8), or dropped the value (Roland-Morris 25 scored 0, Phoenix
// GCS 16 read as missing). `min`/`max` on the field makes validateInputs refuse
// it with OUT_OF_RANGE and puts minimum/maximum in the input schema.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allCalculators } from '../../mcp/catalog.js';
import { computeCalculator } from '../../mcp/tools.js';

const RANGE = /\((-?\d+(?:\.\d+)?)\s*(?:-|to|or)\s*(-?\d+(?:\.\d+)?)\)/;

// Fields whose stated range the lib checks itself, with a message of its own.
const LIB_CHECKED = new Map([
  // "(2 or 3)" is what a plan may set; a 4 is answered "plan settings not permitted".
  ['mtm-eligibility-check', 'the lib reports a plan setting outside 423.153(d)(2)'],
  // Preset-specific fields; the lib refuses each one with the label's own sentence.
  ['label-titration-calendar', 'the lib checks each preset field against its label range'],
]);

test('spec-v1646: every number field whose label states a range declares it', () => {
  const offenders = [];
  for (const c of allCalculators()) {
    if (LIB_CHECKED.has(c.id)) continue;
    for (const f of c.fields || []) {
      if (f.kind !== 'number') continue;
      const m = RANGE.exec(f.label || '');
      if (!m) continue;
      const lo = Number(m[1]); const hi = Number(m[2]);
      if (!(hi > lo)) continue;
      if (Array.isArray(f.values)) {
        const bad = f.values.map(Number).filter((v) => v < lo || v > hi);
        if (bad.length) offenders.push(`${c.id} ${f.dom}: label says ${lo}-${hi}, options include ${bad.join(', ')}`);
        continue;
      }
      if (f.min !== lo || f.max !== hi) offenders.push(`${c.id} ${f.dom}: label says ${lo}-${hi}, field declares ${f.min}-${f.max}`);
    }
  }
  assert.deepEqual(offenders, [], `\n${offenders.join('\n')}`);
});

test('spec-v1646: a value past a declared range is refused with OUT_OF_RANGE', () => {
  const cases = [
    ['aldrete', 'al-act', '3'],
    ['ciwa', 'cw-nau', '8'],
    ['roland-morris-disability', 'rmdq-count', '25'],
    ['phoenix-sepsis', 'phx-gcs', '16'],
    ['peds-gcs', 'pg-eye', '0'],
  ];
  const byId = new Map(allCalculators().map((c) => [c.id, c]));
  for (const [id, dom, v] of cases) {
    const base = byId.get(id).example.fields;
    assert.notEqual(computeCalculator({ id, inputs: base }).valid, false, `${id} example no longer computes`);
    const r = computeCalculator({ id, inputs: { ...base, [dom]: v } });
    assert.equal(r.valid, false, `${id} accepted ${dom} = ${v}`);
    assert.equal(r.code, 'OUT_OF_RANGE');
    assert.equal(r.field, dom);
  }
});

test('spec-v1646: the declared range reaches the input schema', () => {
  const c = allCalculators().find((t) => t.id === 'ciwa');
  const p = c.inputSchema.properties['cw-nau'];
  assert.equal(p.minimum, 0);
  assert.equal(p.maximum, 7);
});
