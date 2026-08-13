// spec-v711 MCP adapter: AUSDRISK in lib/ausdrisk-v711.js.
// The dom keys mirror the browser renderer (views/group-v711.js) and META['ausdrisk'].example.
// An age-band enum, a sex enum, a waist number, and boolean risk factors (incl. the waist-band
// set); the weighted sum 0-35 maps to a three-tier risk band. Clinical domain.

import { ausdrisk } from '../../lib/ausdrisk-v711.js';

export default [
  {
    id: 'ausdrisk',
    summary: 'AUSDRISK (Chen 2010): Australian 5-year type-2 diabetes risk, total 0-35. Age (0/2/4/6/8), male +3, indigenous/Pacific +2, high-risk birthplace +2, family history +3, ever high glucose +6, antihypertensive +2, smoker +2, low veg/fruit +1, low activity +2, and waist (0/4/7, ethnicity- and sex-specific bands). Tiers: <=5 low, 6-14 intermediate, >=15 high (a fasting glucose test is advised).',
    compute: ausdrisk,
    fields: [
      { dom: 'aus-age', arg: 'agePoints', kind: 'enum', values: ['0', '2', '4', '6', '8'], required: true, label: 'Age band (points)' },
      { dom: 'aus-sex', arg: 'sex', kind: 'enum', values: ['female', 'male'], required: true, label: 'Sex' },
      { dom: 'aus-indigenous', arg: 'indigenousOrPacific', kind: 'boolean', required: false, label: 'Aboriginal/TSI/Pacific Islander/Maori descent' },
      { dom: 'aus-birth', arg: 'highRiskBirthplace', kind: 'boolean', required: false, label: 'Born in Asia, Middle East, North Africa, or Southern Europe' },
      { dom: 'aus-family', arg: 'familyHistory', kind: 'boolean', required: false, label: 'Family history of diabetes (parent or sibling)' },
      { dom: 'aus-glucose', arg: 'everHighGlucose', kind: 'boolean', required: false, label: 'Ever found to have high blood glucose' },
      { dom: 'aus-bp', arg: 'antihypertensive', kind: 'boolean', required: false, label: 'On blood-pressure medication' },
      { dom: 'aus-smoke', arg: 'smoker', kind: 'boolean', required: false, label: 'Current daily smoker' },
      { dom: 'aus-veg', arg: 'lowVegFruit', kind: 'boolean', required: false, label: 'Does not eat vegetables and fruit every day' },
      { dom: 'aus-activity', arg: 'lowActivity', kind: 'boolean', required: false, label: 'Less than 2.5 hours of physical activity per week' },
      { dom: 'aus-waistset', arg: 'asianOrIndigenousWaist', kind: 'boolean', required: false, label: 'Use lower waist thresholds (Asian or Aboriginal/TSI descent)' },
      { dom: 'aus-waist', arg: 'waist', kind: 'number', unit: 'cm', required: true, label: 'Waist circumference (cm)' },
    ],
  },
];
