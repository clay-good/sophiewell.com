// spec-v225: worked examples for the obstetrics & gynecology instruments. Point
// systems spec-v97 cross-verified (see module header for source pairs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  nugent, amsel, ferrimanGallwey, pbac, thompsonHie, menopauseRating, kupperman,
} from '../../lib/obgyn-v225.js';

test('nugent: BV band', () => {
  const r = nugent({ lactobacillus: '4', gardnerella: '4', mobiluncus: '1' });
  assert.equal(r.score, 9);
  assert.match(r.band, /bacterial vaginosis/);
});
test('nugent: normal', () => {
  assert.equal(nugent({ lactobacillus: '0', gardnerella: '0' }).abnormal, false);
});

test('amsel: BV at 3', () => {
  const r = amsel({ discharge: true, ph: true, whiff: true });
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, true);
});

test('ferriman-gallwey: hirsutism at 8', () => {
  const r = ferrimanGallwey({ upperLip: '2', chin: '2', chest: '2', thigh: '2' });
  assert.equal(r.score, 8);
  assert.equal(r.abnormal, true);
});
test('ferriman-gallwey: below cutoff', () => {
  assert.equal(ferrimanGallwey({ upperLip: '2' }).abnormal, false);
});

test('pbac: weighted tally > 100', () => {
  const r = pbac({ soakedPads: 5, moderatePads: 4, largeClots: 2 }); // 100+20+10
  assert.equal(r.score, 130);
  assert.equal(r.abnormal, true);
});
test('pbac: below heavy range', () => {
  assert.equal(pbac({ lightPads: 10 }).abnormal, false);
});

test('thompson: mild band', () => {
  const r = thompsonHie({ tone: '2', consciousness: '2', posture: '2', respiration: '2' });
  assert.equal(r.score, 8);
  assert.match(r.band, /mild/);
});
test('thompson: severe at 15', () => {
  const r = thompsonHie({ tone: '3', consciousness: '2', seizures: '2', posture: '3', moro: '2', respiration: '3' });
  assert.equal(r.score, 15);
  assert.match(r.band, /severe/);
});

test('mrs: moderate band', () => {
  const r = menopauseRating({ hotFlushes: '3', sleepProblems: '2', depressive: '2', irritability: '2' });
  assert.equal(r.score, 9);
  assert.match(r.band, /moderate/);
});

test('kupperman: weighted moderate', () => {
  const r = kupperman({ hotFlushes: '3', insomnia: '2', nervousness: '2' }); // 12+4+4
  assert.equal(r.score, 20);
  assert.match(r.band, /moderate/);
});
test('kupperman: mild below 15', () => {
  assert.equal(kupperman({ headache: '3' }).abnormal, true); // 3, still mild band
  assert.match(kupperman({ headache: '3' }).band, /mild/);
});

// spec-v1094: the PBAC is a weighted tally of eight counts, so it can only rise
// as the chart is filled in, and it must not rule out from a partial one.
//
// It said "PBAC score 65 - not in the heavy range (<= 100)" from a chart with
// three of the eight types never entered; one of those at a plausible count
// carried the same patient to 115, heavy menstrual bleeding likely.
//
// spec-v1088 judged this tile correct on the grounds that "no pads counted yet
// is the normal state of a chart being filled in" -- true about the arithmetic,
// beside the point about the sentence. A blank may well mean none used; the
// tile cannot tell that from not yet counted, and only one of those readings
// supports the words "not in the heavy range".
test('spec-v1094: a partial PBAC chart does not rule out heavy bleeding', () => {
  const complete = {
    lightPads: 10, moderatePads: 5, soakedPads: 1,
    lightTampons: 5, moderateTampons: 2, soakedTampons: 1,
    smallClots: 3, largeClots: 1,
  };
  const full = pbac(complete);
  assert.equal(full.abnormal, false);
  assert.equal(full.footing, null, 'every type counted, so the negative stands unqualified');
  assert.match(full.band, /not in the heavy range/);

  // The same reading from three of eight types must not say that.
  const partial = pbac({ lightPads: 10, moderatePads: 5, soakedPads: 1 });
  assert.equal(partial.abnormal, false);
  assert.doesNotMatch(partial.band, /not in the heavy range/, 'a total that can only rise must not rule out');
  assert.match(partial.band, /on the item types counted so far/);
  assert.match(partial.footing, /Scored from 3 of 8 item types/);
  assert.match(partial.footing, /can only rise/);

  // Ruling IN is untouched: above the threshold the missing counts cannot lower
  // it, so a heavy result from a partial chart is already the floor.
  const heavy = pbac({ soakedPads: 6 });
  assert.equal(heavy.abnormal, true);
  assert.equal(heavy.footing, null);
  assert.match(heavy.band, /heavy menstrual bleeding likely/);

  // A zero someone actually wrote is a count, not a gap.
  const allCounted = { ...complete, largeClots: 0 };
  assert.equal(pbac(allCounted).footing, null);
});
