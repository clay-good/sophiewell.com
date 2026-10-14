// spec-v1640 tools 6, 7 and 8: the label tools (eliglustat, siponimod, poor-metabolizer dose rows).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { siponimodCyp2c9Dose as sip, MAYZENT } from '../../lib/siponimod-cyp2c9-dose-v1640.js';
import { eliglustatCyp2d6Dose as elg, CERDELGA } from '../../lib/eliglustat-cyp2d6-dose-v1640.js';
import { pgxLabelDoseLimit as pld, DRUGS } from '../../lib/pgx-label-dose-limit-v1640.js';

const row = (label, extra = {}) => ({ label, splVersion: 1, publishedOn: '2026-01-01', verifiedOn: '2026-10-13', validThrough: '2027-10-13', ...extra });
const NOW = new Date('2026-10-13T12:00:00Z');
const T = { [MAYZENT]: row('Mayzent'), [CERDELGA]: row('Cerdelga'), ...Object.fromEntries(DRUGS.map((d) => [d.setId, row(d.brand)])) };
const s = (genotype, t = T) => sip({ genotype }, NOW, t);
const e = (status, hepatic = 'no-hepatic-impairment', renal = 'no-renal-impairment', cyp2d6Inhibitor = 'none', cyp3aInhibitor = 'none') => elg({ status, hepatic, renal, cyp2d6Inhibitor, cyp3aInhibitor }, NOW, T);
const p = (o, t = T) => pld(o, NOW, t);

test('siponimod: the label doses by genotype, not phenotype', () => {
  assert.deepEqual([s('*2/*2').maintenanceMg, s('*1/*1').maintenanceMg, s('*1/*2').maintenanceMg], [2, 2, 2]);
  assert.deepEqual([s('*1/*3').maintenanceMg, s('*2/*3').maintenanceMg], [1, 1]);
  assert.deepEqual(s('*1/*2').titrationMg, [0.25, 0.25, 0.5, 0.75, 1.25]);
  assert.deepEqual(s('*1/*3').titrationMg, [0.25, 0.25, 0.5, 0.75]);
  assert.match(s('*1/*3').band, /4-day titration, then 1 mg once daily starting on Day 5/);
  assert.match(s('*2/*2').band, /5-day titration, then 2 mg once daily starting on Day 6/);
  assert.match(s('*1/*3').notes.join(' '), /7-tablet starter pack.*missed for more than 24 hours/);
});

test('siponimod: *3/*3 is contraindicated; another allele has no label dosage; a blank does not answer', () => {
  assert.deepEqual([s('*3/*3').flag, s('*3/*3').abnormal, s('*3/*3').maintenanceMg], ['contraindicated', true, null]);
  const o = s('other');
  assert.deepEqual([o.flag, o.maintenanceMg], ['no-label-dosage', null]);
  assert.match(o.notes[0], /other than \*2 and \*3 on the pharmacokinetics of siponimod has not been evaluated/);
  for (const g of ['', undefined, '*1/*8', 'intermediate']) assert.equal(s(g).valid, false);
});

test('siponimod: a superseded label shows no figure', () => {
  const r = s('*1/*1', { ...T, [MAYZENT]: row('Mayzent', { supersededOn: '2026-11-01' }) });
  assert.deepEqual([r.withheld, r.maintenanceMg, r.notes.length], [true, undefined, 0]);
  assert.doesNotMatch(r.band, /2 mg/);
});

test('eliglustat: Table 1 and the limitations of use', () => {
  assert.equal(e('extensive').dosage, '84 mg twice daily');
  assert.equal(e('intermediate').dosage, '84 mg twice daily');
  assert.equal(e('poor').dosage, '84 mg once daily');
  // The two limitations of use need no other entry.
  assert.equal(elg({ status: 'ultrarapid' }, NOW, T).flag, 'limitation-of-use');
  assert.deepEqual([elg({ status: 'indeterminate' }, NOW, T).flag, elg({ status: 'indeterminate' }, NOW, T).dosage], ['no-label-dosage', null]);
});

