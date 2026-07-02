// spec-v183 MCP wave 14: adapters for the six lib/onc-v134.js plasma-cell /
// myeloid-neoplasm staging tiles. dom keys mirror views/group-v134.js; arg names
// mirror the lib signatures. β2-microglobulin / albumin / age / counts are
// numbers; the yes/no cytogenetic and symptom questions and the ISS / DIPSS-group
// / isotype selects are enums.

import * as F from '../../lib/onc-v134.js';

export default [
  {
    id: 'myeloma-iss',
    summary: 'International Staging System for multiple myeloma (Greipp 2005): β2-microglobulin and albumin map to stage I–III.',
    compute: F.myelomaIss,
    fields: [
      { dom: 'iss-b2m', arg: 'b2m', kind: 'number', label: 'β2-microglobulin (mg/L)' },
      { dom: 'iss-alb', arg: 'albumin', kind: 'number', label: 'Albumin (g/dL)' },
    ],
  },
  {
    id: 'myeloma-r-iss',
    summary: 'Revised ISS for multiple myeloma (Palumbo 2015): ISS plus high LDH and high-risk iFISH map to stage I–III.',
    compute: F.myelomaRIss,
    fields: [
      { dom: 'riss-b2m', arg: 'b2m', kind: 'number', label: 'β2-microglobulin (mg/L)' },
      { dom: 'riss-alb', arg: 'albumin', kind: 'number', label: 'Albumin (g/dL)' },
      { dom: 'riss-ldh', arg: 'ldhHigh', kind: 'enum', values: ['no', 'yes'], label: 'LDH above normal' },
      { dom: 'riss-fish', arg: 'highRiskFish', kind: 'enum', values: ['no', 'yes'], label: 'High-risk iFISH: del(17p), t(4;14), or t(14;16)' },
    ],
  },
  {
    id: 'myeloma-r2-iss',
    summary: 'Second Revision of the ISS (R2-ISS, D’Agostino 2022): an additive 0–5 score from ISS stage, high LDH, del(17p), t(4;14), and gain(1q), grouped into four strata.',
    compute: F.myelomaR2Iss,
    fields: [
      { dom: 'r2-iss', arg: 'iss', kind: 'enum', values: ['I', 'II', 'III'], label: 'ISS stage' },
      { dom: 'r2-ldh', arg: 'ldhHigh', kind: 'enum', values: ['no', 'yes'], label: 'LDH above normal' },
      { dom: 'r2-del17p', arg: 'del17p', kind: 'enum', values: ['no', 'yes'], label: 'del(17p)' },
      { dom: 'r2-t414', arg: 't414', kind: 'enum', values: ['no', 'yes'], label: 't(4;14)' },
      { dom: 'r2-gain1q', arg: 'gain1q', kind: 'enum', values: ['no', 'yes'], label: 'gain / amp(1q)' },
    ],
  },
  {
    id: 'mgus-risk',
    summary: 'Mayo MGUS progression-risk (Rajkumar 2005): M-spike ≥ 1.5 g/dL, non-IgG isotype, and abnormal free-light-chain ratio give a 0–3 count and 20-year progression estimate.',
    compute: F.mgusRisk,
    fields: [
      { dom: 'mg-mspike', arg: 'mspike', kind: 'number', label: 'Serum M-spike (g/dL)' },
      { dom: 'mg-iso', arg: 'isotype', kind: 'enum', values: ['IgG', 'IgA', 'IgM'], label: 'Immunoglobulin isotype' },
      { dom: 'mg-flc', arg: 'flcRatio', kind: 'number', label: 'Free-light-chain κ/λ ratio' },
    ],
  },
  {
    id: 'dipss-mf',
    summary: 'Dynamic IPSS for primary myelofibrosis (Passamonti 2010): age, WBC, hemoglobin, blasts, and constitutional symptoms give a 0–6 score across four risk groups.',
    compute: F.dipssMf,
    fields: [
      { dom: 'dp-age', arg: 'age', kind: 'number', label: 'Age (years)' },
      { dom: 'dp-wbc', arg: 'wbc', kind: 'number', label: 'White-cell count (×10⁹/L)' },
      { dom: 'dp-hgb', arg: 'hgb', kind: 'number', label: 'Hemoglobin (g/dL)' },
      { dom: 'dp-blast', arg: 'blasts', kind: 'number', label: 'Peripheral blasts (%)' },
      { dom: 'dp-const', arg: 'constitutional', kind: 'enum', values: ['no', 'yes'], label: 'Constitutional symptoms' },
    ],
  },
  {
    id: 'dipss-plus-mf',
    summary: 'DIPSS-Plus for primary myelofibrosis (Gangat 2011): the DIPSS group plus platelets < 100, transfusion need, and unfavorable karyotype give a 0–6 score.',
    compute: F.dipssPlusMf,
    fields: [
      { dom: 'dpp-grp', arg: 'dipssGroup', kind: 'enum', values: ['low', 'int-1', 'int-2', 'high'], label: 'DIPSS risk group' },
      { dom: 'dpp-plt', arg: 'platelet', kind: 'number', label: 'Platelets (×10⁹/L)' },
      { dom: 'dpp-tx', arg: 'transfusion', kind: 'enum', values: ['no', 'yes'], label: 'Red-cell transfusion need' },
      { dom: 'dpp-kar', arg: 'karyotype', kind: 'enum', values: ['no', 'yes'], label: 'Unfavorable karyotype' },
    ],
  },
];
