import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHash, buildHash } from '../../lib/hash.js';

test('parseHash: empty hash', () => {
  const r = parseHash('');
  assert.deepEqual(r, { route: '', sub: '', pinned: [], state: {} });
});

test('parseHash: route + sub', () => {
  const r = parseHash('#icd10/I10');
  assert.equal(r.route, 'icd10');
  assert.equal(r.sub, 'I10');
});

test('parseHash: pinned list', () => {
  const r = parseHash('#&p=icd10,bmi,egfr');
  assert.deepEqual(r.pinned, ['icd10', 'bmi', 'egfr']);
});

test('parseHash: pinned-only without leading & (regression)', () => {
  // buildHash drops an empty route, so togglePin from the home view emits
  // "#p=bmi" (no leading "&"). The parser must still recognize the p= key.
  const r = parseHash('#p=bmi');
  assert.equal(r.route, '');
  assert.deepEqual(r.pinned, ['bmi']);
});

test('parseHash: state-only without route', () => {
  const r = parseHash('#q=' + encodeURIComponent('w=70'));
  assert.equal(r.route, '');
  assert.deepEqual(r.state, { w: '70' });
});

test('parseHash: calculator state', () => {
  const r = parseHash('#bmi&q=' + encodeURIComponent('w=70;h=1.75'));
  assert.equal(r.route, 'bmi');
  assert.deepEqual(r.state, { w: '70', h: '1.75' });
});

test('parseHash: state + pinned + sub together', () => {
  const r = parseHash('#cockcroft-gault&p=bmi,egfr&q=' + encodeURIComponent('age=60;w=80;scr=1.0;sex=M'));
  assert.equal(r.route, 'cockcroft-gault');
  assert.deepEqual(r.pinned, ['bmi', 'egfr']);
  assert.deepEqual(r.state, { age: '60', w: '80', scr: '1.0', sex: 'M' });
});

test('buildHash: round-trip', () => {
  const input = { route: 'bmi', sub: '', pinned: ['icd10', 'bmi'], state: { w: '70', h: '1.75' } };
  const h = buildHash(input);
  const out = parseHash(h);
  assert.equal(out.route, input.route);
  assert.deepEqual(out.pinned, input.pinned);
  assert.deepEqual(out.state, input.state);
});

test('buildHash: empty state and pinned omits the keys', () => {
  assert.equal(buildHash({ route: 'bmi' }), '#bmi');
});
