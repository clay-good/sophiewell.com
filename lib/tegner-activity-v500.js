// spec-v500: the Tegner activity scale (levels 0-10), the activity-level descriptor that accompanies the
// Lysholm knee score. The catalog already has `lysholm-knee-score`; Tegner and Lysholm published the two
// together in the same 1985 paper, and the pair is normally reported together - the score measures symptoms,
// the scale records the activity level those symptoms are measured against. "tegner" routed to nothing.
//
// This is an ACTIVITY-LEVEL descriptor, not a pathology grade: no level is "abnormal". It records what the
// patient does, not how bad a knee is.
//
// HIGH-STAKES: this reports the activity level the patient and clinician have agreed on, NOT a diagnosis, a
// return-to-sport clearance, or a prediction of what the knee will tolerate (spec-v11 section 5.3). The
// return-to-play decision stays with the treating clinician.
//
// LEVELS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Tegner Y, Lysholm J. Rating systems in the evaluation of knee ligament injuries. Clin Orthop Relat Res.
//     1985;(198):43-49.
//   - Sports-medicine references reproducing the same 0 (sick leave for knee problems) through 10 (national
//     elite competitive sport) ordering with the same work and sport anchors.
//
// Each level names the representative work and sport anchors the scale lists for it.

const LEVELS = {
  '0': { level: '0', text: 'Tegner level 0 - sick leave or a disability pension because of knee problems.' },
  '1': { level: '1', text: 'Tegner level 1 - sedentary work, such as secretarial work; walking on even ground possible.' },
  '2': { level: '2', text: 'Tegner level 2 - light labor; walking on uneven ground possible, but walking in a forest is not.' },
  '3': { level: '3', text: 'Tegner level 3 - light labor such as nursing; competitive or recreational swimming; walking in a forest possible.' },
  '4': { level: '4', text: 'Tegner level 4 - moderately heavy labor such as truck driving; recreational cycling, cross-country skiing, or jogging on even ground at least twice weekly.' },
  '5': { level: '5', text: 'Tegner level 5 - heavy labor such as construction; competitive cycling or cross-country skiing; recreational jogging on uneven ground at least twice weekly.' },
  '6': { level: '6', text: 'Tegner level 6 - recreational tennis, badminton, handball, racquetball, or downhill skiing; jogging at least five times weekly.' },
  '7': { level: '7', text: 'Tegner level 7 - competitive tennis, running, handball, or basketball; or recreational soccer, football, rugby, ice hockey, squash, racquetball, or running.' },
  '8': { level: '8', text: 'Tegner level 8 - competitive racquetball, bandy, squash, badminton, downhill skiing, or track and field jumping events.' },
  '9': { level: '9', text: 'Tegner level 9 - competitive soccer, football, or rugby in the lower divisions, ice hockey, wrestling, gymnastics, or basketball.' },
  '10': { level: '10', text: 'Tegner level 10 - competitive soccer, football, or rugby at the national elite level.' },
};

const NOTE = 'The Tegner activity scale (Tegner and Lysholm 1985) records a knee activity level from 0 to 10, and is normally reported alongside the Lysholm knee score: the score measures symptoms, the scale records the activity level those symptoms are measured against. 0 is sick leave or a disability pension because of knee problems; 10 is competitive sport at the national elite level. Each level names representative work and sport anchors. This records the activity level, not a diagnosis, a return-to-sport clearance, or a prediction of what the knee will tolerate.';

// input:
//   level: '0' through '10' (also accepts the numbers 0-10).
export function tegnerActivity(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const key = String(o.level == null ? '' : o.level).trim();
  const l = LEVELS[key];
  if (!l) {
    return { valid: false, message: 'Select the Tegner activity level (0 through 10).' };
  }
  return {
    valid: true,
    level: l.level,
    bandLabel: `Tegner level ${l.level}`,
    band: l.text,
    note: NOTE,
  };
}
