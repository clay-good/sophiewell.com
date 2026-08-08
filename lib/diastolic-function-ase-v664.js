// spec-v664: ASE/EACVI 2016 assessment of LV diastolic function in patients with NORMAL
// ejection fraction (the four-variable screen).
//
// A companion to the built HFpEF-probability scores (h2fpef, hfa-peff) on a different
// axis: this classifies diastolic function itself (normal / indeterminate / dysfunction)
// rather than estimating HFpEF probability. Source:
//   Nagueh SF, Smiseth OA, Appleton CP, et al. Recommendations for the Evaluation of
//   Left Ventricular Diastolic Function by Echocardiography: An Update from the ASE and
//   the EACVI. J Am Soc Echocardiogr. 2016;29(4):277-314. PMID 27037982.
//
// Four criteria, each abnormal/normal (strict inequalities):
//   average E/e' > 14; annular e' (septal e' < 7 or lateral e' < 10 cm/s); peak TR
//   velocity > 2.8 m/s; LA volume index > 34 mL/m2.
// Of the AVAILABLE criteria (the denominator is what was measured, not always 4):
//   < 50% abnormal -> normal diastolic function; > 50% -> diastolic dysfunction;
//   exactly 50% -> indeterminate.
//
// Grading (I/II/III) is NOT computed here -- it needs mitral E/A and peak E, which this
// screen does not collect; it is described in the note. Pure: no DOM, no clock, no network.

function optNum(raw) {
  if (raw === '' || raw === null || raw === undefined) return null;
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
  return Number.isFinite(n) ? n : NaN;
}

export const DIASTOLIC_NOTE = 'ASE/EACVI 2016 assessment of LV diastolic function for patients with normal ejection fraction (Nagueh SF, et al., J Am Soc Echocardiogr 2016;29(4):277-314). Four criteria are each judged abnormal or normal: average E/e′ greater than 14; annular e′ velocity (septal under 7 or lateral under 10 cm/s); peak tricuspid regurgitation velocity greater than 2.8 m/s; and LA volume index greater than 34 mL/m2. Of the criteria that were measured, fewer than half abnormal means normal diastolic function, more than half means diastolic dysfunction, and exactly half is indeterminate (proceed to additional testing). At least three of the four should ideally be available. Once dysfunction is established (or when the ejection fraction is reduced), the grade I to III is set by the mitral E/A ratio and peak E with the same elevated-filling-pressure criteria; this tile does not compute the grade. It takes the clinician’s measured echo values and supports the reading, not a diagnosis on its own.';

const CRITERIA = [
  { key: 'avgEe', label: 'average E/e′ > 14' },
  { key: 'annularE', label: 'annular e′ (septal < 7 or lateral < 10 cm/s)' },
  { key: 'trVelocity', label: 'TR velocity > 2.8 m/s' },
  { key: 'lavi', label: 'LA volume index > 34 mL/m2' },
];

export function diastolicFunctionAse(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const avgEe = optNum(o.avgEe);
  const septalE = optNum(o.septalE);
  const lateralE = optNum(o.lateralE);
  const trVelocity = optNum(o.trVelocity);
  const lavi = optNum(o.lavi);

  const bad = [];
  for (const [name, v] of [['avgEe', avgEe], ['septalE', septalE], ['lateralE', lateralE], ['trVelocity', trVelocity], ['lavi', lavi]]) {
    if (v !== null && (Number.isNaN(v) || v < 0)) bad.push(name);
  }
  if (bad.length) {
    return { valid: false, code: 'OUT_OF_RANGE', message: `Each value must be a non-negative number. Check: ${bad.join(', ')}.` };
  }

  // Determine availability and positivity of each criterion.
  const results = [];
  // 1. average E/e'
  if (avgEe !== null) results.push({ key: 'avgEe', label: CRITERIA[0].label, positive: avgEe > 14 });
  // 2. annular e' (available if septal or lateral provided)
  if (septalE !== null || lateralE !== null) {
    const pos = (septalE !== null && septalE < 7) || (lateralE !== null && lateralE < 10);
    results.push({ key: 'annularE', label: CRITERIA[1].label, positive: pos });
  }
  // 3. TR velocity
  if (trVelocity !== null) results.push({ key: 'trVelocity', label: CRITERIA[2].label, positive: trVelocity > 2.8 });
  // 4. LAVI
  if (lavi !== null) results.push({ key: 'lavi', label: CRITERIA[3].label, positive: lavi > 34 });

  const available = results.length;
  if (available === 0) {
    return { valid: false, code: 'MISSING_INPUT', message: 'Enter at least one of: average E/e′, septal or lateral e′, TR velocity, LA volume index.' };
  }
  const positive = results.filter((r) => r.positive).length;
  const fraction = positive / available;

  let category, label, abnormal;
  if (fraction < 0.5) { category = 'normal'; label = 'Normal diastolic function'; abnormal = false; }
  else if (fraction > 0.5) { category = 'dysfunction'; label = 'Diastolic dysfunction'; abnormal = true; }
  else { category = 'indeterminate'; label = 'Indeterminate'; abnormal = false; }

  const posLabels = results.filter((r) => r.positive).map((r) => r.label);
  return {
    valid: true,
    category,
    available,
    positive,
    abnormal,
    fewCriteria: available < 3,
    bandLabel: `${label} (${positive} of ${available} criteria abnormal)`,
    detail: posLabels.length ? 'Abnormal: ' + posLabels.join('; ') + '.' : 'No criterion abnormal.',
    note: DIASTOLIC_NOTE,
  };
}
