import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hellp } from '../../lib/scoring-v4.js';

test('hellp 0 criteria (tile example) -> no HELLP criteria met', () => {
  const r = hellp({});
  assert.equal(r.criteriaMet, 0);
  assert.equal(r.complete, false);
  assert.equal(r.partial, false);
  assert.match(r.band, /no HELLP criteria met/);
});

test('hellp 1 criterion (AST) -> partial HELLP', () => {
  const r = hellp({ astGte70: true });
  assert.equal(r.criteriaMet, 1);
  assert.equal(r.partial, true);
  assert.match(r.band, /partial HELLP \(1 of 3 criteria\)/);
});

test('hellp 2 criteria -> partial HELLP', () => {
  const r = hellp({ hemolysis: true, plateletsLt100: true });
  assert.equal(r.criteriaMet, 2);
  assert.equal(r.partial, true);
});

test('hellp 3 criteria (all) -> complete HELLP', () => {
  const r = hellp({ hemolysis: true, astGte70: true, plateletsLt100: true });
  assert.equal(r.criteriaMet, 3);
  assert.equal(r.complete, true);
  assert.match(r.band, /complete HELLP/);
});

test('hellp Mississippi class 1 (nadir 40) -> class 1', () => {
  const r = hellp({ hemolysis: true, astGte70: true, plateletsLt100: true, plateletNadirThousands: 40 });
  assert.equal(r.mississippiClass, 1);
  assert.match(r.band, /Mississippi class 1/);
});

test('hellp Mississippi class 2 (nadir 75)', () => {
  const r = hellp({ hemolysis: true, astGte70: true, plateletsLt100: true, plateletNadirThousands: 75 });
  assert.equal(r.mississippiClass, 2);
});

test('hellp Mississippi class 3 (nadir 120)', () => {
  const r = hellp({ hemolysis: true, astGte70: true, plateletsLt100: true, plateletNadirThousands: 120 });
  assert.equal(r.mississippiClass, 3);
});

test('hellp Mississippi class null for nadir > 150', () => {
  const r = hellp({ hemolysis: true, plateletNadirThousands: 200 });
  assert.equal(r.mississippiClass, null);
});

test('hellp Mississippi class not surfaced when nadir blank', () => {
  const r = hellp({ hemolysis: true, plateletNadirThousands: '' });
  assert.equal(r.mississippiClass, null);
  assert.doesNotMatch(r.band, /Mississippi/);
});
