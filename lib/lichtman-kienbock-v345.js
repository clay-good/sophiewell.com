// spec-v345: Lichtman staging of Kienbock disease (osteonecrosis of the lunate) — stages I, II,
// IIIA, IIIB, IV. The classic radiographic staging that grades avascular necrosis of the carpal
// lunate by the lunate's density, its collapse/fragmentation, and the secondary carpal collapse and
// arthrosis. The catalog carries the Ficat-Arlet femoral-head AVN staging and the Hawkins talar AVN
// classification but had no lunate (wrist) AVN staging. "lichtman classification" / "kienbock disease
// stage" routed to nothing.
//
// HIGH-STAKES: this reports the Lichtman STAGE the clinician has determined from the imaging, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// pre-collapse (I-II) vs collapse (IIIA-IV) distinction is the classically taught
// revascularization/unloading-vs-salvage watershed, not an order; the management decision stays with
// the hand surgeon.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Lichtman DM, Mack GR, MacDonald RI, Gunther SF, Wilson JN. Kienbock's disease: the role of
//     silicone replacement arthroplasty. J Bone Joint Surg Am. 1977;59(7):899-908 (the staging).
//   - Wrist-imaging references (Radiopaedia / "In Brief: The Lichtman Classification" Clin Orthop
//     Relat Res 2019) reproducing the same I/II/IIIA/IIIB/IV stages + the radioscaphoid-angle split.
//
// Stages (radiographic appearance):
//   I   : normal radiograph; lunate signal change on MRI (may show a linear or compression fracture
//         with normal lunate architecture and density).
//   II  : lunate sclerosis on radiograph (increased density), with or without fracture lines; the
//         lunate shape / architecture is preserved (no collapse).
//   IIIA: lunate collapse and fragmentation, but carpal alignment is maintained (radioscaphoid angle
//         < 60 degrees). Flagged.
//   IIIB: lunate collapse with fixed carpal collapse — scaphoid flexion / rotation and proximal
//         capitate migration (radioscaphoid angle > 60 degrees). Flagged.
//   IV  : advanced carpal collapse with generalized perilunate / radiocarpal degenerative arthrosis.
//         Flagged.
// (Stage IIIC, a later addition — a coronally oriented lunate fracture — is described in the note.)

const STAGES = {
  I: { stage: 'I', collapse: false, text: 'Lichtman stage I — normal radiograph; lunate signal change on MRI (may show a linear or compression fracture with normal lunate architecture and density).' },
  II: { stage: 'II', collapse: false, text: 'Lichtman stage II — lunate sclerosis (increased density) on radiograph, with or without fracture lines; the lunate shape and architecture are preserved (no collapse).' },
  IIIA: { stage: 'IIIA', collapse: true, text: 'Lichtman stage IIIA — lunate collapse and fragmentation, but carpal alignment is maintained (radioscaphoid angle < 60 degrees). A collapse stage.' },
  IIIB: { stage: 'IIIB', collapse: true, text: 'Lichtman stage IIIB — lunate collapse with fixed carpal collapse: scaphoid flexion / rotation and proximal capitate migration (radioscaphoid angle > 60 degrees). A collapse stage.' },
  IV: { stage: 'IV', collapse: true, text: 'Lichtman stage IV — advanced carpal collapse with generalized perilunate / radiocarpal degenerative arthrosis. The most advanced stage.' },
};

const NOTE = 'The Lichtman staging (Lichtman 1977) grades Kienbock disease (osteonecrosis of the carpal lunate) by its radiographic / MRI appearance. I: normal X-ray, abnormal MRI. II: lunate sclerosis, shape preserved. IIIA: lunate collapse, carpal alignment maintained (radioscaphoid angle < 60 degrees). IIIB: lunate collapse with fixed carpal collapse (radioscaphoid angle > 60 degrees). IV: generalized degenerative arthrosis. (Stage IIIC, a later addition, is a coronally oriented lunate fracture.) The pre-collapse (I-II) vs collapse (IIIA-IV) distinction is the classically taught revascularization/unloading-vs-salvage watershed, not an order; the management decision stays with the hand surgeon. This reports the stage the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  1: 'I', 2: 'II', 4: 'IV', I: 'I', II: 'II', IV: 'IV',
  III: 'IIIA', IIIA: 'IIIA', IIIB: 'IIIB', '3A': 'IIIA', '3B': 'IIIB',
};

// input:
//   stage: 'I' / 'II' / 'IIIA' / 'IIIB' / 'IV' (case-insensitive; bare 'III' maps to IIIA; also
//          accepts 1/2/4 and 3A/3B)
export function lichtmanKienbock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.stage == null ? '' : o.stage).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = STAGES[key];
  if (!t) {
    return { valid: false, message: 'Select the Lichtman stage (I, II, IIIA, IIIB, or IV).' };
  }
  return {
    valid: true,
    stage: t.stage,
    collapse: t.collapse,
    abnormal: t.collapse,
    bandLabel: `Lichtman stage ${t.stage}`,
    band: t.text,
    note: NOTE,
  };
}
