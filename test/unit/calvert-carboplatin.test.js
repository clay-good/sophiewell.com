// spec-v88 §2.2: Calvert-formula carboplatin dose with the FDA GFR cap.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calvertCarboplatin } from '../../lib/metabolic-onc-v88.js';

test('worked example: AUC 5, GFR 90, no cap needed -> 575 mg', () => {
  const r = calvertCarboplatin({ targetAuc: 5, gfr: 90, capGfr: 'on' });
  assert.equal(r.valid, true);
  assert.equal(r.dose, 575); // 5 * (90 + 25)
  assert.equal(r.gfrUsed, 90);
  assert.equal(r.wasCapped, false);
});

test('GFR > 125 with cap on is computed at 125, substitution flagged', () => {
  const r = calvertCarboplatin({ targetAuc: 6, gfr: 140, capGfr: 'on' });
  assert.equal(r.dose, 900); // 6 * (125 + 25), NOT 6 * 165 = 990
  assert.equal(r.gfrUsed, 125);
  assert.equal(r.gfrEntered, 140);
  assert.equal(r.wasCapped, true);
  assert.match(r.band, /capped at 125/i);
});

test('cap off uses the entered GFR (measured) -> the uncapped dose', () => {
  const r = calvertCarboplatin({ targetAuc: 6, gfr: 140, capGfr: 'off' });
  assert.equal(r.dose, 990); // 6 * (140 + 25)
  assert.equal(r.wasCapped, false);
});

test('GFR exactly 125 is not capped (cap is for > 125)', () => {
  const r = calvertCarboplatin({ targetAuc: 5, gfr: 125, capGfr: 'on' });
  assert.equal(r.gfrUsed, 125);
  assert.equal(r.wasCapped, false);
  assert.equal(r.dose, 750); // 5 * 150
});

test('blank or zero GFR/AUC surfaces a guarded fallback, never NaN', () => {
  assert.equal(calvertCarboplatin({ targetAuc: 5 }).valid, false);
  assert.equal(calvertCarboplatin({ gfr: 90 }).valid, false);
  assert.equal(calvertCarboplatin({ targetAuc: 5, gfr: 0 }).valid, false);
  assert.equal(calvertCarboplatin({}).valid, false);
});

// spec-v1641 row 14: the cap is FDA's October 8, 2010 communication, linked, not a bare "FDA (2010)".
test('the 125 mL/min cap names and links the FDA communication', async () => {
  const { META } = await import('../../lib/meta.js');
  const m = META['calvert-carboplatin'];
  assert.match(m.citation, /FDA, Carboplatin dosing \(communication of October 8, 2010\)/);
  assert.doesNotMatch(m.citation, /\(2010\)/);
  assert.ok(m.citationUrls.some((u) => /FDA 2010/.test(u.label) && /fda\.gov\/.*ucm228974/.test(u.url)));
  const r = calvertCarboplatin({ targetAuc: 6, gfr: 140, capGfr: 'on' });
  assert.match(r.band, /FDA, October 2010/);
  assert.match(r.note, /October 8, 2010/);
  assert.match(r.note, /label carries no cap/);
});
