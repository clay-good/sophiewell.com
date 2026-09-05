import test from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { migraineIchd3 } from '../../lib/migraine-ichd3-v815.js';

const noAuraCore = {
  attackCount: 6, headacheHours: 12,
  unilateral: true, pulsating: true,
  noBetterExplanation: true,
};
const auraCore = {
  attackCount: 2, auraVisual: true,
  auraSpreadsGradually: true, auraInSuccession: true, auraLasts5to60: true,
  noBetterExplanation: true,
};

test('migraine: 1.1 without aura is met on nausea', () => {
  const r = migraineIchd3({ ...noAuraCore, nauseaVomiting: true });
  assert.equal(r.withoutAuraMet, true);
  assert.deepEqual(r.diagnoses, ['1.1 Migraine without aura']);
});

test('migraine: photophobia and phonophobia satisfy criterion D only TOGETHER', () => {
  // The misreading this tile exists to catch. Each alone leaves D unmet.
  const photoOnly = migraineIchd3({ ...noAuraCore, photophobia: true });
  assert.equal(photoOnly.withoutAura.d, false);
  assert.equal(photoOnly.withoutAuraMet, false);
  assert.ok(photoOnly.phobiaNote.includes('does not satisfy'));

  const phonoOnly = migraineIchd3({ ...noAuraCore, phonophobia: true });
  assert.equal(phonoOnly.withoutAura.d, false);

  const both = migraineIchd3({ ...noAuraCore, photophobia: true, phonophobia: true });
  assert.equal(both.withoutAura.d, true);
  assert.equal(both.withoutAuraMet, true);
  assert.equal(both.phobiaNote, null);
});

test('migraine: the attack thresholds DIFFER between the two sets', () => {
  // 5 for 1.1, 2 for 1.2. Carrying 5 across would deny 1.2 to patients who meet it.
  const three = migraineIchd3({ ...auraCore, attackCount: 3 });
  assert.equal(three.withAura.a, true);
  assert.equal(three.withAuraMet, true);
  assert.equal(three.withoutAura.a, false);
  assert.ok(three.thresholdNote.includes('thresholds differ'));

  assert.equal(migraineIchd3({ ...auraCore, attackCount: 1 }).withAura.a, false);
  assert.equal(migraineIchd3({ ...noAuraCore, nauseaVomiting: true, attackCount: 4 }).withoutAura.a, false);
});

test('migraine: 1.1 needs at least TWO of the four headache characteristics', () => {
  const one = migraineIchd3({ ...noAuraCore, nauseaVomiting: true, pulsating: false });
  assert.equal(one.headacheFeatureCount, 1);
  assert.equal(one.withoutAura.c, false);
  const two = migraineIchd3({ ...noAuraCore, nauseaVomiting: true });
  assert.equal(two.headacheFeatureCount, 2);
  assert.equal(two.withoutAura.c, true);
});

test('migraine: 1.2 needs at least THREE of the six aura characteristics', () => {
  const two = migraineIchd3({ ...auraCore, auraLasts5to60: false });
  assert.equal(two.auraFeatureCount, 2);
  assert.equal(two.withAura.c, false);
  assert.equal(migraineIchd3(auraCore).withAura.c, true);
});

test('migraine: 1.2 needs at least one reversible aura symptom type', () => {
  const none = migraineIchd3({ ...auraCore, auraVisual: false });
  assert.equal(none.withAura.b, false);
  assert.equal(none.withAuraMet, false);
});

test('migraine: the 4 to 72 hour bounds are inclusive', () => {
  const at = (h) => migraineIchd3({ ...noAuraCore, nauseaVomiting: true, headacheHours: h }).withoutAura.b;
  assert.equal(at(3), false);
  assert.equal(at(4), true);
  assert.equal(at(72), true);
  assert.equal(at(73), false);
});

test('migraine: both sets are reported when both are met', () => {
  const r = migraineIchd3({ ...noAuraCore, ...auraCore, attackCount: 6, nauseaVomiting: true });
  assert.equal(r.withoutAuraMet, true);
  assert.equal(r.withAuraMet, true);
  assert.equal(r.diagnoses.length, 2);
  assert.ok(r.band.includes('1.1'));
  assert.ok(r.band.includes('1.2'));
});

test('migraine: empty and invalid input', () => {
  const empty = migraineIchd3({});
  assert.equal(empty.valid, true);
  assert.equal(empty.criteriaMet, false);
  assert.equal(empty.phobiaNote, null);
  assert.equal(empty.thresholdNote, null);
  assert.equal(migraineIchd3({ attackCount: -1 }).valid, false);
  assert.equal(migraineIchd3({ headacheHours: -1 }).valid, false);
  assert.equal(migraineIchd3().valid, true);
});

// spec-v1076: not met, or not measured -- the third state, on the ICHD-3 family.
//
// `attacks === null` and `attacks < 5` both made criterion A unmet, and the tile
// printed the same sentence for each under the verdict "Neither ICHD-3 migraine
// criteria set is met". A blank attack count therefore ruled migraine OUT in the
// same words as a patient who has genuinely had three attacks.
test('spec-v1076: a blank attack count does not rule migraine out', () => {
  const base = {
    headacheHours: '24', unilateral: true, pulsating: true, severity: true,
    activity: true, nauseaVomiting: true, noBetterExplanation: true,
  };
  const blank = migraineIchd3({ ...base, attackCount: '' });
  const short = migraineIchd3({ ...base, attackCount: '3' });
  const meets = migraineIchd3({ ...base, attackCount: '5' });

  // Three states, three readings.
  assert.equal(meets.criteriaMet, true);
  assert.deepEqual(meets.notEntered, []);

  assert.deepEqual(short.notEntered, [], 'a count that was entered is not outstanding');
  assert.match(short.band, /Neither ICHD-3 migraine criteria set is met/);

  assert.deepEqual(blank.notEntered, ['the number of attacks']);
  // Asserted against the shared vocabulary, not a phrase: what matters is that
  // the reading ASKS, which is what the empty-form sweep next door recognises.
  assert.ok(ASKING.test(blank.band), `blank reading does not ask: ${blank.band}`);
  assert.match(blank.band, /cannot be ruled out|can be ruled out/);
  assert.notEqual(blank.band, short.band, 'not measured must not read as not met');
});
