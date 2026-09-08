// spec-v126 2.3: SES-CD (Daperno 2004). 4 vars x 0-3 x 5 segments; stenosis
// capped at 11; max 56.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sesCd } from '../../lib/gi-v126.js';

test('worked example -> 12, moderate', () => {
  const r = sesCd({ ulcerSize: [2, 1, 0, 0, 0], ulceratedSurface: [2, 1, 0, 0, 0], affectedSurface: [3, 2, 0, 0, 0], stenosis: [1, 0, 0, 0, 0] });
  assert.equal(r.total, 12);
  assert.match(r.band, /moderate/);
});

test('stenosis sub-total capped at 11 (not 15)', () => {
  const r = sesCd({ stenosis: [3, 3, 3, 3, 3] });
  assert.equal(r.total, 11);
  assert.equal(r.stenosisCapped, true);
});

test('true maximum is 56', () => {
  const all3 = [3, 3, 3, 3, 3];
  const r = sesCd({ ulcerSize: all3, ulceratedSurface: all3, affectedSurface: all3, stenosis: all3 });
  assert.equal(r.total, 56);
});

test('remission band 0-2', () => {
  const r = sesCd({ ulcerSize: [1, 0, 0, 0, 0] });
  assert.equal(r.total, 1);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /remission/);
});

test('scalar / empty fuzz arg -> 0, never NaN', () => {
  assert.equal(sesCd(9).total, 0);
  assert.equal(sesCd({}).total, 0);
});

test('spec-v1114: only SEVERE is the ceiling, so a partial "moderate" is footed', () => {
  // spec-v1111 exempted every reading with `abnormal` true, which is moderate
  // AND severe. Moderate is not the top: 9 of 56 over five cells could be 20
  // once the other fifteen are read, which is severe.
  const partial = sesCd({ ulcerSize: [3, 3, 3, 0, 0] });
  assert.equal(partial.floorOnly, true);
  assert.match(partial.band, /SES-CD at least 9\/56/);
  assert.doesNotMatch(partial.band, /endoscopic moderate \(/);

  // Severe cannot be raised out of, so it stands as it is.
  const severe = sesCd({ ulcerSize: [3, 3, 3, 3, 3], ulceratedSurface: [3, 0, 0, 0, 0] });
  assert.equal(severe.floorOnly, false);
  assert.match(severe.band, /endoscopic severe/);
});
