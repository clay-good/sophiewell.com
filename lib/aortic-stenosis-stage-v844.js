// spec-v844: the ACC/AHA stages of aortic stenosis, A to D.
//
// Source:
//   Otto CM, Nishimura RA, Bonow RO, et al. 2020 ACC/AHA Guideline for the Management of
//   Patients With Valvular Heart Disease. Circulation. 2021;143(5):e72-e227.
//
//   A   AT RISK. Bicuspid or otherwise congenitally abnormal valve, or aortic valve
//       sclerosis, with a peak velocity below 2.0 m/s.
//   B   PROGRESSIVE. Mild: velocity 2.0 to 2.9 m/s with a mean gradient below 20 mmHg.
//       Moderate: velocity 3.0 to 3.9 m/s or a mean gradient of 20 to 39 mmHg.
//   C   ASYMPTOMATIC SEVERE. Velocity 4.0 m/s or more, or a mean gradient of 40 mmHg or
//       more. C1 with an ejection fraction of 50 percent or more, C2 below 50 percent.
//   D1  SYMPTOMATIC SEVERE, HIGH GRADIENT. Velocity 4.0 m/s or more or a mean gradient of
//       40 mmHg or more, with an area of 1.0 cm^2 or less.
//   D2  SYMPTOMATIC SEVERE, LOW FLOW AND LOW GRADIENT WITH A REDUCED EJECTION FRACTION.
//       Area 1.0 cm^2 or less, velocity below 4.0 and mean gradient below 40, ejection
//       fraction below 50 percent.
//   D3  SYMPTOMATIC SEVERE, LOW GRADIENT WITH A NORMAL EJECTION FRACTION - paradoxical low
//       flow. Area 1.0 cm^2 or less AND indexed area 0.6 cm^2/m^2 or less, velocity below
//       4.0 and mean gradient below 40, ejection fraction 50 percent or more, stroke volume
//       index below 35 mL/m^2.
//
// A LOW GRADIENT DOES NOT EXCLUDE SEVERE STENOSIS, AND THAT IS THE WHOLE POINT OF THIS TILE.
// D2 and D3 are severe disease with a velocity below 4 and a mean gradient below 40. Reading
// the gradient alone calls both of them moderate, which is the one error that matters here,
// because a small valve area with a low gradient means the ventricle is not generating enough
// flow to raise one - not that the valve is open.
//
// THE VELOCITY AND THE GRADIENT ARE AN "OR", so the more severe of the two decides. And where
// the two disagree the tile says which one decided, because a single low number is exactly
// what makes a reader stop looking.
//
// THIS IS THE AXIS THAT `aortic-valve-area` DOES NOT COVER. That tile computes the area from
// the continuity equation and bands it on area alone; it says in as many words that low-flow
// and low-gradient states need integrated assessment. This is that assessment: flow, gradient,
// ejection fraction and symptoms together.
//
// D2 AND D3 REQUIRE SYMPTOMS. Neither is a stage that an asymptomatic patient can be in, so
// a low-gradient small-area reading without symptoms is reported as the pattern it is rather
// than pushed into a stage the guideline does not define.
//
// Pure: no DOM, no clock, no network.

export const AS_STAGE_NOTE = 'The aortic stenosis stages of the 2020 ACC/AHA valvular heart disease guideline (Otto CM, Nishimura RA, Bonow RO, et al, Circulation 2021;143(5):e72-e227) run from A to D. Stage A is being at risk, with a bicuspid or otherwise congenitally abnormal valve or aortic valve sclerosis and a peak velocity below 2 meters per second. Stage B is progressive obstruction: mild at a velocity of 2.0 to 2.9 with a mean gradient below 20 mmHg, moderate at a velocity of 3.0 to 3.9 or a mean gradient of 20 to 39. Stage C is asymptomatic severe disease at a velocity of 4 or more or a mean gradient of 40 or more, split into C1 with an ejection fraction of 50 percent or more and C2 below 50 percent. Stage D is symptomatic severe disease: D1 at a high gradient, D2 at a low flow and low gradient with a reduced ejection fraction, and D3 at a low gradient with a normal ejection fraction, the paradoxical low-flow pattern. The point that matters is that a low gradient does not exclude severe stenosis. D2 and D3 are severe disease at a velocity below 4 and a mean gradient below 40, so reading the gradient alone calls both of them moderate; a small valve area with a low gradient means the ventricle is not generating enough flow to raise one rather than that the valve is open. The velocity and the gradient are an or, so the more severe of the two decides. Distinguishing true severe from pseudo severe in the D2 pattern needs low-dose dobutamine stress echocardiography, and the D3 pattern should be judged when the patient is normotensive. It applies a published staging to measurements already taken and it does not select or adjust therapy.';

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

