// spec-v1632 backfills 1 to 3: antibiotic dose by kidney function on 22 label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { abxRenal as d, REGIMENS, LABELS } from '../../lib/abx-renal-v1632.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const at = (regimen, kidney, dialysis = 'none') => d({ regimen, kidney, dialysis }, now);
const text = (r) => `${r.band} ${r.notes.join(' ')}`;

test('22 labels answer and every regimen names one of them', () => {
  assert.equal(Object.keys(LABELS).length, 22);
  assert.equal(new Set(Object.values(LABELS).map((l) => l.setId)).size, 22);
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.brand);
  assert.equal(new Set(REGIMENS.map((r) => r.value)).size, REGIMENS.length);
  for (const r of REGIMENS) assert.ok(LABELS[r.drug], r.value);
});

test('cefepime: Table 2 by usual dose, with 60 in the 30-to-60 row, and the dialysis rows', () => {
  assert.deepEqual(at('cefepime-2g-q8h', 61).rows, ['2 g every 8 hours']);
  assert.deepEqual(at('cefepime-2g-q8h', 60).rows, ['2 g every 12 hours']);
  assert.deepEqual(at('cefepime-1g-q12h', 29).rows, ['500 mg every 24 hours']);
  assert.deepEqual(at('cefepime-2g-q12h', 10).rows, ['500 mg every 24 hours']);
  assert.deepEqual(at('cefepime-500mg-q12h', 5).rows, ['250 mg every 24 hours']);
  assert.match(at('cefepime-1g-q12h', '', 'hd').band, /1 g on day 1, then 500 mg every 24 hours/);
  assert.match(at('cefepime-2g-q8h', '', 'hd').band, /1 g every 24 hours \(febrile neutropenia\)/);
  assert.match(at('cefepime-2g-q12h', '', 'pd').band, /2 g every 48 hours/);
  // The label prints 11 to 29 and 30 to 60: 29.5 is in neither, so both rows show.
  assert.equal(at('cefepime-1g-q12h', 29.5).rows.length, 2);
});

test('piperacillin-tazobactam: the indication is a choice, and 40 and 20 sit in the middle row', () => {
  assert.deepEqual(at('piperacillin-tazobactam', 41).rows, ['3.375 g every 6 hours']);
  assert.deepEqual(at('piperacillin-tazobactam', 40).rows, ['2.25 g every 6 hours']);
  assert.deepEqual(at('piperacillin-tazobactam', 20).rows, ['2.25 g every 6 hours']);
  assert.deepEqual(at('piperacillin-tazobactam', 19).rows, ['2.25 g every 8 hours']);
  assert.deepEqual(at('piperacillin-tazobactam-nosocomial-pneumonia', 80).rows, ['4.5 g every 6 hours']);
  assert.deepEqual(at('piperacillin-tazobactam-nosocomial-pneumonia', 30).rows, ['3.375 g every 6 hours']);
  assert.match(at('piperacillin-tazobactam', '', 'hd').band, /2\.25 g every 12 hours, with 0\.75 g after each hemodialysis session/);
  assert.match(at('piperacillin-tazobactam-nosocomial-pneumonia', '', 'pd').band, /2\.25 g every 8 hours/);
});

test('vancomycin: the label does give a clearance table, and no loading dose is attributed to it', () => {
  const r = at('vancomycin', '');
  assert.equal(r.valid, true);
  assert.match(r.band, /about 15 times the glomerular filtration rate/);
  assert.match(r.band, /1,545 mg per 24 hours at 100 mL\/min/);
  assert.doesNotMatch(text(r), /25 ?(-|to) ?30 mg\/kg/);
  assert.match(text(r), /not valid for functionally anephric/);
  assert.equal(at('vancomycin', '', 'hd').flag, 'no-recommendation-given');
});

test('ciprofloxacin: the IV and oral labels have different rows', () => {
  assert.deepEqual(at('ciprofloxacin-iv', 20).rows, ['200 to 400 mg every 18 to 24 hours']);
  assert.equal(at('ciprofloxacin-iv', 30).rows.length, 2); // ">30" and "5 to 29": 30 is in neither
  assert.equal(at('ciprofloxacin-iv', 3).flag, 'no-recommendation-given');
  assert.equal(at('ciprofloxacin-iv', '', 'hd').flag, 'no-recommendation-given');
  assert.deepEqual(at('ciprofloxacin-oral', 50).rows, ['250 to 500 mg every 12 hours']);
  assert.deepEqual(at('ciprofloxacin-oral', 29).rows, ['250 to 500 mg every 18 hours']);
  assert.match(at('ciprofloxacin-oral', '', 'pd').band, /every 24 hours, after dialysis/);
});

