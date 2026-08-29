// spec-v848: the ACC/AHA stages of tricuspid regurgitation, A to D.
//
// Source:
//   Otto CM, Nishimura RA, Bonow RO, et al. 2020 ACC/AHA Guideline for the Management of
//   Patients With Valvular Heart Disease. Circulation. 2021;143(5):e72-e227.
//
//   A  AT RISK. No or trace regurgitation, with either a leaflet abnormality or the substrate
//      for a secondary leak - annular dilation, right-sided remodeling, an intracardiac lead.
//   B  PROGRESSIVE. Mild to moderate regurgitation.
//   C  ASYMPTOMATIC SEVERE. Jet area 10 cm^2 or more, vena contracta 0.7 cm or more,
//      effective regurgitant orifice 0.40 cm^2 or more, or regurgitant volume 45 mL or more,
//      commonly with systolic flow reversal in the hepatic veins.
//   D  SYMPTOMATIC SEVERE - the signs of right heart failure: ascites, peripheral edema,
//      raised venous pressure, fatigue.
//
// THE THRESHOLDS ARE VALVE-SPECIFIC, AND THAT IS THE POINT OF THIS TILE. Severe here is a
// regurgitant volume of 45 mL; on the mitral and aortic valves it is 60. The orifice is
// 0.40 cm^2 here and on the mitral valve, but 0.30 on the aortic. A reader who carries one
// valve's numbers across will UNDER-call a tricuspid leak on volume - 50 mL is severe here
// and only moderate on the left side - and the tricuspid valve is already the one most often
// under-called.
//
// TRICUSPID REGURGITATION IS USUALLY SECONDARY. The valve itself is normal and the right
// ventricle, the atrium or an intracardiac lead has pulled it open. That does not change the
// severity thresholds, which is unlike the mitral valve, where primary and secondary leaks
// are staged against separate criteria. The tile records the mechanism because it governs
// what the finding means, and states that the numbers are shared either way.
//
// NO C1/C2 SPLIT. The mitral and aortic tables subdivide asymptomatic severe disease on
// ventricular function; the tricuspid table does not, so this tile does not invent one.
//
// Pure: no DOM, no clock, no network.

export const TR_STAGE_NOTE = 'The tricuspid regurgitation stages of the 2020 ACC/AHA valvular heart disease guideline (Otto CM, Nishimura RA, Bonow RO, et al, Circulation 2021;143(5):e72-e227) run from A to D. Stage A is being at risk, with no or trace regurgitation and either a leaflet abnormality or the substrate for a secondary leak, meaning annular dilation, right-sided remodeling or an intracardiac lead. Stage B is progressive mild to moderate regurgitation. Stage C is asymptomatic severe regurgitation, at a jet area of 10 square cm or more, a vena contracta of 0.7 cm or more, an effective regurgitant orifice of 0.40 square cm or more, or a regurgitant volume of 45 mL or more, commonly with systolic flow reversal in the hepatic veins. Stage D is the same with the signs of right heart failure: ascites, peripheral edema, raised venous pressure and fatigue. The point that matters is that these thresholds are specific to this valve. Severe here is a regurgitant volume of 45 mL, where on the mitral and aortic valves it is 60, and the orifice is 0.40 square cm here and on the mitral valve but 0.30 on the aortic. Carrying one valve figure across under-calls a tricuspid leak on volume, since 50 mL is severe here and only moderate on the left side, and this is already the valve most often under-called. Tricuspid regurgitation is usually secondary, with a normal valve pulled open by the right ventricle, the atrium or a lead, and unlike the mitral valve that does not put it on a separate set of criteria. The tricuspid table does not subdivide asymptomatic severe disease the way the mitral and aortic tables do. It applies a published staging to measurements already taken and it does not select or adjust therapy.';

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

// 1 mild, 2 moderate, 3 severe. Every threshold below is the TRICUSPID one.
function gradeJetArea(v) { return v >= 10 ? 3 : (v >= 5 ? 2 : 1); }
function gradeVenaContracta(v) { return v >= 0.7 ? 3 : (v >= 0.3 ? 2 : 1); }
function gradeOrifice(v) { return v >= 0.40 ? 3 : (v >= 0.20 ? 2 : 1); }
function gradeVolume(v) { return v >= 45 ? 3 : (v >= 30 ? 2 : 1); }

const GRADE_NAMES = { 1: 'mild', 2: 'moderate', 3: 'severe' };

