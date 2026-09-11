// spec-v1242: Stanford, ECST against NASCET, the endoleak types, and Rutherford's acute classes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stanfordDissection } from '../../lib/stanford-dissection-v1242.js';
import { ecstCarotid, ecstFromNascet, nascetFromEcst } from '../../lib/ecst-carotid-v1242.js';
import { endoleakType, ENDOLEAK_FINDINGS } from '../../lib/endoleak-type-v1242.js';
import { rutherfordAli } from '../../lib/rutherford-ali-v1242.js';

// --- Stanford --------------------------------------------------------------

test('stanford: the letter turns on the ascending aorta and nothing else', () => {
  assert.equal(stanfordDissection({ ascending: true }).type, 'A');
  assert.equal(stanfordDissection({ ascending: true, abdominal: true }).type, 'A');
  assert.equal(stanfordDissection({ arch: true, descending: true }).type, 'B');
});

test('stanford: an arch dissection is a type B, and the tile says so out loud', () => {
  const r = stanfordDissection({ arch: true, descending: true });
  assert.equal(r.type, 'B');
  assert.match(r.archNote, /often read as "descending only"/);
  assert.equal(stanfordDissection({ descending: true }).archNote, null);
});

test('stanford: the DeBakey mapping, where the extent determines one', () => {
  assert.equal(stanfordDissection({ ascending: true, arch: true }).debakey, 'I');
  assert.equal(stanfordDissection({ ascending: true }).debakey, 'II');
  assert.equal(stanfordDissection({ descending: true }).debakey, 'IIIa');
  assert.equal(stanfordDissection({ descending: true, abdominal: true }).debakey, 'IIIb');
  assert.equal(stanfordDissection({ arch: true }).debakey, null);
});

test('stanford: the type B split, and an empty form is not a type B', () => {
  assert.equal(stanfordDissection({ descending: true }).typeBStatus, 'uncomplicated');
  assert.equal(stanfordDissection({ descending: true, refractory: true }).typeBStatus, 'high-risk uncomplicated');
  assert.equal(stanfordDissection({ descending: true, malperfusion: true }).typeBStatus, 'complicated');
  const empty = stanfordDissection({});
  assert.equal(empty.valid, false);
  assert.match(empty.message, /Nothing ticked is not a type B/);
});

// --- ECST against NASCET ---------------------------------------------------

test('ecst: one artery, two percentages, and the larger denominator reads higher', () => {
  const r = ecstCarotid({ residual: 2, distalIca: 4, originalBulb: 8 });
  assert.equal(r.nascet, 50);
  assert.equal(r.ecst, 75);
  assert.ok(r.ecst > r.nascet);
});

test('ecst: the published conversion, in both directions', () => {
  assert.equal(ecstFromNascet(50), 70);
  assert.equal(Math.round(nascetFromEcst(70)), 50);
  assert.equal(Math.round(ecstFromNascet(70)), 82);
});

test('ecst: a residual lumen wider than its denominator is refused, not reported as negative', () => {
  const a = ecstCarotid({ residual: 5, distalIca: 4, originalBulb: 8 });
  assert.equal(a.valid, false);
  assert.match(a.message, /negative NASCET stenosis/);
  const b = ecstCarotid({ residual: 5, distalIca: 6, originalBulb: 4 });
  assert.equal(b.valid, false);
  assert.match(b.message, /cannot be the smaller of the two/);
});

test('ecst: swapped denominators are flagged rather than silently computed', () => {
  const r = ecstCarotid({ residual: 1, distalIca: 5, originalBulb: 4 });
  assert.equal(r.valid, true);
  assert.equal(r.denominatorsSwapped, true);
  assert.match(r.swapNote, /entered the other way round/);
});

test('ecst: a blank or whitespace diameter is refused', () => {
  assert.equal(ecstCarotid({ residual: 2, distalIca: 4, originalBulb: '' }).valid, false);
  assert.equal(ecstCarotid({ residual: 2, distalIca: '  ', originalBulb: 8 }).valid, false);
});

// --- Endoleak ---------------------------------------------------------------

test('endoleak: each finding maps to its own type', () => {
  const seen = new Set();
  for (const f of ENDOLEAK_FINDINGS) {
    const r = endoleakType({ finding: f.value });
    assert.equal(r.valid, true, f.value);
    assert.equal(r.type, f.type);
    assert.equal(seen.has(f.type), false, `duplicate type ${f.type}`);
    seen.add(f.type);
  }
  assert.equal(seen.size, 9);
});

test('endoleak: the urgency is the pressure, not the numeral', () => {
  assert.equal(endoleakType({ finding: 'proximal-attachment' }).pressure, 'high');
  assert.equal(endoleakType({ finding: 'one-branch' }).pressure, 'low');
  assert.equal(endoleakType({ finding: 'component-separation' }).pressure, 'high');
  assert.match(endoleakType({ finding: 'one-branch' }).ladderNote, /not a ladder of severity/);
});

test('endoleak: a type V says what "no leak seen" does and does not mean', () => {
  const r = endoleakType({ finding: 'sac-growth-no-leak' });
  assert.equal(r.type, 'V');
  assert.match(r.exclusionNote, /has not been seen yet/);
  assert.equal(endoleakType({ finding: 'one-branch' }).exclusionNote, null);
});

// --- Rutherford acute limb ischemia ----------------------------------------

const LIMB = { sensory: 'none', motor: 'none', arterialDoppler: 'audible', venousDoppler: 'audible' };

test('rutherford ali: the four published categories, from the table', () => {
  assert.equal(rutherfordAli(LIMB).category, 'I');
  assert.equal(rutherfordAli({ ...LIMB, sensory: 'toes', arterialDoppler: 'inaudible' }).category, 'IIa');
  assert.equal(rutherfordAli({ ...LIMB, sensory: 'beyond-toes', motor: 'mild-moderate', arterialDoppler: 'inaudible' }).category, 'IIb');
  assert.equal(rutherfordAli({ ...LIMB, sensory: 'profound', motor: 'paralysis', arterialDoppler: 'inaudible', venousDoppler: 'inaudible' }).category, 'III');
});

test('rutherford ali: the venous signal is what separates IIb from III', () => {
  const iib = { ...LIMB, sensory: 'beyond-toes', motor: 'mild-moderate', arterialDoppler: 'inaudible' };
  assert.equal(rutherfordAli(iib).category, 'IIb');
  assert.match(rutherfordAli(iib).venousNote, /managed in opposite directions/);
  const iii = { ...iib, venousDoppler: 'inaudible' };
  assert.equal(rutherfordAli(iii).category, 'III');
  assert.equal(rutherfordAli(iii).venousDecided, true);
  assert.match(rutherfordAli(iii).conflictNote, /Confirm the venous signal/);
});

test('rutherford ali: an inaudible arterial signal alone is a IIa, not a viable limb', () => {
  const r = rutherfordAli({ ...LIMB, arterialDoppler: 'inaudible' });
  assert.equal(r.category, 'IIa');
  assert.match(r.arterialOnlyNote, /rather than the viable one/);
});

test('rutherford ali: all four findings are required, and it names them', () => {
  const r = rutherfordAli({ sensory: 'none' });
  assert.equal(r.valid, false);
  assert.match(r.message, /the muscle weakness/);
  assert.match(r.message, /venous Doppler/);
  assert.match(r.message, /a blank is not an audible signal/);
});

test('rutherford ali: it names the other Rutherford scale', () => {
  assert.match(rutherfordAli(LIMB).chronicNote, /chronic limb ischemia/);
});
