// spec-v1635 tool 28: breastfeeding interruption (NRC Regulatory Guide 8.39 Rev. 1, Table 3).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nucMedBreastfeedingInterruption as d, AGENTS } from '../../lib/nuc-med-breastfeeding-interruption-v1635.js';

const row = (v) => { const a = AGENTS.find((x) => x.value === v); return [a.instructions?.mci, a.record?.mci, a.duration]; };

test('rows as the table prints them', () => {
  assert.equal(AGENTS.length, 33);
  assert.deepEqual(row('i-131-nai'), [0.0004, 0.002, 'complete cessation (for this infant or child)']);
  assert.deepEqual(row('i-123-nai'), [0.5, 3, '3 days']);
  assert.deepEqual(row('tc-99m-maa'), [1.3, 6, '24 hours']);
  assert.deepEqual(row('tc-99m-pertechnetate'), [3, 15, '24 hours']);
  assert.deepEqual(row('ga-67'), [0.04, 0.2, '28 days']);
  assert.deepEqual(row('in-111-wbc'), [0.2, 1, '6 days']);
  assert.deepEqual(row('tl-201'), [1, 5, '4 days']);
  assert.deepEqual(row('cr-51-edta'), [1.6, 8, null]);
  assert.deepEqual(AGENTS.filter((a) => a.value.startsWith('tc-99m')).map((a) => a.duration), Array(15).fill('24 hours'));
  assert.deepEqual(AGENTS.filter((a) => !a.instructions).map((a) => [a.value, a.duration]), [['pet-short', 'no interruption'], ['f-18-fdg', '4 hours'], ['lu-177-octreotate', 'complete cessation (for this infant or child)'], ['ra-223-alpha', 'complete cessation (for this infant or child)'], ['zr-89', '28 days'], ['ga-68-octreotate', '4 hours'], ['in-111-octreotate', '6 days'], ['i-124-nai', 'complete cessation (for this infant or child)']]);
});

test('"above which": the threshold itself does not trigger, in either unit', () => {
  const at = d({ agent: 'tc-99m-maa', activity: 1.3, unit: 'mci' });
  assert.deepEqual([at.instructionsRequired, at.recordRequired], [false, false]);
  const over = d({ agent: 'tc-99m-maa', activity: 4, unit: 'mci' });
  assert.deepEqual([over.instructionsRequired, over.recordRequired, over.duration], [true, false, '24 hours']);
  assert.equal(d({ agent: 'tc-99m-maa', activity: 6.1, unit: 'mci' }).flag, 'instructions-and-record');
  // The MBq column is compared as printed, not converted from mCi.
  assert.equal(d({ agent: 'tc-99m-maa', activity: 50, unit: 'mbq' }).instructionsRequired, false);
  assert.equal(d({ agent: 'tc-99m-maa', activity: 51, unit: 'mbq' }).instructionsRequired, true);
});

test('a row with no duration, and the rows with a duration only', () => {
  const cr = d({ agent: 'cr-51-edta', activity: 2, unit: 'mci' });
  assert.equal(cr.instructionsRequired, true);
  assert.match(cr.notes.join(' '), /gives no duration for this product/);
  const fdg = d({ agent: 'f-18-fdg' });
  assert.deepEqual([fdg.duration, fdg.instructionsRequired], ['4 hours', null]);
  assert.match(fdg.notes[0], /not done here/);
  assert.equal(d({ agent: 'pet-short' }).abnormal, false);
  assert.equal(d({ agent: 'lu-177-octreotate' }).abnormal, true);
});

test('the footnote on the 1 mSv aim and the 5 mSv limit is always carried', () => {
  assert.match(d({ agent: 'f-18-fdg' }).note, /below 1 mSv \(0\.1 rem\); the regulatory limit is 5 mSv/);
});

test('refusals', () => {
  assert.match(d({}).message, /^Choose the radiopharmaceutical/);
  assert.match(d({ agent: 'tl-201' }).message, /^Enter the administered activity/);
  assert.match(d({ agent: 'tl-201', activity: 3 }).message, /^Choose the unit/);
  assert.equal(d({ agent: 'tl-201', activity: 0, unit: 'mci' }).valid, false);
  assert.equal(d(null).valid, false);
});
