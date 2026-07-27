// spec-v519: the Eckardt symptom score for achalasia. WHOLE-CONCEPT GAP: "achalasia", "eckardt",
// "gastroparesis", and "demeester" were all zero-hit across corpus.json, app.js, and lib/meta.js, and there
// is no test/unit file for any of them. The catalog already reads the esophagus in several other ways
// (la-esophagitis and savary-miller for reflux injury, prague for Barrett segment length, the Rosenbek
// penetration-aspiration scale for a swallow study), but every one of those describes something an endoscope
// or a fluoroscope SEES. The Eckardt score is the axis none of them cover: what the patient REPORTS, before
// and after treatment.
//
// FOUR ITEMS, EACH 0-3, TOTAL 0-12. The shape is easy to state wrong, because the four items are not four of
// the same kind of question:
//   dysphagia, regurgitation, retrosternal pain -- FREQUENCY (none / occasional / daily / at every meal)
//   weight loss                                 -- an amount in KILOGRAMS (none / <5 / 5-10 / >10)
// A renderer or an adapter that presents all four with one shared set of option labels would silently ask
// how often the patient lost weight. Each item therefore carries its own option texts, and the exported
// ECKARDT_ITEMS is the single source of that wording for the view, the MCP adapter, and the tests.
//
// THE TOTAL AND THE STAGE ARE DIFFERENT NUMBERS, and confusing them is the error this tile guards against:
// a total of 2 is stage I, and "stage 1" is not "1 point". Both are returned and both are labeled.
//
// HIGH-STAKES: this is a symptom score. It is NOT a diagnosis of achalasia -- that needs manometry -- and a
// score of 0 does not exclude it. It does not grade the manometric subtype, does not measure esophageal
// emptying, and is not an indication to dilate, to inject, or to operate (spec-v11 section 5.3). Symptom
// relief and esophageal emptying can disagree: a treated patient can report a low score while the esophagus
// still empties poorly, which is why follow-up conventionally pairs the score with objective testing. The
// treatment decision stays with the clinician.
//
// ITEMS, BANDS, AND CUT POINT RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Eckardt VF, Aignherr C, Bernhard G. Predictors of outcome in patients with achalasia treated by
//     pneumatic dilation. Gastroenterology. 1992;103(6):1732-1738.
//   - StatPearls (Achalasia), reproducing the same four symptoms scored 0 to 3 and the same stage bands:
//     0 to 1 is stage 0, 2 to 3 is stage I, 4 to 6 is stage II, above 6 is stage III.
//   - Achalasia treatment series defining clinical success as an Eckardt score of 3 or less, and reproducing
//     the same frequency anchors (sometimes / daily / with every meal) and the same weight-loss bands in kg.

const FREQUENCY_OPTIONS = [
  { value: '0', text: '0 - none' },
  { value: '1', text: '1 - occasional' },
  { value: '2', text: '2 - daily' },
  { value: '3', text: '3 - at every meal' },
];

export const ECKARDT_ITEMS = [
  { key: 'dysphagia', text: 'Dysphagia (difficulty swallowing)', options: FREQUENCY_OPTIONS },
  { key: 'regurgitation', text: 'Regurgitation', options: FREQUENCY_OPTIONS },
  { key: 'chestPain', text: 'Retrosternal chest pain', options: FREQUENCY_OPTIONS },
  {
    key: 'weightLoss',
    text: 'Weight loss',
    options: [
      { value: '0', text: '0 - none' },
      { value: '1', text: '1 - less than 5 kg (about 11 lb)' },
      { value: '2', text: '2 - 5 to 10 kg (about 11 to 22 lb)' },
      { value: '3', text: '3 - more than 10 kg (about 22 lb)' },
    ],
  },
];

const MAX_TOTAL = 12;
const REMISSION_AT_OR_BELOW = 3;

const STAGES = [
  { max: 1, stage: '0', text: 'Stage 0 (total 0 to 1).' },
  { max: 3, stage: 'I', text: 'Stage I (total 2 to 3).' },
  { max: 6, stage: 'II', text: 'Stage II (total 4 to 6).' },
  { max: MAX_TOTAL, stage: 'III', text: 'Stage III (total above 6).' },
];

const NOTE = 'The Eckardt symptom score (Eckardt and colleagues 1992) grades four achalasia symptoms from 0 to 3 for a total of 0 to 12. Dysphagia, regurgitation, and retrosternal pain are scored by how often they occur; weight loss is scored by how much, in kilograms, so the four items are not four of the same question. A total of 0 to 1 is stage 0, 2 to 3 is stage I, 4 to 6 is stage II, and above 6 is stage III; stages 0 and I are generally read as remission, and treatment series conventionally define clinical success as a total of 3 or less. The total and the stage are different numbers: a total of 2 is stage I. It is a symptom score. It is not a diagnosis of achalasia, which needs manometry, and a low score does not exclude it. It does not grade the manometric subtype, does not measure esophageal emptying, and is not an indication to dilate, to inject, or to operate. Symptom relief and esophageal emptying can disagree, so follow-up conventionally pairs the score with objective testing.';

function readItem(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 3) return NaN;
  return n;
}

// input: dysphagia, regurgitation, chestPain, weightLoss -- each 0-3. All four required.
export function eckardt(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const values = ECKARDT_ITEMS.map((item) => readItem(o[item.key]));

  if (values.some((n) => n === null)) {
    return { valid: false, message: 'Score all four items: dysphagia, regurgitation, retrosternal pain, and weight loss.' };
  }
  if (values.some((n) => Number.isNaN(n))) {
    return { valid: false, message: 'Each item must be a whole number from 0 to 3.' };
  }

  const total = values.reduce((a, b) => a + b, 0);
  const entry = STAGES.find((s) => total <= s.max);
  const remission = total <= REMISSION_AT_OR_BELOW;

  const remissionText = remission
    ? 'Stages 0 and I are generally read as remission, and treatment series conventionally define clinical success as a total of 3 or less.'
    : 'Stages II and III are generally read as treatment failure when the score is used to follow a treated patient.';

  return {
    valid: true,
    total,
    stage: entry.stage,
    remission,
    bandLabel: `Eckardt ${total} of ${MAX_TOTAL}, stage ${entry.stage}`,
    band: `${entry.text} Total ${total} of ${MAX_TOTAL}. ${remissionText}`,
    note: NOTE,
  };
}
