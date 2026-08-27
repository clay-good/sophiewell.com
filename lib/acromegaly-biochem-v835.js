// spec-v835: biochemical diagnosis of acromegaly.
//
// Sources:
//   Katznelson L, Laws ER Jr, Melmed S, et al. Acromegaly: an Endocrine Society clinical
//     practice guideline. J Clin Endocrinol Metab. 2014;99(11):3933-3951.
//   Giustina A, Barkan A, Beckers A, et al. Consensus on criteria for acromegaly diagnosis
//     and remission. Pituitary. 2024;27(1):7-22. (The ultrasensitive-assay nadir.)
//
// THE TESTS:
//   IGF-1, interpreted against an AGE- AND SEX-MATCHED reference. A concentration above 1.3
//   times the upper limit of normal for age, with typical clinical features, is confirmatory.
//
//   The 75 g oral glucose tolerance test, reading the GH NADIR within 2 hours. A nadir below
//   the assay threshold with a normal IGF-1 excludes the diagnosis.
//
// THREE THINGS THAT DECIDE THE ANSWER AND ARE ROUTINELY GOT WRONG:
//
//   1. A RANDOM GH IS NOT A DIAGNOSTIC TEST. Growth hormone is secreted episodically by
//      normal and adenomatous pituitaries alike, and the guideline recommends against single
//      random measurements. A raised random GH is suggestive of nothing on its own; the only
//      thing a random GH can do is contribute to EXCLUSION, and only below 0.4 micrograms
//      per litre alongside a normal IGF-1.
//
//   2. THE NADIR THRESHOLD DEPENDS ON THE ASSAY. It is below 1 microgram per litre with a
//      conventional assay and below 0.4 with an ultrasensitive one. A tool using one figure
//      for both assays gets one of them wrong, and in opposite directions.
//
//   3. EXCLUSION NEEDS BOTH HALVES. A suppressed GH with a raised IGF-1 does not exclude the
//      diagnosis, and neither does a normal IGF-1 with an unsuppressed GH. Discordance is a
//      result in its own right and calls for further evaluation, not a verdict.
//
// AND IGF-1 MUST BE AGE- AND SEX-MATCHED. IGF-1 falls with age, so a laboratory range that is
// not age-specific cannot answer this question at all.
//
// Pure: no DOM, no clock, no network.

export const ACROMEGALY_NOTE = 'The biochemical diagnosis of acromegaly (Katznelson L, Laws ER Jr, Melmed S, et al, J Clin Endocrinol Metab 2014;99(11):3933-3951, with the ultrasensitive-assay threshold from Giustina A, Barkan A, Beckers A, et al, Pituitary 2024;27(1):7-22) rests on insulin-like growth factor one interpreted against an age- and sex-matched reference, and on the growth hormone nadir during a 75 gram oral glucose tolerance test. A concentration above 1.3 times the upper limit of normal for age, with typical clinical features, is confirmatory. A nadir below the assay threshold together with a normal growth factor excludes the diagnosis. Three things decide the answer and are routinely got wrong. A random growth hormone is not a diagnostic test, because the hormone is secreted episodically by normal and adenomatous pituitaries alike and the guideline recommends against single random measurements; the only thing a random level can do is contribute to exclusion, and only below 0.4 micrograms per litre alongside a normal growth factor. The nadir threshold depends on the assay, being below 1 microgram per litre conventionally and below 0.4 with an ultrasensitive assay, so one figure used for both gets one of them wrong. And exclusion needs both halves, since a suppressed hormone with a raised growth factor does not exclude anything and neither does the reverse; discordance is a result in its own right and calls for further evaluation rather than a verdict. The growth factor must also be age- and sex-matched, because it falls with age and a range that is not age-specific cannot answer the question. It interprets results already obtained and it does not arrange imaging or treatment.';

export const IGF1_CONFIRMATORY = 1.3;      // times the age- and sex-matched upper limit
export const NADIR_CONVENTIONAL = 1.0;     // micrograms/L, below
export const NADIR_ULTRASENSITIVE = 0.4;   // micrograms/L, below
export const RANDOM_GH_EXCLUSION = 0.4;    // micrograms/L, below

