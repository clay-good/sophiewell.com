// spec-v120 2.3: MESS first-seizure recurrence rule (Kim 2006, MRC MESS). Index
// from seizures at presentation (1 = 0, 2-3 = +1, >= 4 = +2), neurological
// disorder (+1), abnormal EEG (+1); total 0-4 -> low (0) / medium (1) /
// high (>= 2). Distinct from the v109 mangled-extremity MESS.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { messFirstSeizure } from '../../lib/neuro-v120.js';

test('single seizure, no risk factors -> 0/4, Low group', () => {
  const r = messFirstSeizure({ seizures: '0' });
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.group, 'Low');
  assert.equal(r.abnormal, false);
  assert.match(r.band, /low risk/);
});

test('one risk factor -> 1/4, Medium group', () => {
  const r = messFirstSeizure({ seizures: '0', abnormalEeg: true });
  assert.equal(r.total, 1);
  assert.equal(r.group, 'Medium');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /35-39%.*immediate.*50-56%.*deferred/);
});

test('4 or more seizures -> 2/4, High group (the +2 item alone flips to high)', () => {
  const r = messFirstSeizure({ seizures: '2' });
  assert.equal(r.total, 2);
  assert.equal(r.group, 'High');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /more than 50% recurrence/);
});

test('two single-point factors also reach High at 2/4', () => {
  const r = messFirstSeizure({ seizures: '1', neuroDisorder: true });
  assert.equal(r.total, 2);
  assert.equal(r.group, 'High');
});

test('every factor at maximum -> 4/4 (clamped), High', () => {
  const r = messFirstSeizure({ seizures: '2', neuroDisorder: true, abnormalEeg: true });
  assert.equal(r.total, 4);
  assert.equal(r.group, 'High');
});

test('scalar / non-object fuzz arg yields a valid 0/4 Low, never NaN', () => {
  const r = messFirstSeizure(5);
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.group, 'Low');
  assert.equal(Number.isFinite(r.total), true);
});
