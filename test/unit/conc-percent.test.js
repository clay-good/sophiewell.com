// spec-v56 §2.13: concentration / percent / ratio converter.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { concPercent } from '../../lib/medication-v5.js';

test('epinephrine 1:1000 = 1 mg/mL = 0.1%', () => {
  const r = concPercent({ mode: 'ratio', value: 1000 });
  assert.equal(r.mgPerMl, 1);
  assert.equal(r.percent, 0.1);
  assert.equal(r.ratio, 1000);
});

test('1:10000 = 0.1 mg/mL = 0.01%', () => {
  const r = concPercent({ mode: 'ratio', value: 10000 });
  assert.equal(r.mgPerMl, 0.1);
  assert.equal(r.percent, 0.01);
});

test('1% w/v = 10 mg/mL = 1:100', () => {
  const r = concPercent({ mode: 'percent', value: 1 });
  assert.equal(r.mgPerMl, 10);
  assert.equal(r.ratio, 100);
});

test('mg/mL passthrough: 20 mg/mL = 2% = 1:50', () => {
  const r = concPercent({ mode: 'mgml', value: 20 });
  assert.equal(r.percent, 2);
  assert.equal(r.ratio, 50);
});

test('rejects unknown mode and non-positive value', () => {
  assert.throws(() => concPercent({ mode: 'molar', value: 1 }), /mode must be/);
  assert.throws(() => concPercent({ mode: 'ratio', value: 0 }), /value/);
});

// spec-v1641 row 18: an arithmetic identity is cited as one, not credited to USP.
test('the citation and the agent summary name an identity, not USP', async () => {
  const { META } = await import('../../lib/meta.js');
  const adapters = (await import('../../mcp/adapters/medication-v5.js')).default;
  const summary = adapters.find((a) => a.id === 'conc-percent').summary;
  for (const text of [META['conc-percent'].citation, summary]) {
    assert.match(text, /identit/i);
    assert.doesNotMatch(text, /USP/);
  }
});

// spec-v1629 backfill: weight in volume, mass fraction and volume fraction.
test('mg/dL and mcg/mL are weight in volume', () => {
  assert.deepEqual([concPercent({ mode: 'mgdl', value: 100 }).mgPerMl, concPercent({ mode: 'mgdl', value: 100 }).percent], [1, 0.1]);
  const m = concPercent({ mode: 'mcgml', value: 1 });
  assert.deepEqual([m.mgPerMl, m.percent, m.mgPerDl, m.percentWw], [0.001, 0.0001, 0.1, null]);
});

test('% w/w crosses to % w/v only through the solution\'s specific gravity', () => {
  const none = concPercent({ mode: 'percentww', value: 10 });
  assert.deepEqual([none.mgPerMl, none.percent, none.percentWw, none.ppm], [null, null, 10, 100000]);
  assert.match(none.note, /not converted to weight in volume/);
  const sg = concPercent({ mode: 'percentww', value: 10, solutionSg: 1.2 });
  assert.deepEqual([sg.percent, sg.mgPerMl, sg.note], [12, 120, null]);
  // A blank or whitespace field is not a specific gravity of zero or one.
  assert.equal(concPercent({ mode: 'percentww', value: 10, solutionSg: '  ' }).mgPerMl, null);
  assert.throws(() => concPercent({ mode: 'percentww', value: 101 }), /cannot be more than 100%/);
  assert.throws(() => concPercent({ mode: 'percentww', value: 10, solutionSg: 0 }), /between 0.5 and 20/);
});

test('ppm and ppb are mass fractions; without a specific gravity the mg/L reading is named', () => {
  const p = concPercent({ mode: 'ppm', value: 1 });
  assert.deepEqual([p.percentWw, p.mgPerMl, p.mcgPerMl], [0.0001, 0.001, 1]);
  assert.match(p.note, /read as mg\/L.*dilute aqueous solution only/);
  const b = concPercent({ mode: 'ppb', value: 15 });
  assert.deepEqual([b.ppm, b.mcgPerMl], [0.015, 0.015]);
  assert.match(b.note, /read as mcg\/L/);
  const dense = concPercent({ mode: 'ppm', value: 1000, solutionSg: 1.5 });
  assert.deepEqual([dense.mgPerMl, dense.percentWw, dense.note], [1.5, 0.1, null]);
});

test('% v/v crosses through the liquid ingredient\'s specific gravity, and the old modes are unchanged', () => {
  const v = concPercent({ mode: 'percentvv', value: 70 });
  assert.deepEqual([v.percentVv, v.mgPerMl], [70, null]);
  assert.equal(concPercent({ mode: 'percentvv', value: 70, liquidSg: 0.789 }).percent, 55.23);
  assert.deepEqual(concPercent({ mode: 'ratio', value: 1000 }), { mgPerMl: 1, percent: 0.1, ratio: 1000 });
  assert.deepEqual(concPercent({ mode: 'percent', value: 5, solutionSg: 1.02 }), { mgPerMl: 50, percent: 5, ratio: 20, percentWw: 4.902, ppm: 49019.608 });
});
