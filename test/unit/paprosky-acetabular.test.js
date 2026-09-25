// spec-v1418: Paprosky acetabular bone loss, derived from the radiograph (Telleria & Gee 2013, Table 1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paproskyAcetabular as pap } from '../../lib/paprosky-acetabular-v1418.js';

test('every Table 1 row derives its own type and is concordant', () => {
  const rows = [
    ['1', { migration: 'none', kohler: 'intact', teardrop: 'intact', ischium: 'intact' }],
    ['2A', { migration: 'lt', direction: 'superior', kohler: 'intact', teardrop: 'intact', ischium: 'intact' }],
    ['2B', { migration: 'lt', direction: 'superolateral', kohler: 'intact', teardrop: 'intact', ischium: 'intact' }],
    ['2C', { migration: 'lt', direction: 'medial', kohler: 'disrupted', teardrop: 'moderate', ischium: 'intact' }],
    ['3A', { migration: 'gt', direction: 'superolateral', kohler: 'intact', teardrop: 'moderate', ischium: 'moderate' }],
    ['3B', { migration: 'gt', direction: 'superior', kohler: 'disrupted', teardrop: 'severe', ischium: 'severe' }],
  ];
  for (const [type, input] of rows) {
    const r = pap(input);
    assert.equal(r.type, type, type);
    assert.equal(r.concordant, true, type);
  }
});

test('grade 3 subtype turns on the Kohler line', () => {
  assert.equal(pap({ migration: 'gt', kohler: 'intact' }).type, '3A');
  assert.equal(pap({ migration: 'gt', kohler: 'disrupted' }).type, '3B');
});

test('a disrupted Kohler line under 2 cm is 2C whatever the direction, and says the direction disagrees', () => {
  const r = pap({ migration: 'lt', direction: 'superior', kohler: 'disrupted' });
  assert.equal(r.type, '2C');
  assert.equal(r.concordant, false);
  assert.match(r.notes[0], /2C migrates medially/);
});

test('findings that disagree with the row are reported, not hidden', () => {
  const r = pap({ migration: 'none', kohler: 'intact', ischium: 'severe' });
  assert.equal(r.type, '1');
  assert.equal(r.concordant, false);
  assert.match(r.notes[0], /ischium shows severe lysis \(the table has intact\)/);
});

test('type 3 raises pelvic discontinuity; every answer carries the reliability caveat', () => {
  assert.ok(pap({ migration: 'gt', kohler: 'intact' }).notes.some((n) => /pelvic discontinuity/.test(n)));
  assert.ok(!pap({ migration: 'none', kohler: 'intact' }).notes.some((n) => /pelvic discontinuity/.test(n)));
  assert.ok(pap({ migration: 'none', kohler: 'intact' }).notes.some((n) => /0\.02 to 0\.79/.test(n)));
});

test('missing required findings are asked for', () => {
  assert.equal(pap({}).valid, false);
  assert.match(pap({ migration: 'lt' }).message, /Kohler/);
  assert.match(pap({ migration: 'lt', kohler: 'intact' }).message, /direction/);
  assert.equal(pap({ migration: 'gt', kohler: 'intact' }).valid, true);
});
