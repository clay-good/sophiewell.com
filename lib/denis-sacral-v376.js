// spec-v376: Denis classification of a sacral fracture (zones I-III), by the relationship of the
// fracture line to the sacral foramina and central canal — the standard anatomic zoning that predicts
// the neurologic-injury risk. It sits beside the pelvic/spine trauma tiles in the catalog. "denis" /
// "denis classification sacral" / "sacral fracture zone" routed to nothing.
//
// HIGH-STAKES: this reports the Denis ZONE the clinician has determined from the imaging, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// rising-neurologic-injury-risk association (I -> III) is the classically taught pattern, not an order;
// the management decision stays with the orthopedic / spine / trauma team.
//
// ZONES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Denis F, Davis S, Comfort T. Sacral fractures: an important problem. Retrospective analysis of 236
//     cases. Clin Orthop Relat Res. 1988;(227):67-81 (the three zones and their neurologic-injury rates).
//   - Orthopedic / spine references reproducing the same alar / foraminal / central-canal zoning and the
//     ~6% / ~28% / highest neurologic-injury gradient.
//
// Zones (relationship of the fracture line to the sacral foramina and central canal):
//   I   : alar region, LATERAL to the foramina; the lowest neurologic-injury rate (~6%, usually L5 or
//         sciatic).
//   II  : through the foramina; intermediate neurologic-injury rate (~28%, usually L5 / S1 / S2
//         radiculopathy). Flagged.
//   III : central sacral canal, MEDIAL to the foramina; the highest neurologic-injury rate (bowel,
//         bladder, and sexual dysfunction from cauda-equina involvement). Flagged.

const ZONES = {
  I: { zone: 'I', neuro: false, text: 'Denis zone I - the alar region, lateral to the sacral foramina; the lowest neurologic-injury rate (about 6%, usually the L5 or sciatic nerve).' },
  II: { zone: 'II', neuro: true, text: 'Denis zone II - through the sacral foramina; an intermediate neurologic-injury rate (about 28%, usually L5, S1, or S2 radiculopathy).' },
  III: { zone: 'III', neuro: true, text: 'Denis zone III - the central sacral canal, medial to the foramina; the highest neurologic-injury rate, including bowel, bladder, and sexual dysfunction from cauda-equina involvement.' },
};

const NOTE = 'The Denis classification (Denis 1988) zones a sacral fracture by the relationship of the fracture line to the sacral foramina and central canal. I: alar, lateral to the foramina (lowest neurologic-injury rate). II: through the foramina (intermediate; L5/S1/S2 radiculopathy). III: central canal, medial to the foramina (highest rate; bowel/bladder/sexual dysfunction). Neurologic-injury risk rises I to III, which is the classically taught pattern, not an order. This reports the zone the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III',
  1: 'I', 2: 'II', 3: 'III',
};

// input:
//   zone: 'I' / 'II' / 'III' (case-insensitive; also accepts 1-3)
export function denisSacral(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.zone == null ? '' : o.zone).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const z = ZONES[key];
  if (!z) {
    return { valid: false, message: 'Select the Denis zone (I, II, or III; equivalently 1-3).' };
  }
  return {
    valid: true,
    zone: z.zone,
    neuroRisk: z.neuro,
    abnormal: z.neuro,
    bandLabel: `Denis zone ${z.zone}`,
    band: z.text,
    note: NOTE,
  };
}
