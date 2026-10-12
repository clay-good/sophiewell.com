// spec-v1636 tools 8 and 9: neostigmine reversal and deferoxamine for acute iron poisoning.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { neostigmineReversalDose, LABEL as BLOX } from '../../lib/neostigmine-reversal-dose-v1636.js';
import { deferoxamineAcuteIron, LABEL as DEF } from '../../lib/deferoxamine-acute-iron-v1636.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-11T12:00:00Z');
const neo = (i, t) => neostigmineReversalDose({ weight: 70, concentration: '1-mg-ml', twitch: 'first-twitch-well-above-10-percent', halfLife: 'shorter-acting-blocker', ...i }, now, t);
const def = (i, t) => deferoxamineAcuteIron({ weight: 20, route: 'intravenous', givenLast24h: 0, ...i }, now, t);
const dead = (id) => ({ ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } });
const WEAK = { twitch: 'first-twitch-near-10-percent', halfLife: 'longer-acting-blocker' };

test('both label rows answer, and a superseded one withholds the figures', () => {
  for (const l of [BLOX, DEF]) assert.equal(labelRow(l.setId, now).answers, true, l.name);
  assert.equal(neo({}, dead(BLOX.setId)).doseMg, undefined);
  assert.equal(def({}, dead(DEF.setId)).doseMg, undefined);
});

test('neostigmine: 0.03 mg/kg and 0.07 mg/kg when both criteria agree', () => {
  assert.deepEqual((({ flag, doseMg, maximumMg }) => [flag, doseMg, maximumMg])(neo({})), ['dose-0.03-mg-kg', 2.1, 4.9]);
  assert.deepEqual((({ flag, doseMg }) => [flag, doseMg])(neo(WEAK)), ['dose-0.07-mg-kg', 4.9]);
  assert.match(neo({ concentration: '0.5-mg-ml' }).band, /2\.1 mg \(0\.03 mg\/kg\), 4\.2 mL of 0\.5 mg\/mL/);
});

test('neostigmine: the maximum is 0.07 mg/kg or 5 mg, whichever is less', () => {
  assert.deepEqual((({ doseMg, maximumMg }) => [doseMg, maximumMg])(neo({ weight: 90, ...WEAK })), [5, 5]);
  assert.match(neo({ weight: 90, ...WEAK }).notes[0], /0\.07 mg\/kg × 90 kg = 6\.3 mg, held to the maximum of 5 mg/);
  assert.deepEqual((({ doseMg, maximumMg }) => [doseMg, maximumMg])(neo({ weight: 200 })), [5, 5]);
  const prior = neo({ priorDose: 3.5 });
  assert.deepEqual([prior.flag, prior.abnormal], ['past-maximum-with-prior-dose', true]);
  assert.match(prior.band, /only 1\.4 mg remains under the label's maximum total of 4\.9 mg/);
  assert.equal(neo({ priorDose: 2 }).flag, 'dose-0.03-mg-kg');
});

test('neostigmine: when the half-life and the twitch point to different rows, both are shown and none is chosen', () => {
  const r = neo({ twitch: 'first-twitch-near-10-percent' });
  assert.deepEqual([r.flag, r.doseMg, r.abnormal], ['rows-differ', null, true]);
  assert.match(r.notes[0], /^0\.07 mg\/kg × 70 kg = 4\.9 mg/);
  assert.match(r.notes[1], /^0\.03 mg\/kg × 70 kg = 2\.1 mg/);
  assert.equal(neo({ halfLife: 'longer-acting-blocker' }).flag, 'rows-differ');
});

test('neostigmine: no dose under a 10% first twitch; the anticholinergic and 1-minute lines are always printed', () => {
  const r = neo({ twitch: 'first-twitch-under-10-percent' });
  assert.deepEqual([r.flag, r.doseMg], ['no-dose-under-10-percent', undefined]);
  for (const x of [r, neo({}), neo(WEAK)]) assert.match(x.notes.join(' '), /anticholinergic \(atropine or glycopyrrolate\).*over at least 1 minute/);
});

test('neostigmine: nothing is defaulted', () => {
  const n = (i) => neostigmineReversalDose(i, now).message;
  assert.match(n({}), /^Enter the weight/);
  assert.match(n({ weight: 70 }), /^Choose the train-of-four response/);
  assert.match(n({ weight: 70, twitch: 'first-twitch-near-10-percent' }), /^Choose the half-life class/);
  assert.match(n({ weight: 70, twitch: 'first-twitch-near-10-percent', halfLife: 'longer-acting-blocker' }), /^Choose the concentration/);
  assert.equal(neostigmineReversalDose(null, now).valid, false);
});

test('deferoxamine intravenous: 1,000 mg at up to 15 mg/kg/hour, then 500 mg at up to 125 mg/hour', () => {
  const first = def({});
  assert.deepEqual([first.flag, first.doseMg, first.maxRateMgPerHour, first.minimumHours, first.totalAfterMg], ['initial-dose', 1000, 300, 3.33, 1000]);
  assert.match(first.band, /at up to 300 mg\/hour \(no less than 3 h 20 min\)/);
  const next = def({ givenLast24h: 1000 });
  assert.deepEqual([next.flag, next.doseMg, next.maxRateMgPerHour, next.minimumHours, next.totalAfterMg], ['subsequent-dose', 500, 125, 4, 1500]);
  assert.match(first.notes.join(' '), /only for a patient in cardiovascular collapse/);
});

test('deferoxamine intramuscular: no rate, and the route sentence', () => {
  const r = def({ route: 'intramuscular', weight: 70 });
  assert.deepEqual([r.doseMg, r.maxRateMgPerHour, r.minimumHours], [1000, null, null]);
  assert.match(r.notes.join(' '), /all patients not in shock/);
});

test('deferoxamine: the 24-hour total against 6,000 mg', () => {
  const at = def({ givenLast24h: 5500 });
  assert.deepEqual([at.flag, at.totalAfterMg, at.remainingMg], ['subsequent-dose', 6000, 0]);
  const over = def({ givenLast24h: 5600 });
  assert.deepEqual([over.flag, over.abnormal], ['past-24-hour-maximum', true]);
  assert.match(over.band, /6,100 mg, past the label's maximum of 6,000 mg in 24 hours; 400 mg remains/);
});

test('deferoxamine: nothing is defaulted', () => {
  const d = (i) => deferoxamineAcuteIron(i, now).message;
  assert.match(d({}), /^Enter the weight/);
  assert.match(d({ weight: 70 }), /^Choose the route/);
  assert.match(d({ weight: 70, route: 'intramuscular' }), /^Enter the deferoxamine given in the last 24 hours.*Enter 0 if none/);
  assert.equal(deferoxamineAcuteIron(null, now).valid, false);
});
