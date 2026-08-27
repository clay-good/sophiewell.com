// spec-v816: ICHD-3 criteria for 8.2 Medication-overuse headache, with its subtypes.
//
// Source:
//   Headache Classification Committee of the International Headache Society (IHS). The
//   International Classification of Headache Disorders, 3rd edition. Cephalalgia.
//   2018;38(1):1-211. Section 8.2 and its subsections, read from ichd-3.org.
//
// 8.2 umbrella:
//   A  headache on >=15 days/month in a patient with a pre-existing headache disorder
//   B  regular overuse for >3 months of one or more acute or symptomatic headache drugs
//   C  not better accounted for by another ICHD-3 diagnosis
//
// THE OVERUSE THRESHOLD IS NOT ONE NUMBER. It depends on the drug class:
//   8.2.1 ergotamine                >=10 days/month
//   8.2.2 triptans                  >=10
//   8.2.4 opioids                   >=10
//   8.2.5 combination analgesics    >=10
//   8.2.3 simple analgesics         >=15  (acetaminophen, aspirin, other NSAIDs)
//
// So ibuprofen on 12 days a month is NOT overuse and a triptan on 12 days is. Applying a
// single threshold gets one of those wrong whichever number is chosen.
//
// AND 8.2.6 catches the patient who overuses NOTHING individually: any combination of
// ergotamine, triptans, non-opioid analgesics and/or opioids on a TOTAL of >=10 days/month
// without overuse of any single drug or class. A triptan on 6 days and ibuprofen on 6 days
// is neither triptan-overuse nor analgesic-overuse, and is 8.2.6.
//
// A NOTE ON THAT TOTAL: 8.2.6 counts DAYS, not doses, so adding up per-drug day counts
// overcounts any day two drugs were taken. This tile therefore asks for the total number of
// days separately rather than summing, and says so when the two disagree.
//
// Pure: no DOM, no clock, no network.

export const MOH_NOTE = 'The ICHD-3 criteria for medication-overuse headache (Headache Classification Committee of the International Headache Society, Cephalalgia 2018;38(1):1-211, section 8.2) need headache on 15 or more days a month in someone who already has a headache disorder, regular overuse of an acute headache drug for more than three months, and no better explanation among the other ICHD-3 diagnoses. The overuse threshold is not a single number. Ergotamine, triptans, opioids and combination analgesics count as overuse at 10 or more days a month, while simple analgesics, meaning acetaminophen, aspirin and other anti-inflammatories, need 15 or more. Ibuprofen on twelve days a month is therefore not overuse and a triptan on twelve days is. There is also a subtype for the patient who overuses nothing individually: any combination of ergotamine, triptans, non-opioid analgesics or opioids on a total of 10 or more days a month, with no single class overused, is 8.2.6. That total counts days and not doses, so adding up the separate drug counts overstates it whenever two were taken on the same day. It applies published criteria to a medication history already taken and it does not plan a withdrawal or start a preventive.';

const CLASSES = [
  { arg: 'ergotamineDays', code: '8.2.1', name: 'ergotamine', threshold: 10, countsToTotal: true },
  { arg: 'triptanDays', code: '8.2.2', name: 'triptans', threshold: 10, countsToTotal: true },
  { arg: 'paracetamolDays', code: '8.2.3.1', name: 'acetaminophen', threshold: 15, countsToTotal: true },
  { arg: 'nsaidDays', code: '8.2.3.2', name: 'aspirin or other NSAIDs', threshold: 15, countsToTotal: true },
  { arg: 'opioidDays', code: '8.2.4', name: 'opioids', threshold: 10, countsToTotal: true },
  { arg: 'combinationDays', code: '8.2.5', name: 'combination analgesics', threshold: 10, countsToTotal: false },
];

