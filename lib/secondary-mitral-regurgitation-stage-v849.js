// spec-v849: the ACC/AHA stages of chronic SECONDARY mitral regurgitation, A to D.
//
// Source:
//   Otto CM, Nishimura RA, Bonow RO, et al. 2020 ACC/AHA Guideline for the Management of
//   Patients With Valvular Heart Disease. Circulation. 2021;143(5):e72-e227.
//
//   A   AT RISK. Coronary disease or cardiomyopathy with a structurally normal valve, and no
//       more than a small central jet (vena contracta below 0.30 cm).
//   B   PROGRESSIVE. Orifice below 0.40 cm^2, volume below 60 mL, fraction below 50 percent.
//   C   ASYMPTOMATIC SEVERE. Orifice 0.40 cm^2 or more, volume 60 mL or more, fraction 50
//       percent or more.
//   D   SYMPTOMATIC SEVERE. The same numbers with heart failure symptoms that PERSIST after
//       revascularization and optimization of guideline-directed medical therapy.
//
// THE 2014 THRESHOLDS ARE SUPERSEDED AND READING THEM IS THE COMMON ERROR. The 2014 guideline
// called secondary regurgitation severe at an orifice of 0.20 cm^2 and a volume of 30 mL. The
// 2017 focused update moved those lines to 0.40 and 60, and the 2020 guideline kept them there,
// the same numbers as the primary table. An orifice of 0.25 cm^2 is severe under the old table
// and MODERATE under the current one.
//
// THERE IS NO C1 OR C2 HERE. The primary table subdivides asymptomatic severe disease on the
// ventricle; the secondary table does not subdivide at all. In secondary regurgitation the
// ventricular dysfunction is the CAUSE of the leak rather than a consequence of it, so it
// cannot mark the point at which the valve has worn the ventricle out.
//
// STAGE D WAITS FOR THE UNDERLYING DISEASE TO BE TREATED. D is not severe plus symptoms; it is
// symptoms that persist after revascularization and optimized medical therapy.
//
// THIS TILE IS FOR SECONDARY REGURGITATION ONLY - a structurally normal valve pulled open by
// ventricular or atrial remodeling. Prolapse, flail, rheumatic change and endocarditis are
// primary disease and are staged against their own criteria.
//
// Pure: no DOM, no clock, no network.

export const SMR_STAGE_NOTE = 'The chronic secondary mitral regurgitation stages of the 2020 ACC/AHA valvular heart disease guideline (Otto CM, Nishimura RA, Bonow RO, et al, Circulation 2021;143(5):e72-e227) run from A to D. Stage A is being at risk, with coronary disease or cardiomyopathy, a structurally normal valve and no more than a small central jet. Stage B is progressive disease, with an effective regurgitant orifice below 0.40 square cm, a regurgitant volume below 60 mL and a fraction below 50 percent. Stage C is asymptomatic severe disease at or above those numbers. Stage D is the same with heart failure symptoms that persist after revascularization and optimization of medical therapy. Two things separate this table from the primary one. The severe thresholds changed: the 2014 guideline called secondary regurgitation severe at an orifice of 0.20 square cm and a volume of 30 mL, and the 2017 focused update moved those lines to 0.40 and 60, where the 2020 guideline kept them. An orifice of 0.25 square cm is severe under the old table and moderate under the current one, and that band is still commonly read as severe. And there is no C1 or C2 split here. The primary table subdivides asymptomatic severe disease on ejection fraction and ventricular dimension; the secondary table does not, because the ventricular dysfunction is the cause of this leak rather than a consequence of it. These criteria are for a structurally normal valve pulled open by remodeling. Prolapse, flail, rheumatic change and endocarditis are primary disease and are staged against their own criteria. It applies a published staging to measurements already taken and it does not select or adjust therapy.';

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

// 1 mild, 2 moderate, 3 severe. Each criterion grades on its own scale.
function gradeOrifice(v) { return v >= 0.40 ? 3 : (v >= 0.20 ? 2 : 1); }
function gradeVolume(v) { return v >= 60 ? 3 : (v >= 30 ? 2 : 1); }
function gradeFraction(v) { return v >= 50 ? 3 : (v >= 30 ? 2 : 1); }

const GRADE_NAMES = { 1: 'mild', 2: 'moderate', 3: 'severe' };

