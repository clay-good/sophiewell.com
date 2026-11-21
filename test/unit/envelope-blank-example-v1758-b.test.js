// spec-v1758: fields left blank in the worked example were never driven past
// the envelope lib/bounds.js declares, so these tools still answered. Each case
// checks the just-past-ceiling value is refused and an in-range value answers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { psi, berlinArds, hellp } from '../../lib/scoring-v4.js';
import { startTriage, jumpStartTriage, naloxoneDose } from '../../lib/field.js';
import { lrinec, alt70 } from '../../lib/traumaclass-v109.js';

const psiBase = { age: 60, sex: 'M' };
// spec-v1763: bound widened (source in lib/bounds.js)
for (const [arg, over, ok] of [['temp', 47.1, 37], ['bun', 301, 20], ['sodium', 211, 140], ['glucose', 3001, 110], ['hct', 75.1, 40], ['pao2', 701, 80]]) {
  test(`psi refuses ${arg} past its envelope and scores an in-range value`, () => {
    const bad = psi({ ...psiBase, [arg]: over });
    assert.equal(bad.valid, false);
    assert.equal(bad.score, null);
    const good = psi({ ...psiBase, [arg]: ok });
    assert.equal(typeof good.score, 'number');
    assert.equal(psi({ ...psiBase, [arg]: null }).score, 60);
  });
}

test('berlin-ards refuses a PaO2 past 700 mmHg and grades an in-range one', () => {
  const all = { timingLe1wk: true, bilateralOpacities: true, notExplainedByCardiacOrOverload: true, peepGe5cmH2O: true, fio2: 0.5 };
  assert.throws(() => berlinArds({ ...all, pao2: 701 }), RangeError);
  assert.equal(berlinArds({ ...all, pao2: 80 }).severity, 'moderate');
  // A blank PaO2 is missing, not 0: no severity from an empty field.
  assert.equal(berlinArds({ ...all, pao2: null }).pfRatio, null);
});

test('hellp refuses a platelet nadir past 4000 and classes an in-range one', () => {
  // spec-v1763: bound widened (source in lib/bounds.js)
  assert.throws(() => hellp({ plateletNadirThousands: 4001 }), RangeError);
  assert.equal(hellp({ plateletNadirThousands: 40 }).mississippiClass, 1);
  assert.equal(hellp({ plateletNadirThousands: '' }).mississippiClass, null);
});

test('start-triage refuses a respiratory rate past 80 and still accepts a blank (0) rate', () => {
  assert.throws(() => startTriage({ canWalk: true, respiratoryRate: 81 }), RangeError);
  assert.equal(startTriage({ isBreathing: true, respiratoryRate: 40 }).category, 'Immediate (red)');
  assert.equal(startTriage({ canWalk: true, respiratoryRate: 0 }).category, 'Minor (green)');
});

test('jumpstart-triage refuses a respiratory rate past 80 and still accepts a blank (0) rate', () => {
  assert.throws(() => jumpStartTriage({ canWalk: true, respiratoryRate: 81 }), RangeError);
  assert.equal(jumpStartTriage({ isBreathing: true, respiratoryRate: 50 }).category, 'Immediate (red)');
  assert.equal(jumpStartTriage({ canWalk: true, respiratoryRate: 0 }).category, 'Minor (green)');
});

test('naloxone refuses a weight past 500 kg and doses an in-range one', () => {
  assert.throws(() => naloxoneDose({ population: 'adult', route: 'in', weightKg: 501 }), RangeError);
  assert.equal(naloxoneDose({ population: 'adult', route: 'in', weightKg: 70 }).route, 'in');
  assert.match(naloxoneDose({ population: 'pediatric', route: 'iv', weightKg: 10 }).dose, /^1 mg/);
});

const lrLabs = { crp: 180, wbc: 26, hemoglobin: 10, sodium: 134, creatinine: 1.2, glucose: 120 };
// spec-v1763: bound widened (source in lib/bounds.js)
for (const [arg, over] of [['creatinine', 75.1], ['glucose', 3001]]) {
  test(`lrinec refuses ${arg} past its envelope and scores an in-range value`, () => {
    const bad = lrinec({ ...lrLabs, [arg]: over });
    assert.equal(bad.valid, false);
    assert.equal(bad.total, null);
    assert.equal(lrinec(lrLabs).total, 10);
  });
}

test('alt-70 refuses an age past 130 and scores an in-range one', () => {
  const bad = alt70({ asymmetry: true, wbc: 11, hr: 92, age: 131 });
  assert.equal(bad.valid, false);
  assert.equal(bad.total, null);
  assert.equal(alt70({ asymmetry: true, wbc: 11, hr: 92, age: 72 }).total, 7);
});
