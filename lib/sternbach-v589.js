// spec-v589: the Sternbach criteria for serotonin syndrome. A PREDECESSOR GAP:
// `serotonin-toxicity` (the Hunter criteria) is already in the catalog, and the Hunter criteria were built
// to replace these. `grep -ci sternbach app.js` returned 0.
//
// **THE SUPERIORITY OF THE SUCCESSOR IS CONTESTED, WHICH IS WHY THE PREDECESSOR STILL MATTERS.** The usual
// summary is that Hunter is simply better (sensitivity 84 against 75 percent, specificity 97 against 96).
// But a published re-examination points out that the Hunter derivation dataset OVERLAPPED SUBSTANTIALLY WITH
// ITS VALIDATION DATA, so the comparison "cannot be upheld" as stated, and in that group's own case series
// the Sternbach criteria missed 10 percent of cases against Hunter's 37 percent. This tool reports the
// published headline figures AND the challenge to them, because "use Hunter, Sternbach is obsolete" is the
// received wisdom and it is not settled.
//
// **THREE OF THE FOUR REQUIREMENTS ARE NOT SYMPTOMS, AND ONE OF THEM IS A NEGATIVE.** Meeting 3 of the 10
// features is necessary and NOT sufficient. The diagnosis also requires that the features coincided with the
// ADDITION OR INCREASE of a serotonergic agent, that other causes -- infection, metabolic or endocrine
// disease, substance abuse or withdrawal -- have been RULED OUT, and that A NEUROLEPTIC HAD NOT BEEN STARTED
// OR INCREASED IN DOSAGE before onset. That last one is a hard negative and it is the one implementations
// drop: it exists because neuroleptic malignant syndrome is the differential, and a symptom count that
// ignores it will label an NMS patient with serotonin syndrome.
//
// **THE TEN FEATURES ARE MOSTLY NON-SPECIFIC, WHICH IS THE KNOWN WEAKNESS.** Agitation, diaphoresis,
// shivering, tremor, diarrhea and fever are shared with a great many acute illnesses, so a patient on an
// SSRI with a febrile gastroenteritis can reach 3 of 10 without having serotonin toxicity. That is exactly
// why the exclusion requirement is load-bearing rather than decorative, and why the successor was built
// around clonus, a specific sign.
//
// **ONE REPRODUCTION ADDS AN ELEVENTH FEATURE AND THAT CAN CHANGE A VERDICT.** The widely reproduced list is
// the ten below. At least one authoritative review prints an eleven-item list that adds RIGIDITY (and prints
// "restlessness" for "agitation"). Since the bar is 3 of N, a patient with rigidity and exactly two of the
// ten is POSITIVE under the eleven-item rendering and NEGATIVE under the ten-item one. The ten-item list is
// applied here, rigidity is asked separately, and any case whose verdict would flip is flagged rather than
// silently resolved (spec-v97).
//
// HIGH-STAKES: these are diagnostic criteria, and serotonin syndrome is a clinical diagnosis that can
// deteriorate quickly. Failing the criteria does NOT exclude it -- early or mild cases commonly do not meet
// them, and this tool must never be used to rule the diagnosis out. Meeting them does not grade severity and
// does not select treatment: it does not decide on cyproheptadine, on sedation, on paralysis and intubation
// for hyperthermia, or on which drug to stop. Serotonin syndrome and neuroleptic malignant syndrome overlap
// clinically and the neuroleptic requirement here is a criterion, not a reliable way to tell them apart
// (spec-v11 section 5.3).
//
// FEATURES AND REQUIREMENTS RE-FETCHED AND DOUBLE-CONFIRMED ACROSS TWO INDEPENDENT REPRODUCTIONS, NEVER
// RECALLED (spec-v97), with the item list confirmed twice specifically because reproductions differ on
// whether rigidity belongs to it:
//   - Sternbach H. The serotonin syndrome. Am J Psychiatry. 1991;148(6):705-713.
//   - Dunkley EJC, Isbister GK, Sibbritt D, et al. The Hunter Serotonin Toxicity Criteria. QJM.
//     2003;96(9):635-642 (the successor, and the source of the compared figures).

