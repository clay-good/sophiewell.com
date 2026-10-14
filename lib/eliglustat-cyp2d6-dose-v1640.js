// spec-v1640 tool 6: the eliglustat (Cerdelga) dosage the label gives for a CYP2D6 metabolizer status,
// hepatic and renal function, and concomitant CYP2D6 and CYP3A inhibitors.
//
// Source, re-read October 13, 2026 (DailyMed, Genzyme; set id 819f828a-b888-4e46-83fc-94d774a28a83,
// version 13, published March 11, 2024). The rules are applied in this order:
//   1  Limitations of use. "Patients who are CYP2D6 ultra-rapid metabolizers (URMs) may not achieve
//      adequate concentrations of CERDELGA to achieve a therapeutic effect". "A specific dosage cannot
//      be recommended for those patients whose CYP2D6 genotype cannot be determined".
//   4  Contraindications. EMs: "a strong or moderate CYP2D6 inhibitor concomitantly with a strong or
//      moderate CYP3A inhibitor"; "Moderate or severe hepatic impairment"; "Mild hepatic impairment
//      and taking a strong or moderate CYP2D6 inhibitor". IMs: the same inhibitor pair; "Taking a
//      strong CYP3A inhibitor"; "Any degree of hepatic impairment". PMs: "Taking a strong CYP3A
//      inhibitor"; "Any degree of hepatic impairment".
//   8.6 EMs: "Avoid CERDELGA in patients with end-stage renal disease (ESRD)"; "No dosage adjustment
//      is recommended in patients with mild, moderate, or severe renal impairment". IMs and PMs:
//      "Avoid CERDELGA in patients with any degree of renal impairment."
//   7.1 Table 5, read cell by cell in the table markup with its row and column spans (columns EMs,
//      IMs, PMs):
//        CYP2D6 inhibitor   strong, moderate  once daily | once daily | continue once daily
//                           weak              twice daily | twice daily | continue once daily
//        CYP3A inhibitor    strong            once daily | contraindicated | contraindicated
//                           moderate          once daily | avoid | avoid
//                           weak              twice daily | twice daily | avoid
//        CYP2D6 strong or moderate with a strong CYP3A inhibitor    contraindicated in all three
//        CYP2D6 strong or moderate with a moderate CYP3A inhibitor  contraindicated | contraindicated | avoid
//        Strong CYP3A inducer                                       avoid in all three
//      Table 5 has no row for a weak inhibitor of one enzyme taken with an inhibitor of the other;
//      for those pairs each single row is shown and no dosage is given.
//   2.3 Table 2 (84 mg once daily). EMs without hepatic impairment "Taking a strong or moderate CYP2D6
//      inhibitor" or "a strong or moderate CYP3A inhibitor"; EMs with mild hepatic impairment "Taking a
//      weak CYP2D6 inhibitor" or "a strong, moderate, or weak CYP3A inhibitor"; IMs without hepatic
//      impairment "Taking a strong or moderate CYP2D6 inhibitor".
//   2.2 Table 1. EMs and IMs 84 mg twice daily; PMs 84 mg once daily.
//
// The label says "extensive"; CPIC says "normal". Both words are shown. Inhibitor strength is the
// reader's entry: the tool does not classify a drug.
//
// Pure: no DOM, no network. `now` is read only to check that the label edition still stands.

import { labelRow } from './label-row.js';

export const CERDELGA = '819f828a-b888-4e46-83fc-94d774a28a83';
export const STATUSES = [
  { value: 'extensive', text: 'Extensive (normal) metabolizer' },
  { value: 'intermediate', text: 'Intermediate metabolizer' },
  { value: 'poor', text: 'Poor metabolizer' },
  { value: 'ultrarapid', text: 'Ultra-rapid metabolizer' },
  { value: 'indeterminate', text: 'Indeterminate (genotype could not be determined)' },
];
export const HEPATIC = [
  { value: 'no-hepatic-impairment', text: 'No hepatic impairment' },
  { value: 'mild-child-pugh-a', text: 'Mild (Child-Pugh A)' },
  { value: 'moderate-child-pugh-b', text: 'Moderate (Child-Pugh B)' },
  { value: 'severe-child-pugh-c', text: 'Severe (Child-Pugh C)' },
];
export const RENAL = [
  { value: 'no-renal-impairment', text: 'No renal impairment' },
  { value: 'mild-to-severe', text: 'Mild, moderate or severe (eCLcr at least 15 mL/min)' },
  { value: 'esrd', text: 'End-stage renal disease (eCLcr under 15 mL/min, or dialysis)' },
];
export const STRENGTHS = [
  { value: 'none', text: 'None' },
  { value: 'weak', text: 'Weak' },
  { value: 'moderate', text: 'Moderate' },
  { value: 'strong', text: 'Strong' },
];
const NAME = { extensive: 'extensive (normal) metabolizers', intermediate: 'intermediate metabolizers', poor: 'poor metabolizers' };
const INDUCER = 'Table 5 also says "Avoid coadministration" with a strong CYP3A inducer for every metabolizer status. Inducers are not an input here.';
const POSTURE = 'This is what the label states for the entries above. Inhibitor strength is the reader\'s entry; the tool does not classify a drug. It is not advice for a particular patient.';
const pick = (list, v) => list.find((x) => x.value === String(v ?? '').trim());

