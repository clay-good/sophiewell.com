// spec-v877 MCP adapter: the Ishoo angioedema staging in lib/ishoo-angioedema-v877.js. The dom
// keys mirror the browser renderer (views/group-v877.js) and META['ishoo-angioedema'].example.
//
// Pass every site that is swollen; the stage is the most distal of them. Clinical domain.

import { ishooAngioedema } from '../../lib/ishoo-angioedema-v877.js';

export default [
  {
    id: 'ishoo-angioedema',
    summary: 'Stages angioedema by the site of the most distal swelling, after Ishoo and colleagues 1999. Stage I is the face or lip, stage II the soft palate, stage III the tongue, and stage IV the larynx. In the original series stages I and II were managed on a ward or discharged, while the need for intensive care admission and for airway intervention rose sharply at stages III and IV. THE STAGE IS A SITE, NOT A SEVERITY SCORE: nothing is added up, so a large facial swelling is still stage I and a modest tongue swelling is stage III. IT DESCRIBES DISPOSITION RISK, NOT AIRWAY PATENCY RIGHT NOW. STRIDOR AND VOICE CHANGE ARE LATE, and their absence does not make a stage III or IV swelling safe. It does not separate the mechanism, and bradykinin-mediated angioedema does not respond to epinephrine, antihistamines or corticosteroids.',
    compute: ishooAngioedema,
    fields: [
      { dom: 'ish-faceorlip', arg: 'faceOrLip', kind: 'boolean', required: false, label: 'Face or lip swelling (stage I)' },
      { dom: 'ish-softpalate', arg: 'softPalate', kind: 'boolean', required: false, label: 'Soft palate swelling (stage II)' },
      { dom: 'ish-tongue', arg: 'tongue', kind: 'boolean', required: false, label: 'Tongue swelling (stage III)' },
      { dom: 'ish-larynx', arg: 'larynx', kind: 'boolean', required: false, label: 'Laryngeal swelling (stage IV)' },
      { dom: 'ish-airwaythreatened', arg: 'airwayThreatened', kind: 'boolean', required: false, label: 'The airway is threatened right now (an emergency at any stage; it overrides the staging)' },
    ],
  },
];
