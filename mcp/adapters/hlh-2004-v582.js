// spec-v582 MCP wave: adapter for the HLH-2004 diagnostic criteria in lib/hlh-2004-v582.js. The dom keys
// mirror the browser renderer (views/group-v582.js) and META['hlh-2004'].example.
//
// **THERE ARE TWO PATHS AND THE FIRST ONE BYPASSES THE CRITERIA ENTIRELY.** The source reads "The diagnosis
// HLH can be established if one of either 1 or 2 below is fulfilled", where 1 is a molecular diagnosis
// consistent with HLH. A patient with a confirmed causative mutation MEETS the guideline with ZERO of the
// eight criteria. Counting criteria alone reports such a patient backwards.
//
// **"NO EVIDENCE OF MALIGNANCY" IS A NINTH BULLET, NOT A NINTH CRITERION.** It is printed in the primary
// table alongside the clinical items, but the requirement is five of EIGHT. Counting it gives nine and
// inflates every total by one. The tool asks it, reports it, and does NOT count it.
//
// **THE PRIMARY GIVES NO FEVER THRESHOLD.** Table I says only "Fever". The 38.5 degrees C figure carried by
// many widely reproduced secondary tables is NOT in the source, so fever is a clinical judgment here.
//
// **PENDING IS NOT THE SAME AS NOT MET.** NK-cell activity and soluble CD25 are send-out assays that
// routinely return days after the question is asked, and NK-cell activity has NO universal cutoff - the
// source defines it "according to local laboratory reference", so the local lab's verdict is the input. With
// 4 met and 2 pending the diagnosis is NOT excluded, and the tool says so explicitly rather than reporting a
// flat negative. Reporting "does not meet HLH-2004" while assays are outstanding is the dangerous failure
// here, because untreated HLH is rapidly fatal.
//
// **TWO OF THE EIGHT ARE THEMSELVES COMPOUND**: cytopenias require 2 of 3 LINEAGES (with a separate
// hemoglobin threshold for infants under 4 weeks), and the fourth criterion is an OR of two unrelated labs.
// The eight criteria are not eight yes/no questions.
//
// NOT THE HSCORE. `hscore-hlh` in this catalog returns a PROBABILITY of reactive hemophagocytic syndrome in
// adults; this is a CRITERIA CHECKLIST from a pediatric treatment protocol. Different construction,
// different population, different output.
//
// UNIT CONVERSIONS ARE EXACT AND STATED: hemoglobin 90 g/L = 9 g/dL; fibrinogen 1.5 g/L = 150 mg/dL;
// ferritin ug/L and ng/mL are numerically identical; 265 mg/dL is the source's own triglyceride figure.

import * as H from '../../lib/hlh-2004-v582.js';

