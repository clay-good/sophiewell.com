// spec-v1631 tool 13: IV busulfan AUC and dose adjustment by the label's method, on a label row.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { busulfanAucDose as bu, LABEL } from '../../lib/busulfan-auc-dose-v1631.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const first = { timing: 'dose-1', unit: 'uM', dose: 11, target: 1125, samples: '2, 3.6\n4, 2.2\n6, 1.35' };

test('the label\'s constants and its worked example: 11 mg x 1125 / 800 = 15.5 mg', () => {
  assert.deepEqual([LABEL.target, LABEL.range, LABEL.molecularWeight], [1125, [900, 1350], 246]);
  assert.equal(labelRow(LABEL.setId, now).answers, true);
  // A steady-state curve whose trapezoids add to 800 µM·min: 2 + 2.5 + ... check by construction.
  const flat = bu({ timing: 'later', unit: 'uM', dose: 11, target: 1125, samples: '0, 2.2222222\n2, 2.2222222\n4, 2.2222222\n6, 2.2222222' }, now);
  assert.equal(flat.auc, 800);
  assert.equal(Number(flat.adjustedDose.toFixed(1)), 15.5);
  assert.equal(flat.aucAgainst, 'below');
});

test('dose 1: trapezoids from a pre-dose 0, plus the 6-hour level over the terminal rate constant', () => {
  const r = bu(first, now);
  // 216 + 348 + 213 = 777; ln(2.2 / 1.35) / 120 min = 0.004069; 1.35 / 0.004069 = 331.7.
  assert.deepEqual([r.aucSampled, r.aucExtrapolated, r.auc, r.aucAgainst, r.abnormal], [777, 331.7, 1109, 'within', false]);
  assert.equal(r.adjustedDose, 11.16);
  assert.match(r.notes.join(' '), /last two samples \(this tool's choice\)/);
});

test('ng/mL is converted with the label\'s molecular weight', () => {
  const r = bu({ ...first, unit: 'ng-mL', samples: '2, 885.6\n4, 541.2\n6, 332.1' }, now);
  assert.equal(r.auc, 1109);
  assert.match(r.notes[0], /ng\/mL ÷ 246/);
});

test('a later dose uses the trough, 2, 4 and 6 hour samples over the interval', () => {
  const r = bu({ timing: 'later', unit: 'uM', dose: 11, target: 1125, samples: '0, 1.4\n2, 4.4\n4, 2.7\n6, 1.6' }, now);
  // (1.4 + 4.4) / 2 x 120 + (4.4 + 2.7) / 2 x 120 + (2.7 + 1.6) / 2 x 120 = 348 + 426 + 258.
  assert.equal(r.auc, 1032);
  assert.equal(r.aucExtrapolated, undefined);
  assert.match(bu({ timing: 'later', unit: 'uM', dose: 11, target: 1125, samples: '2, 4.4\n4, 2.7\n6, 1.6' }, now).notes.join(' '), /pre-infusion \(trough\) sample.*Fewer than the four samples/);
});

test('too few samples carries the label\'s warning; the target is required and named when it is not 1125', () => {
  assert.match(bu({ ...first, samples: '2, 3.6\n6, 1.35' }, now).notes.join(' '), /Fewer than the three samples the label specifies/);
  assert.match(bu({ ...first, target: '' }, now).message, /label's target is 1,125/);
  assert.match(bu({ ...first, target: 1000 }, now).notes.join(' '), /this uses the 1,000 you entered/);
  assert.match(bu({ ...first, samples: '2, 1\n4, 2\n6, 3' }, now).message, /not falling/);
  assert.match(bu({ ...first, samples: '2, 3.6\n2, 2.2' }, now).message, /time order/);
  assert.match(bu({ ...first, timing: '' }, now).message, /dose 1 or a later dose/);
  assert.match(bu({ ...first, unit: '' }, now).message, /µM or ng\/mL/);
});

test('fail closed: a withheld label works nothing out', () => {
  const superseded = { ...LABEL_EDITIONS, [LABEL.setId]: { ...LABEL_EDITIONS[LABEL.setId], supersededOn: '2026-11-01' } };
  for (const [when, table] of [[new Date('2029-01-01T00:00:00Z'), undefined], [now, superseded]]) {
    const r = bu(first, when, table);
    assert.deepEqual([r.valid, r.withheld, r.auc, r.adjustedDose], [true, true, undefined, undefined]);
    assert.doesNotMatch(`${r.band} ${r.notes.join(' ')}`, /1,?125|900/);
  }
});
