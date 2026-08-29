// spec-v867 MCP adapter: the WHO severe malaria criteria in lib/who-severe-malaria-v867.js. The
// dom keys mirror the browser renderer (views/group-v867.js) and META['who-severe-malaria'].example.
//
// Pass the features that are present. Any one of them meets the definition; the count is
// descriptive only. Clinical domain.

import { whoSevereMalaria } from '../../lib/who-severe-malaria-v867.js';

export default [
  {
    id: 'who-severe-malaria',
    summary: 'Applies the WHO severe malaria criteria: any one of twelve features in confirmed falciparum parasitemia is severe malaria. The twelve: impaired consciousness, prostration, more than two convulsions in 24 hours, acidosis, hypoglycemia, severe malarial anemia, renal impairment, jaundice, pulmonary edema, significant bleeding, shock, or parasitemia above 10 percent. THIS IS A LIST OF DEFINING FEATURES, NOT A SCORE, so the count above one adds nothing. THE PARASITE COUNT DOES NOT GRADE SEVERITY except as the hyperparasitemia feature itself, because sequestered parasites are not on the film and a low peripheral count does not exclude severe disease. Severe malarial anemia and jaundice are each defined together with a parasite density. Consciousness, anemia and hypotension thresholds differ by age. It does not diagnose malaria.',
    compute: whoSevereMalaria,
    fields: [
      { dom: 'sm-age', arg: 'age', kind: 'enum', required: false, label: 'Age group', values: ['adult', 'child'] },
      { dom: 'sm-parasitemia', arg: 'parasitemia', kind: 'number', required: false, label: 'Parasitemia, percent of parasitized red cells' },
      { dom: 'sm-impairedconsciousness', arg: 'impairedConsciousness', kind: 'boolean', required: false, label: 'Impaired consciousness (GCS below 11 in adults, Blantyre below 3 in children)' },
      { dom: 'sm-prostration', arg: 'prostration', kind: 'boolean', required: false, label: 'Prostration (unable to sit, stand or walk unassisted)' },
      { dom: 'sm-convulsions', arg: 'convulsions', kind: 'boolean', required: false, label: 'More than two convulsions in 24 hours' },
      { dom: 'sm-acidosis', arg: 'acidosis', kind: 'boolean', required: false, label: 'Acidosis (base deficit above 8 mEq/L, bicarbonate below 15 mmol/L, or lactate at or above 5 mmol/L)' },
      { dom: 'sm-hypoglycemia', arg: 'hypoglycemia', kind: 'boolean', required: false, label: 'Hypoglycemia (glucose below 40 mg/dL)' },
      { dom: 'sm-anemia', arg: 'anemia', kind: 'boolean', required: false, label: 'Severe malarial anemia (with a parasite count above 10,000 per microliter)' },
      { dom: 'sm-renal', arg: 'renal', kind: 'boolean', required: false, label: 'Renal impairment (creatinine above 3 mg/dL or urea above 20 mmol/L)' },
      { dom: 'sm-jaundice', arg: 'jaundice', kind: 'boolean', required: false, label: 'Jaundice (bilirubin above 3 mg/dL with a parasite count above 100,000 per microliter)' },
      { dom: 'sm-pulmonaryedema', arg: 'pulmonaryEdema', kind: 'boolean', required: false, label: 'Pulmonary edema (radiologic, or saturation below 92 percent on room air with a rate above 30)' },
      { dom: 'sm-bleeding', arg: 'bleeding', kind: 'boolean', required: false, label: 'Significant bleeding' },
      { dom: 'sm-shock', arg: 'shock', kind: 'boolean', required: false, label: 'Shock (capillary refill at or above 3 seconds, or hypotension for age)' },
    ],
  },
];
