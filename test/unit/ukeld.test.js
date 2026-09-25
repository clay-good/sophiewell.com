// spec-v1438: UKELD = 5.395 ln(INR) + 1.485 ln(Cr umol/L) + 3.13 ln(bili umol/L) - 81.565 ln(Na) + 435.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ukeld } from '../../lib/ukeld-v1438.js';

test('the formula in umol/L from mg/dL inputs (88.4 and 17.1)', () => {
  // INR 1, Cr 0.8 mg/dL (70.72), bili 1 mg/dL (17.1), Na 140 -> 47.15
  assert.equal(ukeld({ inr: 1, creatinineMgDl: 0.8, bilirubinMgDl: 1, sodium: 140 }).score, 47);
  // INR 1.5, Cr 1.2 (106.08), bili 3.5 (59.85), Na 132 -> 58.84
  assert.equal(ukeld({ inr: 1.5, creatinineMgDl: 1.2, bilirubinMgDl: 3.5, sodium: 132 }).score, 59);
});

test('49 is the listing line, compared as a whole number', () => {
  const lo = ukeld({ inr: 1, creatinineMgDl: 0.8, bilirubinMgDl: 1, sodium: 140 });
  assert.equal(lo.abnormal, false);
  assert.match(lo.band, /below 49/);
  const hi = ukeld({ inr: 1.5, creatinineMgDl: 1.2, bilirubinMgDl: 3.5, sodium: 132 });
  assert.equal(hi.abnormal, true);
  assert.match(hi.band, /at or above 49/);
});

test('a low score does not rule out listing, and the umol/L values are shown', () => {
  const r = ukeld({ inr: 1, creatinineMgDl: 0.8, bilirubinMgDl: 1, sodium: 140 });
  assert.ok(r.notes.some((n) => /does not rule out listing/.test(n)));
  assert.ok(r.notes.some((n) => /creatinine 71 umol\/L and bilirubin 17 umol\/L/.test(n)));
});

test('missing and impossible values are refused', () => {
  assert.match(ukeld({}).message, /Enter the INR, the serum creatinine, the total bilirubin, the serum sodium/);
  assert.equal(ukeld({ inr: 1, creatinineMgDl: 0.8, bilirubinMgDl: 1, sodium: 400 }).valid, false);
  assert.equal(ukeld({ inr: 1, creatinineMgDl: 0.8, bilirubinMgDl: 0, sodium: 140 }).valid, false);
  assert.equal(ukeld({ inr: 'x', creatinineMgDl: 0.8, bilirubinMgDl: 1, sodium: 140 }).valid, false);
});
