// spec-v1563 MCP adapter: arbovirus-admission-check in lib/arbovirus-admission-check-v1563.js.
// The dom keys mirror views/group-v1563.js and META['arbovirus-admission-check'].example. Clinical domain.

import * as M from '../../lib/arbovirus-admission-check-v1563.js';

export default [
  {
    id: 'arbovirus-admission-check',
    summary: 'Lists WHO 2025 signs that might prompt hospitalizing a dengue patient. Chikungunya, Zika and yellow fever go to individual assessment; no NSAIDs, acetaminophen by weight.',
    compute: M.arbovirusAdmissionCheck,
    fields: [
      { dom: 'ab-disease', arg: 'disease', kind: 'enum', required: true, label: 'Disease', values: M.DISEASE_OPTIONS.map((d) => d.value) },
      { dom: 'ab-abdo', arg: 'abdo', kind: 'enum', label: 'Abdominal pain, continuous or intense', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ab-sensory', arg: 'sensory', kind: 'enum', label: 'Irritability, drowsiness or lethargy', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ab-mucosal', arg: 'mucosal', kind: 'enum', label: 'Mucosal bleeding', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ab-liver', arg: 'liver', kind: 'enum', label: 'Liver more than 2 cm below the ribs', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ab-vomit', arg: 'vomit', kind: 'enum', label: 'Persistent vomiting (3 in 1 hour or 4 in 6 hours)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ab-hct', arg: 'hct', kind: 'enum', label: 'Hematocrit rising on 2 measurements in a row', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ab-severe', arg: 'severe', kind: 'enum', label: 'Severe dengue (WHO 2009)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ab-oral', arg: 'oral', kind: 'enum', label: 'Unable to tolerate oral fluids', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ab-breath', arg: 'breath', kind: 'enum', label: 'Difficulty breathing', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ab-pulse', arg: 'pulse', kind: 'enum', label: 'Narrowing pulse pressure', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ab-hypo', arg: 'hypo', kind: 'enum', label: 'Low blood pressure', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ab-renal', arg: 'renal', kind: 'enum', label: 'Acute kidney failure', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ab-crt', arg: 'crt', kind: 'enum', label: 'Prolonged capillary refill', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ab-preg', arg: 'preg', kind: 'enum', label: 'Pregnancy', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ab-coag', arg: 'coag', kind: 'enum', label: 'Coagulopathy', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ab-risk', arg: 'risk', kind: 'enum', label: 'Extreme of age or a high-risk condition', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ab-weight', arg: 'weight', kind: 'number', label: 'Weight in kg (for the acetaminophen dose)', min: 1, max: 250 },
    ],
  },
];
