// spec-v1761: a negative entry in an optional number field answered exactly as the field left blank.
// Per field: a negative is refused by name, a blank keeps its meaning, an in-range value answers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ahiOdiSeverity } from '../../lib/pulm-v114.js';
import { deltaGap } from '../../lib/critcare-severity-v200.js';
import { kdigoAki } from '../../lib/clinical-v5.js';
import { pedsWeightEst } from '../../lib/ems-v149.js';
import { phoenixSepsis } from '../../lib/peds-sepsis-v278.js';
import { toxicAlcohol } from '../../lib/tox-v86.js';

test('ahi-odi-severity: a negative ODI is refused; blank stays optional; 18 answers', () => {
  const neg = ahiOdiSeverity({ ahi: 20, odi: -5 });
  assert.equal(neg.valid, false);
  assert.match(neg.band, /oxygen desaturation index/);
  const blank = ahiOdiSeverity({ ahi: 20, odi: null });
  assert.equal(blank.valid, true);
  assert.equal(blank.odi, null);
  const ok = ahiOdiSeverity({ ahi: 20, odi: 18 });
  assert.equal(ok.valid, true);
  assert.equal(ok.odi, 18);
});

test('delta-gap: a negative normal anion gap is refused; blank keeps the default of 12; 10 answers', () => {
  const base = { na: 140, cl: 100, hco3: 10 };
  const neg = deltaGap({ ...base, normalAg: '-4' });
  assert.equal(neg.valid, false);
  assert.match(neg.message, /normal anion gap/);
  const blank = deltaGap({ ...base, normalAg: '' });
  const twelve = deltaGap({ ...base, normalAg: '12' });
  assert.equal(blank.valid, true);
  assert.equal(blank.score, twelve.score);
  const ten = deltaGap({ ...base, normalAg: '10' });
  assert.equal(ten.valid, true);
  assert.notEqual(ten.score, blank.score);
});

test('kdigo-aki: a negative anuria duration is refused; blank stays optional; 14 h answers stage 3', () => {
  const base = { baselineCr: 1.0, currentCr: 1.1, uoMlPerKgPerHour: 1, uoDurationHours: 6 };
  assert.throws(() => kdigoAki({ ...base, anuriaHours: -3 }), (e) => e instanceof RangeError && /anuria duration/.test(e.message));
  const blank = kdigoAki({ ...base, anuriaHours: null });
  assert.equal(blank.stage, 0);
  const ok = kdigoAki({ ...base, anuriaHours: 14 });
  assert.equal(ok.stage, 3);
});

test('peds-weight-est: a negative age in months is refused; blank falls back to years; 6 months answers', () => {
  const neg = pedsWeightEst({ months: -6, years: 4 });
  assert.equal(neg.valid, false);
  assert.match(neg.band, /age in months/);
  const blank = pedsWeightEst({ months: null, years: 4 });
  assert.equal(blank.valid, true);
  assert.equal(blank.kg, 16);
  const ok = pedsWeightEst({ months: 6 });
  assert.equal(ok.valid, true);
  assert.equal(ok.kg, 7);
});

test('phoenix-sepsis: a negative D-dimer or fibrinogen is refused; blank stays not measured; values answer', () => {
  const base = { ageMonths: 60, platelets: 250 };
  const negD = phoenixSepsis({ ...base, ddimer: '-1' });
  assert.equal(negD.valid, false);
  assert.match(negD.message, /D-dimer/);
  const negF = phoenixSepsis({ ...base, fibrinogen: '-50' });
  assert.equal(negF.valid, false);
  assert.match(negF.message, /fibrinogen/);
  const blank = phoenixSepsis({ ...base, ddimer: '', fibrinogen: '' });
  assert.equal(blank.valid, true);
  const ok = phoenixSepsis({ ...base, ddimer: '3', fibrinogen: '80' });
  assert.equal(ok.valid, true);
  assert.ok(ok.score > blank.score);
});

test('toxic-alcohol: a negative documented level is refused; blank stays optional; 25 answers', () => {
  const base = { measuredOsm: 290, sodium: 140, glucose: 90, bun: 14 };
  const neg = toxicAlcohol({ ...base, knownLevel: -25 });
  assert.equal(neg.valid, false);
  assert.match(neg.band, /methanol \/ ethylene-glycol level/);
  const blank = toxicAlcohol({ ...base, knownLevel: null });
  assert.notEqual(blank.valid, false);
  assert.equal(blank.indicated, false);
  const ok = toxicAlcohol({ ...base, knownLevel: 25 });
  assert.equal(ok.indicated, true);
});

test('delta-gap and peds-weight-est: an entered value outside the range they read is refused, not replaced', async () => {
  const { deltaGap } = await import('../../lib/critcare-severity-v200.js');
  const { pedsWeightEst } = await import('../../lib/ems-v149.js');
  const base = { na: 140, cl: 100, hco3: 14 };
  assert.equal(deltaGap({ ...base, normalAg: 25 }).valid, false);
  assert.equal(deltaGap({ ...base, normalHco3: 40 }).valid, false);
  assert.notEqual(deltaGap({ ...base, normalAg: 10 }).valid, false);
  assert.equal(pedsWeightEst({ months: 18 }).valid, false);
  assert.notEqual(pedsWeightEst({ months: 6 }).valid, false);
});
