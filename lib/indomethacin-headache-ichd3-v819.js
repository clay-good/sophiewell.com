// spec-v819: ICHD-3 criteria for the two indomethacin-responsive trigeminal autonomic
// cephalalgias — 3.2 Paroxysmal hemicrania and 3.4 Hemicrania continua.
//
// Source:
//   Headache Classification Committee of the International Headache Society (IHS). The
//   International Classification of Headache Disorders, 3rd edition. Cephalalgia.
//   2018;38(1):1-211. Sections 3.2 and 3.4, read from ichd-3.org.
//
// 3.2 PAROXYSMAL HEMICRANIA
//   A  at least 20 attacks fulfilling B-E
//   B  severe unilateral orbital, supraorbital and/or temporal pain lasting 2-30 minutes
//   C  either or both of: at least one ipsilateral cranial autonomic sign; restlessness or
//      agitation
//   D  frequency of MORE THAN 5 per day
//   E  prevented absolutely by therapeutic doses of indomethacin
//   F  not better accounted for by another ICHD-3 diagnosis
//
// 3.4 HEMICRANIA CONTINUA
//   A  unilateral headache fulfilling B-D
//   B  present for >3 months, with exacerbations of moderate or greater intensity
//   C  either or both of: at least one ipsilateral cranial autonomic sign; restlessness or
//      agitation, OR AGGRAVATION OF THE PAIN BY MOVEMENT
//   D  responds absolutely to therapeutic doses of indomethacin
//   E  not better accounted for by another ICHD-3 diagnosis
//
// THE INDOMETHACIN RESPONSE IS A DIAGNOSTIC CRITERION, NOT A CONSEQUENCE OF THE DIAGNOSIS.
// This is what makes these two unlike every other headache in the classification and why
// they are worth one tile between them: neither can be diagnosed at all until an adequate
// indomethacin trial has been done and has worked absolutely. A tool that treated the drug
// response as optional, or as something to check after diagnosing, would report a diagnosis
// the classification does not permit.
//
// The other thing this tile is for is the boundary with cluster headache, which shares
// criterion C almost word for word and differs on the numbers: cluster attacks last 15-180
// minutes at up to 8 a day, paroxysmal hemicrania attacks last 2-30 minutes at more than 5
// a day. Shorter and more frequent, and indomethacin-responsive.
//
// One small asymmetry that is easy to miss: hemicrania continua accepts AGGRAVATION OF THE
// PAIN BY MOVEMENT as an alternative to restlessness in criterion C. Paroxysmal hemicrania
// does not.
//
// Pure: no DOM, no clock, no network.

export const INDOMETHACIN_NOTE = 'Two of the trigeminal autonomic cephalalgias in ICHD-3 (Headache Classification Committee of the International Headache Society, Cephalalgia 2018;38(1):1-211, sections 3.2 and 3.4) are defined partly by their response to indomethacin. Paroxysmal hemicrania needs at least twenty attacks of severe one-sided orbital, supraorbital or temporal pain lasting 2 to 30 minutes, more than five a day, with either a cranial autonomic sign on the same side or restlessness, and absolute prevention by therapeutic doses of indomethacin. Hemicrania continua needs one-sided headache present for more than three months with exacerbations of moderate or greater intensity, the same autonomic-or-restlessness criterion but also allowing aggravation of the pain by movement, and an absolute response to indomethacin. The drug response is a diagnostic criterion and not a consequence of the diagnosis, which is what sets these two apart from every other headache in the classification: neither can be diagnosed until an adequate trial has been done and has worked absolutely. The classification notes that in an adult, oral indomethacin should start at at least 150 milligrams daily and be increased if necessary to 225 milligrams daily. Paroxysmal hemicrania is also the diagnosis most often confused with cluster headache; it shares the autonomic criterion almost word for word and differs on the numbers, with attacks of 2 to 30 minutes more than five times a day against cluster headache 15 to 180 minutes up to eight times a day. It applies published criteria to a history already taken and it does not start indomethacin or manage its gastrointestinal risk.';

const AUTONOMIC = [
  { arg: 'conjunctivalInjection', text: 'conjunctival injection and/or lacrimation' },
  { arg: 'nasalCongestion', text: 'nasal congestion and/or rhinorrhea' },
  { arg: 'eyelidEdema', text: 'eyelid edema' },
  { arg: 'sweating', text: 'forehead and facial sweating' },
  { arg: 'miosisPtosis', text: 'miosis and/or ptosis' },
];

