// spec-v594 MCP wave: adapter for the ARC-HBR criteria in lib/arc-hbr-v594.js. The dom keys mirror the
// browser renderer (views/group-v594.js) and META['arc-hbr'].example.
//
// **THE RULE IS ONE MAJOR OR TWO MINOR.** Two minor criteria are worth one major, so a patient with minor
// criteria alone and NO major criterion IS at high bleeding risk. A widely used online calculator summarizes
// the rule as "at least one major criterion", which reports exactly those patients as not at high risk.
// `qualifiesOnMinorsAlone` marks them - report that flag.
//
// **THE SAME VARIABLE APPEARS AS BOTH MAJOR AND MINOR AT DIFFERENT VALUES, SO THESE ARE NOT TWENTY
// INDEPENDENT BOXES.** Anemia, kidney function, prior bleeding and prior stroke are BANDED: a hemoglobin of
// 10 is MAJOR, a hemoglobin of 12 in a man is MINOR, and the same patient cannot be both. Each is taken ONCE
// here and its tier derived, which makes double-counting impossible. Do NOT pass separate "major anemia" and
// "minor anemia" flags - there are none.
//
// **THE ANEMIA MINOR BAND IS SEX-SPLIT AND THE MAJOR IS NOT.** Under 11 g/dL is major for everyone; the
// minor band is 11 to 12.9 for men and 11 to 11.9 for women. Sex matters ONLY inside the minor band, so a
// hemoglobin of 12.0 is a minor criterion in a man and NO criterion at all in a woman.
//
// **THERE ARE SIX DIFFERENT TIMING WINDOWS**: spontaneous bleeding within 6 months major and 6 to 12 months
// minor; traumatic intracranial hemorrhage within 12 months; SPONTANEOUS intracranial hemorrhage at ANY
// time; moderate or severe ischemic stroke within 6 months major and any other ischemic stroke minor; major
// surgery or trauma within 30 days; active malignancy within 12 months. Carrying one window across the set
// is the commonest error.
//
// **IT IS A DEFINITION, NOT A SCORE.** No points, no ranking. It targets an ABSOLUTE risk - BARC 3 to 5
// bleeding at or above 4 percent, or intracranial hemorrhage at or above 1 percent, at one year. The
// criteria counts are provenance for the verdict, NOT a severity measure, and must not be presented as one.

import * as A from '../../lib/arc-hbr-v594.js';

