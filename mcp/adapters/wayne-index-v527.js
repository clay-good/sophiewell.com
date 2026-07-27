// spec-v527 MCP wave: adapter for the Wayne index in lib/wayne-index-v527.js. The dom keys mirror the
// browser renderer (views/group-v527.js) and META['wayne-index'].example: wi-<key> maps to the lib arg
// <key> for each of the eighteen items.
//
// EVERY FIELD LABEL CARRIES ITS OPTIONS' SIGNED POINT VALUES, INCLUDING THE NEGATIVE ONES. This is the whole
// design point. An agent handed "Palpable thyroid: yes/no" has no way to know that answering "no" SUBTRACTS
// three points rather than adding nothing, and an agent that assumes the usual "absent contributes nothing"
// convention would systematically inflate every total toward a false positive. Publishing the signed weights
// in the schema makes the instrument's actual shape legible to the caller.
//
// THREE ITEMS ARE THREE-WAY ENUMS, NOT BOOLEANS, and are published that way: temperature preference
// (heat/neither/cold), appetite (decreased/unchanged/increased), and weight (increased/unchanged/decreased).
// Their alternatives carry opposite signs and cannot both be true, so a pair of booleans would let an agent
// assert an impossible combination. The casual pulse is likewise ONE three-band enum, not two rows, even
// though the source prints it as two.
//
// All eighteen are required: a partial Wayne index has no total, and because absent findings carry negative
// weight, an omitted item is not equivalent to a negative answer.
//
// The summary states, up front, that this is a 1959 instrument from before sensitive TSH assays and is not a
// substitute for thyroid function tests, because "Wayne index 24, toxic range" is exactly the phrase an
// agent would otherwise report as a diagnosis of thyrotoxicosis.

import * as W from '../../lib/wayne-index-v527.js';

function signed(points) {
  return points > 0 ? `+${points}` : String(points);
}

export default [
  {
    id: 'wayne-index',
    summary: `The Wayne index (Crooks, Murray and Wayne 1959) for the clinical diagnosis of thyrotoxicosis: eight symptoms and ten signs scored with SIGNED weights, read as above 19 toxic, 11 to 19 equivocal, and below 11 euthyroid, on a scale running ${W.WAYNE_RANGE.min} to ${W.WAYNE_RANGE.max}. Several weights are NEGATIVE and that is essential to using it correctly: preferring heat scores minus 5, an absent palpable thyroid minus 3, an absent thyroid bruit minus 2, absent hyperkinesis minus 2, hands not hot minus 2, hands not moist minus 1, and a pulse below 80 minus 3. An exam with nothing found therefore scores minus 10, not zero, and treating absent findings as contributing nothing inflates every total toward a false positive. Temperature preference, appetite, and weight are three-way items whose alternatives carry opposite signs and cannot both be true, and the casual pulse is one item with three bands rather than two. All eighteen items are required, because an omitted item is not the same as a negative answer when absent findings carry negative weight. This index was published in 1959, before sensitive TSH assays existed, precisely because clinical diagnosis was unreliable. Thyrotoxicosis today is diagnosed biochemically: this is not a substitute for TSH and free T4, it does not identify the cause, whether Graves disease, toxic nodular goiter, thyroiditis, or exogenous thyroid hormone, which changes management entirely, and it is not an indication to start an antithyroid drug, a beta blocker, radioiodine, or surgery. It performs worst where it would be most useful, in subclinical and mild disease and in older patients whose apathetic presentation lacks the hyperkinesis and sweating the index rewards. A toxic score does not establish thyrotoxicosis and a euthyroid score does not exclude it. It answers a different question from the Burch-Wartofsky score, which grades thyroid storm in someone already known to be thyrotoxic.`,
    compute: W.wayneIndex,
    fields: W.WAYNE_ITEMS.map((item) => ({
      dom: `wi-${item.key}`,
      arg: item.key,
      kind: 'enum',
      values: item.options.map((o) => o[0]),
      required: true,
      label: `${W.WAYNE_SIGNS.includes(item) ? 'Sign' : 'Symptom'}: ${item.text} [${item.options.map((o) => `${o[0]} = ${o[1]}, ${signed(o[2])}`).join('; ')}]`,
    })),
  },
];