export function tricuspidRegurgitationStage(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const jet = num(o.jetArea);
  const vc = num(o.venaContracta);
  const ero = num(o.regurgitantOrifice);
  const rvol = num(o.regurgitantVolume);
  const hepaticReversal = truthy(o.hepaticVeinReversal);
  const mechanism = typeof o.mechanism === 'string' ? o.mechanism : '';
  const atRisk = truthy(o.atRiskValve);
  const symptoms = truthy(o.symptoms);

  const anyCriterion = jet !== null || vc !== null || ero !== null || rvol !== null;
  if (!anyCriterion && !atRisk) {
    return { valid: false, message: 'Enter at least one severity measurement - jet area, vena contracta, effective regurgitant orifice or regurgitant volume - or record an at-risk valve.' };
  }
  if (jet !== null && (jet < 0 || jet > 60)) {
    return { valid: false, message: 'Jet area is outside a plausible range of 0 to 60 square cm.' };
  }
  if (vc !== null && (vc < 0 || vc > 3)) {
    return { valid: false, message: 'Vena contracta is outside a plausible range of 0 to 3 cm.' };
  }
  if (ero !== null && (ero < 0 || ero > 3)) {
    return { valid: false, message: 'Effective regurgitant orifice is outside a plausible range of 0 to 3 square cm.' };
  }
  if (rvol !== null && (rvol < 0 || rvol > 300)) {
    return { valid: false, message: 'Regurgitant volume is outside a plausible range of 0 to 300 mL.' };
  }

  const grades = [];
  if (jet !== null) grades.push({ name: 'jet area', grade: gradeJetArea(jet) });
  if (vc !== null) grades.push({ name: 'vena contracta', grade: gradeVenaContracta(vc) });
  if (ero !== null) grades.push({ name: 'effective regurgitant orifice', grade: gradeOrifice(ero) });
  if (rvol !== null) grades.push({ name: 'regurgitant volume', grade: gradeVolume(rvol) });

  const topGrade = grades.length ? Math.max(...grades.map((g) => g.grade)) : 0;
  const lowGrade = grades.length ? Math.min(...grades.map((g) => g.grade)) : 0;
  const severity = topGrade ? GRADE_NAMES[topGrade] : null;
  const decidedBy = grades.filter((g) => g.grade === topGrade).map((g) => g.name);

  const severe = topGrade === 3;

  let stage = null;
  let basis = null;

  if (severe) {
    if (symptoms) {
      stage = 'D';
      basis = 'symptomatic severe regurgitation, with the signs of right heart failure';
    } else {
      stage = 'C';
      basis = 'asymptomatic severe regurgitation';
    }
  } else if (topGrade >= 1) {
    stage = 'B';
    basis = `progressive ${GRADE_NAMES[topGrade]} regurgitation`;
  } else if (atRisk) {
    stage = 'A';
    basis = 'an at-risk valve with no more than trace regurgitation';
  }

  // The error this tile exists to prevent: the volume band where the valves differ.
  const volumeThresholdNote = rvol !== null && rvol >= 45 && rvol < 60
    ? `A regurgitant volume of ${rvol} mL is SEVERE on the tricuspid valve, where the threshold is 45 mL. On the mitral and aortic valves the threshold is 60 mL, so the same number reads as moderate there. Carrying a left-sided figure across under-calls this leak.`
    : null;

  const orificeThresholdNote = ero !== null && ero >= 0.30 && ero < 0.40
    ? `An orifice of ${ero} square cm does NOT reach severe on the tricuspid valve, where the threshold is 0.40 square cm. On the aortic valve 0.30 is already severe, so a left-sided figure carried across would over-call this one.`
    : null;

  const hepaticNote = severe && !hepaticReversal
    ? 'Systolic flow reversal in the hepatic veins is not recorded. It commonly accompanies severe tricuspid regurgitation, so its absence is worth reconciling with the measurements.'
    : null;

  const hepaticSupportsNote = hepaticReversal && topGrade > 0 && topGrade < 3
    ? 'Systolic flow reversal in the hepatic veins points to severe regurgitation and does not fit the grade the measurements give. Re-check the quantitation before settling on the lower grade.'
    : null;

  const mechanismNote = mechanism === 'secondary'
    ? 'A secondary leak: the valve is normal and the right ventricle, the atrium or an intracardiac lead has pulled it open. Unlike the mitral valve, that does not put it on a separate set of severity criteria - these thresholds apply either way - but it governs what the finding means and what would be treated.'
    : (mechanism === 'primary'
      ? 'A primary leak: the valve itself is abnormal. Most tricuspid regurgitation is secondary, so a primary mechanism is worth stating explicitly.'
      : null);

  const disagreeNote = grades.length > 1 && topGrade !== lowGrade
    ? `The severity criteria disagree: they range from ${GRADE_NAMES[lowGrade]} to ${GRADE_NAMES[topGrade]}, with ${decidedBy.join(' and ')} at the top. The guideline expects these to be read together rather than as a ladder where any one wins, so resolve the disagreement before acting on the higher grade.`
    : null;

  const noSubdivisionNote = stage === 'C'
    ? 'The tricuspid table does not subdivide asymptomatic severe disease the way the mitral and aortic tables do, so there is no C1 or C2 here.'
    : null;

  const label = stage ? `Stage ${stage}` : 'No stage assigned';

  return {
    valid: true,
    stage,
    severity,
    severityGrade: topGrade,
    decidedBy,
    basis,
    volumeThresholdNote,
    orificeThresholdNote,
    hepaticNote,
    hepaticSupportsNote,
    mechanismNote,
    disagreeNote,
    noSubdivisionNote,
    abnormal: stage === 'C' || stage === 'D',
    bandLabel: label,
    band: stage
      ? `Tricuspid regurgitation stage ${stage} — ${basis}.`
      : 'No stage assigned. Stage A needs an at-risk valve recorded.',
    detail: 'A is an at-risk valve with no more than trace regurgitation. B is progressive mild or moderate disease. C is asymptomatic severe: jet area 10 square cm or more, vena contracta 0.7 cm or more, orifice 0.40 square cm or more, or volume 45 mL or more. D is the same with the signs of right heart failure. These thresholds are specific to this valve.',
    note: TR_STAGE_NOTE,
  };
}
