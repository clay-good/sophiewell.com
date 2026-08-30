// spec-v896 MCP adapter: lipid emulsion rescue in lib/last-lipid-v896.js. The dom keys mirror the
// browser renderer (views/group-v896.js) and META['last-lipid'].example.
//
// It computes volumes from a weight. The first steps of the checklist are not arithmetic.
// Clinical domain.

import { lastLipid } from '../../lib/last-lipid-v896.js';

export default [
  {
    id: 'last-lipid',
    summary: 'Computes the 20 percent lipid emulsion volumes for local anesthetic systemic toxicity from the patient weight. The published checklist: At 70 kg or above: a 100 mL bolus over 2 to 3 minutes, then 200 to 250 mL over 15 to 20 minutes. Under 70 kg: 1.5 mL per kilogram, then 0.25 mL per kilogram per minute. Re-bolus once or twice and double the rate for persistent instability, within an upper limit of about 12 mL per kilogram. LIPID GOES EARLY, NOT AT CARDIAC ARREST. THE EPINEPHRINE DOSE IS REDUCED to 1 microgram per kilogram or less, about a tenth of the usual. PROPOFOL IS NOT A SUBSTITUTE for lipid emulsion. Vasopressin, calcium channel blockers, beta blockers and further local anesthetic are avoided.',
    compute: lastLipid,
    fields: [
      { dom: 'last-weightkg', arg: 'weightKg', kind: 'number', required: true, label: 'Patient weight, kg', unit: 'kg' },
      { dom: 'last-cardiacarrest', arg: 'cardiacArrest', kind: 'boolean', required: false, label: 'In cardiac arrest (changes the epinephrine wording, not the lipid dose)' },
    ],
  },
];
