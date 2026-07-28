// spec-v537 MCP wave: adapter for the ALSFRS-R in lib/alsfrs-r-v537.js. The dom keys mirror the browser
// renderer (views/group-v537.js) and META['alsfrs-r'].example: als-<key> maps to the lib arg <key>.
//
// THE SUMMARY STATES THE DIRECTION FIRST: higher is BETTER, 48 is normal and 0 is complete loss. Most scored
// instruments an agent meets run the other way, and an agent that assumes "higher is worse" will describe a
// declining patient as improving - the single most damaging misreading available here.
//
// BOTH CUTTING-FOOD SCALES ARE PUBLISHED AS FIELDS, BUT EXACTLY ONE IS EVER SCORED, and neither is marked
// required. `als-hasGastrostomy` is the only required field besides the ten universal items: it SELECTS which
// alternative applies. Marking both cutting fields required would force a caller to invent a score on a scale
// that does not apply to their patient, and scoring both would give a maximum of 52 rather than 48. The lib
// requires exactly the applicable twelve and names what is missing; the result reports `cuttingScale` and
// `cuttingItem` so a caller can see which was used.
//
// THE SUMMARY WARNS THAT A BARE TOTAL IS NOT COMPARABLE ACROSS VERSIONS. The original ALSFRS had ten items
// and a maximum of 40; the revision has twelve and 48. An agent that reads "ALSFRS 40" out of an older record
// and reports it as this scale's output has turned a normal score into a substantial deficit. Every band
// states the denominator.
//
// It also states what the three respiratory items are NOT: they record reported symptoms and the support in
// use, not a vital capacity. A patient can score 12 of 12 with a significantly reduced FVC, so an agent must
// not present a good respiratory subscore as reassurance about respiratory function.

import * as A from '../../lib/alsfrs-r-v537.js';

const UNIVERSAL = A.ALSFRS_ITEMS.filter((i) => !i.scale);

export default [
  {
    id: 'alsfrs-r',
    summary: 'The ALS Functional Rating Scale - Revised (Cedarbaum and colleagues 1999): twelve functions rated 0 to 4 for a total of 0 to 48. HIGHER IS BETTER - 48 is normal function and 0 is complete loss - which is the opposite direction from most scored instruments, so a falling total means a declining patient. The revision replaced the original scale\'s single breathing question with THREE (dyspnea, orthopnea, and respiratory insufficiency), because the original gave three questions each to upper limb, lower limb and bulbar function but only one to respiration. That took the scale from ten items with a maximum of 40 to twelve items with a maximum of 48, so ALWAYS REPORT THIS TOTAL OUT OF 48: a total of 40 is the top of the original scale but a substantial deficit on this one, and a bare number copied from an older record is not comparable. Cutting food and handling utensils is scored on ONE OF TWO ALTERNATIVE SCALES depending on whether the patient has a gastrostomy - one describing food handling, the other describing manipulating closures and fasteners - and exactly one of them is scored, contributing a single 0 to 4 to the total; scoring both would give a maximum of 52 and inflate every gastrostomy patient. Provide als-hasGastrostomy and then only the cutting field that applies. This measures FUNCTION. It does not diagnose ALS, which rests on clinical and electrophysiologic criteria and on excluding mimics. It does not measure respiratory function: the three respiratory items record reported symptoms and the ventilatory support in use rather than a vital capacity, so a patient can score full marks on them with a significantly reduced forced vital capacity, and this is not a substitute for respiratory testing or a trigger for ventilation decisions. It weights nothing for cognition or behavior, so frontotemporal involvement is invisible to it. Trials use the RATE OF CHANGE over time; a single total says little on its own, and this tool scores one time point and does not compute a slope.',
    compute: A.alsfrsR,
    fields: [
      {
        dom: 'als-hasGastrostomy', arg: 'hasGastrostomy', kind: 'enum', values: ['no', 'yes'], required: true,
        label: 'Does the patient have a gastrostomy? This SELECTS which of the two alternative cutting-food scales is scored. Supply only that one.',
      },
      ...UNIVERSAL.map((item) => ({
        dom: `als-${item.key}`, arg: item.key, kind: 'enum',
        values: item.options.map((o) => o.value), required: true,
        label: `${item.text} [${item.options.map((o) => o.text).join('; ')}]`,
      })),
      ...A.ALSFRS_ITEMS.filter((i) => i.scale).map((item) => ({
        dom: `als-${item.key}`, arg: item.key, kind: 'enum',
        values: item.options.map((o) => o.value),
        label: `${item.text}. Score this ONLY if hasGastrostomy is ${item.scale === 'gastrostomy' ? 'yes' : 'no'}; the other alternative scale is not scored [${item.options.map((o) => o.text).join('; ')}]`,
      })),
    ],
  },
];
