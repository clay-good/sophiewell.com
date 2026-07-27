// spec-v530 MCP wave: adapter for the Vesikari clinical severity score in lib/vesikari-v530.js. The dom keys
// mirror the browser renderer (views/group-v530.js) and META['vesikari'].example: ves-<key> maps to the lib
// arg <key> for each of the seven items.
//
// THE ENUM VALUE LISTS ARE PER-ITEM AND TWO OF THEM ARE IRREGULAR, which is the design point. Five items
// publish ['0','1','2','3']; DEHYDRATION publishes ['0','2','3'] with NO '1', and TREATMENT publishes
// ['0','1','2'] with no '3'. A shared 0-3 vocabulary across all seven would let an agent send a 1 for
// dehydration (a score the instrument does not define) or a 3 for treatment (which would push the maximum to
// 23 and inflate every hospitalized child by a point). Generating the values from the lib's per-item option
// lists makes both impossible at the schema layer rather than catching them later.
//
// THE TEMPERATURE FIELD LABEL SAYS RECTAL-EQUIVALENT AND GIVES THE CONVERSION, because that is the most
// common scoring error and an agent handed a chart temperature has no way to know the route mattered. An
// axillary 38.5 C is not a 2-point fever.
//
// The summary distinguishes this from three neighbors an agent could otherwise conflate: the Gorelick and
// clinical dehydration scales (which grade current dehydration rather than the episode), the 24-point
// norovirus modification, and the Schnadower modified score. All three are called something close enough to
// "Vesikari" or "dehydration score" that a caller could pick this tool for the wrong question.

import * as V from '../../lib/vesikari-v530.js';

export default [
  {
    id: 'vesikari',
    summary: 'The Vesikari clinical severity score (Ruuska and Vesikari 1990) grades a whole episode of acute gastroenteritis across seven items for a total of 0 to 20: below 7 is mild, 7 to 10 moderate, and 11 or more severe. It grades the EPISODE in retrospect, not how dehydrated the child is at this moment - the Gorelick scale and the Clinical Dehydration Scale answer that question - which is why it asks for durations and daily maxima and why it was built as a vaccine-trial endpoint. Two items are irregular and the allowed values differ from the rest: DEHYDRATION scores 0, 2, or 3 with no 1-point row, and TREATMENT is a single item scoring 0 for none, 1 for rehydration, and 2 for hospitalization - rehydration and hospitalization are not two separate items, and treating them as two would push the maximum to 23. The temperature is a RECTAL-EQUIVALENT reading: the scoring manual converts other routes first, adding about one degree Fahrenheit for an oral or tympanic reading and about two for an axillary one, so an axillary 38.5 C is not a 2-point fever. This is the original 20-point score. It is not the 24-point norovirus modification, which adds four items and uses different bands, and not the Schnadower modified score, which also totals 20 but replaces dehydration with a future healthcare visit and uses different band edges. It grades severity in retrospect: it is not a triage tool, not a measure of current dehydration, and not an indication to give oral or intravenous fluids, to admit, or to prescribe anything. It does not identify the pathogen and says nothing about causes of vomiting and diarrhea that are not gastroenteritis, which is the assessment that has to happen first.',
    compute: V.vesikari,
    fields: V.VESIKARI_ITEMS.map((item) => ({
      dom: `ves-${item.key}`,
      arg: item.key,
      kind: 'enum',
      values: item.options.map((o) => o.value),
      required: true,
      label: `${item.text} [${item.options.map((o) => o.text).join('; ')}]`,
    })),
  },
];