export function eliglustatCyp2d6Dose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const status = pick(STATUSES, o.status);
  if (!status) return { valid: false, message: 'Choose the CYP2D6 metabolizer status on the report. The label gives a dosage by status and has none without it.' };
  const lr = labelRow(CERDELGA, now, table);
  const labelLinks = [{ text: 'Cerdelga label on DailyMed', url: lr.url }];
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelLinks, band: `The Cerdelga label figures are withheld: ${lr.why}. Read the dosage from the current label.`, bandLabel: 'Withheld', notes: [] };
  const tail = [`Label: ${lr.edition}.`, POSTURE];
  const base = { valid: true, withheld: false, status: status.value, labelLinks, bandLabel: status.text };
  const stop = (flag, band, notes) => ({ ...base, flag, abnormal: true, dosage: null, band, notes: [...notes, ...tail] });

  // Step 1: the limitations of use need no other entry.
  if (status.value === 'ultrarapid') return stop('limitation-of-use', 'No dosage: the label lists ultra-rapid metabolizers under Limitations of Use.', ['Section 1: "Patients who are CYP2D6 ultra-rapid metabolizers (URMs) may not achieve adequate concentrations of CERDELGA to achieve a therapeutic effect".']);
  if (status.value === 'indeterminate') return stop('no-label-dosage', 'No dosage: the label cannot recommend one for an indeterminate metabolizer.', ['Section 1: "A specific dosage cannot be recommended for those patients whose CYP2D6 genotype cannot be determined (indeterminate metabolizers)".']);

  const hepatic = pick(HEPATIC, o.hepatic);
  if (!hepatic) return { valid: false, message: 'Choose the hepatic impairment status. The label contraindicates eliglustat by it, so the tool does not assume none.' };
  const renal = pick(RENAL, o.renal);
  if (!renal) return { valid: false, message: 'Choose the renal function. Section 8.6 of the label says when to avoid eliglustat by it, so the tool does not assume normal.' };
  const d6 = pick(STRENGTHS, o.cyp2d6Inhibitor);
  if (!d6) return { valid: false, message: 'Choose the strength of any concomitant CYP2D6 inhibitor, or "None". The tool does not assume there is none.' };
  const a3 = pick(STRENGTHS, o.cyp3aInhibitor);
  if (!a3) return { valid: false, message: 'Choose the strength of any concomitant CYP3A inhibitor, or "None". The tool does not assume there is none.' };

  const s = status.value; const who = NAME[s];
  const hi = hepatic.value; const noHi = hi === 'no-hepatic-impairment'; const mild = hi === 'mild-child-pugh-a';
  const d6sm = d6.value === 'strong' || d6.value === 'moderate';
  const a3sm = a3.value === 'strong' || a3.value === 'moderate';

  // Step 2: contraindications (section 4).
  const ci = [];
  if (s !== 'poor' && d6sm && a3sm) ci.push(`Section 4, ${who}: "Taking a strong or moderate CYP2D6 inhibitor concomitantly with a strong or moderate CYP3A inhibitor".`);
  if (s !== 'extensive' && a3.value === 'strong') ci.push(`Section 4, ${who}: "Taking a strong CYP3A inhibitor".`);
  if (s === 'extensive' && (hi === 'moderate-child-pugh-b' || hi === 'severe-child-pugh-c')) ci.push('Section 4, extensive metabolizers: "Moderate or severe hepatic impairment".');
  if (s === 'extensive' && mild && d6sm) ci.push('Section 4, extensive metabolizers: "Mild hepatic impairment and taking a strong or moderate CYP2D6 inhibitor".');
  if (s !== 'extensive' && !noHi) ci.push(`Section 4, ${who}: "Any degree of hepatic impairment".`);
  if (ci.length) return stop('contraindicated', 'Contraindicated by the label for these entries.', [...ci, 'Section 4 gives the reason: "the risk of cardiac arrhythmias from prolongation of the PR, QTc, and/or QRS cardiac intervals."']);

  // Step 3: "avoid" (section 8.6 and Table 5).
  const avoid = [];
  if (s === 'extensive' && renal.value === 'esrd') avoid.push('Section 8.6, extensive metabolizers: "Avoid CERDELGA in patients with end-stage renal disease (ESRD)".');
  if (s !== 'extensive' && renal.value !== 'no-renal-impairment') avoid.push(`Section 8.6, ${who}: "Avoid CERDELGA in patients with any degree of renal impairment."`);
  if (s !== 'extensive' && a3.value === 'moderate') avoid.push(`Section 7.1, Table 5, moderate CYP3A inhibitor, ${who}: "Avoid coadministration".`);
  if (s === 'poor' && a3.value === 'weak') avoid.push('Section 7.1, Table 5, weak CYP3A inhibitor, poor metabolizers: "Avoid coadministration".');
  if (avoid.length) return stop('avoid', 'The label says to avoid eliglustat for these entries.', avoid);

  const once = '84 mg once daily'; const twice = '84 mg twice daily';
  // What Table 5 says for one inhibitor alone, without hepatic impairment (poor metabolizers never reach here with a CYP3A inhibitor).
  const single2d6 = s === 'poor' ? 'continue 84 mg once daily' : d6sm ? 'reduce to 84 mg once daily' : 'continue 84 mg twice daily';
  const single3a = s === 'extensive' && a3sm ? 'reduce to 84 mg once daily' : 'continue 84 mg twice daily';

  // Step 4: two inhibitors together where Table 5 has no row for the pair.
  if (d6.value !== 'none' && a3.value !== 'none') {
    return stop('no-row-for-the-pair', 'No dosage: Table 5 of the label has no row for these two inhibitors together.', [
      `Table 5 pairs only a strong or moderate CYP2D6 inhibitor with a strong or moderate CYP3A inhibitor. Entered: a ${d6.value} CYP2D6 inhibitor with a ${a3.value} CYP3A inhibitor.`,
      mild
        ? 'Table 2, extensive metabolizers with mild hepatic impairment, each alone: a weak CYP2D6 inhibitor, 84 mg once daily; a CYP3A inhibitor of any strength, 84 mg once daily. The label does not combine them.'
        : `Table 5, each alone, ${who}: ${d6.value} CYP2D6 inhibitor, ${single2d6}; ${a3.value} CYP3A inhibitor, ${single3a}. The label does not combine them.`,
      'Section 7.1: "CYP2D6 or CYP3A inhibitors may increase eliglustat concentrations which may increase the risk of cardiac arrhythmias".',
    ]);
  }

  // Step 5: Table 2 (once daily) and Table 1.
  const notes = []; let dosage;
  if (s === 'poor') {
    dosage = once;
    notes.push('Section 2.2, Table 1: poor metabolizers, "84 mg once daily".');
    if (d6.value !== 'none') notes.push('Section 7.1, Table 5, CYP2D6 inhibitor of any strength, poor metabolizers: "Continue CERDELGA 84 mg once daily" (footnote: "No effect of CYP2D6 inhibitor due to little or no CYP2D6 activity in CYP2D6 PMs").');
  } else if (s === 'extensive' && mild && (d6.value === 'weak' || a3.value !== 'none')) {
    dosage = once;
    notes.push(`Section 2.3, Table 2: extensive metabolizers with mild (Child-Pugh Class A) hepatic impairment "Taking a ${d6.value === 'weak' ? 'weak CYP2D6 inhibitor' : 'strong, moderate, or weak CYP3A inhibitor'}": 84 mg once daily.`);
  } else if (d6sm) {
    dosage = once;
    notes.push(`Section 2.3, Table 2: ${who} without hepatic impairment "Taking a strong or moderate CYP2D6 inhibitor": 84 mg once daily.`);
  } else if (s === 'extensive' && a3sm) {
    dosage = once;
    notes.push('Section 2.3, Table 2: extensive metabolizers without hepatic impairment "Taking a strong or moderate CYP3A inhibitor": 84 mg once daily.');
  } else {
    dosage = twice;
    notes.push(`Section 2.2, Table 1: ${who}, "84 mg twice daily".`);
    if (d6.value === 'weak') notes.push('Section 7.1, Table 5, weak CYP2D6 inhibitor: "Continue CERDELGA 84 mg twice daily".');
    if (a3.value === 'weak') notes.push('Section 7.1, Table 5, weak CYP3A inhibitor: "Continue CERDELGA 84 mg twice daily".');
    if (mild) notes.push('Section 8.7, extensive metabolizers: "No dosage adjustment is recommended in patients with mild hepatic impairment, unless otherwise specified above."');
  }
  if (s === 'extensive' && renal.value === 'mild-to-severe') notes.push('Section 8.6, extensive metabolizers: "No dosage adjustment is recommended in patients with mild, moderate, or severe renal impairment (eCLcr at least 15 mL/min)."');
  notes.push('The label writes "extensive" for the status that CPIC and many lab reports call "normal".', INDUCER, ...tail);
  return { ...base, flag: dosage === once ? 'once-daily' : 'twice-daily', abnormal: false, dosage, band: `Label dosage: ${dosage}.`, notes };
}
