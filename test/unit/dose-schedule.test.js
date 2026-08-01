import { test } from 'node:test';
import assert from 'node:assert/strict';

import { nextDoses, DOSE_FREQ_HRS } from '../../lib/dose-schedule.js';

test('nextDoses: q6h from 14:00 gives the next four doses, wrapping midnight', () => {
  const r = nextDoses({ time: '14:00', freq: 'q6h' });
  assert.deepEqual(r.doses, ['20:00', '02:00', '08:00', '14:00']);
  assert.equal(r.stepHours, 6);
  assert.equal(r.time, '14:00');
});

test('nextDoses: a malformed time, out-of-range time, or unknown frequency returns null', () => {
  assert.equal(nextDoses({ time: '', freq: 'q6h' }), null);
  assert.equal(nextDoses({ time: '2pm', freq: 'q6h' }), null);
  assert.equal(nextDoses({ time: '25:00', freq: 'q6h' }), null);
  assert.equal(nextDoses({ time: '14:99', freq: 'q6h' }), null);
  assert.equal(nextDoses({ time: '14:00', freq: 'bogus' }), null);
});

test('nextDoses: named frequencies map to hours and count is bounded', () => {
  assert.equal(DOSE_FREQ_HRS.tid, 8);
  assert.equal(DOSE_FREQ_HRS.qd, 24);
  assert.equal(nextDoses({ time: '08:00', freq: 'qd' }).doses.length, 4);
  assert.equal(nextDoses({ time: '08:00', freq: 'qd' }).doses[0], '08:00');
  assert.equal(nextDoses({ time: '00:00', freq: 'q8h', count: 2 }).doses.length, 2);
});
