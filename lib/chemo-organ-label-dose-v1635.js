// spec-v1635 tool 13: the label's dose modification for liver and kidney function, one drug at a time.
// A class tool on the label-dose engine (spec-v1632 section 0); every drug is a label row.
//
// Sources, DailyMed labels re-read October 11, 2026 (set id prefix, version):
//   Doxorubicin HCl Injection, Pfizer (1fd148fb, 28), 2.4 and Table 1: total bilirubin 1.2-3 mg/dL
//     "50%", 3.1-5 mg/dL "75%", greater than 5 mg/dL "Do not initiate ...; discontinue". The column is
//     headed "Dosage Modification". ADRIAMYCIN, Hikma (0f153c1e, 10), prints the same rows under
//     "Doxorubicin Dose reduction", so the percentages are reductions.
//   ELLENCE (0a03c798, 26), 2.3: "Bilirubin 1.2 to 3 mg/dL or AST 2 to 4 times upper limit of normal:
//     1/2 of recommended starting dose"; "Bilirubin > 3 mg/dL or AST > 4 times upper limit of normal:
//     1/4"; "Consider lower doses in patients with severe renal impairment (serum creatinine
//     > 5 mg/dL)". Section 4: contraindicated with serum bilirubin greater than 5 mg/dL.
//   Daunorubicin HCl, Hikma (227784a8, 6): "serum bilirubin concentrations of 1.2 to 3 mg/dL should
//     receive 75% of the usual daily dose ... greater than 3 mg/dL should receive 50% ... serum
//     creatinine concentrations of greater than 3 mg/dL should receive 50%".
//   IDAMYCIN PFS (0a5a6d93, 27), Table 2: bilirubin 2.6 mg/dL or less, no adjustment; greater than
//     2.6 and less than 5, reduce by 50%; greater than 5, avoid use. Its Table 1 (GFR under 30 mL/min
//     or hemodialysis: reduce by 33%) is quoted and not applied: the generic labels read as a second
//     source (Meitheal d31254be, Hikma 7c20b574) carry the hepatic figures but only "a dose reduction
//     should be considered" for the kidney.
//   Vincristine Sulfate Injection, Hospira (b22e4c8e, 16): "A 50% reduction in the dose ... is
//     recommended for patients having a direct serum bilirubin value above 3 mg/100 mL."
//   Paclitaxel Injection, Hospira (ea28753a, 33), Table 17 (first course; the 135 mg/m2 over 24 hours
//     and 175 mg/m2 over 3 hours regimens only).
//   Docetaxel Injection, Mylan (2fb017fd, 9), 5.2: "Avoid ... in patients with bilirubin > upper
//     limit of normal (ULN), or ... AST and/or ALT > 1.5 x ULN concomitant with alkaline phosphatase
//     > 2.5 x ULN"; "isolated elevations of transaminase > 1.5 x ULN, consider ... dose
//     modifications".
//   Bleomycin for Injection, Meitheal (640602f9, 3): creatinine clearance 50 and above 100%; 40 to 50
//     70%; 30 to 40 60%; 20 to 30 55%; 10 to 20 45%; 5 to 10 40%. The label prints its
//     Cockcroft-Gault result as "mL/min/1.73m2"; quoted, not corrected.
//   XELODA (e702d84d, 32), 2.7: "Reduce the dose ... by 25% for ... (CLcr) of 30 to 50 mL/min as
//     determined by Cockcroft-Gault"; "A dosage has not been established ... (CLcr <30 mL/min)".
//   ALIMTA (f5a860f3, 59), 2.3: "There is no recommended dose for patients whose creatinine clearance
//     is less than 45 mL/min."
//   Dexrazoxane for Injection, Eugia (cb72203a, 2), 2.2: creatinine clearance less than 40 mL/min,
//     reduce by 50%.
//   Carboplatin Injection, Natco (4c89cedc, 1): lowest post-treatment counts: platelets >100,000 and
//     neutrophils >2,000, 125%; 50-100,000 and 500-2,000, no adjustment; <50,000 and <500, 75%.
//
// Where a label leaves a value unstated (between whole-number bands, or exactly on an edge two rows
// share) both neighboring rows are shown and none is chosen.
//
// Pure: the clock is a parameter (used only for the label rows).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';
import { findBands, describeBands, worstFlag } from './label-dose.js';

