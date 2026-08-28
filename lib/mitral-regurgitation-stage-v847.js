// spec-v847: the ACC/AHA stages of chronic PRIMARY mitral regurgitation, A to D.
//
// Source:
//   Otto CM, Nishimura RA, Bonow RO, et al. 2020 ACC/AHA Guideline for the Management of
//   Patients With Valvular Heart Disease. Circulation. 2021;143(5):e72-e227.
//
//   A   AT RISK. Mild prolapse with normal coaptation, mild leaflet thickening, or previous
//       infective endocarditis, with no more than a trivial jet.
//   B   PROGRESSIVE. Vena contracta below 0.7 cm, regurgitant volume below 60 mL, fraction
//       below 50 percent, orifice below 0.40 cm^2.
//   C   ASYMPTOMATIC SEVERE. Vena contracta 0.7 cm or more, volume 60 mL or more, fraction
//       50 percent or more, orifice 0.40 cm^2 or more.
//       C1: ejection fraction above 60 percent AND end-systolic dimension below 40 mm.
//       C2: ejection fraction 60 percent or less, OR end-systolic dimension 40 mm or more.
//   D   SYMPTOMATIC SEVERE.
//
// AN EJECTION FRACTION OF 60 PERCENT IS ALREADY DYSFUNCTION HERE, AND THAT IS THE POINT OF
// THIS TILE. In mitral regurgitation part of every stroke goes backwards into a low-pressure
// atrium instead of forwards against systemic afterload, so the measured ejection fraction
// flatters the ventricle. A normal ejection fraction in severe mitral regurgitation is ABOVE
// 60 percent; 60 or below is left ventricular dysfunction. Read against the 50 percent
// threshold used almost everywhere else in cardiology, an ejection fraction of 55 percent
// looks reassuring - and it is exactly the patient the guideline wants reconsidered.
//
// THE DIMENSION REACHES C2 ON ITS OWN. An end-systolic dimension of 40 mm or more is C2 even
// with a preserved ejection fraction, because the ventricle dilating is the earlier signal.
//
// THIS TILE IS FOR PRIMARY REGURGITATION ONLY - a problem of the valve itself: prolapse,
// flail, rheumatic change, endocarditis. SECONDARY regurgitation, where the valve is normal
// and the ventricle or atrium has pulled it open, is staged against its own criteria and its
// management is a different question. Applying these thresholds to a secondary leak is a
// real and common error, so the tile says which disease it is answering for on every result
// rather than leaving that to be assumed.
//
// Pure: no DOM, no clock, no network.

export const MR_STAGE_NOTE = 'The chronic primary mitral regurgitation stages of the 2020 ACC/AHA valvular heart disease guideline (Otto CM, Nishimura RA, Bonow RO, et al, Circulation 2021;143(5):e72-e227) run from A to D. Stage A is being at risk, with mild prolapse and normal coaptation, mild leaflet thickening or previous infective endocarditis. Stage B is progressive disease, with a vena contracta below 0.7 cm, a regurgitant volume below 60 mL, a fraction below 50 percent and an orifice below 0.40 square cm. Stage C is asymptomatic severe disease at a vena contracta of 0.7 cm or more, a volume of 60 mL or more, a fraction of 50 percent or more or an orifice of 0.40 square cm or more. Stage D is the same with symptoms. Stage C splits on the ventricle: C1 is an ejection fraction above 60 percent with an end-systolic dimension below 40 mm, and C2 is an ejection fraction of 60 percent or less or a dimension of 40 mm or more. The point that matters is that an ejection fraction of 60 percent is already dysfunction in this disease. Part of every stroke goes backwards into a low-pressure atrium rather than forwards against systemic afterload, so the measured ejection fraction flatters the ventricle; a normal value in severe mitral regurgitation is above 60 percent. Read against the 50 percent threshold used almost everywhere else in cardiology, an ejection fraction of 55 percent looks reassuring, and that is exactly the patient the guideline wants reconsidered. These criteria are for primary regurgitation, a problem of the valve itself. Secondary regurgitation, where the valve is normal and the ventricle or atrium has pulled it open, is staged against its own criteria and applying these thresholds to it is a common error. It applies a published staging to measurements already taken and it does not select or adjust therapy.';

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

