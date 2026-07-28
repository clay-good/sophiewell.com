// spec-v539 MCP wave: adapter for the ISL lymphedema staging in lib/isl-lymphedema-v539.js. The dom keys
// mirror the browser renderer (views/group-v539.js) and META['isl-lymphedema'].example: isl-stage,
// isl-severity, isl-bilateral map to the lib args stage, severity, bilateral.
//
// **THE TOOL TAKES TWO AXES AND REFUSES TO COLLAPSE THEM.** Stage describes what the tissue has become;
// severity grades how much volume the limb has gained. "Stage III lymphedema" and "severe lymphedema" are
// different statements that get used interchangeably, and an agent handed only one of them must not report
// the other. Both are required, and the result returns both separately.
//
// **THE STAGE ENUM'S LABELS CARRY THE PITTING BEHAVIOR, WHICH IS NON-MONOTONIC.** Pitting rises from stage I
// to stage II and then FALLS AWAY again through late stage II to stage III as fibrosis replaces fluid. An
// agent that treats "does it pit?" as a severity dial reads stage III backwards and would report an advanced
// fibrotic limb as improved. The advanced stages say "that is fibrosis, not improvement" in their own text.
//
// `isl-bilateral` IS REQUIRED, and it is not a formality. The severity grade is an INTER-LIMB comparison, so
// when both limbs are affected the difference between them understates the disease. An agent that omitted
// this would report a falsely reassuring grade on exactly the patients with the most disease. When it is
// yes, the band carries the caveat and the result exposes a `bilateral` flag.
//
// The severity enum includes 'none' for an excess at or below 5 percent, because subclinical lymphedema is
// measurable from about 3 to 5 percent - BELOW the minimal grade - so a limb can be measurably abnormal and
// still ungraded. Without that option an agent would be forced to call such a limb "minimal".

import * as L from '../../lib/isl-lymphedema-v539.js';

export default [
  {
    id: 'isl-lymphedema',
    summary: 'The International Society of Lymphology staging of peripheral lymphedema (2020 Consensus Document). STAGE AND SEVERITY ARE TWO SEPARATE AXES that the consensus applies together, and neither implies the other: the stage describes what the tissue has become, while severity grades how much volume the limb has gained. Do not report one as if it were the other. The stages are: 0, latent or subclinical, where swelling is not yet evident despite impaired lymph transport and which may precede overt edema by months or years; I, an early accumulation of protein-rich fluid that SUBSIDES WITH LIMB ELEVATION, where pitting MAY occur; II, where elevation alone RARELY reduces the swelling and pitting IS MANIFEST; late II, where the limb MAY NOT PIT as excess subcutaneous fat and fibrosis develop; and III, lymphostatic elephantiasis with trophic skin changes such as acanthosis and warty overgrowths, where pitting CAN BE ABSENT. NOTE THAT PITTING IS NON-MONOTONIC: it rises from stage I to stage II and then falls away again through late stage II to stage III, so the absence of pitting in an advanced limb means fibrosis has replaced fluid rather than that the limb has improved, and treating pitting as a severity dial reads stage III backwards. Severity is graded by the excess volume difference between limbs: minimal above 5 and below 20 percent, moderate 20 to 40 percent, severe above 40 percent; the consensus notes some clinics instead use above 5 to 10 percent as minimal and above 10 to below 20 percent as mild. Subclinical lymphedema is measurable from about 3 to 5 percent excess, which sits BELOW the minimal grade, so a limb can be measurably abnormal and still ungraded. Because the severity grade is an INTER-LIMB comparison, bilateral swelling understates the disease and must be flagged. The consensus also states that a limb may exhibit more than one stage, reflecting different lymphatic territories, and that the stages refer to the physical condition of the extremities only. This is a clinical description. It does NOT diagnose lymphedema or distinguish it from the other causes of a swollen limb - venous insufficiency, heart, kidney or liver failure, deep vein thrombosis, lipedema, and infection all present this way and some are urgent. It does not identify whether a lymphedema is primary or secondary, and it is not an indication for compression, manual lymphatic drainage, or surgery. An acutely painful, red, or hot limb needs assessment for cellulitis or thrombosis rather than staging.',
    compute: L.islLymphedema,
    fields: [
      {
        dom: 'isl-stage', arg: 'stage', kind: 'enum',
        values: L.ISL_STAGES.map((s) => s.value), required: true,
        label: `The stage, describing what the tissue has become [${L.ISL_STAGES.map((s) => `${s.value} = ${s.label}: ${s.text} ${s.elevation} ${s.pitting}`).join(' ')}]`,
      },
      {
        dom: 'isl-severity', arg: 'severity', kind: 'enum',
        values: L.ISL_SEVERITY.map((s) => s.value), required: true,
        label: `Severity by excess volume difference between limbs - a SEPARATE axis from the stage [${L.ISL_SEVERITY.map((s) => `${s.value} = ${s.label}, ${s.text}`).join(' ')}]`,
      },
      {
        dom: 'isl-bilateral', arg: 'bilateral', kind: 'enum', values: ['no', 'yes'], required: true,
        label: 'Is the swelling bilateral? Required, because the severity grade is an inter-limb comparison and bilateral swelling understates the disease.',
      },
    ],
  },
];
