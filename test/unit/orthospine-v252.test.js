// spec-v252: worked examples for the orthopedic / spine radiographic ratios.
// Ratios/scores spec-v97 verified (Insall & Salvati 1971; Pavlov & Torg 1987;
// Meyerding 1932; Beighton 1973).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { insallSalvati, torgPavlov, meyerdingSpondylolisthesis, beightonHypermobility } from '../../lib/orthospine-v252.js';

test('insall-salvati: patella alta', () => {
  const r = insallSalvati({ tendon: 5.0, patella: 4.0 });
  assert.equal(r.score, 1.25);
  assert.match(r.band, /alta/);
});
test('insall-salvati: normal range', () => {
  const r = insallSalvati({ tendon: 4.0, patella: 4.0 });
  assert.equal(r.score, 1);
  assert.equal(r.abnormal, false);
});

test('torg-pavlov: <= 0.8 stenosis', () => {
  const r = torgPavlov({ canal: 12, body: 17 });
  assert.equal(r.score, 0.71);
  assert.equal(r.abnormal, true);
});

test('meyerding: grade II', () => {
  const r = meyerdingSpondylolisthesis({ displacement: 14, width: 40 }); // 35%
  assert.equal(r.score, 2);
  assert.match(r.band, /II/);
});
test('meyerding: grade I low-grade', () => {
  const r = meyerdingSpondylolisthesis({ displacement: 8, width: 40 }); // 20%
  assert.equal(r.score, 1);
  assert.equal(r.abnormal, false);
});

test('beighton: >= 5 hypermobile', () => {
  const r = beightonHypermobility({ finger5R: true, finger5L: true, thumbR: true, thumbL: true, elbowR: true });
  assert.equal(r.score, 5);
  assert.equal(r.abnormal, true);
});
test('beighton: below threshold', () => {
  const r = beightonHypermobility({ finger5R: true, thumbR: true });
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, false);
});
