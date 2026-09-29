// spec-v1624: read record files in the page -- C-CDA, FHIR (Bundle, NDJSON or
// a single resource) and Apple Health export.xml -- into one list of coded
// observations, with the birth date and sex. Several files (an Apple export's
// clinical records, a folder of FHIR resources) are one record together.

import { readCcda } from './record-ccda.js';
import { readFhir } from './record-fhir.js';
import { readApple } from './record-apple.js';

export const RECORD_KINDS = new Set(['ccda-ccd', 'ccda-other', 'fhir-clinical', 'fhir-resource', 'apple-health-xml']);

// Text chunks of a Blob without holding it whole (export.xml can be hundreds
// of megabytes). A reader loop, since not every engine iterates streams.
async function* textChunks(blob) {
  const reader = blob.stream().pipeThrough(new TextDecoderStream()).getReader();
  for (;;) {
    const { value, done } = await reader.read();
    if (done) return;
    yield value;
  }
}

// readRecords([{ blob, kind, name }]) -> { observations, birthDate, sex, files }
export async function readRecords(items) {
  const out = { observations: [], birthDate: null, sex: null, files: [] };
  for (const it of items) {
    let r;
    if (it.kind === 'apple-health-xml') r = await readApple(textChunks(it.blob));
    else if (it.kind.startsWith('ccda')) r = readCcda(await it.blob.text());
    else r = readFhir(await it.blob.text());
    out.observations.push(...r.observations);
    out.birthDate = out.birthDate || r.birthDate;
    out.sex = out.sex || r.sex;
    out.files.push({ name: it.name, kind: it.kind, count: r.observations.length });
  }
  return out;
}
