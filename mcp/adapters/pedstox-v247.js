// spec-v183 MCP wave: adapters for the four pediatric acute-care + toxicology
// tools in lib/pedstox-v247.js — the Pediatric Trauma Score (Tepas), the BIND
// score for acute bilirubin encephalopathy, the Widmark blood-alcohol estimate,
// and the POVOC pediatric postoperative-vomiting score. dom keys mirror
// views/group-v247.js.

import * as F from '../../lib/pedstox-v247.js';

export default [
  {
    id: 'pediatric-trauma-score',
    summary: 'Pediatric Trauma Score (Tepas 1987): six components each -1 / +1 / +2, total -6..+12; a score <= 8 indicates increased mortality and prompts transfer to a pediatric trauma center.',
    compute: F.pediatricTraumaScore,
    fields: [
      { dom: 'pts-wt', arg: 'weight', kind: 'number', required: true, label: 'Weight (> 20 kg / 10-20 kg / < 10 kg)' },
      { dom: 'pts-air', arg: 'airway', kind: 'number', required: true, label: 'Airway (normal / maintainable / unmaintainable)' },
      { dom: 'pts-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP (> 90 / 50-90 / < 50)' },
      { dom: 'pts-cns', arg: 'cns', kind: 'number', required: true, label: 'CNS (awake / obtunded / comatose)' },
      { dom: 'pts-wound', arg: 'wound', kind: 'number', required: true, label: 'Open wound (none / minor / major)' },
      { dom: 'pts-skel', arg: 'skeletal', kind: 'number', required: true, label: 'Skeletal (none / closed / open-multiple)' },
    ],
  },
  {
    id: 'bind-score',
    summary: 'Bilirubin-Induced Neurologic Dysfunction score (Johnson & Bhutani 1999): mental status, muscle tone, and cry pattern, each 0-3; total 0-9 grades acute bilirubin encephalopathy.',
    compute: F.bindScore,
    fields: [
      { dom: 'bind-ms', arg: 'mentalStatus', kind: 'number', required: true, label: 'Mental status' },
      { dom: 'bind-mt', arg: 'muscleTone', kind: 'number', required: true, label: 'Muscle tone' },
      { dom: 'bind-cry', arg: 'cry', kind: 'number', required: true, label: 'Cry pattern' },
    ],
  },
  {
    id: 'widmark-bac',
    summary: 'Widmark blood-alcohol estimate (1932): BAC = A / (r x weight x 10) - 0.015 x hours, where r = 0.68 (male) / 0.55 (female); a population estimate, not a legal measurement.',
    compute: F.widmarkBac,
    fields: [
      { dom: 'wid-grams', arg: 'grams', kind: 'number', required: true, label: 'Pure alcohol consumed', unit: 'g' },
      { dom: 'wid-weight', arg: 'weight', kind: 'number', required: true, label: 'Body weight', unit: 'kg' },
      { dom: 'wid-hours', arg: 'hours', kind: 'number', required: true, label: 'Hours since drinking', unit: 'h' },
      { dom: 'wid-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], required: true, label: 'Sex' },
    ],
  },
  {
    id: 'povoc-ponv',
    summary: 'POVOC pediatric postoperative-vomiting score (Eberhart 2004): surgery >= 30 min, age >= 3 years, POV/PONV history, and strabismus surgery, each 1 point; total 0-4 stratifies risk.',
    compute: F.povocPonv,
    fields: [
      { dom: 'pov-dur', arg: 'duration', kind: 'bool', required: true, label: 'Surgery >= 30 minutes' },
      { dom: 'pov-age', arg: 'age', kind: 'bool', required: true, label: 'Age >= 3 years' },
      { dom: 'pov-hist', arg: 'history', kind: 'bool', required: true, label: 'History of POV/PONV (self or relative)' },
      { dom: 'pov-strab', arg: 'strabismus', kind: 'bool', required: false, label: 'Strabismus surgery' },
    ],
  },
];
