// spec-v183 MCP wave: adapters for the four hepatology / GI-surgery scores in
// lib/gisurg-v239.js — the Bonacini cirrhosis discriminant score, the Goteborg
// University Cirrhosis Index (GUCI), the Mannheim Peritonitis Index, and the Boey
// score for perforated peptic ulcer. dom keys mirror views/group-v239.js; the
// Bonacini and GUCI inputs are numeric, MPI mixes boolean factors with a numeric
// exudate select, and Boey takes three boolean risk factors.

import * as F from '../../lib/gisurg-v239.js';

export default [
  {
    id: 'bonacini-cds',
    summary: 'Bonacini cirrhosis discriminant score (Bonacini M, et al. Am J Gastroenterol 1997): platelets, ALT/AST ratio, and INR each binned to points for a 0-11 total, where <= 3 makes cirrhosis unlikely and >= 8 likely.',
    compute: F.bonaciniCds,
    fields: [
      { dom: 'bon-plt', arg: 'platelet', kind: 'number', required: true, label: 'Platelet count', unit: '10^3/uL' },
      { dom: 'bon-ratio', arg: 'altAstRatio', kind: 'number', required: true, label: 'ALT / AST ratio' },
      { dom: 'bon-inr', arg: 'inr', kind: 'number', required: true, label: 'INR' },
    ],
  },
  {
    id: 'guci',
    summary: 'Goteborg University Cirrhosis Index (Islam S, et al. Scand J Gastroenterol 2005) = (AST / upper-limit-of-normal) x INR x 100 / platelet count (10^9/L); a value > 1.0 suggests cirrhosis.',
    compute: F.guci,
    fields: [
      { dom: 'guci-ast', arg: 'ast', kind: 'number', required: true, label: 'AST', unit: 'U/L' },
      { dom: 'guci-uln', arg: 'astUln', kind: 'number', required: true, label: 'AST upper limit of normal', unit: 'U/L' },
      { dom: 'guci-inr', arg: 'inr', kind: 'number', required: true, label: 'INR' },
      { dom: 'guci-plt', arg: 'platelet', kind: 'number', required: true, label: 'Platelet count', unit: '10^9/L' },
    ],
  },
  {
    id: 'mannheim-peritonitis-index',
    summary: 'Mannheim Peritonitis Index (Wacha H, Linder MM, et al. 1987): weighted intraoperative factors (age, sex, organ failure, malignancy, duration, origin, spread, exudate) summed to 0-47, where > 26 marks high mortality risk.',
    compute: F.mannheimPeritonitisIndex,
    fields: [
      { dom: 'mpi-age', arg: 'ageOver50', kind: 'bool', required: true, label: 'Age > 50 years (5)' },
      { dom: 'mpi-female', arg: 'female', kind: 'bool', required: true, label: 'Female sex (5)' },
      { dom: 'mpi-organ', arg: 'organFailure', kind: 'bool', required: true, label: 'Organ failure (7)' },
      { dom: 'mpi-malig', arg: 'malignancy', kind: 'bool', required: false, label: 'Malignancy (4)' },
      { dom: 'mpi-dur', arg: 'duration24', kind: 'bool', required: false, label: 'Preoperative duration > 24 h (4)' },
      { dom: 'mpi-noncolonic', arg: 'nonColonic', kind: 'bool', required: false, label: 'Origin of sepsis not colonic (4)' },
      { dom: 'mpi-diffuse', arg: 'diffuse', kind: 'bool', required: true, label: 'Diffuse generalized peritonitis (6)' },
      { dom: 'mpi-exudate', arg: 'exudate', kind: 'number', required: true, label: 'Exudate (clear 0 / cloudy-purulent 6 / fecal 12)' },
    ],
  },
  {
    id: 'boey-score',
    summary: 'Boey score (Boey J, et al. Ann Surg 1987) for perforated peptic ulcer: preoperative shock, perforation present > 24 h, and significant comorbidity, each 1 point (0-3), with operative mortality rising steeply per factor.',
    compute: F.boeyScore,
    fields: [
      { dom: 'boey-shock', arg: 'shock', kind: 'bool', required: true, label: 'Preoperative shock (SBP < 100 mmHg)' },
      { dom: 'boey-delay', arg: 'delayed', kind: 'bool', required: true, label: 'Perforation present > 24 h' },
      { dom: 'boey-comorb', arg: 'comorbidity', kind: 'bool', required: false, label: 'Significant medical comorbidity' },
    ],
  },
];
