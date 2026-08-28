// spec-v845: the ACC/AHA stages of rheumatic mitral stenosis, A to D.
//
// Source:
//   Otto CM, Nishimura RA, Bonow RO, et al. 2020 ACC/AHA Guideline for the Management of
//   Patients With Valvular Heart Disease. Circulation. 2021;143(5):e72-e227.
//
//   A  AT RISK. Mild doming of the valve during diastole, with a normal transmitral flow
//      velocity and no commissural fusion.
//   B  PROGRESSIVE. Commissural fusion with diastolic doming, a valve area above
//      1.5 cm^2 and a diastolic pressure half-time below 150 ms.
//   C  ASYMPTOMATIC SEVERE. Valve area of 1.5 cm^2 or less, or a diastolic pressure
//      half-time of 150 ms or more, with no symptoms.
//   D  SYMPTOMATIC SEVERE. The same hemodynamics with reduced exercise tolerance or
//      exertional breathlessness.
//
//   Very severe stenosis sits inside the severe range: a valve area of 1.0 cm^2 or less, or
//   a half-time of 220 ms or more.
//
// THE MEAN GRADIENT DOES NOT GRADE MITRAL STENOSIS, AND THAT IS THE POINT OF THIS TILE.
// The guideline notes it is typically above 5 to 10 mmHg in severe disease, but the stage is
// defined by the valve area and the pressure half-time. The gradient across a mitral valve
// rises with heart rate and with cardiac output, because both shorten diastole and drive more
// flow through the valve per beat. So tachycardia inflates it and a slow, low-output patient
// deflates it, and the same valve reads differently on two days. The tile takes the gradient
// and the heart rate but stages on neither.
//
// THE HALF-TIME HAS ITS OWN FAILURE MODES. The empirical area is 220 divided by the half-time,
// and that relation breaks with significant aortic regurgitation, immediately after balloon
// valvuloplasty, and where left ventricular or atrial compliance is abnormal. Where the
// entered area and half-time disagree about severity the tile reports both rather than
// silently preferring one.
//
// THE COMPANION AXIS IS `wilkins-score`, which scores whether the valve is suitable for
// balloon valvuloplasty. That is a different question from how severe the stenosis is, and
// neither answers the other.
//
// Pure: no DOM, no clock, no network.

