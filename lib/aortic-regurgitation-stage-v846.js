// spec-v846: the ACC/AHA stages of chronic aortic regurgitation, A to D.
//
// Source:
//   Otto CM, Nishimura RA, Bonow RO, et al. 2020 ACC/AHA Guideline for the Management of
//   Patients With Valvular Heart Disease. Circulation. 2021;143(5):e72-e227.
//
//   A   AT RISK. A bicuspid or otherwise congenitally abnormal valve, dilation of the aortic
//       sinuses or root, rheumatic change, or previous infective endocarditis - with no more
//       than trace regurgitation.
//   B   PROGRESSIVE. Mild or moderate regurgitation with normal left ventricular systolic
//       function and a normal or only mildly dilated ventricle.
//       Mild:     vena contracta below 0.3 cm, volume below 30 mL, fraction below 30 percent,
//                 orifice below 0.10 cm^2.
//       Moderate: vena contracta 0.3 to 0.6 cm, volume 30 to 59 mL, fraction 30 to 49
//                 percent, orifice 0.10 to 0.29 cm^2.
//   C   ASYMPTOMATIC SEVERE. Vena contracta above 0.6 cm, volume 60 mL or more, fraction 50
//       percent or more, orifice 0.30 cm^2 or more, with holodiastolic flow reversal in the
//       proximal descending aorta.
//       C1: ejection fraction 55 percent or more AND end-systolic diameter below 50 mm.
//       C2: ejection fraction below 55 percent, OR end-systolic diameter above 50 mm, OR an
//           indexed end-systolic diameter above 25 mm/m^2.
//   D   SYMPTOMATIC SEVERE.
//
// C2 IS REACHED BY THE VENTRICLE, NOT THE VALVE, AND THAT IS THE POINT OF THIS TILE. A
// patient whose regurgitation has not changed at all moves from C1 to C2 when the ejection
// fraction falls below 55 percent or the end-systolic diameter crosses 50 mm. C2 is the line
// at which an asymptomatic patient is reconsidered, so an assessment that stops at the valve
// misses the whole distinction that matters.
//
// AND THE DIAMETER THRESHOLD IS ABSOLUTE *OR* INDEXED. An indexed end-systolic diameter above
// 25 mm/m^2 reaches C2 on its own. That route exists because 50 mm in a small-bodied patient
// is proportionally far more dilation than 50 mm in a large one, and reading the absolute
// number alone under-calls exactly those patients.
//
// THE SEVERITY CRITERIA ARE MEANT TO BE READ TOGETHER. The guideline lists them as a set,
// not as a ladder where any one wins. This tile grades each criterion entered, reports the
// most severe grade reached, and says so when the criteria disagree - rather than quietly
// picking one.
//
// Pure: no DOM, no clock, no network.

export const AR_STAGE_NOTE = 'The chronic aortic regurgitation stages of the 2020 ACC/AHA valvular heart disease guideline (Otto CM, Nishimura RA, Bonow RO, et al, Circulation 2021;143(5):e72-e227) run from A to D. Stage A is being at risk, with a bicuspid or otherwise congenitally abnormal valve, dilation of the aortic sinuses or root, rheumatic change or previous infective endocarditis, and no more than trace regurgitation. Stage B is progressive mild or moderate regurgitation with normal ventricular function: mild is a vena contracta below 0.3 cm, a regurgitant volume below 30 mL, a fraction below 30 percent or an orifice below 0.10 square cm, and moderate is 0.3 to 0.6 cm, 30 to 59 mL, 30 to 49 percent or 0.10 to 0.29 square cm. Stage C is asymptomatic severe regurgitation, at a vena contracta above 0.6 cm, a volume of 60 mL or more, a fraction of 50 percent or more or an orifice of 0.30 square cm or more, usually with holodiastolic flow reversal in the proximal descending aorta. Stage D is the same with symptoms. The point that matters is that stage C is split by the ventricle rather than the valve. C1 is an ejection fraction of 55 percent or more with an end-systolic diameter below 50 mm; C2 is an ejection fraction below 55 percent, an end-systolic diameter above 50 mm, or an indexed end-systolic diameter above 25 mm per square meter. A patient whose regurgitation has not changed at all moves from C1 to C2 when the ventricle gives way, and C2 is the line at which an asymptomatic patient is reconsidered. The indexed route exists because 50 mm in a small-bodied patient is proportionally far more dilation than 50 mm in a large one. The severity criteria are meant to be read together rather than as a ladder where any one wins. It applies a published staging to measurements already taken and it does not select or adjust therapy.';

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

// 1 mild, 2 moderate, 3 severe. Each criterion grades on its own scale.
function gradeVenaContracta(v) { return v > 0.6 ? 3 : (v >= 0.3 ? 2 : 1); }
function gradeVolume(v) { return v >= 60 ? 3 : (v >= 30 ? 2 : 1); }
function gradeFraction(v) { return v >= 50 ? 3 : (v >= 30 ? 2 : 1); }
function gradeOrifice(v) { return v >= 0.30 ? 3 : (v >= 0.10 ? 2 : 1); }

