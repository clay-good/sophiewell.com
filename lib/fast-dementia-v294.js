// spec-v173 §2.6 (built as spec-v294): the Functional Assessment Staging
// Tool (FAST) for dementia. Deferred at v173 pending verbatim sourcing; the exact
// stage table was re-fetched and cross-verified at build (spec-v97) against the
// CAPC reproduction of Reisberg's ordinal FAST and a second independent hospice
// reproduction (see the citations below).
//
// The clinician selects the highest FAST stage the patient has reached; the tile
// reports the published functional descriptor and, for stage 7a and beyond,
// surfaces the Medicare local-coverage dementia hospice-eligibility context. It
// reports the guideline's own descriptor, not a diagnosis and not an eligibility
// determination (spec-v11 §5.3) — the staging and the hospice decision stay with
// the clinician.
//
// STAGE TABLE RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified at build:
//   - Reisberg B, Ferris SH, Franssen E. An ordinal functional assessment tool
//     for Alzheimer's-type dementia. Hosp Community Psychiatry. 1985;36(6):593-595.
//     (FAST; also Reisberg B. Psychopharmacol Bull. 1988;24(4):653-659.)
//   Verbatim descriptors from the CAPC reproduction (capc.org/documents/download/962)
//   and a second independent hospice reproduction; the two agree on every substage
//   descriptor. NOTE on stage order: the canonical GDS-aligned FAST places
//   "decreased job functioning" at stage 3 and "decreased ability to perform
//   complex tasks" at stage 4 (used here); some hospice reproductions transpose
//   the two — the descriptors are identical, only the integer label differs.

// Ordered highest-consecutive-level stages. `stage` is the display code; `label`
// is the verbatim functional descriptor. `substage` groups 6a-6e / 7a-7f.
const STAGES = [
  { stage: '1', label: 'No difficulty, either subjectively or objectively.' },
  { stage: '2', label: 'Complains of forgetting location of objects; subjective work difficulties.' },
  { stage: '3', label: 'Decreased job functioning evident to co-workers; difficulty traveling to new locations; decreased organizational capacity.' },
  { stage: '4', label: 'Decreased ability to perform complex tasks (e.g., planning dinner for guests, handling personal finances, difficulty marketing).' },
  { stage: '5', label: 'Requires assistance choosing proper clothing for the day, season, or occasion.' },
  { stage: '6a', label: 'Difficulty putting on clothes properly without assistance (e.g., street clothes over night clothes, shoes on wrong feet).' },
  { stage: '6b', label: 'Unable to bathe properly (e.g., difficulty adjusting bath water temperature); may develop fear of bathing.' },
  { stage: '6c', label: 'Inability to handle mechanics of toileting (e.g., forgets to flush, does not wipe properly).' },
  { stage: '6d', label: 'Urinary incontinence, occasional or more frequent.' },
  { stage: '6e', label: 'Fecal incontinence, occasional or more frequent.' },
  { stage: '7a', label: 'Ability to speak limited to about a half-dozen intelligible words or fewer in an average day.' },
  { stage: '7b', label: 'Speech ability limited to a single intelligible word in an average day.' },
  { stage: '7c', label: 'Ambulatory ability is lost (cannot walk without personal assistance).' },
  { stage: '7d', label: 'Cannot sit up without assistance.' },
  { stage: '7e', label: 'Loss of ability to smile.' },
  { stage: '7f', label: 'Loss of ability to hold head up independently.' },
];

const STAGE_INDEX = new Map(STAGES.map((s, i) => [s.stage, i]));

const NOTE = 'Functional Assessment Staging Tool (FAST; Reisberg 1985/1988). Score the highest consecutive level of disability the patient has reached: stages 1-5 are single levels, stage 6 has substages 6a-6e (dressing, bathing, toileting, then urinary then fecal incontinence) and stage 7 has substages 7a-7f (speech loss to a half-dozen words, then a single word, then loss of ambulation, sitting, smiling, and head control). Stage 7a or beyond together with a named medical complication in the prior 12 months (aspiration pneumonia, pyelonephritis, septicemia, multiple stage 3-4 pressure ulcers, recurrent fever after antibiotics, or inability to maintain sufficient fluid and calorie intake) is a component of the Medicare local-coverage dementia hospice-eligibility guideline. This reports the guideline descriptor and hospice context, not a diagnosis and not an eligibility determination; the staging and the hospice decision stay with the clinician.';

// Stage 7a is the ordinal threshold at/above which the dementia hospice
// local-coverage guideline's FAST component is met (with a complication).
const HOSPICE_THRESHOLD_INDEX = STAGE_INDEX.get('7a');

// input.stage: one of STAGES' `stage` codes. Returns the descriptor and, for
// stage 7a+, the hospice-eligibility context flag.
export function fastStage(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const code = typeof o.stage === 'string' ? o.stage.trim().toLowerCase() : String(o.stage || '').trim().toLowerCase();
  if (!code) {
    return { valid: false, message: 'Select the highest FAST stage the patient has reached.' };
  }
  if (!STAGE_INDEX.has(code)) {
    throw new RangeError('FAST stage must be one of 1-5, 6a-6e, or 7a-7f.');
  }
  const idx = STAGE_INDEX.get(code);
  const entry = STAGES[idx];
  const hospiceContext = idx >= HOSPICE_THRESHOLD_INDEX;

  let band = `FAST stage ${entry.stage}: ${entry.label}`;
  if (hospiceContext) {
    band += ' At stage 7a or beyond, FAST plus a named medical complication in the prior 12 months is a component of the Medicare dementia hospice-eligibility guideline — confirm the complication and the six-month prognosis clinically.';
  }

  return {
    valid: true,
    stage: entry.stage,
    descriptor: entry.label,
    hospiceContext,
    abnormal: hospiceContext,
    bandLabel: `FAST stage ${entry.stage}`,
    band,
    note: NOTE,
  };
}
