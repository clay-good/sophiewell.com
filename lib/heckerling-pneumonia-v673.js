// spec-v673: Heckerling clinical prediction rule for pneumonia (pulmonary infiltrate).
//
// A companion to the built pneumonia cluster (psi, curb-65, corb-score, scap-score):
// those grade SEVERITY of diagnosed pneumonia, whereas Heckerling estimates the
// PROBABILITY that an adult with acute respiratory symptoms has a radiographic
// infiltrate, to guide whether to obtain a chest radiograph. Source:
//   Heckerling PS, Tape TG, Wigton RS, et al. Clinical prediction rule for pulmonary
//   infiltrates. Ann Intern Med. 1990;113(9):664-670. PMID 2221647.
//
// Five clinical predictors, each 1 point (total 0-5):
//   1. temperature > 37.8 C (100 F)
//   2. heart rate > 100 beats/min
//   3. crackles (rales) on auscultation
//   4. decreased breath sounds
//   5. ABSENCE of asthma (a patient WITHOUT asthma scores the point)
//
// IMPORTANT (spec-v97): the original paper gives probability via a prevalence-dependent
// nomogram, not a fixed score->% table. The per-score percentages below are pooled
// observed frequencies across Heckerling's derivation/validation cohorts; the true
// posttest probability depends on local pneumonia prevalence. The tile therefore leads
// with the score and a qualitative band and labels the percentages as approximate.
//
// Pure: no DOM, no clock, no network.

export const HECKERLING_NOTE = 'Heckerling clinical prediction rule for pneumonia (Heckerling PS, et al., Ann Intern Med 1990;113(9):664-670). It counts five bedside findings in an adult with acute respiratory symptoms, each worth 1 point: temperature above 37.8 C (100 F), heart rate above 100 beats per minute, crackles (rales), decreased breath sounds, and the absence of asthma (a patient without asthma scores the point). More points mean a higher probability of a radiographic pulmonary infiltrate and a stronger indication for a chest radiograph: roughly 0 to 1 point is low probability where imaging is often unnecessary, 2 to 3 is intermediate, and 4 to 5 is high. The original rule expresses probability through a prevalence-dependent nomogram rather than a fixed table, so the pooled observed frequencies sometimes quoted (about 3% at 0, 4% at 1, 14% at 2, 25% at 3, 60% at 4, 81% at 5) are approximate and shift with the local prevalence of pneumonia. It was derived in adults with acute respiratory illness in the emergency setting, is not intended for immunocompromised or neutropenic patients, and helps decide whether to image rather than diagnosing pneumonia by itself.';

// Pooled observed frequency of a radiographic infiltrate by score (approximate;
// prevalence-dependent). Source: pooled Heckerling cohorts (systematic review).
const APPROX_PCT = { 0: '3.2%', 1: '4.1%', 2: '13.5%', 3: '24.9%', 4: '59.6%', 5: '80.8%' };

const PREDICTORS = [
  { key: 'fever', label: 'temperature > 37.8 C (100 F)' },
  { key: 'tachycardia', label: 'heart rate > 100 /min' },
  { key: 'crackles', label: 'crackles (rales)' },
  { key: 'decreasedBreathSounds', label: 'decreased breath sounds' },
  { key: 'noAsthma', label: 'absence of asthma' },
];

function onFlag(v) {
  return v === true || v === 1 || v === '1' || v === 'on';
}

function band(score) {
  if (score <= 1) return { label: 'low probability', tier: 'low' };
  if (score <= 3) return { label: 'intermediate probability', tier: 'intermediate' };
  return { label: 'high probability', tier: 'high' };
}

export function heckerlingPneumonia(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let score = 0;
  const present = [];
  for (const p of PREDICTORS) {
    if (onFlag(o[p.key])) { score += 1; present.push(p.label); }
  }
  const b = band(score);
  return {
    valid: true,
    score,
    tier: b.tier,
    approxProbability: APPROX_PCT[score],
    // Highlight scores that are not in the low-probability (rule-out-imaging) band.
    abnormal: score >= 2,
    present,
    band: `Heckerling ${score}/5 — ${b.label} of a radiographic infiltrate (about ${APPROX_PCT[score]}, prevalence-dependent).`,
    detail: b.tier === 'low'
      ? 'Low probability; a chest radiograph is often unnecessary on clinical grounds alone.'
      : (b.tier === 'intermediate'
          ? 'Intermediate probability; a chest radiograph helps distinguish pneumonia from other causes.'
          : 'High probability; obtain a chest radiograph.'),
    note: HECKERLING_NOTE,
  };
}
