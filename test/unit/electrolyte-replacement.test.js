import { test } from 'node:test';
import assert from 'node:assert/strict';
import { electrolyteReplacement } from '../../lib/scoring-v4.js';

test('K within range (>=3.5) -> 0 mEq', () => {
  const r = electrolyteReplacement({ electrolyte: 'k', level: 3.8, route: 'iv' });
  assert.ok(r.dose.startsWith('0 mEq'));
});

test('K 3.0-3.4 -> 40 mEq', () => {
  const r = electrolyteReplacement({ electrolyte: 'k', level: 3.2, route: 'iv' });
  assert.equal(r.dose, '40 mEq');
});

test('K 2.5-2.9 -> 60 mEq', () => {
  const r = electrolyteReplacement({ electrolyte: 'k', level: 2.8, route: 'iv' });
  assert.equal(r.dose, '60 mEq');
});

test('K <2.5 -> 80 mEq', () => {
  const r = electrolyteReplacement({ electrolyte: 'k', level: 2.2, route: 'iv' });
  assert.equal(r.dose, '80 mEq');
});

test('Mg <1.0 -> 4 g MgSO4', () => {
  const r = electrolyteReplacement({ electrolyte: 'mg', level: 0.9, route: 'iv' });
  assert.equal(r.dose, '4 g MgSO4');
});

test('Mg 1.0-1.7 -> 2 g MgSO4', () => {
  const r = electrolyteReplacement({ electrolyte: 'mg', level: 1.4, route: 'iv' });
  assert.equal(r.dose, '2 g MgSO4');
});

// Brown 2006 (PubMed 16639067), read October 9, 2026: 0.73-0.96 mmol/L (2.3-3.0 mg/dL) 0.32 mmol/kg; 0.51-0.72
// (1.6-2.2 mg/dL) 0.64; 0.5 or below (1.5 mg/dL or below) 1 mmol/kg; at 7.5 mmol/hour. The tile gave half or less.
test('phosphate follows Brown 2006 in every band, at 7.5 mmol/hour', () => {
  const dose = (level) => electrolyteReplacement({ electrolyte: 'phos', level, route: 'iv' });
  assert.equal(dose(3.1).dose, '0 mmol/kg (within range)');
  assert.equal(dose(3.0).dose, '0.32 mmol/kg');
  assert.equal(dose(2.3).dose, '0.32 mmol/kg');
  assert.equal(dose(2.2).dose, '0.64 mmol/kg');
  assert.equal(dose(1.6).dose, '0.64 mmol/kg');
  assert.equal(dose(1.5).dose, '1 mmol/kg');
  assert.equal(dose(0.8).dose, '1 mmol/kg');
  assert.equal(dose(1.8).rate, 'IV at 7.5 mmol/hour per Brown 2006');
});

test('potassium and magnesium ladders are labeled as conventions, with no unsupported attribution', () => {
  for (const args of [{ electrolyte: 'k', level: 2.8, route: 'iv' }, { electrolyte: 'mg', level: 1.2, route: 'iv' }]) {
    const r = electrolyteReplacement(args);
    const text = [r.rate, ...r.banners].join(' ');
    assert.match(text, /common institutional convention, not a published guideline/);
    assert.doesNotMatch(text, /ASHP 2019|Hebert 2008/);
  }
});

test('Renal-impairment flag adds dose-halving banner', () => {
  const r = electrolyteReplacement({ electrolyte: 'k', level: 2.8, route: 'iv', renalImpaired: true });
  assert.ok(r.banners.some((b) => b.includes('Renal impairment')));
});

test('Rejects unknown electrolyte or route', () => {
  assert.throws(() => electrolyteReplacement({ electrolyte: 'na', level: 130 }));
  assert.throws(() => electrolyteReplacement({ electrolyte: 'k', level: 3.0, route: 'im' }));
});

// spec-v1641 row 16: the Potassium Phosphates label row for the level sits beside the Brown 2006 dose.
test('phosphate: the label band, single-dose and rate maximums, and the renal contraindication', async () => {
  const { phosphateLabelRows } = await import('../../lib/scoring-v4.js');
  const row = (level) => phosphateLabelRows(level)[0];
  assert.match(row(0.9), /under 1 mg\/dL, 0\.44 to 0\.64 mmol\/kg/);
  assert.match(row(1), /1 to 1\.7 mg\/dL, 0\.32 to 0\.43 mmol\/kg/);
  assert.match(row(1.7), /1 to 1\.7 mg\/dL/);
  assert.match(row(1.8), /1\.8 mg\/dL to the lower end of the reference range, 0\.16 to 0\.31 mmol\/kg/);
  assert.match(row(2.5), /0\.16 to 0\.31 mmol\/kg/);
  assert.match(row(2.6), /no dose is given at this level/);
  assert.match(row(1.5), /never over 45 mmol of phosphorus \(potassium 66 mEq\) as a single dose/);
  const r = electrolyteReplacement({ electrolyte: 'phos', level: 1.5, route: 'iv' });
  assert.equal(r.dose, '1 mmol/kg'); // Brown 2006, unchanged
  const text = r.banners.join(' ');
  assert.match(text, /Brown 2006 dose above is higher than this label range/);
  assert.match(text, /6\.8 mmol\/hour \(potassium 10 mEq\/hour\) by peripheral catheter, 15 mmol\/hour/);
  assert.match(text, /contraindicates potassium phosphates in severe renal impairment/);
  const renal = electrolyteReplacement({ electrolyte: 'phos', level: 1.5, route: 'iv', renalImpaired: true }).banners.join(' ');
  assert.match(renal, /start at the low end of the dose range/);
  // The label is an IV product: an oral plan carries no label rows.
  assert.deepEqual(electrolyteReplacement({ electrolyte: 'phos', level: 1.5, route: 'po' }).labelRows, []);
  // Potassium and magnesium are untouched.
  assert.equal(electrolyteReplacement({ electrolyte: 'k', level: 3.2, route: 'iv' }).labelRows, undefined);
});
