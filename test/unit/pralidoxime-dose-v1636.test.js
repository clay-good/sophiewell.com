// spec-v1636 tool 4: pralidoxime and DuoDote doses, from the labels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pralidoximeDose, LABELS } from '../../lib/pralidoxime-dose-v1636.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-12T12:00:00Z');
const p = (i, t) => pralidoximeDose(i, now, t);
const dead = (id) => ({ ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } });
const KID = 'pediatric-16-or-under';

test('both label rows answer; a route withholds only on its own label', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.name);
  assert.equal(p({ patient: 'adult', route: 'pralidoxime-iv' }, dead(LABELS.protopam.setId)).flag, 'withheld');
  assert.equal(p({ patient: 'adult', route: 'pralidoxime-iv' }, dead(LABELS.duodote.setId)).flag, 'dose');
  assert.equal(p({ patient: 'adult', route: 'duodote-autoinjector', severity: 'mild-symptoms', weight: 70 }, dead(LABELS.duodote.setId)).flag, 'withheld');
});

test('intravenous: the adult range, and 20 to 50 mg/kg to 2,000 mg in a pediatric patient', () => {
  const a = p({ patient: 'adult', route: 'pralidoxime-iv' });
  assert.deepEqual([a.doseMgLow, a.doseMgHigh], [1000, 2000]);
  assert.match(a.notes.join(' '), /should not exceed 200 mg\/minute/);
  const k = p({ patient: KID, route: 'pralidoxime-iv', weight: 20 });
  assert.deepEqual([k.doseMgLow, k.doseMgHigh], [400, 1000]);
  assert.match(k.notes[0], /10 to 20 mg\/kg\/hour \(200 to 400 mg\/hour\)/);
  assert.deepEqual((({ doseMgLow, doseMgHigh }) => [doseMgLow, doseMgHigh])(p({ patient: KID, route: 'pralidoxime-iv', weight: 50 })), [1000, 2000]);
  assert.deepEqual((({ doseMgLow, doseMgHigh }) => [doseMgLow, doseMgHigh])(p({ patient: KID, route: 'pralidoxime-iv', weight: 110 })), [2000, 2000]);
});

test('intramuscular: 600 mg injections in adults; 15 mg/kg under 40 kg and the adult dose from 40 kg', () => {
  const mild = p({ patient: 'adult', route: 'pralidoxime-im', severity: 'mild-symptoms' });
  assert.deepEqual([mild.doseMg, mild.courseMg], [600, 1800]);
  assert.match(mild.band, /600 mg \(2 mL at about 300 mg\/mL\), repeated after 15 minutes/);
  assert.match(p({ patient: 'adult', route: 'pralidoxime-im', severity: 'severe-symptoms' }).band, /three injections of 600 mg .* in rapid succession, 1,800 mg in all/);
  assert.deepEqual((({ doseMg, courseMg }) => [doseMg, courseMg])(p({ patient: KID, route: 'pralidoxime-im', severity: 'mild-symptoms', weight: 20 })), [300, 900]);
  assert.deepEqual((({ doseMg, courseMg }) => [doseMg, courseMg])(p({ patient: KID, route: 'pralidoxime-im', severity: 'mild-symptoms', weight: 39.9 })), [598.5, 1795.5]);
  assert.deepEqual((({ doseMg, courseMg }) => [doseMg, courseMg])(p({ patient: KID, route: 'pralidoxime-im', severity: 'severe-symptoms', weight: 40 })), [600, 1800]);
});

test('DuoDote: one for mild, three for severe, and no dose at 41 kg or under', () => {
  const d = (severity, weight, patient = 'adult') => p({ patient, route: 'duodote-autoinjector', severity, weight });
  assert.deepEqual([d('mild-symptoms', 70).autoinjectors, d('severe-symptoms', 70).autoinjectors], [1, 3]);
  assert.equal(d('severe-symptoms', 70).doseMg, 1800);
  assert.deepEqual([d('mild-symptoms', 41, KID).flag, d('mild-symptoms', 41.1, KID).flag], ['not-in-label', 'dose']);
});

test('nothing is defaulted', () => {
  assert.match(p({}).message, /^Choose adult, or pediatric patient/);
  assert.match(p({ patient: 'adult' }).message, /^Choose the route/);
  assert.match(p({ patient: 'adult', route: 'pralidoxime-im' }).message, /^Choose mild or severe symptoms/);
  assert.match(p({ patient: KID, route: 'pralidoxime-iv' }).message, /^Enter the weight/);
  assert.match(p({ patient: 'adult', route: 'duodote-autoinjector', severity: 'mild-symptoms' }).message, /^Enter the weight/);
  assert.equal(pralidoximeDose(null, now).valid, false);
});
