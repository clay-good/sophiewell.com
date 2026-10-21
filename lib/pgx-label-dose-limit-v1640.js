// spec-v1640 tool 8: the dose ceiling or fraction an FDA label states for a poor metabolizer, applied to
// the reader's dose. Eleven labels, each re-read October 13, 2026 on DailyMed, section 2 unless noted:
//
//   Xenazine (Lundbeck, ac768bab, v21) 2.2: "In PMs, the initial dose and titration is similar to EMs
//     except that the recommended maximum single dose is 25 mg, and the recommended daily dose should
//     not exceed a maximum of 50 mg". EMs and IMs: "The maximum recommended daily dose is 100 mg and the
//     maximum recommended single dose is 37.5 mg." "Patients who require doses of XENAZINE greater than
//     50 mg/day should be first tested and genotyped". Up to 50 mg/day: "The maximum recommended single
//     dose is 25 mg."
//   Austedo and Austedo XR (Teva, 7ea3c60a, v35) 2.4: "In patients who are poor CYP2D6 metabolizers,
//     the total daily dosage of AUSTEDO XR or AUSTEDO should not exceed 36 mg".
//   Ingrezza (Neurocrine, 4c970164, v34) 2.4: "The recommended dosage for known CYP2D6 poor
//     metabolizers is INGREZZA or INGREZZA SPRINKLE 40 mg once daily".
//   Pimozide tablets (Par, 70b079e2, v5; no brand label is on DailyMed). Children: "At doses above
//     0.05 mg/kg/day, CYP 2D6 genotyping should be performed. In poor CYP 2D6 metabolizers, pimozide
//     tablets, USP doses should not exceed 0.05 mg/kg/day, and doses should not be increased earlier
//     than 14 days". Adults: the same two sentences with "4 mg/day".
//   Abilify (Otsuka, c040bd1d, v73) Table 1: "Known CYP2D6 Poor Metabolizers: Administer half of usual
//     dose"; "Known CYP2D6 Poor Metabolizers taking concomitant strong CYP3A4 inhibitors": "Administer a
//     quarter of usual dose". "When adjunctive ABILIFY is administered to patients with major depressive
//     disorder, ABILIFY should be administered without dosage adjustment".
//   Rexulti (Otsuka, 2d301358, v26) Table 1: "CYP2D6 poor metabolizers: Administer half of the
//     recommended dosage."; "Known CYP2D6 poor metabolizers taking strong/moderate CYP3A4 inhibitors:
//     Administer a quarter of the recommended dosage."
//   Trintellix (Takeda, 1a5b68e2, v18) 2.5: "The maximum recommended dose of TRINTELLIX is 10 mg/day
//     in known CYP2D6 poor metabolizers."
//   Fanapt (Vanda, 33f60b40, v35) 2.2: "Reduce the dose of FANAPT by one-half for CYP2D6 poor
//     metabolizers". Table 2, recommended dosage: schizophrenia "3 mg to 6 mg twice daily"; bipolar I
//     manic or mixed episodes "6 mg twice daily".
//   Wakix (Harmony, 8daa5562, v18) 2.7: adults "Initiate WAKIX at 8.9 mg once daily and increase after
//     7 days to a maximum recommended dosage of 17.8 mg once daily"; "Pediatric patients (6 years and
//     older) weighing <40 kg ... a maximum recommended dosage of 8.9 mg once daily"; weighing ≥40 kg
//     "a maximum recommended dosage of 17.8 mg once daily".
//   Celexa (Allergan, 4259d9b1, v40) 2: "The maximum recommended dosage of CELEXA for patients who are
//     greater than 60 years of age, patients with hepatic impairment, and for CYP2C19 poor metabolizers
//     is 20 mg once daily".
//   Celebrex (Viatris, 2d6675e4, v13) 2.7: "In adult patients who are known or suspected to be poor
//     CYP2C9 metabolizers ... initiate treatment with half of the lowest recommended dose. In patients
//     with JRA who are known or suspected to be poor CYP2C9 metabolizers, consider using alternative
//     treatments". 8.8 names the poor metabolizer "(i.e., CYP2C9*3/*3)".
//
// Not rows: inhibitor dosing in the same labels (except where the row is itself a poor-metabolizer
// row), metoclopramide (gi-drug-dose-check), atomoxetine (the label changes only the titration
// interval), the long-acting aripiprazole injections, and a deutetrabenazine single-dose ceiling (the
// label states none).
//
// Pure: no DOM, no network. `now` is read only to check that each label edition still stands.

