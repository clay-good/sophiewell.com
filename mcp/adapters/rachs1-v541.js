// spec-v541 MCP wave: adapter for RACHS-1 in lib/rachs1-v541.js. The dom keys mirror the browser renderer
// (views/group-v541.js) and META['rachs1'].example: rachs-<key> maps to the lib arg <key>.
//
// **THE TOOL RETURNS NO MORTALITY FOR CATEGORY 5, AND THE SUMMARY SAYS WHY.** The derivation published
// figures for categories 1, 2, 3, 4 and 6 and explicitly NONE for 5, because there were too few cases - yet
// category 5 sits numerically between two categories that DO have figures (19.4 and 47.7 percent). That is
// the shape most likely to make an agent interpolate: "it's between 4 and 6, so call it thirty-something
// percent". The compute result returns `mortality: null` with a `mortalityPublished` boolean and the
// ordering the panel actually asserted (higher than 4, lower than 6), and nothing else.
//
// **THE MODIFIERS ARE ADJUSTED ODDS RATIOS AND MUST NOT BE ADDED TO ANYTHING.** Age band, prematurity, and
// major non-cardiac structural anomaly each multiply risk within the derivation model. An agent that treated
// them as points, or that reported "category 4 plus prematurity equals category 5", would be inventing a
// scale. They are returned as a separate `modifiers` list, never folded into the category.
//
// THE CATEGORY COMES FROM THE PROCEDURE, so the field label carries representative procedures per category -
// an agent handed an operation name needs them to pick a category. They are explicitly REPRESENTATIVE, not
// exhaustive: the published appendix assigns many more, and an unlisted procedure should be looked up rather
// than guessed at from the nearest-sounding example.
//
// THE MORTALITY FIGURES ARE LABELED HISTORICAL in every band. They come from a cohort analysed for a 2002
// publication, and congenital cardiac surgical outcomes have improved substantially since. An agent
// reporting "19.4 percent mortality" to a contemporary question would materially overstate current risk.
//
// And the framing that matters most: this is a RISK-ADJUSTMENT tool for comparing programs and case-mixes.
// It was never designed to predict one child's outcome, and "RACHS-1 category 6" is exactly the phrase an
// agent might otherwise turn into a prognosis for a family.

import * as R from '../../lib/rachs1-v541.js';

export default [
  {
    id: 'rachs1',
    summary: 'RACHS-1, the Risk Adjustment for Congenital Heart Surgery (Jenkins and colleagues 2002). It groups congenital heart surgery PROCEDURES into six consensus categories of expected risk - the category comes from the operation performed, not from the patient. Reported in-hospital mortality in the derivation cohort was 0.4 percent for category 1, 3.8 for category 2, 8.5 for category 3, 19.4 for category 4, and 47.7 for category 6. CATEGORY 5 HAS NO PUBLISHED MORTALITY: the derivation reported no estimate because there were too few cases, and although category 5 sits numerically between two categories that do have figures, DO NOT INTERPOLATE ONE. The consensus panel kept category 5 separate precisely because it judged those patients higher risk than category 4 and lower than category 6, and that ordering is all that can be said. This tool returns null for category 5 mortality. Three modifiers carried separate ADJUSTED ODDS RATIOS in the derivation model: age at surgery of 30 days or less about 3.0 and 31 days to 1 year about 1.9, both relative to over 1 year; prematurity about 1.8; and a major non-cardiac structural anomaly about 1.8. These MULTIPLY risk within the model. They are not points, they must not be added to anything, and they do not move a patient into a different RACHS-1 category. The mortality figures are HISTORICAL, from a cohort analyzed for a 2002 publication; congenital cardiac surgical outcomes have improved substantially since, so they are the numbers the instrument was calibrated on rather than the risk facing a child operated on today. The procedure examples given per category are REPRESENTATIVE, not exhaustive: the published appendix assigns many more, so an unlisted procedure should be looked up in the source rather than matched to the nearest-sounding example. This is a RISK-ADJUSTMENT tool built to compare outcomes between programs and between case-mixes. It was not designed to predict an individual child\'s outcome, and it is not a basis for counselling a family about their own child, for choosing between operations, or for declining surgery. It says nothing about the surgeon, the institution, the timing, or the child\'s physiology beyond the three modifiers, and a category is not a difficulty rating for the operating room. It covers CONGENITAL heart surgery, mostly in infants and children; EuroSCORE covers adult acquired cardiac surgery and the two are not interchangeable.',
    compute: R.rachs1,
    fields: [
      {
        dom: 'rachs-category', arg: 'category', kind: 'enum',
        values: R.RACHS_CATEGORIES.map((c) => c.value), required: true,
        label: `The RACHS-1 category of the procedure performed. Examples are REPRESENTATIVE, not exhaustive [${R.RACHS_CATEGORIES.map((c) => `${c.value}: ${c.examples}`).join(' ')}]`,
      },
      {
        dom: 'rachs-ageBand', arg: 'ageBand', kind: 'enum',
        values: R.RACHS_MODIFIERS.map((m) => m.value), required: true,
        label: `Age at surgery - a SEPARATE adjusted odds ratio, not a point added to the category [${R.RACHS_MODIFIERS.map((m) => `${m.value} = ${m.text}, odds ratio about ${m.oddsRatio}`).join('; ')}]`,
      },
      {
        dom: 'rachs-premature', arg: 'premature', kind: 'enum', values: ['no', 'yes'], required: true,
        label: 'Prematurity? A separate adjusted odds ratio of about 1.8, not a point added to the category.',
      },
      {
        dom: 'rachs-majorAnomaly', arg: 'majorAnomaly', kind: 'enum', values: ['no', 'yes'], required: true,
        label: 'Major non-cardiac structural anomaly? A separate adjusted odds ratio of about 1.8, not a point added to the category.',
      },
    ],
  },
];
