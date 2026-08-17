// spec-v603 MCP wave: adapter for the Bauer and modified Bauer scores in lib/bauer-score-v603.js. The dom
// keys mirror the browser renderer (views/group-v603.js) and META['bauer-score'].example.
//
// **A HIGHER SCORE MEANS A BETTER PROGNOSIS.** Every item scores 1 for the FAVOURABLE state - the absence of
// something bad, or a favorable histology. The published bands prove the direction: 0 to 1 is under 6
// months and the top band is over 12 months. READING THIS AS A SEVERITY SCALE INVERTS THE ANSWER COMPLETELY.
// Scores in this family do NOT share a direction, so each must be read on its own terms.
//
// **THE MODIFICATION REMOVED AN ITEM AND ALSO MOVED THE BANDS, AND THE TWO VERSIONS DISAGREE IN EXACTLY TWO
// SITUATIONS - IN OPPOSITE DIRECTIONS.** Original: five items, bands 0-1 / 2-3 / 4-5. Modified: four items,
// bands 0-1 / 2 / 3-4. Enumerating all 32 combinations gives exactly two disagreements: (1) NO fracture and
// ONE other favorable factor - original 2 says palliative surgery, modified 1 says conservative treatment,
// so THE ORIGINAL IS MORE OPTIMISTIC; (2) fracture PRESENT with three favorable factors - both score 3, but
// the original says palliative surgery and the modification says EXCISIONAL surgery, so THE MODIFICATION IS
// MORE OPTIMISTIC. **NEITHER VERSION IS SYSTEMATICALLY MORE OPTIMISTIC.** `versionsDisagree` flags either
// case - report it.
//
// **TWO OF THE ITEMS ARE BOTH ABOUT THE PRIMARY TUMOUR AND THEY OVERLAP.** A breast primary scores BOTH
// "not lung cancer" and "favorable primary"; a colon primary scores only the not-lung point; a lung primary
// scores neither. Histology carries 0, 1 or 2 points - two of five originally and TWO OF FOUR, HALF THE
// SCALE, in the modification.
//
// **THE DROPPED ITEM WAS DROPPED FOR A REASON**: pathological fracture predicted worse survival in the
// EXTREMITY group only, not the spine. The original is NOT simply the fuller score - the two are tuned to
// different anatomy.

import * as B from '../../lib/bauer-score-v603.js';

export default [
  {
    id: 'bauer-score',
    summary: `The Bauer score (Bauer and Wedin 1995) and modified Bauer score (Leithner and colleagues 2008) estimate survival after surgery for skeletal metastases, both returned from the same inputs. THE ITEMS, one point each for the FAVOURABLE state: ${B.ITEMS.map((i) => `${i.text}${i.inModified ? '' : ' (ORIGINAL ONLY)'}`).join('; ')}. **A HIGHER SCORE MEANS A BETTER PROGNOSIS** - every item counts the absence of something bad or a favorable histology, and the bands prove it. ORIGINAL BANDS: ${B.ORIGINAL_BANDS.map((b) => `${b.label} = ${b.survival}, ${b.strategy}`).join('; ')}. MODIFIED BANDS: ${B.MODIFIED_BANDS.map((b) => `${b.label} = ${b.survival}, ${b.strategy}`).join('; ')}. **READING THIS AS A SEVERITY SCALE INVERTS THE ANSWER COMPLETELY**, and scores in this family do NOT share a direction. **THE MODIFICATION REMOVED AN ITEM AND ALSO MOVED THE BANDS, SO THE TWO VERSIONS DISAGREE IN EXACTLY TWO SITUATIONS, IN OPPOSITE DIRECTIONS**: with NO fracture and one other favorable factor the original scores 2 and says palliative surgery while the modification scores 1 and says conservative treatment, so THE ORIGINAL IS MORE OPTIMISTIC; with a fracture PRESENT and three favorable factors both score 3, but the original says palliative surgery and the modification says EXCISIONAL surgery, so THE MODIFICATION IS MORE OPTIMISTIC. **NEITHER VERSION IS SYSTEMATICALLY MORE OPTIMISTIC.** \`versionsDisagree\` flags either patient and must be reported. **TWO OF THE ITEMS ARE BOTH ABOUT THE PRIMARY TUMOUR AND THEY OVERLAP**: a breast primary scores BOTH "not lung cancer" and "favorable primary", a colon primary scores only the not-lung point, and a lung primary scores neither - so histology carries 0, 1 or 2 points, two of five originally and **TWO OF FOUR, HALF THE SCALE, in the modification**. **THE DROPPED ITEM WAS DROPPED FOR A REASON**: pathological fracture predicted worse survival in the EXTREMITY group only, not the spine, so the original is NOT simply the fuller score and the two are tuned to different anatomy. This is a GROUP-LEVEL SURVIVAL estimate used historically to decide how extensive an operation to offer. It does NOT decide whether to operate, and **the strategies attached to the bands describe what was DONE in the derivation cohorts, not what SHOULD be done**. It does NOT account for modern systemic therapy, which has changed survival in several of the very histologies it rewards. A low score is NOT a reason to withhold an operation that would relieve pain or restore stability.`,
    compute: B.bauerScore,
    fields: B.ITEMS.map((i) => ({
      dom: `bauer-${i.key}`, arg: i.key, kind: 'enum', values: ['no', 'yes'], required: true,
      label: `${i.text}. Scores 1 for the FAVOURABLE state.${i.inModified ? '' : ' ORIGINAL ONLY - the modification drops this item.'}${i.aboutPrimary ? ' One of the TWO overlapping primary-tumor items.' : ''}`,
    })),
  },
];
