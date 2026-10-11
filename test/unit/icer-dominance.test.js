// spec-v1634 tool 20: incremental cost-effectiveness ratios and dominance.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { icerDominance as d } from '../../lib/icer-dominance-v1634.js';

const HERC = 'Standard care, 5000, 1\nA, 12000, 1.5\nB, 10000, 2\nC, 25000, 3\nD, 35000, 4\nE, 55000, 5';

test('the VA page\'s worked example', () => {
  const r = d({ options: HERC });
  assert.deepEqual(r.frontier.map((x) => [x.name, x.icer]), [['Standard care', null], ['B', 5000], ['D', 12500], ['E', 20000]]);
  assert.deepEqual(r.excluded, [{ name: 'A', reason: 'strongly dominated', by: 'B' }, { name: 'C', reason: 'extended dominance', by: 'D' }]);
  assert.match(r.notes.join(' '), /C: ruled out by extended dominance\. Its ratio \(15,000 per unit of effect\) is greater than that of the more effective D \(10,000\)/);
  // The order the options are entered in does not matter.
  const shuffled = d({ options: HERC.split('\n').reverse().join('\n') });
  assert.deepEqual(shuffled.frontier.map((x) => x.icer), [null, 5000, 12500, 20000]);
});

test('two options: a trade-off, a dominant option, or equal effect', () => {
  const t = d({ options: 'Old, 1000, 2\nNew, 3000, 2.5' });
  assert.equal(t.frontier[1].icer, 4000);
  assert.match(t.band, /^A trade-off/);
  const dom = d({ options: 'Old, 1000, 2\nNew, 800, 2.5' });
  assert.match(dom.band, /^New is dominant/);
  assert.equal(dom.frontier.length, 1);
  const tie = d({ options: 'Old, 1000, 2\nNew, 800, 2' });
  assert.equal(tie.excluded[0].reason, 'equal effect');
  assert.match(tie.notes.join(' '), /does not cover a tie/);
});

test('extended dominance is repeated until the ratios rise', () => {
  // Base 0/0; P 100/1 (100); Q 150/2 (50) -> P out; then Q vs base 75; R 400/3 (250).
  const r = d({ options: 'Base, 0, 0\nP, 100, 1\nQ, 150, 2\nR, 400, 3' });
  assert.deepEqual(r.frontier.map((x) => [x.name, x.icer]), [['Base', null], ['Q', 75], ['R', 250]]);
  const ratios = r.frontier.slice(1).map((x) => x.icer);
  assert.deepEqual(ratios, [...ratios].sort((a, b) => a - b));
});

test('no threshold or net benefit is applied', () => {
  const r = d({ options: HERC });
  assert.equal(r.abnormal, false);
  assert.match(r.note, /applies no threshold/);
  assert.doesNotMatch(JSON.stringify(r), /net monetary|cost-effective at/i);
});

test('refusals', () => {
  assert.match(d({}).message, /^Enter at least two options/);
  assert.match(d({ options: 'x, 1, 1' }).message, /^Enter at least two options/);
  assert.match(d({ options: 'a, 1\nb, 2, 3' }).message, /Option line 1: enter the name/);
  assert.match(d({ options: 'a, 1, 1\na, 2, 3' }).message, /used twice/);
  assert.match(d({ options: 'a, x, 1\nb, 2, 3' }).message, /^Enter the cost on option line 1/);
  assert.equal(d({ options: 'a, -5, 1\nb, 2, 3' }).valid, false);
  assert.equal(d(null).valid, false);
});