test('meropenem, levofloxacin, Bactrim and Macrobid', () => {
  assert.deepEqual(at('meropenem-1g', 51).rows, ['1 g every 8 hours']);
  assert.deepEqual(at('meropenem-1g', 26).rows, ['1 g every 12 hours']);
  assert.deepEqual(at('meropenem-500mg', 25).rows, ['one-half the recommended dose (250 mg) every 12 hours']);
  assert.deepEqual(at('meropenem-500mg', 9).rows, ['one-half the recommended dose (250 mg) every 24 hours']);
  assert.equal(at('meropenem-1g', '', 'hd').flag, 'no-recommendation-given');
  assert.deepEqual(at('levofloxacin-750mg', 49).rows, ['750 mg every 48 hours']);
  assert.deepEqual(at('levofloxacin-500mg', 19).rows, ['500 mg initial dose, then 250 mg every 48 hours']);
  assert.equal(at('levofloxacin-250mg', 30).flag, 'no-adjustment');
  assert.match(at('levofloxacin-250mg', 15).band, /uncomplicated urinary tract infection/);
  assert.equal(at('levofloxacin-250mg', '', 'hd').flag, 'no-recommendation-given');
  assert.equal(at('levofloxacin-750mg', '', 'pd').flag, 'dose');
  assert.equal(at('levofloxacin-750mg', 9).flag, 'no-recommendation-given');
  assert.equal(at('tmp-smx', 30).rows[0], 'one-half the usual regimen');
  assert.equal(at('tmp-smx', 31).flag, 'no-adjustment');
  assert.equal(at('tmp-smx', 14).flag, 'not-recommended');
  assert.equal(at('nitrofurantoin', 60).flag, 'no-adjustment');
  assert.deepEqual([at('nitrofurantoin', 59).flag, at('nitrofurantoin', 59).abnormal], ['contraindicated', true]);
  assert.equal(at('nitrofurantoin', '', 'hd').flag, 'contraindicated');
});

test('daptomycin, ertapenem, cefazolin, ampicillin-sulbactam, ceftazidime', () => {
  assert.deepEqual(at('daptomycin-6mg-kg', 30).rows, ['6 mg/kg once every 24 hours']);
  assert.deepEqual(at('daptomycin-4mg-kg', 29).rows, ['4 mg/kg once every 48 hours']);
  assert.match(at('daptomycin-6mg-kg', '', 'hd').band, /6 mg\/kg once every 48 hours, given after hemodialysis/);
  assert.deepEqual(at('ertapenem', 30).rows, ['500 mg daily']);
  assert.equal(at('ertapenem', 31).flag, 'no-adjustment');
  assert.match(at('ertapenem', 30).notes.join(' '), /mL\/min\/1\.73 m²/);
  assert.match(at('ertapenem', '', 'hd').band, /supplementary dose of 150 mg/);
  assert.equal(at('ertapenem', '', 'pd').flag, 'no-recommendation-given');
  assert.deepEqual([at('cefazolin', 55).flag, at('cefazolin', 54).rows[0], at('cefazolin', 34).rows[0], at('cefazolin', 10).rows[0]], ['no-adjustment', 'full doses, restricted to at least 8-hour intervals', 'one-half the usual dose every 12 hours', 'one-half the usual dose every 18 to 24 hours']);
  assert.match(at('cefazolin', 20).notes.join(' '), /3\.1 to 4\.5/);
  assert.deepEqual(at('ampicillin-sulbactam', 15).rows, ['1.5 g to 3 g every 12 hours']);
  assert.equal(at('ampicillin-sulbactam', 4).flag, 'no-recommendation-given');
  assert.deepEqual(at('ceftazidime', 50).rows, ['1 gram every 12 hours']);
  assert.deepEqual(at('ceftazidime', 6).rows, ['500 mg every 24 hours']);
  assert.deepEqual(at('ceftazidime', 4).rows, ['500 mg every 48 hours']);
  assert.equal(at('ceftazidime', 5).rows.length, 2); // "15 to 6" and "less than 5": the label skips 5
  assert.match(at('ceftazidime', '', 'pd').band, /500 mg every 24 hours/);
});

