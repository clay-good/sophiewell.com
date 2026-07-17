// spec-v377: Gartland classification of a pediatric EXTENSION-type supracondylar humerus fracture
// (types I-III, plus the modified type IV) — the standard classification for the most common pediatric
// elbow fracture, graded by displacement and the integrity of the cortical/periosteal hinge. It sits
// beside the other fracture-eponym tiles in the catalog. "gartland" / "supracondylar humerus fracture
// classification" routed to nothing.
//
// HIGH-STAKES: this reports the Gartland TYPE the clinician has determined from the imaging, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// rising-instability association (I -> IV) is the classically taught pattern, not an order; the
// management decision (nonoperative vs closed reduction and pinning vs open) stays with the orthopedic /
// trauma team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Gartland JJ. Management of supracondylar fractures of the humerus in children. Surg Gynecol
//     Obstet. 1959;109(2):145-154 (the original extension-type I/II/III).
//   - Wilkins KE (1984): subdivided type II into IIA (rotationally stable) / IIB (rotationally
//     malaligned) by posterior cortical contact.
//   - Leitch KK, Kay RM, Femino JD, et al. Treatment of multidirectionally unstable supracondylar
//     humeral fractures in children. A modified Gartland type-IV fracture. J Bone Joint Surg Am.
//     2006;88(5):980-985 (type IV: complete periosteal disruption, unstable in both flexion and
//     extension).
//   - Alton TB, Werner SE, Gee AO. Classifications in brief: the Gartland classification of
//     supracondylar humerus fractures. Clin Orthop Relat Res. 2015;473(2):738-741.
//
// Types (extension-type; displacement / hinge integrity):
//   I   : nondisplaced (or minimally displaced); the anterior humeral line passes through the
//         capitellum; stable.
//   II  : displaced with an intact posterior cortical hinge; the anterior humeral line passes anterior to
//         the capitellum. Wilkins IIA is rotationally stable; IIB is rotationally malaligned. Flagged.
//   III : completely displaced, no cortical contact between the fragments. Flagged.
//   IV  : (modified, Leitch) multidirectional instability with complete periosteal disruption; unstable
//         in both flexion and extension. Flagged.

const TYPES = {
  I: { type: 'I', displaced: false, text: 'Gartland type I - a nondisplaced (or minimally displaced) extension-type fracture; the anterior humeral line passes through the capitellum. A stable injury.' },
  II: { type: 'II', displaced: true, text: 'Gartland type II - displaced with an intact posterior cortical hinge; the anterior humeral line passes anterior to the capitellum. Wilkins IIA is rotationally stable, IIB is rotationally malaligned.' },
  III: { type: 'III', displaced: true, text: 'Gartland type III - completely displaced, with no cortical contact between the fragments.' },
  IV: { type: 'IV', displaced: true, text: 'Gartland type IV (modified, Leitch) - multidirectional instability with complete periosteal disruption; unstable in both flexion and extension.' },
};

const NOTE = 'The Gartland classification (Gartland 1959; modified type IV, Leitch 2006) grades a pediatric extension-type supracondylar humerus fracture by displacement and hinge integrity. I: nondisplaced, anterior humeral line through the capitellum (stable). II: displaced with an intact posterior cortical hinge (Wilkins IIA stable / IIB malrotated). III: completely displaced, no cortical contact. IV: multidirectional instability, complete periosteal disruption. Instability rises I to IV, which is the classically taught pattern, not an order. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
  IIA: 'II', IIB: 'II', '2A': 'II', '2B': 'II',
};

// input:
//   type: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4, and IIA/IIB -> II)
export function gartlandSupracondylar(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Gartland type (I, II, III, or IV; equivalently 1-4).' };
  }
  return {
    valid: true,
    type: t.type,
    displaced: t.displaced,
    abnormal: t.displaced,
    bandLabel: `Gartland type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
