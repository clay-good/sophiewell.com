// spec-v820: ICHD-3 criteria for 3.3 Short-lasting unilateral neuralgiform headache
// attacks, with the 3.3.1 SUNCT and 3.3.2 SUNA subtypes.
//
// Source:
//   Headache Classification Committee of the International Headache Society (IHS). The
//   International Classification of Headache Disorders, 3rd edition. Cephalalgia.
//   2018;38(1):1-211. Section 3.3 and its subsections, read from ichd-3.org.
//
//   A  at least 20 attacks fulfilling B-D
//   B  moderate or severe unilateral head pain, orbital, supraorbital, temporal and/or other
//      trigeminal distribution, lasting 1-600 SECONDS, as single stabs, series of stabs or in
//      a saw-tooth pattern
//   C  at least ONE ipsilateral cranial autonomic symptom or sign
//   D  frequency of at least one a day
//   E  not better accounted for by another ICHD-3 diagnosis
//
//   3.3.1 SUNCT  BOTH conjunctival injection AND lacrimation
//   3.3.2 SUNA   only ONE or NEITHER of those two
//
// TWO THINGS SEPARATE THIS FROM THE OTHER TRIGEMINAL AUTONOMIC CEPHALALGIAS:
//
//   1. An autonomic sign is REQUIRED. Cluster headache (3.1) and paroxysmal hemicrania (3.2)
//      both offer "either or both of: an autonomic sign, OR restlessness". 3.3 does not.
//      Restlessness is no substitute here, and a tool that carried the 3.1 wording across
//      would grant criterion C to patients who do not meet it.
//
//   2. It completes the duration ladder, and the units change. Attacks last 1-600 SECONDS,
//      against 2-30 minutes for paroxysmal hemicrania and 15-180 minutes for cluster
//      headache. Ten minutes is the ceiling here and the floor is one second.
//
// The SUNCT/SUNA split is not a severity gradient. It turns on whether BOTH conjunctival
// injection and lacrimation are present; one of the two, or neither, is SUNA. So a patient
// with florid tearing but no conjunctival injection is SUNA, not "mild SUNCT".
//
// Pure: no DOM, no clock, no network.

export const SUNCT_NOTE = 'The ICHD-3 criteria for short-lasting unilateral neuralgiform headache attacks (Headache Classification Committee of the International Headache Society, Cephalalgia 2018;38(1):1-211, section 3.3) need at least twenty attacks of moderate or severe one-sided head pain in an orbital, supraorbital, temporal or other trigeminal distribution, lasting 1 to 600 seconds and coming as single stabs, series of stabs or in a saw-tooth pattern, with at least one cranial autonomic symptom or sign on the same side, at a frequency of at least one a day, and no better explanation among the other ICHD-3 diagnoses. Two things set this apart from the other trigeminal autonomic cephalalgias. An autonomic sign is required, where cluster headache and paroxysmal hemicrania both accept restlessness instead, so carrying their wording across would grant the criterion to patients who do not meet it. And the attacks are far shorter, measured in seconds rather than minutes: 1 to 600 seconds here against 2 to 30 minutes for paroxysmal hemicrania and 15 to 180 minutes for cluster headache. The subtype turns on two specific signs. Both conjunctival injection and tearing together is SUNCT; only one of them, or neither, is SUNA. That is not a severity gradient, so florid tearing without conjunctival injection is SUNA rather than a mild SUNCT. It applies published criteria to a history already taken and it does not start lamotrigine or arrange imaging.';

// The seven signs listed in section 3.3. Conjunctival injection and lacrimation are held
// separately from the rest because the subtype turns on those two alone.
const AUTONOMIC_OTHER = [
  { arg: 'nasalCongestion', text: 'nasal congestion and/or rhinorrhea' },
  { arg: 'eyelidEdema', text: 'eyelid edema' },
  { arg: 'sweating', text: 'forehead and facial sweating' },
  { arg: 'flushing', text: 'forehead and facial flushing' },
  { arg: 'earFullness', text: 'a sensation of fullness in the ear' },
  { arg: 'miosisPtosis', text: 'miosis and/or ptosis' },
];