// Velocity and gradient are an OR, so each gets its own rank and the higher applies.
// 0 no significant obstruction, 1 mild, 2 moderate, 3 severe by gradient.
function velocityRank(v) {
  if (v >= 4) return 3;
  if (v >= 3) return 2;
  if (v >= 2) return 1;
  return 0;
}
function gradientRank(g) {
  if (g >= 40) return 3;
  if (g >= 20) return 2;
  return 0;
}

export function aorticStenosisStage(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const vmax = num(o.peakVelocity);
  const gradient = num(o.meanGradient);
  const ava = num(o.valveArea);
  const avai = num(o.indexedValveArea);
  const lvef = num(o.ejectionFraction);
  const svi = num(o.strokeVolumeIndex);
  const symptoms = truthy(o.symptoms);

  if (vmax === null && gradient === null) {
    return { valid: false, message: 'Enter the peak aortic velocity in m/s, the mean gradient in mmHg, or both.' };
  }
  if (vmax !== null && (vmax <= 0 || vmax > 10)) {
    return { valid: false, message: 'Peak aortic velocity is outside a plausible range of 0 to 10 m/s.' };
  }
  if (gradient !== null && (gradient < 0 || gradient > 200)) {
    return { valid: false, message: 'Mean gradient is outside a plausible range of 0 to 200 mmHg.' };
  }
  if (ava !== null && (ava <= 0 || ava > 6)) {
    return { valid: false, message: 'Aortic valve area is outside a plausible range of 0 to 6 cm^2.' };
  }
  if (lvef !== null && (lvef < 5 || lvef > 85)) {
    return { valid: false, message: 'Ejection fraction is outside a plausible range of 5 to 85 percent.' };
  }

  const vRank = vmax === null ? -1 : velocityRank(vmax);
  const gRank = gradient === null ? -1 : gradientRank(gradient);
  const rank = Math.max(vRank, gRank);

  const highGradient = rank === 3;
  const lowGradient = (vmax === null || vmax < 4) && (gradient === null || gradient < 40);
  const smallArea = ava !== null && ava <= 1.0;
  const reducedEf = lvef !== null && lvef < 50;
  const normalEf = lvef !== null && lvef >= 50;
  const lowFlow = svi !== null && svi < 35;
  const smallIndexedArea = avai !== null && avai <= 0.6;

  let stage = null;
  let severity = null;
  let basis = null;
  let pending = null;

  if (highGradient) {
    severity = 'severe';
    if (symptoms) {
      stage = 'D1';
      basis = 'symptomatic severe stenosis at a high gradient';
    } else if (normalEf) {
      stage = 'C1';
      basis = 'asymptomatic severe stenosis with a preserved ejection fraction';
    } else if (reducedEf) {
      stage = 'C2';
      basis = 'asymptomatic severe stenosis with a reduced ejection fraction';
    } else {
      stage = 'C';
      basis = 'asymptomatic severe stenosis';
      pending = 'Enter the ejection fraction to separate C1 from C2.';
    }
  } else if (smallArea && lowGradient) {
    // The low-gradient severe patterns. This is the branch a gradient-only reading misses.
    severity = 'possibly severe at a low gradient';
    if (reducedEf) {
      if (symptoms) {
        stage = 'D2';
        basis = 'symptomatic severe stenosis at a low flow and low gradient with a reduced ejection fraction';
      } else {
        basis = 'the low-flow, low-gradient pattern with a reduced ejection fraction, without symptoms';
        pending = 'D2 is defined only for symptomatic patients, so this does not reach a stage on these entries.';
      }
    } else if (normalEf && lowFlow) {
      if (!smallIndexedArea && avai !== null) {
        basis = 'a low gradient with a normal ejection fraction and a low stroke volume index, but an indexed valve area above 0.6 cm^2/m^2';
        pending = 'D3 requires an indexed area of 0.6 cm^2/m^2 or less as well as an area of 1.0 cm^2 or less.';
      } else if (symptoms) {
        stage = 'D3';
        basis = 'symptomatic severe stenosis at a low gradient with a normal ejection fraction, the paradoxical low-flow pattern';
      } else {
        basis = 'the paradoxical low-flow, low-gradient pattern with a normal ejection fraction, without symptoms';
        pending = 'D3 is defined only for symptomatic patients, so this does not reach a stage on these entries.';
      }
    } else if (normalEf && svi !== null) {
      severity = 'not severe on these entries';
      basis = 'a small valve area at a low gradient with a normal ejection fraction and a normal stroke volume index';
      pending = 'Normal flow with a low gradient does not meet a severe stage. Check the area measurement against the gradient.';
    } else {
      basis = 'a small valve area at a low gradient';
      pending = 'Enter the ejection fraction and the stroke volume index to tell the D2 and D3 patterns apart.';
    }
  } else if (rank === 2) {
    stage = 'B';
    severity = 'moderate';
    basis = 'moderate progressive stenosis';
  } else if (rank === 1) {
    stage = 'B';
    severity = 'mild';
    basis = 'mild progressive stenosis';
  } else if (rank === 0) {
    stage = 'A';
    severity = 'at risk';
    basis = 'a velocity below 2.0 m/s, the at-risk range for a sclerotic or congenitally abnormal valve';
  }

  const verySevere = (vmax !== null && vmax >= 5) || (gradient !== null && gradient >= 60);
  const verySevereNote = verySevere
    ? 'A velocity of 5 m/s or more, or a mean gradient of 60 mmHg or more, is very severe stenosis within the severe range.'
    : null;

  // The error this tile exists to prevent.
  const lowGradientNote = smallArea && lowGradient && (reducedEf || lowFlow)
    ? 'A low gradient does not exclude severe stenosis. The area is 1.0 cm^2 or less with a velocity below 4 and a gradient below 40, which means the ventricle is not generating enough flow to raise a gradient - not that the valve is open. Reading the gradient alone calls this moderate.'
    : null;

  const missedSevereNote = smallArea && lowGradient && lvef === null && svi === null
    ? 'The area is 1.0 cm^2 or less at a low gradient. That is the shape of the D2 and D3 patterns, and neither can be told apart from moderate stenosis without the ejection fraction and the stroke volume index.'
    : null;

  const dobutamineNote = stage === 'D2'
    ? 'Low-dose dobutamine stress echocardiography separates true severe stenosis from pseudo-severe stenosis in this pattern: true severe keeps an area of 1.0 cm^2 or less with a velocity reaching 4 m/s at any flow rate.'
    : null;

  const normotensiveNote = stage === 'D3'
    ? 'The paradoxical low-flow pattern should be judged with the patient normotensive. Measured during hypertension, the afterload depresses flow and the reading overstates the picture.'
    : null;

  const disagreeNote = vRank >= 0 && gRank >= 0 && vRank !== gRank
    ? `The velocity and the mean gradient sit in different bands, and they are an OR, so the more severe of the two applies. The ${vRank > gRank ? 'velocity' : 'mean gradient'} decides here.`
    : null;

  const label = stage ? `Stage ${stage}` : 'No stage assigned';

  return {
    valid: true,
    stage,
    severity,
    basis,
    pending,
    highGradient,
    smallArea,
    verySevere,
    verySevereNote,
    lowGradientNote,
    missedSevereNote,
    dobutamineNote,
    normotensiveNote,
    disagreeNote,
    abnormal: stage === 'C' || stage === 'C1' || stage === 'C2' || stage === 'D1' || stage === 'D2' || stage === 'D3',
    bandLabel: label,
    band: stage
      ? `Aortic stenosis stage ${stage} — ${basis}.`
      : (basis ? `No stage assigned — ${basis}.` : 'No stage assigned.'),
    detail: 'A is at risk below 2.0 m/s. B is progressive: mild 2.0 to 2.9, moderate 3.0 to 3.9 or a gradient of 20 to 39. C is asymptomatic severe at 4.0 m/s or a gradient of 40, C1 with an ejection fraction of 50 percent or more and C2 below. D is symptomatic severe: D1 at a high gradient, D2 at a low flow with a reduced ejection fraction, D3 at a low gradient with a normal one.',
    note: AS_STAGE_NOTE,
  };
}