// 1 mild, 2 moderate, 3 severe. Each criterion grades on its own scale.
function gradeVenaContracta(v) { return v >= 0.7 ? 3 : (v >= 0.3 ? 2 : 1); }
function gradeVolume(v) { return v >= 60 ? 3 : (v >= 30 ? 2 : 1); }
function gradeFraction(v) { return v >= 50 ? 3 : (v >= 30 ? 2 : 1); }
function gradeOrifice(v) { return v >= 0.40 ? 3 : (v >= 0.20 ? 2 : 1); }

const GRADE_NAMES = { 1: 'mild', 2: 'moderate', 3: 'severe' };

export function mitralRegurgitationStage(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const vc = num(o.venaContracta);
  const rvol = num(o.regurgitantVolume);
  const rf = num(o.regurgitantFraction);
  const ero = num(o.regurgitantOrifice);
  const lvef = num(o.ejectionFraction);
  const lvesd = num(o.endSystolicDimension);
  const atRisk = truthy(o.atRiskValve);
  const symptoms = truthy(o.symptoms);

  const anyCriterion = vc !== null || rvol !== null || rf !== null || ero !== null;
  if (!anyCriterion && !atRisk) {
    return { valid: false, message: 'Enter at least one severity measurement - vena contracta, regurgitant volume, regurgitant fraction or effective regurgitant orifice - or record an at-risk valve.' };
  }
  if (vc !== null && (vc < 0 || vc > 3)) {
    return { valid: false, message: 'Vena contracta is outside a plausible range of 0 to 3 cm.' };
  }
  if (rvol !== null && (rvol < 0 || rvol > 300)) {
    return { valid: false, message: 'Regurgitant volume is outside a plausible range of 0 to 300 mL.' };
  }
  if (rf !== null && (rf < 0 || rf > 100)) {
    return { valid: false, message: 'Regurgitant fraction is outside a plausible range of 0 to 100 percent.' };
  }
  if (ero !== null && (ero < 0 || ero > 3)) {
    return { valid: false, message: 'Effective regurgitant orifice is outside a plausible range of 0 to 3 square cm.' };
  }
  if (lvef !== null && (lvef < 5 || lvef > 85)) {
    return { valid: false, message: 'Ejection fraction is outside a plausible range of 5 to 85 percent.' };
  }
  if (lvesd !== null && (lvesd < 10 || lvesd > 100)) {
    return { valid: false, message: 'End-systolic dimension is outside a plausible range of 10 to 100 mm.' };
  }

  const grades = [];
  if (vc !== null) grades.push({ name: 'vena contracta', grade: gradeVenaContracta(vc) });
  if (rvol !== null) grades.push({ name: 'regurgitant volume', grade: gradeVolume(rvol) });
  if (rf !== null) grades.push({ name: 'regurgitant fraction', grade: gradeFraction(rf) });
  if (ero !== null) grades.push({ name: 'effective regurgitant orifice', grade: gradeOrifice(ero) });

  const topGrade = grades.length ? Math.max(...grades.map((g) => g.grade)) : 0;
  const lowGrade = grades.length ? Math.min(...grades.map((g) => g.grade)) : 0;
  const severity = topGrade ? GRADE_NAMES[topGrade] : null;
  const decidedBy = grades.filter((g) => g.grade === topGrade).map((g) => g.name);

  const severe = topGrade === 3;
  const efDysfunction = lvef !== null && lvef <= 60;
  const dimensionDilated = lvesd !== null && lvesd >= 40;
  const ventricleC2 = efDysfunction || dimensionDilated;

  let stage = null;
  let basis = null;
  let pending = null;

  if (severe) {
    if (symptoms) {
      stage = 'D';
      basis = 'symptomatic severe regurgitation';
    } else if (ventricleC2) {
      stage = 'C2';
      basis = 'asymptomatic severe regurgitation with the ventricle giving way';
    } else if (lvef !== null && lvesd !== null) {
      stage = 'C1';
      basis = 'asymptomatic severe regurgitation with a compensated ventricle';
    } else {
      stage = 'C';
      basis = 'asymptomatic severe regurgitation';
      pending = 'Enter the ejection fraction and the end-systolic dimension to separate C1 from C2.';
    }
  } else if (topGrade >= 1) {
    stage = 'B';
    basis = `progressive ${GRADE_NAMES[topGrade]} regurgitation`;
  } else if (atRisk) {
    stage = 'A';
    basis = 'an at-risk valve with no more than a trivial jet';
  }

  // The error this tile exists to prevent: 60 percent is the line here, not 50.
  const flatteredEfNote = severe && lvef !== null && lvef <= 60 && lvef >= 50
    ? `An ejection fraction of ${lvef} percent would read as normal against the 50 percent threshold used almost everywhere else in cardiology. It is not normal here. In mitral regurgitation part of every stroke goes backwards into a low-pressure atrium instead of forwards against systemic afterload, so the measured fraction flatters the ventricle; a normal value in severe regurgitation is ABOVE 60 percent, and 60 or below is dysfunction.`
    : null;

  const dimensionOnlyNote = stage === 'C2' && dimensionDilated && !efDysfunction
    ? `The ejection fraction is preserved and the end-systolic dimension of ${lvesd} mm reaches C2 on its own. The ventricle dilating is the earlier signal, and it does not wait for the ejection fraction to fall.`
    : null;

  const ventricleNote = stage === 'C2'
    ? 'Stage C2 is reached by the ventricle, not the valve. The regurgitation itself may be unchanged; C2 is the line at which an asymptomatic patient is reconsidered.'
    : null;

  const disagreeNote = grades.length > 1 && topGrade !== lowGrade
    ? `The severity criteria disagree: they range from ${GRADE_NAMES[lowGrade]} to ${GRADE_NAMES[topGrade]}, with ${decidedBy.join(' and ')} at the top. The guideline expects these to be read together rather than as a ladder where any one wins, so resolve the disagreement before acting on the higher grade.`
    : null;

  // Always stated. Applying primary thresholds to a secondary leak is a real, common error.
  const primaryOnlyNote = 'These are the criteria for PRIMARY regurgitation, a problem of the valve itself - prolapse, flail, rheumatic change or endocarditis. Secondary regurgitation, where the valve is normal and the ventricle or atrium has pulled it open, is staged against its own criteria and these thresholds do not apply to it.';

  const label = stage ? `Stage ${stage}` : 'No stage assigned';

  return {
    valid: true,
    stage,
    severity,
    severityGrade: topGrade,
    decidedBy,
    basis,
    pending,
    efDysfunction,
    dimensionDilated,
    ventricleC2,
    flatteredEfNote,
    dimensionOnlyNote,
    ventricleNote,
    disagreeNote,
    primaryOnlyNote,
    abnormal: stage === 'C' || stage === 'C1' || stage === 'C2' || stage === 'D',
    bandLabel: label,
    band: stage
      ? `Primary mitral regurgitation stage ${stage} — ${basis}.`
      : 'No stage assigned. Stage A needs an at-risk valve recorded.',
    detail: 'A is an at-risk valve with no more than a trivial jet. B is progressive: vena contracta below 0.7 cm, volume below 60 mL, fraction below 50 percent, orifice below 0.40 square cm. C is asymptomatic severe at or above those numbers, split into C1 with an ejection fraction above 60 percent and a dimension below 40 mm, and C2 at 60 percent or less or 40 mm or more. D is severe with symptoms.',
    note: MR_STAGE_NOTE,
  };
}