test('eliglustat: section 4 contraindications', () => {
  const ci = (...a) => e(...a).flag === 'contraindicated';
  assert.ok(ci('poor', undefined, undefined, 'none', 'strong'));
  assert.ok(ci('intermediate', 'mild-child-pugh-a'));
  assert.ok(ci('poor', 'mild-child-pugh-a'));
  assert.ok(ci('extensive', 'mild-child-pugh-a', undefined, 'moderate'));
  assert.ok(ci('extensive', 'moderate-child-pugh-b'));
  assert.ok(ci('extensive', 'severe-child-pugh-c'));
  assert.ok(ci('extensive', undefined, undefined, 'strong', 'moderate'));
  assert.ok(ci('intermediate', undefined, undefined, 'moderate', 'moderate'));
  assert.ok(ci('intermediate', undefined, undefined, 'none', 'strong'));
  // An extensive metabolizer may take a strong CYP3A inhibitor alone: Table 2, once daily.
  assert.equal(e('extensive', undefined, undefined, 'none', 'strong').dosage, '84 mg once daily');
});

test('eliglustat: renal rows and the Table 5 "avoid" cells', () => {
  assert.equal(e('extensive', undefined, 'mild-to-severe').dosage, '84 mg twice daily');
  assert.match(e('extensive', undefined, 'mild-to-severe').notes.join(' '), /No dosage adjustment is recommended in patients with mild, moderate, or severe renal impairment/);
  assert.equal(e('extensive', undefined, 'esrd').flag, 'avoid');
  assert.equal(e('intermediate', undefined, 'mild-to-severe').flag, 'avoid');
  assert.equal(e('poor', undefined, 'mild-to-severe').flag, 'avoid');
  assert.equal(e('poor', undefined, undefined, 'none', 'weak').flag, 'avoid');
  assert.equal(e('poor', undefined, undefined, 'none', 'moderate').flag, 'avoid');
  assert.equal(e('intermediate', undefined, undefined, 'none', 'moderate').flag, 'avoid');
  // Poor metabolizer, strong or moderate CYP2D6 with a moderate CYP3A inhibitor: Table 5 says avoid.
  assert.equal(e('poor', undefined, undefined, 'strong', 'moderate').flag, 'avoid');
  assert.equal(e('intermediate', undefined, undefined, 'none', 'weak').dosage, '84 mg twice daily');
});

test('eliglustat: Table 2 once-daily rows', () => {
  assert.equal(e('extensive', 'mild-child-pugh-a', undefined, 'weak').dosage, '84 mg once daily');
  assert.equal(e('extensive', 'mild-child-pugh-a', undefined, 'none', 'weak').dosage, '84 mg once daily');
  assert.equal(e('extensive', 'mild-child-pugh-a').dosage, '84 mg twice daily');
  assert.equal(e('extensive', undefined, undefined, 'strong').dosage, '84 mg once daily');
  assert.equal(e('extensive', undefined, undefined, 'weak').dosage, '84 mg twice daily');
  assert.equal(e('extensive', undefined, undefined, 'none', 'moderate').dosage, '84 mg once daily');
  assert.equal(e('extensive', undefined, undefined, 'none', 'weak').dosage, '84 mg twice daily');
  assert.equal(e('intermediate', undefined, undefined, 'moderate').dosage, '84 mg once daily');
  assert.equal(e('poor', undefined, undefined, 'strong').dosage, '84 mg once daily');
});

test('eliglustat: a pair Table 5 has no row for gets no dosage, and a blank entry is not read as "none"', () => {
  for (const [a, b] of [['weak', 'strong'], ['weak', 'weak'], ['strong', 'weak']]) {
    const r = e('extensive', undefined, undefined, a, b);
    assert.deepEqual([r.flag, r.dosage, r.abnormal], ['no-row-for-the-pair', null, true]);
  }
  assert.equal(e('extensive', 'mild-child-pugh-a', undefined, 'weak', 'weak').flag, 'no-row-for-the-pair');
  for (const k of ['hepatic', 'renal', 'cyp2d6Inhibitor', 'cyp3aInhibitor']) {
    const full = { status: 'extensive', hepatic: 'no-hepatic-impairment', renal: 'no-renal-impairment', cyp2d6Inhibitor: 'none', cyp3aInhibitor: 'none' };
    const r = elg({ ...full, [k]: '' }, NOW, T);
    assert.equal(r.valid, false, k);
    assert.match(r.message, /^Choose /);
  }
  assert.equal(elg({}, NOW, T).valid, false);
});

