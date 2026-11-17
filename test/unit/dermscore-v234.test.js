// spec-v234: worked examples for the dermatology scoring indices. Formulas
// spec-v97 verified (Kimbrough-Green 1994; Olsen 2004; Rich & Scher 2003;
// Sullivan 1990).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { masi, saltScore, napsi, vancouverScarScale } from '../../lib/dermscore-v234.js';

test('masi: weighted regional sum', () => {
  const r = masi({ fA: 4, fD: 2, fH: 2, rmrA: 3, rmrD: 2, rmrH: 1, lmrA: 3, lmrD: 2, lmrH: 1, mA: 2, mD: 1, mH: 1 });
  assert.equal(r.score, 10.6); // 4.8 + 2.7 + 2.7 + 0.4
});
test('masi: max is 48', () => {
  const r = masi({ fA: 6, fD: 4, fH: 4, rmrA: 6, rmrD: 4, rmrH: 4, lmrA: 6, lmrD: 4, lmrH: 4, mA: 6, mD: 4, mH: 4 });
  assert.equal(r.score, 48);
});

test('salt-score: S3 at 50', () => {
  const r = saltScore({ top: 50, back: 50, right: 50, left: 50 });
  assert.equal(r.score, 50);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /S3/);
});
test('salt-score: weighted', () => {
  const r = saltScore({ top: 100, back: 0, right: 0, left: 0 }); // 40
  assert.equal(r.score, 40);
  assert.match(r.band, /S2/);
});

test('napsi: matrix + bed per nail', () => {
  const r = napsi({ matrix: 3, bed: 2 });
  assert.equal(r.score, 5);
  assert.equal(r.abnormal, true);
});
test('napsi: zero is normal nail', () => {
  const r = napsi({ matrix: 0, bed: 0 });
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('vancouver-scar-scale: sum of four domains', () => {
  const r = vancouverScarScale({ pigmentation: 1, vascularity: 2, pliability: 3, height: 2 });
  assert.equal(r.score, 8);
});
test('vancouver-scar-scale: max is 13', () => {
  const r = vancouverScarScale({ pigmentation: 2, vascularity: 3, pliability: 5, height: 3 });
  assert.equal(r.score, 13);
});

// spec-v1214: `pct`/`lvl` returned 0 for a value off the scale, so an impossible
// reading scored as the most NORMAL score the instrument has.
test('salt-score: an impossible % hair loss is refused, not scored as no loss', () => {
  for (const bad of [150, -50, 101]) {
    const r = saltScore({ top: bad, back: 0, right: 0, left: 0 });
    assert.equal(r.valid, false, `${bad}% must not score`);
    assert.match(r.message, /top of the scalp must be between 0 and 100/);
    // views/group-v234.js render() prints `message`; the band carries the same
    // sentence so neither surface falls back to a generic one (spec-v1212).
    assert.equal(r.band, r.message);
  }
  // The mirror: a real 100% still scores, and scores as total loss.
  const full = saltScore({ top: 100, back: 100, right: 100, left: 100 });
  assert.equal(full.valid, true);
  assert.equal(full.score, 100);
  assert.match(full.band, /S5/);
});

test('salt-score: a blank region is asked for, not counted as 0% loss', () => {
  const r = saltScore({ back: 10, right: 10, left: 10 });
  assert.equal(r.valid, false);
  assert.match(r.message, /Enter the top of the scalp/);
});

test('the graded siblings refuse a grade off their own scale', () => {
  assert.match(vancouverScarScale({ pigmentation: 9, vascularity: 0, pliability: 0, height: 0 }).message,
    /Pigmentation must be between 0 and 2/);
  assert.match(napsi({ matrix: 7, bed: 0 }).message, /matrix quadrants involved must be between 0 and 4/);
  assert.match(masi({ fA: 99, fD: 4, fH: 4, rmrA: 6, rmrD: 4, rmrH: 4, lmrA: 6, lmrD: 4, lmrH: 4, mA: 6, mD: 4, mH: 4 }).message,
    /forehead area must be between 0 and 6/);
  // and each still scores its own maximum
  assert.equal(vancouverScarScale({ pigmentation: 2, vascularity: 3, pliability: 5, height: 3 }).score, 13);
  assert.equal(napsi({ matrix: 4, bed: 4 }).score, 8);
});

test('spec-v1755: a half-step in a MASI, NAPSI or VSS item is refused; whole values and the worked examples answer', () => {
  const ex = { fA: 4, fD: 2, fH: 2, rmrA: 3, rmrD: 2, rmrH: 1, lmrA: 3, lmrD: 2, lmrH: 1, mA: 2, mD: 1, mH: 1 };
  const m = masi({ ...ex, fA: 4.5 });
  assert.equal(m.valid, false);
  assert.match(m.message, /whole number/);
  assert.equal(masi(ex).valid, true);
  assert.equal(masi({ ...ex, fA: 5 }).valid, true);
  const n = napsi({ matrix: 3.5, bed: 2 });
  assert.equal(n.valid, false);
  assert.match(n.message, /whole number/);
  assert.equal(napsi({ matrix: 3, bed: 2 }).valid, true);
  assert.equal(napsi({ matrix: 4, bed: 2 }).score, 6);
  const v = vancouverScarScale({ pigmentation: 1.5, vascularity: 2, pliability: 3, height: 2 });
  assert.equal(v.valid, false);
  assert.match(v.message, /whole number/);
  assert.equal(vancouverScarScale({ pigmentation: 1, vascularity: 2.5, pliability: 3, height: 2 }).valid, false);
  assert.equal(vancouverScarScale({ pigmentation: 1, vascularity: 2, pliability: 3, height: 2 }).valid, true);
  assert.equal(vancouverScarScale({ pigmentation: 2, vascularity: 2, pliability: 3, height: 2 }).score, 9);
});
