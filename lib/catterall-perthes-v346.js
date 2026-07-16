// spec-v346: Catterall classification of Legg-Calve-Perthes disease (groups I-IV) — grades the
// childhood osteonecrosis of the femoral head (Perthes disease) by how much of the capital femoral
// epiphysis is involved at the fragmentation stage, which carries the prognosis. The catalog carries
// the Ficat-Arlet (adult femoral-head AVN) and Lichtman (lunate AVN) staging systems but had no
// Perthes classification. "catterall classification" / "perthes disease group" routed to nothing.
//
// HIGH-STAKES: this reports the Catterall GROUP the clinician has determined from the imaging, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// containment-vs-observation management gradient each group carries is the classically taught
// association, not an order; the "head-at-risk" signs (Gage sign, lateral subluxation, calcification
// lateral to the epiphysis, a horizontal physis) are separate modifiers, not group inputs; and the
// decision stays with the pediatric orthopedic surgeon.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Catterall A. The natural history of Perthes' disease. J Bone Joint Surg Br. 1971;53(1):37-53
//     (the four groups by epiphyseal involvement).
//   - Pediatric-orthopedic references (Radiopaedia / POSNA study guide / review articles)
//     reproducing the same group-I-IV femoral-head-involvement definitions.
//
// Groups (capital femoral epiphysis involved):
//   I  : only the anterior part of the epiphysis. No sequestrum; the best prognosis (often needs no
//        specific treatment if motion is normal).
//   II : the anterior and central epiphysis, with a sequestrum; the medial and lateral pillars
//        (columns) are preserved.
//   III: most of the epiphysis is involved, only a small medial and lateral part uninvolved (the
//        "head within a head" appearance). Flagged.
//   IV : the entire epiphysis is involved. The most extensive involvement. Flagged.

const GROUPS = {
  I: { group: 'I', extensive: false, text: 'Catterall group I — only the anterior part of the capital femoral epiphysis is involved; no sequestrum. The best prognosis; often needs no specific treatment if motion is normal.' },
  II: { group: 'II', extensive: false, text: 'Catterall group II — the anterior and central epiphysis is involved, with a sequestrum; the medial and lateral pillars are preserved.' },
  III: { group: 'III', extensive: true, text: 'Catterall group III — most of the epiphysis is involved, with only a small medial and lateral part uninvolved (the "head within a head" appearance). More extensive involvement.' },
  IV: { group: 'IV', extensive: true, text: 'Catterall group IV — the entire capital femoral epiphysis is involved. The most extensive involvement.' },
};

const NOTE = 'The Catterall classification (Catterall 1971) grades Legg-Calve-Perthes disease (childhood osteonecrosis of the femoral head) by how much of the capital femoral epiphysis is involved at fragmentation. I: anterior epiphysis only (best prognosis). II: anterior and central, sequestrum, pillars preserved. III: most of the epiphysis ("head within a head"). IV: the entire epiphysis. More extensive involvement (III-IV) classically carries a worse prognosis. The "head-at-risk" signs (Gage sign, lateral subluxation, calcification lateral to the epiphysis, a horizontal physis) are separate modifiers, not group inputs. The management gradient is the classically taught association, not an order; the decision stays with the pediatric orthopedic surgeon. This reports the group the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', I: 'I', II: 'II', III: 'III', IV: 'IV' };

// input:
//   group: 'I' .. 'IV' (case-insensitive; also accepts 1-4)
export function catterallPerthes(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.group == null ? '' : o.group).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = GROUPS[key];
  if (!t) {
    return { valid: false, message: 'Select the Catterall group (I, II, III, or IV).' };
  }
  return {
    valid: true,
    group: t.group,
    extensive: t.extensive,
    abnormal: t.extensive,
    bandLabel: `Catterall group ${t.group}`,
    band: t.text,
    note: NOTE,
  };
}
