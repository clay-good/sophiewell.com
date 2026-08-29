// spec-v889: the qualifying criteria for long-term home oxygen therapy.
//
// Sources:
//   Centers for Medicare & Medicaid Services. National Coverage Determination 240.2, Home Use of
//   Oxygen.
//   Jacobs SS, Krishnan JA, Lederer DJ, et al. Home Oxygen Therapy for Adults with Chronic Lung
//   Disease: an Official American Thoracic Society Clinical Practice Guideline.
//   Am J Respir Crit Care Med. 2020;202(10):e121-e141.
//
//   Group I, qualifying outright:  an arterial oxygen tension at or below 55 mmHg, or a saturation
//                                  at or below 88%.
//   Group II, qualifying with a
//   supporting finding:            a tension of 56 to 59 mmHg, or a saturation of 89%, TOGETHER
//                                  with dependent edema suggesting congestive heart failure,
//                                  pulmonary hypertension or cor pulmonale, or a hematocrit above
//                                  56%.
//   Group III:                     a tension at or above 60 mmHg, or a saturation at or above 90%,
//                                  which does not qualify.
//
// THE MEASUREMENT MUST BE MADE ON ROOM AIR AND WHEN THE PATIENT IS STABLE, AND THAT IS WHY THIS
// TILE EXISTS. A value taken during an exacerbation, or on supplemental oxygen, does not
// establish a chronic need, and a qualifying value obtained that way is the commonest reason a
// prescription is later found not to have been supportable.
//
// 89% IS A QUALIFYING SATURATION ONLY WITH A SUPPORTING FINDING. It sits one point away from 88%
// and is routinely read as if it were on the same side of the line.
//
// THE COVERAGE CRITERIA AND THE CLINICAL EVIDENCE ARE NOT THE SAME QUESTION. The 2020 ATS
// guideline recommends continuous oxygen for severe chronic resting room-air hypoxemia in COPD
// and in interstitial lung disease, and does NOT recommend it for moderate resting hypoxemia;
// a patient can meet a coverage rule the evidence does not support, and the reverse.
//
// Pure: no DOM, no clock, no network.

export const HOME_O2_NOTE = 'Long-term home oxygen is qualified against coverage criteria that turn on a resting room-air measurement. A patient qualifies outright with an arterial oxygen tension at or below 55 mmHg or a saturation at or below 88 percent. A patient with a tension of 56 to 59 mmHg or a saturation of 89 percent qualifies only alongside a supporting finding: dependent edema suggesting congestive heart failure, pulmonary hypertension or cor pulmonale, or a hematocrit above 56 percent. A tension at or above 60 mmHg or a saturation at or above 90 percent does not qualify. Three things about this are worth stating plainly. The measurement has to be made on room air and while the patient is stable, because a value taken during an exacerbation or on supplemental oxygen does not establish a chronic need, and a qualifying value obtained that way is the commonest reason a prescription is later found not to have been supportable. A saturation of 89 percent qualifies only with a supporting finding, and it sits one point from 88 percent and is routinely read as though it were on the same side of the line. And the coverage criteria and the clinical evidence are not the same question: the 2020 American Thoracic Society guideline recommends continuous oxygen for severe chronic resting room-air hypoxemia in chronic obstructive pulmonary disease and in interstitial lung disease and does not recommend it for moderate resting hypoxemia, so a patient can meet a coverage rule the evidence does not support and the reverse. It applies published criteria to a measurement already taken. It does not prescribe oxygen, and it does not determine coverage.';

export const PAO2_QUALIFY = 55;
export const PAO2_BORDERLINE_LOW = 56;
export const PAO2_BORDERLINE_HIGH = 59;
export const SPO2_QUALIFY = 88;
export const SPO2_BORDERLINE = 89;
export const HEMATOCRIT_HIGH = 56;

export const SUPPORTING_FINDINGS = [
  { key: 'dependentEdema', text: 'Dependent edema suggesting congestive heart failure' },
  { key: 'pulmonaryHypertension', text: 'Pulmonary hypertension or cor pulmonale' },
  { key: 'polycythemia', text: 'Hematocrit above 56 percent' },
];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const pick = (list, o) => list.filter((i) => on(o[i.key]));

