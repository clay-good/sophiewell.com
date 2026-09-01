// spec-v958: the VExUS grade -- venous congestion from IVC diameter and three venous Doppler
// waveforms.
//
// Source:
//   Beaubien-Souligny W, Rola P, Haycock K, Bouchard J, Lamarche Y, Spiegel R, Denault AY.
//   Quantifying systemic congestion with Point-Of-Care ultrasound: development of the venous
//   excess ultrasound grading system. Ultrasound J. 2020;12(1):16.
//
//   Five prototypes (A-E) were developed; the paper reports that VExUS "C" -- the one that
//   requires SEVERE flow abnormalities in MULTIPLE Doppler patterns together with a dilated IVC
//   -- had the strongest association with acute kidney injury after cardiac surgery
//   (HR 3.69, CI 1.65-8.24). That is the grading this implements.
//
//   IVC below 2 cm                                     -> Grade 0
//   IVC at or above 2 cm, no severe Doppler pattern    -> Grade 1
//   IVC at or above 2 cm, ONE severe Doppler pattern   -> Grade 2
//   IVC at or above 2 cm, TWO OR MORE severe patterns  -> Grade 3
//
//   Per-territory severity, quoting the derivation paper's Fig. 1 caption:
//     hepatic vein   - mild: the systolic component is lower in magnitude than the diastolic
//                      component but still toward the liver.
//                      severe: the systolic component is REVERSED, toward the heart.
//     portal vein    - mild: velocity varies 30 to under 50% over the cardiac cycle.
//                      severe: the variation is 50% or more.
//     intrarenal vein- mild: discontinuous, with a systolic and a diastolic phase.
//                      severe: discontinuous, with ONLY a diastolic phase.
//
// MILD FINDINGS DO NOT RAISE THE GRADE HERE, AND THAT IS THE TRAP. Prototypes B and D were the
// ones that combined mild and severe findings; C counts severe patterns only, and C is the one
// that performed. Three mild waveforms with a dilated IVC is Grade 1, the same as three normal
// ones. The mild findings are still worth recording -- they are the reason to look again -- but
// they do not move this number.
//
// A DILATED IVC ON ITS OWN IS NOT CONGESTION. The paper measured IVC dilatation alone at 41%
// specificity and concluded it "is not sufficient to detect clinically significant congestion".
// Grade 1 exists to say exactly that: the vein is big and nothing downstream is severe.
//
// GRADE 3 IS SPECIFIC AND NOT SENSITIVE. It was built to rule congestion IN. A low grade is not
// evidence that a patient is not congested.
//
// WHERE IT COMES FROM. 145 adults after cardiac surgery, 706 assessments, predicting AKI in the
// first 72 hours. It is not a volume-status meter and it was not derived as one.
//
// KNOWN CONFOUNDERS, from the paper's own discussion: hepatic vein Doppler is strongly
// influenced by tricuspid regurgitation; pulsatile portal flow and IVC dilatation both occur in
// healthy athletic volunteers; intrarenal venous Doppler is the hardest of the three to obtain
// and the most likely to be ambiguous.
//
// Pure: no DOM, no clock, no network.

export const VEXUS_NOTE = 'The VExUS grade reads venous congestion from the inferior vena cava diameter plus the Doppler waveform in three veins -- hepatic, portal and intrarenal. An IVC under 2 cm is Grade 0. At or above 2 cm the grade is set by how many of the three waveforms are SEVERELY abnormal: none is Grade 1, one is Grade 2, two or more is Grade 3. Severe means a reversed systolic component in the hepatic vein, a portal velocity variation of 50% or more, or an intrarenal trace that is discontinuous with only a diastolic phase. Four things are worth stating plainly. Mild findings do not raise this grade: the version of the score that performed counts severe patterns only, so three mild waveforms with a dilated IVC read the same as three normal ones. A dilated IVC on its own is not congestion -- the derivation measured it at 41% specificity and said so. Grade 3 was built to rule congestion in, with high specificity and low sensitivity, so a low grade is not evidence that a patient is not congested. And it was derived in 145 adults after cardiac surgery to predict acute kidney injury in the first 72 hours; it is not a volume-status meter. Hepatic vein flow is strongly influenced by tricuspid regurgitation, pulsatile portal flow and a dilated IVC both occur in healthy athletes, and the intrarenal trace is the hardest of the three to obtain.';

export const DOPPLER_OPTIONS = [
  { value: 'normal', text: 'Normal' },
  { value: 'mild', text: 'Mildly abnormal' },
  { value: 'severe', text: 'Severely abnormal' },
];

