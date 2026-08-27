// spec-v817: ICHD-3 diagnostic criteria for 13.1 Trigeminal neuralgia.
//
// Source:
//   Headache Classification Committee of the International Headache Society (IHS). The
//   International Classification of Headache Disorders, 3rd edition. Cephalalgia.
//   2018;38(1):1-211. Section 13.1, read from ichd-3.org.
//
//   A  recurrent paroxysms of UNILATERAL facial pain in the distribution(s) of one or more
//      divisions of the trigeminal nerve, with no radiation beyond, fulfilling B and C
//   B  pain has ALL THREE of the following: lasting from a fraction of a second to 2
//      minutes; severe intensity; electric shock-like, shooting, stabbing or sharp in quality
//   C  precipitated by innocuous stimuli within the affected trigeminal distribution
//   D  not better accounted for by another ICHD-3 diagnosis
//
// TWO THINGS THAT GO WRONG, and both come from reading this like the migraine criteria:
//
//   1. Criterion B is ALL THREE, not "at least two of three". ICHD-3 uses "at least two of
//      four" in 1.1 Migraine without aura and "all of the following" here, on the same page
//      of the same book. Two of three is not trigeminal neuralgia.
//
//   2. Criterion C is MANDATORY. A trigger by innocuous stimuli is required, and the
//      classification says so explicitly: some attacks may be or appear spontaneous, "but
//      there must be a history or finding of pain provoked by innocuous stimuli to meet this
//      criterion". Purely spontaneous paroxysmal facial pain does not meet 13.1, however
//      characteristic everything else looks.
//
// SCOPE: this applies the 13.1 criteria. ICHD-3 further subclassifies trigeminal neuralgia
// by cause (classical, secondary, idiopathic) and by whether there is concomitant continuous
// pain. Those subtypes are NOT computed here: the published subsection hierarchy is
// presented inconsistently and the distinctions turn on imaging and on an underlying
// disease, neither of which is a history item this tile takes.
//
// Pure: no DOM, no clock, no network.

export const TN_NOTE = 'The ICHD-3 criteria for trigeminal neuralgia (Headache Classification Committee of the International Headache Society, Cephalalgia 2018;38(1):1-211, section 13.1) need recurrent bouts of one-sided facial pain confined to one or more divisions of the trigeminal nerve without spreading beyond them; pain with all three of a duration from a fraction of a second to two minutes, severe intensity, and an electric shock-like, shooting, stabbing or sharp quality; precipitation by innocuous stimuli within the affected area; and no better explanation among the other ICHD-3 diagnoses. Two points are easy to get wrong, and both come from reading this like the migraine criteria. The pain-character criterion asks for all three features, not at least two of three, though the migraine criteria in the same book do use an at-least-two rule. And the trigger criterion is mandatory: some attacks may be or appear spontaneous, but the classification requires a history or finding of pain provoked by innocuous stimuli, so purely spontaneous paroxysmal facial pain does not meet these criteria however characteristic the rest looks. This applies the 13.1 criteria only; it does not sort classical from secondary or idiopathic trigeminal neuralgia, which turns on imaging and on an underlying disease. It applies criteria to a history already taken and it does not start carbamazepine or refer for a procedure.';

const PAIN_FEATURES = [
  { arg: 'briefDuration', text: 'lasting from a fraction of a second to 2 minutes' },
  { arg: 'severeIntensity', text: 'severe intensity' },
  { arg: 'shockLikeQuality', text: 'electric shock-like, shooting, stabbing or sharp in quality' },
];

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function trigeminalNeuralgiaIchd3(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const a = truthy(o.unilateralParoxysms) && truthy(o.noRadiationBeyond);

  const featuresMet = PAIN_FEATURES.filter((f) => truthy(o[f.arg]));
  const featuresMissing = PAIN_FEATURES.filter((f) => !truthy(o[f.arg]));
  const b = featuresMissing.length === 0;

  const c = truthy(o.triggeredByInnocuousStimuli);
  const d = truthy(o.noBetterExplanation);

  const met = a && b && c && d;

  // The "two of three looks close enough" error.
  const allThreeNote = !b && featuresMet.length > 0
    ? `${featuresMet.length} of the 3 pain characteristics are present. Criterion B asks for ALL THREE, not at least two - unlike the migraine criteria in the same classification. Still missing: ${featuresMissing.map((f) => f.text).join('; ')}.`
    : null;

  // The mandatory trigger. Worth naming loudly, because everything else can look textbook.
  const triggerNote = !c && a && b
    ? 'Every other criterion is met, but there is no trigger by innocuous stimuli, and criterion C requires one. ICHD-3 is explicit that although attacks may be or appear spontaneous, there must be a history or finding of provoked pain. Without it this is not 13.1.'
    : null;

  const missing = [];
  if (!a) missing.push('recurrent one-sided paroxysms confined to trigeminal divisions, with no radiation beyond them');
  if (!b) missing.push('all three pain characteristics');
  if (!c) missing.push('precipitation by innocuous stimuli in the affected distribution');
  if (!d) missing.push('no better ICHD-3 explanation');

  return {
    valid: true,
    criteriaMet: met,
    criteria: { a, b, c, d },
    painFeatureCount: featuresMet.length,
    allThreeNote,
    triggerNote,
    missing,
    abnormal: met,
    bandLabel: met ? 'ICHD-3 criteria met' : 'ICHD-3 criteria not met',
    band: met
      ? 'ICHD-3 criteria for trigeminal neuralgia met.'
      : `ICHD-3 criteria for trigeminal neuralgia not met — still needed: ${missing.join('; ')}.`,
    detail: 'Criterion B requires ALL THREE pain characteristics, and criterion C requires a trigger by innocuous stimuli. This applies the 13.1 criteria only; it does not sort classical from secondary or idiopathic trigeminal neuralgia, which turns on imaging and on an underlying disease.',
    note: TN_NOTE,
  };
}