const L = (name, setId) => ({ name, setId });
export const LABELS = {
  doxorubicin: L('Doxorubicin Hydrochloride Injection', '1fd148fb-0fbc-4b6f-b790-23546fb46a71'),
  adriamycin: L('ADRIAMYCIN', '0f153c1e-efce-4276-8273-d9e4c8455d16'),
  epirubicin: L('ELLENCE', '0a03c798-a652-4895-b29c-3b521a89ba42'),
  daunorubicin: L('Daunorubicin Hydrochloride', '227784a8-ce68-4dd4-8ac5-a65265969677'),
  idarubicin: L('IDAMYCIN PFS', '0a5a6d93-cc1e-4d7f-8da1-446c134503b3'),
  vincristine: L('Vincristine Sulfate Injection', 'b22e4c8e-dbe1-4d4b-a026-e1812974071c'),
  paclitaxel: L('Paclitaxel Injection', 'ea28753a-8631-460a-bfdc-b101eb8ac84a'),
  docetaxel: L('Docetaxel Injection', '2fb017fd-e55e-43ef-9024-07f2d412b37b'),
  bleomycin: L('Bleomycin for Injection', '640602f9-a7df-46f0-a9b1-19c471008bee'),
  capecitabine: L('XELODA', 'e702d84d-7162-4751-bf37-d724cc7e45a5'),
  pemetrexed: L('ALIMTA', 'f5a860f3-37ec-429c-ae04-9c88d7c55c08'),
  dexrazoxane: L('Dexrazoxane for Injection', 'cb72203a-0b09-42d5-bf51-7f479feb3adb'),
  carboplatin: L('Carboplatin Injection', '4c89cedc-e48b-445c-ad05-54dbe60e4fb0'),
};
export const DRUGS = [
  { value: 'doxorubicin', text: 'Doxorubicin (total bilirubin)' },
  { value: 'epirubicin', text: 'Epirubicin (total bilirubin, AST, serum creatinine)' },
  { value: 'daunorubicin', text: 'Daunorubicin (total bilirubin, serum creatinine)' },
  { value: 'idarubicin', text: 'Idarubicin (total bilirubin)' },
  { value: 'vincristine', text: 'Vincristine (direct bilirubin)' },
  { value: 'paclitaxel-3-hour', text: 'Paclitaxel, 3-hour infusion (transaminases, bilirubin as multiples of the upper limit)' },
  { value: 'paclitaxel-24-hour', text: 'Paclitaxel, 24-hour infusion (transaminases, total bilirubin)' },
  { value: 'docetaxel', text: 'Docetaxel (bilirubin, transaminases, alkaline phosphatase)' },
  { value: 'bleomycin', text: 'Bleomycin (creatinine clearance)' },
  { value: 'capecitabine', text: 'Capecitabine (creatinine clearance)' },
  { value: 'pemetrexed', text: 'Pemetrexed (creatinine clearance)' },
  { value: 'dexrazoxane', text: 'Dexrazoxane (creatinine clearance)' },
  { value: 'carboplatin-retreatment', text: 'Carboplatin, next course (lowest platelet and neutrophil counts)' },
];
const NOTE = 'What the label gives for these laboratory values, in its own bands. It does not combine rules the label states separately, it does not choose between two rows the label leaves a value between, and it is not a dose order.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const B = (from, to, text, flag, extra = {}) => ({ from, to, text, flag, ...extra });

