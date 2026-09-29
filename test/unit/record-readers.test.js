// spec-v1624 step 2 / spec-v1613 Tests: the C-CDA, FHIR and Apple Health
// readers and the picker, on synthetic records (no real person). The C-CDA
// and FHIR fixtures carry the same values, so they must give the same picks.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readCcda, hl7Date } from '../../lib/record-ccda.js';
import { readFhir } from '../../lib/record-fhir.js';
import { readApple } from '../../lib/record-apple.js';
import { pick, ageOn } from '../../lib/record-pick.js';

const read = (p) => readFileSync(new URL(`../fixtures/${p}`, import.meta.url), 'utf8');
const CONCEPTS = JSON.parse(readFileSync(new URL('../../data/concepts/concepts.json', import.meta.url), 'utf8'));
const NOW = new Date('2026-09-29T12:00:00Z');

test('C-CDA: results and vital signs only, LOINC and PQ, header birth date and gender', () => {
  const r = readCcda(read('records/ccd-labs.xml'));
  assert.equal(r.birthDate, '1968-03-15');
  assert.equal(r.sex, 'F');
  assert.equal(r.observations.length, 15, 'the medications section and the narrative are not read');
  assert.deepEqual(r.observations[0], { system: 'LOINC', code: '2160-0', value: 97, unit: 'umol/L', at: '2026-06-14' });
  assert.equal(hl7Date('202606141015-0500'), '2026-06-14');
});

test('FHIR: observations, blood pressure components, Patient; entered-in-error skipped', () => {
  const r = readFhir(JSON.parse(read('records/fhir-labs.json')));
  assert.equal(r.birthDate, '1968-03-15');
  assert.equal(r.sex, 'F');
  assert.ok(r.observations.some((o) => o.code === '8480-6' && o.value === 138));
  assert.ok(!r.observations.some((o) => o.value === 5.0), 'an entered-in-error result is skipped');
  const nd = readFhir(read('file-kinds/fhir-clinical.ndjson'));
  assert.equal(nd.observations.length, 2);
});

function checkPicks({ values, notChosen }) {
  assert.equal(values.age.value, 58);
  assert.equal(values.sex.value, 'F');
  assert.equal(values.creatinine.value, 1.1, '97 umol/L converts to 1.1 mg/dL');
  assert.equal(values['systolic-bp'].value, 138, 'the most recent blood pressure wins');
  assert.equal(values['body-weight'].value, 79.83);
  assert.equal(values.bmi.value, 29.3);
  assert.deepEqual(values.bmi.derivedFrom, ['body-weight', 'body-height']);
  assert.equal(values.egfr.value, 58); // 142 x (1.1/0.7)^-1.2 x 0.9938^58 x 1.012 = 58.2
  assert.deepEqual(values.egfr.derivedFrom, ['creatinine', 'age', 'sex']);
  // A 14-month-old LDL fills, with its date.
  assert.equal(values['ldl-cholesterol'].value, 128);
  assert.match(values['ldl-cholesterol'].note, /^From July 20, 2025, 14 months ago\.$/);
  // A 6-year-old triglyceride does not.
  assert.equal(values.triglycerides, undefined);
  assert.ok(notChosen.some((n) => n.concept === 'triglycerides' && /more than five years old/.test(n.reason)));
  // A potassium in an unlisted unit is shown and not filled.
  assert.equal(values.potassium, undefined);
  assert.ok(notChosen.some((n) => n.concept === 'potassium' && /unit \(mg\/dL\) is not one/.test(n.reason)));
  // Two ALTs at the same time disagree: neither fills.
  assert.equal(values.alt, undefined);
  assert.equal(notChosen.filter((n) => n.concept === 'alt' && /disagree/.test(n.reason)).length, 2);
  assert.equal(values.platelets.value, 245);
}

test('picks from the C-CDA: most recent, units, recency, too old, conflicts, derived values', () => {
  checkPicks(pick(readCcda(read('records/ccd-labs.xml')), CONCEPTS, NOW));
});