export const HEADACHE_DAYS_THRESHOLD = 15;
export const OVERUSE_MONTHS_THRESHOLD = 3; // strictly greater than
export const MULTI_CLASS_THRESHOLD = 10;
export const DAYS_IN_MONTH = 31;
export const MAX_MONTHS = 1200; // a century of months; anything beyond is a typo, not a history

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function mohIchd3(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const headacheDays = num(o.headacheDays);
  const months = num(o.overuseMonths);
  const totalDays = num(o.totalMedicationDays);

  // Every "days per month" field has a real domain: a month has at most DAYS_IN_MONTH days.
  // Enforcing it is not defensive padding - it is what the unit means, and it also keeps the
  // 8.2.6 total from overflowing to Infinity when several fields are given absurd values.
  for (const [label, v] of [['Headache days', headacheDays], ['Total medication days', totalDays]]) {
    if (v !== null && (v < 0 || v > DAYS_IN_MONTH)) {
      return { valid: false, message: `${label} per month must be between 0 and ${DAYS_IN_MONTH}.` };
    }
  }
  if (months !== null && (months < 0 || months > MAX_MONTHS)) {
    return { valid: false, message: `Months of overuse must be between 0 and ${MAX_MONTHS}.` };
  }

  const counts = {};
  for (const c of CLASSES) {
    const v = num(o[c.arg]);
    if (v !== null && (v < 0 || v > DAYS_IN_MONTH)) {
      return { valid: false, message: `Days per month for ${c.name} must be between 0 and ${DAYS_IN_MONTH}.` };
    }
    counts[c.arg] = v === null ? 0 : v;
  }

  const a = headacheDays !== null && headacheDays >= HEADACHE_DAYS_THRESHOLD;
  const durationMet = months !== null && months > OVERUSE_MONTHS_THRESHOLD;
  const c = truthy(o.noBetterExplanation);

  const overused = CLASSES.filter((cl) => counts[cl.arg] >= cl.threshold);
  const anySingleOverused = overused.length > 0;

  // 8.2.6: total DAYS across the named classes, with nothing individually overused.
  const summedDays = CLASSES.filter((cl) => cl.countsToTotal).reduce((s, cl) => s + counts[cl.arg], 0);
  const effectiveTotal = totalDays === null ? summedDays : totalDays;
  const multiClassMet = !anySingleOverused && effectiveTotal >= MULTI_CLASS_THRESHOLD
    && CLASSES.filter((cl) => cl.countsToTotal && counts[cl.arg] > 0).length >= 2;

  const overuseMet = (anySingleOverused || multiClassMet) && durationMet;
  const met = a && overuseMet && c;

  const subtypes = [];
  if (met) {
    for (const cl of overused) subtypes.push(`${cl.code} ${cl.name} on ${counts[cl.arg]} days/month (threshold ${cl.threshold})`);
    if (multiClassMet) subtypes.push(`8.2.6 multiple drug classes not individually overused, ${effectiveTotal} days/month in total (threshold ${MULTI_CLASS_THRESHOLD})`);
  }

  // Where a class sits below ITS threshold but above the other one, say so - that is the
  // 10-versus-15 confusion, and it looks like an error to anyone carrying one number.
  const nearMiss = CLASSES
    .filter((cl) => cl.threshold === 15 && counts[cl.arg] >= 10 && counts[cl.arg] < 15)
    .map((cl) => `${cl.name} on ${counts[cl.arg]} days/month is NOT overuse: simple analgesics need ${cl.threshold} or more, not the 10 that applies to triptans, ergotamine, opioids and combination analgesics.`);
  const thresholdNote = nearMiss.length ? nearMiss.join(' ') : null;

  // The days-vs-doses point, only when it actually bites.
  const totalNote = totalDays !== null && totalDays < summedDays
    ? `The separate drug counts add up to ${summedDays} days but the total entered is ${totalDays}, which is the right basis: 8.2.6 counts DAYS, so days when two drugs were taken must not be counted twice.`
    : null;

  const missing = [];
  if (!a) missing.push(`headache on at least ${HEADACHE_DAYS_THRESHOLD} days per month`);
  if (!anySingleOverused && !multiClassMet) missing.push('regular overuse of an acute headache drug at its own threshold, or 10 or more total days across classes');
  if (!durationMet) missing.push(`more than ${OVERUSE_MONTHS_THRESHOLD} months of that overuse`);
  if (!c) missing.push('no better ICHD-3 explanation');

  return {
    valid: true,
    criteriaMet: met,
    criteria: { a, b: overuseMet, c },
    subtypes,
    overusedClasses: overused.map((cl) => cl.name),
    multiClassMet,
    totalMedicationDays: effectiveTotal,
    thresholdNote,
    totalNote,
    missing,
    abnormal: met,
    bandLabel: met ? 'Medication-overuse headache criteria met' : 'Criteria not met',
    band: met
      ? `ICHD-3 criteria for medication-overuse headache met — ${subtypes.join('; ')}.`
      : `ICHD-3 criteria for medication-overuse headache not met — still needed: ${missing.join('; ')}.`,
    detail: `The overuse threshold depends on the class: ${MULTI_CLASS_THRESHOLD} or more days a month for ergotamine, triptans, opioids and combination analgesics, but 15 or more for simple analgesics. A patient who overuses no single class but reaches ${MULTI_CLASS_THRESHOLD} total days across classes is 8.2.6.`,
    note: MOH_NOTE,
  };
}
