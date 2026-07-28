// spec-v539: the International Society of Lymphology (ISL) staging of peripheral lymphedema. WHOLE-CONCEPT
// GAP: "lymphedema", "isl", "elephantiasis", "lymphoscintigraphy", and "stemmer" were ALL zero-hit across
// corpus.json, app.js, and lib/meta.js. The catalog had no lymphedema content of any kind.
//
// **STAGE AND SEVERITY ARE TWO SEPARATE AXES, AND THE SOURCE APPLIES THEM TOGETHER.** The stage describes
// what the TISSUE has become; the severity grade describes HOW MUCH VOLUME the limb has gained. They do not
// track each other: a stage III limb is not automatically severe, and a severe-by-volume limb can be stage
// II. This tile reports both and refuses to collapse them, because "stage III lymphedema" and "severe
// lymphedema" are different statements that get used interchangeably.
//
// THE STAGES, AND THE PROPERTY THAT ACTUALLY SEPARATES THEM -- PITTING AND ELEVATION, WHICH ARE
// NON-MONOTONIC:
//   0 (latent/subclinical)  swelling not yet evident despite impaired lymph transport; may precede overt
//                           edema by months or years
//   I                       fluid relatively high in protein content that SUBSIDES WITH LIMB ELEVATION.
//                           Pitting MAY occur.
//   II                      elevation alone RARELY reduces the swelling, and pitting IS MANIFEST
//   late II                 the limb MAY NOT PIT, as excess subcutaneous fat and fibrosis develop
//   III                     lymphostatic elephantiasis; pitting CAN BE ABSENT; trophic skin changes such as
//                           acanthosis, altered skin thickness, further fat and fibrosis, warty overgrowths
//
// Pitting therefore RISES from stage I to stage II and then FALLS AWAY again through late II to III. A
// reader who treats "does it pit?" as a severity dial gets stage III backwards: the absence of pitting in an
// advanced limb means fibrosis has replaced fluid, not that the limb has improved. This tile states that
// explicitly at every stage where it matters.
//
// A LIMB CAN EXHIBIT MORE THAN ONE STAGE, which the consensus says outright, because different lymphatic
// territories within the same limb can be affected differently. The stage is therefore a description of a
// region rather than a single verdict on a person, and it refers to the PHYSICAL CONDITION OF THE
// EXTREMITIES ONLY.
//
// THE SEVERITY GRADE IS BY EXCESS VOLUME DIFFERENCE BETWEEN LIMBS: minimal above 5 and below 20 percent,
// moderate 20 to 40 percent, severe above 40 percent. The consensus notes in the same paragraph that some
// clinics instead use above 5 to 10 percent as minimal and above 10 to below 20 percent as mild, so this
// tile labels the convention it uses rather than presenting one set of cut points as the only one. It also
// notes that subclinical lymphedema is measurable at a 3 to 5 percent excess, which is BELOW the minimal
// grade -- so a limb can be measurably abnormal and ungraded.
//
// BILATERAL LYMPHEDEMA BREAKS THE MEASUREMENT. The severity grade is an inter-limb comparison, so when both
// limbs are affected the difference between them understates the disease, and the consensus says to
// interpret it with caution. This tile asks whether the swelling is bilateral and, when it is, reports the
// grade WITH that caveat attached rather than silently returning a falsely reassuring number.
//
// HIGH-STAKES: this is a clinical description. It does NOT diagnose lymphedema or distinguish it from the
// other causes of a swollen limb -- venous insufficiency, heart, kidney or liver failure, deep vein
// thrombosis, lipedema, and infection all present this way, and some are urgent. It does not identify the
// cause of a lymphedema that is present, primary or secondary, and it is not an indication for compression,
// for manual lymphatic drainage, or for surgery (spec-v11 section 5.3). Any acutely painful, red, or hot
// limb needs assessment for cellulitis or thrombosis rather than staging. The clinical decision stays with
// the clinician.
//
// STAGES AND SEVERITY GRADES RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from the consensus document
// itself and corroborated against an independent reproduction of the identically worded earlier edition:
//   - International Society of Lymphology. The diagnosis and treatment of peripheral lymphedema: 2020
//     Consensus Document of the International Society of Lymphology. Lymphology. 2020;53(1):3-19.

export const ISL_STAGES = [
  {
    value: '0',
    label: 'Stage 0 (latent or subclinical)',
    text: 'Swelling is not yet evident despite impaired lymph transport, with subtle alterations in tissue fluid and composition and changes in subjective symptoms.',
    pitting: 'Not applicable: there is no overt edema to pit.',
    elevation: 'Not applicable.',
    detail: 'It can be transitory, and may exist for months or years before overt edema appears.',
  },
  {
    value: 'I',
    label: 'Stage I',
    text: 'An early accumulation of fluid relatively high in protein content.',
    pitting: 'Pitting MAY occur.',
    elevation: 'The swelling SUBSIDES with limb elevation.',
    detail: 'An increase in various types of proliferating cells may also be seen.',
  },
  {
    value: 'II',
    label: 'Stage II',
    text: 'More changes in solid structures.',
    pitting: 'Pitting IS manifest.',
    elevation: 'Limb elevation alone RARELY reduces the tissue swelling.',
    detail: 'This is the stage at which pitting is most prominent; it falls away again as fibrosis develops.',
  },
  {
    value: 'late II',
    label: 'Late stage II',
    text: 'Excess subcutaneous fat and fibrosis develop.',
    pitting: 'The limb MAY NOT pit. That is fibrosis replacing fluid, not improvement.',
    elevation: 'Elevation does not reduce the swelling.',
    detail: 'Pitting is non-monotonic across the stages: it rises from stage I to stage II, then falls away through late stage II to stage III.',
  },
  {
    value: 'III',
    label: 'Stage III',
    text: 'Lymphostatic elephantiasis, with trophic skin changes such as acanthosis, alterations in skin character and thickness, further deposition of fat and fibrosis, and warty overgrowths.',
    pitting: 'Pitting CAN BE ABSENT. Again, that is fibrosis, not improvement.',
    elevation: 'Elevation does not reduce the swelling.',
    detail: 'The most advanced stage. Absence of pitting here must not be read as a milder limb.',
  },
];

