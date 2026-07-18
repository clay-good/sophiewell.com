// spec-v407: Steinberg (University of Pennsylvania) staging of osteonecrosis (avascular necrosis) of the
// femoral head, by the radiographic / MRI stage — stages 0 / I / II / III / IV / V / VI. It is the more
// granular companion to the Ficat-Arlet staging (ficat-arlet) already in the catalog. "steinberg" /
// "avascular necrosis staging" / "femoral head osteonecrosis stage" routed to nothing.
//
// HIGH-STAKES: this reports the radiographic STAGE the clinician has determined from imaging, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). Subchondral
// collapse (stage III) is the classic hip-preservation watershed, but this reports the stage; the
// management decision stays with the orthopedic team.
//
// STAGES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Steinberg ME, Hayken GD, Steinberg DR. A quantitative system for staging avascular necrosis. J Bone
//     Joint Surg Br. 1995;77(1):34-41 (the 0-VI staging, each I-V subdivided A/B/C by extent).
//   - Orthopedic references reproducing the same normal-imaging (0) / abnormal-MRI-normal-XR (I) /
//     cystic-sclerotic (II) / subchondral-collapse-crescent (III) / flattening (IV) / joint-narrowing (V)
//     / degenerative (VI) sequence.
//
// Stages (extent quantified A <15% / B 15-30% / C >30% of the head, for stages I-V):
//   0   : normal or non-diagnostic radiograph, bone scan, and MRI (in an at-risk hip).
//   I   : normal radiograph; abnormal bone scan and/or MRI.
//   II  : lucent and sclerotic (cystic) changes in the femoral head, without subchondral collapse.
//   III : subchondral collapse (crescent sign) without flattening of the femoral head.
//   IV  : flattening of the femoral head.
//   V   : joint-space narrowing and/or acetabular changes.
//   VI  : advanced degenerative changes.

const STAGES = {
  0: { stage: '0', text: 'Steinberg stage 0 - normal or non-diagnostic radiograph, bone scan, and MRI (in an at-risk hip).' },
  I: { stage: 'I', text: 'Steinberg stage I - normal radiograph; abnormal bone scan and/or MRI. Extent: A <15%, B 15-30%, C >30% of the femoral head.' },
  II: { stage: 'II', text: 'Steinberg stage II - lucent and sclerotic (cystic) changes in the femoral head, without subchondral collapse. Extent: A <15%, B 15-30%, C >30%.' },
  III: { stage: 'III', text: 'Steinberg stage III - subchondral collapse (crescent sign) without flattening of the femoral head. Extent: A <15%, B 15-30%, C >30%.' },
  IV: { stage: 'IV', text: 'Steinberg stage IV - flattening of the femoral head. Extent: A <15%, B 15-30%, C >30%.' },
  V: { stage: 'V', text: 'Steinberg stage V - joint-space narrowing and/or acetabular changes. Extent: A <15%, B 15-30%, C >30%.' },
  VI: { stage: 'VI', text: 'Steinberg stage VI - advanced degenerative changes.' },
};

const NOTE = 'The Steinberg (University of Pennsylvania) system (Steinberg 1995) stages femoral-head osteonecrosis (AVN) 0-VI: 0 normal imaging; I normal radiograph but abnormal MRI/bone scan; II cystic/sclerotic changes; III subchondral collapse (crescent) without flattening; IV flattening; V joint narrowing / acetabular changes; VI degenerative. Stages I-V are quantified A (<15%), B (15-30%), C (>30%) by the extent of head involvement. Subchondral collapse (III) is the classic hip-preservation watershed, but this reports the stage the clinician has determined, not a diagnosis, a treatment decision, or a prognosis. Companion: the Ficat-Arlet staging.';

const ALIAS = {
  0: '0', I: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V', VI: 'VI',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI',
  IA: 'I', IB: 'I', IC: 'I', IIA: 'II', IIB: 'II', IIC: 'II',
  IIIA: 'III', IIIB: 'III', IIIC: 'III', IVA: 'IV', IVB: 'IV', IVC: 'IV',
  VA: 'V', VB: 'V', VC: 'V',
};

// input:
//   stage: '0' / 'I' / 'II' / 'III' / 'IV' / 'V' / 'VI' (case-insensitive; also accepts 0-6 and the A/B/C
//   extent subtypes -> the base stage).
export function steinbergAvn(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.stage == null ? '' : o.stage).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const s = STAGES[key];
  if (!s) {
    return { valid: false, message: 'Select the Steinberg stage (0, I, II, III, IV, V, or VI).' };
  }
  return {
    valid: true,
    stage: s.stage,
    bandLabel: `Steinberg stage ${s.stage}`,
    band: s.text,
    note: NOTE,
  };
}