export const PH_MIN_ATTACKS = 20;
export const PH_DURATION_MIN = 2;    // minutes
export const PH_DURATION_MAX = 30;
export const PH_FREQ_MIN = 5;        // STRICTLY more than 5 per day
export const HC_MIN_MONTHS = 3;      // strictly more than 3 months
export const MAX_MINUTES = 1440;
export const MAX_PER_DAY = 200;
export const MAX_MONTHS = 1200;

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function indomethacinHeadacheIchd3(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const attacks = num(o.attackCount);
  const duration = num(o.attackMinutes);
  const perDay = num(o.attacksPerDay);
  const months = num(o.monthsContinuous);
  for (const [label, v, max] of [
    ['Attack count', attacks, 100000],
    ['Attack duration in minutes', duration, MAX_MINUTES],
    ['Attacks per day', perDay, MAX_PER_DAY],
    ['Months of continuous headache', months, MAX_MONTHS],
  ]) {
    if (v !== null && (v < 0 || v > max)) return { valid: false, message: `${label} must be between 0 and ${max}.` };
  }

  const autonomic = AUTONOMIC.filter((s) => truthy(o[s.arg])).map((s) => s.text);
  const restless = truthy(o.restlessness);
  const worseWithMovement = truthy(o.aggravatedByMovement);
  const indomethacin = truthy(o.indomethacinResponse);
  const noOther = truthy(o.noBetterExplanation);

  // Criterion C. Hemicrania continua accepts aggravation by movement; paroxysmal
  // hemicrania does not.
  const cParoxysmal = autonomic.length >= 1 || restless;
  const cContinua = autonomic.length >= 1 || restless || worseWithMovement;

  const ph = {
    a: attacks !== null && attacks >= PH_MIN_ATTACKS,
    b: duration !== null && duration >= PH_DURATION_MIN && duration <= PH_DURATION_MAX,
    c: cParoxysmal,
    d: perDay !== null && perDay > PH_FREQ_MIN,
    e: indomethacin,
    f: noOther,
  };
  const phMet = ph.a && ph.b && ph.c && ph.d && ph.e && ph.f;

  const hc = {
    a: truthy(o.unilateralContinuous),
    b: months !== null && months > HC_MIN_MONTHS && truthy(o.moderateExacerbations),
    c: cContinua,
    d: indomethacin,
    e: noOther,
  };
  const hcMet = hc.a && hc.b && hc.c && hc.d && hc.e;

  const diagnoses = [];
  if (phMet) diagnoses.push('3.2 Paroxysmal hemicrania');
  if (hcMet) diagnoses.push('3.4 Hemicrania continua');

  // The point of the tile: without the drug trial there is no diagnosis to be had.
  const otherwisePh = ph.a && ph.b && ph.c && ph.d && ph.f;
  const otherwiseHc = hc.a && hc.b && hc.c && hc.e;
  const indomethacinNote = !indomethacin && (otherwisePh || otherwiseHc)
    ? `Every other criterion for ${otherwisePh && otherwiseHc ? 'both diagnoses is' : (otherwisePh ? '3.2 Paroxysmal hemicrania is' : '3.4 Hemicrania continua is')} met, but an absolute response to therapeutic doses of indomethacin is itself a diagnostic criterion here, not a consequence of the diagnosis. Until an adequate trial has been done and has worked, the classification does not permit the diagnosis.`
    : null;

  // The cluster-headache boundary, raised when the numbers point that way.
  const clusterNote = duration !== null && duration > PH_DURATION_MAX && perDay !== null && perDay <= 8
    ? `Attacks of ${duration} minutes are too long for paroxysmal hemicrania, which requires ${PH_DURATION_MIN} to ${PH_DURATION_MAX} minutes. Cluster headache covers 15 to 180 minutes at up to 8 a day and shares almost the same autonomic criterion.`
    : null;

  // The movement alternative, when it is what carries criterion C.
  const movementNote = worseWithMovement && autonomic.length === 0 && !restless
    ? 'Criterion C is carried by aggravation of the pain by movement, which hemicrania continua accepts and paroxysmal hemicrania does not. That alternative appears only in 3.4.'
    : null;

  const met = diagnoses.length > 0;
  return {
    valid: true,
    criteriaMet: met,
    diagnoses,
    paroxysmalHemicrania: ph,
    hemicraniaContinua: hc,
    autonomicSigns: autonomic,
    indomethacinNote,
    clusterNote,
    movementNote,
    abnormal: met,
    bandLabel: met ? diagnoses.join(' and ') : 'Neither criteria set met',
    band: met
      ? `ICHD-3 criteria met for ${diagnoses.join(' and ')}.`
      : 'Neither indomethacin-responsive criteria set is met on these entries.',
    detail: `Both require an ABSOLUTE response to therapeutic doses of indomethacin as a criterion. Paroxysmal hemicrania needs at least ${PH_MIN_ATTACKS} attacks of ${PH_DURATION_MIN} to ${PH_DURATION_MAX} minutes, more than ${PH_FREQ_MIN} a day. Hemicrania continua needs one-sided headache for more than ${HC_MIN_MONTHS} months with exacerbations of moderate or greater intensity.`,
    note: INDOMETHACIN_NOTE,
  };
}
