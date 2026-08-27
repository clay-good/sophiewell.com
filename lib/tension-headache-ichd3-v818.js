// spec-v818: ICHD-3 criteria for 2. Tension-type headache — 2.1 infrequent episodic,
// 2.2 frequent episodic, 2.3 chronic.
//
// Source:
//   Headache Classification Committee of the International Headache Society (IHS). The
//   International Classification of Headache Disorders, 3rd edition. Cephalalgia.
//   2018;38(1):1-211. Sections 2.1, 2.2 and 2.3, read from ichd-3.org.
//
// The three subtypes share criterion C (at least two of four: bilateral; pressing or
// tightening, non-pulsating; mild or moderate; not aggravated by routine physical activity)
// and differ on frequency, duration and — the part that catches people — on which
// associated symptoms are tolerated.
//
//   2.1 infrequent episodic  >=10 episodes on <1 day/month (<12 days/year)
//   2.2 frequent episodic    >=10 episodes on 1-14 days/month for >3 months
//   2.3 chronic              >=15 days/month for >3 months. NO episode-count requirement.
//
//   duration  2.1 and 2.2: 30 minutes to 7 days
//             2.3:         hours to days, or unremitting
//
// THE ASSOCIATED-SYMPTOM RULE LOOSENS IN THE CHRONIC FORM, which is the opposite of what
// almost everyone expects a "chronic" criteria set to do:
//
//   episodic (2.1, 2.2)  BOTH of: no nausea or vomiting at all;
//                                 no more than one of photophobia or phonophobia
//   chronic  (2.3)       BOTH of: no more than one of photophobia, phonophobia OR MILD
//                                 NAUSEA;
//                                 neither moderate or severe nausea nor vomiting
//
// So mild nausea is disqualifying for episodic tension-type headache and permitted for the
// chronic form, where it counts as one of the at-most-one allowance. Carrying the episodic
// rule across denies 2.3 to patients who have it.
//
// Pure: no DOM, no clock, no network.

export const TTH_NOTE = 'The ICHD-3 criteria for tension-type headache (Headache Classification Committee of the International Headache Society, Cephalalgia 2018;38(1):1-211, sections 2.1 to 2.3) share a common core and differ on frequency, duration and tolerated symptoms. All three need at least two of four characteristics: both-sided location, a pressing or tightening non-pulsating quality, mild or moderate intensity, and no aggravation by routine physical activity such as walking or climbing stairs. Infrequent episodic needs at least ten episodes on fewer than one day a month; frequent episodic at least ten episodes on one to fourteen days a month for more than three months; and chronic at least fifteen days a month for more than three months, with no episode-count requirement at all. Episodes last 30 minutes to 7 days in the episodic forms, and hours to days or are unremitting in the chronic form. The part most often got wrong is that the symptom rule LOOSENS in the chronic form. The episodic forms permit no nausea or vomiting whatever and no more than one of photophobia or phonophobia. The chronic form permits no more than one of photophobia, phonophobia or mild nausea, excluding only moderate or severe nausea and vomiting, so mild nausea disqualifies the episodic forms and is allowed in the chronic one. It applies published criteria to a history already taken and it does not prescribe an abortive or a preventive.';

const FEATURES = [
  { arg: 'bilateral', text: 'bilateral location' },
  { arg: 'pressing', text: 'pressing or tightening, non-pulsating quality' },
  { arg: 'mildOrModerate', text: 'mild or moderate intensity' },
  { arg: 'notAggravated', text: 'not aggravated by routine physical activity' },
];

// Duration options map onto the published phrases rather than a single numeric range,
// because the episodic and chronic wordings are not the same interval.
const DURATIONS = {
  'under-30-min': { text: 'under 30 minutes', episodic: false, chronic: false },
  '30-min-to-2-hours': { text: '30 minutes to 2 hours', episodic: true, chronic: false },
  'hours-to-7-days': { text: 'hours to 7 days', episodic: true, chronic: true },
  'over-7-days-or-unremitting': { text: 'longer than 7 days, or unremitting', episodic: false, chronic: true },
};

const NAUSEA = { none: 0, mild: 1, moderate: 2, severe: 2 };

