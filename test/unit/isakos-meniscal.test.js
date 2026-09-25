// spec-v1426: ISAKOS meniscal tear record (Anderson 2011; Sayegh & Matzkin 2022).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isakosMeniscal as isk } from '../../lib/isakos-meniscal-v1426.js';

const MEDIAL = { meniscus: 'medial', depth: 'complete', rim: 'z3', radial: 'posterior-middle', pattern: 'vertical-flap', tissue: 'degenerative' };

test('the review\'s Fig. 2 medial example reads back as the standard sentence', () => {
  const r = isk(MEDIAL);
  assert.equal(r.valid, true);
  assert.equal(r.band, 'ISAKOS: Complete tear of the medial meniscus, rim width zone 3 (5 mm or more), the posterior and middle thirds, vertical flap pattern, degenerative tissue.');
  assert.equal(r.bandLabel, 'Zone 3, vertical flap');
});

test('the review\'s Fig. 2 lateral example carries the popliteal hiatus', () => {
  const r = isk({ meniscus: 'lateral', depth: 'complete', rim: 'z1', radial: 'middle', hiatus: 'not-central', pattern: 'radial', tissue: 'nondegenerative' });
  assert.equal(r.band, 'ISAKOS: Complete tear of the lateral meniscus, rim width zone 1 (under 3 mm), the middle third, not central to the popliteal hiatus, radial pattern, nondegenerative tissue.');
});

test('rim width sets the Cooper zone at the published cutoffs', () => {
  assert.equal(isk({ ...MEDIAL, rim: 'z1' }).zone, 1);
  assert.equal(isk({ ...MEDIAL, rim: 'z2' }).zone, 2);
  assert.match(isk({ ...MEDIAL, rim: 'z2' }).band, /zone 2 \(3 mm to under 5 mm\)/);
  assert.equal(isk({ ...MEDIAL, rim: 'z3' }).zone, 3);
});

test('a hiatus entered for a medial tear is left out and said so', () => {
  const r = isk({ ...MEDIAL, hiatus: 'central' });
  assert.doesNotMatch(r.band, /hiatus/);
  assert.ok(r.notes.some((n) => /only for lateral/.test(n)));
});

test('a complex pattern in nondegenerative tissue is flagged, not changed', () => {
  const r = isk({ ...MEDIAL, pattern: 'complex', tissue: 'nondegenerative' });
  assert.match(r.band, /complex pattern, nondegenerative tissue/);
  assert.ok(r.notes.some((n) => /Multiple tear patterns/.test(n)));
  assert.ok(!isk(MEDIAL).notes.some((n) => /Multiple tear patterns/.test(n)));
});

test('every answer carries the reliability and the unmeasured items', () => {
  const r = isk(MEDIAL);
  assert.ok(r.notes.some((n) => /kappa 0\.25 and 0\.36/.test(n)));
  assert.ok(r.notes.some((n) => /tear length in mm/.test(n)));
});

test('missing findings are asked for, one at a time', () => {
  assert.match(isk({}).message, /medial or the lateral/);
  assert.match(isk({ meniscus: 'medial' }).message, /depth/);
  assert.match(isk({ ...MEDIAL, rim: '' }).message, /rim width/);
  assert.match(isk({ ...MEDIAL, radial: undefined }).message, /thirds/);
  assert.match(isk({ ...MEDIAL, meniscus: 'lateral' }).message, /popliteal hiatus/);
  assert.match(isk({ ...MEDIAL, pattern: 'zigzag' }).message, /pattern/);
  assert.match(isk({ ...MEDIAL, tissue: null }).message, /tissue quality/);
  assert.equal(isk(null).valid, false);
});
