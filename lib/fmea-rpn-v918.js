// spec-v918: the FMEA risk priority number, and why it does not rank.
//
// Sources:
//   International Electrotechnical Commission. IEC 60812: Failure modes and effects analysis
//   (FMEA and FMECA). 3rd ed. Geneva: IEC; 2018.
//   Automotive Industry Action Group and Verband der Automobilindustrie. AIAG-VDA FMEA Handbook.
//   1st ed. 2019 -- the revision that REPLACED the risk priority number with an Action Priority.
//
//   RPN = severity x occurrence x detection, each scored 1 to 10, so the product runs 1 to 1000.
//
// THE NUMBER DOES NOT RANK, AND THAT IS THE WHOLE POINT OF THIS TILE. A product collapses three
// different questions into one, so two items with the same RPN can be nothing alike: 10 x 5 x 2
// and 2 x 5 x 10 both come to 100, and only one of them kills someone. Worse, the product is
// sparse and lumpy -- most of the 1000 values are unreachable -- so small differences in an RPN
// are not differences at all.
//
// SEVERITY CAN FORCE ACTION ON ITS OWN. A severe failure mode stays severe however rare it is and
// however well it is caught, and no arithmetic here makes it unimportant. The 2019 AIAG-VDA
// revision dropped the RPN for an Action Priority precisely because the product hid this.
//
// DETECTION IS SCORED BACKWARDS FROM THE OTHER TWO. 1 means the failure is almost certain to be
// caught, 10 means it is almost impossible to catch. Entering it in the same direction as
// severity and occurrence is the common data-entry error, and it is invisible in the product.
//
// THERE IS NO STANDARD THRESHOLD. "Act above 100" is a local convention and appears in no
// standard, so this reports the number and its profile and DELIBERATELY DOES NOT BAND IT.
//
// Pure: no DOM, no clock, no network.

export const FMEA_NOTE = 'The risk priority number multiplies three scores, each from 1 to 10: severity, occurrence and detection. The product runs from 1 to 1000. Four things about it are worth stating plainly. It does not rank: a product collapses three different questions into one, so 10 times 5 times 2 and 2 times 5 times 10 both come to 100 and only one of them describes something that kills someone. Severity can force action on its own -- a severe failure mode stays severe however rare it is and however well it is caught, and no arithmetic makes it unimportant. Detection is scored backwards from the other two, where 1 means the failure is almost certain to be caught and 10 means it is almost impossible to catch, and entering it in the same direction as the other two is a common error that the product hides completely. And there is no standard threshold: acting above 100 is a local convention that appears in no standard, so this reports the number and its profile and does not band it. The 2019 AIAG-VDA revision replaced the risk priority number with an Action Priority for these reasons. This multiplies three scores that were already assigned. It does not assign them, and it does not decide what to act on.';

const LIMITS = { severity: 'Severity', occurrence: 'Occurrence', detection: 'Detection' };

function score(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  if (!Number.isInteger(n) || n < 1 || n > 10) return NaN;
  return n;
}

export function fmeaRpn(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const values = {};
  const missing = [];
  const outOfRange = [];
  for (const key of Object.keys(LIMITS)) {
    const s = score(o[key]);
    if (s === null) { missing.push(LIMITS[key]); continue; }
    if (Number.isNaN(s)) { outOfRange.push(LIMITS[key]); continue; }
    values[key] = s;
  }

  if (outOfRange.length) {
    return { valid: false, message: `${outOfRange.join(' and ')} must be a whole number from 1 to 10. The scales are ordinal ranks, not measurements, and a value off the scale is not a smaller or larger risk -- it is not a score at all.` };
  }
  if (missing.length) {
    return { valid: false, message: `Enter ${missing.join(', ').toLowerCase()}. All three are needed, each a whole number from 1 to 10.` };
  }

  const rpn = values.severity * values.occurrence * values.detection;

  // The profile, not the product, is what a reader can act on.
  const profile = `Severity ${values.severity}, occurrence ${values.occurrence}, detection ${values.detection}.`;

  const highest = Object.entries(values).sort((a, b) => b[1] - a[1])[0];
  const driverNote = `The largest of the three is ${LIMITS[highest[0]].toLowerCase()} at ${highest[1]}. The product hides which factor drove it, so read the three before the one.`;

  const rankingNote = 'The number does not rank. A product collapses three different questions into one, so 10 x 5 x 2 and 2 x 5 x 10 both come to 100 and only one of them describes something that kills someone.';

  const severityNote = values.severity >= 9
    ? `Severity is ${values.severity}. A severe failure mode stays severe however rare it is and however well it is caught, and this arithmetic cannot make it unimportant.`
    : 'Severity can force action on its own. A severe failure mode stays severe however rare it is and however well it is caught, whatever the product comes to.';

  const detectionNote = 'Detection is scored backwards from the other two: 1 means the failure is almost certain to be caught, 10 means it is almost impossible to catch. Entering it in the same direction as severity and occurrence is a common error, and the product hides it completely.';

  const thresholdNote = 'There is no standard threshold. Acting above 100 is a local convention and appears in no standard, which is why nothing here is banded.';

  const supersededNote = 'The 2019 AIAG-VDA revision replaced the risk priority number with an Action Priority, for these reasons.';

  const scopeNote = 'This multiplies three scores that were already assigned. It does not assign them, and it does not decide what to act on.';

  return {
    valid: true,
    rpn,
    severity: values.severity,
    occurrence: values.occurrence,
    detection: values.detection,
    profile,
    driverNote,
    rankingNote,
    severityNote,
    detectionNote,
    thresholdNote,
    supersededNote,
    scopeNote,
    // Nothing here is normal or abnormal: the tile refuses to band, and saying
    // otherwise would be the exact claim it exists to refuse.
    abnormal: false,
    bandLabel: `RPN ${rpn}`,
    band: `Risk priority number ${rpn} of a possible 1000. ${profile} This is not banded, and it is not a rank.`,
    detail: 'RPN = severity x occurrence x detection, each scored 1 to 10. Detection runs the other way from the other two: 1 is almost certain to be caught, 10 is almost impossible to catch.',
    note: FMEA_NOTE,
  };
}
