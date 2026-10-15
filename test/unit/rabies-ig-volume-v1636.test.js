// spec-v1636 backfill 5: rabies immune globulin volume by product, from the labels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rabiesIgVolume, LABELS } from '../../lib/rabies-ig-volume-v1636.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-12T12:00:00Z');
const dead = (id) => ({ ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } });

test('both label rows answer', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.name);
});

test('the labels\' own vial examples: 15 kg, 45 kg and 75 kg', () => {
  // HYPERRAB: 1 mL for 15 kg, 3 mL for 45 kg, 5 mL for 75 kg. KEDRAB: 2 mL for 15 kg, 10 mL for 75 kg.
  for (const [kg, iu, hyper, ked] of [[15, 300, 1, 2], [45, 900, 3, 6], [75, 1500, 5, 10]]) {
    const r = rabiesIgVolume({ weight: kg }, now);
    assert.deepEqual([r.units, r.hyperrab.arithmeticMl, r.kedrab.ml], [iu, hyper, ked], `${kg} kg`);
  }
});

test('HYPERRAB shows the printed 0.0665 mL/kg and the arithmetic where they differ', () => {
  const r = rabiesIgVolume({ weight: 70 }, now);
  assert.deepEqual([r.hyperrab.labelMl, r.hyperrab.arithmeticMl, r.kedrab.ml], [4.66, 4.67, 9.33]);
  assert.match(r.note, /4\.66 mL by the label's 0\.0665 mL\/kg; 1,400 IU divided by 300 IU\/mL is 4\.67 mL/);
  assert.match(r.note, /no later than day 7/);
  assert.match(r.note, /HYPERRAB S\/D, was 150 IU\/mL/);
});

test('a superseded label withholds its own product only', () => {
  const r = rabiesIgVolume({ weight: 70 }, now, dead(LABELS.hyperrab.setId));
  assert.equal(r.hyperrab, undefined);
  assert.equal(r.kedrab.ml, 9.33);
  const t = { ...dead(LABELS.hyperrab.setId), ...{ [LABELS.kedrab.setId]: dead(LABELS.kedrab.setId)[LABELS.kedrab.setId] } };
  assert.equal(rabiesIgVolume({ weight: 70 }, now, t).flag, 'withheld');
});

test('no weight, no volume', () => {
  assert.equal(rabiesIgVolume({}, now).valid, false);
  assert.equal(rabiesIgVolume({ weight: 0 }, now).valid, false);
  assert.equal(rabiesIgVolume(null, now).valid, false);
});

// spec-v1636 backfill 5: the fewest of each label's vial sizes that hold the volume, then the least left over.
test('vial count: fewest vials, then least left over, then the larger vials', () => {
  const rv = rabiesIgVolume;
  // 82.5 kg: HYPERRAB 5.5 mL is 5 + 1; KEDRAB 11 mL is 10 + 2 (not 2 x 10).
  const r = rv({ weight: 82.5 }, now);
  assert.deepEqual([r.hyperrab.vials, r.hyperrab.vialSizes, r.kedrab.vials, r.kedrab.vialSizes], [2, [5, 1], 2, [10, 2]]);
  assert.match(r.notes.join(' '), /Fewest vials: 2 vials \(5 \+ 1 mL\), 0\.5 mL left over/);
  // 70 kg: HYPERRAB counts the larger volume, 4.67 mL, in one 5 mL vial.
  assert.deepEqual(rv({ weight: 70 }, now).hyperrab.vialSizes, [5]);
  // 300 kg: four of the largest size.
  assert.equal(rv({ weight: 300 }, now).kedrab.vials, 4);
});
