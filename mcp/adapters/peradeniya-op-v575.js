// spec-v575 MCP wave: adapter for the POP scale in lib/peradeniya-op-v575.js. The dom keys mirror the
// browser renderer (views/group-v575.js) and META['peradeniya-op'].example.
//
// **THE HEART-RATE ROW HAS A HOLE AND BOTH SOURCES REPRODUCE IT IDENTICALLY.** Levels are above 60 = 0,
// 41-60 = 1, and BELOW 40 = 2. A heart rate of EXACTLY 40 is in none of them. That is the instrument, not a
// typo, and a rate of exactly 40 in a bradycardic poisoned patient is not contrived. The tool REFUSES it
// and names the hole rather than assigning it to whichever neighbour seems kinder.
//
// **THE PUPIL LEVELS OVERLAP ON THEIR FACE.** "Under 2 mm" scores 1 and "pinpoint" scores 2 - but a
// pinpoint pupil IS under 2 mm. Pinpoint takes PRECEDENCE; do not let a first-match rule decide.
//
// **FASCICULATION IS A TWO-ATTRIBUTE CONJUNCTION DRESSED AS A THREE-LEVEL SCALE.** 1 point = generalized OR
// continuous; 2 points = BOTH. It is not a severity ladder, and INTENSITY IS NOT THE AXIS - a patient with
// violent but localized twitching does not score 2. The tool takes the two attributes SEPARATELY.
//
// **THE MAXIMUM IS 11, NOT 12.** Five parameters score 0-2 but seizures scores 0-1 only. Assuming six
// symmetric items gives 12 and misplaces every band boundary.
//
// **IT MUST BE APPLIED BEFORE TREATMENT.** Atropine reverses miosis and bradycardia - two of the six
// parameters - so a post-atropine score is lower for reasons unrelated to the poisoning. A precondition,
// not an input, and the tool cannot verify it.
//
// **THIS IS NOT A DOSING INSTRUMENT.** Atropine titration in organophosphate poisoning is driven by
// secretions and oxygenation, not by any score. The tool does not indicate atropine, titrate it, or decide
// pralidoxime or intubation.

import * as P from '../../lib/peradeniya-op-v575.js';