const SEVERE_TEXT = {
  hepatic: 'hepatic vein: systolic component reversed',
  portal: 'portal vein: velocity variation 50% or more',
  renal: 'intrarenal vein: discontinuous, diastolic phase only',
};
const MILD_TEXT = {
  hepatic: 'hepatic vein: systolic lower than diastolic but still toward the liver',
  portal: 'portal vein: velocity variation 30 to under 50%',
  renal: 'intrarenal vein: discontinuous, with a systolic and a diastolic phase',
};

const DILATED_CM = 2;

const GRADE_BAND = {
  0: 'Grade 0: no significant venous congestion by this system. The IVC is under 2 cm, and the grading does not go further.',
  1: 'Grade 1: a dilated IVC with no severely abnormal waveform. The derivation found IVC dilatation alone to be 41% specific and not sufficient on its own to call congestion.',
  2: 'Grade 2, moderate congestion: a dilated IVC with one severely abnormal territory.',
  3: 'Grade 3, severe congestion: a dilated IVC with two or more severely abnormal territories. This is the grade associated with subsequent acute kidney injury after cardiac surgery (HR 3.69). It is specific rather than sensitive.',
};

function num(v) {
  if (v === null || v === undefined || String(v).trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function level(v) {
  const s = String(v === null || v === undefined ? '' : v).trim().toLowerCase();
  return s === 'severe' || s === 'mild' ? s : 'normal';
}

export function vexusGrade(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const ivc = num(o.ivcDiameterCm);
  if (ivc === null || ivc <= 0) {
    return { valid: false, message: 'Enter the maximal IVC diameter in centimeters, measured in its intra-hepatic portion about 2 cm from the junction with the hepatic veins. Under 2 cm is Grade 0 and the grading stops there.' };
  }

  const territories = [
    { key: 'hepatic', label: 'Hepatic vein', level: level(o.hepaticVein) },
    { key: 'portal', label: 'Portal vein', level: level(o.portalVein) },
    { key: 'renal', label: 'Intrarenal vein', level: level(o.intrarenalVein) },
  ];

  const severe = territories.filter((t) => t.level === 'severe');
  const mild = territories.filter((t) => t.level === 'mild');
  const dilated = ivc >= DILATED_CM;

  let grade;
  if (!dilated) grade = 0;
  else if (severe.length === 0) grade = 1;
  else if (severe.length === 1) grade = 2;
  else grade = 3;

  const ivcNote = dilated
    ? `IVC ${ivc} cm, at or above the 2 cm the derivation used for a dilated vein, so the Doppler waveforms set the grade.`
    : `IVC ${ivc} cm, under 2 cm. This system stops there and returns Grade 0 whatever the waveforms show; a normal IVC generally argues against significant systemic venous congestion.`;

  const severeNote = severe.length
    ? `Severely abnormal: ${severe.map((t) => SEVERE_TEXT[t.key]).join('; ')}.`
    : 'No territory is severely abnormal.';

  const mildNote = mild.length
    ? `Mildly abnormal, which does NOT raise this grade: ${mild.map((t) => MILD_TEXT[t.key]).join('; ')}. The prototype that counted mild findings performed worse than the one that did not.`
    : '';

  const stoppedNote = !dilated && (severe.length || mild.length)
    ? 'Waveform findings were entered but the IVC is under 2 cm, so this grading does not use them. They are still worth recording.'
    : '';

  const scopeNote = 'Derived in 145 adults after cardiac surgery to predict acute kidney injury in the first 72 hours. It is not a volume-status meter, and Grade 3 is specific rather than sensitive -- a low grade is not evidence against congestion.';

  const confounderNote = 'Hepatic vein flow is strongly influenced by tricuspid regurgitation. Pulsatile portal flow and a dilated IVC both occur in healthy athletic volunteers. The intrarenal trace is the hardest of the three to obtain and the most likely to be ambiguous.';

  return {
    valid: true,
    grade,
    ivcCm: ivc,
    ivcDilated: dilated,
    severeCount: severe.length,
    mildCount: mild.length,
    severeTerritories: severe.map((t) => t.label),
    mildTerritories: mild.map((t) => t.label),
    abnormal: grade >= 2,
    bandLabel: `VExUS Grade ${grade}`,
    band: GRADE_BAND[grade],
    ivcNote,
    severeNote,
    mildNote,
    stoppedNote,
    scopeNote,
    confounderNote,
    detail: 'IVC under 2 cm is Grade 0. At or above 2 cm: no severe waveform is Grade 1, one severe is Grade 2, two or more severe is Grade 3.',
    note: VEXUS_NOTE,
  };
}
