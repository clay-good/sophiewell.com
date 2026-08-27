// spec-v814: ICHD-3 diagnostic criteria for 3.1 Cluster headache, with the 3.1.1 episodic
// and 3.1.2 chronic subtypes.
//
// Source:
//   Headache Classification Committee of the International Headache Society (IHS). The
//   International Classification of Headache Disorders, 3rd edition. Cephalalgia.
//   2018;38(1):1-211. Section 3.1, published in full and free at ichd-3.org.
//
// Criteria A-E:
//   A  at least 5 attacks fulfilling B-D
//   B  severe or very severe unilateral orbital, supraorbital and/or temporal pain lasting
//      15-180 minutes untreated
//   C  either or both of: at least one ipsilateral cranial autonomic symptom (conjunctival
//      injection and/or lacrimation; nasal congestion and/or rhinorrhea; eyelid edema;
//      forehead and facial sweating; miosis and/or ptosis) OR a sense of restlessness or
//      agitation
//   D  frequency between one every other day and 8 per day
//   E  not better accounted for by another ICHD-3 diagnosis
//
// Criterion C is the one most often misread, in both directions. Restlessness ALONE
// satisfies it: a patient who paces but has no autonomic sign still meets C. And the
// autonomic route needs only ONE sign, not several. A tool that demanded an autonomic
// symptom would rule out cluster headache in patients who have it.
//
// Criterion D is a WINDOW with a floor, not a "more is worse" threshold. Attacks less often
// than one every other day fail it just as ten a day do. The frequency floor of 0.5 per day
// is one attack every other day.
//
// Pure: no DOM, no clock, no network.

export const CLUSTER_NOTE = 'The ICHD-3 criteria for cluster headache (Headache Classification Committee of the International Headache Society, Cephalalgia 2018;38(1):1-211, section 3.1) need all five of: at least five attacks; severe or very severe one-sided orbital, supraorbital or temporal pain lasting 15 to 180 minutes untreated; either at least one cranial autonomic sign on the same side as the pain or a sense of restlessness or agitation; a frequency between one attack every other day and eight a day; and no better explanation among the other ICHD-3 diagnoses. The autonomic signs are conjunctival injection or tearing, nasal congestion or a runny nose, eyelid swelling, forehead and facial sweating, and a small pupil or drooping eyelid. Two points are easy to get wrong. Restlessness on its own satisfies the third criterion, so a patient who paces with no autonomic sign still meets it, and only one autonomic sign is needed rather than several. And the frequency requirement is a window with a floor, not a more-is-worse threshold: attacks less often than one every other day fail it just as ten a day do. Where the attacks come in bouts, at least two cluster periods lasting 7 days to 1 year separated by pain-free remissions of 3 months or more is episodic; no remission, or remissions under 3 months, for at least a year is chronic. It applies published criteria to a history already taken and it does not prescribe oxygen, a triptan or a preventive.';

const AUTONOMIC = [
  { arg: 'conjunctivalInjection', text: 'conjunctival injection and/or lacrimation' },
  { arg: 'nasalCongestion', text: 'nasal congestion and/or rhinorrhea' },
  { arg: 'eyelidEdema', text: 'eyelid edema' },
  { arg: 'sweating', text: 'forehead and facial sweating' },
  { arg: 'miosisPtosis', text: 'miosis and/or ptosis' },
];

export const MIN_ATTACKS = 5;
export const DURATION_MIN = 15;   // minutes, untreated
export const DURATION_MAX = 180;
export const FREQ_MIN = 0.5;      // one every other day
export const FREQ_MAX = 8;        // per day

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function clusterHeadacheIchd3(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const attacks = num(o.attackCount);
  const duration = num(o.attackDuration);
  const frequency = num(o.attacksPerDay);
  if (attacks !== null && attacks < 0) return { valid: false, message: 'Attack count cannot be negative.' };
  if (duration !== null && duration < 0) return { valid: false, message: 'Attack duration cannot be negative.' };
  if (frequency !== null && frequency < 0) return { valid: false, message: 'Attack frequency cannot be negative.' };

  const a = attacks !== null && attacks >= MIN_ATTACKS;
  const b = truthy(o.severeUnilateralPain) && duration !== null && duration >= DURATION_MIN && duration <= DURATION_MAX;

  const autonomicPresent = AUTONOMIC.filter((s) => truthy(o[s.arg])).map((s) => s.text);
  const restless = truthy(o.restlessness);
  const c = autonomicPresent.length >= 1 || restless;

  const d = frequency !== null && frequency >= FREQ_MIN && frequency <= FREQ_MAX;
  const e = truthy(o.noBetterExplanation);

  const met = a && b && c && d && e;

  const missing = [];
  if (!a) missing.push(`at least ${MIN_ATTACKS} attacks`);
  if (!b) missing.push(`severe or very severe one-sided orbital, supraorbital or temporal pain lasting ${DURATION_MIN} to ${DURATION_MAX} minutes untreated`);
  if (!c) missing.push('at least one ipsilateral cranial autonomic sign, or restlessness or agitation');
  if (!d) missing.push('a frequency between one every other day and 8 per day');
  if (!e) missing.push('no better explanation among the other ICHD-3 diagnoses');

  // Frequency is a window. Say WHICH side of it failed, because "too few" reads as a
  // milder case and is a fail all the same.
  let frequencyNote = null;
  if (frequency !== null && !d) {
    frequencyNote = frequency < FREQ_MIN
      ? `A frequency of ${frequency} per day is BELOW the floor of one attack every other day. Criterion D is a window, not a threshold, so too few attacks fails it just as too many would.`
      : `A frequency of ${frequency} per day is above the ceiling of ${FREQ_MAX} per day.`;
  }

  // Criterion C is satisfied by restlessness alone, and that surprises people.
  const restlessOnlyNote = c && restless && autonomicPresent.length === 0
    ? 'Criterion C is met on restlessness alone. No cranial autonomic sign is required: the criterion reads "either or both", so pacing or agitation is sufficient by itself.'
    : null;

  // Subtype, only meaningful once the criteria are met.
  const pattern = String(o.remissionPattern == null ? '' : o.remissionPattern).trim().toLowerCase();
  let subtype = null;
  if (met && pattern === 'episodic') subtype = '3.1.1 Episodic cluster headache — at least two cluster periods lasting 7 days to 1 year, separated by pain-free remissions of 3 months or more.';
  else if (met && pattern === 'chronic') subtype = '3.1.2 Chronic cluster headache — no remission, or remissions under 3 months, for at least 1 year.';

  return {
    valid: true,
    criteriaMet: met,
    criteria: { a, b, c, d, e },
    autonomicSigns: autonomicPresent,
    restlessness: restless,
    subtype,
    missing,
    frequencyNote,
    restlessOnlyNote,
    abnormal: met,
    bandLabel: met ? 'ICHD-3 criteria met' : 'ICHD-3 criteria not met',
    band: met
      ? `ICHD-3 criteria for cluster headache met.${subtype ? ' ' + subtype : ''}`
      : `ICHD-3 criteria for cluster headache not met — still needed: ${missing.join('; ')}.`,
    detail: `All five are required. Criterion C is satisfied by ONE ipsilateral autonomic sign or by restlessness alone, whichever comes first. Criterion D is a window between one attack every other day and ${FREQ_MAX} per day, so too few fails it as surely as too many.`,
    note: CLUSTER_NOTE,
  };
}
