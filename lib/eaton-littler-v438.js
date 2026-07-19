// spec-v438: the Eaton-Littler classification of thumb carpometacarpal (trapeziometacarpal / basal-joint)
// osteoarthritis, by the radiographic joint findings — stages I / II / III / IV. It is a standard staging for
// thumb-base arthritis. "eaton littler" / "basal joint arthritis stage" routed to nothing.
//
// HIGH-STAKES: this reports the radiographic STAGE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// hand / orthopedic team.
//
// STAGES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Eaton RG, Littler JW. Ligament reconstruction for the painful thumb carpometacarpal joint. J Bone
//     Joint Surg Am. 1973;55(8):1655-1666 (refined by Eaton & Glickel 1987).
//   - Hand / orthopedic references reproducing the same normal/widened (I) / slight-narrowing (II) /
//     marked-narrowing (III) / pantrapezial (IV) staging.
//
// Stages (thumb-base radiographs):
//   I   : normal or slightly widened trapeziometacarpal (TM) joint (synovitis), no or less-than-one-third
//         subluxation, no osteophytes.
//   II  : slight narrowing of the TM joint, joint debris or osteophytes less than 2 mm, subluxation up to
//         one-third.
//   III : marked narrowing of the TM joint with cystic / sclerotic change, osteophytes 2 mm or larger,
//         subluxation greater than one-third; the scaphotrapezial joint is spared.
//   IV  : pantrapezial arthritis - the TM joint and the scaphotrapezial joint are both involved.

const STAGES = {
  I: { stage: 'I', text: 'Eaton-Littler stage I - normal or slightly widened TM joint (synovitis), no or less-than-one-third subluxation, no osteophytes.' },
  II: { stage: 'II', text: 'Eaton-Littler stage II - slight narrowing of the TM joint, joint debris or osteophytes less than 2 mm, subluxation up to one-third.' },
  III: { stage: 'III', text: 'Eaton-Littler stage III - marked narrowing of the TM joint with cystic / sclerotic change, osteophytes 2 mm or larger, subluxation greater than one-third; the scaphotrapezial joint is spared.' },
  IV: { stage: 'IV', text: 'Eaton-Littler stage IV - pantrapezial arthritis: the TM joint and the scaphotrapezial joint are both involved.' },
};

const NOTE = 'The Eaton-Littler classification (Eaton & Littler 1973) stages thumb carpometacarpal (basal-joint) osteoarthritis by the radiographic findings. I: normal or slightly widened joint (synovitis). II: slight narrowing, osteophytes <2 mm, subluxation up to 1/3. III: marked narrowing, osteophytes >=2 mm, subluxation >1/3, scaphotrapezial joint spared. IV: pantrapezial arthritis. This reports the stage the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   stage: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4).
export function eatonLittler(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.stage == null ? '' : o.stage).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const s = STAGES[key];
  if (!s) {
    return { valid: false, message: 'Select the Eaton-Littler stage (I, II, III, or IV).' };
  }
  return {
    valid: true,
    stage: s.stage,
    bandLabel: `Eaton-Littler stage ${s.stage}`,
    band: s.text,
    note: NOTE,
  };
}