export function homeOxygen(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const pao2 = num(o.pao2);
  const spo2 = num(o.spo2);

  for (const [label, v, lo, hi] of [
    ['arterial oxygen tension in mmHg', pao2, 10, 200],
    ['oxygen saturation as a percentage', spo2, 40, 100],
  ]) {
    if (v !== null && (v < lo || v > hi)) {
      return { valid: false, message: `Enter the ${label} between ${lo} and ${hi}.` };
    }
  }
  if (pao2 === null && spo2 === null) {
    return { valid: false, message: 'Enter an arterial oxygen tension, an oxygen saturation, or both.' };
  }

  const roomAir = on(o.roomAir);
  const stable = on(o.clinicallyStable);
  const supporting = pick(SUPPORTING_FINDINGS, o);

  const groupOne = (pao2 !== null && pao2 <= PAO2_QUALIFY) || (spo2 !== null && spo2 <= SPO2_QUALIFY);
  const borderline = !groupOne && (
    (pao2 !== null && pao2 >= PAO2_BORDERLINE_LOW && pao2 <= PAO2_BORDERLINE_HIGH)
    || (spo2 !== null && spo2 === SPO2_BORDERLINE));

  const group = groupOne ? 'one' : borderline ? (supporting.length ? 'two' : 'two-unsupported') : 'three';

  const measured = [
    pao2 !== null ? `a tension of ${pao2} mmHg` : null,
    spo2 !== null ? `a saturation of ${spo2} percent` : null,
  ].filter(Boolean).join(' and ');

  const action = {
    one: `Qualifies on ${measured}: at or below ${PAO2_QUALIFY} mmHg, or at or below ${SPO2_QUALIFY} percent.`,
    two: `Qualifies on ${measured} together with ${supporting.length === 1 ? 'a supporting finding' : `${supporting.length} supporting findings`}: ${supporting.map((s) => s.text.toLowerCase()).join('; ')}. Without one of those, this range does not qualify.`,
    'two-unsupported': `${measured.charAt(0).toUpperCase()}${measured.slice(1)} is in the range that qualifies only alongside a supporting finding, and none is recorded. Dependent edema suggesting congestive heart failure, pulmonary hypertension or cor pulmonale, or a hematocrit above ${HEMATOCRIT_HIGH} percent would each do it.`,
    three: `Does not qualify on ${measured}: at or above ${PAO2_BORDERLINE_HIGH + 1} mmHg, or at or above ${SPO2_BORDERLINE + 1} percent.`,
  }[group];

  // The reason the tile exists, on every result.
  const conditionsNote = (!roomAir || !stable)
    ? `This reading is not recorded as ${[!roomAir ? 'taken on room air' : null, !stable ? 'taken while the patient is clinically stable' : null].filter(Boolean).join(' and ')}, and both are required. A value obtained during an exacerbation or on supplemental oxygen does not establish a chronic need, and it is the commonest reason a prescription is later found not to have been supportable.`
    : 'Recorded as taken on room air, with the patient clinically stable. Both are required: a value obtained during an exacerbation or on supplemental oxygen does not establish a chronic need.';

  const borderlineNote = borderline
    ? `A saturation of ${SPO2_BORDERLINE} percent, or a tension of ${PAO2_BORDERLINE_LOW} to ${PAO2_BORDERLINE_HIGH} mmHg, qualifies only with a supporting finding. It sits one point from ${SPO2_QUALIFY} percent and is routinely read as though it were on the same side of the line.`
    : null;

  const evidenceNote = 'Coverage criteria and clinical evidence are not the same question. The 2020 ATS guideline recommends continuous oxygen for severe chronic resting room-air hypoxemia in chronic obstructive pulmonary disease and in interstitial lung disease, and does not recommend it for moderate resting hypoxemia. A patient can meet a coverage rule the evidence does not support, and the reverse.';

  const exertionNote = 'These criteria are for a resting measurement. Desaturation on exertion, and nocturnal desaturation, are assessed separately and are not what this reads.';

  const scopeNote = 'This applies published criteria to a measurement already taken. It does not prescribe oxygen, and it does not determine coverage.';

  return {
    valid: true,
    group,
    qualifies: group === 'one' || group === 'two',
    pao2,
    spo2,
    supporting: supporting.map((s) => s.text),
    roomAir,
    clinicallyStable: stable,
    action,
    conditionsNote,
    borderlineNote,
    evidenceNote,
    exertionNote,
    scopeNote,
    abnormal: group === 'one' || group === 'two',
    bandLabel: {
      one: 'Qualifies',
      two: 'Qualifies with a supporting finding',
      'two-unsupported': 'Needs a supporting finding',
      three: 'Does not qualify',
    }[group],
    band: action,
    detail: `A tension at or below ${PAO2_QUALIFY} mmHg, or a saturation at or below ${SPO2_QUALIFY} percent, qualifies outright. A tension of ${PAO2_BORDERLINE_LOW} to ${PAO2_BORDERLINE_HIGH} mmHg, or a saturation of ${SPO2_BORDERLINE} percent, qualifies only with dependent edema suggesting congestive heart failure, pulmonary hypertension or cor pulmonale, or a hematocrit above ${HEMATOCRIT_HIGH} percent. Anything above that does not qualify. The measurement must be at rest, on room air, with the patient stable.`,
    note: HOME_O2_NOTE,
  };
}
