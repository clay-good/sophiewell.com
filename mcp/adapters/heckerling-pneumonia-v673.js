// spec-v673 MCP adapter: Heckerling clinical prediction rule for pneumonia in
// lib/heckerling-pneumonia-v673.js. The dom keys mirror the browser renderer
// (views/group-v673.js) and META['heckerling-pneumonia'].example. Five predictor flags;
// the 0-5 count maps to a low/intermediate/high probability band. Clinical domain.

import { heckerlingPneumonia } from '../../lib/heckerling-pneumonia-v673.js';

export default [
  {
    id: 'heckerling-pneumonia',
    summary: 'Heckerling clinical prediction rule for pneumonia (Heckerling 1990): five bedside predictors, each 1 point (total 0-5) — temperature > 37.8 C, heart rate > 100/min, crackles/rales, decreased breath sounds, and ABSENCE of asthma. More points = higher probability of a radiographic infiltrate (0-1 low, 2-3 intermediate, 4-5 high) to guide chest imaging. Probabilities are prevalence-dependent (nomogram); pooled ~3/4/14/25/60/81% at 0-5.',
    compute: heckerlingPneumonia,
    fields: [
      { dom: 'heck-fever', arg: 'fever', kind: 'bool', label: 'Temperature > 37.8 C (100 F)' },
      { dom: 'heck-tachy', arg: 'tachycardia', kind: 'bool', label: 'Heart rate > 100 /min' },
      { dom: 'heck-crackles', arg: 'crackles', kind: 'bool', label: 'Crackles (rales) on auscultation' },
      { dom: 'heck-breath', arg: 'decreasedBreathSounds', kind: 'bool', label: 'Decreased breath sounds' },
      { dom: 'heck-noasthma', arg: 'noAsthma', kind: 'bool', label: 'Absence of asthma (patient has no asthma)' },
    ],
  },
];