const ASSAYS = {
  conventional: { threshold: NADIR_CONVENTIONAL, text: 'a conventional assay' },
  ultrasensitive: { threshold: NADIR_ULTRASENSITIVE, text: 'an ultrasensitive assay' },
};

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function acromegalyBiochem(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const igf1 = num(o.igf1TimesUln);
  const nadir = num(o.ogttGhNadir);
  const randomGh = num(o.randomGh);
  for (const [label, v, hi] of [
    ['IGF-1 as a multiple of the upper limit', igf1, 100],
    ['OGTT growth hormone nadir', nadir, 1000],
    ['Random growth hormone', randomGh, 1000],
  ]) {
    if (v !== null && (v < 0 || v > hi)) return { valid: false, message: `${label} is out of range.` };
  }

  const assayKey = String(o.assay == null ? '' : o.assay).trim().toLowerCase() || 'conventional';
  const assay = ASSAYS[assayKey];
  if (!assay) return { valid: false, message: 'Assay must be conventional or ultrasensitive.' };

  const ageMatched = truthy(o.ageAndSexMatched);
  const typicalFeatures = truthy(o.typicalFeatures);

  const igf1Raised = igf1 !== null && igf1 > 1;
  const igf1Confirmatory = igf1 !== null && igf1 > IGF1_CONFIRMATORY;
  const igf1Normal = igf1 !== null && igf1 <= 1;

  const suppressed = nadir !== null && nadir < assay.threshold;
  const unsuppressed = nadir !== null && nadir >= assay.threshold;
  const randomLow = randomGh !== null && randomGh < RANDOM_GH_EXCLUSION;

  let verdict = null;
  let basis = null;
  if (igf1Confirmatory && typicalFeatures) {
    verdict = 'Confirmatory of acromegaly';
    basis = `an IGF-1 of ${igf1} times the age- and sex-matched upper limit, above ${IGF1_CONFIRMATORY}, with typical clinical features`;
  } else if (igf1Raised && unsuppressed) {
    verdict = 'Consistent with acromegaly';
    basis = `a raised IGF-1 with a growth hormone nadir of ${nadir} micrograms per litre, not below the ${assay.threshold} threshold for ${assay.text}`;
  } else if (igf1Normal && suppressed) {
    verdict = 'Acromegaly excluded';
    basis = `a normal IGF-1 with a nadir of ${nadir} micrograms per litre, below the ${assay.threshold} threshold for ${assay.text}`;
  } else if (igf1Normal && randomLow) {
    verdict = 'Acromegaly excluded';
    basis = `a normal IGF-1 with a random growth hormone of ${randomGh} micrograms per litre, below ${RANDOM_GH_EXCLUSION}`;
  } else if ((igf1Raised && suppressed) || (igf1Normal && unsuppressed)) {
    verdict = 'Discordant, further evaluation needed';
    basis = igf1Raised
      ? 'a raised IGF-1 with a suppressed growth hormone nadir'
      : 'a normal IGF-1 with an unsuppressed growth hormone nadir';
  }

  // The test that is not a test.
  const randomNote = randomGh !== null && randomGh >= RANDOM_GH_EXCLUSION
    ? `A random growth hormone of ${randomGh} micrograms per litre does not support the diagnosis. Growth hormone is secreted episodically by normal and adenomatous pituitaries alike, and the guideline recommends against single random measurements. A random level can contribute only to EXCLUSION, and only below ${RANDOM_GH_EXCLUSION} alongside a normal IGF-1.`
    : null;

  // The assay-dependent threshold.
  const assayNote = nadir !== null && nadir >= NADIR_ULTRASENSITIVE && nadir < NADIR_CONVENTIONAL
    ? `A nadir of ${nadir} micrograms per litre falls between the two assay thresholds: it is suppressed by the conventional cutoff of ${NADIR_CONVENTIONAL} and NOT suppressed by the ultrasensitive cutoff of ${NADIR_ULTRASENSITIVE}. ${assayKey === 'conventional' ? 'A conventional assay is recorded, so it counts as suppressed here.' : 'An ultrasensitive assay is recorded, so it does not count as suppressed here.'} The assay decides this, not the number alone.`
    : null;

  // The reference range that cannot answer the question.
  const referenceNote = igf1 !== null && !ageMatched
    ? 'The IGF-1 has not been confirmed as interpreted against an age- and sex-matched reference. IGF-1 falls with age, so a laboratory range that is not age-specific cannot answer this question.'
    : null;

  const discordanceNote = verdict === 'Discordant, further evaluation needed'
    ? 'Exclusion needs both halves. A suppressed growth hormone with a raised IGF-1 does not exclude acromegaly, and a normal IGF-1 with an unsuppressed nadir does not establish it. Discordance is a result in its own right.'
    : null;

  return {
    valid: true,
    verdict,
    basis,
    igf1Raised,
    igf1Confirmatory,
    nadirThreshold: assay.threshold,
    suppressed: nadir === null ? null : suppressed,
    randomNote,
    assayNote,
    referenceNote,
    discordanceNote,
    abnormal: verdict === 'Confirmatory of acromegaly' || verdict === 'Consistent with acromegaly',
    bandLabel: verdict || 'Not enough to interpret',
    band: verdict
      ? `${verdict} — ${basis}.`
      : 'Not enough entered to interpret. An age- and sex-matched IGF-1 is the starting test.',
    detail: `IGF-1 above ${IGF1_CONFIRMATORY} times the age- and sex-matched upper limit with typical features is confirmatory. The OGTT nadir threshold is ${NADIR_CONVENTIONAL} micrograms per litre for a conventional assay and ${NADIR_ULTRASENSITIVE} for an ultrasensitive one. A random growth hormone is not a diagnostic test.`,
    note: ACROMEGALY_NOTE,
  };
}
