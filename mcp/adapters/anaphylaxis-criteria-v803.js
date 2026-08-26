// spec-v803 MCP adapter: 2020 WAO anaphylaxis criteria in
// lib/anaphylaxis-criteria-v803.js. The dom keys mirror the browser renderer
// (views/group-v803.js) and META['anaphylaxis-criteria'].example. Two ALTERNATIVE criteria;
// either alone is enough. Clinical domain.

import { anaphylaxisCriteria } from '../../lib/anaphylaxis-criteria-v803.js';

export default [
  {
    id: 'anaphylaxis-criteria',
    summary: 'Decides whether a reaction meets the diagnostic criteria for anaphylaxis (2020 World Allergy Organization). Either of two ALTERNATIVE criteria is enough. Criterion 1: acute skin or mucosal involvement plus at least one of respiratory compromise, reduced blood pressure or end-organ dysfunction, or severe gastrointestinal symptoms. Criterion 2: acute hypotension, bronchospasm or laryngeal involvement after a known or highly probable allergen, even with NO skin involvement.',
    compute: anaphylaxisCriteria,
    fields: [
      { dom: 'ana-skin', arg: 'skinOrMucosal', kind: 'boolean', required: false, label: 'Skin or mucosal involvement' },
      { dom: 'ana-resp', arg: 'respiratory', kind: 'boolean', required: false, label: 'Respiratory compromise' },
      { dom: 'ana-circ', arg: 'circulatory', kind: 'boolean', required: false, label: 'Reduced BP or end-organ signs' },
      { dom: 'ana-gi', arg: 'gastrointestinal', kind: 'boolean', required: false, label: 'Severe GI symptoms' },
      { dom: 'ana-allergen', arg: 'knownAllergen', kind: 'boolean', required: false, label: 'Known or probable allergen' },
      { dom: 'ana-hypo', arg: 'hypotension', kind: 'boolean', required: false, label: 'Hypotension' },
      { dom: 'ana-broncho', arg: 'bronchospasm', kind: 'boolean', required: false, label: 'Bronchospasm' },
      { dom: 'ana-larynx', arg: 'laryngeal', kind: 'boolean', required: false, label: 'Laryngeal involvement' },
    ],
  },
];
