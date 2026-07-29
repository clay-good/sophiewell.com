// spec-v588: the ESHRE Bologna criteria for poor ovarian response. A PREDECESSOR GAP, which is the inverse
// of the usual shape: the SUCCESSOR was already here. `poseidon` shipped earlier, and the POSEIDON
// classification exists precisely because the Bologna criteria lump very different patients under one label.
// The criteria the successor was built to replace were not in the catalog. `grep -ci bologna app.js`
// returned 0.
//
// **THE CUT-OFFS ARE PUBLISHED AS RANGES, NOT NUMBERS.** This is the load-bearing fact. The consensus
// defines an abnormal ovarian reserve test as an antral follicle count under 5 TO 7, or an AMH under 0.5 TO
// 1.1 ng/mL. It does not pick a number. So THE CRITERIA CANNOT BE COMPUTED WITHOUT A CHOICE THE SOURCE
// DECLINED TO MAKE: an antral follicle count of 6 is abnormal under a cutoff of 7 and normal under a cutoff
// of 5, and the same patient is or is not a poor responder depending on it. This lib therefore REQUIRES the
// center's own cutoff as an input, refuses to default one, and flags every result in which a value sits
// inside the published range, because that classification would flip under another permissible cutoff.
//
// **"AT LEAST TWO OF THREE" HAS AN OVERRIDE THAT NEEDS ONLY ONE.** The consensus adds that "two episodes of
// POR after maximal stimulation are sufficient to define a patient as poor responder IN THE ABSENCE OF
// advanced maternal age or abnormal ORT". So a patient meeting only one of the three headline criteria can
// still be a poor responder, and an implementation that counts to two and stops is wrong for exactly the
// group the override was written for.
//
// **THE FIRST CRITERION IS NOT A NUMBER.** It is "advanced maternal age (40 or over) OR ANY OTHER RISK
// FACTOR FOR POR" -- an open-ended clause with no list attached. A tool cannot enumerate it, so this one
// asks for it separately and says that the criterion is satisfied by clinical judgment rather than by the
// age alone.
//
// **THE SECOND CRITERION IS CONDITIONAL ON THE PROTOCOL USED.** A previous poor response counts only when it
// was 3 or fewer oocytes AFTER A CONVENTIONAL STIMULATION PROTOCOL. A low yield after a deliberately mild or
// minimal-stimulation cycle is not a Bologna criterion, and treating any low retrieval as qualifying
// over-diagnoses poor response.
//
// HIGH-STAKES: this is a research and prognostic DEFINITION, not a treatment decision. Meeting it does not
// mean a cycle will fail, does not set a stimulation protocol or a gonadotropin dose, and is not a reason to
// decline treatment or to advise donor oocytes -- the published criticism of these criteria is precisely
// that they group women with very different prognoses, which is why POSEIDON was proposed. It says nothing
// about oocyte or embryo quality, and nothing about the chance of a live birth in an individual
// (spec-v11 section 5.3).
//
// CRITERIA, THRESHOLDS AND THE OVERRIDE CLAUSE RE-FETCHED AND DOUBLE-CONFIRMED, NEVER RECALLED (spec-v97),
// with the range-valued cutoffs confirmed to be ranges in the primary rather than a reproduction's
// imprecision:
//   - Ferraretti AP, La Marca A, Fauser BCJM, et al. ESHRE consensus on the definition of "poor response" to
//     ovarian stimulation for in vitro fertilization: the Bologna criteria. Hum Reprod. 2011;26(7):1616-1624.

export const ADVANCED_AGE = 40;
export const PREVIOUS_POR_OOCYTES = 3;
export const CRITERIA_REQUIRED = 2;
export const OVERRIDE_EPISODES = 2;

// The consensus gives ranges. These are the ends of the published ranges, not defaults.
export const AFC_CUTOFF_RANGE = { low: 5, high: 7 };
export const AMH_CUTOFF_RANGE = { low: 0.5, high: 1.1 };  // ng/mL

