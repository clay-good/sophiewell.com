// spec-v358: Ramsay Sedation Scale (levels 1-6) — the original, still widely used clinical scale for
// the depth of sedation, graded from agitation (1) to no response (6). The catalog carries the RASS
// (Richmond) and SAS/Riker sedation scales but not the Ramsay scale they descend from. "ramsay
// sedation scale" / "ramsay score" / "sedation level" routed to nothing.
//
// HIGH-STAKES: this reports the Ramsay LEVEL the clinician has determined at the bedside, NOT a
// diagnosis, a sedation-titration order, or a target (the sedation target depends on the clinical
// context and local protocol; spec-v11 §5.3). The titration decision stays with the treating clinician.
//
// LEVELS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Ramsay MA, Savege TM, Simpson BR, Goodwin R. Controlled sedation with alphaxalone-alphadolone.
//     Br Med J. 1974;2(5920):656-659 (the original six-level scale).
//   - ICU / anesthesia references reproducing the same awake (1-3) / asleep (4-6) level definitions.
//
// Levels (depth of sedation; higher = more sedated):
//   1 : anxious, agitated, or restless (awake). Flagged (agitation / under-sedation).
//   2 : cooperative, oriented, and tranquil (awake).
//   3 : responsive to commands only (awake).
//   4 : asleep, brisk response to a light glabellar tap or loud auditory stimulus.
//   5 : asleep, sluggish response to a light glabellar tap or loud auditory stimulus. Flagged (deep).
//   6 : asleep, no response to a light glabellar tap or loud auditory stimulus. Flagged (deep).

const LEVELS = {
  1: { level: 1, state: 'awake', flag: true, text: 'Ramsay level 1 - anxious, agitated, or restless (awake). Agitation / under-sedation.' },
  2: { level: 2, state: 'awake', flag: false, text: 'Ramsay level 2 - cooperative, oriented, and tranquil (awake).' },
  3: { level: 3, state: 'awake', flag: false, text: 'Ramsay level 3 - responsive to commands only (awake).' },
  4: { level: 4, state: 'asleep', flag: false, text: 'Ramsay level 4 - asleep with a brisk response to a light glabellar tap or loud auditory stimulus.' },
  5: { level: 5, state: 'asleep', flag: true, text: 'Ramsay level 5 - asleep with a sluggish response to a light glabellar tap or loud auditory stimulus. Deep sedation.' },
  6: { level: 6, state: 'asleep', flag: true, text: 'Ramsay level 6 - asleep with no response to a light glabellar tap or loud auditory stimulus. Deep sedation.' },
};

const NOTE = 'The Ramsay Sedation Scale (Ramsay 1974) grades the depth of sedation from 1 to 6. Awake: 1 anxious / agitated / restless; 2 cooperative, oriented, tranquil; 3 responds to commands only. Asleep: 4 brisk response to a glabellar tap or loud auditory stimulus; 5 sluggish response; 6 no response. Level 1 (agitation) and levels 5-6 (deep sedation) fall outside the cooperative-to-lightly-sedated range (2-4); the sedation target itself depends on the clinical context and local protocol. This reports the level the clinician has determined, not a diagnosis, a titration order, or a target.';

// input:
//   level: 1-6 (string or number)
export function ramsaySedation(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.level == null ? '' : o.level).trim();
  const l = Object.prototype.hasOwnProperty.call(LEVELS, raw) ? LEVELS[raw] : null;
  if (!l) {
    return { valid: false, message: 'Select the Ramsay level (1 to 6).' };
  }
  return {
    valid: true,
    level: l.level,
    state: l.state,
    outsideTarget: l.flag,
    abnormal: l.flag,
    bandLabel: `Ramsay level ${l.level}`,
    band: l.text,
    note: NOTE,
  };
}