export default [
  {
    id: 'peradeniya-op',
    summary: `The Peradeniya Organophosphorus Poisoning (POP) scale (Senanayake and colleagues 1993), which grades the SEVERITY of acute organophosphate poisoning. SIX PARAMETERS, MAXIMUM ${P.POP_MAX}. Bands: 0 to 3 mild, 4 to 7 moderate, 8 to ${P.POP_MAX} severe. PUPIL SIZE: 2 mm or more = 0; under 2 mm = 1; pinpoint = 2. RESPIRATORY RATE: under 20/min = 0; 20 or more = 1; 20 or more WITH CENTRAL CYANOSIS = 2. HEART RATE: above 60 = 0; 41 to 60 = 1; below 40 = 2. FASCICULATION: generalized OR continuous = 1; BOTH = 2. CONSCIOUSNESS: conscious and rational = 0; impaired response to verbal command = 1; no response = 2. SEIZURES: absent = 0; present = 1. **THE HEART-RATE ROW HAS A HOLE**: a rate of EXACTLY ${P.UNSCOREABLE_HEART_RATE} per minute falls in NO published level, since the levels are above 60, 41-60, and BELOW 40. Two independent reproductions print the table identically, so this is the instrument rather than one paper's typographic error, and a rate of exactly 40 in a bradycardic poisoned patient is not contrived. The tool REFUSES it and names the hole rather than assigning a neighbour. **THE PUPIL LEVELS OVERLAP ON THEIR FACE**: a pinpoint pupil IS under 2 mm, so the 1-point and 2-point levels are not mutually exclusive as written, and PINPOINT TAKES PRECEDENCE. **FASCICULATION IS A TWO-ATTRIBUTE CONJUNCTION DRESSED AS A THREE-LEVEL SCALE**, not a severity ladder: 1 point for generalized OR continuous and 2 only for BOTH, so INTENSITY IS NOT THE AXIS and a patient with violent but localized twitching does not score 2. The two attributes are supplied separately. **THE MAXIMUM IS ${P.POP_MAX}, NOT ${P.NAIVE_SYMMETRIC_MAX}**: five parameters score 0 to 2 but SEIZURES SCORES 0 OR 1 ONLY, so assuming six symmetric items misplaces every band boundary. **THE SCALE MUST BE APPLIED BEFORE TREATMENT**: atropine reverses miosis and bradycardia, two of the six parameters, so a patient scored after atropine scores lower for reasons unrelated to the poisoning. That is a precondition and cannot be verified from the inputs. This GRADES SEVERITY. It does NOT diagnose organophosphate poisoning and does not distinguish it from CARBAMATE poisoning, which presents almost identically while differing in the duration of enzyme inhibition and in whether pralidoxime is indicated, and it does not measure cholinesterase activity. **IT IS NOT A DOSING INSTRUMENT**: it does not indicate atropine, does not titrate it, and does not decide pralidoxime or intubation - atropine titration in these patients is driven by secretions and oxygenation rather than by any score, and treating this as a dosing tool is the use it would most damagingly be put to. Intermediate syndrome and delayed neuropathy develop later and are invisible to a scale applied at presentation.`,
    compute: P.peradeniyaOp,
    fields: [
      {
        dom: 'pop-pupil', arg: 'pupil', kind: 'enum',
        values: P.PUPIL_LEVELS.map((l) => l.value), required: true,
        label: `Pupil size. PINPOINT TAKES PRECEDENCE over "under 2 mm", which the published levels overlap [${P.PUPIL_LEVELS.map((l) => `${l.value} = ${l.text}, ${l.points} points`).join('; ')}]`,
      },
      {
        dom: 'pop-resp', arg: 'respiratory', kind: 'enum',
        values: P.RESPIRATORY_LEVELS.map((l) => l.value), required: true,
        label: `Respiratory rate [${P.RESPIRATORY_LEVELS.map((l) => `${l.value} = ${l.text}, ${l.points} points`).join('; ')}]`,
      },
      {
        dom: 'pop-hr', arg: 'heartRate', kind: 'number', unit: 'per minute', required: true,
        label: `Heart rate. Above 60 = 0; 41 to 60 = 1; below 40 = 2. EXACTLY ${P.UNSCOREABLE_HEART_RATE} falls in NO published level and is REFUSED.`,
      },
      {
        dom: 'pop-fasc-gen', arg: 'fasciculationGeneralized', kind: 'enum', values: ['no', 'yes'], required: true,
        label: 'Whether fasciculation is GENERALIZED. Combined with the continuous attribute as a conjunction: either alone scores 1, both score 2.',
      },
      {
        dom: 'pop-fasc-cont', arg: 'fasciculationContinuous', kind: 'enum', values: ['no', 'yes'], required: true,
        label: 'Whether fasciculation is CONTINUOUS. Combined with the generalized attribute as a conjunction: either alone scores 1, both score 2.',
      },
      {
        dom: 'pop-loc', arg: 'consciousness', kind: 'enum',
        values: P.CONSCIOUSNESS_LEVELS.map((l) => l.value), required: true,
        label: `Level of consciousness [${P.CONSCIOUSNESS_LEVELS.map((l) => `${l.value} = ${l.text}, ${l.points} points`).join('; ')}]`,
      },
      {
        dom: 'pop-seizures', arg: 'seizures', kind: 'enum',
        values: P.SEIZURE_LEVELS.map((l) => l.value), required: true,
        label: `Seizures. HALF WEIGHT: 0 or 1 only, which is why the maximum is ${P.POP_MAX} and not ${P.NAIVE_SYMMETRIC_MAX} [${P.SEIZURE_LEVELS.map((l) => `${l.value} = ${l.points} points`).join('; ')}]`,
      },
    ],
  },
];