export const MONTHS_THRESHOLD = 3;   // strictly greater than
export const MIN_EPISODES = 10;
export const DAYS_IN_MONTH = 31;

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function tensionHeadacheIchd3(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const daysPerMonth = num(o.headacheDaysPerMonth);
  const episodes = num(o.episodeCount);
  const months = num(o.monthsOfPattern);
  if (daysPerMonth !== null && (daysPerMonth < 0 || daysPerMonth > DAYS_IN_MONTH)) {
    return { valid: false, message: `Headache days per month must be between 0 and ${DAYS_IN_MONTH}.` };
  }
  if (episodes !== null && (episodes < 0 || episodes > 100000)) return { valid: false, message: 'Episode count is out of range.' };
  if (months !== null && (months < 0 || months > 1200)) return { valid: false, message: 'Months of pattern is out of range.' };

  const durKey = String(o.duration == null ? '' : o.duration).trim().toLowerCase();
  const duration = durKey ? DURATIONS[durKey] : null;
  if (durKey && !duration) return { valid: false, message: 'Unrecognized episode duration.' };

  const featuresMet = FEATURES.filter((f) => truthy(o[f.arg]));
  const c = featuresMet.length >= 2;

  const nauseaKey = String(o.nausea == null ? '' : o.nausea).trim().toLowerCase() || 'none';
  if (!Object.prototype.hasOwnProperty.call(NAUSEA, nauseaKey)) {
    return { valid: false, message: 'Nausea must be none, mild, moderate or severe.' };
  }
  const nauseaLevel = NAUSEA[nauseaKey];
  const vomiting = truthy(o.vomiting);
  const photophobia = truthy(o.photophobia);
  const phonophobia = truthy(o.phonophobia);

  // Episodic: no nausea AT ALL, no vomiting, and not both phobias.
  const dEpisodic = nauseaLevel === 0 && !vomiting && !(photophobia && phonophobia);
  // Chronic: at most ONE of photophobia / phonophobia / mild nausea, and no
  // moderate-or-severe nausea and no vomiting.
  const chronicAllowanceCount = (photophobia ? 1 : 0) + (phonophobia ? 1 : 0) + (nauseaLevel === 1 ? 1 : 0);
  const dChronic = chronicAllowanceCount <= 1 && nauseaLevel < 2 && !vomiting;

  const e = truthy(o.noBetterExplanation);
  const enoughEpisodes = episodes !== null && episodes >= MIN_EPISODES;
  const longEnough = months !== null && months > MONTHS_THRESHOLD;

  const infrequentFreq = daysPerMonth !== null && daysPerMonth < 1 && enoughEpisodes;
  const frequentFreq = daysPerMonth !== null && daysPerMonth >= 1 && daysPerMonth <= 14 && enoughEpisodes && longEnough;
  const chronicFreq = daysPerMonth !== null && daysPerMonth >= 15 && longEnough;

  const episodicDuration = !!(duration && duration.episodic);
  const chronicDuration = !!(duration && duration.chronic);

  const met = [];
  if (infrequentFreq && episodicDuration && c && dEpisodic && e) met.push('2.1 Infrequent episodic tension-type headache');
  if (frequentFreq && episodicDuration && c && dEpisodic && e) met.push('2.2 Frequent episodic tension-type headache');
  if (chronicFreq && chronicDuration && c && dChronic && e) met.push('2.3 Chronic tension-type headache');

  // The loosening. Raise it whenever mild nausea is the thing separating the two rules.
  const nauseaNote = nauseaLevel === 1
    ? `Mild nausea disqualifies the EPISODIC forms, which permit no nausea at all, but is allowed in 2.3 Chronic tension-type headache, where it counts as one of the at-most-one allowance alongside photophobia and phonophobia. The symptom rule loosens in the chronic form.`
    : null;

  // No episode count is needed for the chronic form.
  const episodeNote = chronicFreq && !enoughEpisodes
    ? 'The chronic form has no episode-count requirement. Only 2.1 and 2.2 ask for at least 10 episodes.'
    : null;

  const anyMet = met.length > 0;
  return {
    valid: true,
    criteriaMet: anyMet,
    diagnoses: met,
    featureCount: featuresMet.length,
    associatedSymptomRule: { episodicMet: dEpisodic, chronicMet: dChronic },
    frequency: { infrequent: infrequentFreq, frequent: frequentFreq, chronic: chronicFreq },
    nauseaNote,
    episodeNote,
    abnormal: anyMet,
    bandLabel: anyMet ? met.join(' and ') : 'No tension-type headache subtype met',
    band: anyMet
      ? `ICHD-3 criteria met for ${met.join(' and ')}.`
      : 'No ICHD-3 tension-type headache subtype is met on these entries.',
    detail: `All three subtypes need at least two of four characteristics. 2.1 needs at least ${MIN_EPISODES} episodes on under 1 day a month; 2.2 at least ${MIN_EPISODES} on 1 to 14 days a month for more than ${MONTHS_THRESHOLD} months; 2.3 at least 15 days a month for more than ${MONTHS_THRESHOLD} months, with NO episode-count requirement.`,
    note: TTH_NOTE,
  };
}
