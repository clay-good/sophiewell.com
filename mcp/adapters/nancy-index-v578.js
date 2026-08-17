// spec-v578 MCP wave: adapter for the Nancy histological index in lib/nancy-index-v578.js. The dom keys
// mirror the browser renderer (views/group-v578.js) and META['nancy-index'].example.
//
// **THIS IS NOT A SUM. IT IS A THREE-ITEM DECISION TREE IN STRICT PRIORITY ORDER**: ulceration, then the
// neutrophilic infiltrate, then the chronic infiltrate. The FIRST that fires decides the grade and the rest
// are not consulted. Building it additively is wrong in BOTH directions - it would let mild findings
// accumulate into a high grade, and it would let an ulcerated biopsy score below 4 because its other
// features were unremarkable.
//
// **A BIOPSY WITH ULCERATION IS GRADE 4 REGARDLESS OF EVERYTHING ELSE.** Top of the tree, not top of a
// ladder: it cannot be offset by an otherwise quiet specimen.
//
// **CHRONIC INFLAMMATION IS A DEAD END AT GRADE 1.** However florid the lymphoplasmacytic and eosinophilic
// infiltrate, it can NEVER push the grade above 1. It only decides 0 versus 1, and only when neutrophils
// and ulcers are both absent. A heavily chronically inflamed biopsy with no neutrophils is a grade 1, and
// no amount of chronic change makes it a 2.
//
// **THE THRESHOLD CONDITION IS STRUCTURALLY GUARANTEED HERE.** The source defines response as an index of 1
// or less "when there are no neutrophils in the epithelium, nor erosions or ulcers". Because of the
// priority order, a grade of 0 or 1 can ONLY arise when those are absent - so the condition cannot be
// violated by this tool. It is still reported, because applying the same numeric threshold to a score
// computed some other way COULD reach it with neutrophils present.
//
// **THE DENOMINATOR IS THE SET OF BIOPSIES FROM THE VISIT: THE WORST BIOPSY WINS.** A comparative study
// instead AVERAGED several ratings - an operationally different denominator that will not reproduce this
// index.

import * as N from '../../lib/nancy-index-v578.js';

export default [
  {
    id: 'nancy-index',
    summary: `The Nancy histological index for ulcerative colitis (Marchal-Bressenot and colleagues, Gut 2017), grading histologic activity 0 to 4. It is the HISTOLOGIC companion to the endoscopic Mayo subscore and UCEIS: endoscopic and histologic activity diverge in real patients, and histologic remission is the stricter target. **IT IS NOT A SUM - IT IS A THREE-ITEM DECISION TREE IN STRICT PRIORITY ORDER.** ULCERATION OR EROSION is checked FIRST and gives grade ${N.ULCERATION_GRADE} regardless of everything else, defined as loss of colonic crypts replaced with immature granulation tissue or the presence of fibrinopurulent exudate. If absent, the NEUTROPHILIC INFILTRATE is checked: few or rare neutrophils in the lamina propria or epithelium that are difficult to see gives grade 2; multiple clusters in the lamina propria and/or epithelium that are easily apparent gives grade 3. Only if neutrophils are ABSENT is the CHRONIC INFILTRATE consulted: a moderate or severe, easily apparent increase in lymphocytes, plasma cells and eosinophils gives grade 1, and no or only mild increase gives grade 0. The FIRST item that fires decides the grade and the rest are NOT consulted, so building this additively is wrong in both directions - it would let mild findings accumulate into a high grade, and would let an ulcerated biopsy score below 4. **CHRONIC INFLAMMATION IS A DEAD END AT GRADE ${N.RESPONSE_MAX_GRADE}**: however florid, it can NEVER push the grade above ${N.RESPONSE_MAX_GRADE}, and it only decides 0 versus ${N.RESPONSE_MAX_GRADE} when neutrophils and ulcers are both absent. THRESHOLDS: histological REMISSION is an index of ${N.REMISSION_GRADE}; histological RESPONSE is ${N.RESPONSE_MAX_GRADE} or less, which the source states as applying only when there are no neutrophils in the epithelium and no erosions or ulcers. Because of the priority order that condition is STRUCTURALLY GUARANTEED here - a grade of ${N.RESPONSE_MAX_GRADE} or less can only arise when they are absent - but it is reported anyway, because applying the same numeric threshold to a score computed some other way could reach it with neutrophils present. **THE DENOMINATOR IS THE SET OF BIOPSIES FROM THE VISIT, NOT ONE SLIDE: THE WORST BIOPSY WINS.** A comparative study instead averaged several ratings, an operationally different denominator that will not reproduce this index. The index is named after the CITY of Nancy in France, not a person. This grades HISTOLOGIC ACTIVITY. It does NOT diagnose ulcerative colitis and does not distinguish it from what mimics it on a biopsy - infectious colitis, Crohn colitis, ischemic colitis and drug-induced injury can all produce an active colitis picture, and the distinction rests on clinical context, distribution and culture. It does NOT assess dysplasia or cancer risk, which is a separate reading of the same specimen. It does not measure endoscopic or symptomatic activity, which diverge from histology in both directions. It does not select or escalate therapy.`,
    compute: N.nancyIndex,
    fields: [
      {
        dom: 'nancy-ulceration', arg: 'ulceration', kind: 'enum', values: ['no', 'yes'], required: true,
        label: `Ulcers or erosions. CHECKED FIRST: their presence gives grade ${N.ULCERATION_GRADE} outright, and the other two features are not consulted.`,
      },
      {
        dom: 'nancy-neutrophils', arg: 'neutrophils', kind: 'enum',
        values: N.NEUTROPHIL_LEVELS.map((n) => n.value), required: false,
        label: `Neutrophilic infiltrate. Checked SECOND, only when there is no ulceration [${N.NEUTROPHIL_LEVELS.map((n) => `${n.value} = ${n.text}${n.grade === null ? ' (fall through to the chronic infiltrate)' : `, grade ${n.grade}`}`).join('; ')}]`,
      },
      {
        dom: 'nancy-chronic', arg: 'chronicInflammation', kind: 'enum',
        values: N.CHRONIC_LEVELS.map((c) => c.value), required: false,
        label: `Chronic inflammatory infiltrate. Consulted LAST, only when neutrophils are absent, and A DEAD END AT GRADE ${N.RESPONSE_MAX_GRADE} [${N.CHRONIC_LEVELS.map((c) => `${c.value} = ${c.text}, grade ${c.grade}`).join('; ')}]`,
      },
    ],
  },
];