export const MS_STAGE_NOTE = 'The mitral stenosis stages of the 2020 ACC/AHA valvular heart disease guideline (Otto CM, Nishimura RA, Bonow RO, et al, Circulation 2021;143(5):e72-e227) run from A to D. Stage A is being at risk, with mild doming of the valve in diastole and no commissural fusion. Stage B is progressive rheumatic disease, with commissural fusion and diastolic doming, a valve area above 1.5 square cm and a diastolic pressure half-time below 150 ms. Stage C is asymptomatic severe disease, at a valve area of 1.5 square cm or less or a half-time of 150 ms or more. Stage D is the same hemodynamics with reduced exercise tolerance or breathlessness on exertion. Very severe stenosis sits inside the severe range at a valve area of 1.0 square cm or less or a half-time of 220 ms or more. The point that matters is that the mean gradient does not grade mitral stenosis. It is typically above 5 to 10 mmHg in severe disease, but the stage is defined by the valve area and the half-time, because the gradient rises with heart rate and with cardiac output. Tachycardia inflates it and a slow, low-output patient deflates it, so the same valve reads differently on two days. The half-time has its own limits: the empirical area of 220 divided by the half-time breaks down with significant aortic regurgitation, immediately after balloon valvuloplasty, and where ventricular or atrial compliance is abnormal. It applies a published staging to measurements already taken and it does not select or adjust therapy.';

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function mitralStenosisStage(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const area = num(o.valveArea);
  const halfTime = num(o.pressureHalfTime);
  const gradient = num(o.meanGradient);
  const heartRate = num(o.heartRate);
  const anatomy = typeof o.anatomy === 'string' ? o.anatomy : '';
  const symptoms = truthy(o.symptoms);

  if (area === null && halfTime === null && anatomy === '') {
    return { valid: false, message: 'Enter the mitral valve area in square cm, the diastolic pressure half-time in ms, or the valve anatomy.' };
  }
  if (area !== null && (area <= 0 || area > 8)) {
    return { valid: false, message: 'Mitral valve area is outside a plausible range of 0 to 8 square cm.' };
  }
  if (halfTime !== null && (halfTime <= 0 || halfTime > 800)) {
    return { valid: false, message: 'Diastolic pressure half-time is outside a plausible range of 0 to 800 ms.' };
  }
  if (gradient !== null && (gradient < 0 || gradient > 60)) {
    return { valid: false, message: 'Mean mitral gradient is outside a plausible range of 0 to 60 mmHg.' };
  }
  if (heartRate !== null && (heartRate < 20 || heartRate > 250)) {
    return { valid: false, message: 'Heart rate is outside a plausible range of 20 to 250 beats per minute.' };
  }

  const severeByArea = area !== null && area <= 1.5;
  const severeByHalfTime = halfTime !== null && halfTime >= 150;
  const severe = severeByArea || severeByHalfTime;

  const verySevere = (area !== null && area <= 1.0) || (halfTime !== null && halfTime >= 220);

  const fusion = anatomy === 'fusion';
  const doming = anatomy === 'doming';

  let stage = null;
  let basis = null;
  let pending = null;

  if (severe) {
    if (symptoms) {
      stage = 'D';
      basis = 'symptomatic severe stenosis';
    } else {
      stage = 'C';
      basis = 'asymptomatic severe stenosis';
    }
  } else if (area !== null || halfTime !== null) {
    if (fusion) {
      stage = 'B';
      basis = 'progressive rheumatic stenosis, with commissural fusion but no severe obstruction';
    } else if (doming) {
      stage = 'A';
      basis = 'valve doming without commissural fusion, and no severe obstruction';
    } else {
      basis = 'no severe obstruction on the measurements entered';
      pending = 'Stages A and B are told apart by the valve anatomy, so record whether there is commissural fusion.';
    }
  } else if (fusion) {
    stage = 'B';
    basis = 'commissural fusion with diastolic doming';
    pending = 'Enter the valve area or the pressure half-time to rule out severe obstruction.';
  } else if (doming) {
    stage = 'A';
    basis = 'mild valve doming in diastole, without commissural fusion';
  }

  // The error this tile exists to prevent.
  const gradientNote = gradient !== null
    ? `The mean gradient of ${gradient} mmHg is recorded but does not set the stage. A mitral gradient rises with heart rate and with cardiac output, so the same valve reads differently on two days; the guideline defines severity by the valve area and the pressure half-time.`
    : null;

  const heartRateNote = gradient !== null && heartRate !== null && (heartRate > 100 || heartRate < 60)
    ? (heartRate > 100
      ? `At ${heartRate} beats per minute diastole is short, which raises the gradient for any given valve. Read the gradient here as an overstatement, not as severity.`
      : `At ${heartRate} beats per minute diastole is long, which lowers the gradient for any given valve. A modest gradient here does not rule out severe stenosis.`)
    : null;

  const disagreeNote = area !== null && halfTime !== null && severeByArea !== severeByHalfTime
    ? `The valve area and the pressure half-time disagree about severity: the area ${severeByArea ? 'is' : 'is not'} in the severe range and the half-time ${severeByHalfTime ? 'is' : 'is not'}. Either meets the definition, so the stage follows the one that does - but the disagreement is worth resolving before acting on it.`
    : null;

  const halfTimeLimitsNote = halfTime !== null
    ? 'The empirical area of 220 divided by the half-time breaks down with significant aortic regurgitation, immediately after balloon valvuloplasty, and where ventricular or atrial compliance is abnormal.'
    : null;

  const verySevereNote = verySevere
    ? 'A valve area of 1.0 square cm or less, or a half-time of 220 ms or more, is very severe stenosis within the severe range.'
    : null;

  const label = stage ? `Stage ${stage}` : 'No stage assigned';

  return {
    valid: true,
    stage,
    severe,
    verySevere,
    basis,
    pending,
    gradientNote,
    heartRateNote,
    disagreeNote,
    halfTimeLimitsNote,
    verySevereNote,
    abnormal: stage === 'C' || stage === 'D',
    bandLabel: label,
    band: stage
      ? `Mitral stenosis stage ${stage} — ${basis}.`
      : (basis ? `No stage assigned — ${basis}.` : 'No stage assigned.'),
    detail: 'A is valve doming without commissural fusion. B is progressive: fusion with an area above 1.5 square cm and a half-time below 150 ms. C is asymptomatic severe at an area of 1.5 square cm or less or a half-time of 150 ms or more. D is the same with symptoms. The mean gradient is not part of the definition.',
    note: MS_STAGE_NOTE,
  };
}
