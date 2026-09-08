import test from 'node:test';
import assert from 'node:assert/strict';
import { leipzigWilson } from '../../lib/leipzig-wilson-v812.js';

test('leipzig: published item weights sum as the table gives them', () => {
  // KF 2 + severe neuro 2 + ceruloplasmin <0.1 2 + hemolysis 1 + liver Cu >4 2
  // + urine Cu >2x ULN 2 + biallelic mutation 4 = 15
  const r = leipzigWilson({
    kfRings: '1', neurologic: '2', ceruloplasmin: '2', hemolysis: '1',
    liverCopper: '2', urinaryCopper: '2', mutation: '2',
  });
  assert.equal(r.valid, true);
  assert.equal(r.score, 15);
});

// spec-v1127: all six items entered. They defaulted to their 0-point levels, so
// an assertion naming a band was reading five unentered items as five negatives.
const entered = (o = {}) => ({
  kfRings: '0', neurologic: '0', ceruloplasmin: '0', hemolysis: '0',
  urinaryCopper: '0', mutation: '0', liverCopper: 'na', ...o,
});

test('leipzig: the three bands sit at 4 and 3', () => {
  assert.equal(leipzigWilson(entered({ mutation: '2' })).score, 4);
  assert.equal(leipzigWilson(entered({ mutation: '2' })).bandLabel, 'Diagnosis established');
  // kf 2 + mild neuro 1 = 3
  assert.equal(leipzigWilson(entered({ kfRings: '1', neurologic: '1' })).bandLabel, 'Diagnosis possible');
  // kf 2 alone = 2
  assert.equal(leipzigWilson(entered({ kfRings: '1' })).bandLabel, 'Diagnosis very unlikely');
  assert.equal(leipzigWilson(entered()).score, 0);
});

test('spec-v1127: an unentered item can only add, so the score is a floor', () => {
  // This tile LOOKS non-monotone -- a normal liver copper is worth -1 -- and is
  // not, because an OMISSION lands on 'na' (0 points), never on '0'. What
  // matters is the default an omission reaches, not whether a negative exists.
  const nothing = leipzigWilson({});
  assert.equal(nothing.score, 0);
  assert.match(nothing.band, /at least 0 . not yet a band/);
  assert.match(nothing.band, /Scored from 0 of the 6 items/);
  assert.doesNotMatch(nothing.band, /very unlikely/);

  // Established rules in from a subset and keeps its verdict; the FIGURE is
  // still a floor (spec-v1114).
  const established = leipzigWilson({ kfRings: '1', neurologic: '2', mutation: '1' });
  assert.match(established.band, /at least 5 . 4 or more: diagnosis of Wilson disease established/);
  assert.match(established.band, /Scored from 3 of the 6 items/);

  // Everything entered, nothing to disclose.
  assert.doesNotMatch(leipzigWilson(entered()).band, /Scored from/);
});

test('leipzig: a NORMAL liver copper subtracts a point, it is not a zero', () => {
  // The trap. An add-only reading of the table would score this 3 and call it possible.
  const withNormal = leipzigWilson(entered({ kfRings: '1', neurologic: '1', liverCopper: '0' }));
  assert.equal(withNormal.score, 2);
  assert.equal(withNormal.bandLabel, 'Diagnosis very unlikely');
  assert.ok(withNormal.negativeNote);

  const withoutBiopsy = leipzigWilson(entered({ kfRings: '1', neurologic: '1', liverCopper: 'na' }));
  assert.equal(withoutBiopsy.score, 3);
  assert.equal(withoutBiopsy.bandLabel, 'Diagnosis possible');
  assert.equal(withoutBiopsy.negativeNote, null);
});

test('leipzig: rhodanine granules SUBSTITUTE for liver copper, they do not add to it', () => {
  // Scored when there is no quantitative copper...
  const alone = leipzigWilson({ liverCopper: 'na', rhodanineGranules: true });
  assert.equal(alone.score, 1);
  assert.equal(alone.rhodanineCounted, true);
  assert.equal(alone.rhodanineNote, null);

  // ...and ignored when there is, with the reason said out loud.
  const both = leipzigWilson({ liverCopper: '2', rhodanineGranules: true });
  assert.equal(both.score, 2);
  assert.equal(both.rhodanineCounted, false);
  assert.ok(both.rhodanineNote.includes('double-count'));

  // Including when the quantitative result is the negative one.
  const negative = leipzigWilson({ liverCopper: '0', rhodanineGranules: true });
  assert.equal(negative.score, -1);
  assert.equal(negative.rhodanineCounted, false);
});

test('leipzig: both urinary-copper routes to 2 points are honored', () => {
  assert.equal(leipzigWilson({ urinaryCopper: '2' }).score, 2);
  // Normal at baseline but >5x ULN after D-penicillamine is also worth 2.
  assert.equal(leipzigWilson({ urinaryCopper: '3' }).score, 2);
  assert.equal(leipzigWilson({ urinaryCopper: '1' }).score, 1);
});

test('leipzig: one deleterious allele is 1 point, two is 4', () => {
  assert.equal(leipzigWilson({ mutation: '1' }).score, 1);
  assert.equal(leipzigWilson({ mutation: '2' }).score, 4);
  assert.equal(leipzigWilson({ mutation: '0' }).score, 0);
});

test('leipzig: unrecognized options are refused rather than treated as zero', () => {
  assert.equal(leipzigWilson({ neurologic: '3' }).valid, false);
  assert.equal(leipzigWilson({ liverCopper: 'high' }).valid, false);
  assert.equal(leipzigWilson({ mutation: '4' }).valid, false);
  assert.equal(leipzigWilson().valid, true);
});
