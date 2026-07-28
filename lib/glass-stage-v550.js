// spec-v550: the Global Limb Anatomic Staging System (GLASS) for chronic limb-threatening ischemia.
// "femoropopliteal", "infrapopliteal", "clti", "inframalleolar", "pedal" and "limb-based" were all zero-hit
// across corpus.json, app.js and lib/meta.js. The two "glass" hits in lib/meta.js are unrelated: an author
// surname in the Guy's stone score citation, and ground-glass lung nodules.
//
// A COMPANION TO THE EXISTING TILES, NOT A DUPLICATE OF THEM. `wifi` stages the LIMB THREAT from the wound,
// the ischemia and the foot infection. `rutherford-fontaine` stages the SYMPTOMS. GLASS stages neither: it
// grades the ANATOMIC PATTERN OF DISEASE along a target arterial path, to estimate what an endovascular
// attempt at revascularizing it would face. A limb has all three at once and they answer different
// questions.
//
// TWO SEGMENT GRADES FEED A MATRIX. The femoropopliteal (FP) and infrapopliteal (IP) segments of the target
// arterial path are each graded 0 to 4, and the pair is looked up in the stage matrix.
//
// **FP0 WITH IP0 IS "NOT APPLICABLE", NOT STAGE I.** That single cell is the most commonly mis-tabulated
// part of the system. If neither segment has significant disease there is no target arterial path to stage,
// so the answer is that GLASS does not apply -- not that the limb is the easiest kind of stage I. A matrix
// that returned I there would quietly assert that a limb with no significant disease is a revascularization
// target. This tile returns `applicable: false` for that cell and says why.
//
// **SEVERE CALCIFICATION RAISES THE SEGMENT GRADE BY ONE, BEFORE THE MATRIX LOOKUP.** It is a grade
// modifier, not a stage modifier, and it applies per segment. The tile reports the base grade and the
// adjusted grade separately so the adjustment is visible rather than baked into a number the reader cannot
// take apart. Grades cap at 4.
//
// **THE INFRAMALLEOLAR / PEDAL MODIFIER IS A DESCRIPTOR AND IS NEVER AN INPUT TO THE MATRIX.** P0, P1 and P2
// describe what happens below the ankle; the guideline is explicit that the IM modifier is NOT considered in
// the primary stage assignment. It is appended to the result, as in "GLASS III, P1". A tile that let P2
// push the stage upward would be inventing a rule the source does not contain, so this one keeps the
// modifier strictly alongside the stage and states that separation in the result.
//
// HIGH-STAKES: an anatomic description of disease pattern. It does NOT diagnose chronic limb-threatening
// ischemia, does not measure perfusion, and does not decide between an endovascular and a surgical
// approach or whether to revascularize at all (spec-v11 section 5.3). The stage estimates the difficulty
// and durability of an ENDOVASCULAR attempt at the target path; it says nothing about a bypass, about
// conduit availability, or about the patient's fitness for either. The estimates attached to each stage are
// the guideline's own consensus figures, not validated per-patient predictions. The revascularization
// decision stays with the vascular specialist.
//
// GRADES, MATRIX AND MODIFIERS RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from the Global Vascular
// Guidelines themselves:
//   - Conte MS, Bradbury AW, Kolh P, et al. Global Vascular Guidelines on the Management of Chronic
//     Limb-Threatening Ischemia. J Vasc Surg. 2019;69(6S):3S-125S.

export const FP_GRADES = [
  { value: 0, label: 'FP 0', text: 'Mild or no significant disease (under 50 percent).' },
  { value: 1, label: 'FP 1', text: 'Superficial femoral artery disease under one third of its length (under 10 cm). May include a single focal chronic total occlusion under 5 cm if not flush. Popliteal artery mild or normal.' },
  { value: 2, label: 'FP 2', text: 'Superficial femoral artery disease one third to two thirds of its length (10 to 20 cm). May include chronic total occlusion totaling under one third (10 cm) but not flush. Focal popliteal stenosis under 2 cm, not involving the trifurcation.' },
  { value: 3, label: 'FP 3', text: 'Superficial femoral artery disease over two thirds of its length (over 20 cm). May include any flush occlusion under 20 cm, or a non-flush chronic total occlusion of 10 to 20 cm. Short popliteal stenosis of 2 to 5 cm, not involving the trifurcation.' },
  { value: 4, label: 'FP 4', text: 'Superficial femoral artery occlusion over 20 cm. Popliteal disease over 5 cm or extending into the trifurcation. Any popliteal chronic total occlusion.' },
];

