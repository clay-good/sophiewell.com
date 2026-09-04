// spec-v924: Bland-Altman limits of agreement between two measurement methods.
//
// Sources:
//   Bland JM, Altman DG. Statistical methods for assessing agreement between two methods of
//   clinical measurement. Lancet. 1986;1(8476):307-310.
//   Bland JM, Altman DG. Measuring agreement in method comparison studies. Stat Methods Med Res.
//   1999;8(2):135-160.
//
//   Bias is the mean of the differences. The limits of agreement are that bias plus and minus
//   1.96 standard deviations of the differences, and between them lie 95% of the differences
//   expected in future pairs.
//
//   Each limit is itself an estimate. Its standard error is approximately the standard deviation
//   of the differences times the square root of 3/n, and the bias has a standard error of the
//   standard deviation over the square root of n.
//
// A HIGH CORRELATION IS NOT AGREEMENT. That is the sentence the 1986 paper exists to make: two
// methods can correlate almost perfectly and disagree by a clinically enormous margin, because
// correlation measures whether they move together and says nothing about whether they land in the
// same place.
//
// THE LIMITS DESCRIBE; THEY DO NOT JUDGE. Whether the interval they span is acceptable is a
// clinical decision, and the papers are explicit that it has to be made BEFORE the study, not
// read off the result afterwards. Nothing here decides it.
//
// THE LIMITS ARE ESTIMATES WITH THEIR OWN UNCERTAINTY, which is why their confidence intervals
// are reported beside them and not tucked away. On a small sample they are wide.
//
// IF THE DIFFERENCE VARIES WITH THE SIZE OF THE MEASUREMENT, a single pair of limits is the wrong
// summary and no arithmetic here will show that -- only the plot will.
//
// Pure: no DOM, no clock, no network.

export const BLAND_ALTMAN_NOTE = 'Bland-Altman limits of agreement summarize how two methods of measuring the same thing differ. The bias is the mean of the differences; the limits are that bias plus and minus 1.96 standard deviations of the differences, and between them lie 95% of the differences expected in future pairs. Four things are worth stating plainly. A high correlation is not agreement, and that is the sentence the 1986 paper exists to make: two methods can correlate almost perfectly and disagree by a clinically enormous margin, because correlation measures whether they move together and says nothing about whether they land in the same place. The limits describe and do not judge -- whether the interval they span is acceptable is a clinical decision, and the papers are explicit that it should be made before the study rather than read off the result afterwards. The limits are themselves estimates with their own uncertainty, which is why their confidence intervals are reported beside them, and on a small sample they are wide. And if the difference varies with the size of the measurement, a single pair of limits is the wrong summary -- no arithmetic here will show that, only the plot will. This is arithmetic on a mean, a standard deviation and a count. It does not decide whether two methods can be used interchangeably.';

const SMALL_SAMPLE = 50;

function num(v) {
  // spec-v1040: `Number(null)` and `Number('')` are both 0, and 0 is finite, so
  // this returned a measurement of zero for a value nobody entered -- and every
  // guard written as `if (x === null)` downstream stopped firing.
  if (v === null || v === undefined || (typeof v !== 'number' && String(v).trim() === '')) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function safeRound(n, places = 3) {
  const f = 10 ** places;
  const r = Math.round(n * f) / f;
  return Number.isFinite(r) ? r : n;
}

export function blandAltman(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const bias = num(o.meanDifference);
  const sd = num(o.sdOfDifferences);
  const n = num(o.pairs);

  if (bias === null) {
    return { valid: false, message: 'Enter the mean of the differences between the two methods. That is the bias, and its sign says which method reads higher.' };
  }
  if (sd === null || sd < 0) {
    return { valid: false, message: 'Enter the standard deviation of the differences, which cannot be negative. It is what sets the width of the limits.' };
  }
  if (n === null || !Number.isInteger(n) || n < 2) {
    return { valid: false, message: 'Enter the number of paired measurements, a whole number of at least 2. The confidence intervals of the limits depend on it.' };
  }

  const lower = bias - 1.96 * sd;
  const upper = bias + 1.96 * sd;
  const span = upper - lower;

  const seBias = sd / Math.sqrt(n);
  const seLimit = sd * Math.sqrt(3 / n);

  const biasCi = [bias - 1.96 * seBias, bias + 1.96 * seBias];
  const lowerCi = [lower - 1.96 * seLimit, lower + 1.96 * seLimit];
  const upperCi = [upper - 1.96 * seLimit, upper + 1.96 * seLimit];

  const smallSample = n < SMALL_SAMPLE;

  const bandLabel = `Limits of agreement ${safeRound(lower, 2)} to ${safeRound(upper, 2)}`;

  const band = `Bias ${safeRound(bias, 2)}, with 95% of future differences expected between ${safeRound(lower, 2)} and ${safeRound(upper, 2)} -- a span of ${safeRound(span, 2)}. Whether that span is acceptable is a clinical decision this does not make.`;

  const correlationNote = 'A high correlation is not agreement. Two methods can correlate almost perfectly and still disagree by a clinically enormous margin, because correlation measures whether they move together and not whether they land in the same place.';

  const judgementNote = 'The limits describe; they do not judge. Whether the interval is acceptable is a clinical decision, and the papers are explicit that it should be set before the study rather than read off the result afterwards.';

  const uncertaintyNote = smallSample
    ? `With ${n} pairs the limits are themselves uncertain: each carries a 95% interval about ${safeRound(1.96 * seLimit, 2)} wide on either side. Below about ${SMALL_SAMPLE} pairs that uncertainty is large enough to matter to any decision taken on the limits.`
    : `The limits are estimates. Each carries a 95% interval about ${safeRound(1.96 * seLimit, 2)} wide on either side, and the bias about ${safeRound(1.96 * seBias, 2)}.`;

  const proportionalNote = 'If the difference varies with the size of the measurement, a single pair of limits is the wrong summary. Nothing in this arithmetic can show that; only the plot of difference against mean will.';

  const signNote = bias === 0
    ? 'The bias is zero, so on average the two methods agree. That says nothing about how far apart any single pair can be, which is what the limits are for.'
    : `The bias of ${safeRound(bias, 2)} means one method reads ${bias > 0 ? 'higher' : 'lower'} than the other on average. A bias can be corrected for; the spread around it cannot.`;

  const scopeNote = 'This is arithmetic on a mean, a standard deviation and a count. It does not decide whether two methods can be used interchangeably.';

  return {
    valid: true,
    bias: safeRound(bias, 3),
    sd: safeRound(sd, 3),
    pairs: n,
    lowerLimit: safeRound(lower, 3),
    upperLimit: safeRound(upper, 3),
    span: safeRound(span, 3),
    biasCi: biasCi.map((x) => safeRound(x, 3)),
    lowerLimitCi: lowerCi.map((x) => safeRound(x, 3)),
    upperLimitCi: upperCi.map((x) => safeRound(x, 3)),
    smallSample,
    correlationNote,
    judgementNote,
    uncertaintyNote,
    proportionalNote,
    signNote,
    scopeNote,
    // A width is not a finding; whether it is acceptable is set outside this page.
    abnormal: false,
    bandLabel,
    band,
    detail: 'Limits of agreement = mean difference plus and minus 1.96 standard deviations of the differences. The standard error of each limit is about the standard deviation times the square root of 3 over the number of pairs; the standard error of the bias is the standard deviation over the square root of that number.',
    note: BLAND_ALTMAN_NOTE,
  };
}
