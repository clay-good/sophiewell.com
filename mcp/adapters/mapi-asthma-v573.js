// spec-v573 MCP wave: adapter for the Modified Asthma Predictive Index in lib/mapi-asthma-v573.js. The dom
// keys mirror the browser renderer (views/group-v573.js) and META['mapi-asthma'].example.
//
// **THIS IS NOT A SCORE. IT IS A TWO-GATE BOOLEAN.** Positive requires BOTH: at least 4 wheezing episodes
// in a year, AND either at least 1 major criterion OR at least 2 minor criteria. There is no total and no
// band table. An agent that counts criteria into a single number produces a figure the instrument does not
// define, and would let three minors substitute for the frequency gate - which they cannot.
//
// **THE CHANGE FROM THE ORIGINAL API IS A MOVE, NOT AN ADDITION, AND "API PLUS FOOD ALLERGY" IS WRONG.**
// Physician-diagnosed ALLERGIC RHINITIS was REMOVED from the minors and REPLACED by sensitization to milk,
// egg or peanut; aeroallergen sensitization was ADDED as a third major. Both lists have three items, but
// NEITHER IS A SUPERSET of its predecessor - a criterion LEFT the instrument. An agent treating mAPI as the
// API with an extra item will score allergic rhinitis, which the mAPI does not contain.
//
// **THE TWO INDICES USE DIFFERENT WHEEZE DENOMINATORS.** The original API gates on a 1-to-5 frequency
// RATING SCALE (stringent = 3 or more); the mAPI gates on a literal COUNT of at least 4 episodes per year.
// A rating of 3 is NOT four episodes. The original API also has LOOSE and STRINGENT variants, which is why
// a quoted "API positive" is ambiguous; the mAPI has only one form.
//
// THE EOSINOPHIL CRITERION IS 4 PERCENT OR MORE, so exactly 4.0 percent MEETS it. One secondary source
// renders it as "greater than 4 percent"; the original uses "or more", which is followed.
//
// **THE HORIZON IS YEARS, NOT MONTHS.** The index is applied at ages 1-3 and was validated against an
// asthma diagnosis at ages 6, 8 and 11, in a HIGH-RISK cohort, so positive predictive value is strongly
// population-dependent and lower in unselected children.

import * as M from '../../lib/mapi-asthma-v573.js';

export default [
  {
    id: 'mapi-asthma',
    summary: `The Modified Asthma Predictive Index (mAPI; criteria as validated by Chang and colleagues 2013), which predicts LATER asthma in preschool children who wheeze. It fills an axis the catalog lacked entirely: asthma-control-test, childhood-act, pram-asthma and pass-asthma all measure CURRENT control or severity, and none PREDICTS anything. **THIS IS NOT A SCORE - IT IS A TWO-GATE BOOLEAN.** The index is POSITIVE when BOTH gates pass: at least ${M.WHEEZE_EPISODE_THRESHOLD} WHEEZING EPISODES in a year, AND either at least ${M.MAJORS_REQUIRED} MAJOR criterion OR at least ${M.MINORS_REQUIRED} MINOR criteria. There is NO total and NO band table, and criteria CANNOT substitute for the frequency gate - three minors in a child with two episodes is still negative. MAJOR CRITERIA: parental physician-diagnosed asthma; physician-diagnosed atopic dermatitis; allergic sensitization to at least one aeroallergen. MINOR CRITERIA: wheezing unrelated to colds; blood eosinophils ${M.EOSINOPHIL_THRESHOLD} percent OR MORE; allergic sensitization to milk, egg or peanut. **THE CHANGE FROM THE ORIGINAL API WAS A MOVE, NOT AN ADDITION, AND CALLING THE mAPI "THE API PLUS FOOD ALLERGY" IS WRONG**: physician-diagnosed ALLERGIC RHINITIS was REMOVED from the minor criteria and replaced by food sensitization, while aeroallergen sensitization was ADDED as a third major. Both lists end with three items, but NEITHER IS A SUPERSET of its predecessor, because a criterion LEFT the instrument. An agent treating the mAPI as the API with an extra item will score allergic rhinitis, which the mAPI DOES NOT CONTAIN. **THE TWO INDICES USE DIFFERENT WHEEZE DENOMINATORS AND THEIR INPUTS ARE NOT INTERCHANGEABLE**: the original API gates on a 1-to-5 frequency RATING SCALE, stringent at 3 or more, while the mAPI gates on a literal COUNT of at least ${M.WHEEZE_EPISODE_THRESHOLD} episodes per year, so a rating of 3 is not four episodes. The original API further comes in LOOSE and STRINGENT variants, which is why a quoted "API positive" is ambiguous in the literature; the mAPI has only one form. THE EOSINOPHIL CRITERION IS ${M.EOSINOPHIL_THRESHOLD} PERCENT OR MORE, so exactly ${M.EOSINOPHIL_THRESHOLD}.0 percent MEETS it; one secondary source renders it as "greater than 4 percent", which is a loose paraphrase. **THE HORIZON IS YEARS, NOT MONTHS**: the index is applied at ages one to three and was validated against an asthma diagnosis at ages SIX, EIGHT and ELEVEN, in a HIGH-RISK cohort, so its positive predictive value is strongly population-dependent and will be LOWER in unselected children. It does NOT diagnose asthma at any age and does NOT exclude it: a negative index in a wheezing child does not mean the wheeze is benign, and the causes that matter most - foreign body, structural airway disease, cystic fibrosis, immunodeficiency and aspiration - are not asthma and are not what this index is about. It is NOT an indication to start inhaled corticosteroids or any other controller, and treating a positive index as a prescription is the misuse it most invites.`,
    compute: M.mapiAsthma,
    fields: [
      {
        dom: 'mapi-episodes', arg: 'wheezeEpisodes', kind: 'number', unit: 'episodes/year', required: true,
        label: `Wheezing episodes in the past year. A literal COUNT, gating at ${M.WHEEZE_EPISODE_THRESHOLD} or more. NOT the original API's 1-to-5 rating scale.`,
      },
      ...M.MAPI_MAJOR_CRITERIA.map((c) => ({
        dom: `mapi-${c.key}`, arg: c.key, kind: 'enum', values: ['no', 'yes'], required: true,
        label: `MAJOR criterion. ${c.text}${c.addedInMapi ? ' ADDED in the mAPI; not in the original API.' : ''}`,
      })),
      ...M.MAPI_MINOR_CRITERIA.map((c) => ({
        dom: `mapi-${c.key}`, arg: c.key, kind: 'enum', values: ['no', 'yes'], required: true,
        label: `MINOR criterion. ${c.text}${c.addedInMapi ? ' REPLACED allergic rhinitis, which was removed from the original API and is NOT scored here.' : ''}`,
      })),
      {
        dom: 'mapi-eos', arg: 'eosinophilPercent', kind: 'number', unit: '%', required: false,
        label: `Optional blood eosinophil percentage. If supplied it DECIDES the eosinophil criterion, which is ${M.EOSINOPHIL_THRESHOLD} percent OR MORE, so exactly ${M.EOSINOPHIL_THRESHOLD}.0 meets it.`,
      },
    ],
  },
];