export const RANGE_NOTE = `The consensus defines an abnormal ovarian reserve test as an antral follicle count under ${AFC_CUTOFF_RANGE.low} TO ${AFC_CUTOFF_RANGE.high}, or AMH under ${AMH_CUTOFF_RANGE.low} TO ${AMH_CUTOFF_RANGE.high} ng/mL. IT DOES NOT PICK A NUMBER. The criteria therefore cannot be applied without a cutoff the source declined to supply, so your center’s cutoff is a required input here and none is defaulted.`;
export const OVERRIDE_NOTE = `"At least two of three" is not the whole rule: the consensus adds that ${OVERRIDE_EPISODES} episodes of poor response after MAXIMAL stimulation are sufficient on their own, in the absence of advanced maternal age or an abnormal ovarian reserve test. Counting to two and stopping is wrong for exactly the group that clause was written for.`;
export const AGE_CRITERION_NOTE = `The first criterion is "advanced maternal age (${ADVANCED_AGE} or over) OR ANY OTHER RISK FACTOR for poor ovarian response" - an open-ended clause with no list attached, so it is satisfied by clinical judgment and not by the age alone.`;
export const PROTOCOL_NOTE = `A previous poor response counts only when it was ${PREVIOUS_POR_OOCYTES} or fewer oocytes after a CONVENTIONAL stimulation protocol. A low yield after a deliberately mild or minimal-stimulation cycle is not a Bologna criterion, and counting it over-diagnoses poor response.`;

const NOTE = `The ESHRE Bologna criteria (Ferraretti and colleagues 2011) define poor ovarian response for in vitro fertilization. At least ${CRITERIA_REQUIRED} of three must be present: advanced maternal age, ${ADVANCED_AGE} years or over, or any other risk factor for poor response; a previous poor response, ${PREVIOUS_POR_OOCYTES} or fewer oocytes after a conventional stimulation protocol; and an abnormal ovarian reserve test, an antral follicle count under 5 to 7 or AMH under 0.5 to 1.1 ng/mL. Two episodes of poor response after maximal stimulation are sufficient on their own in the absence of advanced maternal age or an abnormal ovarian reserve test, so a patient meeting only one headline criterion can still qualify and counting to two and stopping is wrong. The ovarian-reserve cutoffs are published as RANGES rather than numbers, so the criteria cannot be applied without a cutoff the source declined to supply: an antral follicle count of 6 is abnormal under a cutoff of 7 and normal under a cutoff of 5, and the same patient is or is not a poor responder depending on it. The center’s own cutoff is therefore a required input, none is defaulted, and any result resting on a value inside the published range is flagged as one that would flip under another permissible cutoff. The first criterion is an open-ended clause rather than a number, since it admits any other risk factor for poor response. The second is conditional on the protocol, counting only a conventional stimulation cycle. This is a research and prognostic definition, not a treatment decision. Meeting it does not mean a cycle will fail, does not set a stimulation protocol or a gonadotropin dose, and is not a reason to decline treatment or to advise donor oocytes; the published criticism of these criteria is precisely that they group women with very different prognoses, which is why the POSEIDON classification was proposed. They say nothing about oocyte or embryo quality and nothing about an individual’s chance of a live birth.`;

function readNum(v, name, { min = 0 } = {}) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(String(v).trim());
  if (!Number.isFinite(n) || n < min) throw new Error(`${name} must be a number that is ${min} or more.`);
  return n;
}
function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}
function inRange(value, range) {
  return value >= range.low && value <= range.high;
}