test('label dose rows: tetrabenazine', () => {
  const t = (status, dailyDose, singleDose) => p({ drug: 'tetrabenazine', status, dailyDose, singleDose });
  assert.equal(t('poor', 62.5).flag, 'over-the-label-ceiling');
  assert.equal(t('poor', 50, 37.5).flag, 'over-the-label-ceiling');
  assert.equal(t('poor', 50, 25).flag, 'at-the-label-ceiling');
  assert.equal(t('normal', 100).flag, 'at-the-label-ceiling');
  assert.equal(t('intermediate', 75, 37.5).flag, 'at-the-label-ceiling');
  assert.equal(t('normal', 112.5).abnormal, true);
  assert.equal(t('status-not-known', 62.5).flag, 'genotype-first');
  assert.equal(t('status-not-known', 37.5, 12.5).flag, 'within-the-label-ceiling');
  assert.match(t('poor', 25).notes.join(' '), /No single dose was entered/);
  assert.equal(t('ultrarapid', 50).flag, 'no-label-adjustment');
  assert.equal(t('poor', '').valid, false);
});

test('label dose rows: single ceilings', () => {
  const d = (drug, dailyDose, status = 'poor') => p({ drug, status, dailyDose });
  assert.deepEqual([d('deutetrabenazine', 36).flag, d('deutetrabenazine', 42).flag, d('deutetrabenazine', 24).flag], ['at-the-label-ceiling', 'over-the-label-ceiling', 'within-the-label-ceiling']);
  assert.deepEqual([d('vortioxetine', 10).flag, d('vortioxetine', 20).abnormal], ['at-the-label-ceiling', true]);
  assert.deepEqual([d('citalopram', 20).flag, d('citalopram', 40).abnormal], ['at-the-label-ceiling', true]);
  assert.deepEqual([d('valbenazine', 40).flag, d('valbenazine', 80).flag, d('valbenazine', 20).flag], ['at-the-label-dosage', 'over-the-label-dosage', 'under-the-label-dosage']);
  // Any status but poor: the label states no adjustment, and no dose is needed to say so.
  for (const drug of DRUGS.map((x) => x.value).filter((x) => x !== 'tetrabenazine' && x !== 'pimozide')) {
    for (const status of ['intermediate', 'normal', 'ultrarapid', 'status-not-known']) assert.equal(p({ drug, status }).flag, 'no-label-adjustment', `${drug} ${status}`);
  }
});

test('label dose rows: pimozide', () => {
  const m = (o) => p({ drug: 'pimozide', status: 'poor', ...o });
  const child = m({ population: 'pediatric', weight: 20, dailyDose: 1.5 });
  assert.deepEqual([child.flag, child.dailyCeilingMg], ['over-the-label-ceiling', 1]);
  assert.match(child.notes[0], /0\.08 mg\/kg\/day|0\.07 mg\/kg\/day/);
  assert.equal(m({ population: 'pediatric', weight: 20, dailyDose: 1 }).flag, 'at-the-label-ceiling');
  assert.equal(m({ population: 'adult', dailyDose: 4 }).flag, 'at-the-label-ceiling');
  const early = m({ population: 'adult', dailyDose: 4, daysSinceIncrease: 10 });
  assert.deepEqual([early.flag, early.abnormal], ['increase-too-early', true]);
  assert.equal(m({ population: 'adult', dailyDose: 4, daysSinceIncrease: 14 }).flag, 'at-the-label-ceiling');
  assert.match(m({ population: 'adult', dailyDose: 2 }).notes.join(' '), /were not entered, so the 14-day interval is not checked/);
  assert.equal(p({ drug: 'pimozide', status: 'status-not-known', population: 'adult', dailyDose: 6 }).flag, 'genotype-first');
  assert.equal(p({ drug: 'pimozide', status: 'status-not-known', population: 'adult', dailyDose: 2 }).flag, 'no-label-adjustment');
  assert.equal(p({ drug: 'pimozide', status: 'normal' }).flag, 'no-label-adjustment');
  assert.equal(m({ population: 'pediatric', dailyDose: 1 }).valid, false);
  assert.equal(m({ dailyDose: 1 }).valid, false);
});

