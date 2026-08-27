// spec-v815: ICHD-3 diagnostic criteria for 1.1 Migraine without aura and 1.2 Migraine
// with aura.
//
// Source:
//   Headache Classification Committee of the International Headache Society (IHS). The
//   International Classification of Headache Disorders, 3rd edition. Cephalalgia.
//   2018;38(1):1-211. Sections 1.1 and 1.2, published free at ichd-3.org.
//
// 1.1 MIGRAINE WITHOUT AURA
//   A  at least 5 attacks fulfilling B-D
//   B  headache attacks lasting 4-72 hours untreated or unsuccessfully treated
//   C  at least TWO of four: unilateral location; pulsating quality; moderate or severe
//      intensity; aggravation by or avoidance of routine physical activity
//   D  during headache at least ONE of: nausea and/or vomiting; photophobia AND phonophobia
//   E  not better accounted for by another ICHD-3 diagnosis
//
// 1.2 MIGRAINE WITH AURA
//   A  at least 2 attacks fulfilling B and C
//   B  one or more fully reversible aura symptoms: visual, sensory, speech and/or language,
//      motor, brainstem, retinal
//   C  at least THREE of six characteristics
//   D  not better accounted for by another ICHD-3 diagnosis
//
// Both sets are computed together, and neither is a subset of the other: a patient can meet
// 1.2 without meeting 1.1. Answering only the one that was asked about would be a half
// answer.
//
// TWO TRAPS, and both are the kind a checklist reproduces:
//
//   1. In criterion D of 1.1, the second option is "photophobia AND phonophobia". BOTH are
//      required. Photophobia alone does not satisfy D, and a great many people carry it as
//      "photophobia or phonophobia". So the tile takes them as separate inputs rather than
//      one combined tick, which is the only way to get this right.
//
//   2. The attack threshold DIFFERS between the two: five for 1.1, but only two for 1.2.
//      Carrying 5 across to the aura criteria denies the diagnosis to patients who meet it.
//
// Pure: no DOM, no clock, no network.

export const MIGRAINE_NOTE = 'The ICHD-3 criteria for migraine (Headache Classification Committee of the International Headache Society, Cephalalgia 2018;38(1):1-211) come in two sets. Migraine without aura needs at least five attacks lasting 4 to 72 hours untreated, with at least two of one-sided location, pulsating quality, moderate or severe intensity and aggravation by routine physical activity, plus at least one of nausea or vomiting, or photophobia and phonophobia together, and no better explanation among the other ICHD-3 diagnoses. Migraine with aura needs only two attacks, one or more fully reversible aura symptoms among visual, sensory, speech or language, motor, brainstem and retinal, at least three of six aura characteristics, and again no better explanation. Two things are easy to get wrong. The second option in the associated-symptom criterion is photophobia AND phonophobia, both together; photophobia on its own does not satisfy it, though it is often carried as an either-or. And the attack threshold differs between the two sets, five without aura against two with, so applying five to the aura criteria denies the diagnosis to patients who meet it. The two sets are assessed together because neither contains the other. It applies published criteria to a history already taken and it does not prescribe an abortive or a preventive.';

const HEADACHE_FEATURES = [
  { arg: 'unilateral', text: 'unilateral location' },
  { arg: 'pulsating', text: 'pulsating quality' },
  { arg: 'moderateOrSevere', text: 'moderate or severe pain intensity' },
  { arg: 'worseWithActivity', text: 'aggravation by or avoidance of routine physical activity' },
];

const AURA_TYPES = [
  { arg: 'auraVisual', text: 'visual' },
  { arg: 'auraSensory', text: 'sensory' },
  { arg: 'auraSpeech', text: 'speech and/or language' },
  { arg: 'auraMotor', text: 'motor' },
  { arg: 'auraBrainstem', text: 'brainstem' },
  { arg: 'auraRetinal', text: 'retinal' },
];

const AURA_FEATURES = [
  { arg: 'auraSpreadsGradually', text: 'at least one aura symptom spreads gradually over 5 minutes or more' },
  { arg: 'auraInSuccession', text: 'two or more aura symptoms occur in succession' },
  { arg: 'auraLasts5to60', text: 'each individual aura symptom lasts 5 to 60 minutes' },
  { arg: 'auraUnilateral', text: 'at least one aura symptom is unilateral' },
  { arg: 'auraPositive', text: 'at least one aura symptom is positive' },
  { arg: 'auraWithHeadache', text: 'the aura is accompanied, or followed within 60 minutes, by headache' },
];

