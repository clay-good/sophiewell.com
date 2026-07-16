// spec-v344: Ficat-Arlet staging of osteonecrosis (avascular necrosis, AVN) of the femoral head
// (stages 0-IV) — the classic radiographic staging that grades AVN of the hip by its plain-film /
// MRI appearance, from a silent pre-radiographic hip through subchondral collapse to secondary
// osteoarthritis. The catalog carries the Hawkins talar-neck classification (which reports AVN risk)
// and the Kellgren-Lawrence osteoarthritis grade but had no femoral-head AVN staging system.
// "ficat classification" / "avascular necrosis staging hip" routed to nothing.
//
// HIGH-STAKES: this reports the Ficat-Arlet STAGE the clinician has determined from the imaging, NOT
// a diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// pre-collapse (0-II) vs post-collapse (III-IV) distinction is the classically taught
// joint-preservation-vs-replacement watershed, not an order; the management decision stays with the
// surgeon.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Ficat RP. Idiopathic bone necrosis of the femoral head. Early diagnosis and treatment. J Bone
//     Joint Surg Br. 1985;67(1):3-9.
//   - Ficat RP, Arlet J. Ischemia and necroses of bone. Baltimore: Williams & Wilkins; 1980.
//   - Hip-imaging references (Radiopaedia / musculoskeletal-radiology reviews) reproducing the same
//     modified 0-IV stages (with the IIA/IIB subdivision).
//
// Stages (radiographic appearance):
//   0  : silent hip — pre-clinical and pre-radiographic; normal X-ray (often diagnosed on the
//        contralateral hip); MRI may be abnormal.
//   I  : pre-radiographic — normal X-ray; MRI or bone scan abnormal; the hip may be symptomatic.
//   II : pre-collapse — X-ray shows sclerosis and/or subchondral cysts / osteopenia, with the
//        femoral head sphericity preserved (no collapse). IIA sclerosis / cysts; IIB crescent sign /
//        subchondral fracture (the transition).
//   III: collapse — subchondral collapse (crescent sign) with femoral-head flattening / loss of
//        sphericity; the joint space is preserved. Flagged.
//   IV : end-stage — secondary osteoarthritis with joint-space narrowing and acetabular changes;
//        femoral-head collapse. Flagged.

const STAGES = {
  0: { stage: '0', collapse: false, text: 'Ficat-Arlet stage 0 — silent hip: pre-clinical and pre-radiographic. The X-ray is normal (often diagnosed on the contralateral hip); MRI may be abnormal.' },
  I: { stage: 'I', collapse: false, text: 'Ficat-Arlet stage I — pre-radiographic: the X-ray is normal, but MRI or bone scan is abnormal. The hip may be symptomatic.' },
  II: { stage: 'II', collapse: false, text: 'Ficat-Arlet stage II — pre-collapse: the X-ray shows sclerosis and/or subchondral cysts, with the femoral-head sphericity preserved (no collapse). IIA sclerosis / cysts; IIB crescent sign / subchondral fracture (the transition).' },
  III: { stage: 'III', collapse: true, text: 'Ficat-Arlet stage III — collapse: subchondral collapse (crescent sign) with femoral-head flattening / loss of sphericity; the joint space is preserved. A post-collapse stage.' },
  IV: { stage: 'IV', collapse: true, text: 'Ficat-Arlet stage IV — end-stage: secondary osteoarthritis with joint-space narrowing and acetabular changes; femoral-head collapse. A post-collapse stage.' },
};

const NOTE = 'The Ficat-Arlet staging (Ficat 1985; Ficat & Arlet 1980) grades osteonecrosis (avascular necrosis) of the femoral head by its radiographic / MRI appearance. 0: silent, normal X-ray. I: pre-radiographic, abnormal MRI. II: pre-collapse — sclerosis / cysts, sphericity preserved (IIA cysts, IIB crescent sign). III: subchondral collapse (crescent sign) with flattening, joint space preserved. IV: secondary osteoarthritis. The pre-collapse (0-II) vs post-collapse (III-IV) distinction is the classically taught joint-preservation-vs-replacement watershed, not an order; the management decision stays with the surgeon. This reports the stage the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = { 0: '0', 1: 'I', 2: 'II', 3: 'III', 4: 'IV', '0': '0', I: 'I', II: 'II', III: 'III', IV: 'IV' };

// input:
//   stage: '0' .. 'IV' (case-insensitive; also accepts 0-4)
export function ficatArlet(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.stage == null ? '' : o.stage).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = STAGES[key];
  if (!t) {
    return { valid: false, message: 'Select the Ficat-Arlet stage (0, I, II, III, or IV).' };
  }
  return {
    valid: true,
    stage: t.stage,
    collapse: t.collapse,
    abnormal: t.collapse,
    bandLabel: `Ficat-Arlet stage ${t.stage}`,
    band: t.text,
    note: NOTE,
  };
}