// input: age, otherRiskFactor, previousPorConventional, maximalStimulationPorEpisodes,
// afc, afcCutoff, amh, amhCutoff.
export function bolognaPor(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let age, other, prevPor, episodes, afc, afcCut, amh, amhCut;
  try {
    age = readNum(o.age, 'Age');
    other = readBool(o.otherRiskFactor, 'Other risk factor for poor ovarian response');
    prevPor = readBool(o.previousPorConventional, 'Previous poor response after a conventional protocol');
    episodes = readNum(o.maximalStimulationPorEpisodes, 'Episodes of poor response after maximal stimulation');
    afc = readNum(o.afc, 'Antral follicle count');
    afcCut = readNum(o.afcCutoff, 'Antral follicle count cutoff', { min: 1 });
    amh = readNum(o.amh, 'AMH');
    amhCut = readNum(o.amhCutoff, 'AMH cutoff', { min: 0.01 });
  } catch (err) {
    return { valid: false, message: err.message };
  }
  const missing = [
    ['age', age], ['otherRiskFactor', other], ['previousPorConventional', prevPor],
    ['maximalStimulationPorEpisodes', episodes], ['afc', afc], ['afcCutoff', afcCut],
    ['amh', amh], ['amhCutoff', amhCut],
  ].filter(([, v]) => v === null).map(([k]) => k);
  if (missing.length) {
    return { valid: false, message: `Answer every field. Still needed: ${missing.join(', ')}. The two cutoffs are required and NOT defaulted: ${RANGE_NOTE}` };
  }

  const cutoffsOutsidePublishedRange = [];
  if (!inRange(afcCut, AFC_CUTOFF_RANGE)) cutoffsOutsidePublishedRange.push(`antral follicle count cutoff ${afcCut} is outside the published ${AFC_CUTOFF_RANGE.low} to ${AFC_CUTOFF_RANGE.high}`);
  if (!inRange(amhCut, AMH_CUTOFF_RANGE)) cutoffsOutsidePublishedRange.push(`AMH cutoff ${amhCut} is outside the published ${AMH_CUTOFF_RANGE.low} to ${AMH_CUTOFF_RANGE.high}`);

  const afcAbnormal = afc < afcCut;
  const amhAbnormal = amh < amhCut;
  const ortAbnormal = afcAbnormal || amhAbnormal;

  // A value inside the published range is one whose verdict depends on the choice the source declined.
  const afcSensitive = afc >= AFC_CUTOFF_RANGE.low && afc < AFC_CUTOFF_RANGE.high;
  const amhSensitive = amh >= AMH_CUTOFF_RANGE.low && amh < AMH_CUTOFF_RANGE.high;

  const c1 = age >= ADVANCED_AGE || other;
  const c2 = prevPor;
  const c3 = ortAbnormal;
  const met = [c1, c2, c3].filter(Boolean).length;

  const byCount = met >= CRITERIA_REQUIRED;
  const byOverride = episodes >= OVERRIDE_EPISODES && !c1 && !c3;
  const poorResponder = byCount || byOverride;

  const parts = [];
  parts.push(`${met} of the three headline criteria met. ${poorResponder ? 'POOR OVARIAN RESPONDER by the Bologna criteria.' : 'Does not meet the Bologna criteria for poor ovarian response.'}`);
  if (byOverride && !byCount) {
    parts.push(`This patient qualifies through the OVERRIDE, not the count: ${episodes} episodes of poor response after maximal stimulation are sufficient on their own, in the absence of advanced maternal age and of an abnormal ovarian reserve test. An implementation that counts to ${CRITERIA_REQUIRED} and stops would call this patient a non-responder.`);
  }
  if (episodes >= OVERRIDE_EPISODES && (c1 || c3)) {
    parts.push(`The maximal-stimulation override does NOT apply here, because it is written to operate only in the ABSENCE of advanced maternal age and of an abnormal ovarian reserve test, and at least one of those is present. The count decides instead.`);
  }
  parts.push(`Ovarian reserve: antral follicle count ${afc} against your cutoff of ${afcCut} (${afcAbnormal ? 'abnormal' : 'normal'}); AMH ${amh} ng/mL against your cutoff of ${amhCut} (${amhAbnormal ? 'abnormal' : 'normal'}).`);
  if (afcSensitive || amhSensitive) {
    parts.push(`THIS RESULT DEPENDS ON A CHOICE THE SOURCE DECLINED TO MAKE. ${afcSensitive ? `An antral follicle count of ${afc} sits inside the published range of ${AFC_CUTOFF_RANGE.low} to ${AFC_CUTOFF_RANGE.high}. ` : ''}${amhSensitive ? `An AMH of ${amh} sits inside the published range of ${AMH_CUTOFF_RANGE.low} to ${AMH_CUTOFF_RANGE.high}. ` : ''}The same patient would be classified differently under another permissible cutoff.`);
  }
  if (cutoffsOutsidePublishedRange.length) {
    parts.push(`Note: ${cutoffsOutsidePublishedRange.join('; ')}. The result is still computed from the cutoff you supplied, but it is no longer a Bologna cutoff.`);
  }
  parts.push(RANGE_NOTE);
  parts.push(OVERRIDE_NOTE);
  parts.push(AGE_CRITERION_NOTE);
  parts.push(PROTOCOL_NOTE);
  parts.push('This is a definition, not a treatment decision. It does not set a protocol or a dose, is not a reason to decline treatment or to advise donor oocytes, and says nothing about oocyte quality or an individual’s chance of a live birth. The POSEIDON classification was proposed because these criteria group women with very different prognoses.');

  return {
    valid: true,
    poorResponder,
    criteriaMet: met,
    criteriaRequired: CRITERIA_REQUIRED,
    qualifiedByOverride: byOverride && !byCount,
    overrideBlocked: episodes >= OVERRIDE_EPISODES && (c1 || c3),
    criteria: { advancedAgeOrRiskFactor: c1, previousPor: c2, abnormalOvarianReserve: c3 },
    ortAbnormalByAfc: afcAbnormal,
    ortAbnormalByAmh: amhAbnormal,
    cutoffSensitive: afcSensitive || amhSensitive,
    cutoffsOutsidePublishedRange,
    band: poorResponder ? 'Poor ovarian responder' : 'Not a poor ovarian responder',
    bandLabel: `${poorResponder ? 'Poor ovarian responder' : 'Not a poor ovarian responder'} (${met} of 3)`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
