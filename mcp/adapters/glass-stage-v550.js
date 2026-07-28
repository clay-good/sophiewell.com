// spec-v550 MCP wave: adapter for the GLASS anatomic stage in lib/glass-stage-v550.js. The dom keys mirror
// the browser renderer (views/group-v550.js) and META['glass-stage'].example: glass-fp, glass-fp-calc,
// glass-ip, glass-ip-calc, glass-im map to the lib args fp, fpCalcification, ip, ipCalcification,
// imModifier.
//
// **GRADE 0 IN BOTH SEGMENTS IS "NOT APPLICABLE", NOT STAGE I.** That one cell is the most commonly
// mis-tabulated part of the system, and it is exactly the kind of corner a model fills in by symmetry: a
// five-by-five matrix whose top-left cell is a hole looks like an omission. It is not. With no significant
// disease in either segment there is no target arterial path to stage, and returning stage I there would
// assert that a limb with no significant disease is a revascularization target. The tool returns
// `applicable: false` with the reason.
//
// **THE INFRAMALLEOLAR MODIFIER IS A DESCRIPTOR AND NEVER AN INPUT TO THE MATRIX.** The guideline states
// outright that the IM modifier is not considered in the primary stage assignment. P0, P1 and P2 are
// appended to the stage, as in "GLASS III, P1". An agent that let P2 push the stage upward would be
// applying a rule the source does not contain, so the summary states the separation and the result keeps
// the modifier in its own field.
//
// SEVERE CALCIFICATION IS A GRADE MODIFIER, NOT A STAGE MODIFIER. It raises the affected SEGMENT grade by
// one BEFORE the matrix lookup, per segment, capped at 4. The result exposes `fpBase`/`ipBase` alongside the
// adjusted `fp`/`ip` so an agent can see what the adjustment did rather than receiving a number it cannot
// take apart.
//
// A COMPANION TO `wifi` AND `rutherford-fontaine`, NOT A REPLACEMENT. Those stage the limb threat and the
// symptoms; GLASS grades the anatomic pattern of disease along a target path. A limb has all three at once,
// and an agent asked "how bad is this limb?" should know that the three answer different questions.

import * as G from '../../lib/glass-stage-v550.js';

export default [
  {
    id: 'glass-stage',
    summary: 'The Global Limb Anatomic Staging System (GLASS) for chronic limb-threatening ischemia, from the Global Vascular Guidelines (Conte and colleagues, J Vasc Surg 2019). It grades the FEMOROPOPLITEAL (FP) and INFRAPOPLITEAL (IP) segments of a target arterial path from 0 to 4 each, then looks the pair up in a matrix to give stage I, II or III. The stages carry the guideline consensus estimates for an ENDOVASCULAR attempt: stage I, immediate technical failure under 10 percent and one-year limb-based patency over 70 percent; stage II, under 20 percent and 50 to 70 percent; stage III, over 20 percent and under 50 percent. GRADE 0 IN BOTH SEGMENTS IS NOT STAGE I. It is "not applicable": with no significant disease in either segment there is no target arterial path to stage, and returning stage I there would assert that a limb with no significant disease is a revascularization target. This is the most commonly mis-tabulated cell of the matrix, and the tool returns applicable false with the reason rather than filling the corner in by symmetry. SEVERE CALCIFICATION IS A GRADE MODIFIER, NOT A STAGE MODIFIER: severe calcification within a segment, meaning involving more than about half the circumference or diffuse, bulky or coral-reef in character, raises THAT SEGMENT grade by one BEFORE the matrix lookup, per segment, capped at 4. The result exposes the base grades alongside the adjusted ones. THE INFRAMALLEOLAR OR PEDAL MODIFIER IS A DESCRIPTOR AND IS NEVER AN INPUT TO THE MATRIX: P0 is a target artery crossing the ankle into the foot with an intact pedal arch, P1 the same with an absent or severely diseased arch, and P2 no target artery crossing the ankle. The guideline states explicitly that the inframalleolar modifier is NOT considered in the primary stage assignment, so it is appended to the stage as in "GLASS III, P1", and a P2 limb and a P0 limb with the same segment grades carry the SAME GLASS stage. This is a COMPANION to the wifi and rutherford-fontaine tiles, not a replacement for either: wifi stages the limb threat from the wound, ischemia and foot infection, rutherford-fontaine stages the symptoms, and GLASS grades the anatomic pattern of disease. A limb has all three at once and they answer different questions. This describes anatomy. It does NOT diagnose chronic limb-threatening ischemia, does NOT measure perfusion, and does NOT decide between an endovascular and a surgical approach or whether to revascularize at all. The stage estimates the difficulty and durability of an endovascular attempt at the target path and says nothing about a bypass, about conduit availability, or about the patient fitness for either, and the figures attached to each stage are consensus estimates rather than validated per-patient predictions.',
    compute: G.glassStage,
    fields: [
      {
        dom: 'glass-fp', arg: 'fp', kind: 'enum',
        values: G.FP_GRADES.map((g) => String(g.value)), required: true,
        label: `Femoropopliteal segment grade [${G.FP_GRADES.map((g) => `${g.value} = ${g.text}`).join(' ')}]`,
      },
      {
        dom: 'glass-fp-calc', arg: 'fpCalcification', kind: 'enum', values: ['no', 'yes'], required: true,
        label: 'Severe calcification within the femoropopliteal segment of the target arterial path. Raises the femoropopliteal grade by one before the matrix lookup, capped at 4.',
      },
      {
        dom: 'glass-ip', arg: 'ip', kind: 'enum',
        values: G.IP_GRADES.map((g) => String(g.value)), required: true,
        label: `Infrapopliteal segment grade [${G.IP_GRADES.map((g) => `${g.value} = ${g.text}`).join(' ')}]`,
      },
      {
        dom: 'glass-ip-calc', arg: 'ipCalcification', kind: 'enum', values: ['no', 'yes'], required: true,
        label: 'Severe calcification within the infrapopliteal segment of the target arterial path. Raises the infrapopliteal grade by one before the matrix lookup, capped at 4.',
      },
      {
        dom: 'glass-im', arg: 'imModifier', kind: 'enum',
        values: G.IM_MODIFIERS.map((m) => m.value), required: true,
        label: `Inframalleolar (pedal) modifier. Reported ALONGSIDE the stage and never inside it: the guideline states it is not considered in the primary stage assignment [${G.IM_MODIFIERS.map((m) => `${m.value} = ${m.text}`).join(' ')}]`,
      },
    ],
  },
];
