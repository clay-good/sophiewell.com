// spec-v925: the delta check -- how far a result has moved from the last one, three ways.
//
// Sources:
//   Ladenson JH. Patients as their own controls: use of the computer to identify "laboratory
//   error". Clin Chem. 1975;21(11):1648-1653. (the original description)
//   Randell EW, Yenice S. Delta checks in the clinical laboratory. Crit Rev Clin Lab Sci.
//   2019;56(2):75-97.
//
//   Absolute delta = current - previous.
//   Percent delta  = that difference over the previous result.
//   Rate           = that difference per 24 hours of elapsed time.
//
// THE THRESHOLDS ARE LOCAL. There is no published universal set: every laboratory sets its own
// from its own population and its own analyzers. So this takes them as inputs and does not supply
// them, and a check with no threshold entered reports the deltas and flags nothing.
//
// A DELTA-CHECK FLAG IS A CHANGE, NOT AN ERROR. The check was invented to catch mislabeled and
// mixed-up specimens, and most of what it flags is real clinical change instead. A flag is a
// reason to look, and treating it as evidence of a specimen problem is the standard way to misuse
// it.
//
// RATE IS THE PART THAT GETS LEFT OUT. The same difference over six hours and over six days are
// not the same finding, and a laboratory that sets only an absolute threshold will flag slow
// drift and miss fast change. The elapsed time is required here for that reason.
//
// WHERE THE ANALYTE'S BIOLOGICAL VARIATION IS KNOWN, the reference change value is the principled
// threshold rather than a locally chosen number, and it has its own tool.
//
// Pure: no DOM, no clock, no network.

export const DELTA_CHECK_NOTE = 'A delta check compares a result with the last one on the same patient. The absolute delta is the difference, the percent delta is that difference over the previous result, and the rate is that difference per 24 hours of elapsed time. Four things are worth stating plainly. The thresholds are local: there is no published universal set, every laboratory sets its own from its own population and analyzers, so they are taken as inputs here and nothing is supplied or assumed. A flag is a change and not an error -- the check was invented to catch mislabeled and mixed-up specimens and most of what it flags is real clinical change, so a flag is a reason to look rather than evidence of a specimen problem. Rate is the part that gets left out: the same difference over six hours and over six days are not the same finding, and a laboratory that sets only an absolute threshold will flag slow drift and miss fast change, which is why the elapsed time is required. And where the biological variation of the analyte is known, the reference change value is the principled threshold rather than a locally chosen number. This reports how far a result has moved and compares it with thresholds someone else chose. It does not decide whether the change is real, clinically important, or a specimen problem.';

function joinList(list) {
  if (list.length <= 1) return list.join('');
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function safeRound(n, places = 2) {
  const f = 10 ** places;
  const r = Math.round(n * f) / f;
  return Number.isFinite(r) ? r : n;
}

export function deltaCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const previous = num(o.previousResult);
  const current = num(o.currentResult);
  const hours = num(o.hoursBetween);

  if (previous === null || current === null) {
    return { valid: false, message: 'Enter the previous and the current result, in the same units.' };
  }
  if (hours === null || hours <= 0) {
    return { valid: false, message: 'Enter the hours between the two results, above zero. The same difference over six hours and over six days are not the same finding, which is why the interval is required.' };
  }

  const absolute = current - previous;
  const percent = previous === 0 ? null : (absolute / previous) * 100;
  const perDay = absolute / (hours / 24);

  const absThreshold = num(o.absoluteThreshold);
  const pctThreshold = num(o.percentThreshold);
  const rateThreshold = num(o.rateThreshold);

  const checks = [
    { key: 'absolute', name: 'Absolute delta', value: absolute, threshold: absThreshold },
    { key: 'percent', name: 'Percent delta', value: percent, threshold: pctThreshold },
    { key: 'rate', name: 'Rate per 24 hours', value: perDay, threshold: rateThreshold },
  ].map((c) => ({
    ...c,
    value: c.value === null ? null : safeRound(c.value),
    flagged: c.threshold === null || c.threshold < 0 || c.value === null
      ? null
      : Math.abs(c.value) > c.threshold,
  }));

  const withThreshold = checks.filter((c) => c.flagged !== null);
  const flagged = withThreshold.filter((c) => c.flagged);

  const direction = absolute > 0 ? 'risen' : absolute < 0 ? 'fallen' : 'not moved';

  const bandLabel = withThreshold.length === 0
    ? 'No threshold entered'
    : flagged.length
      ? `Flagged on ${joinList(flagged.map((c) => c.name.toLowerCase()))}`
      : 'Within every threshold entered';

  const band = withThreshold.length === 0
    ? `The result has ${direction} by ${safeRound(Math.abs(absolute))}${percent === null ? '' : `, which is ${safeRound(Math.abs(percent), 1)}%`}, over ${safeRound(hours, 1)} hours -- a rate of ${safeRound(Math.abs(perDay))} per 24 hours. No threshold was entered, so nothing is flagged: the thresholds are local and nothing here supplies them.`
    : flagged.length
      ? `The result has ${direction} by ${safeRound(Math.abs(absolute))} over ${safeRound(hours, 1)} hours, past the ${joinList(flagged.map((c) => c.name.toLowerCase()))} threshold${flagged.length === 1 ? '' : 's'} entered. That is a reason to look, not evidence of a specimen problem.`
      : `The result has ${direction} by ${safeRound(Math.abs(absolute))} over ${safeRound(hours, 1)} hours, inside every threshold entered: ${joinList(withThreshold.map((c) => c.name.toLowerCase()))}.`;

  const localNote = 'The thresholds are local. There is no published universal set: every laboratory sets its own from its own population and its own analyzers, and nothing here supplies one.';

  const notAnErrorNote = 'A flag is a change, not an error. The check was invented to catch mislabeled and mixed-up specimens, and most of what it flags is real clinical change instead.';

  const rateNote = checks.find((c) => c.key === 'rate').threshold === null
    ? `The rate is ${safeRound(perDay)} per 24 hours. A laboratory that sets only an absolute threshold will flag slow drift and miss fast change, which is why the rate is reported whether or not a threshold exists for it.`
    : `The rate is ${safeRound(perDay)} per 24 hours, against a threshold of ${safeRound(checks.find((c) => c.key === 'rate').threshold)}.`;

  const rcvNote = 'Where the biological variation of the analyte is known, the reference change value is the principled threshold rather than a locally chosen number, and it has its own tool.';

  const zeroNote = previous === 0
    ? 'The previous result was zero, so there is no percent delta to report. The absolute delta and the rate stand.'
    : null;

  const scopeNote = 'This reports how far a result has moved and compares it with thresholds someone else chose. It does not decide whether the change is real, clinically important, or a specimen problem.';

  return {
    valid: true,
    absoluteDelta: safeRound(absolute),
    percentDelta: percent === null ? null : safeRound(percent, 1),
    ratePerDay: safeRound(perDay),
    hoursBetween: hours,
    checks,
    flaggedOn: flagged.map((c) => c.name),
    thresholdsEntered: withThreshold.length,
    localNote,
    notAnErrorNote,
    rateNote,
    rcvNote,
    zeroNote,
    scopeNote,
    abnormal: flagged.length > 0,
    bandLabel,
    band,
    detail: 'Absolute delta is the current result minus the previous one. Percent delta is that difference over the previous result. Rate is that difference per 24 hours of elapsed time.',
    note: DELTA_CHECK_NOTE,
  };
}
