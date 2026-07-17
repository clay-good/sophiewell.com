// spec-v394: Borrmann classification of ADVANCED gastric cancer (types I-IV), by the gross (macroscopic)
// tumor appearance — a classic morphological typing that complements the Lauren histological typing (the
// two are often reported together). "borrmann" / "gastric cancer gross morphology" routed to nothing.
//
// HIGH-STAKES: this reports the Borrmann TYPE the endoscopist / pathologist has determined, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The type IV
// (linitis plastica) association with a worse prognosis is descriptive, not an order; the management
// decision stays with the treating oncology team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Borrmann R. Geschwulste des Magens und Duodenums. In: Henke F, Lubarsch O, eds. Handbuch der
//     speziellen pathologischen Anatomie und Histologie. Berlin: Springer; 1926 (the original I-IV
//     macroscopic typing). Reviewed in Marrelli D, et al. Cancers (Basel). 2021;13(12):3081.
//   - Oncology / pathology references reproducing the same polypoid (I) / fungating-ulcerated (II) /
//     ulcerated-infiltrative (III) / diffusely-infiltrative-linitis-plastica (IV) grouping.
//
// Types (gross appearance of an advanced gastric cancer):
//   I   : polypoid - a protruding mass, clearly demarcated from the surrounding mucosa, without
//         ulceration.
//   II  : fungating (ulcerated) - an ulcerated mass with sharply raised, well-demarcated margins.
//   III : ulcerated and infiltrative - an ulcer with raised but partly infiltrative, ill-defined margins,
//         infiltrating the surrounding wall.
//   IV  : diffusely infiltrative (linitis plastica) - diffuse infiltration with no obvious mass or ulcer
//         and no clear margins; classically the worst prognosis.

const TYPES = {
  I: { type: 'I', text: 'Borrmann type I (polypoid) - a protruding mass, clearly demarcated from the surrounding mucosa, without ulceration.' },
  II: { type: 'II', text: 'Borrmann type II (fungating / ulcerated) - an ulcerated mass with sharply raised, well-demarcated margins.' },
  III: { type: 'III', text: 'Borrmann type III (ulcerated and infiltrative) - an ulcer with raised but partly infiltrative, ill-defined margins, infiltrating the surrounding wall.' },
  IV: { type: 'IV', text: 'Borrmann type IV (diffusely infiltrative; linitis plastica) - diffuse infiltration with no obvious mass or ulcer and no clear margins; classically the worst prognosis.' },
};

const NOTE = 'The Borrmann classification types an advanced gastric cancer by its gross appearance. I: polypoid (protruding, demarcated, no ulcer). II: fungating / ulcerated (ulcerated mass, sharply raised margins). III: ulcerated and infiltrative (ill-defined margins). IV: diffusely infiltrative / linitis plastica (no mass or ulcer, no clear margins; classically the worst prognosis). These associations are the classically taught pattern, not an order. This reports the type determined, not a diagnosis, a treatment decision, or a prognosis. Companion: the Lauren histological typing.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   type: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4)
export function borrmannGastric(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Borrmann type (I, II, III, or IV; equivalently 1-4).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Borrmann type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