import { dpSafe } from './cut-display.js';
import { inputFault, r2 } from './num.js';
import { labelRow } from './label-row.js';

export const DRUGS = [
  { value: 'tetrabenazine', text: 'Tetrabenazine (Xenazine)', brand: 'Xenazine', enzyme: 'CYP2D6', setId: 'ac768bab-8afa-4446-bc7f-caeeffec0cda', row: 'Section 2.2: "In PMs, the initial dose and titration is similar to EMs except that the recommended maximum single dose is 25 mg, and the recommended daily dose should not exceed a maximum of 50 mg".' },
  { value: 'deutetrabenazine', text: 'Deutetrabenazine (Austedo, Austedo XR)', brand: 'Austedo', enzyme: 'CYP2D6', setId: '7ea3c60a-45c7-44cc-afc2-d87fa53993c0', row: 'Section 2.4: "In patients who are poor CYP2D6 metabolizers, the total daily dosage of AUSTEDO XR or AUSTEDO should not exceed 36 mg".' },
  { value: 'valbenazine', text: 'Valbenazine (Ingrezza)', brand: 'Ingrezza', enzyme: 'CYP2D6', setId: '4c970164-cafb-421f-9eb5-c226ef0a3417', row: 'Section 2.4: "The recommended dosage for known CYP2D6 poor metabolizers is INGREZZA or INGREZZA SPRINKLE 40 mg once daily".' },
  { value: 'pimozide', text: 'Pimozide', brand: 'pimozide tablets (Par)', enzyme: 'CYP2D6', setId: '70b079e2-a1f7-4a93-8685-d60a4d7c1280', row: 'Dosage and Administration: "In poor CYP 2D6 metabolizers, pimozide tablets, USP doses should not exceed 0.05 mg/kg/day [children; adults: 4 mg/day], and doses should not be increased earlier than 14 days".' },
  { value: 'aripiprazole', text: 'Aripiprazole, oral (Abilify)', brand: 'Abilify', enzyme: 'CYP2D6', setId: 'c040bd1d-45b7-49f2-93ea-aed7220b30ac', row: 'Section 2.6, Table 1: "Known CYP2D6 Poor Metabolizers: Administer half of usual dose".' },
  { value: 'brexpiprazole', text: 'Brexpiprazole (Rexulti)', brand: 'Rexulti', enzyme: 'CYP2D6', setId: '2d301358-6291-4ec1-bd87-37b4ad9bd850', row: 'Section 2.7, Table 1: "CYP2D6 poor metabolizers: Administer half of the recommended dosage."' },
  { value: 'vortioxetine', text: 'Vortioxetine (Trintellix)', brand: 'Trintellix', enzyme: 'CYP2D6', setId: '1a5b68e2-14d0-419d-9ec6-1ca97145e838', row: 'Section 2.5: "The maximum recommended dose of TRINTELLIX is 10 mg/day in known CYP2D6 poor metabolizers."' },
  { value: 'iloperidone', text: 'Iloperidone (Fanapt)', brand: 'Fanapt', enzyme: 'CYP2D6', setId: '33f60b40-3fca-11de-8f56-0002a5d5c51b', row: 'Section 2.2: "Reduce the dose of FANAPT by one-half for CYP2D6 poor metabolizers".' },
  { value: 'pitolisant', text: 'Pitolisant (Wakix)', brand: 'Wakix', enzyme: 'CYP2D6', setId: '8daa5562-824e-476c-9652-26ceef3d4b0e', row: 'Section 2.7, adults: "Initiate WAKIX at 8.9 mg once daily and increase after 7 days to a maximum recommended dosage of 17.8 mg once daily".' },
  { value: 'citalopram', text: 'Citalopram (Celexa)', brand: 'Celexa', enzyme: 'CYP2C19', setId: '4259d9b1-de34-43a4-85a8-41dd214e9177', row: 'Section 2: "The maximum recommended dosage of CELEXA for patients who are greater than 60 years of age, patients with hepatic impairment, and for CYP2C19 poor metabolizers is 20 mg once daily".' },
  { value: 'celecoxib', text: 'Celecoxib (Celebrex)', brand: 'Celebrex', enzyme: 'CYP2C9', setId: '2d6675e4-5859-4be2-8037-a20ce9f707aa', row: 'Section 2.7: "In adult patients who are known or suspected to be poor CYP2C9 metabolizers ... initiate treatment with half of the lowest recommended dose." Section 8.8 names the poor metabolizer "(i.e., CYP2C9*3/*3)".' },
];
export const STATUSES = [
  { value: 'poor', text: 'Poor metabolizer' },
  { value: 'intermediate', text: 'Intermediate metabolizer' },
  { value: 'normal', text: 'Normal (extensive) metabolizer' },
  { value: 'ultrarapid', text: 'Ultrarapid metabolizer' },
  { value: 'status-not-known', text: 'Not known (not genotyped)' },
];
export const POPULATIONS = [
  { value: 'adult', text: 'Adult' },
  { value: 'pediatric', text: 'Child or adolescent' },
];
export const INDICATIONS = [
  { value: 'schizophrenia', text: 'Schizophrenia' },
  { value: 'bipolar-mania', text: 'Bipolar I disorder, manic or mixed episodes' },
  { value: 'adjunctive-mdd', text: 'Adjunctive treatment of major depressive disorder' },
  { value: 'jra', text: 'Juvenile rheumatoid arthritis' },
  { value: 'another-use', text: 'Another use' },
];
export const CYP3A4 = [
  { value: 'no-cyp3a4-inhibitor', text: 'None' },
  { value: 'moderate-cyp3a4-inhibitor', text: 'Moderate' },
  { value: 'strong-cyp3a4-inhibitor', text: 'Strong' },
];
const POSTURE = 'This is the label\'s figure set beside the dose entered. It is not advice for a particular patient.';
const EPS = 1e-9;
const pick = (list, v) => list.find((x) => x.value === String(v ?? '').trim());
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const mg = (n) => `${r2(n)} mg`;
// Where a dose sits against a ceiling: 'over', 'at' or 'within'.
const against = (dose, ceiling) => (dose > ceiling + EPS ? 'over' : Math.abs(dose - ceiling) <= EPS ? 'at' : 'within');
const WORD = { over: 'over', at: 'at', within: 'within' };

