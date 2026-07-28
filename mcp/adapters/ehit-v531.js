// spec-v531 MCP wave: adapter for the EHIT classification in lib/ehit-v531.js. The dom key mirrors the
// browser renderer (views/group-v531.js) and META['ehit'].example: ehit-class maps to the lib arg
// `ehitClass`.
//
// THE ENUM PUBLISHES 'Ia' AND 'Ib' AND DELIBERATELY OMITS A BARE 'I'. The two subclasses carry identical
// management, so it would be tempting to collapse them - but a bare I would let an agent record a class that
// no longer exists in the 2021 consensus and silently lose which subclass was seen. The lib rejects 'I' and
// '1' with a message naming which is which, and stating that Ib is the original 2006 class I; that message is
// more useful to a caller than a permissive parse.
//
// THE LABEL AND SUMMARY BOTH CARRY THE 2006-TO-2021 CONTINUITY, because an agent reading an older operative
// note or radiology report will encounter "EHIT 1" and must map it to Ib rather than guessing. Classes II,
// III and IV are unchanged, so only class I needs the mapping.
//
// THE SUMMARY REFUSES THE LAWRENCE CONFLATION EXPLICITLY. A separate six-level system grades the same
// complication, and its levels 1 through 3 ALL collapse into class I here. An agent that reads "level 3" as
// "class III" would move a patient who needs no treatment into the therapeutic-anticoagulation band - the
// single most consequential error available with this instrument.
//
// The per-class recommendations are returned because deciding about anticoagulation is the entire point of
// classifying an EHIT, but each is labeled with its published strength of evidence and stated to be a
// suggestion rather than an order, and class IV's recommendation is itself "individualize". The tool chooses
// no agent, dose, or duration.

import * as E from '../../lib/ehit-v531.js';

export default [
  {
    id: 'ehit',
    summary: 'The classification of endothermal heat-induced thrombosis (EHIT), from the American Venous Forum and Society for Vascular Surgery 2021 consensus revising Kabnick 2006. EHIT is thrombus seen on ultrasound within four weeks of endovenous thermal ablation that originates from the treated vein and protrudes into a deep vein. Class Ia is thrombus without propagation into the deep vein, peripheral to the superficial epigastric vein; class Ib is the same but central to that vein, up to and including the deep vein junction; class II propagates into the adjacent deep vein occupying less than 50 percent of its lumen; class III occupies more than 50 percent but is not occlusive; class IV is an occlusive deep vein thrombus contiguous with the treated vein. The same percentages apply to the popliteal vein after a small-saphenous ablation. IMPORTANT FOR READING OLDER RECORDS: the 2021 revision renumbered nothing. Classes II, III and IV are word for word the 2006 originals, and the only change was subdividing class I, so class Ib is exactly the old class I and a record written before 2021 saying "EHIT 1" means Ib. DO NOT CONFUSE THIS WITH THE LAWRENCE SYSTEM, which grades the same complication in six levels keyed to the epigastric vein: Lawrence levels 1, 2 and 3 all collapse into class I here, so a Lawrence level 3 is not a class III, and mistaking one for the other would move a patient who needs no treatment into the anticoagulation band. Two findings are formally distinguished from EHIT and must not be classified with this tool: a deep vein thrombosis in a segment not contiguous with the ablated vein is a non-EHIT DVT, and thrombus in a different superficial vein is post-ablation superficial venous thrombosis. The published recommendation for each class is returned with its stated strength of evidence, but these are suggestions rather than orders: the anticoagulation decision turns on bleeding risk, thrombophilia, symptoms and other indications as much as on the class, and the class IV recommendation is itself to individualize. This tool does not choose an agent, a dose or a duration, does not schedule surveillance imaging, and does not diagnose an EHIT, which is an ultrasound finding. It grades a different thing from the CEAP classification and the venous clinical severity score, which describe chronic venous disease.',
    compute: E.ehit,
    fields: [
      {
        dom: 'ehit-class',
        arg: 'ehitClass',
        kind: 'enum',
        values: E.EHIT_CLASSES.map((c) => c.value),
        required: true,
        label: `How far the thrombus extends. A bare "I" is not accepted - choose Ia or Ib, where Ib is the original 2006 class I [${E.EHIT_CLASSES.map((c) => `${c.value} = ${c.text}`).join(' ')}]`,
      },
    ],
  },
];