export const IP_GRADES = [
  { value: 0, label: 'IP 0', text: 'Mild or no significant disease in the primary target artery path.' },
  { value: 1, label: 'IP 1', text: 'Focal stenosis of the tibial artery under 3 cm.' },
  { value: 2, label: 'IP 2', text: 'Stenosis involving one third of the total vessel length. May include a focal chronic total occlusion under 3 cm. Does not include the tibioperoneal trunk or the tibial vessel origin.' },
  { value: 3, label: 'IP 3', text: 'Disease up to two thirds of the vessel length. Chronic total occlusion up to one third of the length, which may include the tibial vessel origin but not the tibioperoneal trunk.' },
  { value: 4, label: 'IP 4', text: 'Diffuse stenosis over two thirds of the total vessel length. Chronic total occlusion over one third of the length, which may include the vessel origin. Any chronic total occlusion of the tibioperoneal trunk if the anterior tibial artery is not the target artery.' },
];

// The inframalleolar / pedal descriptor. Appended to the stage; never an input to the matrix.
export const IM_MODIFIERS = [
  { value: 'P0', label: 'P0', text: 'The target artery crosses the ankle into the foot, with an intact pedal arch.' },
  { value: 'P1', label: 'P1', text: 'The target artery crosses the ankle into the foot, with an absent or severely diseased pedal arch.' },
  { value: 'P2', label: 'P2', text: 'No target artery crosses the ankle into the foot.' },
];

// Rows are the adjusted FP grade 0-4; columns the adjusted IP grade 0-4. null is the "not applicable" cell.
const STAGE_MATRIX = [
  [null, 'I', 'I', 'II', 'III'],
  ['I', 'I', 'II', 'II', 'III'],
  ['I', 'II', 'II', 'II', 'III'],
  ['II', 'II', 'II', 'III', 'III'],
  ['III', 'III', 'III', 'III', 'III'],
];

export const STAGE_MEANINGS = {
  I: 'Estimated immediate technical failure under 10 percent, and one-year limb-based patency over 70 percent.',
  II: 'Estimated immediate technical failure under 20 percent, and one-year limb-based patency of 50 to 70 percent.',
  III: 'Estimated immediate technical failure over 20 percent, and one-year limb-based patency under 50 percent.',
};

const NOT_APPLICABLE = 'GLASS does not apply. Neither the femoropopliteal nor the infrapopliteal segment has significant disease, so there is no target arterial path to stage. This cell of the matrix is "not applicable" and is NOT stage I: returning stage I here would assert that a limb with no significant disease is a revascularization target.';

const CALCIFICATION_RULE = 'Severe calcification within a segment of the target arterial path, meaning involving more than about half the circumference or diffuse, bulky or coral-reef in character, raises that segment grade by one. It is a grade modifier applied before the matrix lookup, not a stage modifier, and grades cap at 4.';

const IM_RULE = 'The inframalleolar or pedal modifier is a descriptor appended to the stage and is NEVER an input to the matrix: the guideline states that it is not considered in the primary stage assignment. A P2 limb and a P0 limb with the same segment grades carry the same GLASS stage.';

const NOTE = 'The Global Limb Anatomic Staging System (Global Vascular Guidelines, Conte and colleagues 2019) grades the femoropopliteal and infrapopliteal segments of a target arterial path from 0 to 4 each, then looks the pair up in a matrix to give stage I, II or III. The stages carry the guideline’s consensus estimates for an endovascular attempt: stage I, immediate technical failure under 10 percent and one-year limb-based patency over 70 percent; stage II, under 20 percent and 50 to 70 percent; stage III, over 20 percent and under 50 percent. Grade 0 in both segments is NOT stage I but "not applicable", because with no significant disease in either segment there is no target arterial path to stage. Severe calcification within a segment raises that segment grade by one before the matrix lookup, capped at 4, and this tile reports the base and adjusted grades separately so the adjustment stays visible. The inframalleolar or pedal modifier, P0 for a target artery crossing the ankle with an intact pedal arch, P1 for one crossing with an absent or severely diseased arch, and P2 for no target artery crossing the ankle, is appended to the stage as a descriptor and is never an input to the matrix, because the guideline states it is not considered in the primary stage assignment. This is an anatomic description of a disease pattern and a companion to, not a replacement for, the WIfI limb-threat stage and the Rutherford and Fontaine symptom stages, which answer different questions about the same limb. It does not diagnose chronic limb-threatening ischemia, does not measure perfusion, and does not decide between an endovascular and a surgical approach or whether to revascularize at all. The stage estimates the difficulty and durability of an endovascular attempt at the target path and says nothing about a bypass, about conduit availability, or about the patient’s fitness for either, and the figures attached to each stage are consensus estimates rather than validated per-patient predictions.';

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

