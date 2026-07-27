// spec-v519 MCP wave: adapter for the Eckardt achalasia symptom score in lib/eckardt-v519.js.
// The dom keys mirror the browser renderer (views/group-v519.js) and META['eckardt'].example: eck-dysphagia,
// eck-regurgitation, eck-chestPain, eck-weightLoss map to the lib args of the same name. The `fields` array
// is GENERATED from the lib's exported ECKARDT_ITEMS, so each field's label carries that item's own option
// wording - three items are scored by FREQUENCY and the fourth by an AMOUNT IN KILOGRAMS, and a caller given
// one shared set of anchors would be answering how often the patient lost weight. All four are in
// META.example, so all four are required: a partial Eckardt score has no total. The example scores 8 (stage
// III); the total, the stage, and the remission reading are all carried by the result band, so it flows
// through the default makeToArgs with no custom toArgs.

import * as E from '../../lib/eckardt-v519.js';

export default [
  {
    id: 'eckardt',
    summary: 'The Eckardt symptom score for achalasia: four symptoms each scored 0 to 3 for a total of 0 to 12. Dysphagia, regurgitation, and retrosternal pain are scored by how often they occur (none, occasional, daily, at every meal); weight loss is scored by how much (none, under 5 kg, 5 to 10 kg, over 10 kg), so the four items are not four of the same question. A total of 0 to 1 is stage 0, 2 to 3 is stage I, 4 to 6 is stage II, and above 6 is stage III; stages 0 and I are generally read as remission, and treatment series conventionally define clinical success as a total of 3 or less. The total and the stage are different numbers: a total of 2 is stage I. It is a symptom score. It is not a diagnosis of achalasia, which needs manometry, and a low score does not exclude it. It does not grade the manometric subtype, does not measure esophageal emptying, and is not an indication to dilate, to inject, or to operate. Symptom relief and esophageal emptying can disagree, so follow-up conventionally pairs the score with objective testing.',
    compute: E.eckardt,
    fields: E.ECKARDT_ITEMS.map((item) => ({
      dom: `eck-${item.key}`,
      arg: item.key,
      kind: 'enum',
      values: item.options.map((o) => o.value),
      label: `${item.text} [${item.options.map((o) => o.text).join('; ')}]`,
    })),
  },
];
