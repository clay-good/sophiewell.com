// spec-v1636 backfill 2: cyanide antidote doses by weight, from the NITHIODOTE and CYANOKIT labels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cyanideAntidoteDose, LABELS } from '../../lib/cyanide-antidote-dose-v1636.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-12T12:00:00Z');
const c = (i, t) => cyanideAntidoteDose(i, now, t);
const dead = (id) => ({ ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } });

test('both label rows answer', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.name);
});

test('adult: one vial of each, and 5 g of hydroxocobalamin', () => {
  const r = c({ who: 'adult-dosing' });
  assert.deepEqual([r.nitriteMl, r.nitriteMg, r.thiosulfateMl, r.thiosulfateG, r.hydroxocobalaminG], [10, 300, 50, 12.5, 5]);
  assert.match(r.note, /one-half the original dose: sodium nitrite 5 mL, then sodium thiosulfate 25 mL/);
});

test('child: 0.2 mL/kg and 1 mL/kg, with the label\'s ceilings', () => {
  const r = c({ who: 'child-dosing', weight: 20 });
  assert.deepEqual([r.nitriteMl, r.nitriteMg, r.thiosulfateMl, r.thiosulfateG], [4, 120, 20, 5]);
  assert.match(r.note, /sodium nitrite 2 mL, then sodium thiosulfate 10 mL/);
  assert.match(r.note, /under 6 months of age/);
  const big = c({ who: 'child-dosing', weight: 60 });
  assert.deepEqual([big.nitriteMl, big.thiosulfateMl], [10, 50]);
  assert.match(big.note, /10 mL ceiling.*50 mL ceiling/);
  // 50 kg sits exactly on both ceilings: no "would be more".
  assert.doesNotMatch(c({ who: 'child-dosing', weight: 50 }).note, /ceiling/);
});

test('child hydroxocobalamin is the label\'s statement, uncapped and marked as not labeled', () => {
  const r = c({ who: 'child-dosing', weight: 80 });
  assert.equal(r.hydroxocobalaminNotLabeledMg, 5600);
  assert.equal(r.hydroxocobalaminG, undefined);
  assert.match(r.note, /not a labeled dose, and the label states no pediatric maximum/);
});

test('a superseded label withholds its own product only', () => {
  const r = c({ who: 'adult-dosing' }, dead(LABELS.nithiodote.setId));
  assert.deepEqual([r.nitriteMl, r.hydroxocobalaminG], [undefined, 5]);
});

test('refusals: no population, no child weight', () => {
  assert.match(c({}).message, /^Choose adult or child/);
  assert.match(c({ who: 'child-dosing' }).message, /^Enter the weight/);
  assert.equal(c(null).valid, false);
});
