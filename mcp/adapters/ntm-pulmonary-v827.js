// spec-v827 MCP adapter: NTM pulmonary disease criteria in lib/ntm-pulmonary-v827.js.
// The dom keys mirror the browser renderer (views/group-v827.js) and
// META['ntm-pulmonary'].example. Sputum is a COUNT because the criterion turns on how many
// separate samples grew. Clinical domain.

import { ntmPulmonary } from '../../lib/ntm-pulmonary-v827.js';

export default [
  {
    id: 'ntm-pulmonary',
    summary: 'Applies the ATS/ERS/ESCMID/IDSA criteria for nontuberculous mycobacterial pulmonary disease. Clinical, radiologic, exclusion and microbiologic domains all required. The microbiologic domain takes any ONE of: two or more separate expectorated sputum cultures of the SAME species; one bronchial wash or lavage; or a lung biopsy with mycobacterial histology plus a positive culture. One sputum is not enough; one lavage is.',
    compute: ntmPulmonary,
    fields: [
      { dom: 'ntm-symptoms', arg: 'pulmonarySymptoms', kind: 'boolean', required: false, label: 'Pulmonary or systemic symptoms' },
      { dom: 'ntm-cxr', arg: 'nodularOrCavitary', kind: 'boolean', required: false, label: 'Nodular or cavitary opacities on radiograph' },
      { dom: 'ntm-hrct', arg: 'hrctBronchiectasis', kind: 'boolean', required: false, label: 'HRCT bronchiectasis with multiple small nodules' },
      { dom: 'ntm-excluded', arg: 'alternativesExcluded', kind: 'boolean', required: false, label: 'Other diagnoses excluded' },
      { dom: 'ntm-sputum', arg: 'positiveSputumCultures', kind: 'number', required: false, label: 'Separate sputum samples with positive culture' },
      { dom: 'ntm-species', arg: 'sameSpecies', kind: 'boolean', required: false, label: 'Sputum samples grew the same species' },
      { dom: 'ntm-wash', arg: 'bronchialWashPositive', kind: 'boolean', required: false, label: 'Bronchial wash or lavage culture positive' },
      { dom: 'ntm-biopsy', arg: 'biopsyHistology', kind: 'boolean', required: false, label: 'Biopsy with mycobacterial histologic features' },
      { dom: 'ntm-biopsyculture', arg: 'biopsyCulturePositive', kind: 'boolean', required: false, label: 'Biopsy culture positive for NTM' },
      { dom: 'ntm-anyculture', arg: 'anyCulturePositive', kind: 'boolean', required: false, label: 'Sputum or washings positive alongside biopsy' },
    ],
  },
];
