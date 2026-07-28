// spec-v570 MCP wave: adapter for the New Global Definition of ARDS in lib/global-ards-v570.js. The dom
// keys mirror the browser renderer (views/group-v570.js) and META['global-ards'].example.
//
// **NONINTUBATED ARDS HAS NO SEVERITY GRADING AT ALL.** Mild, moderate and severe exist ONLY for intubated
// ARDS. There is no such thing as "moderate nonintubated ARDS". A definition that grades one branch invites
// grading all of them, and an agent that reports a severity for a nonintubated patient is inventing a
// category. The tool returns `severity: null` outside the intubated branch.
//
// **THE RESOURCE-LIMITED BRANCH IS A TERMINAL DEAD END, NOT A MILDER CATEGORY.** It requires NO positive
// end-expiratory pressure and NO minimum oxygen flow rate, accepts ONLY the SpO2:FiO2 ratio, and carries no
// severity grade. A patient meeting it has not been shown to be less sick - only to have been assessed with
// fewer resources.
//
// **THE SpO2:FiO2 RATIO IS INVALID ABOVE AN SpO2 OF 97 PERCENT, AND THAT IS A HARD GATE.** Above 97 percent
// the saturation sits on the flat part of the dissociation curve and the ratio stops tracking oxygenation.
// The tool REFUSES to assess rather than returning a confident number from a measurement the source
// excludes. Pulse oximetry is also not recommended at all when methemoglobinemia or carboxyhemoglobinemia
// is suspected.
//
// **EVERY INTUBATED SEVERITY CATEGORY REQUIRES A MINIMUM PEEP OF 5 cm H2O.** Severity is not read off the
// ratio alone. The nonintubated category has its own floor: high-flow nasal oxygen at 30 L/min or more, or
// NIV/CPAP with at least 5 cm H2O end-expiratory pressure.
//
// TWO CORRECTIONS THE SOURCE SPECIFIES: estimated FiO2 on nasal flow is ambient plus 0.03 x flow in L/min,
// and above 1,000 m altitude the ratio is multiplied by barometric pressure over 760.

import * as A from '../../lib/global-ards-v570.js';