export const FEATURES = [
  { key: 'mentalStatus', text: 'Mental status changes (confusion, hypomania)' },
  { key: 'agitation', text: 'Agitation' },
  { key: 'myoclonus', text: 'Myoclonus' },
  { key: 'hyperreflexia', text: 'Hyperreflexia' },
  { key: 'diaphoresis', text: 'Diaphoresis' },
  { key: 'shivering', text: 'Shivering' },
  { key: 'tremor', text: 'Tremor' },
  { key: 'diarrhea', text: 'Diarrhea' },
  { key: 'incoordination', text: 'Incoordination' },
  { key: 'fever', text: 'Fever' },
];

export const FEATURES_REQUIRED = 3;
export const DISPUTED_FEATURE = 'rigidity';

export const REQUIREMENTS = [
  { key: 'serotonergicAgentAddedOrIncreased', text: 'The features coincided with the ADDITION of, or an INCREASE in, a known serotonergic agent' },
  { key: 'otherEtiologiesExcluded', text: 'Other causes have been RULED OUT - infectious, metabolic or endocrine, substance abuse or withdrawal' },
  { key: 'noNeurolepticStartedOrIncreased', text: 'A neuroleptic had NOT been started or increased in dosage before onset' },
];

// Published comparison figures, reported with the challenge to them.
export const SENSITIVITY = { sternbach: 75, hunter: 84 };
export const SPECIFICITY = { sternbach: 96, hunter: 97 };

export const CONTESTED_NOTE = `The usual summary is that the successor is simply better - Hunter sensitivity ${SENSITIVITY.hunter} percent against Sternbach ${SENSITIVITY.sternbach}, specificity ${SPECIFICITY.hunter} against ${SPECIFICITY.sternbach}. A published re-examination challenges that: the Hunter derivation dataset overlapped substantially with its validation data, so the comparison cannot be upheld as stated, and in that group’s own case series the Sternbach criteria missed 10 percent of cases against Hunter’s 37 percent. "Sternbach is obsolete" is received wisdom, not a settled finding.`;
export const NEUROLEPTIC_NOTE = 'The neuroleptic requirement is a HARD NEGATIVE and it is the one implementations drop. It exists because neuroleptic malignant syndrome is the differential, so a symptom count that ignores it will label an NMS patient with serotonin syndrome.';
export const NONSPECIFIC_NOTE = 'Most of the ten features are non-specific. Agitation, diaphoresis, shivering, tremor, diarrhea and fever are shared with many acute illnesses, so a patient on an SSRI with a febrile gastroenteritis can reach 3 of 10 without serotonin toxicity. That is why the exclusion requirement is load-bearing rather than decorative, and why the successor was built around clonus, a specific sign.';
export const RIGIDITY_NOTE = `The widely reproduced list has ten features. At least one authoritative review prints an eleven-item list that adds ${DISPUTED_FEATURE} (and "restlessness" for "agitation"). Because the bar is ${FEATURES_REQUIRED} of N, a patient with ${DISPUTED_FEATURE} and exactly two of the ten is positive under the eleven-item rendering and negative under the ten-item one. The ten-item list is applied here and the divergence is reported rather than silently resolved.`;

const NOTE = `The Sternbach criteria for serotonin syndrome (Sternbach 1991). At least ${FEATURES_REQUIRED} of ten clinical features - mental status changes, agitation, myoclonus, hyperreflexia, diaphoresis, shivering, tremor, diarrhea, incoordination and fever - PLUS three requirements that are not symptoms: the features coincided with the addition of or an increase in a known serotonergic agent; other causes such as infection, metabolic or endocrine disease and substance abuse or withdrawal have been ruled out; and a neuroleptic had NOT been started or increased in dosage before onset. That last is a hard negative and the one implementations drop, and it exists because neuroleptic malignant syndrome is the differential, so a symptom count that ignores it will label an NMS patient with serotonin syndrome. Most of the ten features are non-specific, so a patient on an SSRI with a febrile gastroenteritis can reach three of ten without serotonin toxicity, which is why the exclusion requirement is load-bearing and why the successor Hunter criteria were built around clonus, a specific sign. The superiority of that successor is contested: the headline figures are Hunter sensitivity ${SENSITIVITY.hunter} percent against ${SENSITIVITY.sternbach} and specificity ${SPECIFICITY.hunter} against ${SPECIFICITY.sternbach}, but a published re-examination notes the Hunter derivation dataset overlapped substantially with its validation data and reports that in its own case series Sternbach missed 10 percent of cases against Hunter's 37 percent. One reproduction adds an eleventh feature, rigidity, and because the bar is three of N that can change a verdict; the ten-item list is applied here and the divergence is reported. These are diagnostic criteria for a clinical diagnosis that can deteriorate quickly. FAILING THEM DOES NOT EXCLUDE SEROTONIN SYNDROME - early or mild cases commonly do not meet them - and this must never be used to rule the diagnosis out. Meeting them does not grade severity and does not select treatment: it does not decide on cyproheptadine, sedation, or paralysis and intubation for hyperthermia, and does not choose which drug to stop. Serotonin syndrome and neuroleptic malignant syndrome overlap clinically, and the neuroleptic requirement is a criterion rather than a reliable way to tell them apart.`;

