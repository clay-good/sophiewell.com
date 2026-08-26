// spec-v804: Rome proposal severity classification for COPD exacerbations.
//
// Source:
//   Celli BR, Fabbri LM, Aaron SD, et al. An updated definition and severity classification
//   of chronic obstructive pulmonary disease exacerbations: the Rome proposal.
//   Am J Respir Crit Care Med. 2021;204(11):1251-1258. (PMID 34570991.)
//
// FIVE measurable variables, each with a cutoff:
//   dyspnea on a 0-10 visual analog scale     5 or more
//   respiratory rate                          24 or more per minute
//   heart rate                                95 or more per minute
//   oxygen saturation                         under 92%, or a fall of more than 3% from baseline
//   C-reactive protein                        10 mg/L or more
//
// MODERATE requires at least THREE of those five above their cutoff. Fewer than three is
// mild. That counting rule is the part people miss - a single alarming number does not make
// an exacerbation moderate.
//
// SEVERE is a separate gate on a SIXTH variable, the arterial blood gas, and needs BOTH
// hypercapnia (PaCO2 above 45 mmHg) AND respiratory acidosis (pH under 7.35). Hypercapnia
// alone is not severe; a low pH from another cause is not severe either.
//
// Pure: no DOM, no clock, no network.

export const ROME_NOTE = 'The Rome proposal (Celli BR, Fabbri LM, Aaron SD, et al, Am J Respir Crit Care Med 2021;204(11):1251-1258) grades a COPD exacerbation at the point of care from five measurable variables, each with its own cutoff: dyspnea of 5 or more on a 0 to 10 visual analog scale, a respiratory rate of 24 or more, a heart rate of 95 or more, an oxygen saturation under 92 percent or a fall of more than 3 percent from the patient usual value, and a C-reactive protein of 10 milligrams per litre or more. At least three of those five must be above cutoff for the exacerbation to be moderate, and fewer than three is mild, so a single alarming number does not by itself make an exacerbation moderate. Severe is decided separately on a sixth variable, the arterial blood gas, and needs both hypercapnia above 45 millimetres of mercury and a pH under 7.35; hypercapnia on its own is not severe, and neither is a low pH from another cause. It grades an episode from measurements already taken and does not decide about steroids, antibiotics, ventilation or admission.';

const VARIABLES = [
  { arg: 'dyspneaVas', min: 0, max: 10, cutoff: (v) => v >= 5, text: 'dyspnea VAS 5 or more', unit: '' },
  { arg: 'respiratoryRate', min: 0, max: 80, cutoff: (v) => v >= 24, text: 'respiratory rate 24 or more', unit: '/min' },
  { arg: 'heartRate', min: 0, max: 250, cutoff: (v) => v >= 95, text: 'heart rate 95 or more', unit: '/min' },
  { arg: 'crp', min: 0, max: 500, cutoff: (v) => v >= 10, text: 'CRP 10 mg/L or more', unit: 'mg/L' },
];

function optNum(v, min, max) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isFinite(n) || n < min || n > max) return undefined;
  return n;
}
function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function romeEcopd(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const above = [];
  for (const v of VARIABLES) {
    const parsed = optNum(o[v.arg], v.min, v.max);
    if (parsed === undefined) {
      return { valid: false, code: 'INVALID_INPUT', field: v.arg, message: `Enter a value between ${v.min} and ${v.max} ${v.unit}.`.trim(), note: ROME_NOTE };
    }
    if (parsed !== null && v.cutoff(parsed)) above.push(v.text);
  }

  // Oxygen saturation counts when EITHER the absolute value or the fall from baseline
  // crosses its cutoff, so it is read as a pair rather than a single number.
  const spo2 = optNum(o.spo2, 50, 100);
  if (spo2 === undefined) return { valid: false, code: 'INVALID_INPUT', field: 'spo2', message: 'Enter an oxygen saturation between 50 and 100 percent.', note: ROME_NOTE };
  const spo2Drop = optNum(o.spo2DropFromBaseline, 0, 50);
  if (spo2Drop === undefined) return { valid: false, code: 'INVALID_INPUT', field: 'spo2DropFromBaseline', message: 'Enter a fall in oxygen saturation between 0 and 50 percentage points.', note: ROME_NOTE };
  if ((spo2 !== null && spo2 < 92) || (spo2Drop !== null && spo2Drop > 3)) {
    above.push('oxygen saturation under 92% or a fall over 3%');
  }

  const paco2 = optNum(o.paco2, 10, 150);
  if (paco2 === undefined) return { valid: false, code: 'INVALID_INPUT', field: 'paco2', message: 'Enter a PaCO2 between 10 and 150 mmHg.', note: ROME_NOTE };
  const ph = optNum(o.ph, 6.5, 8);
  if (ph === undefined) return { valid: false, code: 'INVALID_INPUT', field: 'ph', message: 'Enter a pH between 6.5 and 8.', note: ROME_NOTE };

  const hypercapnia = paco2 !== null && paco2 > 45;
  const acidosis = ph !== null && ph < 7.35;
  const severe = hypercapnia && acidosis;

  const count = above.length;
  let severity;
  if (severe) severity = 'severe';
  else if (count >= 3) severity = 'moderate';
  else severity = 'mild';

  let reason;
  if (severe) reason = `arterial blood gas shows both hypercapnia (PaCO2 ${paco2} mmHg) and respiratory acidosis (pH ${ph})`;
  else if (count >= 3) reason = `${count} of the five variables are above cutoff`;
  else reason = `only ${count} of the five variables are above cutoff, and three are needed for moderate`;

  return {
    valid: true,
    severity,
    aboveCutoff: above,
    aboveCount: count,
    hypercapnia,
    acidosis,
    abnormal: severity !== 'mild',
    bandLabel: `Rome: ${severity} exacerbation`,
    band: `Rome proposal: ${severity} COPD exacerbation — ${reason}.`,
    detail: 'Five variables, each with a cutoff: dyspnea VAS 5 or more, respiratory rate 24 or more, heart rate 95 or more, oxygen saturation under 92% or a fall over 3% from baseline, CRP 10 mg/L or more. At least THREE above cutoff is moderate; fewer is mild. Severe is a separate gate on the arterial blood gas and needs BOTH hypercapnia above 45 mmHg AND a pH under 7.35 - hypercapnia alone is not severe.',
    note: ROME_NOTE,
  };
}
