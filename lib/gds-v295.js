// spec-v295 (fulfills the spec-v173 §2.6 global-deterioration-scale deferral):
// the Reisberg Global Deterioration Scale (GDS) for primary degenerative
// dementia. The companion staging instrument to FAST (lib/fast-dementia-v294.js):
// GDS stages global cognition/function 1-7, FAST stages function in finer 6a-7f
// substeps. Deferred at v173 pending verbatim sourcing; the stage table was
// re-fetched and cross-verified at build (spec-v97).
//
// The clinician selects the single most appropriate global stage; the tile
// reports the published stage label and clinical characteristics and flags stage
// 5 and beyond, at which the source states the patient "can no longer survive
// without assistance." It reports the guideline's own descriptor, not a
// diagnosis (spec-v11 §5.3) — staging and care planning stay with the clinician.
//
// STAGE TABLE RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified at build
// against two independent verbatim reproductions of Reisberg's GDS (the
// geriatric-resources.com reproduction "reproduced with permission" and the
// dementiaresearch.org.au clinician form); the two agree on every stage.
//   Reisberg B, Ferris SH, de Leon MJ, Crook T. The Global Deterioration Scale
//   for assessment of primary degenerative dementia. Am J Psychiatry.
//   1982;139(9):1136-1139.

// Seven global stages. `label` is the published stage title; `descriptor` is the
// faithfully condensed clinical-characteristics text.
const STAGES = [
  { stage: '1', label: 'No cognitive decline', descriptor: 'No subjective complaints of memory deficit; no memory deficit evident on clinical interview.' },
  { stage: '2', label: 'Very mild cognitive decline (age-associated memory impairment)', descriptor: 'Subjective complaints of memory deficit — forgetting where familiar objects are placed, forgetting names once known well. No objective evidence on clinical interview and no deficit in employment or social situations.' },
  { stage: '3', label: 'Mild cognitive decline (mild cognitive impairment)', descriptor: 'Earliest clear-cut deficits: may get lost traveling to an unfamiliar location, co-workers note poorer performance, word/name-finding deficits evident to intimates, retains little from reading. Objective memory deficit only on intensive interview; decreased performance in demanding settings.' },
  { stage: '4', label: 'Moderate cognitive decline (mild dementia)', descriptor: 'Clear-cut deficit on careful interview: decreased knowledge of current and recent events, deficit in personal history, concentration deficit on serial subtractions, reduced ability to travel and handle finances. Inability to perform complex tasks; orientation and recognition of familiar people usually intact.' },
  { stage: '5', label: 'Moderately severe cognitive decline (moderate dementia)', descriptor: 'Can no longer survive without some assistance. Unable to recall a major aspect of current life (a long-held address or phone number, names of grandchildren, the school attended). Some disorientation to time or place; retains own and family names; may need help choosing proper clothing.' },
  { stage: '6', label: 'Severe cognitive decline (moderately severe dementia)', descriptor: 'May forget the name of the spouse on whom they depend; largely unaware of recent events. Requires assistance with activities of daily living and may become incontinent; diurnal rhythm often disturbed. Personality and emotional changes: delusions, obsessive or anxiety symptoms, agitation.' },
  { stage: '7', label: 'Very severe cognitive decline (severe dementia)', descriptor: 'All verbal abilities are lost — progressing to no serviceable speech. Incontinent; requires assistance with toileting and feeding. Basic psychomotor skills such as walking are lost; generalized rigidity and developmental neurologic reflexes are frequently present.' },
];

const STAGE_INDEX = new Map(STAGES.map((s, i) => [s.stage, i]));

const NOTE = 'Global Deterioration Scale (GDS; Reisberg 1982). Choose the single most appropriate global stage (1-7) from cognition and function. Stages 1-3 are pre-dementia (1 normal, 2 age-associated memory impairment, 3 mild cognitive impairment); stages 4-7 are dementia (4 mild, 5 moderate, 6 moderately severe, 7 severe). At stage 5 and beyond the scale states the patient can no longer survive without assistance. The GDS pairs with FAST (functional staging) and the Brief Cognitive Rating Scale. This reports the published stage descriptor, not a diagnosis; staging and care planning stay with the clinician.';

// Stage 5 is the source-stated threshold at/above which the patient "can no
// longer survive without some assistance."
const ASSISTANCE_THRESHOLD_INDEX = STAGE_INDEX.get('5');

// input.stage: one of STAGES' `stage` codes ('1'..'7'). Returns the stage label
// and clinical descriptor and, for stage 5+, the needs-assistance flag.
export function gdsStage(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const code = typeof o.stage === 'string' ? o.stage.trim() : String(o.stage || '').trim();
  if (!code) {
    return { valid: false, message: 'Select the most appropriate GDS global stage (1-7).' };
  }
  if (!STAGE_INDEX.has(code)) {
    throw new RangeError('GDS stage must be one of 1 through 7.');
  }
  const idx = STAGE_INDEX.get(code);
  const entry = STAGES[idx];
  const needsAssistance = idx >= ASSISTANCE_THRESHOLD_INDEX;

  let band = `GDS stage ${entry.stage} — ${entry.label}: ${entry.descriptor}`;
  if (needsAssistance) {
    band += ' At GDS stage 5 and beyond the patient can no longer survive without some assistance.';
  }

  return {
    valid: true,
    stage: entry.stage,
    stageLabel: entry.label,
    descriptor: entry.descriptor,
    needsAssistance,
    abnormal: needsAssistance,
    bandLabel: `GDS stage ${entry.stage}`,
    band,
    note: NOTE,
  };
}
