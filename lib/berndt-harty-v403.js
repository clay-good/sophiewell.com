// spec-v403: Berndt-Harty classification of an osteochondral lesion (transchondral fracture) of the talus,
// by the radiographic stage of the fragment — stages I / II / III / IV. It complements the ankle/foot
// orthopedic tiles (the Danis-Weber and Lauge-Hansen ankle-fracture classifications). "berndt harty" /
// "osteochondral lesion of the talus" / "talus OCD stage" routed to nothing.
//
// HIGH-STAKES: this reports the radiographic STAGE the clinician has determined from imaging, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The stage
// informs whether the fragment is stable or displaced, but the management decision stays with the
// orthopedic / foot-and-ankle team.
//
// STAGES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Berndt AL, Harty M. Transchondral fractures (osteochondritis dissecans) of the talus. J Bone Joint
//     Surg Am. 1959;41-A:988-1020 (the original radiographic I-IV staging).
//   - Orthopedic / radiology references reproducing the same subchondral-compression (I) /
//     partial-detachment (II) / detached-non-displaced (III) / displaced (IV) staging.
//
// Stages (radiographic appearance of the osteochondral fragment):
//   I   : small area of subchondral compression (trabecular compression); the overlying cartilage is
//         intact.
//   II  : partially detached osteochondral fragment (incomplete separation).
//   III : completely detached fragment remaining in the crater, without displacement (in situ).
//   IV  : displaced osteochondral fragment (a loose body).

const STAGES = {
  I: { stage: 'I', text: 'Berndt-Harty stage I - a small area of subchondral compression (trabecular compression); the overlying cartilage is intact.' },
  II: { stage: 'II', text: 'Berndt-Harty stage II - a partially detached osteochondral fragment (incomplete separation).' },
  III: { stage: 'III', text: 'Berndt-Harty stage III - a completely detached fragment remaining in the crater, without displacement (in situ).' },
  IV: { stage: 'IV', text: 'Berndt-Harty stage IV - a displaced osteochondral fragment (a loose body).' },
};

const NOTE = 'The Berndt-Harty classification (Berndt-Harty 1959) stages an osteochondral lesion (transchondral fracture) of the talus by the radiographic appearance of the fragment. I: subchondral compression, cartilage intact. II: partial detachment. III: complete detachment, non-displaced (in situ). IV: displaced fragment / loose body. The stage informs whether the fragment is stable or displaced, but this reports the stage the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   stage: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4).
export function berndtHarty(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.stage == null ? '' : o.stage).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const s = STAGES[key];
  if (!s) {
    return { valid: false, message: 'Select the Berndt-Harty stage (I, II, III, or IV).' };
  }
  return {
    valid: true,
    stage: s.stage,
    bandLabel: `Berndt-Harty stage ${s.stage}`,
    band: s.text,
    note: NOTE,
  };
}