// Excess volume difference between limbs. The consensus notes an alternative convention in the same
// paragraph, so the tile names the one it applies.
export const ISL_SEVERITY = [
  { value: 'none', label: 'Not graded', text: 'Excess volume at or below 5 percent. Subclinical lymphedema is measurable from about 3 to 5 percent, which sits below the minimal grade, so a limb can be measurably abnormal and still ungraded.' },
  { value: 'minimal', label: 'Minimal', text: 'Excess volume above 5 percent and below 20 percent.' },
  { value: 'moderate', label: 'Moderate', text: 'Excess volume of 20 to 40 percent.' },
  { value: 'severe', label: 'Severe', text: 'Excess volume above 40 percent.' },
];

const SEVERITY_CONVENTION = 'Graded on the convention of minimal above 5 to below 20 percent, moderate 20 to 40 percent, and severe above 40 percent. The consensus notes that some clinics instead use above 5 to 10 percent as minimal and above 10 to below 20 percent as mild.';

const BILATERAL_CAVEAT = 'The swelling is bilateral, so this severity grade must be read with caution: it is an inter-limb comparison, and when both limbs are affected the difference between them understates the disease.';

const NOTE = 'The International Society of Lymphology stages peripheral lymphedema in five steps: stage 0 latent, where swelling is not yet evident despite impaired lymph transport; stage I, an early accumulation of protein-rich fluid that subsides with limb elevation and may pit; stage II, where elevation alone rarely reduces the swelling and pitting is manifest; late stage II, where the limb may not pit as excess subcutaneous fat and fibrosis develop; and stage III, lymphostatic elephantiasis with trophic skin changes, where pitting can be absent. Pitting is therefore non-monotonic across the stages, rising from stage I to stage II and falling away again through late stage II to stage III, so the absence of pitting in an advanced limb means fibrosis has replaced fluid rather than that the limb has improved. Stage and severity are separate axes and the consensus applies them together: the stage describes what the tissue has become, while severity is graded by the excess volume difference between limbs, minimal above 5 to below 20 percent, moderate 20 to 40 percent, and severe above 40 percent. Some clinics use a different minimal and mild convention, and subclinical lymphedema is measurable from about 3 to 5 percent excess, below the minimal grade, so a limb can be measurably abnormal and ungraded. Because the severity grade is an inter-limb comparison, bilateral swelling understates the disease and the consensus says to interpret it with caution. The consensus also states that a limb may exhibit more than one stage, reflecting different lymphatic territories, and that the stages refer to the physical condition of the extremities only. This is a clinical description. It does not diagnose lymphedema or distinguish it from the other causes of a swollen limb, including venous insufficiency, heart, kidney or liver failure, deep vein thrombosis, lipedema, and infection, some of which are urgent. It does not identify whether a lymphedema is primary or secondary, and it is not an indication for compression, manual lymphatic drainage, or surgery. An acutely painful, red, or hot limb needs assessment for cellulitis or thrombosis rather than staging.';

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

// input: stage -- one of ISL_STAGES values; severity -- one of ISL_SEVERITY values; bilateral -- yes/no.
export function islLymphedema(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const rawStage = o.stage;
  if (rawStage === '' || rawStage === null || rawStage === undefined) {
    return { valid: false, message: 'Choose a stage: 0, I, II, late II, or III.' };
  }
  const stageKey = String(rawStage).trim().toUpperCase().replace(/\s+/g, ' ');
  const stage = ISL_STAGES.find((s) => s.value.toUpperCase() === stageKey);
  if (!stage) {
    return { valid: false, message: 'Stage must be 0, I, II, late II, or III.' };
  }

  const rawSeverity = o.severity;
  if (rawSeverity === '' || rawSeverity === null || rawSeverity === undefined) {
    return { valid: false, message: 'Choose a severity grade by excess volume, or "none" if the excess is at or below 5 percent. Stage and severity are separate axes.' };
  }
  const severity = ISL_SEVERITY.find((s) => s.value === String(rawSeverity).trim().toLowerCase());
  if (!severity) {
    return { valid: false, message: 'Severity must be none, minimal, moderate, or severe.' };
  }

  const bilateral = readBool(o.bilateral);
  if (bilateral === null) {
    return { valid: false, message: 'Say whether the swelling is bilateral: the severity grade is an inter-limb comparison and bilateral swelling understates it.' };
  }
  if (Number.isNaN(bilateral)) {
    return { valid: false, message: 'The bilateral answer must be yes or no.' };
  }

  const pittingFallsAway = stage.value === 'late II' || stage.value === 'III';

  return {
    valid: true,
    stage: stage.value,
    stageLabel: stage.label,
    severity: severity.value,
    severityLabel: severity.label,
    bilateral,
    pittingFallsAway,
    bandLabel: `ISL ${stage.label}, ${severity.label.toLowerCase()} by volume`,
    band: `${stage.label}: ${stage.text} ${stage.elevation} ${stage.pitting} Severity by excess volume: ${severity.label.toLowerCase()} — ${severity.text} ${SEVERITY_CONVENTION}${bilateral ? ` ${BILATERAL_CAVEAT}` : ''} Stage and severity are separate axes and neither implies the other. A limb may exhibit more than one stage, and the stages describe the extremities only.`,
    note: NOTE,
  };
}