// The inputs a drug reads: [arg, label for a fault message, lo, hi, unit].
const F = {
  bilirubin: ['bilirubin', 'the total bilirubin', 0, 60, 'mg/dL'],
  directBilirubin: ['directBilirubin', 'the direct bilirubin', 0, 60, 'mg/dL'],
  bilirubinXuln: ['bilirubinXuln', 'the bilirubin as a multiple of the upper limit of normal', 0, 60, '× ULN'],
  transaminaseXuln: ['transaminaseXuln', 'the transaminase (AST or ALT) as a multiple of the upper limit of normal', 0, 200, '× ULN'],
  alkPhosXuln: ['alkPhosXuln', 'the alkaline phosphatase as a multiple of the upper limit of normal', 0, 100, '× ULN'],
  crcl: ['crcl', 'the creatinine clearance', 0, 250, 'mL/min'],
  creatinine: ['creatinine', 'the serum creatinine', 0.1, 25, 'mg/dL'],
  platelets: ['platelets', 'the lowest platelet count', 0, 2000000, '/mm³'],
  neutrophils: ['neutrophils', 'the lowest neutrophil count', 0, 200000, '/mm³'],
};
const DOX = [B(1.2, 3, 'Total bilirubin 1.2 to 3 mg/dL: reduce the dose by 50%.', 'dose'), B(3.1, 5, 'Total bilirubin 3.1 to 5 mg/dL: reduce the dose by 75% (one quarter of the dose is given).', 'dose'), B(5, null, 'Total bilirubin greater than 5 mg/dL: do not initiate; discontinue. Contraindicated.', 'contraindicated', { fromExclusive: true })];
const BLEO = [B(50, null, 'Creatinine clearance 50 mL/min and above: 100% of the dose.', 'no-adjustment'), B(40, 50, '40 to 50 mL/min: 70% of the dose.', 'dose'), B(30, 40, '30 to 40 mL/min: 60% of the dose.', 'dose'), B(20, 30, '20 to 30 mL/min: 55% of the dose.', 'dose'), B(10, 20, '10 to 20 mL/min: 45% of the dose.', 'dose'), B(5, 10, '5 to 10 mL/min: 40% of the dose.', 'dose')];
const IDA_BILI = [B(null, 2.6, 'Serum bilirubin 2.6 mg/dL or less: no adjustment needed.', 'no-adjustment'), B(2.6, 5, 'Serum bilirubin greater than 2.6 and less than 5 mg/dL: reduce the dose by 50%.', 'dose', { fromExclusive: true, toExclusive: true }), B(5, null, 'Serum bilirubin greater than 5 mg/dL: avoid use.', 'not-recommended', { fromExclusive: true })];
const DAUNO_BILI = [B(1.2, 3, 'Serum bilirubin 1.2 to 3 mg/dL: 75% of the usual daily dose.', 'dose'), B(3, null, 'Serum bilirubin greater than 3 mg/dL: 50% of the usual daily dose.', 'dose', { fromExclusive: true })];
const PAC3 = [B(null, 1.25, 'Transaminases under 10 × ULN and bilirubin 1.25 × ULN or less: 175 mg/m².', 'dose'), B(1.26, 2.0, 'Transaminases under 10 × ULN and bilirubin 1.26 to 2.0 × ULN: 135 mg/m².', 'dose'), B(2.01, 5.0, 'Transaminases under 10 × ULN and bilirubin 2.01 to 5.0 × ULN: 90 mg/m².', 'dose'), B(5.0, null, 'Transaminases 10 × ULN or more, or bilirubin above 5.0 × ULN: not recommended.', 'not-recommended', { fromExclusive: true })];
const PLT = [B(100000, null, 'Platelets above 100,000 with neutrophils above 2,000: 125% of the prior course dose.', 'dose', { fromExclusive: true }), B(50000, 100000, 'Platelets 50,000 to 100,000 with neutrophils 500 to 2,000: no adjustment.', 'no-adjustment'), B(null, 50000, 'Platelets under 50,000 with neutrophils under 500: 75% of the prior course dose.', 'dose', { toExclusive: true })];
const ANC = [B(2000, null, PLT[0].text, 'dose', { fromExclusive: true }), B(500, 2000, PLT[1].text, 'no-adjustment'), B(null, 500, PLT[2].text, 'dose', { toExclusive: true })];

// Rows for one banded value: the found rows, and a sentence saying where the value sits.
function banded(bands, value, unit, what, below) {
  const found = findBands(bands, value);
  if (found.outside) return { rows: [], lines: [below || `${value} ${unit} is outside every band of ${what}; the label gives no row for it.`], unstated: !below, none: true };
  // Every table here runs from its mildest row to its most restrictive; where two rows are shown the
  // more restrictive leads.
  const rows = [...found.rows].sort((a, b) => bands.indexOf(b) - bands.indexOf(a));
  return { rows, lines: [describeBands(found, value, unit, what)], unstated: found.between || found.rows.length > 1 };
}

