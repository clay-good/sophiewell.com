// spec-v1636 tool 5: the flumazenil dose series and cumulative caps, from the label.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flumazenilLadder, LABEL } from '../../lib/flumazenil-ladder-v1636.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-11T12:00:00Z');
const f = (i, t) => flumazenilLadder(i, now, t);
const rev = (dosesGiven, extra = {}) => f({ indication: 'sedation-reversal', patient: 'adult', dosesGiven, ...extra });
const od = (dosesGiven) => f({ indication: 'suspected-overdose', patient: 'adult', dosesGiven });
const got = (r) => [r.flag, r.nextDoseMg, r.cumulativeMg];

test('the label row answers, and a superseded one withholds the series', () => {
  assert.equal(labelRow(LABEL.setId, now).answers, true);
  const dead = { ...LABEL_EDITIONS, [LABEL.setId]: { ...LABEL_EDITIONS[LABEL.setId], supersededOn: '2026-10-10' } };
  assert.equal(f({ indication: 'sedation-reversal', patient: 'adult', dosesGiven: 0 }, dead).nextDoseMg, undefined);
});

test('reversal, adult: five 0.2 mg doses to 1 mg, then no further dose', () => {
  assert.deepEqual([0, 1, 4].map((n) => got(rev(n))), [['next-dose', 0.2, 0], ['next-dose', 0.2, 0.2], ['next-dose', 0.2, 0.8]]);
  assert.match(rev(0).band, /0\.2 mg \(2 mL of 0\.1 mg\/mL\) over 15 seconds, now/);
  assert.match(rev(1).band, /after waiting a further 45 seconds/);
  assert.match(rev(2).band, /at a 60-second interval/);
  assert.deepEqual(got(rev(5)), ['series-complete', null, 1]);
  assert.match(rev(0).notes.join(' '), /no more than 1 mg \(given as 0\.2 mg\/min\) at any one time, and no more than 3 mg in any one hour/);
});

test('reversal, child over 1 year: 0.01 mg/kg up to 0.2 mg, to 0.05 mg/kg or 1 mg, whichever is lower', () => {
  const kid = (weight, dosesGiven) => f({ indication: 'sedation-reversal', patient: 'child-over-1-year', weight, dosesGiven });
  assert.deepEqual((({ nextDoseMg, capMg }) => [nextDoseMg, capMg])(kid(12, 0)), [0.12, 0.6]);
  assert.deepEqual((({ nextDoseMg, capMg }) => [nextDoseMg, capMg])(kid(40, 0)), [0.2, 1]);
  assert.deepEqual(got(kid(12, 5)), ['series-complete', null, 0.6]);
  assert.match(kid(12, 0).notes.join(' '), /repeated flumazenil in pediatric patients with resedation have not been established/);
  assert.match(f({ indication: 'sedation-reversal', patient: 'child-over-1-year', dosesGiven: 0 }).message, /^Enter the weight/);
});

test('overdose, adult: 0.2, 0.3, then 0.5 mg to 3 mg; beyond 3 mg is flagged; nothing after 5 mg', () => {
  assert.deepEqual([0, 1, 2, 6].map((n) => got(od(n))), [['next-dose', 0.2, 0], ['next-dose', 0.3, 0.2], ['next-dose', 0.5, 0.5], ['next-dose', 0.5, 2.5]]);
  assert.match(od(1).band, /0\.3 mg \(3 mL of 0\.1 mg\/mL\) over 30 seconds, after waiting 30 seconds/);
  const beyond = od(7);
  assert.deepEqual([...got(beyond), beyond.abnormal], ['beyond-3-mg', 0.5, 3, true]);
  assert.deepEqual(got(od(10)), ['beyond-3-mg', 0.5, 4.5]);
  const done = od(11);
  assert.deepEqual(got(done), ['series-complete', null, 5]);
  assert.match(done.band, /likely not benzodiazepines/);
});

test('the label has no pediatric overdose series, and none is shown', () => {
  const r = f({ indication: 'suspected-overdose', patient: 'child-over-1-year', weight: 20, dosesGiven: 0 });
  assert.deepEqual([r.flag, r.nextDoseMg], ['not-in-label', undefined]);
});

test('nothing is defaulted', () => {
  assert.match(f({}).message, /^Choose the indication/);
  assert.match(f({ indication: 'suspected-overdose' }).message, /^Choose adult or pediatric patient/);
  assert.match(f({ indication: 'suspected-overdose', patient: 'adult' }).message, /^Enter the number of doses given so far.*Enter 0 before the first dose/);
  assert.match(od(1.5).message, /whole number/);
  assert.equal(flumazenilLadder(null, now).valid, false);
});
