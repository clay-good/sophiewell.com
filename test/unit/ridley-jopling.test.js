// spec-v534: the Ridley-Jopling classification of leprosy.
// Worked-example tests: the five-group spectrum and its two poles, indeterminate sitting OUTSIDE it, the
// WHO paucibacillary/multibacillary crosswalk, the deliberate REFUSAL to attach a bacterial index number to
// a group, and the guards. Groups and axes transcribed from Ridley and Jopling 1966 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ridleyJopling, RJ_GROUPS, RJ_INDETERMINATE, BACTERIAL_INDEX_SCALE } from '../../lib/ridley-jopling-v534.js';

test('five groups, ordered from the tuberculoid to the lepromatous pole', () => {
  assert.deepEqual(RJ_GROUPS.map((g) => g.value), ['TT', 'BT', 'BB', 'BL', 'LL']);
});

test('the poles differ in resistance, lesion pattern, and lepromin response', () => {
  const tt = ridleyJopling({ group: 'TT' });
  const ll = ridleyJopling({ group: 'LL' });
  assert.match(tt.band, /High cell-mediated resistance/);
  assert.match(tt.band, /asymmetric/);
  assert.equal(tt.lepromin, 'Positive.');
  assert.match(ll.band, /little or no cell-mediated resistance/i);
  assert.match(ll.band, /symmetric/);
  assert.equal(ll.lepromin, 'Absent.');
});

test('BB is named as the least stable position on the spectrum', () => {
  assert.match(ridleyJopling({ group: 'BB' }).band, /least stable position on the spectrum/);
});

test('indeterminate sits OUTSIDE the five groups (the META example)', () => {
  const r = ridleyJopling({ group: 'I' });
  assert.equal(r.valid, true);
  assert.equal(r.group, 'I');
  assert.equal(r.onSpectrum, false);
  assert.match(r.band, /OUTSIDE the five-group spectrum/);
  assert.match(RJ_INDETERMINATE.text, /has not yet mounted a classifiable/);
  // The five real groups are on the spectrum.
  for (const g of RJ_GROUPS) assert.equal(ridleyJopling({ group: g.value }).onSpectrum, true);
});

test('the WHO crosswalk is TT and BT paucibacillary, BB BL LL multibacillary', () => {
  assert.equal(ridleyJopling({ group: 'TT' }).whoClass, 'paucibacillary');
  assert.equal(ridleyJopling({ group: 'BT' }).whoClass, 'paucibacillary');
  assert.equal(ridleyJopling({ group: 'BB' }).whoClass, 'multibacillary');
  assert.equal(ridleyJopling({ group: 'BL' }).whoClass, 'multibacillary');
  assert.equal(ridleyJopling({ group: 'LL' }).whoClass, 'multibacillary');
});

test('NO bacterial index number is attached to any group', () => {
  for (const g of [...RJ_GROUPS.map((x) => x.value), 'I']) {
    const r = ridleyJopling({ group: g });
    assert.match(r.band, /No bacterial index value is attached to a group here/);
    // No per-group BI figure should appear as a bare grade next to the group.
    assert.equal(r.bacterialIndex, undefined);
  }
});

test('the bacterial index SCALE is reported, since the scale itself is unambiguous', () => {
  assert.equal(BACTERIAL_INDEX_SCALE.length, 7);
  assert.deepEqual(BACTERIAL_INDEX_SCALE.map((b) => b.grade), ['0', '1+', '2+', '3+', '4+', '5+', '6+']);
  assert.match(BACTERIAL_INDEX_SCALE[6].text, /More than 1000 bacilli/);
  assert.equal(ridleyJopling({ group: 'LL' }).bacterialIndexScale.length, 7);
});

test('the copy states the current WHO rule that nerve involvement alone makes a case multibacillary', () => {
  const n = ridleyJopling({ group: 'BT' }).note;
  assert.match(n, /nerve involvement alone makes a case multibacillary/);
  assert.match(n, /more than five skin lesions, OR any nerve involvement, OR bacilli/);
});

test('the copy refuses the diagnosis and treatment readings and names the reactions gap', () => {
  const n = ridleyJopling({ group: 'LL' }).note;
  assert.match(n, /does not diagnose leprosy/);
  assert.match(n, /cannot be assigned from a clinical description alone/);
  assert.match(n, /not a treatment regimen/);
  assert.match(n, /erythema nodosum leprosum/);
  assert.match(n, /curable/);
});

test('lowercase and the spelled-out indeterminate resolve', () => {
  assert.equal(ridleyJopling({ group: 'tt' }).group, 'TT');
  assert.equal(ridleyJopling({ group: ' bl ' }).group, 'BL');
  assert.equal(ridleyJopling({ group: 'indeterminate' }).group, 'I');
});

test('a missing or unknown group is invalid', () => {
  assert.equal(ridleyJopling({}).valid, false);
  assert.equal(ridleyJopling({ group: '' }).valid, false);
  assert.equal(ridleyJopling({ group: 'TL' }).valid, false);
  assert.equal(ridleyJopling({ group: 'PB' }).valid, false);
});