export default [
  {
    id: 'global-ards',
    summary: `The NEW GLOBAL DEFINITION OF ARDS (Matthay and colleagues, AJRCCM 2024), the SUCCESSOR to the 2012 Berlin definition. Berlin required intubation and an arterial blood gas; the global definition adds a NONINTUBATED category (on high-flow nasal oxygen at ${A.MIN_HFNO_FLOW} L/min or more, or NIV/CPAP with at least ${A.MIN_PEEP} cm H2O end-expiratory pressure) and a RESOURCE-LIMITED category (needing neither a blood gas nor any positive pressure), and admits pulse oximetry and lung ultrasound as evidence. CRITERIA APPLYING TO ALL CATEGORIES: an acute predisposing risk factor (pneumonia, nonpulmonary infection, trauma, transfusion, burn, aspiration, or shock); edema NOT exclusively or primarily attributable to cardiogenic pulmonary edema or fluid overload and hypoxemia not primarily attributable to atelectasis; onset or worsening within ONE WEEK of the risk factor or of new or worsening respiratory symptoms; and BILATERAL opacities on radiography or CT, or bilateral B lines and/or consolidations on ultrasound, not fully explained by effusions, atelectasis or nodules. **NONINTUBATED ARDS HAS NO SEVERITY GRADING AT ALL** - mild, moderate and severe exist ONLY for intubated ARDS, so there is no such thing as "moderate nonintubated ARDS", and reporting a severity outside the intubated branch invents a category. INTUBATED SEVERITY: MILD is PaO2:FiO2 above 200 and up to 300, or SpO2:FiO2 above 235 and up to 315; MODERATE is above 100 up to 200, or above 148 up to 235; SEVERE is 100 or below, or 148 or below. **EVERY INTUBATED SEVERITY CATEGORY REQUIRES A MINIMUM PEEP OF ${A.MIN_PEEP} cm H2O** - severity is not read off the ratio alone. **THE RESOURCE-LIMITED BRANCH IS A TERMINAL DEAD END, NOT A MILDER CATEGORY**: it requires no PEEP and no minimum oxygen flow, accepts ONLY the SpO2:FiO2 ratio, and carries no severity grade, so a patient meeting it has not been shown to be less sick, only to have been assessed with fewer resources. **THE SpO2:FiO2 RATIO IS INVALID ABOVE AN SpO2 OF ${A.SPO2_VALIDITY_CEILING} PERCENT AND THIS IS A HARD GATE**: above that the saturation sits on the flat part of the dissociation curve and the ratio stops tracking oxygenation, so the tool REFUSES to assess rather than returning a confident number from a measurement the source excludes. Pulse oximetry is also not recommended at all when a hemoglobin abnormality such as methemoglobinemia or carboxyhemoglobinemia is suspected. TWO CORRECTIONS THE SOURCE SPECIFIES: ${A.FIO2_ESTIMATE} ${A.ALTITUDE_CORRECTION} Blood gas and oximetry should be measured with the patient comfortably at rest and at least 30 minutes after changes in position, FiO2 or flow rate. PATIENTS MOVE BETWEEN CATEGORIES during their illness, so a severity grade describes one moment rather than labelling the admission. This is a DEFINITION for identifying a syndrome, NOT a severity score and NOT a prognostic model. It does NOT identify the cause, which is what gets treated - pneumonia, aspiration, pancreatitis, transfusion and trauma all produce it and diverge sharply in management. It does NOT exclude cardiogenic pulmonary edema, which is a clinical judgment the definition requires the user to have already made. It does not indicate intubation, prone positioning, neuromuscular blockade or extracorporeal support, and meeting a severity category is not by itself an indication for any of them.`,
    compute: A.globalArds,
    fields: [
      {
        dom: 'ards-setting', arg: 'setting', kind: 'enum',
        values: A.ARDS_SETTINGS.map((s) => s.value), required: true,
        label: `Category. Decides whether a severity grade exists at all: ONLY the intubated category is graded [${A.ARDS_SETTINGS.map((s) => `${s.value} = ${s.text}`).join(' ')}]`,
      },
      ...A.COMMON_CRITERIA.map((c) => ({
        dom: `ards-${c.key}`, arg: c.key, kind: 'enum', values: ['no', 'yes'], required: true,
        label: `Criterion applying to ALL categories. ${c.text}`,
      })),
      {
        dom: 'ards-peep', arg: 'peepAtLeast5', kind: 'enum', values: ['no', 'yes'], required: false,
        label: `INTUBATED ONLY. Whether PEEP is at least ${A.MIN_PEEP} cm H2O. Required for EVERY intubated severity category; severity is not read off the ratio alone.`,
      },
      {
        dom: 'ards-support', arg: 'nonintubatedSupport', kind: 'enum', values: ['no', 'yes'], required: false,
        label: `NONINTUBATED ONLY. Whether the patient is on high-flow nasal oxygen at ${A.MIN_HFNO_FLOW} L/min or more, or NIV/CPAP with at least ${A.MIN_PEEP} cm H2O end-expiratory pressure.`,
      },
      {
        dom: 'ards-ratio-type', arg: 'ratioType', kind: 'enum',
        values: A.RATIO_TYPES.map((r) => r.value), required: true,
        label: `Which oxygenation ratio. The resource-limited category accepts SpO2:FiO2 ONLY [${A.RATIO_TYPES.map((r) => `${r.value} = ${r.label}`).join('; ')}]`,
      },
      {
        dom: 'ards-ratio', arg: 'ratioValue', kind: 'number', unit: 'ratio', required: true,
        label: 'The oxygenation ratio value. Apply the altitude correction first if above 1,000 m.',
      },
      {
        dom: 'ards-spo2', arg: 'spo2', kind: 'number', unit: '%', required: false,
        label: `Oxygen saturation. REQUIRED when using SpO2:FiO2, because the ratio is INVALID above ${A.SPO2_VALIDITY_CEILING} percent and the tool refuses to assess there.`,
      },
    ],
  },
];