export const MIN_ATTACKS_NO_AURA = 5;
export const MIN_ATTACKS_WITH_AURA = 2;
export const DURATION_MIN_HOURS = 4;
export const DURATION_MAX_HOURS = 72;

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function migraineIchd3(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const attacks = num(o.attackCount);
  const hours = num(o.headacheHours);
  if (attacks !== null && attacks < 0) return { valid: false, message: 'Attack count cannot be negative.' };
  if (hours !== null && hours < 0) return { valid: false, message: 'Headache duration cannot be negative.' };

  // ---- 1.1 Migraine without aura
  const featuresMet = HEADACHE_FEATURES.filter((f) => truthy(o[f.arg])).map((f) => f.text);
  const nausea = truthy(o.nauseaVomiting);
  const photophobia = truthy(o.photophobia);
  const phonophobia = truthy(o.phonophobia);
  const bothPhobias = photophobia && phonophobia;

  const noAura = {
    a: attacks !== null && attacks >= MIN_ATTACKS_NO_AURA,
    b: hours !== null && hours >= DURATION_MIN_HOURS && hours <= DURATION_MAX_HOURS,
    c: featuresMet.length >= 2,
    d: nausea || bothPhobias,
    e: truthy(o.noBetterExplanation),
  };
  const noAuraMet = noAura.a && noAura.b && noAura.c && noAura.d && noAura.e;

  // The single most common misreading of criterion D.
  const phobiaNote = (photophobia !== phonophobia) && !nausea
    ? `Only ${photophobia ? 'photophobia' : 'phonophobia'} is recorded. Criterion D of 1.1 asks for nausea and/or vomiting, OR photophobia AND phonophobia together - one of the two phobias on its own does not satisfy it.`
    : null;

  // ---- 1.2 Migraine with aura
  const auraTypesMet = AURA_TYPES.filter((t) => truthy(o[t.arg])).map((t) => t.text);
  const auraFeaturesMet = AURA_FEATURES.filter((f) => truthy(o[f.arg])).map((f) => f.text);
  const withAura = {
    a: attacks !== null && attacks >= MIN_ATTACKS_WITH_AURA,
    b: auraTypesMet.length >= 1,
    c: auraFeaturesMet.length >= 3,
    d: truthy(o.noBetterExplanation),
  };
  const withAuraMet = withAura.a && withAura.b && withAura.c && withAura.d;

  // Worth saying out loud when the attack count sits between the two thresholds.
  const thresholdNote = attacks !== null && attacks >= MIN_ATTACKS_WITH_AURA && attacks < MIN_ATTACKS_NO_AURA
    ? `${attacks} attacks is enough for 1.2 Migraine with aura, which asks for ${MIN_ATTACKS_WITH_AURA}, but not for 1.1 Migraine without aura, which asks for ${MIN_ATTACKS_NO_AURA}. The thresholds differ between the two sets.`
    : null;

  const diagnoses = [];
  if (noAuraMet) diagnoses.push('1.1 Migraine without aura');
  if (withAuraMet) diagnoses.push('1.2 Migraine with aura');

  const missing = [];
  if (!noAuraMet) {
    const m = [];
    if (!noAura.a) m.push(`at least ${MIN_ATTACKS_NO_AURA} attacks`);
    if (!noAura.b) m.push(`attacks lasting ${DURATION_MIN_HOURS} to ${DURATION_MAX_HOURS} hours`);
    if (!noAura.c) m.push('at least 2 of the 4 headache characteristics');
    if (!noAura.d) m.push('nausea or vomiting, or photophobia AND phonophobia');
    if (!noAura.e) m.push('no better ICHD-3 explanation');
    missing.push(`for 1.1: ${m.join(', ')}`);
  }
  if (!withAuraMet) {
    const m = [];
    if (!withAura.a) m.push(`at least ${MIN_ATTACKS_WITH_AURA} attacks`);
    if (!withAura.b) m.push('at least one fully reversible aura symptom');
    if (!withAura.c) m.push('at least 3 of the 6 aura characteristics');
    if (!withAura.d) m.push('no better ICHD-3 explanation');
    missing.push(`for 1.2: ${m.join(', ')}`);
  }

  const met = diagnoses.length > 0;
  return {
    valid: true,
    criteriaMet: met,
    diagnoses,
    withoutAura: noAura,
    withAura,
    withoutAuraMet: noAuraMet,
    withAuraMet,
    headacheFeatureCount: featuresMet.length,
    auraFeatureCount: auraFeaturesMet.length,
    phobiaNote,
    thresholdNote,
    missing,
    abnormal: met,
    bandLabel: met ? diagnoses.join(' and ') : 'Neither migraine criteria set met',
    band: met
      ? `ICHD-3 criteria met for ${diagnoses.join(' and ')}.`
      : `Neither ICHD-3 migraine criteria set is met — ${missing.join('; ')}.`,
    detail: `Both sets are assessed together because neither contains the other. 1.1 needs ${MIN_ATTACKS_NO_AURA} attacks; 1.2 needs only ${MIN_ATTACKS_WITH_AURA}. In 1.1 criterion D, photophobia and phonophobia count only TOGETHER.`,
    note: MIGRAINE_NOTE,
  };
}
