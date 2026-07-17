// spec-v386: Pirani score for the severity of a congenital (idiopathic) clubfoot — six clinical signs,
// each scored 0 / 0.5 / 1, split into a midfoot and a hindfoot contracture score, widely used to grade
// and track clubfoot during Ponseti casting. It is the companion to the other pediatric-foot / Ponseti
// references and sits beside the fracture/severity tiles in the catalog. "pirani" / "clubfoot severity
// score" routed to nothing.
//
// HIGH-STAKES: this reports the Pirani SCORE from the six signs the clinician has assessed, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). Higher =
// more severe deformity; the midfoot/hindfoot split classically informs Ponseti casting and the timing
// of a tenotomy, but that decision stays with the treating orthopedic team.
//
// ITEMS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Pirani S, Outerbridge H, Sawatsky B, Stothers K. A method of evaluating the virgin clubfoot
//     (the Pirani scoring system).
//   - Dyer PJ, Davis N. The role of the Pirani scoring system in the management of club foot by the
//     Ponseti method. J Bone Joint Surg Br. 2006;88(8):1082-1084 (six signs, each 0/0.5/1; midfoot +
//     hindfoot contracture scores, total 0-6).
//
// Six signs, each 0 (normal) / 0.5 (moderate) / 1 (severe abnormality):
//   Midfoot Contracture Score (MFCS, 0-3): curvature of the lateral border (CLB), medial crease (MC),
//     position of the lateral head of the talus (LHT).
//   Hindfoot Contracture Score (HFCS, 0-3): posterior crease (PC), emptiness of the heel (EH), rigidity
//     of the equinus (RE).
//   Total = MFCS + HFCS (0-6).

const SIGNS = ['clb', 'mc', 'lht', 'pc', 'eh', 're'];
const ALLOWED = new Set([0, 0.5, 1]);

function sign(o, key) {
  const raw = String(o[key] == null ? '' : o[key]).trim();
  if (raw === '') return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || !ALLOWED.has(n)) return NaN;
  return n;
}

// input (each 0 / 0.5 / 1):
//   clb, mc, lht  — midfoot signs (curved lateral border, medial crease, lateral head of talus)
//   pc, eh, re    — hindfoot signs (posterior crease, empty heel, rigid equinus)
export function piraniClubfoot(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vals = {};
  for (const k of SIGNS) {
    const v = sign(o, k);
    if (v === null) return { valid: false, message: 'Score all six Pirani signs (each 0, 0.5, or 1).' };
    if (Number.isNaN(v)) return { valid: false, message: 'Each Pirani sign must be 0, 0.5, or 1.' };
    vals[k] = v;
  }
  const mfcs = vals.clb + vals.mc + vals.lht;
  const hfcs = vals.pc + vals.eh + vals.re;
  const total = mfcs + hfcs;
  const band = `Pirani total ${total} of 6 (midfoot ${mfcs} of 3, hindfoot ${hfcs} of 3). Higher = more severe deformity.`;
  return {
    valid: true,
    total,
    midfootScore: mfcs,
    hindfootScore: hfcs,
    bandLabel: `Pirani ${total}/6`,
    band,
    note: 'The Pirani score grades clubfoot severity from six signs (each 0/0.5/1): a Midfoot Contracture Score (curved lateral border, medial crease, lateral head of the talus) and a Hindfoot Contracture Score (posterior crease, empty heel, rigid equinus), total 0-6. Higher = more severe. The midfoot/hindfoot split classically informs Ponseti casting and the timing of a tenotomy, but this reports the score, not a diagnosis, a treatment decision, or a prognosis.',
  };
}
