// spec-v887 MCP adapter: the occupational HIV post-exposure prophylaxis decision in
// lib/hiv-pep-occupational-v887.js. The dom keys mirror the browser renderer
// (views/group-v887.js) and META['hiv-pep-occupational'].example.
//
// It returns a decision framework and names no drug, dose or regimen. Occupational domain.

import { hivPepOccupational } from '../../lib/hiv-pep-occupational-v887.js';

export default [
  {
    id: 'hiv-pep-occupational',
    summary: 'Applies the US Public Health Service framework for an occupational exposure to HIV. An exposure that warrants evaluation is a percutaneous injury, contact of a mucous membrane or non-intact skin with blood or another potentially infectious material, or a bite with blood exposure; INTACT SKIN IS NOT AN EXPOSURE. A known positive source means prophylaxis is recommended, a known negative source means it is not, and an unknown source is decided case by case on the likelihood the source is infected. THE 2013 UPDATE REMOVED THE TWO-DRUG BASIC REGIMEN, so exposures are no longer tiered by severity and every recommended course is three drugs or more. DO NOT WAIT FOR SOURCE TESTING: start in hours rather than days and stop if the source is later found negative. It names no drug, no dose and no regimen.',
    compute: hivPepOccupational,
    fields: [
      { dom: 'pep-exposuretype', arg: 'exposureType', kind: 'enum', required: false, label: 'What happened', values: ['none', 'percutaneous', 'mucous-membrane', 'non-intact-skin', 'bite-with-blood', 'intact-skin'] },
      { dom: 'pep-hourssinceexposure', arg: 'hoursSinceExposure', kind: 'number', required: false, label: 'Hours since the exposure', unit: 'h' },
      { dom: 'pep-sourcestatus', arg: 'sourceStatus', kind: 'enum', required: false, label: 'Source HIV status', values: ['positive', 'unknown', 'negative'] },
      { dom: 'pep-sourceriskfactors', arg: 'sourceRiskFactors', kind: 'boolean', required: false, label: 'Risk factors for HIV are known in the source (relevant only when the status is unknown)' },
    ],
  },
];
