// spec-v523: the Scadding stage of pulmonary sarcoidosis on a chest radiograph. WHOLE-CONCEPT GAP:
// "scadding", "sarcoidosis", "sarcoid", and "siltzbach" were ALL zero-hit across corpus.json, app.js, and
// lib/meta.js, with no test/unit file. The catalog had no sarcoidosis content of any kind.
//
// FIVE STAGES READ OFF ONE RADIOGRAPH:
//   0   normal chest radiograph
//   I   bilateral hilar lymphadenopathy, clear lung fields
//   II  bilateral hilar lymphadenopathy WITH parenchymal infiltrates
//   III parenchymal infiltrates WITHOUT hilar lymphadenopathy
//   IV  fibrosis
//
// THE NUMBERS ARE NOT A SEVERITY SCALE AND NOT A SEQUENCE, and this tile says so rather than letting the
// ordering imply either. Three specific things a reader can wrongly infer from "stage 0 through IV":
//
//   (1) NOT A PROGRESSION. A patient does not pass through I, then II, then III on the way to IV. Stage III
//       is defined by the ABSENCE of the adenopathy that defines stages I and II, so III is not "II plus
//       more" -- it is a different picture.
//   (2) NOT A MEASURE OF HOW THE PATIENT IS DOING. The published caveat is blunt: the scale correlates
//       poorly with functional parameters. A stage IV radiograph does not establish impaired lung function
//       and a stage I radiograph does not establish preserved function. Spirometry answers that question;
//       this does not.
//   (3) NOT RELIABLE BETWEEN READERS. Interobserver consistency is a documented limitation, and the boundary
//       between stages III and IV in particular depends on whether a reader takes "fibrosis" to mean any
//       concern for fibrosis or end-stage fibrosis -- a choice that materially shifts how many radiographs
//       land in each stage.
//
// ON PROGNOSIS: cohorts have reported that spontaneous remission becomes less likely as the stage rises.
// This tile states that DIRECTION as a cohort-level observation and deliberately does NOT attach percentages
// to a stage, because the widely quoted remission figures vary between series and none of them are a
// prediction about the patient in front of you.
//
// HIGH-STAKES: a radiographic description, not a diagnosis and not a treatment threshold. Sarcoidosis is a
// diagnosis of exclusion supported by histology and by ruling out infection and other granulomatous disease;
// no chest radiograph appearance establishes it, and no stage excludes it (a normal film is stage 0, not
// "no sarcoidosis"). The stage is NOT an indication to start, continue, or stop corticosteroids or any other
// therapy, which turns on symptoms, organ involvement, and lung function rather than on the film
// (spec-v11 section 5.3). It also describes only the CHEST: sarcoidosis affecting the eye, heart, skin,
// nervous system, or liver is invisible to it, and cardiac involvement in particular is a leading cause of
// death that this staging cannot see. The management decision stays with the clinician.
//
// STAGE DEFINITIONS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Scadding JG. Prognosis of intrathoracic sarcoidosis in England. Br Med J. 1961;2(5261):1165-1172.
//   - Thoracic-imaging references reproducing the same five stages with the same defining features, and
//     stating the interobserver-consistency and functional-correlation limitations quoted above.

export const SCADDING_STAGES = [
  {
    value: '0',
    label: 'Stage 0',
    text: 'Normal chest radiograph.',
    detail: 'A normal film does not exclude sarcoidosis, including extrathoracic disease, and does not exclude parenchymal changes visible on CT.',
  },
  {
    value: 'I',
    label: 'Stage I',
    text: 'Bilateral hilar lymphadenopathy with clear lung fields.',
    detail: 'Paratracheal nodes may be enlarged as well. The lung parenchyma is clear on the radiograph.',
  },
  {
    value: 'II',
    label: 'Stage II',
    text: 'Bilateral hilar lymphadenopathy together with parenchymal infiltrates.',
    detail: 'Both features are present. The infiltrates are characteristically upper-zone predominant.',
  },
  {
    value: 'III',
    label: 'Stage III',
    text: 'Parenchymal infiltrates without hilar lymphadenopathy.',
    detail: 'Defined by the ABSENCE of the adenopathy that defines stages I and II, so it is not stage II plus more; it is a different picture.',
  },
  {
    value: 'IV',
    label: 'Stage IV',
    text: 'Fibrosis.',
    detail: 'Volume loss, hilar retraction, architectural distortion, and features such as honeycombing, bullae, or cysts. Where readers draw the line between stage III and stage IV depends on whether fibrosis is taken to mean any concern for it or end-stage change.',
  },
];

const ALIASES = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' };

const NOTE = 'The Scadding stage (Scadding 1961) describes the chest radiograph in sarcoidosis: stage 0 normal, stage I bilateral hilar lymphadenopathy with clear lungs, stage II adenopathy with parenchymal infiltrates, stage III infiltrates without adenopathy, stage IV fibrosis. The numbers are not a severity scale and not a sequence. A patient does not pass through I, II, and III on the way to IV, because stage III is defined by the absence of the adenopathy that defines I and II. The scale correlates poorly with functional parameters, so a stage IV film does not establish impaired lung function and a stage I film does not establish preserved function; spirometry answers that question. Interobserver consistency is a documented limitation, and the III to IV boundary in particular depends on whether a reader takes fibrosis to mean any concern for it or end-stage change. Cohorts have reported that spontaneous remission becomes less likely as the stage rises, which is a direction observed across series rather than a prediction about an individual patient, so no remission percentage is attached to a stage here. This is a radiographic description, not a diagnosis: sarcoidosis is supported by histology and by excluding infection and other granulomatous disease, no appearance establishes it, and a normal film is stage 0 rather than no sarcoidosis. The stage is not an indication to start, continue, or stop corticosteroids or any other therapy, which turns on symptoms, organ involvement, and lung function. It describes only the chest, so eye, heart, skin, nervous system, and liver involvement are invisible to it, and cardiac involvement in particular is a leading cause of death this staging cannot see.';

// input: stage -- '0', 'I', 'II', 'III', 'IV' (1-4 and lowercase also accepted).
export function scadding(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = o.stage;

  if (raw === '' || raw === null || raw === undefined) {
    return { valid: false, message: 'Choose the Scadding stage: 0, I, II, III, or IV.' };
  }

  let key = String(raw).trim().toUpperCase();
  if (Object.prototype.hasOwnProperty.call(ALIASES, key)) key = ALIASES[key];

  const entry = SCADDING_STAGES.find((s) => s.value === key);
  if (!entry) {
    return { valid: false, message: 'Stage must be 0, I, II, III, or IV.' };
  }

  return {
    valid: true,
    stage: entry.value,
    bandLabel: `Scadding ${entry.label}`,
    band: `${entry.label}: ${entry.text} ${entry.detail} The stages are not a severity scale, not a sequence, and not a measure of lung function.`,
    note: NOTE,
  };
}
