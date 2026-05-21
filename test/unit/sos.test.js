import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sos } from '../../lib/scoring-v4.js';

const zero = {
  tachycardia: 0, tachypnea: 0, fever: 0, sweating: 0, agitation: 0,
  anxiety: 0, grimacing: 0, sleeplessness: 0, hallucinations: 0,
  motorDisturbance: 0, hypertonia: 0, tremor: 0, vomiting: 0, diarrhea: 0,
  inconsolableCrying: 0,
};

test('sos 0 (tile example, no symptoms) -> no significant withdrawal', () => {
  const r = sos(zero);
  assert.equal(r.score, 0);
  assert.equal(r.withdrawal, false);
  assert.equal(r.band, 'no significant withdrawal');
});

test('sos 3 (sub-threshold) -> no significant withdrawal', () => {
  const r = sos({ ...zero, tachycardia: 1, sweating: 1, tremor: 1 });
  assert.equal(r.score, 3);
  assert.equal(r.withdrawal, false);
});

test('sos 4 (lower edge of cutoff) -> iatrogenic withdrawal present', () => {
  const r = sos({ ...zero, tachycardia: 1, sweating: 1, tremor: 1, agitation: 1 });
  assert.equal(r.score, 4);
  assert.equal(r.withdrawal, true);
  assert.equal(r.band, 'iatrogenic withdrawal present');
});

test('sos 15 (all items present) -> withdrawal present', () => {
  const all = Object.fromEntries(Object.keys(zero).map((k) => [k, 1]));
  const r = sos(all);
  assert.equal(r.score, 15);
  assert.equal(r.withdrawal, true);
});

test('sos parts mirror inputs', () => {
  const r = sos({ ...zero, hallucinations: 1, vomiting: 1 });
  assert.equal(r.parts.hallucinations, 1);
  assert.equal(r.parts.vomiting, 1);
  assert.equal(r.parts.tachycardia, 0);
  assert.equal(r.score, 2);
});

test('sos text mentions Ista 2009 and the >=4 cutoff', () => {
  const r = sos(zero);
  assert.match(r.text, /Ista 2009/);
  assert.match(r.text, />=4/);
});

test('sos rejects out-of-range and non-integer items', () => {
  assert.throws(() => sos({ ...zero, tachycardia: 2 }));
  assert.throws(() => sos({ ...zero, tremor: -1 }));
  assert.throws(() => sos({ ...zero, fever: 0.5 }));
});
