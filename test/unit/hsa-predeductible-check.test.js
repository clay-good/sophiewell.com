// spec-v1601 tool 3: hsa-predeductible-check, against Notices 2004-23, 2019-45, 2026-5 and IRC 223(c)(2).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hsaPredeductibleCheck as h, CHRONIC } from '../../lib/hsa-predeductible-check.js';

test('a statin for diagnosed heart disease passes under Notice 2019-45', () => {
  const r = h({ item: 'statin', heart: '1', purpose: 'yes', planYear: '2026' });
  assert.equal(r.verdict, 'applies');
  assert.match(r.band, /statins for a person diagnosed with heart disease \(Notice 2019-45, Appendix: Heart disease and\/or diabetes\)/);
  assert.equal(h({ item: 'statin', diabetes: true }).verdict, 'applies');
});

test('the same statin with no qualifying diagnosis fails, and heart disease is not inferred', () => {
  const none = h({ item: 'statin', purpose: 'yes' });
  assert.equal(none.verdict, 'not');
  assert.match(none.band, /only for a person diagnosed with heart disease or diabetes.*None of those was checked/);
  assert.match(none.band, /no one it covers can contribute to an HSA/);
  const cad = h({ item: 'statin', cad: '1' });
  assert.equal(cad.verdict, 'not');
  assert.ok(cad.notes.some((n) => /does not define heart disease/.test(n)));
});

test('an item absent from every list fails', () => {
  const r = h({ item: 'treatment' });
  assert.equal(r.verdict, 'not');
  assert.match(r.band, /Notice 2004-23/);
  assert.equal(h({ item: 'male-contraception' }).verdict, 'not');
  assert.equal(h({ item: 'telehealth-extra' }).verdict, 'not');
});

test('every appendix row passes for each of its conditions and fails for none', () => {
  assert.equal(CHRONIC.length, 14);
  for (const row of CHRONIC) {
    for (const c of row.conditions) assert.equal(h({ item: row.value, [c]: '1' }).verdict, 'applies', `${row.value} ${c}`);
    assert.equal(h({ item: row.value }).verdict, 'not', row.value);
  }
});

test('a chronic-list item prescribed for another purpose fails; an unanswered purpose is disclosed', () => {
  assert.equal(h({ item: 'ics', asthma: '1', purpose: 'no' }).verdict, 'not');
  const blank = h({ item: 'ics', asthma: '1' });
  assert.equal(blank.verdict, 'applies');
  assert.ok(blank.notes.some((n) => /was not entered/.test(n)));
  assert.equal(h({ item: 'ics', asthma: '1', planYear: '2018' }).verdict, 'not');
});

test('insulin needs no diagnosis from plan years beginning in 2023', () => {
  assert.equal(h({ item: 'insulin', planYear: '2023' }).verdict, 'applies');
  assert.equal(h({ item: 'insulin', planYear: '2022' }).verdict, 'not');
  assert.equal(h({ item: 'insulin', planYear: '2022', diabetes: '1' }).verdict, 'applies');
  assert.equal(h({ item: 'insulin', planYear: '2018', diabetes: '1' }).verdict, 'not');
  assert.ok(h({ item: 'insulin' }).notes.some((n) => /No plan year was entered/.test(n)));
});

test('telehealth follows the windows in force, permanent from 2025', () => {
  assert.equal(h({ item: 'telehealth', planYear: '2026' }).verdict, 'applies');
  assert.equal(h({ item: 'telehealth', planYear: '2024' }).verdict, 'applies');
  assert.equal(h({ item: 'telehealth', planYear: '2022' }).verdict, 'depends');
  assert.equal(h({ item: 'telehealth', planYear: '2021' }).verdict, 'applies');
  assert.equal(h({ item: 'telehealth', planYear: '2019' }).verdict, 'not');
});

test('preventive care and the ACA list pass; blanks and bad years are asked for', () => {
  assert.equal(h({ item: 'screening' }).verdict, 'applies');
  assert.match(h({ item: 'aca' }).band, /Notice 2013-57/);
  assert.match(h({}).message, /^Choose what the plan would cover/);
  assert.match(h({ item: 'aca', planYear: '1999' }).message, /must be between 2004 and 2100/);
  assert.match(h({ item: 'ace', diabetes: '1' }).band, /ACE inhibitors for a person/);
});
