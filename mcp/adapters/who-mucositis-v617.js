// spec-v617 MCP wave: adapter for the WHO oral mucositis scale in lib/who-mucositis-v617.js. The dom keys
// mirror the browser renderer (views/group-v617.js) and META['who-mucositis'].example.
//
// **THE SCALE CONFLATES TWO AXES.** Grades 0-2 come from the mucosal APPEARANCE; grades 2-4 come from what
// the patient CAN EAT. Grade 2 is the hinge.
//
// **ABOVE GRADE 2 THE APPEARANCE IS IRRELEVANT** - grades 3 and 4 are separated purely by diet.
// `appearanceIgnored` is returned so this is visible; the grade number alone hides it.
//
// **EXTENSIVE ULCERATION DOES NOT RAISE THE GRADE PAST 2 IF SOLIDS ARE TOLERATED.** The EXTENT of ulceration
// is not scored at all. Never present this as an anatomic severity measure.
//
// **THE DEFINITIONS SAY WHAT THE PATIENT CAN TOLERATE, NOT WHY.** A high grade does not establish that the
// mucosa is the cause; `intakeUnexplainedByMucosa` is returned when intake is limited but the mucosa is
// recorded as normal.
//
// Built for REPORTING (1979 WHO handbook), for comparability across trials - not for bedside management.

import * as W from '../../lib/who-mucositis-v617.js';

export default [
  {
    id: 'who-mucositis',
    summary: `The WHO ORAL TOXICITY SCALE (WHO Handbook for Reporting Results of Cancer Treatment, 1979) grades oral mucositis 0 to 4: ${W.GRADES.map((g) => `grade ${g.grade} = ${g.text}`).join(' ')} **${W.TWO_AXIS_NOTE}** **${W.APPEARANCE_IGNORED_NOTE}** \`appearanceIgnored\` is returned so this is visible, because the grade number alone hides it. **${W.EXTENT_NOTE}** Never present this as an anatomic severity measure. **${W.ATTRIBUTION_NOTE}** \`intakeUnexplainedByMucosa\` is returned when intake is limited but the mucosa is recorded as normal. **${W.PURPOSE_NOTE}** This grades a toxicity for REPORTING. It does NOT diagnose mucositis or its cause, does NOT measure pain, does NOT decide analgesia, oral care, feeding-tube placement or parenteral nutrition, and does NOT decide whether to modify or interrupt cancer treatment.`,
    compute: W.whoMucositis,
    fields: [
      { dom: 'whom-appearance', arg: 'appearance', kind: 'enum', values: W.APPEARANCE.map((a) => a.value), required: true, label: `Mucosal appearance [${W.APPEARANCE.map((a) => `${a.value} = ${a.text}`).join('; ')}]. This decides grades 0 to 2 ONLY - it is ignored at grades 3 and 4.` },
      { dom: 'whom-intake', arg: 'intake', kind: 'enum', values: W.INTAKE.map((i) => i.value), required: true, label: `What the patient can tolerate [${W.INTAKE.map((i) => `${i.value} = ${i.text}`).join('; ')}]. Anything below solids sets the grade on its own.` },
    ],
  },
];