test('imipenem, aztreonam, ceftaroline, the amoxicillins, cephalexin, colistimethate, fluconazole', () => {
  assert.deepEqual([90, 89, 60, 59, 30, 29, 15].map((c) => at('imipenem-500mg-q6h', c).rows[0]), ['500 mg every 6 hours', '400 mg every 6 hours', '400 mg every 6 hours', '300 mg every 6 hours', '300 mg every 6 hours', '200 mg every 6 hours', '200 mg every 6 hours']);
  assert.deepEqual(at('imipenem-1000mg-q6h', 70).rows, ['750 mg every 8 hours']);
  assert.deepEqual(at('imipenem-1000mg-q8h', 20).rows, ['500 mg every 12 hours']);
  assert.equal(at('imipenem-1000mg-q8h', 14).flag, 'not-recommended');
  assert.match(at('imipenem-1000mg-q8h', '', 'hd').band, /500 mg every 12 hours .* after hemodialysis/);
  assert.equal(at('imipenem-1000mg-q8h', '', 'pd').flag, 'no-recommendation-given');
  assert.match(at('aztreonam', 30).band, /half the usual dose/);
  assert.match(at('aztreonam', 9).band, /one-fourth/);
  assert.match(at('aztreonam', '', 'hd').band, /one-eighth/);
  assert.deepEqual([51, 50, 31, 30, 15, 14].map((c) => at('ceftaroline', c).rows[0].slice(0, 6)), ['no dos', '400 mg', '400 mg', '300 mg', '300 mg', '200 mg']);
  for (const v of ['amoxicillin', 'amoxicillin-clavulanate']) {
    assert.equal(at(v, 31).flag, 'no-adjustment');
    assert.match(at(v, 30).rows[0], /every 12 hours/);
    assert.match(at(v, 9).rows[0], /every 24 hours/);
    assert.match(at(v, '', 'hd').band, /additional dose both during and at the end of dialysis/);
    assert.match(at(v, 20).notes.join(' '), /875 mg/);
  }
  assert.deepEqual([60, 59, 15, 5, 1].map((c) => at('cephalexin', c).flag), ['no-adjustment', 'dose', 'dose', 'dose', 'dose']);
  assert.match(at('cephalexin', 59).rows[0], /should not exceed 1 g/);
  assert.equal(at('cephalexin', '', 'hd').flag, 'no-recommendation-given');
  assert.match(at('colistimethate', 20).rows[0], /1\.5 mg\/kg of colistin base every 36 hours/);
  assert.equal(at('colistimethate', 9).flag, 'no-recommendation-given');
  assert.deepEqual([at('fluconazole', 51).flag, at('fluconazole', 50).rows[0].slice(0, 3)], ['no-adjustment', '50%']);
  assert.match(at('fluconazole', '', 'hd').band, /100% of the recommended dose after each hemodialysis/);
});

test('nothing is defaulted: the regimen, the dialysis answer and the clearance are each asked for', () => {
  assert.match(d({}, now).message, /^Choose the drug/);
  assert.match(d({ regimen: 'meropenem-1g' }, now).message, /dialysis/);
  assert.match(at('meropenem-1g', '').message, /^Enter/);
  assert.match(at('meropenem-1g', -1).message, /creatinine clearance/);
  assert.equal(at('cefepime', 50).valid, false); // the old one-row value is gone: a usual dose must be chosen
});

test('a superseded label withholds its rows and the others keep answering', () => {
  const T = Object.fromEntries(Object.values(LABELS).map((l) => [l.setId, { label: l.brand, splVersion: 3, publishedOn: '2026-01-01', verifiedOn: '2026-10-11', validThrough: '2027-10-11' }]));
  T[LABELS.meropenem.setId].supersededOn = '2026-10-12';
  const r = d({ regimen: 'meropenem-1g', dialysis: 'none', kidney: 40 }, now, T);
  assert.equal(r.withheld, true);
  assert.equal(r.rows, undefined);
  assert.equal(d({ regimen: 'ertapenem', dialysis: 'none', kidney: 40 }, now, T).flag, 'no-adjustment');
});
