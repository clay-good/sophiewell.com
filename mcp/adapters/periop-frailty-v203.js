// spec-v183 MCP wave 25: adapters for the three perioperative / TIA-risk
// instruments in lib/periop-frailty-v203.js — the Duke Activity Status Index
// (DASI) with its peak-VO₂ estimate, the ABCD3-I early-stroke-after-TIA score,
// and the SORT 30-day postoperative-mortality model. dom keys mirror
// views/group-v203.js. DASI is a 12-item boolean panel; ABCD3-I's clinical
// feature and SORT's ASA class and urgency are ordinal enums mirroring the
// renderer selects.

import * as F from '../../lib/periop-frailty-v203.js';

export default [
  {
    id: 'dasi',
    summary: 'Duke Activity Status Index (Hlatky 1989): twelve weighted activities-of-daily-living items give a functional-capacity score and an estimated peak VO₂ / MET level; below ~4 METs flags reduced capacity.',
    compute: F.dasi,
    fields: [
      { dom: 'dasi-selfcare', arg: 'selfCare', kind: 'bool', required: false, label: 'Take care of yourself (eat, dress, bathe, use toilet)' },
      { dom: 'dasi-walkindoors', arg: 'walkIndoors', kind: 'bool', required: false, label: 'Walk indoors, such as around your house' },
      { dom: 'dasi-walkblocks', arg: 'walkBlocks', kind: 'bool', required: false, label: 'Walk a block or two on level ground' },
      { dom: 'dasi-stairs', arg: 'stairs', kind: 'bool', required: false, label: 'Climb a flight of stairs or walk up a hill' },
      { dom: 'dasi-run', arg: 'run', kind: 'bool', required: false, label: 'Run a short distance' },
      { dom: 'dasi-lightwork', arg: 'lightWork', kind: 'bool', required: false, label: 'Light housework (dusting, washing dishes)' },
      { dom: 'dasi-modwork', arg: 'moderateWork', kind: 'bool', required: false, label: 'Moderate housework (vacuuming, carrying groceries)' },
      { dom: 'dasi-heavywork', arg: 'heavyWork', kind: 'bool', required: false, label: 'Heavy housework (scrubbing floors, moving furniture)' },
      { dom: 'dasi-yardwork', arg: 'yardWork', kind: 'bool', required: false, label: 'Yard work (raking, mowing, hedging)' },
      { dom: 'dasi-sexual', arg: 'sexual', kind: 'bool', required: false, label: 'Sexual relations' },
      { dom: 'dasi-modrec', arg: 'moderateRec', kind: 'bool', required: false, label: 'Moderate recreation (golf, bowling, dancing, doubles tennis)' },
      { dom: 'dasi-strenuous', arg: 'strenuous', kind: 'bool', required: false, label: 'Strenuous sports (swimming, singles tennis, skiing)' },
    ],
  },
  {
    id: 'abcd3-i',
    summary: 'ABCD3-I score (Merwick 2010): age, blood pressure, clinical features, TIA duration, diabetes, dual TIA, carotid stenosis, and DWI abnormality give a 0–13 early-stroke risk after TIA.',
    compute: F.abcd3i,
    fields: [
      { dom: 'abcd3i-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'abcd3i-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'abcd3i-dbp', arg: 'dbp', kind: 'number', required: true, label: 'Diastolic BP', unit: 'mmHg' },
      { dom: 'abcd3i-clinical', arg: 'clinical', kind: 'enum', values: ['weakness', 'speech', 'other'], required: true, label: 'Clinical features' },
      { dom: 'abcd3i-dur', arg: 'durationMinutes', kind: 'number', required: true, label: 'TIA duration', unit: 'minutes' },
      { dom: 'abcd3i-dm', arg: 'diabetes', kind: 'bool', required: false, label: 'Diabetes (+1)' },
      { dom: 'abcd3i-dual', arg: 'dualTia', kind: 'bool', required: false, label: 'Dual TIA (prior TIA within 7 days, +2)' },
      { dom: 'abcd3i-carotid', arg: 'carotidStenosis', kind: 'bool', required: false, label: 'Ipsilateral carotid stenosis ≥ 50% (+2)' },
      { dom: 'abcd3i-dwi', arg: 'dwiAbnormal', kind: 'bool', required: false, label: 'Abnormal DWI (acute infarct, +2)' },
    ],
  },
  {
    id: 'sort-mortality',
    summary: 'Surgical Outcome Risk Tool (Protopapa 2014): ASA class, urgency, age, high-risk specialty, major/complex surgery, and cancer give an estimated 30-day postoperative mortality.',
    compute: F.sort,
    fields: [
      { dom: 'sort-asa', arg: 'asa', kind: 'enum', values: ['I', 'II', 'III', 'IV', 'V'], required: true, label: 'ASA physical status' },
      { dom: 'sort-urgency', arg: 'urgency', kind: 'enum', values: ['elective', 'expedited', 'urgent', 'immediate'], required: true, label: 'Urgency' },
      { dom: 'sort-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'sort-highrisk', arg: 'highRiskSpecialty', kind: 'bool', required: false, label: 'High-risk surgical specialty' },
      { dom: 'sort-major', arg: 'majorComplex', kind: 'bool', required: false, label: 'Major or complex (xmajor) surgery' },
      { dom: 'sort-cancer', arg: 'cancer', kind: 'bool', required: false, label: 'Cancer' },
    ],
  },
];
