// spec-v1505 tool 3: lcd-diagnosis-check, on small articles shaped like the MCD export's.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lcdDiagnosisCheck as c, normalizeIcd, parseDiagnoses } from '../../lib/lcd-diagnosis-check.js';

const one = { id: '1', displayId: 'A1', title: 'One group', states: ['TX'], regions: [], codes: { 1: ['J9035'] }, covered: { 1: ['C18.9', 'C34.90'] }, noncovered: {}, asterisked: ['C34.90'], paragraphs: { codes: {}, covered: { 1: 'Bill with a secondary code for the stage.' }, noncovered: {} } };
const paired = { id: '2', displayId: 'A2', title: 'Two groups', states: ['TX'], regions: [], codes: { 1: ['64483'], 2: ['64490'] }, covered: { 1: ['M54.16'], 2: ['M47.816'] }, noncovered: { 1: ['M54.50'] }, asterisked: [], paragraphs: { codes: {}, covered: {}, noncovered: { 1: 'Not covered for nonspecific low back pain.' } } };
const prose = { id: '3', displayId: 'A3', title: 'Prose pairing', states: ['TX'], regions: [], codes: { 1: ['11111'], 2: ['22222'] }, covered: { 3: ['Z00.00'] }, noncovered: {}, asterisked: [], paragraphs: { codes: {}, covered: { 3: 'Group 3 supports group 2 codes only.' }, noncovered: {} } };
const ny = { ...one, id: '4', displayId: 'A4', states: ['NY'], regions: ['New York - Upstate'] };

test('a diagnosis in the covered list supports the code; asterisked codes and paragraphs are shown, not evaluated', () => {
  const r = c({ code: 'J9035', diagnoses: 'C3490', state: 'TX', articles: [one] });
  assert.equal(r.verdict, 'covered');
  assert.ok(r.notes.some((n) => /C34\.90 supports the code \(asterisked/.test(n)));
  assert.ok(r.notes.some((n) => /A1 says: Bill with a secondary code/.test(n)));
  assert.equal(c({ code: 'J9035', diagnoses: 'J45.909', state: 'TX', articles: [one] }).verdict, 'not covered', 'not in a covered list');
});

test('group pairing: the same-numbered covered group applies; a non-covered group says why', () => {
  assert.equal(c({ code: '64483', diagnoses: 'M54.16', state: 'TX', articles: [paired] }).verdict, 'covered');
  assert.equal(c({ code: '64483', diagnoses: 'M47.816', state: 'TX', articles: [paired] }).verdict, 'not covered', 'group 2 diagnosis does not support a group 1 code');
  const non = c({ code: '64483', diagnoses: 'M54.50', state: 'TX', articles: [paired] });
  assert.equal(non.verdict, 'not covered');
  assert.ok(non.notes.some((n) => /A2 says: Not covered for nonspecific low back pain/.test(n)));
  assert.equal(c({ code: '22222', diagnoses: 'Z00.00', state: 'TX', articles: [prose] }).verdict, 'not decided');
});

test('the state decides which articles apply; none means not addressed, never not covered', () => {
  const r = c({ code: 'J9035', diagnoses: 'C18.9', state: 'KS', articles: [one], edition: '2026-10-01 weekly' });
  assert.equal(r.verdict, 'not addressed');
  assert.match(r.band, /^No billing and coding article for KS lists J9035 \(MCD export 2026-10-01 weekly\)\. .*an LCD, an NCD or the contractor may still decide/);
  assert.ok(c({ code: 'J9035', diagnoses: 'C18.9', state: 'NY', articles: [ny] }).notes.some((n) => /A4 applies only in New York - Upstate/.test(n)));
});

test('codes are normalized; bad input is asked for', () => {
  assert.equal(normalizeIcd('e119'), 'E11.9');
  assert.equal(normalizeIcd('C18.9'), 'C18.9');
  assert.equal(normalizeIcd('U07'), null, 'U codes are not ICD-10-CM diagnoses in these articles');
  assert.deepEqual(parseDiagnoses('E11.9, e119; I10'), { ok: ['E11.9', 'I10'], bad: [] });
  assert.match(c({}).message, /^Enter the HCPCS or CPT code/);
  assert.match(c({ code: 'J9035', diagnoses: 'zzz', state: 'TX', articles: [] }).message, /zzz is not an ICD-10-CM code/);
  assert.match(c({ code: 'J9035', diagnoses: 'C18.9', articles: [] }).message, /^Choose the state/);
  assert.match(c({ code: 'J9035', diagnoses: 'C18.9', state: 'TX' }).message, /could not be loaded/);
});
