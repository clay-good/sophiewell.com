// spec-v1636 tool 7: intubation drug doses from the four labels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rsiDoseSheet, LABELS } from '../../lib/rsi-dose-sheet-v1636.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-12T12:00:00Z');
const r = (i, t) => rsiDoseSheet({ weight: 80, age: 45, patient: 'adult', ketamineConcentration: '50-mg-ml', ...i }, now, t);
const dead = (id) => ({ ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } });
const row = (x, drug) => x.rows.find((k) => k.drug === drug);

test('all four label rows answer; a superseded one drops only its own drug', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.name);
  const x = r({}, dead(LABELS.ketamine.setId));
  assert.deepEqual(x.rows.map((k) => k.drug), ['etomidate', 'succinylcholine', 'rocuronium']);
  assert.match(x.notes.join(' '), /Not shown, because the label row is withheld: KETALAR/);
  assert.equal(x.abnormal, true);
});

test('an adult at 80 kg: each label\'s range in mg and mL', () => {
  const x = r({});
  assert.deepEqual([x.flag, x.abnormal, x.rows.length], ['sheet', false, 4]);
  assert.match(row(x, 'etomidate').text, /usual 0\.3 mg\/kg, 24 mg \(12 mL\); label range 0\.2 to 0\.6 mg\/kg, 16 to 48 mg \(8 to 24 mL\)/);
  assert.match(row(x, 'ketamine').text, /intravenous 1 to 4\.5 mg\/kg, 80 to 360 mg \(1\.6 to 7\.2 mL\).*average is 2 mg\/kg, 160 mg \(3\.2 mL\).*Intramuscular 6\.5 to 13 mg\/kg, 520 to 1,040 mg/);
  assert.match(row(x, 'succinylcholine').text, /average 0\.6 mg\/kg, 48 mg \(2\.4 mL\); label range 0\.3 to 1\.1 mg\/kg, 24 to 88 mg/);
  assert.match(row(x, 'succinylcholine').text, /150 mg, the label's maximum by this route/);
  assert.match(row(x, 'rocuronium').text, /intubation 0\.6 mg\/kg, 48 mg \(4\.8 mL\); rapid sequence intubation 0\.6 to 1\.2 mg\/kg, 48 to 96 mg \(4\.8 to 9\.6 mL\).*actual body weight/);
});

test('where a label gives no dose for the age, the row says so and no number is shown', () => {
  const kid = r({ weight: 12, age: 2, patient: 'infant-or-small-child', ketamineConcentration: '10-mg-ml' });
  assert.deepEqual([kid.flag, kid.abnormal], ['some-drugs-have-no-label-dose', true]);
  assert.deepEqual([row(kid, 'etomidate').hasDose, row(kid, 'ketamine').hasDose], [false, false]);
  assert.doesNotMatch(row(kid, 'etomidate').text, /\d+(\.\d+)? mg \(/);
  assert.match(row(kid, 'succinylcholine').text, /2 mg\/kg for infants and other small pediatric patients, 24 mg \(1\.2 mL\).*36 to 48 mg, not more than 150 mg/);
  assert.match(row(kid, 'rocuronium').text, /does not recommend rocuronium for rapid sequence intubation in pediatric patients/);
});

test('the age edges: etomidate above 10 (exactly 10 unstated), ketamine from 16', () => {
  const teen = (age) => r({ weight: 40, age, patient: 'older-child-or-adolescent', ketamineConcentration: '10-mg-ml' });
  assert.deepEqual([row(teen(9), 'etomidate').hasDose, row(teen(10), 'etomidate').hasDose, row(teen(11), 'etomidate').hasDose], [false, false, true]);
  assert.match(row(teen(10), 'etomidate').text, /at exactly 10 years it says neither/);
  assert.deepEqual([row(teen(15), 'ketamine').hasDose, row(teen(16), 'ketamine').hasDose], [false, true]);
  assert.match(row(teen(12), 'succinylcholine').text, /1 mg\/kg for older pediatric patients and adolescents, 40 mg \(2 mL\)/);
});

test('ketamine at 100 mg/mL carries the dilution sentence', () => {
  assert.match(row(r({ ketamineConcentration: '100-mg-ml' }), 'ketamine').text, /not to give the 100 mg\/mL concentration intravenously without proper dilution/);
  assert.doesNotMatch(row(r({}), 'ketamine').text, /without proper dilution/);
});

test('nothing is defaulted', () => {
  const m = (i) => rsiDoseSheet(i, now).message;
  assert.match(m({}), /^Enter the weight/);
  assert.match(m({ weight: 80 }), /^Enter the age/);
  assert.match(m({ weight: 80, age: 45 }), /^Choose the patient group/);
  assert.match(m({ weight: 80, age: 45, patient: 'adult' }), /^Choose the ketamine concentration/);
  assert.equal(rsiDoseSheet(null, now).valid, false);
});