export function pgxLabelDoseLimit(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const d = pick(DRUGS, o.drug);
  if (!d) return { valid: false, message: 'Choose the drug. Eleven labels with a poor-metabolizer dose row are covered.' };
  const st = pick(STATUSES, o.status);
  if (!st) return { valid: false, message: `Choose the ${d.enzyme} metabolizer status on the report, or "Not known". The label's row depends on it.` };
  const lr = labelRow(d.setId, now, table);
  const labelLinks = [{ text: `${d.brand.charAt(0).toUpperCase()}${d.brand.slice(1)} label on DailyMed`, url: lr.url }];
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelLinks, band: `The ${d.brand} label figures are withheld: ${lr.why}. Read the row from the current label.`, bandLabel: 'Withheld', notes: [] };
  const tail = [`Label: ${lr.edition}.`, POSTURE];
  const s = st.value; const pm = s === 'poor'; const unknown = s === 'status-not-known';
  const base = { valid: true, withheld: false, drug: d.value, status: s, enzyme: d.enzyme, labelLinks, bandLabel: unknown ? `${d.enzyme} status not known` : `${d.enzyme} ${st.text.toLowerCase()}` };
  const done = (flag, abnormal, band, notes, extra = {}) => ({ ...base, ...extra, flag, abnormal, band, notes: [...notes, ...tail] });
  const need = (rows) => { const f = inputFault(rows); return f ? { valid: false, message: f } : null; };
  // One ceiling check: the verdict word and a sentence.
  // The dose and the ceiling shown at the fewest decimals (two or more) at which their order matches the verdict:
  // 50.004 over 50 must not print as "50 mg is over the label's 50 mg".
  const pair = (dose, ceiling, v) => {
    const want = v === 'over' ? 1 : v === 'at' ? 0 : -1;
    for (let k = 2; k <= 6; k += 1) {
      const a = Math.round(dose * 10 ** k) / 10 ** k; const b = Math.round(ceiling * 10 ** k) / 10 ** k;
      if (Math.sign(a - b) === want) return [a, b];
    }
    return [r2(dose), r2(ceiling)];
  };
  const check = (what, dose, ceiling, unit = 'mg') => { const v = against(dose, ceiling); const [a, b] = pair(dose, ceiling, v); return { v, text: `${what}: ${a} ${unit} is ${WORD[v]} the label's ${b} ${unit}.` }; };
  const verdict = (checks) => (checks.some((c) => c.v === 'over') ? 'over' : checks.some((c) => c.v === 'at') ? 'at' : 'within');
  const ceilingResult = (checks, notes, extra) => {
    const v = verdict(checks);
    return done(v === 'over' ? 'over-the-label-ceiling' : v === 'at' ? 'at-the-label-ceiling' : 'within-the-label-ceiling', v === 'over', `${v === 'over' ? 'Over' : v === 'at' ? 'At' : 'Within'} the label's ceiling for this status.`, [...checks.map((c) => c.text), ...notes], extra);
  };
  const noRow = () => done('no-label-adjustment', false, unknown ? 'The label\'s row is for known poor metabolizers, and the status is not known.' : 'The label states no adjustment for this status.', [`The row read is for ${d.enzyme} poor metabolizers. ${d.row}`]);

  if (d.value === 'tetrabenazine') {
    if (s === 'ultrarapid') return done('no-label-adjustment', false, 'The label has no row for ultrarapid metabolizers.', ['Section 2.2 of the label names poor, extensive and intermediate metabolizers only.', d.row]);
    const f = need([['the planned daily dose', o.dailyDose, null, 400, 'mg']]) || (blank(o.singleDose) ? null : need([['the largest single dose', o.singleDose, null, 400, 'mg']]));
    if (f) return f;
    const daily = Number(o.dailyDose); const single = blank(o.singleDose) ? null : Number(o.singleDose);
    const gap = single === null ? ['No single dose was entered, so only the daily dose is checked.'] : [];
    if (unknown) {
      if (daily > 50 + EPS) return done('genotype-first', true, 'The label calls for CYP2D6 genotyping before a dose above 50 mg/day.', ['Section 2.2: "Patients who require doses of XENAZINE greater than 50 mg/day should be first tested and genotyped to determine if they are poor metabolizers (PMs) or extensive metabolizers (EMs)".', `Entered: ${mg(daily)} per day, with the status not known.`], { dailyCeilingMg: 50 });
      const checks = single === null ? [] : [check('Single dose', single, 25)];
      return ceilingResult([check('Daily dose', daily, 50), ...checks], ['Up to 50 mg/day the label does not ask for a genotype. Section 2.2: "If a dose of 37.5 to 50 mg/day is needed, it should be given in a three times a day regimen. The maximum recommended single dose is 25 mg."', ...gap], { dailyCeilingMg: 50, singleCeilingMg: 25 });
    }
    const [dc, sc] = pm ? [50, 25] : [100, 37.5];
    const checks = [check('Daily dose', daily, dc)];
    if (single !== null) checks.push(check('Single dose', single, sc));
    return ceilingResult(checks, [pm ? d.row : 'Section 2.2, extensive and intermediate metabolizers: "The maximum recommended daily dose is 100 mg and the maximum recommended single dose is 37.5 mg."', ...gap], { dailyCeilingMg: dc, singleCeilingMg: sc });
  }

  if (d.value === 'pimozide') {
    if (!pm && !unknown) return noRow();
    const pop = pick(POPULATIONS, o.population);
    if (!pop) return { valid: false, message: 'Choose adult or child. The pimozide label gives the ceiling as 4 mg/day for adults and 0.05 mg/kg/day for children.' };
    const child = pop.value === 'pediatric';
    const f = need([['the planned daily dose', o.dailyDose, null, 20, 'mg']]) || (child ? need([['the weight', o.weight, 5, 150, 'kg']]) : null) || (blank(o.daysSinceIncrease) ? null : need([['the days since the last dose increase', o.daysSinceIncrease, 0, 3650, 'days']]));
    if (f) return f;
    const daily = Number(o.dailyDose); const kg = child ? Number(o.weight) : null;
    const ceilingMg = child ? 0.05 * kg : 4;
    const c = check(child ? `Daily dose (${r2(daily / kg)} mg/kg/day at ${r2(kg)} kg; the label's 0.05 mg/kg/day is ${mg(ceilingMg)})` : 'Daily dose', daily, ceilingMg);
    const quote = child ? 'Children: "At doses above 0.05 mg/kg/day, CYP 2D6 genotyping should be performed. In poor CYP 2D6 metabolizers, pimozide tablets, USP doses should not exceed 0.05 mg/kg/day, and doses should not be increased earlier than 14 days".' : 'Adults: "At doses above 4 mg/day, CYP 2D6 genotyping should be performed. In poor CYP 2D6 metabolizers, pimozide tablets, USP doses should not exceed 4 mg/day, and doses should not be increased earlier than 14 days".';
    const extra = { dailyCeilingMg: r2(ceilingMg) };
    if (unknown) {
      if (c.v === 'over') return done('genotype-first', true, `The label calls for CYP2D6 genotyping at a dose above ${child ? '0.05 mg/kg/day' : '4 mg/day'}.`, [c.text, quote], extra);
      return done('no-label-adjustment', false, 'The label does not call for genotyping at this dose, and the status is not known.', [c.text, quote], extra);
    }
    const notes = [quote];
    let early = false;
    if (blank(o.daysSinceIncrease)) notes.push('The days since the last dose increase were not entered, so the 14-day interval is not checked.');
    else { const days = Number(o.daysSinceIncrease); early = days < 14; notes.push(early ? `Too early for an increase by the label: ${days} days since the last increase, and the label says "not ... earlier than 14 days".` : `${days} days since the last increase: at or past the label's 14 days.`); }
    const r = ceilingResult([c], notes, extra);
    return early && !r.abnormal ? { ...r, abnormal: true, flag: 'increase-too-early', band: `${r.band} An increase now is earlier than the label's 14 days.` } : r;
  }

  if (!pm) return noRow();

  if (d.value === 'deutetrabenazine' || d.value === 'vortioxetine' || d.value === 'citalopram') {
    const ceiling = { deutetrabenazine: 36, vortioxetine: 10, citalopram: 20 }[d.value];
    const f = need([['the planned daily dose', o.dailyDose, null, 400, 'mg']]);
    if (f) return f;
    return ceilingResult([check('Daily dose', Number(o.dailyDose), ceiling)], [d.row], { dailyCeilingMg: ceiling });
  }

  if (d.value === 'valbenazine') {
    const f = need([['the planned daily dose', o.dailyDose, null, 400, 'mg']]);
    if (f) return f;
    const daily = Number(o.dailyDose); const v = against(daily, 40);
    return done(v === 'over' ? 'over-the-label-dosage' : v === 'at' ? 'at-the-label-dosage' : 'under-the-label-dosage', v === 'over', v === 'over' ? 'Over the label\'s dosage for this status.' : v === 'at' ? 'At the label\'s dosage for this status.' : 'Under the label\'s dosage for this status.', [`Daily dose: ${mg(daily)}; the label's dosage for a known poor metabolizer is 40 mg once daily.`, d.row], { labelDoseMg: 40 });
  }

  if (d.value === 'pitolisant') {
    const pop = pick(POPULATIONS, o.population);
    if (!pop) return { valid: false, message: 'Choose adult or child. The Wakix label gives a child under 40 kg a lower maximum than an adult.' };
    const child = pop.value === 'pediatric';
    const f = need([['the planned daily dose', o.dailyDose, null, 100, 'mg']]) || (child ? need([['the weight', o.weight, 5, 250, 'kg']]) : null);
    if (f) return f;
    const small = child && Number(o.weight) < 40;
    const ceiling = small ? 8.9 : 17.8;
    const quote = !child ? d.row : small ? 'Section 2.7: "Pediatric patients (6 years and older) weighing <40 kg: Initiate WAKIX at 4.45 mg once daily and increase after 7 days to a maximum recommended dosage of 8.9 mg once daily".' : 'Section 2.7: "Pediatric patients (6 years and older) weighing ≥40 kg: Initiate WAKIX at 4.45 mg once daily and increase after 7 days to 8.9 mg once daily. May increase after another 7 days to a maximum recommended dosage of 17.8 mg once daily".';
    return ceilingResult([check('Daily dose', Number(o.dailyDose), ceiling)], [quote, ...(child ? ['The label\'s pediatric rows are for patients 6 years and older.'] : [])], { dailyCeilingMg: ceiling });
  }

  if (d.value === 'iloperidone') {
    const ind = pick(INDICATIONS, o.indication);
    if (!ind || (ind.value !== 'schizophrenia' && ind.value !== 'bipolar-mania')) return { valid: false, message: 'Choose schizophrenia or bipolar I disorder. Table 2 of the Fanapt label gives the poor-metabolizer dosage for those two uses only.' };
    const f = need([['the dose given twice daily', o.singleDose, null, 50, 'mg']]);
    if (f) return f;
    const dose = Number(o.singleDose); const schiz = ind.value === 'schizophrenia';
    const table2 = schiz ? 'Table 2, schizophrenia, recommended dosage for poor metabolizers: "3 mg to 6 mg twice daily".' : 'Table 2, bipolar I disorder manic or mixed episodes, recommended dosage for poor metabolizers: "6 mg twice daily".';
    const v = against(dose, 6);
    const under = schiz ? dose < 3 - EPS : v === 'within';
    const band = v === 'over' ? 'Over the label\'s dosage for this status.' : under ? 'Under the label\'s recommended dosage for this status.' : schiz && v === 'within' ? 'Within the label\'s dosage range for this status.' : 'At the label\'s dosage for this status.';
    const notes = [`Entered: ${dpSafe(dose, [3 - EPS, 6 + EPS], 2)} mg twice daily.`, table2, d.row];
    if (under) notes.push('Table 2\'s titration days are lower than the recommended dosage (1 mg twice daily on Day 1).');
    return done(v === 'over' ? 'over-the-label-dosage' : under ? 'under-the-label-dosage' : 'at-the-label-dosage', v === 'over', band, notes, { labelDoseMg: schiz ? [3, 6] : [6, 6] });
  }

  if (d.value === 'celecoxib') {
    const ind = pick(INDICATIONS, o.indication);
    if (!ind) return { valid: false, message: 'Choose the use. The Celebrex label gives a fraction for adults and says to consider alternatives in juvenile rheumatoid arthritis.' };
    if (ind.value === 'jra') return done('alternative-management', true, 'The label gives no dose for a poor metabolizer with JRA; it says to consider alternatives.', ['Section 2.7: "In patients with JRA who are known or suspected to be poor CYP2C9 metabolizers, consider using alternative treatments".', 'Section 8.8 names the poor metabolizer "(i.e., CYP2C9*3/*3)".']);
    const f = need([['the lowest recommended dose for the use', o.usualDose, null, 1000, 'mg']]);
    if (f) return f;
    const usual = Number(o.usualDose);
    return done('half-the-lowest-dose', false, `Label fraction: half of ${mg(usual)} is ${mg(usual / 2)}.`, ['The dose entered is taken as the lowest recommended dose for the use; the tool does not look it up.', d.row], { factor: 0.5, adjustedDoseMg: r2(usual / 2) });
  }

  // aripiprazole and brexpiprazole: a fraction of the usual dose, by a concomitant CYP3A4 inhibitor.
  const arip = d.value === 'aripiprazole';
  if (arip) {
    const ind = pick(INDICATIONS, o.indication);
    if (!ind) return { valid: false, message: 'Choose the use. The Abilify label makes no adjustment when it is given as adjunctive treatment of major depressive disorder.' };
    if (ind.value === 'adjunctive-mdd') return done('no-label-adjustment', false, 'The label states no adjustment for adjunctive use in major depressive disorder.', ['Section 2.6: "When adjunctive ABILIFY is administered to patients with major depressive disorder, ABILIFY should be administered without dosage adjustment".', d.row]);
  }
  const inh = pick(CYP3A4, o.cyp3a4Inhibitor);
  if (!inh) return { valid: false, message: `Choose the strength of any concomitant CYP3A4 inhibitor, or "None". The ${d.brand} label gives a poor metabolizer a quarter of the dose with one.` };
  const f = need([[arip ? 'the usual dose' : 'the recommended dosage', o.usualDose, null, 100, 'mg']]);
  if (f) return f;
  const usual = Number(o.usualDose);
  const quarter = inh.value === 'strong-cyp3a4-inhibitor' || (!arip && inh.value === 'moderate-cyp3a4-inhibitor');
  const factor = quarter ? 0.25 : 0.5;
  const notes = [quarter
    ? (arip ? 'Section 2.6, Table 1: "Known CYP2D6 Poor Metabolizers taking concomitant strong CYP3A4 inhibitors (e.g., itraconazole, clarithromycin): Administer a quarter of usual dose".' : 'Section 2.7, Table 1: "Known CYP2D6 poor metabolizers taking strong/moderate CYP3A4 inhibitors: Administer a quarter of the recommended dosage."')
    : d.row];
  if (arip && inh.value === 'moderate-cyp3a4-inhibitor') notes.push('Table 1 of the Abilify label has a poor-metabolizer row for a strong CYP3A4 inhibitor only; a moderate one is given the half-dose row here.');
  notes.push('Inhibitor strength is the reader\'s entry; the tool does not classify a drug.');
  return done(quarter ? 'quarter-of-usual-dose' : 'half-of-usual-dose', false, `Label fraction: ${quarter ? 'a quarter' : 'half'} of ${mg(usual)} is ${mg(usual * factor)}.`, notes, { factor, adjustedDoseMg: r2(usual * factor) });
}