export const MIN_ATTACKS = 20;
export const DURATION_MIN_SECONDS = 1;
export const DURATION_MAX_SECONDS = 600;
export const MIN_PER_DAY = 1;
export const MAX_PER_DAY = 2000;

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function sunctSunaIchd3(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const attacks = num(o.attackCount);
  const seconds = num(o.attackSeconds);
  const perDay = num(o.attacksPerDay);
  for (const [label, v, max] of [
    ['Attack count', attacks, 100000],
    ['Attack duration in seconds', seconds, 86400],
    ['Attacks per day', perDay, MAX_PER_DAY],
  ]) {
    if (v !== null && (v < 0 || v > max)) return { valid: false, message: `${label} must be between 0 and ${max}.` };
  }

  const conjunctival = truthy(o.conjunctivalInjection);
  const lacrimation = truthy(o.lacrimation);
  const others = AUTONOMIC_OTHER.filter((s) => truthy(o[s.arg])).map((s) => s.text);
  const autonomicCount = (conjunctival ? 1 : 0) + (lacrimation ? 1 : 0) + others.length;

  const a = attacks !== null && attacks >= MIN_ATTACKS;
  const b = truthy(o.moderateOrSevereUnilateral)
    && seconds !== null && seconds >= DURATION_MIN_SECONDS && seconds <= DURATION_MAX_SECONDS
    && truthy(o.stabbingPattern);
  const c = autonomicCount >= 1;
  const d = perDay !== null && perDay >= MIN_PER_DAY;
  const e = truthy(o.noBetterExplanation);

  const met = a && b && c && d && e;

  const subtype = met
    ? (conjunctival && lacrimation
      ? '3.3.1 SUNCT — both conjunctival injection and tearing'
      : '3.3.2 SUNA — only one of conjunctival injection and tearing, or neither')
    : null;

  // Restlessness is NOT an alternative here, unlike 3.1 and 3.2.
  const restlessNote = truthy(o.restlessness) && !c
    ? 'Restlessness is recorded, but criterion C of 3.3 requires a cranial autonomic sign and does not accept restlessness as an alternative. Cluster headache and paroxysmal hemicrania do; this one does not.'
    : null;

  // The units change between the trigeminal autonomic cephalalgias.
  const durationNote = seconds !== null && seconds > DURATION_MAX_SECONDS
    ? `Attacks of ${seconds} seconds are longer than the ${DURATION_MAX_SECONDS}-second ceiling here. Paroxysmal hemicrania covers 2 to 30 minutes and cluster headache 15 to 180 minutes.`
    : null;

  // The subtype is a pair of signs, not a severity.
  const subtypeNote = met && (conjunctival !== lacrimation)
    ? `Only ${conjunctival ? 'conjunctival injection' : 'tearing'} is present, without the other, which makes this SUNA rather than SUNCT. The split turns on having BOTH signs, not on how marked they are.`
    : null;

  const missing = [];
  if (!a) missing.push(`at least ${MIN_ATTACKS} attacks`);
  if (!b) missing.push(`moderate or severe one-sided trigeminal pain lasting ${DURATION_MIN_SECONDS} to ${DURATION_MAX_SECONDS} seconds, in stabs or a saw-tooth pattern`);
  if (!c) missing.push('at least one ipsilateral cranial autonomic sign');
  if (!d) missing.push(`a frequency of at least ${MIN_PER_DAY} a day`);
  if (!e) missing.push('no better ICHD-3 explanation');

  return {
    valid: true,
    criteriaMet: met,
    criteria: { a, b, c, d, e },
    subtype,
    autonomicCount,
    restlessNote,
    durationNote,
    subtypeNote,
    missing,
    abnormal: met,
    bandLabel: met ? (conjunctival && lacrimation ? 'SUNCT' : 'SUNA') : 'ICHD-3 criteria not met',
    band: met
      ? `ICHD-3 criteria for 3.3 met. ${subtype}.`
      : `ICHD-3 criteria for short-lasting unilateral neuralgiform headache attacks not met — still needed: ${missing.join('; ')}.`,
    detail: `Attacks last ${DURATION_MIN_SECONDS} to ${DURATION_MAX_SECONDS} SECONDS, which is what separates this from paroxysmal hemicrania at 2 to 30 minutes and cluster headache at 15 to 180 minutes. An autonomic sign is required; restlessness is not an alternative here as it is in 3.1 and 3.2. Both conjunctival injection and tearing is SUNCT; one or neither is SUNA.`,
    note: SUNCT_NOTE,
  };
}
