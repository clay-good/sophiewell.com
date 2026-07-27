// spec-v523 MCP wave: adapter for the Scadding sarcoidosis radiographic stage in lib/scadding-v523.js.
// The dom key mirrors the browser renderer (views/group-v523.js) and META['scadding'].example: scad-stage
// maps to the lib arg `stage`.
//
// The enum values are the canonical '0','I','II','III','IV'. The lib also accepts '1'-'4' and lowercase, but
// the adapter publishes only the canonical forms so an agent reading the schema emits what the source uses.
//
// The field label carries EACH STAGE'S DEFINING RADIOGRAPHIC FEATURES, not just the numeral, because the
// distinction that matters most here is invisible in the numbering: stage II is adenopathy WITH infiltrates
// and stage III is infiltrates WITHOUT adenopathy. An agent handed a bare "0-IV" would have no way to know
// that III is not II plus more, and would be likely to treat the sequence as a severity ramp.
//
// The summary states the three readings the numbering invites and the tile refuses - it is not a
// progression, not a measure of lung function, and not reliable between readers - plus the extrathoracic
// blind spot, because an agent summarizing "stage IV sarcoidosis" is exactly where a claim about lung
// function or prognosis would otherwise get invented. No remission percentage is attached to any stage.

import * as S from '../../lib/scadding-v523.js';

export default [
  {
    id: 'scadding',
    summary: 'The Scadding radiographic stage of intrathoracic sarcoidosis, read off a chest radiograph: stage 0 normal, stage I bilateral hilar lymphadenopathy with clear lung fields, stage II bilateral hilar lymphadenopathy together with parenchymal infiltrates, stage III parenchymal infiltrates without hilar lymphadenopathy, stage IV fibrosis. The numbers are not a severity scale and not a sequence. A patient does not pass through I, II, and III on the way to IV, because stage III is defined by the absence of the adenopathy that defines I and II, so it is not stage II plus more. The scale correlates poorly with functional parameters, so a stage IV film does not establish impaired lung function and a stage I film does not establish preserved function; spirometry answers that question. Interobserver consistency is a documented limitation, and the boundary between III and IV depends on whether a reader takes fibrosis to mean any concern for it or end-stage change. Cohorts have reported that spontaneous remission becomes less likely as the stage rises, which is a direction observed across series rather than a prediction about an individual patient, so no remission percentage is attached to a stage. This is a radiographic description, not a diagnosis: sarcoidosis is supported by histology and by excluding infection and other granulomatous disease, no appearance establishes it, and a normal film is stage 0 rather than no sarcoidosis. The stage is not an indication to start, continue, or stop corticosteroids or any other therapy. It describes only the chest, so eye, heart, skin, nervous system, and liver involvement are invisible to it, and cardiac involvement in particular is a leading cause of death this staging cannot see.',
    compute: S.scadding,
    fields: [
      {
        dom: 'scad-stage',
        arg: 'stage',
        kind: 'enum',
        values: S.SCADDING_STAGES.map((s) => s.value),
        required: true,
        label: `The radiographic picture [${S.SCADDING_STAGES.map((s) => `${s.value} = ${s.text}`).join(' ')}]`,
      },
    ],
  },
];
