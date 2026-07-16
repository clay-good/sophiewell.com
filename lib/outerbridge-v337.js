// spec-v337: Outerbridge classification of articular (chondral) cartilage damage, grades 0-IV. The
// arthroscopic / operative grading of chondromalacia — how far a cartilage lesion has progressed,
// from softening (I) through partial- and full-thickness fissuring (II-III) to exposed subchondral
// bone (IV). It is the arthroscopic-cartilage companion to the Kellgren-Lawrence radiographic
// osteoarthritis grade already in the catalog (KL grades the X-ray; Outerbridge grades the cartilage
// seen at arthroscopy). "outerbridge" / "chondromalacia grade" routed to nothing.
//
// HIGH-STAKES: this reports the cartilage GRADE the surgeon has determined at arthroscopy, NOT a
// diagnosis, a surgical recommendation, or an outcome prediction for an individual patient
// (spec-v11 §5.3). The cartilage-repair / management decision stays with the surgeon and the patient.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Outerbridge RE. The etiology of chondromalacia patellae. J Bone Joint Surg Br.
//     1961;43-B(4):752-757 (the original 0-IV grading; the II/III split is by lesion DIAMETER,
//     1.5 cm).
//   - "Classifications in Brief: Outerbridge Classification of Chondral Lesions" (Clin Orthop Relat
//     Res 2018) reproducing the same grade definitions and noting the widely used modified
//     (depth-based) version.
//
// Grades (original 1961):
//   0  : normal cartilage.
//   I  : cartilage softening and swelling (intact surface).
//   II : partial-thickness defect with surface fissures that do NOT reach subchondral bone and do
//        NOT exceed 1.5 cm in diameter.
//   III: fissuring to the level of subchondral bone in an area MORE than 1.5 cm in diameter.
//   IV : cartilage worn through to exposed subchondral bone (full-thickness loss).

const GRADES = {
  0: { grade: '0', full: false, text: 'Outerbridge grade 0 — normal articular cartilage.' },
  I: { grade: 'I', full: false, text: 'Outerbridge grade I — softening and swelling of the cartilage (surface intact).' },
  II: { grade: 'II', full: false, text: 'Outerbridge grade II — partial-thickness defect with surface fissures that do not reach subchondral bone and do not exceed 1.5 cm in diameter.' },
  III: { grade: 'III', full: false, text: 'Outerbridge grade III — fissuring to the level of subchondral bone in an area more than 1.5 cm in diameter (deep, not yet full-thickness).' },
  IV: { grade: 'IV', full: true, text: 'Outerbridge grade IV — cartilage worn through to exposed subchondral bone (full-thickness cartilage loss).' },
};

const NOTE = 'Outerbridge classification (Outerbridge 1961) grades articular cartilage damage seen at arthroscopy. 0: normal. I: softening/swelling. II: partial-thickness fissures not reaching bone and <=1.5 cm. III: fissuring to subchondral bone, >1.5 cm diameter. IV: exposed subchondral bone (full-thickness loss). The original grades split II from III by lesion DIAMETER (1.5 cm); a widely used modified version splits them by DEPTH (<50% vs >50% of cartilage thickness) instead. Outerbridge grades the cartilage directly (arthroscopy), complementing the Kellgren-Lawrence radiographic osteoarthritis grade. This reports the grade the surgeon has determined, not a diagnosis, a surgical recommendation, or an outcome prediction.';

const ALIAS = { 0: '0', 1: 'I', 2: 'II', 3: 'III', 4: 'IV', '0': '0', I: 'I', II: 'II', III: 'III', IV: 'IV' };

// input:
//   grade: 0-IV (roman I-IV or numeric 0-4; case-insensitive)
export function outerbridge(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Outerbridge grade (0, I, II, III, or IV).' };
  }
  return {
    valid: true,
    grade: g.grade,
    fullThickness: g.full,
    abnormal: g.full,
    bandLabel: `Outerbridge grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}
