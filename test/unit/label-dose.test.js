// spec-v1632 section 0: the band engine every label dose-check tool reads its table through.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findBands, describeBands, bandName, inBand, worstFlag, FLAGS } from '../../lib/label-dose.js';

const edges = [{ from: 50, fromExclusive: true, text: 'a' }, { from: 25, to: 50, text: 'b' }, { from: 10, to: 25, text: 'c' }, { from: 0, to: 10, text: 'd' }];
const whole = [{ from: 50, text: 'a' }, { from: 30, to: 49, text: 'b' }, { from: 10, to: 29, text: 'c' }, { to: 10, toExclusive: true, text: 'd' }];
const open = [{ from: 60, fromExclusive: true, to: 90, text: 'a' }, { from: 30, fromExclusive: true, to: 60, text: 'b' }, { from: 10, fromExclusive: true, to: 30, text: 'c' }];
const texts = (t, v) => findBands(t, v).rows.map((r) => r.text).join('+');

test('each end is inclusive unless the band says otherwise', () => {
  assert.equal(inBand({ from: 10, to: 20 }, 10), true);
  assert.equal(inBand({ from: 10, to: 20 }, 20), true);
  assert.equal(inBand({ from: 10, to: 20, fromExclusive: true }, 10), false);
  assert.equal(inBand({ from: 10, to: 20, toExclusive: true }, 20), false);
  assert.equal(inBand({ from: null, to: null }, 5), true);
});

test('bands that share an edge: a value on the edge is in both rows', () => {
  assert.deepEqual([51, 50, 25, 10, 0].map((v) => texts(edges, v)), ['a', 'b', 'b+c', 'c+d', 'd']);
  assert.match(describeBands(findBands(edges, 25), 25, 'mL/min'), /on the edge shared by two bands .*25 to 50 and 10 to 25/);
});

test('bands printed in whole numbers: a value between two is in neither, and both are shown', () => {
  assert.deepEqual([50, 49, 30, 29, 10, 9.99].map((v) => texts(whole, v)), ['a', 'b', 'b', 'c', 'c', 'd']);
  const gap = findBands(whole, 49.5);
  assert.deepEqual([gap.between, gap.rows.map((r) => r.text)], [true, ['b', 'a']]);
  assert.match(describeBands(gap, 49.5, 'mL/min'), /falls between two bands .*30 to 49 and 50 or above/);
});

test('a value outside every band gets no row, never the nearest one', () => {
  for (const v of [95, 10, 5]) {
    const f = findBands(open, v);
    assert.deepEqual([f.rows.length, f.outside, f.between], [0, true, false], String(v));
  }
  assert.deepEqual([90, 60.1, 60, 30, 10.1].map((v) => texts(open, v)), ['a', 'a', 'b', 'c', 'c']);
  assert.match(describeBands(findBands(open, 95), 95, 'mL/min'), /outside every band/);
});

test('a band is named in the label\'s own bounds', () => {
  assert.deepEqual(whole.map(bandName), ['50 or above', '30 to 49', '10 to 29', 'below 10']);
  assert.deepEqual(open.map(bandName), ['above 60 to 90', 'above 30 to 60', 'above 10 to 30']);
  assert.equal(bandName({ from: 30, to: 60, toExclusive: true }), '30 to below 60');
  assert.equal(bandName({ to: 10 }), '10 or below');
  assert.equal(bandName({}), 'any value');
});

test('the status of several rows is the most cautious flag among them', () => {
  assert.equal(FLAGS.length, 5);
  assert.equal(worstFlag([{ flag: 'dose' }, { flag: 'not-recommended' }]), 'not-recommended');
  assert.equal(worstFlag([{ flag: 'no-adjustment' }, { flag: 'dose' }]), 'dose');
  assert.equal(worstFlag([{ flag: 'no-adjustment' }]), 'no-adjustment');
  assert.equal(worstFlag([{ flag: 'contraindicated' }, { flag: 'no-recommendation-given' }]), 'contraindicated');
});