// Each drug: the label key, the inputs it reads (`need` all, or `any` at least one), and its rule.
const RULES = {
  doxorubicin: { label: 'doxorubicin', also: ['adriamycin'], need: ['bilirubin'], run: (v) => {
    const r = banded(DOX, v.bilirubin, 'mg/dL', 'the label\'s bilirubin table', `Total bilirubin ${v.bilirubin} mg/dL is below 1.2 mg/dL, where the label's table starts; it gives no modification row.`);
    return { ...r, quiet: r.none, tail: ['The Pfizer label heads its percent column "Dosage Modification"; the ADRIAMYCIN (Hikma) label prints the same rows under "Dose reduction", so 50% and 75% are the cut, not the dose given.', 'The label also names Child-Pugh class C as a contraindication.'] };
  } },
  epirubicin: { label: 'epirubicin', any: ['bilirubin', 'transaminaseXuln', 'creatinine'], run: (v) => {
    const rows = []; const lines = []; const untested = [];
    const half = 'Bilirubin 1.2 to 3 mg/dL or AST 2 to 4 times the upper limit of normal: one half of the recommended starting dose.';
    const quarter = 'Bilirubin above 3 mg/dL or AST above 4 times the upper limit of normal: one quarter of the recommended starting dose.';
    const b = v.bilirubin; const a = v.transaminaseXuln;
    if (b === null) untested.push('bilirubin'); if (a === null) untested.push('AST');
    if (b !== null && b > 5) { rows.push({ text: 'Serum bilirubin greater than 5 mg/dL: contraindicated (severe hepatic impairment).', flag: 'contraindicated' }); lines.push(`Bilirubin ${b} mg/dL is above 5 mg/dL.`); }
    else if ((b !== null && b > 3) || (a !== null && a > 4)) { rows.push({ text: quarter, flag: 'dose' }); lines.push([b !== null && b > 3 ? `bilirubin ${b} mg/dL is above 3` : null, a !== null && a > 4 ? `AST ${a} × ULN is above 4` : null].filter(Boolean).join(' and ').replace(/^b/, 'B') + '.'); }
    else if ((b !== null && b >= 1.2) || (a !== null && a >= 2)) { rows.push({ text: half, flag: 'dose' }); lines.push([b !== null && b >= 1.2 ? `bilirubin ${b} mg/dL is in 1.2 to 3` : null, a !== null && a >= 2 ? `AST ${a} × ULN is in 2 to 4` : null].filter(Boolean).join(' and ').replace(/^b/, 'B') + '.'); }
    else if (b !== null || a !== null) lines.push(`${[b !== null ? `Bilirubin ${b} mg/dL is below 1.2` : null, a !== null ? `AST ${a} × ULN is below 2` : null].filter(Boolean).join(' and ')}: under the label's hepatic rows, which give no modification.`);
    if (v.creatinine !== null) {
      if (v.creatinine > 5) { rows.push({ text: 'Serum creatinine above 5 mg/dL (severe renal impairment): consider lower doses. The label gives no figure.', flag: 'no-recommendation-given' }); lines.push(`Serum creatinine ${v.creatinine} mg/dL is above 5.`); }
      else lines.push(`Serum creatinine ${v.creatinine} mg/dL is not above 5 mg/dL, the label's renal line.`);
    } else untested.push('serum creatinine');
    return { rows, lines, untested, quiet: rows.length === 0, tail: ['The label also names Child-Pugh class C as a contraindication.'] };
  } },
  daunorubicin: { label: 'daunorubicin', any: ['bilirubin', 'creatinine'], run: (v) => {
    const rows = []; const lines = []; const untested = []; let unstated = false;
    if (v.bilirubin !== null) {
      const r = banded(DAUNO_BILI, v.bilirubin, 'mg/dL', 'the label\'s bilirubin rule', `Serum bilirubin ${v.bilirubin} mg/dL is below 1.2 mg/dL, where the label's rule starts.`);
      rows.push(...r.rows); lines.push(...r.lines); unstated = r.unstated;
    } else untested.push('bilirubin');
    if (v.creatinine !== null) {
      if (v.creatinine > 3) { rows.push({ text: 'Serum creatinine greater than 3 mg/dL: 50% of the usual daily dose.', flag: 'dose' }); lines.push(`Serum creatinine ${v.creatinine} mg/dL is above 3.`); }
      else lines.push(`Serum creatinine ${v.creatinine} mg/dL is not above 3 mg/dL, the label's renal line.`);
    } else untested.push('serum creatinine');
    const tail = rows.length > 1 ? ['Both a bilirubin row and the creatinine row apply. The label states them separately and does not say how to combine them; nothing is multiplied here.'] : [];
    return { rows, lines, untested, unstated, quiet: rows.length === 0, tail };
  } },
  idarubicin: { label: 'idarubicin', need: ['bilirubin'], run: (v) => {
    const r = banded(IDA_BILI, v.bilirubin, 'mg/dL', 'the label\'s bilirubin table');
    return { ...r, lines: v.bilirubin === 5 ? ['Bilirubin of exactly 5 mg/dL is in neither row: the table reads "less than 5" and "greater than 5". Both rows are shown.'] : r.lines, tail: [
      'Generic idarubicin labels read beside it (Meitheal, Hikma) state the same two figures in older wording: a 50% reduction at bilirubin 2.6 to 5 mg%, and not to give it above 5 mg%.',
      'Kidney function is not tested here, because the labels differ. The IDAMYCIN PFS label has a renal table (GFR under 30 mL/min, or hemodialysis: reduce the dose by 33%); the generic labels say only that a dose reduction should be considered in renal impairment.',
    ] };
  } },
  vincristine: { label: 'vincristine', need: ['directBilirubin'], run: (v) => (v.directBilirubin > 3
    ? { rows: [{ text: 'Direct serum bilirubin above 3 mg/100 mL: a 50% reduction in the dose is recommended.', flag: 'dose' }], lines: [`Direct bilirubin ${v.directBilirubin} mg/dL is above 3.`] }
    : { rows: [], lines: [`Direct bilirubin ${v.directBilirubin} mg/dL is not above 3 mg/100 mL, the only value the label gives a reduction for.`], quiet: true }) },
  'paclitaxel-3-hour': { label: 'paclitaxel', need: ['transaminaseXuln', 'bilirubinXuln'], run: (v) => {
    const tail = ['Table 17 gives first-course doses, for the regimen of 175 mg/m² over 3 hours only; the label has no data for other regimens.'];
    if (v.transaminaseXuln >= 10) return { rows: [PAC3[3]], lines: [`Transaminases ${v.transaminaseXuln} × ULN are 10 × ULN or more.`], tail };
    return { ...banded(PAC3, v.bilirubinXuln, '× ULN', 'the label\'s 3-hour table'), tail };
  } },
  'paclitaxel-24-hour': { label: 'paclitaxel', need: ['transaminaseXuln', 'bilirubin'], run: (v) => {
    const t = v.transaminaseXuln; const b = v.bilirubin;
    const tail = ['Table 17 gives first-course doses, for the regimen of 135 mg/m² over 24 hours only; the label has no data for other regimens.'];
    const none = { text: 'Transaminases 10 × ULN or more, or bilirubin above 7.5 mg/dL: not recommended.', flag: 'not-recommended' };
    const r135 = { text: 'Transaminases under 2 × ULN and bilirubin 1.5 mg/dL or less: 135 mg/m².', flag: 'dose' };
    const r100 = { text: 'Transaminases 2 to under 10 × ULN and bilirubin 1.5 mg/dL or less: 100 mg/m².', flag: 'dose' };
    const r50 = { text: 'Transaminases under 10 × ULN and bilirubin 1.6 to 7.5 mg/dL: 50 mg/m².', flag: 'dose' };
    if (t >= 10 || b > 7.5) return { rows: [none], lines: [`${t >= 10 ? `Transaminases ${t} × ULN are 10 × ULN or more` : `Bilirubin ${b} mg/dL is above 7.5`}.`], tail };
    if (b >= 1.6) return { rows: [r50], lines: [`Transaminases ${t} × ULN (under 10) and bilirubin ${b} mg/dL (1.6 to 7.5).`], tail };
    const low = t < 2 ? r135 : r100;
    if (b > 1.5) return { rows: [r50, low], lines: [`Bilirubin ${b} mg/dL falls between the table's "1.5 mg/dL or less" and "1.6 to 7.5 mg/dL". Both rows are shown.`], unstated: true, tail };
    return { rows: [low], lines: [`Transaminases ${t} × ULN and bilirubin ${b} mg/dL.`], tail };
  } },
  docetaxel: { label: 'docetaxel', need: ['bilirubinXuln', 'transaminaseXuln', 'alkPhosXuln'], run: (v) => {
    const avoid = [v.bilirubinXuln > 1 ? `bilirubin ${v.bilirubinXuln} × ULN is above the upper limit of normal` : null, v.transaminaseXuln > 1.5 && v.alkPhosXuln > 2.5 ? `AST or ALT ${v.transaminaseXuln} × ULN is above 1.5 with alkaline phosphatase ${v.alkPhosXuln} × ULN above 2.5` : null].filter(Boolean);
    if (avoid.length) return { rows: [{ text: 'Avoid docetaxel with bilirubin above the upper limit of normal, or with AST or ALT above 1.5 × ULN together with alkaline phosphatase above 2.5 × ULN.', flag: 'not-recommended' }], lines: [`${avoid.join(', and ').replace(/^./, (c) => c.toUpperCase())}.`] };
    if (v.transaminaseXuln > 1.5) return { rows: [{ text: 'Isolated transaminase elevation above 1.5 × ULN: the label says to consider dose modifications. It gives no figure in this sentence.', flag: 'no-recommendation-given' }], lines: [`AST or ALT ${v.transaminaseXuln} × ULN is above 1.5, with alkaline phosphatase ${v.alkPhosXuln} × ULN not above 2.5.`] };
    return { rows: [], lines: ['Bilirubin is not above the upper limit of normal, and transaminases are not above 1.5 × ULN: neither of the label\'s hepatic sentences is met.'], quiet: true };
  } },
  bleomycin: { label: 'bleomycin', need: ['crcl'], run: (v) => ({ ...banded(BLEO, v.crcl, 'mL/min', 'the label\'s creatinine clearance table'), tail: ['The label\'s table prints each edge (40, 30, 20, 10) in two rows, and stops at 5 mL/min.', 'The label gives its Cockcroft-Gault result the unit "mL/min/1.73m²" while heading the table "mL/min". That is quoted as printed, not corrected.'] }) },
  capecitabine: { label: 'capecitabine', need: ['crcl'], run: (v) => {
    const c = v.crcl; const tail = ['The label specifies creatinine clearance by the Cockcroft-Gault equation.'];
    if (c < 30) return { rows: [{ text: 'Creatinine clearance under 30 mL/min: a dosage has not been established.', flag: 'no-recommendation-given' }], lines: [`Creatinine clearance ${c} mL/min is under 30.`], tail };
    if (c <= 50) return { rows: [{ text: 'Creatinine clearance 30 to 50 mL/min: reduce the dose by 25%.', flag: 'dose' }], lines: [`Creatinine clearance ${c} mL/min is in 30 to 50.`], tail };
    return { rows: [], lines: [`Creatinine clearance ${c} mL/min is above 50 mL/min; the label's renal section gives no reduction there.`], quiet: true, tail };
  } },
  pemetrexed: { label: 'pemetrexed', need: ['crcl'], run: (v) => (v.crcl < 45
    ? { rows: [{ text: 'Creatinine clearance less than 45 mL/min: there is no recommended dose.', flag: 'no-recommendation-given' }], lines: [`Creatinine clearance ${v.crcl} mL/min is under 45.`], tail: ['The label specifies creatinine clearance by the Cockcroft-Gault equation.'] }
    : { rows: [{ text: 'Creatinine clearance 45 mL/min or greater: the label\'s dosing recommendations apply (500 mg/m²).', flag: 'no-adjustment' }], lines: [`Creatinine clearance ${v.crcl} mL/min is 45 or greater.`], tail: ['The label specifies creatinine clearance by the Cockcroft-Gault equation.', v.crcl <= 79 ? 'Between 45 and 79 mL/min the label restricts ibuprofen around each dose (2 days before, the day of, and 2 days after).' : null].filter(Boolean) }) },
  dexrazoxane: { label: 'dexrazoxane', need: ['crcl'], run: (v) => (v.crcl < 40
    ? { rows: [{ text: 'Creatinine clearance less than 40 mL/min: reduce the dose by 50% (a 5:1 ratio to doxorubicin).', flag: 'dose' }], lines: [`Creatinine clearance ${v.crcl} mL/min is under 40.`] }
    : { rows: [], lines: [`Creatinine clearance ${v.crcl} mL/min is not under 40 mL/min; the label gives no renal reduction there (a 10:1 ratio to doxorubicin).`], quiet: true }) },
  'carboplatin-retreatment': { label: 'carboplatin', need: ['platelets', 'neutrophils'], run: (v) => {
    const p = banded(PLT, v.platelets, '/mm³', 'the platelet column'); const n = banded(ANC, v.neutrophils, '/mm³', 'the neutrophil column');
    const tail = ['The table uses the lowest post-treatment counts, and its percentages are of the prior course dose. The label adds that escalations above 125% were not recommended, and that the studies also used 50% to 60% for severe myelosuppression.'];
    const same = p.rows.length === 1 && n.rows.length === 1 && p.rows[0].text === n.rows[0].text;
    if (same) return { rows: [p.rows[0]], lines: [`Platelets ${v.platelets.toLocaleString('en-US')} and neutrophils ${v.neutrophils.toLocaleString('en-US')} fall in the same row.`], tail };
    const order = PLT.map((x) => x.text);
    const rows = [...p.rows, ...n.rows].filter((r, i, a) => a.findIndex((x) => x.text === r.text) === i).sort((a, b) => order.indexOf(b.text) - order.indexOf(a.text));
    return { rows, lines: [`Platelets ${v.platelets.toLocaleString('en-US')} and neutrophils ${v.neutrophils.toLocaleString('en-US')} do not fall in one row of the label's table. It pairs the two counts row by row and does not say which governs when they differ; each count's row is shown.`], unstated: true, tail };
  } },
};