function readGrade(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0 || n > 4) return NaN;
  return n;
}

// input:
//   fp, ip                     -- segment grades 0-4. Both required.
//   fpCalcification            -- yes/no, severe calcification in the femoropopliteal segment.
//   ipCalcification            -- yes/no, severe calcification in the infrapopliteal segment.
//   imModifier                 -- P0, P1 or P2. Required, and reported alongside the stage, never inside it.
export function glassStage(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const fpBase = readGrade(o.fp);
  const ipBase = readGrade(o.ip);
  if (fpBase === null || ipBase === null) {
    return { valid: false, message: 'Grade both segments of the target arterial path, femoropopliteal and infrapopliteal, from 0 to 4.' };
  }
  if (Number.isNaN(fpBase) || Number.isNaN(ipBase)) {
    return { valid: false, message: 'Each segment grade must be a whole number from 0 to 4.' };
  }

  const fpCalc = readBool(o.fpCalcification);
  const ipCalc = readBool(o.ipCalcification);
  if (fpCalc === null || ipCalc === null) {
    return { valid: false, message: 'Say whether each segment has severe calcification: it raises that segment grade by one before the stage is looked up.' };
  }
  if (Number.isNaN(fpCalc) || Number.isNaN(ipCalc)) {
    return { valid: false, message: 'Each calcification answer must be yes or no.' };
  }

  const rawIm = o.imModifier;
  if (rawIm === '' || rawIm === null || rawIm === undefined) {
    return { valid: false, message: 'Choose the inframalleolar modifier: P0, P1 or P2. It is reported alongside the stage and never changes it.' };
  }
  const im = IM_MODIFIERS.find((m) => m.value === String(rawIm).trim().toUpperCase());
  if (!im) {
    return { valid: false, message: 'The inframalleolar modifier must be P0, P1 or P2.' };
  }

  const fp = Math.min(4, fpBase + (fpCalc ? 1 : 0));
  const ip = Math.min(4, ipBase + (ipCalc ? 1 : 0));
  const calcificationApplied = fp !== fpBase || ip !== ipBase;

  const stage = STAGE_MATRIX[fp][ip];

  const common = {
    valid: true,
    fpBase, ipBase, fp, ip,
    fpCalcification: fpCalc,
    ipCalcification: ipCalc,
    calcificationApplied,
    imModifier: im.value,
    imModifierText: im.text,
    note: NOTE,
  };

  if (stage === null) {
    return {
      ...common,
      applicable: false,
      stage: null,
      bandLabel: 'GLASS not applicable',
      band: `${NOT_APPLICABLE} Inframalleolar modifier ${im.value}: ${im.text} ${IM_RULE}`,
    };
  }

  const gradeLine = calcificationApplied
    ? `Segment grades FP ${fpBase} and IP ${ipBase}, adjusted to FP ${fp} and IP ${ip} for severe calcification. ${CALCIFICATION_RULE}`
    : `Segment grades FP ${fp} and IP ${ip}, with no calcification adjustment.`;

  return {
    ...common,
    applicable: true,
    stage,
    stageMeaning: STAGE_MEANINGS[stage],
    bandLabel: `GLASS stage ${stage}, ${im.value}`,
    band: `GLASS stage ${stage}, ${im.value}. ${STAGE_MEANINGS[stage]} ${gradeLine} Inframalleolar modifier ${im.value}: ${im.text} ${IM_RULE} These are the guideline’s consensus estimates for an endovascular attempt at the target path, not validated per-patient predictions, and the stage is not itself a decision to revascularize.`,
  };
}
