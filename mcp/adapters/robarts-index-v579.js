// spec-v579 MCP wave: adapter for the Robarts Histopathology Index in lib/robarts-index-v579.js. The dom
// keys mirror the browser renderer (views/group-v579.js) and META['robarts-index'].example.
//
// **THE EROSION ITEM HAS FIVE DESCRIPTORS BUT ONLY FOUR DISTINCT VALUES.** 5.1 ("recovering epithelium with
// adjacent inflammation") and 5.2 ("probable erosion, focally stripped") BOTH score raw 1. The
// level-to-score map is NOT INJECTIVE. An agent offering a 0-4 enum for this item - five levels, five
// values - would produce an item maximum of 20 and an overall maximum of 38, against the published 15 and
// 33. This tool therefore addresses the item by DESCRIPTOR, not by score.
//
// **THREE GEBOES GRADES ARE SCORED IN THE SOURCE SYSTEM AND CONTRIBUTE NOTHING HERE.** Architectural change,
// eosinophils in the lamina propria, and crypt destruction are each graded 0-3 in Geboes and every level
// contributes 0 to the RHI - including "severe diffuse architectural abnormality" and "unequivocal crypt
// destruction". They are pathology DESCRIPTORS, not calculator inputs. An agent that assumes every Geboes
// grade feeds the RHI will look for four fields that do not exist.
//
// **THE EPITHELIAL-NEUTROPHIL BANDS OVERLAP AND LEAVE A HOLE.** "<5% of crypts" is a strict SUBSET of
// "<50%", so 3 percent satisfies two levels at once, and EXACTLY 50 percent satisfies neither. The tool
// takes the LEVEL, not a percentage, because a percentage cannot be mapped onto these bands without
// inventing a rule the source does not contain.
//
// **A CLAIMED ODDITY THAT DOES NOT HOLD, AND WAS CHECKED.** It is natural to suppose a weighted sum over
// four coarse items leaves gaps in its range. With these weights it does not: EVERY integer from 0 to 33 is
// attainable. Stated explicitly because the intuitive guess is the opposite.
//
// THE THRESHOLDS BELONG TO THE RHI, NOT TO GEBOES: remission 3 or less and response 9 or less here, against
// Geboes 2.0 and 3.0 on a differently constructed scale.

import * as R from '../../lib/robarts-index-v579.js';

export default [
  {
    id: 'robarts-index',
    summary: `The ROBARTS HISTOPATHOLOGY INDEX (RHI; Mosli and colleagues, Gut 2017) for histologic activity in ulcerative colitis. A WEIGHTED SUM over four items: RHI = 1 x (chronic inflammatory infiltrate) + 2 x (neutrophils in the lamina propria) + 3 x (neutrophils in the epithelium) + 5 x (erosion or ulceration), range 0 to ${R.RHI_MAX}. It is a COMPANION to the Nancy histological index rather than an alternative spelling of it: Nancy is a DECISION TREE emitting a single grade while Robarts is a WEIGHTED SUM, and the two disagree on real biopsies. CHRONIC INFILTRATE (weight 1): 0 no increase; 1 mild but unequivocal; 2 moderate; 3 marked. LAMINA PROPRIA NEUTROPHILS (weight 2): same four levels. NEUTROPHILS IN EPITHELIUM (weight 3): 0 none; 1 under 5 percent of crypts; 2 under 50 percent; 3 over 50 percent. EROSION OR ULCERATION (weight 5): descriptor 5.0 no erosion, ulceration or granulation tissue, raw 0; 5.1 recovering epithelium with adjacent inflammation, raw 1; 5.2 probable erosion focally stripped, raw 1; 5.3 unequivocal erosion, raw 2; 5.4 ulcer or granulation tissue, raw 3. **THE EROSION ITEM HAS FIVE DESCRIPTORS BUT ONLY FOUR DISTINCT VALUES, BECAUSE 5.1 AND 5.2 BOTH SCORE RAW 1.** The map is NOT injective, so offering a 0-4 enum with five distinct values would give an item maximum of 20 and an overall maximum of 38 against the published 15 and ${R.RHI_MAX}. This tool addresses the item by DESCRIPTOR, not by score. **THREE GEBOES GRADES ARE SCORED IN THE SOURCE SYSTEM AND CONTRIBUTE NOTHING HERE**: architectural change, eosinophils in the lamina propria, and crypt destruction are each graded 0 to 3 in Geboes, and EVERY level of each contributes 0 to the RHI - including severe diffuse architectural abnormality and unequivocal crypt destruction. They are pathology DESCRIPTORS, not calculator inputs, and an agent assuming every Geboes grade feeds the RHI will look for fields that do not exist. **THE EPITHELIAL-NEUTROPHIL BANDS OVERLAP AND LEAVE A HOLE**: under 5 percent of crypts is a strict SUBSET of under 50 percent, so 3 percent satisfies two levels at once, and EXACTLY 50 percent satisfies neither. The tool takes the LEVEL rather than a percentage, because a percentage cannot be mapped onto these bands without inventing a rule the source does not contain. **EVERY INTEGER FROM 0 TO ${R.RHI_MAX} IS ATTAINABLE.** It is natural to suppose that a weighted sum over four coarse items leaves gaps in its range, and with these particular weights it does not - this was checked rather than assumed, and is stated because the intuitive guess is the opposite. THRESHOLDS: histological remission is ${R.REMISSION_MAX} or less and histological response ${R.RESPONSE_MAX} or less ON THE RHI. These are NOT the Geboes thresholds of ${R.GEBOES_REMISSION} and ${R.GEBOES_RESPONSE}, which belong to a differently constructed scale. This is a histologic activity index. It does NOT diagnose ulcerative colitis and does not separate it from infectious, ischemic or drug-induced colitis or from Crohn colitis, all of which can show active inflammation on a biopsy. It does NOT assess dysplasia, which is a separate reading of the same slide. It does not measure endoscopic or symptomatic activity, and histologic activity persists in patients who look healed endoscopically. It does not select or escalate therapy.`,
    compute: R.robartsIndex,
    fields: [
      ...[R.CHRONIC_INFILTRATE, R.LAMINA_PROPRIA_NEUTROPHILS, R.EPITHELIAL_NEUTROPHILS].map((item) => ({
        dom: `rhi-${item.key}`, arg: item.key, kind: 'enum',
        values: item.levels.map((l) => String(l.value)), required: true,
        label: `${item.geboes}, WEIGHT x${item.weight} [${item.levels.map((l) => `${l.value} = ${l.text}`).join('; ')}]${item.key === 'epithelialNeutrophils' ? '. NOTE the bands overlap ("<5%" is inside "<50%") and exactly 50% fits neither - choose the LEVEL, not a percentage.' : ''}`,
      })),
      {
        dom: 'rhi-erosion', arg: 'erosionUlceration', kind: 'enum',
        values: R.EROSION_ULCERATION.levels.map((l) => l.descriptor), required: true,
        label: `${R.EROSION_ULCERATION.geboes}, WEIGHT x${R.EROSION_ULCERATION.weight}. Addressed by DESCRIPTOR because 5.1 and 5.2 BOTH score raw 1 [${R.EROSION_ULCERATION.levels.map((l) => `${l.descriptor} = ${l.text}, raw ${l.value}`).join('; ')}]`,
      },
    ],
  },
];
