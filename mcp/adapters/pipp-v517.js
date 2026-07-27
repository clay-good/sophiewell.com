// spec-v517 MCP wave: adapter for the Premature Infant Pain Profile in lib/pipp-v517.js.
// The dom keys mirror the browser renderer (views/group-v517.js) and META['pipp'].example: pp-ga, pp-state,
// pp-hr, pp-spo2, pp-brow, pp-squeeze, pp-furrow map to the lib args of the same short name. Every indicator
// is an enum '0'-'3' and all seven are in META.example, so all seven are required for every caller. That
// matters more here than on a plain questionnaire: the two contextual indicators are scored BEFORE the
// procedure, so a caller who has only the observed facial and physiologic response does not have a PIPP at
// all, and defaulting gestational age or behavioral state to 0 would systematically under-score exactly the
// infants the instrument exists to protect. Each field label carries its own option texts. The example
// totals 13; that number and the contextual subtotal are carried by the result band, so it flows through the
// default makeToArgs with no custom toArgs.

import * as C from '../../lib/pipp-v517.js';

export default [
  {
    id: 'pipp',
    summary: 'The Premature Infant Pain Profile, seven indicators scored 0 to 3 around one procedure, total 0 to 21. Two are contextual and scored before the procedure begins - gestational age and behavioral state - because a more preterm infant, and an infant in quiet sleep, mounts a smaller response to the same pain; two are physiologic (maximum heart-rate rise, minimum oxygen-saturation fall from baseline) and three are facial (brow bulge, eye squeeze, nasolabial furrow, by percent of the observation). A total of 6 or less is commonly read as minimal or no pain and above 12 as moderate to severe. It sums what an observer rates. It is not a diagnosis, not a measure of pain at rest or of ongoing or postoperative pain, and not a drug or dose recommendation. A low score does not mean the procedure did not hurt: a sick, sedated, paralyzed, or exhausted infant may not mount the response the score is built on.',
    compute: C.pipp,
    fields: C.PIPP_INDICATORS.map((ind) => ({
      dom: `pp-${ind.key}`,
      arg: ind.key,
      kind: 'enum',
      values: ind.options.map((o) => o.value),
      label: `${ind.label} [${ind.options.map((o) => o.text).join('; ')}]`,
    })),
  },
];