function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}

// input: one key per entry in FEATURES and REQUIREMENTS, each yes/no, plus `rigidity`.
export function sternbach(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let feats, reqs, rigidity;
  try {
    feats = FEATURES.map((f) => ({ f, v: readBool(o[f.key], f.text) }));
    reqs = REQUIREMENTS.map((r) => ({ r, v: readBool(o[r.key], r.text) }));
    rigidity = readBool(o.rigidity, 'Rigidity');
  } catch (err) {
    return { valid: false, message: err.message };
  }
  const missing = [...feats.filter((x) => x.v === null).map((x) => x.f.key),
    ...reqs.filter((x) => x.v === null).map((x) => x.r.key)];
  if (rigidity === null) missing.push('rigidity');
  if (missing.length) {
    return { valid: false, message: `Answer every feature and every requirement. Still needed: ${missing.join(', ')}. The three requirements are NOT symptoms, and one of them is a negative.` };
  }

  const featureCount = feats.filter((x) => x.v).length;
  const featuresMet = featureCount >= FEATURES_REQUIRED;
  const unmetRequirements = reqs.filter((x) => !x.v).map((x) => x.r);
  const requirementsMet = unmetRequirements.length === 0;
  const meetsCriteria = featuresMet && requirementsMet;

  // The verdict flips on the disputed item only when rigidity is the third feature.
  const rigidityWouldChangeVerdict = rigidity && featureCount === FEATURES_REQUIRED - 1;

  const parts = [];
  parts.push(`${featureCount} of ${FEATURES.length} features (${FEATURES_REQUIRED} required) and ${REQUIREMENTS.length - unmetRequirements.length} of ${REQUIREMENTS.length} requirements met. ${meetsCriteria ? 'MEETS the Sternbach criteria.' : 'Does NOT meet the Sternbach criteria.'}`);
  if (featuresMet && !requirementsMet) {
    parts.push(`The feature count is met and the criteria are still NOT met, because ${unmetRequirements.length === 1 ? 'a requirement that is not a symptom is unmet' : 'requirements that are not symptoms are unmet'}: ${unmetRequirements.map((r) => r.text).join('; ')}. Meeting ${FEATURES_REQUIRED} of ${FEATURES.length} is necessary and NOT sufficient.`);
  }
  if (!reqs.find((x) => x.r.key === 'noNeurolepticStartedOrIncreased').v) {
    parts.push(`A neuroleptic WAS started or increased. ${NEUROLEPTIC_NOTE}`);
  }
  if (rigidityWouldChangeVerdict) {
    parts.push(`THIS VERDICT DEPENDS ON WHICH PUBLISHED LIST IS USED. Rigidity is present and there are exactly ${featureCount} of the ten features, so the eleven-item rendering would reach ${FEATURES_REQUIRED} and this one does not. ${RIGIDITY_NOTE}`);
  }
  parts.push(NONSPECIFIC_NOTE);
  parts.push(CONTESTED_NOTE);
  parts.push('FAILING THESE CRITERIA DOES NOT EXCLUDE SEROTONIN SYNDROME: early or mild cases commonly do not meet them. They do not grade severity and do not select treatment, and they are not a reliable way to distinguish serotonin syndrome from neuroleptic malignant syndrome.');

  return {
    valid: true,
    featureCount,
    featuresRequired: FEATURES_REQUIRED,
    featureTotal: FEATURES.length,
    featuresMet,
    requirementsMet,
    unmetRequirements: unmetRequirements.map((r) => r.key),
    meetsCriteria,
    rigidityPresent: rigidity,
    verdictDependsOnDisputedFeature: rigidityWouldChangeVerdict,
    band: meetsCriteria ? 'Meets the Sternbach criteria' : 'Does not meet the Sternbach criteria',
    bandLabel: `${meetsCriteria ? 'Meets' : 'Does not meet'} Sternbach (${featureCount} of ${FEATURES.length} features)`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
