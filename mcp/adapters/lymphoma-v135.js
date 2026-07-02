// spec-v183 MCP wave 14: adapters for the five lib/lymphoma-v135.js lymphoma /
// CLL prognostic tiles. dom keys mirror views/group-v135.js; arg names mirror
// the lib signatures. yes/no adverse factors are enums; ages, ratios, and lab
// values are numbers.

import * as F from '../../lib/lymphoma-v135.js';

export default [
  {
    id: 'r-ipi',
    summary: 'Revised IPI for DLBCL (Sehn 2007): a 0–5 count over age > 60, high LDH, advanced stage, > 1 extranodal site, and ECOG ≥ 2, grouped very good / good / poor.',
    compute: F.rIpi,
    fields: [
      { dom: 'ripi-age', arg: 'ageOver60', kind: 'enum', values: ['no', 'yes'], label: 'Age > 60 years' },
      { dom: 'ripi-ldh', arg: 'ldhHigh', kind: 'enum', values: ['no', 'yes'], label: 'LDH above normal' },
      { dom: 'ripi-stage', arg: 'stageAdvanced', kind: 'enum', values: ['no', 'yes'], label: 'Ann Arbor stage III–IV' },
      { dom: 'ripi-extra', arg: 'extranodal2', kind: 'enum', values: ['no', 'yes'], label: '> 1 extranodal site' },
      { dom: 'ripi-ecog', arg: 'ecog2', kind: 'enum', values: ['no', 'yes'], label: 'ECOG performance status ≥ 2' },
    ],
  },
  {
    id: 'nccn-ipi',
    summary: 'NCCN-IPI for DLBCL (Zhou 2014): a 0–8 score from banded age, LDH ratio, advanced stage, ECOG ≥ 2, and major extranodal involvement.',
    compute: F.nccnIpi,
    fields: [
      { dom: 'nccn-age', arg: 'age', kind: 'number', label: 'Age (years)' },
      { dom: 'nccn-ldh', arg: 'ldhRatio', kind: 'number', label: 'LDH / upper-limit-of-normal ratio' },
      { dom: 'nccn-stage', arg: 'stageAdvanced', kind: 'enum', values: ['no', 'yes'], label: 'Ann Arbor stage III–IV' },
      { dom: 'nccn-ecog', arg: 'ecog2', kind: 'enum', values: ['no', 'yes'], label: 'ECOG performance status ≥ 2' },
      { dom: 'nccn-extra', arg: 'extranodalMajor', kind: 'enum', values: ['no', 'yes'], label: 'Major extranodal site (marrow/CNS/liver/GI/lung)' },
    ],
  },
  {
    id: 'gelf-criteria',
    summary: 'GELF high-tumor-burden criteria (Brice 1997): any of mass > 7 cm, ≥ 3 nodal sites > 3 cm, B symptoms, splenomegaly, effusion, cytopenias, or leukemic phase indicates treatment over observation.',
    compute: F.gelfCriteria,
    fields: [
      { dom: 'gelf-mass', arg: 'maxMassCm', kind: 'number', label: 'Largest nodal mass (cm)' },
      { dom: 'gelf-nodal', arg: 'nodalSites3cm', kind: 'enum', values: ['no', 'yes'], label: '≥ 3 nodal sites > 3 cm' },
      { dom: 'gelf-bsymp', arg: 'bSymptoms', kind: 'enum', values: ['no', 'yes'], label: 'B symptoms' },
      { dom: 'gelf-spleen', arg: 'splenomegaly', kind: 'enum', values: ['no', 'yes'], label: 'Splenomegaly (below umbilicus)' },
      { dom: 'gelf-effusion', arg: 'effusion', kind: 'enum', values: ['no', 'yes'], label: 'Pleural / peritoneal effusion' },
      { dom: 'gelf-hgb', arg: 'hgb', kind: 'number', label: 'Hemoglobin (g/dL)' },
      { dom: 'gelf-plt', arg: 'platelet', kind: 'number', label: 'Platelets (×10⁹/L)' },
      { dom: 'gelf-leuk', arg: 'leukemicPhase', kind: 'enum', values: ['no', 'yes'], label: 'Leukemic phase (> 5 ×10⁹/L circulating)' },
    ],
  },
  {
    id: 'hodgkin-ips',
    summary: 'Hasenclever International Prognostic Score for advanced Hodgkin lymphoma (1998): a 0–7 count of adverse factors predicting freedom from progression.',
    compute: F.hodgkinIps,
    fields: [
      { dom: 'hips-alb', arg: 'albumin', kind: 'number', label: 'Albumin (g/dL)' },
      { dom: 'hips-hgb', arg: 'hgb', kind: 'number', label: 'Hemoglobin (g/dL)' },
      { dom: 'hips-male', arg: 'male', kind: 'enum', values: ['no', 'yes'], label: 'Male sex' },
      { dom: 'hips-age', arg: 'age', kind: 'number', label: 'Age (years)' },
      { dom: 'hips-stage', arg: 'stage4', kind: 'enum', values: ['no', 'yes'], label: 'Ann Arbor stage IV' },
      { dom: 'hips-wbc', arg: 'wbc', kind: 'number', label: 'White-cell count (×10⁹/L)' },
      { dom: 'hips-lymphct', arg: 'lymphCount', kind: 'number', label: 'Absolute lymphocyte count (cells/µL)' },
      { dom: 'hips-lymphpct', arg: 'lymphPct', kind: 'number', label: 'Lymphocyte percentage (%)' },
    ],
  },
  {
    id: 'cll-ipi',
    summary: 'CLL-IPI (International CLL-IPI working group 2016): a 0–10 weighted score from TP53, IGHV status, β2-microglobulin, stage, and age, stratified low / intermediate / high / very high.',
    compute: F.cllIpi,
    fields: [
      { dom: 'cll-tp53', arg: 'tp53', kind: 'enum', values: ['no', 'yes'], label: 'TP53 del(17p) or mutation' },
      { dom: 'cll-ighv', arg: 'ighvUnmutated', kind: 'enum', values: ['no', 'yes'], label: 'IGHV unmutated' },
      { dom: 'cll-b2m', arg: 'b2mHigh', kind: 'enum', values: ['no', 'yes'], label: 'β2-microglobulin > 3.5 mg/L' },
      { dom: 'cll-stage', arg: 'stageAdvanced', kind: 'enum', values: ['no', 'yes'], label: 'Rai I–IV / Binet B–C' },
      { dom: 'cll-age', arg: 'ageOver65', kind: 'enum', values: ['no', 'yes'], label: 'Age > 65 years' },
    ],
  },
];
