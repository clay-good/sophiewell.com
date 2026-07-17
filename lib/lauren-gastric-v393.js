// spec-v393: Lauren classification of gastric carcinoma (intestinal / diffuse / mixed) — the classic
// histological typing that groups gastric adenocarcinoma by growth pattern, with distinct epidemiology
// and prognosis. It sits beside the oncology-pathology and GI tiles in the catalog. "lauren" / "gastric
// cancer histology type" routed to nothing.
//
// HIGH-STAKES: this reports the Lauren TYPE the pathologist has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The diffuse type is classically
// associated with a worse prognosis, but that association is descriptive, not an order; the management
// decision stays with the treating oncology / pathology team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Lauren P. The two histological main types of gastric carcinoma: diffuse and so-called intestinal-
//     type carcinoma. An attempt at a histo-clinical classification. Acta Pathol Microbiol Scand.
//     1965;64:31-49 (the intestinal / diffuse dichotomy; the mixed type is the later addition).
//   - Pathology / oncology references reproducing the same cohesive-glandular (intestinal) vs poorly-
//     cohesive-signet-ring (diffuse) vs both-components (mixed) grouping.
//
// Types (growth pattern):
//   intestinal : cohesive cells that retain glandular / tubular structure; associated with chronic
//                gastritis, atrophy, and intestinal metaplasia; the "epidemic" type.
//   diffuse    : poorly cohesive cells that infiltrate the stroma singly or in small groups, often with
//                signet-ring cells and no gland formation; classically a worse prognosis.
//   mixed      : both intestinal and diffuse components.

const TYPES = {
  intestinal: { type: 'intestinal', text: 'Lauren intestinal type - cohesive cells that retain glandular / tubular structure; associated with chronic gastritis, gastric atrophy, and intestinal metaplasia (the "epidemic" type).' },
  diffuse: { type: 'diffuse', text: 'Lauren diffuse type - poorly cohesive cells that infiltrate the stroma singly or in small groups, often with signet-ring cells and no gland formation; classically a worse prognosis.' },
  mixed: { type: 'mixed', text: 'Lauren mixed type - a tumor with both intestinal (glandular) and diffuse (poorly cohesive) components.' },
};

const NOTE = 'The Lauren classification groups gastric adenocarcinoma by histological growth pattern. Intestinal: cohesive cells retaining glandular structure (chronic gastritis / intestinal metaplasia). Diffuse: poorly cohesive cells, signet-ring cells, no gland formation (classically a worse prognosis). Mixed: both components. These associations are the classically taught pattern, not an order. This reports the type the pathologist has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  INTESTINAL: 'intestinal', I: 'intestinal',
  DIFFUSE: 'diffuse', D: 'diffuse',
  MIXED: 'mixed', M: 'mixed',
};

// input:
//   type: 'intestinal' / 'diffuse' / 'mixed' (case-insensitive; also accepts i/d/m)
export function laurenGastric(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw.toLowerCase();
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Lauren type (intestinal, diffuse, or mixed).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Lauren ${t.type} type`,
    band: t.text,
    note: NOTE,
  };
}
