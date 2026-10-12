// spec-v1636 backfill 4: naloxone infusion, two-thirds of the reversing bolus per hour.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { naloxoneInfusion, LABEL } from '../../lib/naloxone-infusion-v1636.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-12T12:00:00Z');
const n = (i, t) => naloxoneInfusion(i, now, t);

test('the label row answers', () => assert.equal(labelRow(LABEL.setId, now).answers, true));

test('two-thirds of the bolus per hour, and mL/hour at the label\'s 0.004 mg/mL', () => {
  for (const [bolus, mgh, mlh] of [[0.4, 0.27, 68], [2, 1.33, 333], [3, 2, 500], [0.04, 0.03, 8]]) {
    const r = n({ bolusMg: bolus });
    assert.deepEqual([r.mgPerHour, r.labelMlPerHour, r.mlPerHour], [mgh, mlh, undefined], `${bolus} mg`);
  }
});

test('the reader\'s own concentration is shown beside the label\'s', () => {
  const r = n({ bolusMg: 3, concentration: 0.04 });
  assert.deepEqual([r.mgPerHour, r.mlPerHour, r.labelMlPerHour], [2, 50, 500]);
  assert.match(r.note, /At the entered 0\.04 mg\/mL that is 50 mL\/hour/);
});

test('a superseded label keeps the rate and drops the label dilution', () => {
  const dead = { ...LABEL_EDITIONS, [LABEL.setId]: { ...LABEL_EDITIONS[LABEL.setId], supersededOn: '2026-10-10' } };
  const r = n({ bolusMg: 2 }, dead);
  assert.deepEqual([r.mgPerHour, r.labelMlPerHour], [1.33, undefined]);
});

test('refusals', () => {
  assert.match(n({}).message, /^Enter the bolus dose/);
  assert.equal(n({ bolusMg: 0 }).valid, false);
  assert.equal(n({ bolusMg: 2, concentration: 0 }).valid, false);
  assert.equal(n(null).valid, false);
});
