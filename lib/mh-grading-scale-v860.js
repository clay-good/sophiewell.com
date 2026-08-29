// spec-v860: the malignant hyperthermia clinical grading scale.
//
// Source:
//   Larach MG, Localio AR, Allen GC, et al. A clinical grading scale to predict malignant
//   hyperthermia susceptibility. Anesthesiology. 1994;80(4):771-779.
//
//   Indicators are grouped into seven processes. ONLY THE HIGHEST-SCORING INDICATOR IN EACH
//   PROCESS COUNTS; the raw score is the sum of those seven. The raw score maps to a rank:
//
//     0        rank 1  almost never          20-34   rank 4  somewhat greater than likely
//     3-9      rank 2  unlikely              35-49   rank 5  very likely
//     10-19    rank 3  somewhat less         50+     rank 6  almost certain
//              than likely
//
// THE SCALE IS NOT A TREATMENT TRIGGER, AND THAT IS THE POINT OF THIS TILE. It was built to
// rank the likelihood that an episode was malignant hyperthermia, for research and for
// retrospective review. Dantrolene is given on clinical suspicion during the crisis. Scoring
// first is the harm.
//
// FEVER IS NEITHER REQUIRED NOR EARLY. An unexplained rise in end-tidal CO2 under controlled
// ventilation is the earliest and most specific sign. Temperature is a late one, and calling an
// episode unlikely because there was no fever is the classic under-call.
//
// ONLY THE HIGHEST INDICATOR IN EACH PROCESS COUNTS. Ticking every box and adding them up
// inflates the raw score: a huge creatine kinase, cola-colored urine, myoglobinuria and
// hyperkalemia are one process worth 15, not four indicators worth 33.
//
// Pure: no DOM, no clock, no network.

export const MH_NOTE = 'The malignant hyperthermia clinical grading scale (Larach and colleagues, Anesthesiology, 1994) ranks how likely it is that an episode was malignant hyperthermia. Its indicators are grouped into seven processes — rigidity, muscle breakdown, respiratory acidosis, temperature increase, cardiac involvement, family history, and a group of other indicators — and only the highest-scoring indicator within each process is counted. The seven are added into a raw score, and the raw score gives a rank from 1, almost never, through 6, almost certain. Three things go wrong with it. It is not a treatment trigger: it was built for research and for retrospective review, dantrolene is given on clinical suspicion during the crisis, and stopping to score an episode is itself the harm. Fever is neither required nor early, because an unexplained rise in end-tidal carbon dioxide under controlled ventilation is the earliest and most specific sign while temperature is a late one, so calling an episode unlikely for want of a fever is the usual under-call. And only the highest indicator in each process counts, so ticking every box and adding them up inflates the score: a very high creatine kinase, dark urine, myoglobin and a raised potassium are one process worth 15 points, not four indicators worth 33. This scores an episode that has already been described. It does not diagnose malignant hyperthermia, replace contracture or genetic testing, and it never decides whether to give dantrolene.';

// The published indicators. Each carries its process, so the highest-per-process rule is data
// rather than a special case.
export const INDICATORS = [
  { key: 'rigidityGeneralized', process: 'rigidity', points: 15, text: 'Generalized muscular rigidity' },
  { key: 'masseterSpasm', process: 'rigidity', points: 15, text: 'Masseter spasm shortly after succinylcholine' },

  { key: 'ckSux', process: 'breakdown', points: 15, text: 'Creatine kinase over 20,000 units per liter after an anesthetic that included succinylcholine' },
  { key: 'ckNoSux', process: 'breakdown', points: 15, text: 'Creatine kinase over 10,000 units per liter after an anesthetic without succinylcholine' },
  { key: 'colaUrine', process: 'breakdown', points: 10, text: 'Cola-colored urine perioperatively' },
  { key: 'myoglobinUrine', process: 'breakdown', points: 5, text: 'Urine myoglobin over 60 micrograms per liter' },
  { key: 'myoglobinSerum', process: 'breakdown', points: 5, text: 'Serum myoglobin over 170 micrograms per liter' },
  { key: 'potassium', process: 'breakdown', points: 3, text: 'Potassium over 6 millimoles per liter, without kidney failure' },

  { key: 'etco2Controlled', process: 'acidosis', points: 15, text: 'End-tidal carbon dioxide over 55 mmHg with appropriate controlled ventilation' },
  { key: 'paco2Controlled', process: 'acidosis', points: 15, text: 'Arterial carbon dioxide over 60 mmHg with appropriate controlled ventilation' },
  { key: 'etco2Spontaneous', process: 'acidosis', points: 15, text: 'End-tidal carbon dioxide over 60 mmHg with spontaneous ventilation' },
  { key: 'paco2Spontaneous', process: 'acidosis', points: 15, text: 'Arterial carbon dioxide over 65 mmHg with spontaneous ventilation' },
  { key: 'hypercarbia', process: 'acidosis', points: 15, text: 'Inappropriate hypercarbia judged inappropriate by the anesthesia team' },
  { key: 'tachypnea', process: 'acidosis', points: 10, text: 'Inappropriate tachypnea' },

  { key: 'tempRapid', process: 'temperature', points: 15, text: 'Inappropriately rapid increase in temperature judged inappropriate by the anesthesia team' },
  { key: 'tempHigh', process: 'temperature', points: 10, text: 'Inappropriately increased temperature over 38.8 degrees Celsius perioperatively' },

  { key: 'sinusTach', process: 'cardiac', points: 3, text: 'Inappropriate sinus tachycardia' },
  { key: 'ventricularArrhythmia', process: 'cardiac', points: 3, text: 'Ventricular tachycardia or ventricular fibrillation' },

  { key: 'familyFirstDegree', process: 'family', points: 15, text: 'Malignant hyperthermia in a first-degree relative' },
  { key: 'familyOther', process: 'family', points: 5, text: 'Malignant hyperthermia in a relative who is not first-degree' },

  { key: 'baseExcess', process: 'other', points: 10, text: 'Arterial base excess more negative than -8 millimoles per liter' },
  { key: 'lowPh', process: 'other', points: 10, text: 'Arterial pH below 7.25' },
  { key: 'restingCk', process: 'other', points: 10, text: 'Raised resting creatine kinase with a family history of malignant hyperthermia' },
  { key: 'dantroleneReversal', process: 'other', points: 5, text: 'Rapid reversal of the signs with intravenous dantrolene' },
];

