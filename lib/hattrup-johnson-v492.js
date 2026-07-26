// spec-v492: the Hattrup-Johnson classification of hallux rigidus (first metatarsophalangeal osteoarthritis),
// by the radiographic osteophyte formation and joint-space change - grades I / II / III. It joins the foot
// tiles. "hattrup johnson" / "hallux rigidus grade" routed to nothing.
//
// HIGH-STAKES: this reports the radiographic GRADE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 section 5.3). The management decision stays with
// the orthopedic / foot-and-ankle team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Hattrup SJ, Johnson KA. Subjective results of hallux rigidus following treatment with cheilectomy.
//     Clin Orthop Relat Res. 1988;(226):182-191.
//   - Foot-and-ankle references reproducing the same mild-osteophyte-preserved-space (I) /
//     moderate-osteophytes-narrowing (II) / severe-osteophytes-space-loss (III) grouping.
//
// Grades (osteophyte and joint-space change at the first MTP joint):
//   I   : mild - a dorsal osteophyte with a well-preserved joint space and minimal narrowing.
//   II  : moderate - dorsal, medial, and lateral osteophytes with joint-space narrowing and subchondral
//         sclerosis.
//   III : severe - marked osteophytes with loss or obliteration of the joint space, often with subchondral
//         cysts.

const GRADES = {
  I: { grade: 'I', text: 'Hattrup-Johnson grade I - mild: a dorsal osteophyte with a well-preserved joint space and minimal narrowing.' },
  II: { grade: 'II', text: 'Hattrup-Johnson grade II - moderate: dorsal, medial, and lateral osteophytes with joint-space narrowing and subchondral sclerosis.' },
  III: { grade: 'III', text: 'Hattrup-Johnson grade III - severe: marked osteophytes with loss or obliteration of the joint space, often with subchondral cysts.' },
};

const NOTE = 'The Hattrup-Johnson classification (Hattrup and Johnson 1988) grades hallux rigidus (first MTP osteoarthritis) radiographically. I: mild, a dorsal osteophyte with a preserved joint space. II: moderate, dorsal/medial/lateral osteophytes with joint-space narrowing and sclerosis. III: severe, marked osteophytes with joint-space loss and subchondral cysts. This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III',
  1: 'I', 2: 'II', 3: 'III',
};

// input:
//   grade: 'I' / 'II' / 'III' (case-insensitive; also accepts 1-3).
export function hattrupJohnson(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Hattrup-Johnson grade (I, II, or III).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Hattrup-Johnson grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}
