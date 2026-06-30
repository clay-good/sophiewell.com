// spec-v183 MCP wave 6: adapters for the five lib/uro-v131.js urology complexity
// scores (CAPRA prostate-cancer recurrence, the R.E.N.A.L. and PADUA renal-mass
// nephrometry scores, S.T.O.N.E. nephrolithometry, and the TWIST torsion score).
// dom keys mirror views/group-v131.js; component grades are enums the lib
// lvl()-coerces, dimensions are numbers, the hilar suffix is an enum ('' / 'h'),
// and the TWIST yes/no findings are booleans the lib present()-coerces.

import * as F from '../../lib/uro-v131.js';

export default [
  {
    id: 'capra-score',
    summary: 'UCSF CAPRA score (Cooperberg 2005): a 0-10 predictor of biochemical recurrence after radical prostatectomy from age, PSA, the Gleason axis, clinical stage, and percent positive biopsy cores; 0-2 low, 3-5 intermediate, 6-10 high.',
    compute: F.capraScore,
    fields: [
      { dom: 'capra-age', arg: 'age', kind: 'number', required: true, label: 'Age at diagnosis', unit: 'years' },
      { dom: 'capra-psa', arg: 'psa', kind: 'number', required: true, label: 'PSA at diagnosis', unit: 'ng/mL' },
      { dom: 'capra-gp', arg: 'gleasonPrimary', kind: 'enum', values: ['1', '2', '3', '4', '5'], required: true, label: 'Primary Gleason pattern' },
      { dom: 'capra-gs', arg: 'gleasonSecondary', kind: 'enum', values: ['1', '2', '3', '4', '5'], required: true, label: 'Secondary Gleason pattern' },
      { dom: 'capra-stage', arg: 'stage', kind: 'enum', values: ['T1-T2', 'T3a'], required: true, label: 'Clinical T stage' },
      { dom: 'capra-cores', arg: 'cores', kind: 'number', required: true, label: 'Positive biopsy cores', unit: '%' },
    ],
  },
  {
    id: 'renal-nephrometry',
    summary: 'R.E.N.A.L. nephrometry score (Kutikov & Uzzo 2009): a 4-12 anatomic-complexity score for a renal mass facing nephron-sparing surgery, with an anterior/posterior (a/p/x) and hilar (h) suffix; 4-6 low, 7-9 moderate, 10-12 high.',
    compute: F.renalNephrometry,
    fields: [
      { dom: 'ren-radius', arg: 'radius', kind: 'enum', values: ['1', '2', '3'], required: true, label: '(R) Radius / maximal diameter' },
      { dom: 'ren-exo', arg: 'exophytic', kind: 'enum', values: ['1', '2', '3'], required: true, label: '(E) Exophytic / endophytic' },
      { dom: 'ren-near', arg: 'nearness', kind: 'enum', values: ['1', '2', '3'], required: true, label: '(N) Nearness to collecting system' },
      { dom: 'ren-loc', arg: 'location', kind: 'enum', values: ['1', '2', '3'], required: true, label: '(L) Location relative to polar lines' },
      { dom: 'ren-ap', arg: 'ap', kind: 'enum', values: ['a', 'p', 'x'], required: true, label: '(A) Anterior / posterior / indeterminate' },
      { dom: 'ren-hilar', arg: 'hilar', kind: 'enum', values: ['', 'h'], label: 'Hilar tumor (h suffix)' },
    ],
  },
  {
    id: 'padua-renal',
    summary: 'PADUA score (Ficarra 2009) for a renal tumor: a 6-14 complexity score from longitudinal location, exophytic rate, renal rim, sinus and collecting-system involvement, and tumor size; 6-7 low, 8-9 intermediate, >= 10 high.',
    compute: F.paduaRenal,
    fields: [
      { dom: 'pad-long', arg: 'longitudinal', kind: 'enum', values: ['1', '2'], required: true, label: 'Longitudinal (polar) location' },
      { dom: 'pad-exo', arg: 'exophytic', kind: 'enum', values: ['1', '2', '3'], required: true, label: 'Exophytic rate' },
      { dom: 'pad-rim', arg: 'rim', kind: 'enum', values: ['1', '2'], required: true, label: 'Renal rim (lateral / medial)' },
      { dom: 'pad-sinus', arg: 'sinus', kind: 'enum', values: ['1', '2'], required: true, label: 'Renal sinus involvement' },
      { dom: 'pad-ucs', arg: 'ucs', kind: 'enum', values: ['1', '2'], required: true, label: 'Urinary collecting-system involvement' },
      { dom: 'pad-size', arg: 'size', kind: 'enum', values: ['1', '2', '3'], required: true, label: 'Tumor size' },
      { dom: 'pad-face', arg: 'face', kind: 'enum', values: ['a', 'p'], required: true, label: 'Anterior / posterior face' },
    ],
  },
  {
    id: 'stone-nephrolithometry',
    summary: 'S.T.O.N.E. nephrolithometry (Okhunov 2013): a 5-13 PCNL complexity score (original area version) from stone size (area), tract length, obstruction, involved calices, and stone density; higher score = lower stone-free likelihood.',
    compute: F.stoneNephrolithometry,
    fields: [
      { dom: 'stn-len', arg: 'length', kind: 'number', required: true, label: 'Stone length', unit: 'mm' },
      { dom: 'stn-wid', arg: 'width', kind: 'number', required: true, label: 'Stone width', unit: 'mm' },
      { dom: 'stn-tract', arg: 'tract', kind: 'number', required: true, label: 'Tract length, skin to stone', unit: 'mm' },
      { dom: 'stn-obstr', arg: 'obstruction', kind: 'enum', values: ['1', '2'], required: true, label: 'Obstruction (hydronephrosis)' },
      { dom: 'stn-cal', arg: 'calices', kind: 'enum', values: ['1', '2', '3'], required: true, label: 'Number of involved calices' },
      { dom: 'stn-hu', arg: 'hu', kind: 'number', required: true, label: 'Stone density', unit: 'HU' },
    ],
  },
  {
    id: 'twist-score',
    summary: 'TWIST score (Barbosa 2013): a 0-7 point-of-care score for suspected testicular torsion from testicular swelling (2), hard testis (2), absent cremasteric reflex (1), nausea/vomiting (1), and high-riding testis (1); 0-2 low, 3-4 intermediate, 5-7 high.',
    compute: F.twistScore,
    fields: [
      { dom: 'tw-swell', arg: 'swelling', kind: 'bool', label: 'Testicular swelling (2)' },
      { dom: 'tw-hard', arg: 'hardTestis', kind: 'bool', label: 'Hard testis (2)' },
      { dom: 'tw-crem', arg: 'absentCremasteric', kind: 'bool', label: 'Absent cremasteric reflex (1)' },
      { dom: 'tw-nv', arg: 'nauseaVomiting', kind: 'bool', label: 'Nausea / vomiting (1)' },
      { dom: 'tw-high', arg: 'highRiding', kind: 'bool', label: 'High-riding testis (1)' },
    ],
  },
];