const PROCESS_NAMES = {
  rigidity: 'rigidity',
  breakdown: 'muscle breakdown',
  acidosis: 'respiratory acidosis',
  temperature: 'temperature increase',
  cardiac: 'cardiac involvement',
  family: 'family history',
  other: 'other indicators',
};

const RANKS = [
  { min: 50, rank: 6, label: 'rank 6, almost certain' },
  { min: 35, rank: 5, label: 'rank 5, very likely' },
  { min: 20, rank: 4, label: 'rank 4, somewhat greater than likely' },
  { min: 10, rank: 3, label: 'rank 3, somewhat less than likely' },
  { min: 3, rank: 2, label: 'rank 2, unlikely' },
  { min: 0, rank: 1, label: 'rank 1, almost never' },
];

function rankFor(raw) {
  return RANKS.find((r) => raw >= r.min);
}

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

export function mhGradingScale(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const ticked = INDICATORS.filter((i) => on(o[i.key]));

  // The rule the scale is most often got wrong on: highest per process, not the sum of the box.
  const byProcess = new Map();
  for (const i of ticked) {
    const best = byProcess.get(i.process);
    if (!best || i.points > best.points) byProcess.set(i.process, i);
  }
  const counted = [...byProcess.values()];
  const raw = counted.reduce((a, i) => a + i.points, 0);
  const naive = ticked.reduce((a, i) => a + i.points, 0);

  const graded = rankFor(raw);
  const naiveRank = rankFor(naive);

  const inflatedProcesses = [...new Set(ticked.map((i) => i.process))]
    .filter((p) => ticked.filter((i) => i.process === p).length > 1)
    .map((p) => PROCESS_NAMES[p]);

  const doubleCountNote = naive > raw
    ? `Only the highest-scoring indicator in each process counts. More than one was entered under ${inflatedProcesses.join(', ')}, so adding every indicator would give a raw score of ${naive} rather than ${raw}${naiveRank.rank === graded.rank ? ', which lands on the same rank here' : `, and ${naiveRank.label} rather than ${graded.label}`}.`
    : null;

  // The reason the tile exists.
  const notATriggerNote = 'This scale is not a treatment trigger. It was built to rank the likelihood that an episode was malignant hyperthermia, for research and for retrospective review. During a crisis dantrolene is given on clinical suspicion, and stopping to score is itself the harm.';

  const feverNote = !on(o.tempRapid) && !on(o.tempHigh) && ticked.length > 0
    ? 'No temperature indicator was entered. Fever is neither required nor early: an unexplained rise in end-tidal carbon dioxide under controlled ventilation is the earliest and most specific sign, and temperature is a late one. A low rank for want of a fever is the usual under-call.'
    : null;

  const masseterNote = on(o.masseterSpasm) && on(o.rigidityGeneralized)
    ? 'Masseter spasm and generalized rigidity are both in the rigidity process, so they do not add. The process contributes 15 either way.'
    : null;

  const emptyNote = ticked.length === 0
    ? 'Nothing has been entered, so the raw score is 0 and the rank is the floor of the scale rather than a finding. A score of 0 records that no indicator was described, not that malignant hyperthermia was excluded.'
    : null;

  const scopeNote = 'This scores an episode that has already been described. It does not diagnose malignant hyperthermia, replace contracture or genetic testing, and it never decides whether to give dantrolene.';

  return {
    valid: true,
    raw,
    naive,
    rank: graded.rank,
    rankLabel: graded.label,
    counted: counted.map((i) => ({ process: PROCESS_NAMES[i.process], points: i.points, text: i.text })),
    tickedCount: ticked.length,
    doubleCountNote,
    notATriggerNote,
    feverNote,
    masseterNote,
    emptyNote,
    scopeNote,
    abnormal: graded.rank >= 4,
    bandLabel: graded.label.replace(/^rank \d+, /, (m) => m.charAt(0).toUpperCase() + m.slice(1)),
    band: `Raw score ${raw} — ${graded.label}.`,
    detail: 'Indicators sit in seven processes and only the highest in each counts. The seven are added into a raw score: 0 is rank 1, almost never; 3 to 9 is rank 2, unlikely; 10 to 19 is rank 3, somewhat less than likely; 20 to 34 is rank 4, somewhat greater than likely; 35 to 49 is rank 5, very likely; and 50 or more is rank 6, almost certain.',
    note: MH_NOTE,
  };
}