test('label dose rows: fractions', () => {
  const a = (o) => p({ drug: 'aripiprazole', status: 'poor', usualDose: 15, ...o });
  assert.equal(a({ indication: 'schizophrenia', cyp3a4Inhibitor: 'no-cyp3a4-inhibitor' }).adjustedDoseMg, 7.5);
  assert.equal(a({ indication: 'schizophrenia', cyp3a4Inhibitor: 'strong-cyp3a4-inhibitor' }).adjustedDoseMg, 3.75);
  assert.equal(a({ indication: 'schizophrenia', cyp3a4Inhibitor: 'moderate-cyp3a4-inhibitor' }).adjustedDoseMg, 7.5);
  assert.deepEqual([a({ indication: 'adjunctive-mdd' }).flag, a({ indication: 'adjunctive-mdd' }).adjustedDoseMg], ['no-label-adjustment', undefined]);
  assert.equal(a({ indication: 'schizophrenia' }).valid, false);
  assert.equal(a({ cyp3a4Inhibitor: 'no-cyp3a4-inhibitor' }).valid, false);
  const b = (cyp3a4Inhibitor) => p({ drug: 'brexpiprazole', status: 'poor', usualDose: 2, cyp3a4Inhibitor }).adjustedDoseMg;
  assert.deepEqual([b('no-cyp3a4-inhibitor'), b('moderate-cyp3a4-inhibitor'), b('strong-cyp3a4-inhibitor')], [1, 0.5, 0.5]);
  assert.equal(p({ drug: 'celecoxib', status: 'poor', indication: 'another-use', usualDose: 200 }).adjustedDoseMg, 100);
  assert.deepEqual([p({ drug: 'celecoxib', status: 'poor', indication: 'jra' }).flag, p({ drug: 'celecoxib', status: 'poor', indication: 'jra' }).adjustedDoseMg], ['alternative-management', undefined]);
});

test('label dose rows: iloperidone and pitolisant', () => {
  const i = (indication, singleDose) => p({ drug: 'iloperidone', status: 'poor', indication, singleDose }).flag;
  assert.deepEqual([i('schizophrenia', 8), i('schizophrenia', 6), i('schizophrenia', 3), i('schizophrenia', 2)], ['over-the-label-dosage', 'at-the-label-dosage', 'at-the-label-dosage', 'under-the-label-dosage']);
  assert.deepEqual([i('bipolar-mania', 6), i('bipolar-mania', 12), i('bipolar-mania', 3)], ['at-the-label-dosage', 'over-the-label-dosage', 'under-the-label-dosage']);
  assert.equal(p({ drug: 'iloperidone', status: 'poor', indication: 'another-use', singleDose: 6 }).valid, false);
  const w = (o) => p({ drug: 'pitolisant', status: 'poor', ...o });
  assert.deepEqual([w({ population: 'adult', dailyDose: 35.6 }).flag, w({ population: 'adult', dailyDose: 35.6 }).dailyCeilingMg], ['over-the-label-ceiling', 17.8]);
  assert.deepEqual([w({ population: 'pediatric', weight: 30, dailyDose: 17.8 }).flag, w({ population: 'pediatric', weight: 30, dailyDose: 17.8 }).dailyCeilingMg], ['over-the-label-ceiling', 8.9]);
  assert.equal(w({ population: 'pediatric', weight: 45, dailyDose: 17.8 }).flag, 'at-the-label-ceiling');
  assert.equal(w({ population: 'pediatric', weight: 40, dailyDose: 17.8 }).flag, 'at-the-label-ceiling');
});

test('label dose rows: a withheld label shows no figure, and no pinned label is a repackager\'s', () => {
  const d = DRUGS.find((x) => x.value === 'vortioxetine');
  const r = p({ drug: 'vortioxetine', status: 'poor', dailyDose: 20 }, { ...T, [d.setId]: row('Trintellix', { supersededOn: '2026-11-01' }) });
  assert.deepEqual([r.withheld, r.dailyCeilingMg], [true, undefined]);
  assert.doesNotMatch(r.band, /10 mg/);
  const editions = JSON.parse(readFileSync(new URL('../../scripts/data/label-editions.json', import.meta.url), 'utf8'));
  const repack = new Set(JSON.parse(readFileSync(new URL('../../scripts/data/label-repackagers.json', import.meta.url), 'utf8')).labelers);
  const rows = Array.isArray(editions) ? editions : editions.labels;
  for (const id of [MAYZENT, CERDELGA, ...DRUGS.map((x) => x.setId)]) {
    const e2 = rows.find((x) => x.setId === id);
    assert.ok(e2, `label ${id} is watched`);
    assert.ok(!repack.has(e2.labeler), `${e2.label} is not a repackager's copy`);
  }
});