export function secondaryMitralRegurgitationStage(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const ero = num(o.regurgitantOrifice);
  const rvol = num(o.regurgitantVolume);
  const rf = num(o.regurgitantFraction);
  const lvef = num(o.ejectionFraction);
  const substrate = truthy(o.substrate);
  const atRisk = truthy(o.smallJet);
  const symptoms = truthy(o.symptoms);
  const treated = truthy(o.therapyOptimized);

  const anyCriterion = ero !== null || rvol !== null || rf !== null;
  if (!anyCriterion && !atRisk) {
    return { valid: false, message: 'Enter at least one severity measurement - effective regurgitant orifice, regurgitant volume or regurgitant fraction - or record that there is no more than a small central jet.' };
  }
  if (ero !== null && (ero < 0 || ero > 3)) {
    return { valid: false, message: 'Effective regurgitant orifice is outside a plausible range of 0 to 3 square cm.' };
  }
  if (rvol !== null && (rvol < 0 || rvol > 300)) {
    return { valid: false, message: 'Regurgitant volume is outside a plausible range of 0 to 300 mL.' };
  }
  if (rf !== null && (rf < 0 || rf > 100)) {
    return { valid: false, message: 'Regurgitant fraction is outside a plausible range of 0 to 100 percent.' };
  }
  if (lvef !== null && (lvef < 5 || lvef > 85)) {
    return { valid: false, message: 'Ejection fraction is outside a plausible range of 5 to 85 percent.' };
  }

  const grades = [];
  if (ero !== null) grades.push({ name: 'effective regurgitant orifice', grade: gradeOrifice(ero) });
  if (rvol !== null) grades.push({ name: 'regurgitant volume', grade: gradeVolume(rvol) });
  if (rf !== null) grades.push({ name: 'regurgitant fraction', grade: gradeFraction(rf) });

  const topGrade = grades.length ? Math.max(...grades.map((g) => g.grade)) : 0;
  const lowGrade = grades.length ? Math.min(...grades.map((g) => g.grade)) : 0;
  const severity = topGrade ? GRADE_NAMES[topGrade] : null;
  const decidedBy = grades.filter((g) => g.grade === topGrade).map((g) => g.name);

  const severe = topGrade === 3;

  let stage = null;
  let basis = null;
  let pending = null;

  if (severe) {
    if (symptoms && treated) {
      stage = 'D';
      basis = 'severe regurgitation with heart failure symptoms that persisted after treatment of the underlying disease';
    } else if (symptoms) {
      stage = 'C or D';
      basis = 'severe regurgitation with heart failure symptoms, not yet separable from C';
      pending = 'Stage D is reserved for symptoms that PERSIST after revascularization and optimization of guideline-directed medical therapy. Record whether that has been done to separate C from D.';
    } else {
      stage = 'C';
      basis = 'asymptomatic severe regurgitation';
    }
  } else if (topGrade >= 1) {
    stage = 'B';
    basis = `progressive ${GRADE_NAMES[topGrade]} regurgitation`;
  } else if (atRisk) {
    stage = 'A';
    basis = 'an at-risk ventricle with no more than a small central jet';
  }

  // The error this tile exists to prevent: the 2014 lines were 0.20 and 30.
  const oldEro = ero !== null && ero >= 0.20 && ero < 0.40;
  const oldRvol = rvol !== null && rvol >= 30 && rvol < 60;
  const supersededNote = (oldEro || oldRvol)
    ? `${oldEro ? `An orifice of ${ero} square cm` : `A volume of ${rvol} mL`} was SEVERE secondary regurgitation under the 2014 guideline, which set those lines at 0.20 square cm and 30 mL. The 2017 focused update moved them to 0.40 square cm and 60 mL and the 2020 guideline kept them there, so this is moderate now. That whole band is still commonly read as severe.`
    : null;

  const noSplitNote = (stage === 'C' || stage === 'C or D' || stage === 'D') && lvef !== null
    ? `There is no C1 or C2 in secondary regurgitation. The primary table subdivides asymptomatic severe disease at an ejection fraction of 60 percent and an end-systolic dimension of 40 mm; this table does not subdivide at all. The ventricular dysfunction is the CAUSE of this leak rather than a consequence of it, so an ejection fraction of ${lvef} percent describes the underlying disease and does not mark the point at which the valve has worn the ventricle out.`
    : null;

  const treatedNote = stage === 'D'
    ? 'Stage D is reached because the symptoms persisted after the underlying disease was treated. Symptoms before revascularization and optimized medical therapy do not establish D on this table.'
    : null;

  const substrateNote = !substrate
    ? 'No underlying coronary disease or cardiomyopathy with a structurally normal valve has been recorded. This table applies only to that patient.'
    : null;

  const disagreeNote = grades.length > 1 && topGrade !== lowGrade
    ? `The severity criteria disagree: they range from ${GRADE_NAMES[lowGrade]} to ${GRADE_NAMES[topGrade]}, with ${decidedBy.join(' and ')} at the top. The guideline expects these to be read together rather than as a ladder where any one wins, so resolve the disagreement before acting on the higher grade.`
    : null;

  // Always stated. Crossing the primary and secondary tables is a real error in both directions.
  const secondaryOnlyNote = 'These are the criteria for SECONDARY regurgitation, where a structurally normal valve has been pulled open by ventricular or atrial remodeling in coronary disease or cardiomyopathy. Prolapse, flail, rheumatic change and endocarditis are problems of the valve itself, and they are staged against their own criteria.';

  const label = stage ? (stage === 'C or D' ? 'Stage C or D' : `Stage ${stage}`) : 'No stage assigned';

  return {
    valid: true,
    stage,
    severity,
    severityGrade: topGrade,
    decidedBy,
    basis,
    pending,
    substrateRecorded: substrate,
    supersededNote,
    noSplitNote,
    treatedNote,
    substrateNote,
    disagreeNote,
    secondaryOnlyNote,
    abnormal: stage === 'C' || stage === 'C or D' || stage === 'D',
    bandLabel: label,
    band: stage
      ? `Secondary mitral regurgitation stage ${stage} — ${basis}.`
      : 'No stage assigned. Stage A needs a small central jet recorded.',
    detail: 'A is coronary disease or cardiomyopathy with a structurally normal valve and no more than a small central jet. B is progressive: orifice below 0.40 square cm, volume below 60 mL, fraction below 50 percent. C is asymptomatic severe at or above those numbers. D is severe with heart failure symptoms that persist after revascularization and optimized medical therapy. There is no C1 or C2 split on this table.',
    note: SMR_STAGE_NOTE,
  };
}
