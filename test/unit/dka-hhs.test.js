// spec-v88 §2.1: ADA hyperglycemic-crisis classification (DKA vs HHS) and DKA
// severity grading.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dkaHhs } from '../../lib/metabolic-onc-v88.js';

test('worked example: severe DKA (pH < 7.00)', () => {
  const r = dkaHhs({ glucose: 520, ph: 6.95, bicarbonate: 6, betaHydroxybutyrate: 6, mental: 'stupor', sodium: 130, chloride: 95 });
  assert.equal(r.valid, true);
  assert.equal(r.classification, 'DKA');
  assert.equal(r.grade, 'severe'); // pH 6.95 < 7.00 and HCO3 6 < 10
  assert.equal(r.anionGap, 29); // 130 - 95 - 6
  assert.equal(r.effOsm, 289); // 2*130 + 520/18 = 288.9 -> 289
  assert.equal(r.criteria.ketosis, true);
});

test('worked example: pure HHS (glucose > 600, eff osm > 320, pH > 7.30)', () => {
  const r = dkaHhs({ glucose: 900, ph: 7.35, bicarbonate: 22, betaHydroxybutyrate: 1, mental: 'stupor', sodium: 155, chloride: 110 });
  assert.equal(r.classification, 'HHS');
  assert.equal(r.grade, null);
  assert.equal(r.effOsm, 360); // 2*155 + 900/18 = 360
  assert.equal(r.criteria.hyperosmolar, true);
  assert.equal(r.criteria.ketosis, false);
});

test('worked example: mixed DKA/HHS picture', () => {
  const r = dkaHhs({ glucose: 700, ph: 7.10, bicarbonate: 12, betaHydroxybutyrate: 5, mental: 'drowsy', sodium: 145, chloride: 105 });
  assert.equal(r.classification, 'mixed');
  assert.equal(r.grade, 'moderate'); // pH 7.10 and HCO3 12 are both moderate
  assert.equal(r.criteria.acidosis, true);
  assert.equal(r.criteria.hyperosmolar, true);
});

test('moderate-DKA grade boundary (not hyperosmolar)', () => {
  const r = dkaHhs({ glucose: 300, ph: 7.10, bicarbonate: 12, betaHydroxybutyrate: 4, mental: 'alert', sodium: 135, chloride: 100 });
  assert.equal(r.classification, 'DKA');
  assert.equal(r.grade, 'moderate');
});

test('mild-DKA grade (pH 7.28, HCO3 16)', () => {
  const r = dkaHhs({ glucose: 280, ph: 7.28, bicarbonate: 16, betaHydroxybutyrate: 3.5, mental: 'alert' });
  assert.equal(r.classification, 'DKA');
  assert.equal(r.grade, 'mild');
  assert.equal(r.anionGap, null); // no Na/Cl
  assert.equal(r.effOsm, null); // no Na
});

test('partial input surfaces the complete-the-fields fallback', () => {
  const r = dkaHhs({ glucose: 520 });
  assert.equal(r.valid, false);
  assert.match(r.band, /glucose, pH, and bicarbonate/i);
});

test('without ketones, a strict DKA classification is withheld', () => {
  const r = dkaHhs({ glucose: 400, ph: 7.10, bicarbonate: 12, sodium: 135, chloride: 100 });
  assert.equal(r.classification, 'none');
  assert.equal(r.criteria.ketosis, null);
  assert.match(r.band, /beta-hydroxybutyrate/i);
});

test('mental status is a row of the severity table, not decoration (spec-v1069)', () => {
  // Both surfaces collect it -- a three-option picker in the browser, the same
  // enum on the agent surface -- and it reached the function as an argument
  // nothing read, so "Stupor / coma" graded a patient exactly as "Alert" did.
  const chem = { glucose: 450, ph: 7.28, bicarbonate: 16, betaHydroxybutyrate: 4, sodium: 135, chloride: 100 };
  assert.equal(dkaHhs({ ...chem, mental: 'alert' }).grade, 'mild');
  assert.equal(dkaHhs({ ...chem, mental: 'drowsy' }).grade, 'moderate');
  assert.equal(dkaHhs({ ...chem, mental: 'stupor' }).grade, 'severe');

  // Alert appears in the mild AND the moderate row of the table, so it can
  // never pull down a grade the chemistry has already earned.
  const severeChem = { glucose: 600, ph: 6.95, bicarbonate: 6, betaHydroxybutyrate: 6, sodium: 135, chloride: 100 };
  assert.equal(dkaHhs({ ...severeChem, mental: 'alert' }).grade, 'severe');

  // Omitting it entirely leaves the chemistry-only grade exactly as it was.
  assert.equal(dkaHhs(chem).grade, 'mild');
  assert.equal(dkaHhs(severeChem).grade, 'severe');
});
