// spec-v1601 tool 1: preventive-owed and the spec-v1621 §3.6 uspstf builder. The fixture is the A and B page's
// real markup trimmed to five rows (AAA, two chlamydia and gonorrhea rows, two colorectal rows) (read October 3, 2026); the records test runs over the shipped list.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { preventiveOwed, binding, bindsFrom, RISKS } from '../../lib/preventive-owed.js';
import { hrsaWomensGuidelines } from '../../lib/hrsa-womens-guidelines.js';
import uspstf, { parse, parseTable, keyOf } from '../../scripts/data/builders/uspstf.mjs';
import { checkDataset } from '../../scripts/data/check.mjs';

const ROOT = process.cwd();
const records = JSON.parse(readFileSync(join(ROOT, 'data', 'uspstf', 'shards', 'recommendations.json'), 'utf8'));
const pops = JSON.parse(readFileSync(join(ROOT, 'scripts', 'data', 'uspstf-populations.json'), 'utf8'));
const page = readFileSync(join(ROOT, 'test', 'fixtures', 'data-sources', 'uspstf', 'ab.html'));
const base = { records, plan: 'private', planYearStart: '2027-01-01' };
const keys = (list) => list.map((r) => r.key);

test('the builder reads the table, keys each row by alias and description, and needs a population for every row', async () => {
  const rows = parseTable(page.toString('utf8'));
  assert.equal(rows.length, 5);
  const [aaa] = rows;
  assert.equal(aaa.key, keyOf('abdominal-aortic-aneurysm-screening', aaa.description));
  assert.deepEqual([aaa.grade, aaa.released, aaa.priorGradeAOrB, aaa.population], ['B', '2019-12', true, 'men aged 65 to 75 years who have ever smoked']);
  assert.equal(new Set(rows.filter((r) => r.alias === 'chlamydia-and-gonorrhea-screening').map((r) => r.key)).size, 2, 'two rows of one topic stay apart');
  const { records: out } = await parse(page, {}, { bounds: false, populations: pops.populations });
  assert.deepEqual(checkDataset({ records: out, canaries: uspstf.stableCanaries, shape: uspstf.shape }).problems, []);
  await assert.rejects(parse(page, {}, { bounds: false, populations: {} }), /no curated population for abdominal-aortic-aneurysm-screening#/);
});

test('every shipped row has a curated population, and every risk it names has a question', () => {
  assert.equal(records.length, Object.keys(pops.populations).length);
  for (const r of records) for (const k of r.risks) assert.ok(RISKS[k], `${r.key}: ${k}`);
});

test('the one-year rule, to the month the list gives', () => {
  assert.equal(binding('2025-06', new Date(Date.UTC(2026, 6, 1))), 'yes');
  assert.equal(binding('2025-06', new Date(Date.UTC(2026, 5, 15))), 'month');
  assert.equal(binding('2025-06', new Date(Date.UTC(2026, 4, 31))), 'no');
});

test('a 52-year-old woman: colorectal 50-75 owed, not 45-49; cervical and breast screening owed; blanks become questions', () => {
  const r = preventiveOwed({ ...base, age: '52', sex: 'female', pregnancy: 'no' });
  const owed = keys(r.owed);
  assert.ok(owed.some((k) => k.startsWith('colorectal-cancer-screening#') && records.find((x) => x.key === k).ageMin === 50));
  assert.ok(!owed.some((k) => k.startsWith('colorectal-cancer-screening#') && records.find((x) => x.key === k).ageMin === 45));
  assert.ok(owed.some((k) => k.startsWith('cervical-cancer-screening#')) && owed.some((k) => k.startsWith('breast-cancer-screening#')));
  const brca = r.depends.find((x) => x.key.startsWith('brca-related'));
  assert.deepEqual(brca.questions, [RISKS['brca-history']]);
  assert.ok(!keys([...r.owed, ...r.depends]).some((k) => k.startsWith('abdominal-aortic')), 'a men-only row never shows for a woman');
  assert.ok(!keys([...r.owed, ...r.depends]).some((k) => k.startsWith('gestational-diabetes')), 'a pregnancy row never shows for someone not pregnant');
});

test('a no answer rules a row out; a yes answer moves it to owed; blank age or sex is a question, not a guess', () => {
  const no = preventiveOwed({ ...base, age: '70', sex: 'male', risks: { 'ever-smoked': 'no' } });
  assert.ok(!keys([...no.owed, ...no.depends]).some((k) => k.startsWith('abdominal-aortic')));
  const yes = preventiveOwed({ ...base, age: '70', sex: 'male', risks: { 'ever-smoked': 'yes' } });
  assert.ok(keys(yes.owed).some((k) => k.startsWith('abdominal-aortic')));
  const blank = preventiveOwed({ ...base });
  const aaa = blank.depends.find((x) => x.key.startsWith('abdominal-aortic'));
  assert.deepEqual(aaa.questions, ['What is their sex at birth?', 'How old are they?', RISKS['ever-smoked']]);
});

test('a plan year starting before a new recommendation binds lists it as not yet required, or the earlier version when one existed', () => {
  const r = preventiveOwed({ ...base, planYearStart: '2025-07-01', age: '30', sex: 'female', pregnancy: 'pregnant' });
  const syph = [...r.depends, ...r.notYet].find((x) => x.key.startsWith('syphilis-infection-in-pregnancy'));
  assert.ok(r.depends.includes(syph), 'May 2025, replacing an earlier A: the earlier version binds');
  assert.match(syph.questions.at(-1), /earlier A or B version it replaced is/);
});

test('a grandfathered plan gets no list and says why; Medicare gets its own note', () => {
  assert.match(preventiveOwed({ ...base, plan: 'grandfathered' }).band, /grandfathered plan is not required/);
  assert.match(preventiveOwed({ ...base, plan: 'medicare', age: '70' }).notes[0], /^Medicare does not follow this list/);
  assert.equal(preventiveOwed({ ...base, planYearStart: '' }).message, 'Enter the date the plan year starts (YYYY-MM-DD).');
});

// The HRSA women's guidelines (147.130(a)(1)(iv)), read October 9, 2026; acceptance dates from HRSA's Federal
// Register notices.
test('HRSA rows: the one-year rule to the day, from the acceptance date', () => {
  const start = (d) => preventiveOwed({ ...base, planYearStart: d, age: '35', sex: 'female', pregnancy: 'no', risks: { 'cervical-average-risk': 'yes' } });
  const cervical = (r) => [...r.owed, ...r.notYet].filter((x) => x.key === 'hrsa-cervical-cancer-screening').map((x) => x.released);
  // Accepted December 29, 2025: binds plan years beginning on or after December 29, 2026.
  assert.deepEqual(cervical(start('2026-12-28')), ['2016-12-20', '2025-12-29'], 'the 2016 version owed, the 2025 one not yet');
  assert.deepEqual(cervical(start('2026-12-29')), ['2025-12-29']);
  assert.equal(start('2026-12-28').notYet.find((x) => x.key === 'hrsa-cervical-cancer-screening').binds, 'plan years beginning on or after December 29, 2026');
});

test('HRSA rows: men never see them; an adult answers "adolescent or adult" by age; a child is asked', () => {
  const man = preventiveOwed({ ...base, age: '40', sex: 'male' });
  assert.ok(![...man.owed, ...man.depends, ...man.notYet].some((x) => x.source === 'HRSA'));
  const woman = preventiveOwed({ ...base, age: '30', sex: 'female', pregnancy: 'no' });
  assert.ok(keys(woman.owed).includes('hrsa-well-woman') && keys(woman.owed).includes('hrsa-contraception'));
  assert.ok(!keys([...woman.owed, ...woman.depends]).includes('hrsa-breast-cancer-screening'), 'under 40');
  const child = preventiveOwed({ ...base, age: '12', sex: 'female', pregnancy: 'no' });
  assert.deepEqual(child.depends.find((x) => x.key === 'hrsa-well-woman').questions, [RISKS['adolescent-or-adult']]);
  const no = preventiveOwed({ ...base, age: '8', sex: 'female', pregnancy: 'no', risks: { 'adolescent-or-adult': 'no' } });
  assert.ok(!keys([...no.owed, ...no.depends]).includes('hrsa-well-woman'));
});

test('HRSA rows: a revision whose earlier text was not read is "depends" before it binds, a new service is "not yet"', () => {
  const r = preventiveOwed({ ...base, planYearStart: '2024-01-01', age: '45', sex: 'female', pregnancy: 'no', risks: { 'breast-or-cervical-screening': 'yes' } });
  const ui = r.depends.find((x) => x.key === 'hrsa-urinary-incontinence');
  assert.match(ui.questions.at(-1), /earlier HRSA version it revised applies before then/);
  assert.ok(keys(r.notYet).includes('hrsa-patient-navigation'));
  assert.ok(keys(r.owed).includes('hrsa-breast-cancer-screening') && r.owed.find((x) => x.key === 'hrsa-breast-cancer-screening').released === '2016-12-20');
});

test('HRSA rows: pregnancy and history decide the diabetes rows; contraception carries the exemption note', () => {
  const preg = preventiveOwed({ ...base, age: '30', sex: 'female', pregnancy: 'pregnant' });
  assert.ok(keys(preg.owed).includes('hrsa-diabetes-in-pregnancy') && keys(preg.owed).includes('hrsa-breastfeeding'));
  assert.ok(!keys([...preg.owed, ...preg.depends]).includes('hrsa-diabetes-after-pregnancy'));
  const after = preventiveOwed({ ...base, age: '30', sex: 'female', pregnancy: 'postpartum', risks: { 'gdm-history-no-t2d': 'yes' } });
  assert.ok(keys(after.owed).includes('hrsa-diabetes-after-pregnancy'));
  assert.match(after.owed.find((x) => x.key === 'hrsa-contraception').note, /147\.132 and 147\.133/);
});

test('HRSA list: every risk has a question, every date is real, and past its review date it says so', () => {
  const { guidelines, expired } = hrsaWomensGuidelines(new Date('2026-10-09T00:00:00Z'));
  assert.equal(expired, false);
  assert.equal(guidelines.length, 14);
  for (const g of guidelines) {
    for (const k of g.risks || []) assert.ok(RISKS[k], `${g.key}: ${k}`);
    for (const d of [g.issued, g.earlier?.issued].filter(Boolean)) assert.equal(bindsFrom(d).toISOString().slice(5, 10), d.slice(5, 10), `${g.key}: ${d}`);
    assert.match(g.noticeUrl, /^https:\/\/www\.federalregister\.gov\/d\/\d{4}-\d{5}$/);
  }
  const late = preventiveOwed({ ...base, age: '30', sex: 'female', now: new Date('2028-01-01T00:00:00Z') });
  assert.ok(late.notes.some((n) => /December 2025 list, which is due for review/.test(n)));
});
