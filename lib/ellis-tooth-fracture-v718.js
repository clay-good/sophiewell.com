// spec-v718: Ellis classification of anterior (crown) tooth fracture.
//
// A simple emergency-department classification of traumatic crown fractures by the deepest
// dental tissue involved. Source:
//   Ellis RG, Davey KW. The Classification and Treatment of Injuries to the Teeth of Children.
//   5th ed. Chicago: Year Book Medical Publishers; 1970. (The 3-class ED form; the extended
//   Ellis IV-IX scheme is inconsistently defined and is deliberately excluded.)
//
// Decision logic on the deepest layer involved:
//   Class I   = fracture through enamel only (rough edge, non-tender, no color change)
//   Class II  = enamel + dentin exposed (yellow dentin visible; sensitive to hot/cold/air)
//   Class III = enamel + dentin + pulp exposed (pink/red or bleeding at the center; very
//               sensitive) -- a dental emergency.
//
// Returns the class code and management urgency. Pure: no DOM, no clock, no network.

export const ELLIS_NOTE = 'Ellis classification of anterior crown tooth fracture (Ellis RG, Davey KW, The Classification and Treatment of Injuries to the Teeth of Children, 5th ed, 1970), a simple emergency classification of traumatic crown fractures by the deepest dental tissue involved. Class I is a fracture through the enamel only, giving a rough edge that is non-tender with no color change. Class II involves the enamel and dentin, so yellow dentin is visible and the tooth is sensitive to hot, cold, and air. Class III involves the enamel, dentin, and pulp, showing a pink, red, or bleeding center that is very sensitive and is a dental emergency requiring urgent dental referral. Only the three-class emergency form is used, since the extended Ellis IV to IX scheme is inconsistently defined across sources. It classifies the injury to guide urgency, not the definitive dental treatment, and it supports rather than replaces dental evaluation and clinical judgment.';

const CLASS = {
  enamel: { code: 'I', label: 'fracture through enamel only', urgency: 'non-urgent; smooth the rough edge, routine dental follow-up' },
  dentin: { code: 'II', label: 'enamel and dentin exposed', urgency: 'cover exposed dentin; prompt (24-48 h) dental referral' },
  pulp: { code: 'III', label: 'enamel, dentin, and pulp exposed', urgency: 'dental emergency; urgent dental referral for pulp exposure' },
};

export function ellisToothFracture(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const layer = o.deepestLayer;
  if (!(layer === 'enamel' || layer === 'dentin' || layer === 'pulp')) {
    return { valid: false, code: 'MISSING_INPUT', field: 'deepestLayer', message: 'Select the deepest tissue layer involved (enamel, dentin, or pulp).', note: ELLIS_NOTE };
  }

  const c = CLASS[layer];
  const emergency = layer === 'pulp';
  return {
    valid: true,
    ellisClass: c.code,
    tier: `class-${c.code.toLowerCase()}`,
    abnormal: emergency,
    bandLabel: `Ellis Class ${c.code}`,
    band: `Ellis Class ${c.code} — ${c.label}.`,
    detail: `${c.urgency}. Class I enamel only; Class II enamel + dentin (sensitive); Class III pulp exposed (emergency).`,
    note: ELLIS_NOTE,
  };
}
