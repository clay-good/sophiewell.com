// spec-v1635 tool 4: lifetime cumulative dose against the figure each label states.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cumulativeDoseLimit, LABELS, AGENTS } from '../../lib/cumulative-dose-limit-v1635.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-11T12:00:00Z');
const c = (i, t) => cumulativeDoseLimit(i, now, t);
const dead = (id) => ({ ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } });
const rep = (dose, n) => Array(n).fill(dose).join('\n');

test('every agent has a label row that answers, and withholds only on its own label', () => {
  assert.deepEqual(Object.keys(LABELS).sort(), AGENTS.map((a) => a.value).sort());
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.name);
  assert.equal(c({ agent: 'doxorubicin', doses: '60' }, dead(LABELS.doxorubicin.setId)).total, undefined);
  assert.equal(c({ agent: 'doxorubicin', doses: '60' }, dead(LABELS.epirubicin.setId)).total, 60);
});

test('doxorubicin: percent of 550, the estimate it sits among, and what remains', () => {
  const r = c({ agent: 'doxorubicin', doses: rep(60, 7) });
  assert.deepEqual([r.total, r.figure, r.percentOfFigure, r.remaining, r.flag, r.abnormal], [420, 550, 76.4, 130, 'below-figure', false]);
  assert.match(r.notes.join(' '), /3 to 5% at 400 mg\/m² and 5 to 8% at 450 mg\/m²\. Nothing is interpolated/);
  assert.match(c({ agent: 'doxorubicin', doses: rep(50, 9) }).notes.join(' '), /estimate at 450 mg\/m² is 5 to 8%/);
  // "above 550": exactly 550 is at the figure, 551 is past it.
  assert.equal(c({ agent: 'doxorubicin', doses: rep(55, 10) }).flag, 'at-figure');
  assert.equal(c({ agent: 'doxorubicin', doses: `${rep(55, 10)}\n1` }).flag, 'past-figure');
  // No 450 mg/m² radiation limit is in the label, and none is applied.
  assert.match(r.notes.join(' '), /gives no lower figure/);
});

test('a dose in mg is converted by the body surface area entered for that dose', () => {
  const r = c({ agent: 'doxorubicin', doses: '108, 1.8\n60' });
  assert.equal(r.total, 120);
  assert.match(c({ agent: 'doxorubicin', doses: '108, 1.8, 3' }).message, /^Dose line 1/);
  assert.match(c({ agent: 'doxorubicin', doses: '60\nabc' }).message, /line 2/);
});

test('epirubicin: 900 mg/m² itself "should generally be avoided"', () => {
  assert.equal(c({ agent: 'epirubicin', doses: rep(100, 9) }).flag, 'past-figure');
  const r = c({ agent: 'epirubicin', doses: rep(100, 7) });
  assert.deepEqual([r.flag, r.remaining], ['below-figure', 200]);
  assert.match(r.notes.join(' '), /estimate at 700 mg\/m² is 1\.6%/);
});

test('daunorubicin: the row that applies, with both adult sentences shown', () => {
  const adult = c({ agent: 'daunorubicin', daunorubicinGroup: 'adult', heartRadiation: 'no', doses: rep(45, 10) });
  assert.deepEqual([adult.figure, adult.flag, adult.abnormal], [550, 'in-boxed-warning-range', true]);
  assert.match(adult.notes.join(' '), /exceeding 550 mg\/m².*exceeding 400 to 550 mg\/m² in adults/);
  assert.equal(c({ agent: 'daunorubicin', daunorubicinGroup: 'adult', heartRadiation: 'no', doses: rep(40, 10) }).flag, 'below-figure');
  assert.deepEqual((({ figure, flag }) => [figure, flag])(c({ agent: 'daunorubicin', daunorubicinGroup: 'adult', heartRadiation: 'yes', doses: rep(45, 10) })), [400, 'past-figure']);
  assert.deepEqual((({ figure, unit }) => [figure, unit])(c({ agent: 'daunorubicin', daunorubicinGroup: 'child-over-2', doses: '25' })), [300, 'mg/m²']);
  const infant = c({ agent: 'daunorubicin', daunorubicinGroup: 'child-under-2', doses: '1\n1\n10, 10' });
  assert.deepEqual([infant.figure, infant.unit, infant.total], [10, 'mg/kg', 3]);
  assert.match(c({ agent: 'daunorubicin', doses: '45' }).message, /^Choose the daunorubicin age group/);
  assert.match(c({ agent: 'daunorubicin', daunorubicinGroup: 'adult', doses: '45' }).message, /^Choose whether the patient had radiation therapy/);
});

test('idarubicin: other agents count only as the reader converted them, and are labeled so', () => {
  const alone = c({ agent: 'idarubicin', doses: rep(12, 3) });
  assert.deepEqual([alone.total, alone.flag, alone.combinedTotal], [36, 'below-figure', null]);
  assert.match(alone.notes.join(' '), /It gives no conversion ratio/);
  const withOther = c({ agent: 'idarubicin', doses: rep(12, 3), otherEquivalent: 60 });
  assert.deepEqual([withOther.total, withOther.combinedTotal, withOther.flag], [36, 96, 'past-figure-with-reader-conversion']);
  assert.match(withOther.notes.join(' '), /The conversion is yours/);
});

test('mitoxantrone: the use is asked; multiple sclerosis stops at 140, cancer reports the estimate', () => {
  assert.match(c({ agent: 'mitoxantrone', doses: '12' }).message, /^Choose what mitoxantrone is for/);
  assert.equal(c({ agent: 'mitoxantrone', mitoxantroneUse: 'multiple-sclerosis', doses: '140' }).flag, 'past-figure');
  assert.equal(c({ agent: 'mitoxantrone', mitoxantroneUse: 'cancer', doses: '140' }).flag, 'at-figure');
  assert.match(c({ agent: 'mitoxantrone', mitoxantroneUse: 'cancer', doses: '96' }).notes.join(' '), /2\.6% probability/);
});

test('bleomycin: units against 400, with no per-surface-area form', () => {
  const r = c({ agent: 'bleomycin', doses: rep(30, 12) });
  assert.deepEqual([r.total, r.unit, r.percentOfFigure, r.remaining], [360, 'units', 90, 40]);
  assert.equal(c({ agent: 'bleomycin', doses: rep(30, 14) }).flag, 'past-figure');
  assert.match(c({ agent: 'bleomycin', doses: '30, 2' }).message, /one number of units/);
  assert.match(c({ agent: 'bleomycin', doses: '30', otherEquivalent: 5 }).message, /does not apply to bleomycin/);
});

test('nothing is defaulted', () => {
  assert.match(c({}).message, /^Choose the agent/);
  assert.match(c({ agent: 'doxorubicin' }).message, /^Enter the prior doses/);
  assert.match(c({ agent: 'bleomycin', doses: '  ' }).message, /^Enter the prior doses in units/);
  assert.equal(cumulativeDoseLimit(null, now).valid, false);
});
