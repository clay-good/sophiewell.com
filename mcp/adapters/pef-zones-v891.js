// spec-v891 MCP adapter: the peak flow action-plan zones in lib/pef-zones-v891.js. The dom keys
// mirror the browser renderer (views/group-v891.js) and META['pef-zones'].example.
//
// The reference is the patient's PERSONAL BEST, never a predicted value. Clinical domain.

import { pefZones } from '../../lib/pef-zones-v891.js';

export default [
  {
    id: 'pef-zones',
    summary: 'Places a peak expiratory flow reading in the green, yellow or red zone of a written asthma action plan. Green is 80 percent or more of personal best, yellow is 50 to below 80, and red is below 50. THE FRACTION IS OF THE PATIENT\'S OWN PERSONAL BEST, NOT OF A PREDICTED VALUE: a predicted peak flow comes from a population equation and can be far from what a given person achieves when well, so using it shifts every boundary. A PERSONAL BEST IS ESTABLISHED WHILE THE PATIENT IS WELL AND ON TREATMENT, and a number recorded during an exacerbation is not one. SYMPTOMS OVERRIDE THE NUMBER, since a meter cannot see accessory muscle use, speech in single words, or a silent chest. Peak flow is effort-dependent and meter-dependent, so compare like with like.',
    compute: pefZones,
    fields: [
      { dom: 'pz-currentpef', arg: 'currentPef', kind: 'number', required: true, label: 'Current peak flow, L/min', unit: 'L/min' },
      { dom: 'pz-personalbest', arg: 'personalBest', kind: 'number', required: true, label: 'Personal best peak flow, L/min (not a predicted value)', unit: 'L/min' },
      { dom: 'pz-bestfromwellperiod', arg: 'bestFromWellPeriod', kind: 'boolean', required: false, label: 'The personal best was established while the patient was well and on treatment' },
    ],
  },
];
