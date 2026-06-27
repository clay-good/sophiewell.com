// spec-v158 2.5: E/e′ filling-pressure estimate. The e′ division is guarded.
// Average uses the <9 / 9-14 / >14 bands; single-site uses septal >15 / lateral >13.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mitralEePrime } from '../../lib/echo-v158.js';

test('tile example: average E/e′ 15 -> elevated filling pressure', () => {
  // 90 / 6 = 15.0 ; average band > 14 -> elevated
  const r = mitralEePrime({ e: 90, ePrime: 6, site: 'average' });
  assert.equal(r.valid, true);
  assert.equal(r.ratio, 15);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /elevated/);
});

test('average E/e′ 14/15 elevated boundary', () => {
  const at14 = mitralEePrime({ e: 84, ePrime: 6, site: 'average' }); // 14.0 -> indeterminate
  assert.equal(at14.ratio, 14);
  assert.equal(at14.abnormal, false);
  assert.match(at14.band, /indeterminate/);
  const at15 = mitralEePrime({ e: 90, ePrime: 6, site: 'average' }); // 15 -> elevated
  assert.equal(at15.abnormal, true);
});

test('average < 9 is normal filling pressure', () => {
  const r = mitralEePrime({ e: 64, ePrime: 8, site: 'average' }); // 8.0
  assert.equal(r.ratio, 8);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /normal filling pressure/);
});

test('single-site cutoffs: septal >15, lateral >13', () => {
  assert.equal(mitralEePrime({ e: 96, ePrime: 6, site: 'septal' }).abnormal, true); // 16 > 15
  assert.equal(mitralEePrime({ e: 90, ePrime: 6, site: 'septal' }).abnormal, false); // 15, not > 15
  assert.equal(mitralEePrime({ e: 84, ePrime: 6, site: 'lateral' }).abnormal, true); // 14 > 13
  assert.equal(mitralEePrime({ e: 78, ePrime: 6, site: 'lateral' }).abnormal, false); // 13, not > 13
});

test('guards: e′ > 0; blanks and missing site fall back', () => {
  assert.equal(mitralEePrime({ e: 90, ePrime: 0, site: 'average' }).valid, false);
  assert.equal(mitralEePrime({ e: 90, ePrime: 6 }).valid, false); // no site
  assert.equal(mitralEePrime({}).valid, false);
});
