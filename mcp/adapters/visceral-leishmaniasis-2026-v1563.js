// spec-v1563 MCP adapter: visceral-leishmaniasis-2026 in lib/visceral-leishmaniasis-2026-v1563.js.
// The dom keys mirror views/group-v1563.js and META['visceral-leishmaniasis-2026'].example. Clinical domain.

import * as M from '../../lib/visceral-leishmaniasis-2026-v1563.js';

export default [
  {
    id: 'visceral-leishmaniasis-2026',
    summary: 'Gives the WHO 2026 kala-azar or PKDL regimen by region: paromomycin plus miltefosine in eastern Africa (or the alternatives), relapse combinations in South-East Asia, PKDL regimens, with doses by weight.',
    compute: M.visceralLeishmaniasis2026,
    fields: [
      { dom: 'vl-region', arg: 'region', kind: 'enum', required: true, label: 'Region', values: M.REGION_OPTIONS.map((d) => d.value) },
      { dom: 'vl-ind', arg: 'indication', kind: 'enum', required: true, label: 'Indication', values: M.INDICATION_OPTIONS.map((d) => d.value) },
      { dom: 'vl-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight in kg', min: 2, max: 200 },
      { dom: 'vl-age', arg: 'age', kind: 'number', required: true, label: 'Age in years', min: 0, max: 100 },
      { dom: 'vl-preg', arg: 'pregnant', kind: 'enum', label: 'Pregnant or breastfeeding', values: M.YES_NO.map((d) => d.value) },
      { dom: 'vl-contra', arg: 'contraception', kind: 'enum', label: 'Could become pregnant: reliable contraception assured', values: M.YES_NO.map((d) => d.value) },
      { dom: 'vl-excl', arg: 'exclusion', kind: 'enum', label: 'Other exclusion (severe malnutrition, Hb under 5, severe VL, hearing loss, comorbidity, coinfection)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'vl-mal', arg: 'malnourished', kind: 'enum', label: 'Severely malnourished (PKDL)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'vl-hiv', arg: 'hiv', kind: 'enum', label: 'HIV coinfection', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
