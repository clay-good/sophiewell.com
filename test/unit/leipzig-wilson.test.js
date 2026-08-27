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

test('leipzig: the three bands sit at 4 and 3', () => {
  assert.equal(leipzigWilson({ mutation: '2' }).score, 4);
  assert.equal(leipzigWilson({ mutation: '2' }).bandLabel, 'Diagnosis established');
  // kf 2 + mild neuro 1 = 3
  assert.equal(leipzigWilson({ kfRings: '1', neurologic: '1' }).bandLabel, 'Diagnosis possible');
  // kf 2 alone = 2
  assert.equal(leipzigWilson({ kfRings: '1' }).bandLabel, 'Diagnosis very unlikely');
  assert.equal(leipzigWilson({}).score, 0);
});

test('leipzig: a NORMAL liver copper subtracts a point, it is not a zero', () => {
  // The trap. An add-only reading of the table would score this 3 and call it possible.
  const withNormal = leipzigWilson({ kfRings: '1', neurologic: '1', liverCopper: '0' });
  assert.equal(withNormal.score, 2);
  assert.equal(withNormal.bandLabel, 'Diagnosis very unlikely');
  assert.ok(withNormal.negativeNote);

  const withoutBiopsy = leipzigWilson({ kfRings: '1', neurologic: '1', liverCopper: 'na' });
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