test('the FHIR bundle with the same values gives the same picks', () => {
  const a = pick(readCcda(read('records/ccd-labs.xml')), CONCEPTS, NOW);
  const b = pick(readFhir(JSON.parse(read('records/fhir-labs.json'))), CONCEPTS, NOW);
  checkPicks(b);
  const strip = (v) => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, { ...x, code: undefined, system: undefined }]));
  assert.deepEqual(strip(b.values), strip(a.values));
});

test('Apple Health: body measurements streamed in chunks, with the Me element', async () => {
  const xml = read('file-kinds/apple-export.xml').replace('</HealthData>', '<Record type="HKQuantityTypeIdentifierHeight" unit="ft" value="5.5" startDate="2026-09-01 08:00:00 -0500"/>\n<Record type="HKQuantityTypeIdentifierHeartRate" unit="count/min" value="70" startDate="2026-09-01 08:00:00 -0500"/>\n</HealthData>');
  async function* chunks() { for (let i = 0; i < xml.length; i += 37) yield xml.slice(i, i + 37); }
  const r = await readApple(chunks());
  assert.equal(r.birthDate, '1960-01-15');
  assert.equal(r.sex, 'F');
  assert.deepEqual(r.observations.map((o) => o.code), ['HKQuantityTypeIdentifierBodyMass', 'HKQuantityTypeIdentifierHeight']);
  const p = pick(r, CONCEPTS, NOW);
  assert.equal(p.values['body-weight'].value, 72.57);
  assert.equal(p.values['body-height'].value, 167.64);
  assert.equal(p.values.bmi.value, 25.8);
});

test('age on a date, and a sex the tools cannot use is not filled', () => {
  assert.equal(ageOn('1968-09-30', NOW), 57);
  assert.equal(ageOn('1968-09-29', NOW), 58);
  assert.equal(pick({ observations: [], sex: 'UN' }, CONCEPTS, NOW).values.sex, undefined);
});

test('plan: ready tools, tools with yes/no questions, and tools one value short', async () => {
  const { plan } = await import('../../lib/record-plan.js');
  const { REGISTRY } = await import('../../mcp/tools.js');
  const { buildIndex } = await import('../../scripts/build-field-index.mjs');
  const { index } = buildIndex([...REGISTRY.values()]);
  const tools = Object.keys(index).map((id) => ({ id, name: id, rows: index[id] }));
  const { values } = pick(readCcda(read('records/ccd-labs.xml')), CONCEPTS, NOW);
  const p = plan(values, tools, CONCEPTS);
  const ready = Object.fromEntries(p.ready.map((r) => [r.id, r]));
  assert.deepEqual(ready.egfr.fills, { scr: 1.1, age: 58, sex: 'F' });
  assert.deepEqual(ready.egfr.questions, []);
  assert.equal(ready['cockcroft-gault'].fills.w, 79.83);
  // PREVENT: every number from the record; smoking, treatment and diabetes asked.
  assert.deepEqual(ready.prevent.questions.map((q) => q.d).sort(), ['pv-dm', 'pv-smk', 'pv-trt']);
  assert.equal(ready.prevent.fills['pv-egfr'], 58);
  // SCORE2 takes cholesterol in mmol/L: 212 mg/dL is 5.482.
  assert.equal(ready.score2 && ready.score2.fills['s2-tc'], 5.482);
  // FIB-4 has AST and platelets but no ALT (two disagreeing ALTs filled neither).
  const short = Object.fromEntries(p.oneShort.map((r) => [r.id, r]));
  assert.equal(short.fib4.missing.d, 'fib4-alt');
  // Nothing is filled into a yes/no field.
  for (const r of [...p.ready, ...p.oneShort]) for (const d of Object.keys(r.fills)) assert.notEqual(index[r.id].find((x) => x.d === d).k, 'bool');
});