export default [
  {
    id: 'hlh-2004',
    summary: `The HLH-2004 diagnostic criteria for hemophagocytic lymphohistiocytosis (Henter and colleagues 2007, Table I). **THERE ARE TWO PATHS AND THE FIRST BYPASSES THE CRITERIA ENTIRELY**: the diagnosis is established if EITHER a molecular diagnosis consistent with HLH is present, OR ${H.CRITERIA_REQUIRED} of ${H.CRITERIA_TOTAL} criteria are met. A patient with a confirmed causative mutation MEETS the guideline with ZERO clinical criteria, and counting criteria alone reports that patient backwards. THE EIGHT CRITERIA: fever; splenomegaly; cytopenias affecting 2 of 3 lineages (hemoglobin under ${H.HB_THRESHOLD} g/dL, or under ${H.HB_THRESHOLD_INFANT} g/dL in infants under 4 weeks; platelets under ${H.PLT_THRESHOLD} x10^9/L; neutrophils under ${H.ANC_THRESHOLD} x10^9/L); hypertriglyceridemia at or above ${H.TRIG_THRESHOLD} mg/dL AND/OR hypofibrinogenemia at or below ${H.FIBRINOGEN_THRESHOLD} mg/dL; hemophagocytosis in bone marrow, spleen or lymph nodes; low or absent NK-cell activity; ferritin at or above ${H.FERRITIN_THRESHOLD} micrograms/L; soluble CD25 at or above ${H.SCD25_THRESHOLD} U/mL. **TWO OF THE EIGHT ARE THEMSELVES COMPOUND** - cytopenias require 2 of 3 lineages and the fourth is an OR of two unrelated labs - so the eight are NOT eight yes/no questions. **"NO EVIDENCE OF MALIGNANCY" IS A NINTH BULLET, NOT A NINTH CRITERION**: it is printed in the primary table but the requirement is five of EIGHT, and counting it inflates every total by one. It is reported here and deliberately not counted; malignancy-associated HLH is a recognized entity, so its presence does not rule the diagnosis out. **THE PRIMARY GIVES NO FEVER THRESHOLD** - Table I says only "Fever", and the 38.5 degrees C figure carried by many secondary reproductions is NOT in the source. **PENDING IS NOT THE SAME AS NOT MET**: NK-cell activity and soluble CD25 are send-out assays that routinely return days later, and NK-cell activity has no universal cutoff since the source defines it "according to local laboratory reference". Mark an unreturned assay "pending", not "no". With 4 met and 2 pending the diagnosis is NOT excluded, and reporting a flat "does not meet HLH-2004" while assays are outstanding is the dangerous failure here, because untreated HLH is rapidly fatal. **NOT THE HSCORE**: \`hscore-hlh\` in this catalog returns a probability of reactive hemophagocytic syndrome in adults; this is a criteria checklist from a pediatric treatment protocol. These are diagnostic criteria from a treatment protocol: meeting them is NOT an instruction to start etoposide and dexamethasone. They do NOT identify the trigger, and infection, malignancy and rheumatologic disease all drive secondary HLH and each needs its own treatment. Failing them does NOT exclude HLH, particularly early in the course. Unit conversions used here are exact: hemoglobin 90 g/L = 9 g/dL, fibrinogen 1.5 g/L = 150 mg/dL, and ferritin micrograms/L and ng/mL are numerically identical.`,
    compute: H.hlh2004,
    fields: [
      {
        dom: 'hlh-molecular', arg: 'molecularDiagnosis', kind: 'enum', values: ['yes', 'no'], required: true,
        label: 'A molecular diagnosis consistent with HLH. THIS IS AN ALTERNATIVE PATH: yes establishes the diagnosis on its own, with none of the eight criteria.',
      },
      { dom: 'hlh-fever', arg: 'fever', kind: 'enum', values: ['yes', 'no', 'pending'], required: true, label: 'Fever. The primary table gives NO temperature threshold; the 38.5 degrees C figure in secondary tables is not in the source.' },
      { dom: 'hlh-spleen', arg: 'splenomegaly', kind: 'enum', values: ['yes', 'no', 'pending'], required: true, label: 'Splenomegaly. No size threshold is given in the source.' },
      { dom: 'hlh-hemophag', arg: 'hemophagocytosis', kind: 'enum', values: ['yes', 'no', 'pending'], required: true, label: 'Hemophagocytosis in bone marrow, spleen or lymph nodes. Its absence at presentation does not exclude HLH; the source encourages a further search.' },
      { dom: 'hlh-infant', arg: 'infantUnder4Weeks', kind: 'enum', values: ['yes', 'no'], required: true, label: `Infant under 4 weeks old, which raises the hemoglobin threshold from ${H.HB_THRESHOLD} to ${H.HB_THRESHOLD_INFANT} g/dL.` },
      { dom: 'hlh-hb', arg: 'hemoglobin', kind: 'number', unit: 'g/dL', required: true, label: `Hemoglobin. Counts as a low lineage under ${H.HB_THRESHOLD} g/dL (source 90 g/L), or under ${H.HB_THRESHOLD_INFANT} in infants under 4 weeks.` },
      { dom: 'hlh-plt', arg: 'platelets', kind: 'number', unit: 'x10^9/L', required: true, label: `Platelets. Counts as a low lineage under ${H.PLT_THRESHOLD} x10^9/L.` },
      { dom: 'hlh-anc', arg: 'neutrophils', kind: 'number', unit: 'x10^9/L', required: true, label: `Neutrophils. Counts as a low lineage under ${H.ANC_THRESHOLD} x10^9/L. ${H.LINEAGES_REQUIRED} of the 3 lineages must be low for the single cytopenia criterion.` },
      { dom: 'hlh-trig', arg: 'triglycerides', kind: 'number', unit: 'mg/dL', required: true, label: `Fasting triglycerides. Meets at ${H.TRIG_THRESHOLD} mg/dL or above (source 3.0 mmol/L). Shares ONE criterion with fibrinogen: either alone satisfies it.` },
      { dom: 'hlh-fib', arg: 'fibrinogen', kind: 'number', unit: 'mg/dL', required: true, label: `Fibrinogen. Meets at ${H.FIBRINOGEN_THRESHOLD} mg/dL or BELOW (source 1.5 g/L). Shares one criterion with triglycerides.` },
      { dom: 'hlh-nk', arg: 'nkCellActivity', kind: 'enum', values: ['yes', 'no', 'pending'], required: true, label: 'NK-cell activity LOW OR ABSENT by local laboratory reference. There is no universal cutoff, so the local laboratory verdict is the input. A send-out assay: use "pending" if it has not returned.' },
      { dom: 'hlh-ferritin', arg: 'ferritin', kind: 'number', unit: 'ug/L', required: true, label: `Ferritin. Meets at ${H.FERRITIN_THRESHOLD} micrograms/L or above; micrograms/L and ng/mL are numerically identical.` },
      { dom: 'hlh-scd25-status', arg: 'scd25Status', kind: 'enum', values: ['resulted', 'pending'], required: true, label: 'Whether the soluble CD25 assay has returned. "pending" makes the criterion UNEVALUABLE and the number is ignored - pending is not the same as not met.' },
      { dom: 'hlh-scd25', arg: 'scd25', kind: 'number', unit: 'U/mL', required: false, label: `Soluble CD25 (soluble IL-2 receptor). Meets at ${H.SCD25_THRESHOLD} U/mL or above. A send-out assay: use "pending" if it has not returned.` },
      { dom: 'hlh-malignancy', arg: 'noEvidenceOfMalignancy', kind: 'enum', values: ['yes', 'no'], required: true, label: 'No evidence of malignancy. REPORTED BUT NOT COUNTED - it is printed in the primary table but is not one of the eight criteria.' },
    ],
  },
];
