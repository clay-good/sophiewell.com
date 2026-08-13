// spec-v713: Edmonton Obesity Staging System (EOSS).
//
// A five-stage (0-4) clinical staging of obesity by its actual health impact rather than BMI.
// The overall stage is the most severe of three domains (most-severe-domain-wins). Source:
//   Sharma AM, Kushner RF. A proposed clinical staging system for obesity. Int J Obes (Lond).
//   2009;33(3):289-295. (PMID 19188927.)
//
// Three domains, each rated 0-4 by clinical judgment:
//   Medical (obesity-related risk factors / comorbidities)
//   Functional (physical symptoms / functional limitations)
//   Mental (psychological symptoms)
//
// Stage definitions (applied per domain; the overall stage is the maximum):
//   0 - no risk factors, symptoms, limitations, or psychopathology
//   1 - subclinical risk factors, mild symptoms, or mild psychological symptoms
//   2 - established obesity-related comorbidity requiring intervention, or moderate limitation
//   3 - end-organ damage, significant psychopathology, or significant functional limitation
//   4 - severe (potentially end-stage) disability from obesity-related chronic disease
//
// Higher stage = greater mortality risk and a stronger indication for aggressive treatment.
// Staging is by clinical judgment, not BMI. Pure: no DOM, no clock, no network.

export const EOSS_NOTE = 'Edmonton Obesity Staging System (EOSS) (Sharma AM, Kushner RF, Int J Obes 2009;33(3):289-295), a five-stage clinical staging of obesity by its actual health impact rather than by body mass index. Three domains are each rated from 0 to 4 by clinical judgment - a medical domain of obesity-related risk factors and comorbidities, a functional domain of physical symptoms and functional limitations, and a mental domain of psychological symptoms - and the overall stage is the most severe of the three. Stage 0 has no risk factors, symptoms, limitations, or psychopathology; stage 1 has subclinical risk factors or mild symptoms; stage 2 has an established obesity-related comorbidity requiring intervention or a moderate limitation; stage 3 has end-organ damage, significant psychopathology, or significant functional limitation; and stage 4 has severe, potentially end-stage disability from obesity-related chronic disease. A higher stage carries greater mortality risk and a stronger indication for aggressive treatment. It stages severity to guide management and is not a substitute for the full clinical assessment; it supports rather than replaces clinical judgment.';

function optIn(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0 || n > 4) return null;
  return n;
}

const DOMAINS = ['medical', 'functional', 'mental'];
const STAGE_LABEL = {
  0: 'no obesity-related health impact',
  1: 'subclinical risk factors or mild symptoms',
  2: 'established obesity-related comorbidity',
  3: 'end-organ damage or significant limitation',
  4: 'severe (potentially end-stage) disability',
};

export function eoss(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const stages = [];
  for (const d of DOMAINS) {
    const v = optIn(o[d]);
    if (v === null) {
      return { valid: false, code: 'MISSING_INPUT', field: d, message: `Rate the ${d} domain from 0 to 4.`, note: EOSS_NOTE };
    }
    stages.push(v);
  }

  const stage = Math.max(...stages);
  return {
    valid: true,
    stage,
    tier: `stage-${stage}`,
    // Established comorbidity or worse (>= 2) is the actionable threshold.
    abnormal: stage >= 2,
    bandLabel: `EOSS stage ${stage}`,
    band: `EOSS stage ${stage} — ${STAGE_LABEL[stage]}.`,
    detail: `Stage = the most severe domain (medical ${stages[0]}, functional ${stages[1]}, mental ${stages[2]}). Higher stage = greater mortality risk and a stronger indication for aggressive treatment. Staging is by clinical judgment, not BMI.`,
    note: EOSS_NOTE,
  };
}