export function chemoOrganLabelDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const drug = DRUGS.find((d) => d.value === String(o.drug ?? '').trim());
  if (!drug) return { valid: false, message: 'Choose the drug. Each label has its own rule and reads its own laboratory values.' };
  const rule = RULES[drug.value];
  const reads = rule.need || rule.any;
  const v = {};
  for (const key of Object.keys(F)) v[key] = null;
  for (const key of reads) {
    const [arg, label, lo, hi, unit] = F[key];
    if (blank(o[arg])) {
      if (rule.need) return { valid: false, message: `Enter ${label}${unit.startsWith('×') ? '' : ` in ${unit}`}: the ${LABELS[rule.label].name} rule reads it.` };
      continue;
    }
    const f = inputFault([[label, o[arg], lo, hi, unit]]);
    if (f) return { valid: false, message: f };
    v[key] = Number(o[arg]);
  }
  if (rule.any && reads.every((k) => v[k] === null)) return { valid: false, message: `Enter at least one of the values the ${LABELS[rule.label].name} label reads: ${reads.map((k) => F[k][1].replace(/^the /, '')).join(', ')}.` };

  const rowsNeeded = [rule.label, ...(rule.also || [])];
  for (const key of rowsNeeded) {
    const lr = labelRow(LABELS[key].setId, now, table);
    if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: lr.url, band: `The ${LABELS[key].name} label figures are withheld: ${lr.why}. Read the rule from the label in hand.`, bandLabel: 'Withheld', notes: [], note: NOTE };
  }
  const lr = labelRow(LABELS[rule.label].setId, now, table);
  const r = rule.run(v);
  const untested = r.untested || [];
  const name = drug.text.replace(/ \(.*$/, '');
  const notes = [...r.lines, ...r.rows.slice(1).map((x) => x.text), ...(r.tail || [])];
  if (untested.length) notes.push(`Not tested, because no value was entered: ${untested.join(', ')}. The label also has a rule for ${untested.length === 1 ? 'it' : 'each'}.`);
  notes.push(`Label: ${lr.edition}.`);
  let flag; let band; let label;
  if (!r.rows.length) {
    flag = untested.length ? 'no-row-incomplete' : 'no-row'; label = untested.length ? 'No rule met; not all tested' : 'No rule met';
    band = `${name}: none of the label's dose-modification rows is met by the values entered${untested.length ? `, and ${untested.join(' and ')} ${untested.length === 1 ? 'was' : 'were'} not tested` : ''}.`;
  } else {
    flag = r.unstated ? 'label-does-not-settle' : worstFlag(r.rows);
    label = r.unstated ? 'Label does not settle it' : r.rows.length > 1 ? `${r.rows.length} rules met` : { dose: 'Dose modified', 'no-adjustment': 'No adjustment', 'not-recommended': 'Not recommended', contraindicated: 'Contraindicated', 'no-recommendation-given': 'No dose given' }[flag];
    band = r.unstated ? `${name}: the label does not settle this value on one row, so ${r.rows.length === 2 ? 'both rows are' : 'each row is'} shown, the more restrictive first. ${r.rows[0].text}`
      : r.rows.length > 1 ? `${name}: ${r.rows.length} label rules are met, stated separately in the label. ${r.rows[0].text}`
        : `${name}: ${r.rows[0].text}`;
  }
  return {
    valid: true, flag, abnormal: !(flag === 'no-adjustment' || flag === 'no-row'), labelUrl: lr.url, drug: drug.value,
    rows: r.rows.map((x) => ({ text: x.text, flag: x.flag })), untested,
    band, bandLabel: label, notes, note: NOTE,
  };
}
