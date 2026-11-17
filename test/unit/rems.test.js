// spec-v207 2.5: REMS worked examples. Abbreviated-APACHE-II bands: age 0-6,
// MAP/HR/RR/SpO2/GCS each 0-4; total 0-26; low <6, medium 6-13, high >13. Bands
// from the APACHE-II acute-physiology standard, validated by the >=3-source max-26
// structure (spec-v97).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rems } from '../../lib/resus-trauma-v207.js';

test('high-risk worked example (REMS 14)', () => {
  const r = rems({ age: 80, map: 60, hr: 130, rr: 30, spo2: 88, gcs: 10 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 14); // 6 + 2 + 2 + 1 + 1 + 2
  assert.equal(r.abnormal, true);
  assert.match(r.band, /high-risk/);
});

test('low-risk case (REMS 2)', () => {
  const r = rems({ age: 50, map: 90, hr: 80, rr: 18, spo2: 97, gcs: 15 });
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, false);
});

test('all-normal vitals in a young patient -> 0', () => {
  const r = rems({ age: 30, map: 90, hr: 80, rr: 18, spo2: 98, gcs: 15 });
  assert.equal(r.score, 0);
});

test('maximum score 26', () => {
  const r = rems({ age: 80, map: 45, hr: 190, rr: 55, spo2: 70, gcs: 4 });
  assert.equal(r.score, 26); // 6 + 4 + 4 + 4 + 4 + 4
});

test('MAP band is symmetric (low and high MAP both score)', () => {
  const base = { age: 30, hr: 80, rr: 18, spo2: 98, gcs: 15 };
  assert.equal(rems({ ...base, map: 45 }).score, 4);
  assert.equal(rems({ ...base, map: 90 }).score, 0);
  assert.equal(rems({ ...base, map: 165 }).score, 4);
});

test('incomplete inputs -> complete-the-fields', () => {
  const r = rems({ age: 80, map: 60 });
  assert.equal(r.valid, false);
});

// spec-v1753: the envelope lib/bounds.js declares; 1.5 times its ceiling was answered, ten times was refused.
test('spec-v1753: a respiratory rate past the 80/min envelope is refused', () => {
  const ex = { age: 80, map: 60, hr: 130, rr: 30, spo2: 88, gcs: 10 };
  const past = rems({ ...ex, rr: 120 });
  assert.equal(past.valid, false);
  assert.match(past.message, /respiratory rate/);
  assert.equal(rems({ ...ex, rr: 80 }).valid, true);
  assert.equal(rems(ex).score, 14);
});

// spec-v1754: the Glasgow Coma Scale total takes whole steps 3 to 15. A GCS of
// 12.5 was scored from wherever it fell between the cutoffs; it is refused now.
test('spec-v1754: a fractional GCS is refused; GCS 3, 15 and the worked example answer', () => {
  const EX_V1754 = { age: 80, map: 60, hr: 130, rr: 30, spo2: 88, gcs: 10 };
  const said = (gcs) => {
    try {
      const r = rems({ ...EX_V1754, gcs });
      return r && r.valid === false ? `refused: ${r.message || r.band}` : 'answered';
    } catch (e) { return `refused: ${e.message}`; }
  };
  assert.match(said(12.5), /^refused: .*Glasgow Coma Scale must be a whole number/);
  assert.equal(said(3), 'answered');
  assert.equal(said(15), 'answered');
  assert.equal(said(EX_V1754.gcs), 'answered');
});
