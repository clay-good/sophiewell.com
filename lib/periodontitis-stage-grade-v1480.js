// spec-v1480: periodontitis staging and grading (2017 World Workshop, AAP/EFP), beside the plaque,
// gingival and caries indices.
//
// Sources, read 2026-09-25:
//   Tonetti MS, Greenwell H, Kornman KS. Staging and grading of periodontitis: framework and proposal
//     of a new classification and case definition. J Periodontol. 2018;89 Suppl 1:S159-S172; and
//     Papapanou PN et al, the consensus report, J Periodontol 2018;89 Suppl 1:S173-S182.
//   Tables as reproduced in open sources, which agree except where noted:
//     Int Dent J 2021, "Current Concepts in the Management of Periodontitis" (PMC9275292), Tables 2
//       and 3 ("modified from Papapanou et al. (2018)"), with the rules: "The stage of periodontitis
//       is initially determined based on clinical attachment loss (CAL). If CAL is not available, then
//       radiographic bone loss can be used. A history of tooth loss due to periodontitis may modify the
//       stage. In the presence of any complexity factor, the stage may shift to a higher tier. For
//       example, the presence of class II or III furcation involvement would shift to either stage III
//       or IV regardless of CAL, radiographic bone loss, or tooth loss due to periodontitis." And: "Grade
//       is primarily determined by the direct evidence of progression. If not available, then the
//       indirect evidence of progression can be used. In the presence of risk factors for
//       periodontitis, the grade can shift to a higher tier."
//     Clin Oral Investig 2023 (PMC10630190), Tables 2 and 3, "based on Tonetti".
//   Stage: interdental CAL at the site of greatest loss 1-2 mm I, 3-4 mm II, >= 5 mm III/IV;
//     radiographic bone loss < 15% (coronal third) I, 15-33% II, into the middle or apical third
//     III/IV; tooth loss due to periodontitis none (I, II), <= 4 (III), >= 5 (IV); complexity: maximum
//     probing depth <= 4 mm (I), <= 5 mm (II); stage III adds probing depth >= 6 mm, vertical bone loss
//     >= 3 mm, furcation class II or III, moderate ridge defect; stage IV adds the need for complex
//     rehabilitation (masticatory dysfunction, secondary occlusal trauma with mobility degree >= 2,
//     severe ridge defect, bite collapse, drifting, flaring, fewer than 20 remaining teeth).
//     The Int Dent J table prints stage III tooth loss as "< 4"; the Tonetti-based table prints
//     "<= 4", which closes the gap to stage IV's ">= 5". The tile follows "<= 4".
//   Grade: direct evidence over 5 years -- no loss A, < 2 mm B, >= 2 mm C; indirect, % bone loss /
//     age -- < 0.25 A, 0.25 to 1.0 B, > 1.0 C (the Int Dent J table prints ">= 1.0" for C; exactly 1.0
//     is named). Modifiers: smoking < 10 cigarettes a day at least B, >= 10 C; diabetes with HbA1c
//     < 7.0% at least B, >= 7.0% C.
//
// The stage needs CAL or bone loss; the grade needs direct or indirect evidence. A blank is asked
// for, never assumed. Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const PD_RBL = [
  { value: 'coronal-lt15', text: 'Under 15%, coronal third' },
  { value: 'coronal-15-33', text: '15% to 33%, coronal third' },
  { value: 'middle-apical', text: 'Into the middle or apical third of the root' },
];
export const PD_DIRECT = [
  { value: 'none', text: 'No loss over 5 years' },
  { value: 'lt2', text: 'Less than 2 mm over 5 years' },
  { value: 'ge2', text: '2 mm or more over 5 years' },
];
export const PD_SMOKING = [
  { value: 'non', text: 'Non-smoker' },
  { value: 'lt10', text: 'Smoker, under 10 cigarettes a day' },
  { value: 'ge10', text: 'Smoker, 10 or more cigarettes a day' },
];
export const PD_DIABETES = [
  { value: 'none', text: 'No diabetes' },
  { value: 'lt7', text: 'Diabetes, HbA1c under 7.0%' },
  { value: 'ge7', text: 'Diabetes, HbA1c 7.0% or higher' },
];
export const PD_EXTENT = [
  { value: 'localized', text: 'Localized, under 30% of teeth' },
  { value: 'generalized', text: 'Generalized' },
  { value: 'molar-incisor', text: 'Molar/incisor pattern' },
];

const ROMAN = ['', 'I', 'II', 'III', 'IV'];
const GRADES = ['A', 'B', 'C'];
const truthy = (v) => v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes';
const has = (list, v) => list.some((x) => x.value === v);
const blank = (v) => v === undefined || v === null || String(v).trim() === '';