export default [
  {
    id: 'arc-hbr',
    summary: `The ARC-HBR CRITERIA (Academic Research Consortium for High Bleeding Risk, Urban and colleagues 2019) define HIGH BLEEDING RISK in patients undergoing percutaneous coronary intervention. **THE RULE IS ${A.MAJOR_REQUIRED} MAJOR CRITERION OR ${A.MINOR_REQUIRED} MINOR CRITERIA** - two minor are worth one major, so a patient with minor criteria alone and NO major criterion IS at high bleeding risk. A widely used online calculator summarizes the rule as "at least one major criterion", which reports exactly those patients as NOT at high risk; \`qualifiesOnMinorsAlone\` marks them and must be reported. **THE SAME VARIABLE APPEARS AS BOTH MAJOR AND MINOR AT DIFFERENT VALUES, SO THESE ARE NOT TWENTY INDEPENDENT BOXES**: anemia, kidney function, prior bleeding and prior stroke are BANDED. Hemoglobin under ${A.HB_MAJOR_BELOW} g/dL is MAJOR; ${A.HB_MAJOR_BELOW} to ${A.HB_MINOR_MAX_MALE} is MINOR for men and ${A.HB_MAJOR_BELOW} to ${A.HB_MINOR_MAX_FEMALE} for women. eGFR under ${A.EGFR_MAJOR_BELOW} is MAJOR and ${A.EGFR_MAJOR_BELOW} to ${A.EGFR_MINOR_BELOW - 1} is MINOR. Each is taken ONCE and its tier derived, so double-counting is impossible - do NOT pass separate "major anemia" and "minor anemia" flags, there are none. **THE ANEMIA MINOR BAND IS SEX-SPLIT AND THE MAJOR IS NOT**, so a hemoglobin of 12.0 is a MINOR criterion in a man and NO criterion at all in a woman. OTHER MAJOR CRITERIA: platelet count under ${A.PLATELET_MAJOR_BELOW} x10^9/L; ${A.MAJOR_BOOLEANS.map((m) => m.text.toLowerCase()).join('; ')}; and ${A.BLEEDING_OPTIONS.find((b) => b.tier === 'major').text.toLowerCase()}; and ${A.STROKE_OPTIONS.find((s) => s.tier === 'major').text.toLowerCase()}. OTHER MINOR CRITERIA: age ${A.AGE_MINOR_AT_LEAST} or over; ${A.MINOR_BOOLEANS.map((m) => m.text.toLowerCase()).join('; ')}; ${A.BLEEDING_OPTIONS.find((b) => b.tier === 'minor').text.toLowerCase()}; and ${A.STROKE_OPTIONS.find((s) => s.tier === 'minor').text.toLowerCase()}. **THERE ARE SIX DIFFERENT TIMING WINDOWS** - 6 months, 6 to 12 months, 12 months, any time, 30 days - and carrying one across the set is the commonest error. **IT IS A DEFINITION, NOT A SCORE**: no points and no ranking, targeting an ABSOLUTE risk of BARC 3 to 5 bleeding at or above ${A.TARGET_BARC_RISK_PERCENT} percent or intracranial hemorrhage at or above ${A.TARGET_ICH_RISK_PERCENT} percent at one year. The criteria counts are PROVENANCE for the verdict, NOT a severity measure. This identifies BLEEDING risk and does NOT weigh it against ISCHEMIC risk - the two travel together, since most features that raise bleeding risk also raise ischemic risk. Meeting the definition is NOT an instruction to shorten dual antiplatelet therapy, to drop an agent, to choose a particular stent, or to withhold anticoagulation for an indication that needs it. It does NOT predict bleeding in an individual.`,
    compute: A.arcHbr,
    fields: [
      { dom: 'arc-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], required: true, label: `Sex. Used ONLY for the anemia MINOR band (${A.HB_MAJOR_BELOW} to ${A.HB_MINOR_MAX_MALE} for men, ${A.HB_MAJOR_BELOW} to ${A.HB_MINOR_MAX_FEMALE} for women). The major anemia threshold is the same for both.` },
      { dom: 'arc-hemoglobin', arg: 'hemoglobin', kind: 'number', unit: 'g/dL', required: true, label: `Hemoglobin. BANDED: under ${A.HB_MAJOR_BELOW} is MAJOR, the sex-specific band above it is MINOR, and the same patient cannot be both.` },
      { dom: 'arc-egfr', arg: 'egfr', kind: 'number', unit: 'mL/min', required: true, label: `eGFR. BANDED: under ${A.EGFR_MAJOR_BELOW} is MAJOR, ${A.EGFR_MAJOR_BELOW} to ${A.EGFR_MINOR_BELOW - 1} is MINOR.` },
      { dom: 'arc-platelets', arg: 'platelets', kind: 'number', unit: 'x10^9/L', required: true, label: `Platelet count. Under ${A.PLATELET_MAJOR_BELOW} is a MAJOR criterion.` },
      { dom: 'arc-age', arg: 'age', kind: 'number', unit: 'years', required: true, label: `Age. ${A.AGE_MINOR_AT_LEAST} or over is a MINOR criterion.` },
      { dom: 'arc-priorBleeding', arg: 'priorBleeding', kind: 'enum', values: A.BLEEDING_OPTIONS.map((b) => b.value), required: true, label: `Prior spontaneous bleeding. BANDED across major and minor by TIMING [${A.BLEEDING_OPTIONS.map((b) => `${b.value} = ${b.tier || 'no criterion'}`).join('; ')}]` },
      { dom: 'arc-priorStroke', arg: 'priorStroke', kind: 'enum', values: A.STROKE_OPTIONS.map((s) => s.value), required: true, label: `Prior ischemic stroke. BANDED across major and minor [${A.STROKE_OPTIONS.map((s) => `${s.value} = ${s.tier || 'no criterion'}`).join('; ')}]` },
      ...A.MAJOR_BOOLEANS.map((m) => ({
        dom: `arc-${m.key}`, arg: m.key, kind: 'enum', values: ['no', 'yes'], required: true,
        label: `${m.text}. A MAJOR criterion: one alone makes the patient high bleeding risk.`,
      })),
      ...A.MINOR_BOOLEANS.map((m) => ({
        dom: `arc-${m.key}`, arg: m.key, kind: 'enum', values: ['no', 'yes'], required: true,
        label: `${m.text}. A MINOR criterion: two minor criteria together make the patient high bleeding risk.`,
      })),
    ],
  },
];