const GRADE_NAMES = { 1: 'mild', 2: 'moderate', 3: 'severe' };

export function aorticRegurgitationStage(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const vc = num(o.venaContracta);
  const rvol = num(o.regurgitantVolume);
  const rf = num(o.regurgitantFraction);
  const ero = num(o.regurgitantOrifice);
  const reversal = truthy(o.holodiastolicReversal);
  const lvef = num(o.ejectionFraction);
  const lvesd = num(o.endSystolicDiameter);
  const lvesdi = num(o.indexedEndSystolicDiameter);
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
    return { valid: false, message: 'End-systolic diameter is outside a plausible range of 10 to 100 mm.' };
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
  const ventricleC2 = (lvef !== null && lvef < 55)
    || (lvesd !== null && lvesd > 50)
    || (lvesdi !== null && lvesdi > 25);
  const ventricleKnown = lvef !== null || lvesd !== null || lvesdi !== null;

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
      pending = 'Enter the ejection fraction and the end-systolic diameter to separate C1 from C2.';
    }
  } else if (topGrade >= 1) {
    stage = 'B';
    basis = `progressive ${GRADE_NAMES[topGrade]} regurgitation`;
  } else if (atRisk) {
    stage = 'A';
    basis = 'an at-risk valve with no more than trace regurgitation';
  }

  // The point of the tile: C2 is a ventricular finding, not a valvular one.
  const ventricleNote = stage === 'C2'
    ? `Stage C2 is reached by the ventricle, not the valve. ${lvef !== null && lvef < 55 ? `The ejection fraction of ${lvef} percent is below 55. ` : ''}${lvesd !== null && lvesd > 50 ? `The end-systolic diameter of ${lvesd} mm is above 50. ` : ''}${lvesdi !== null && lvesdi > 25 ? `The indexed end-systolic diameter of ${lvesdi} mm/m^2 is above 25. ` : ''}The regurgitation itself may be unchanged; what moved is the ventricle, and C2 is the line at which an asymptomatic patient is reconsidered.`
    : null;

  const indexedOnlyNote = stage === 'C2' && lvesdi !== null && lvesdi > 25
    && !(lvesd !== null && lvesd > 50) && !(lvef !== null && lvef < 55)
    ? 'Only the INDEXED diameter crosses. The absolute end-systolic diameter is at or below 50 mm, so reading that number alone would have called this C1. The indexed route exists for exactly this patient: 50 mm in a small body is proportionally far more dilation than 50 mm in a large one.'
    : null;

  const indexedMissingNote = severe && !symptoms && lvesd !== null && lvesd <= 50 && lvesdi === null
    ? 'The absolute end-systolic diameter is at or below 50 mm. An indexed diameter above 25 mm/m^2 also reaches C2, and in a small-bodied patient it can cross while the absolute number does not.'
    : null;

  const disagreeNote = grades.length > 1 && topGrade !== lowGrade
    ? `The severity criteria disagree: they range from ${GRADE_NAMES[lowGrade]} to ${GRADE_NAMES[topGrade]}, with ${decidedBy.join(' and ')} at the top. The guideline expects these to be read together rather than as a ladder where any one wins, so resolve the disagreement before acting on the higher grade.`
    : null;

  const reversalNote = reversal && topGrade > 0 && topGrade < 3
    ? 'Holodiastolic flow reversal in the proximal descending aorta is a sign of severe regurgitation, and it does not fit the grade the measurements give. Re-check the quantitation before settling on the lower grade.'
    : null;

  const noReversalNote = severe && !reversal
    ? 'Holodiastolic flow reversal in the proximal descending aorta is not recorded. It normally accompanies severe chronic regurgitation, so its absence is worth reconciling with the measurements.'
    : null;

  const label = stage ? `Stage ${stage}` : 'No stage assigned';

  return {
    valid: true,
    stage,
    severity,
    severityGrade: topGrade,
    decidedBy,
    basis,
    pending,
    ventricleC2,
    ventricleKnown,
    ventricleNote,
    indexedOnlyNote,
    indexedMissingNote,
    disagreeNote,
    reversalNote,
    noReversalNote,
    abnormal: stage === 'C' || stage === 'C1' || stage === 'C2' || stage === 'D',
    bandLabel: label,
    band: stage
      ? `Aortic regurgitation stage ${stage} — ${basis}.`
      : 'No stage assigned. Stage A needs an at-risk valve recorded.',
    detail: 'A is an at-risk valve with no more than trace regurgitation. B is progressive mild or moderate disease. C is asymptomatic severe: C1 with an ejection fraction of 55 percent or more and an end-systolic diameter below 50 mm, C2 when the ejection fraction falls below 55, the diameter passes 50 mm, or the indexed diameter passes 25 mm per square meter. D is severe with symptoms.',
    note: AR_STAGE_NOTE,
  };
}