export function periodontitisStageGrade(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fault = inputFault([
    ['the interdental attachment loss at the site of greatest loss', o.cal, 0, 20, 'mm'],
    ['the teeth lost to periodontitis', o.toothLoss, 0, 32, ''],
    ['the maximum probing depth', o.maxPd, 0, 20, 'mm'],
    ['the percentage of bone loss at the worst site', o.boneLossPct, 0, 100, '%'],
    ['the age', o.age, 1, 120, 'years'],
  ].filter(([, v]) => !blank(v)));
  if (fault) return { valid: false, message: fault };

  const cal = blank(o.cal) ? null : Number(o.cal);
  const rbl = has(PD_RBL, o.rbl) ? o.rbl : null;
  if (cal === null && rbl === null) {
    return { valid: false, message: 'Enter the interdental attachment loss at the site of greatest loss, or choose the radiographic bone loss: the stage starts from one of them.' };
  }
  if (cal !== null && cal < 1) {
    return { valid: false, message: 'Enter the attachment loss again: the staging starts at 1 mm of interdental loss, and less than that is not periodontitis by this definition.' };
  }
  if (blank(o.toothLoss)) {
    return { valid: false, message: 'Enter the number of teeth lost to periodontitis (0 if none): any loss moves the stage to III or IV.' };
  }
  const toothLoss = Number(o.toothLoss);

  // Stage: the severity sets the floor, and tooth loss and complexity can only raise it.
  const why = [];
  let stage;
  if (cal !== null) {
    stage = cal >= 5 ? 3 : cal >= 3 ? 2 : 1;
    why.push(`interdental attachment loss ${cal} mm`);
  } else {
    stage = rbl === 'middle-apical' ? 3 : rbl === 'coronal-15-33' ? 2 : 1;
    why.push(`radiographic bone loss ${PD_RBL.find((x) => x.value === rbl).text.toLowerCase()}`);
  }
  const raise = (to, reason) => { if (to > stage) { stage = to; why.push(reason); } };
  if (toothLoss >= 5) raise(4, `${toothLoss} teeth lost to periodontitis`);
  else if (toothLoss >= 1) raise(3, `${toothLoss} ${toothLoss === 1 ? 'tooth' : 'teeth'} lost to periodontitis`);
  const pd = blank(o.maxPd) ? null : Number(o.maxPd);
  if (pd !== null && pd >= 6) raise(3, `a probing depth of ${pd} mm`);
  else if (pd !== null && pd >= 5) raise(2, `a probing depth of ${pd} mm`);
  if (truthy(o.verticalBoneLoss)) raise(3, 'vertical bone loss of 3 mm or more');
  if (truthy(o.furcation)) raise(3, 'class II or III furcation involvement');
  if (truthy(o.ridgeDefect)) raise(3, 'a moderate ridge defect');
  if (truthy(o.complexRehab)) raise(4, 'the need for complex rehabilitation');

  // Grade: direct evidence first, then the bone loss / age ratio; risk factors can only raise it.
  let grade = null;
  let gradeWhy;
  const notes = [];
  if (has(PD_DIRECT, o.direct)) {
    grade = o.direct === 'none' ? 0 : o.direct === 'lt2' ? 1 : 2;
    gradeWhy = PD_DIRECT.find((x) => x.value === o.direct).text.toLowerCase();
  } else if (!blank(o.boneLossPct) && !blank(o.age)) {
    const ratio = Number(o.boneLossPct) / Number(o.age);
    grade = ratio < 0.25 ? 0 : ratio <= 1 ? 1 : 2;
    gradeWhy = `bone loss / age ${ratio.toFixed(2)}, as no direct evidence of progression was entered`;
    if (ratio === 1) notes.push('A ratio of exactly 1.0 is grade B in the Tonetti table and grade C in the Int Dent J reproduction ("1.0 or more").');
  } else {
    return { valid: false, message: 'Choose the direct evidence of progression over 5 years, or enter the bone loss percentage at the worst site and the age: the grade starts from one of them.' };
  }
  const gradeWhyAll = [gradeWhy];
  const lift = (to, reason) => { if (to > grade) { grade = to; gradeWhyAll.push(reason); } };
  if (o.smoking === 'ge10') lift(2, 'smoking 10 or more cigarettes a day');
  else if (o.smoking === 'lt10') lift(1, 'smoking under 10 cigarettes a day');
  if (o.diabetes === 'ge7') lift(2, 'diabetes with an HbA1c of 7.0% or higher');
  else if (o.diabetes === 'lt7') lift(1, 'diabetes with an HbA1c under 7.0%');
  const missing = [!has(PD_SMOKING, o.smoking) && 'smoking', !has(PD_DIABETES, o.diabetes) && 'diabetes'].filter(Boolean);
  if (missing.length && grade < 2) {
    notes.push(`No ${missing.join(' or ')} status was entered; ${missing.length === 1 ? 'it' : 'either'} can only raise the grade.`);
  }

  const extent = has(PD_EXTENT, o.extent) ? PD_EXTENT.find((x) => x.value === o.extent).text.toLowerCase() : null;
  const label = `Stage ${ROMAN[stage]}, grade ${GRADES[grade]}`;
  notes.push('The complexity factors are read as the source lists them; a stage IV complexity factor is any need for complex rehabilitation (masticatory dysfunction, secondary occlusal trauma, severe ridge defect, bite collapse, drifting, flaring, or fewer than 20 remaining teeth).');

  return {
    valid: true,
    stage: ROMAN[stage],
    grade: GRADES[grade],
    abnormal: true,
    band: `Periodontitis stage ${ROMAN[stage]}, grade ${GRADES[grade]}${extent ? `, ${extent}` : ''}: stage from ${why.join(', ')}; grade from ${gradeWhyAll.join(', ')}.`,
    bandLabel: label,
    notes,
    note: 'Staging and grading of periodontitis, 2017 World Workshop (Tonetti MS et al; Papapanou PN et al, J Periodontol 2018), as reproduced in Int Dent J 2021 and Clin Oral Investig 2023. It classifies a diagnosed periodontitis; it does not make the diagnosis, and treatment is a clinical decision.',
  };
}
