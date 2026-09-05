// spec-v553 MCP wave: adapter for the PUQE-24 in lib/puqe24-v553.js. The dom keys mirror the browser
// renderer (views/group-v553.js) and META['puqe24'].example: puqe-nauseaHours, puqe-vomiting,
// puqe-retching, puqe-wellbeing map to the lib args of the same names.
//
// **THE SCALE HAS NO ZERO. THE TOTAL RUNS 3 TO 15, NOT 0 TO 15.** Every item has a MINIMUM of 1 point,
// which is the "not at all" answer, so a woman with no nausea, no vomiting and no retching scores 3. An
// agent that assumes a 0 floor - the overwhelmingly common shape for a symptom instrument - will read 3 as
// a mild burden rather than as the complete absence of symptoms, and will mis-scale every comparison it
// makes. The tool rejects 0 outright and says why.
//
// **THE WELL-BEING ITEM IS NOT PART OF THE TOTAL AND RUNS IN THE OPPOSITE DIRECTION.** The form asks the
// patient to rate her well-being from 0, the worst possible, to 10, as good as she felt before pregnancy.
// HIGHER IS BETTER there while HIGHER IS WORSE on the PUQE score. Summing it would both corrupt the total
// and invert the contribution of the one item that disagrees in direction with the rest. It is optional,
// reported separately, and never added.
//
// **THE BAND LABEL AT THE BOTTOM DIVERGES BETWEEN RENDERINGS, AND THE TOOL DISCLOSES IT AT THE BOUNDARY.**
// The NUMERIC boundaries are identical everywhere: 7 and 13. Only the name for the lowest range differs -
// the instrument's own figure calls 6 or less "mild", while other renderings label 3 separately as "no
// nausea and vomiting of pregnancy" and reserve "mild" for 4 to 6. This follows the instrument's figure and
// adds the alternative reading when the total is 3, the single value where the conventions disagree about
// what to call the patient.

import * as P from '../../lib/puqe24-v553.js';

export default [
  {
    id: 'puqe24',
    summary: `The PUQE-24 (Pregnancy-Unique Quantification of Emesis and nausea, 24-hour version; Koren and colleagues 2002), which quantifies nausea and vomiting of pregnancy over the LAST 24 HOURS. Three items: hours of nausea, episodes of vomiting, and episodes of retching or dry heaves without bringing anything up. Each item scores 1 to 5. THE SCALE HAS NO ZERO AND THE TOTAL RUNS ${P.PUQE_MIN} TO ${P.PUQE_MAX}, NOT 0 TO 15. Every item has a minimum of 1 point, which is the "not at all" answer, so a woman with no nausea, no vomiting and no retching scores ${P.PUQE_MIN}. This is the single most important thing to get right: a 0 floor is the overwhelmingly common shape for a symptom instrument, and assuming it here would read a score of 3 as a mild symptom burden rather than as the COMPLETE ABSENCE of symptoms, mis-scaling every comparison. The source states that a value of 3 means no nausea, vomiting or retching and that it is therefore not meaningful to construct a lower category. BANDS: 6 or less is mild, 7 to 12 is moderate, and 13 or more is severe. The numeric boundaries at 7 and 13 are IDENTICAL across every source; only the LABEL for the lowest range diverges, because the instrument own figure calls 6 or less mild while other renderings label 3 separately as no nausea and vomiting of pregnancy and reserve mild for 4 to 6. This tool follows the instrument own figure and reports the alternative reading when the total is 3, the one value where the conventions disagree about what to call the patient. THE WELL-BEING ITEM IS NOT PART OF THE TOTAL AND RUNS IN THE OPPOSITE DIRECTION: the form asks the patient to rate her well-being from 0, the worst possible, to 10, as good as she felt before pregnancy, so higher is BETTER there while higher is WORSE on the PUQE score. Summing it would both corrupt the total and invert the contribution of the one item whose direction disagrees with the rest. It is optional, reported separately, and never added. This quantifies SYMPTOM SEVERITY over 24 hours. It does NOT diagnose hyperemesis gravidarum, which is a clinical diagnosis involving weight loss, dehydration and electrolyte or ketone disturbance that this instrument does not measure: a high score supports the picture but does not establish it, and a woman can be severely dehydrated at a moderate score. It does not exclude the other causes of vomiting in pregnancy, some of which are urgent and unrelated to pregnancy at all. It does not select an antiemetic, decide on admission or intravenous fluids, or indicate any treatment.`,
    compute: P.puqe24,
    fields: [
      ...P.PUQE_ITEMS.map((item) => ({
        dom: `puqe-${item.key}`, arg: item.key, kind: 'enum',
        values: item.options.map((o) => String(o.value)), required: true,
        label: `${item.text} NOTE THE MINIMUM IS 1, NOT 0 [${item.options.map((o) => `${o.value} = ${o.text}`).join('; ')}]`,
      })),
      {
        dom: 'puqe-wellbeing', arg: 'wellbeing', kind: 'number', unit: 'points', required: false,
        // spec-v1075: a 0-10 select on the form; optional here because it is
        // never summed, so omitting it moves no total.
        values: Array.from({ length: 11 }, (_, i) => String(i)),
        label: 'Optional, NEVER SUMMED. The patient rating of her own well-being from 0, the worst possible, to 10, as good as she felt before pregnancy. It is NOT part of the total and runs in the OPPOSITE direction to the score: higher is better here, while a higher PUQE score is worse.',
      },
    ],
  },
];
