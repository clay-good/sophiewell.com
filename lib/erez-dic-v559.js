// spec-v559: the Erez pregnancy-specific DIC score. "erez" was zero-hit across corpus.json, app.js and
// lib/meta.js. A COMPANION GAP: the catalog already has the ISTH and JAAM DIC scores, and this is a THIRD,
// pregnancy-specific instrument with different components, different weights and a different cutoff scale
// entirely -- 26 rather than 5. Applying an ISTH cutoff to this score, or this score's cutoff to ISTH,
// would be wrong by an order of magnitude.
//
// THREE COMPONENTS. Maximum 52. A score of 26 or more indicates DIC.
//
// **THE PLATELET ROW IS NON-MONOTONIC, AND THAT IS THE PUBLISHED TABLE RATHER THAN A TRANSCRIPTION ERROR.**
// A platelet count below 50 scores 1 point, while 50 to 100 scores 2 -- so the MOST severe thrombocytopenia
// scores FEWER points than moderate thrombocytopenia. Two independent sources print it this way and one
// names the pattern explicitly as unusual. Every instinct says to "fix" this into a monotonic ladder, and
// doing so would change the score of exactly the sickest patients. This lib reproduces it and exports the
// row so the property is testable.
//
// **THE PROTHROMBIN TIME INPUT IS A DIFFERENCE IN SECONDS, NOT A RATIO AND NOT AN INR.** It is the
// patient's prothrombin time minus the laboratory control. The strata are fractions of a second -- under
// 0.5, 0.5 to 1.0, 1.0 to 1.5, above 1.5 -- so passing an INR of 1.2, or a raw prothrombin time of 14
// seconds, lands in the top stratum and adds 25 points that the patient has not earned. This single
// confusion moves the score by 12 to 25 points, which is most of the way to the cutoff on its own.
//
// **THE CUTOFF IS ESSENTIALLY UNREACHABLE WITHOUT ONE OF THE TWO 25-POINT FINDINGS.** The maximum is 52, and
// 25 of it sits in fibrinogen below 3.0 g/L and another 25 in a prothrombin time difference above 1.5
// seconds. Everything else on the form -- the whole platelet row plus both middle strata -- totals at most
// 2 + 12 + 6 = 20, which cannot reach 26. So the score is in practice a test for one of those two findings,
// and the result says so, because a reader watching a platelet count fall will not reach DIC by that route
// however far it falls.
//
// **D-DIMER AND FIBRIN DEGRADATION PRODUCTS ARE DELIBERATELY ABSENT, UNLIKE THE ISTH SCORE.** They rise in
// normal pregnancy and would false-positive, which is a large part of why a pregnancy-specific score exists
// at all. Their absence is a design decision, not an omission to be helpfully filled in.
//
// BOUNDARY CONVENTION, STATED BECAUSE THE PRINTED TABLE IS AMBIGUOUS. The published strata share their
// endpoints: 50, 100, 185, 0.5, 1.0, 1.5, 3.0, 4.0 and 4.5 each appear in two adjacent rows. The two
// sources differ only in inequality GLYPHS on the fibrinogen row, never in the numbers, so this is a
// convention to choose rather than a value disagreement to refuse (spec-v97). This lib gives each printed
// range its own UPPER bound and starts the next range strictly above it, and states the convention in the
// result so a boundary value is never silently resolved.
//
// HIGH-STAKES: DIC in pregnancy is an obstetric emergency, and it is a CLINICAL diagnosis supported by
// laboratory findings rather than established by a score. A score below the cutoff does NOT exclude it, and
// this instrument was derived and validated in a specific population against a specific reference standard.
// It does not identify the CAUSE, which is what actually gets treated -- abruption, amniotic fluid embolism,
// sepsis, severe preeclampsia and HELLP, retained products, and acute fatty liver all present this way and
// diverge sharply in management. It does not indicate delivery, transfusion, or any blood product, and it
// does not replace serial measurement, which is what usually reveals DIC (spec-v11 section 5.3). The
// clinical decision stays with the clinician.
//
// COMPONENTS, POINTS AND CUTOFF RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from the derivation paper
// and an independent clinical reproduction that agree on every stratum and every point value, including the
// non-monotonic platelet row:
//   - Erez O, Novack L, Beer-Weisel R, et al. DIC score in pregnant women: a population based modification
//     of the International Society on Thrombosis and Hemostasis score. PLoS One. 2014;9(4):e93240.

// Each row: the upper bound of the printed range (inclusive) and its points. The last entry is open-ended.
export const PLATELET_ROWS = [
  { upTo: 50, exclusive: true, points: 1, text: 'Below 50 x10^9/L' },
  { upTo: 100, points: 2, text: '50 to 100 x10^9/L' },
  { upTo: 185, points: 1, text: 'Above 100 to 185 x10^9/L' },
  { upTo: Infinity, points: 0, text: 'Above 185 x10^9/L' },
];

export const PT_DIFFERENCE_ROWS = [
  { upTo: 0.5, exclusive: true, points: 0, text: 'Below 0.5 seconds' },
  { upTo: 1.0, points: 5, text: '0.5 to 1.0 seconds' },
  { upTo: 1.5, points: 12, text: 'Above 1.0 to 1.5 seconds' },
  { upTo: Infinity, points: 25, text: 'Above 1.5 seconds' },
];

export const FIBRINOGEN_ROWS = [
  { upTo: 3.0, exclusive: true, points: 25, text: 'Below 3.0 g/L' },
  { upTo: 4.0, points: 6, text: '3.0 to 4.0 g/L' },
  { upTo: 4.5, points: 1, text: 'Above 4.0 to 4.5 g/L' },
  { upTo: Infinity, points: 0, text: 'Above 4.5 g/L' },
];

export const EREZ_MAX = 52;
export const EREZ_CUTOFF = 26;
// Everything except the two 25-point findings: 2 (platelets) + 12 (PT mid) + 6 (fibrinogen mid).
export const MAX_WITHOUT_A_25_POINT_FINDING = 20;

const NON_MONOTONIC_TEXT = 'Note the platelet row: a count below 50 scores 1 point while 50 to 100 scores 2, so the most severe thrombocytopenia scores FEWER points than moderate thrombocytopenia. That is the published table, reproduced here rather than corrected.';

const REACHABILITY_TEXT = `The cutoff of ${EREZ_CUTOFF} is essentially unreachable without one of the two 25-point findings, a fibrinogen below 3.0 g/L or a prothrombin time difference above 1.5 seconds: everything else on the form totals at most ${MAX_WITHOUT_A_25_POINT_FINDING}. A falling platelet count cannot reach the cutoff by itself, however far it falls.`;

const PT_TEXT = 'The prothrombin time input is a DIFFERENCE IN SECONDS, the patient value minus the laboratory control. It is not a ratio and not an INR: passing an INR, or a raw prothrombin time, lands in the top stratum and adds 25 points the patient has not earned.';

const BOUNDARY_TEXT = 'The published strata share their endpoints, so each printed range is given its own upper bound here and the next range starts strictly above it. The two sources differ only in inequality glyphs, never in the numbers.';

const NO_DDIMER_TEXT = 'D-dimer and fibrin degradation products are deliberately absent, unlike the ISTH score, because they rise in normal pregnancy and would produce false positives. That absence is a design decision.';

const NOTE = 'The Erez pregnancy-specific DIC score (Erez and colleagues 2014) is a modification of the International Society on Thrombosis and Hemostasis score for pregnant women. It scores three components: platelet count, the prothrombin time difference in seconds, and fibrinogen. The maximum is 52 and a score of 26 or more indicates disseminated intravascular coagulation. The platelet row is non-monotonic: a count below 50 scores 1 point while 50 to 100 scores 2, so the most severe thrombocytopenia scores fewer points than moderate thrombocytopenia. Two independent sources print it that way and one names the pattern as unusual, so it is reproduced here rather than corrected into a monotonic ladder, which would change the score of exactly the sickest patients. The prothrombin time input is a difference in seconds, the patient value minus the laboratory control, and not a ratio or an INR; the strata are fractions of a second, so passing an INR or a raw prothrombin time lands in the top stratum and adds 25 points the patient has not earned, moving the score by 12 to 25 points. The cutoff is essentially unreachable without one of the two 25-point findings, a fibrinogen below 3.0 g/L or a prothrombin time difference above 1.5 seconds, because everything else on the form totals at most 20, so a falling platelet count cannot reach the cutoff by itself however far it falls. D-dimer and fibrin degradation products are deliberately absent, unlike the ISTH score, because they rise in normal pregnancy and would false-positive, which is much of why a pregnancy-specific score exists. This is a third, pregnancy-specific DIC score alongside the ISTH and JAAM scores in this catalog, with different components and a cutoff on a different scale, 26 rather than 5, so the cutoffs are not interchangeable. Disseminated intravascular coagulation in pregnancy is an obstetric emergency, and it is a clinical diagnosis supported by laboratory findings rather than established by a score: a score below the cutoff does not exclude it. It does not identify the cause, which is what actually gets treated, and abruption, amniotic fluid embolism, sepsis, severe preeclampsia and HELLP, retained products and acute fatty liver of pregnancy all present this way while diverging sharply in management. It does not indicate delivery, transfusion or any blood product, and it does not replace serial measurement, which is usually what reveals the diagnosis.';

function scoreRows(rows, value) {
  for (const row of rows) {
    if (row.exclusive ? value < row.upTo : value <= row.upTo) return row;
  }
  return rows[rows.length - 1];
}

function readNumber(raw, { min = 0, max } = {}) {
  if (raw === '' || raw === null || raw === undefined) return null;
  const n = Number(String(raw).trim());
  if (!Number.isFinite(n) || n < min || (max !== undefined && n > max)) return NaN;
  return n;
}

// input:
//   platelets    -- x10^9/L.
//   ptDifference -- SECONDS, patient prothrombin time minus laboratory control. Not an INR.
//   fibrinogen   -- g/L (Clauss).
export function erezDic(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const platelets = readNumber(o.platelets, { max: 2000 });
  if (platelets === null) {
    return { valid: false, message: 'Enter the platelet count in x10^9/L.' };
  }
  if (Number.isNaN(platelets)) {
    return { valid: false, message: 'The platelet count must be a number in x10^9/L between 0 and 2000.' };
  }

  const ptDifference = readNumber(o.ptDifference, { max: 60 });
  if (ptDifference === null) {
    return { valid: false, message: 'Enter the prothrombin time DIFFERENCE in seconds: the patient value minus the laboratory control. This is not a ratio and not an INR.' };
  }
  if (Number.isNaN(ptDifference)) {
    return { valid: false, message: 'The prothrombin time difference must be a number of seconds from 0 to 60. It is a difference, not a ratio or an INR.' };
  }

  const fibrinogen = readNumber(o.fibrinogen, { max: 20 });
  if (fibrinogen === null) {
    return { valid: false, message: 'Enter the fibrinogen in g/L.' };
  }
  if (Number.isNaN(fibrinogen)) {
    return { valid: false, message: 'Fibrinogen must be a number in g/L from 0 to 20.' };
  }

  const plateletRow = scoreRows(PLATELET_ROWS, platelets);
  const ptRow = scoreRows(PT_DIFFERENCE_ROWS, ptDifference);
  const fibrinogenRow = scoreRows(FIBRINOGEN_ROWS, fibrinogen);

  const total = plateletRow.points + ptRow.points + fibrinogenRow.points;
  const meetsDic = total >= EREZ_CUTOFF;
  const hasHighPointFinding = ptRow.points === 25 || fibrinogenRow.points === 25;

  return {
    valid: true,
    total,
    max: EREZ_MAX,
    cutoff: EREZ_CUTOFF,
    meetsDic,
    hasHighPointFinding,
    components: {
      platelets: { value: platelets, points: plateletRow.points, band: plateletRow.text },
      ptDifference: { value: ptDifference, points: ptRow.points, band: ptRow.text },
      fibrinogen: { value: fibrinogen, points: fibrinogenRow.points, band: fibrinogenRow.text },
    },
    bandLabel: `Erez DIC score ${total} of ${EREZ_MAX}, ${meetsDic ? 'at or above' : 'below'} the cutoff of ${EREZ_CUTOFF}`,
    bandText: `Erez pregnancy-specific DIC score ${total} of ${EREZ_MAX}. ${meetsDic ? `At or above the cutoff of ${EREZ_CUTOFF}, which the source reads as indicating disseminated intravascular coagulation.` : `Below the cutoff of ${EREZ_CUTOFF}. A score below the cutoff does NOT exclude DIC, which is a clinical diagnosis supported by laboratory findings rather than established by a score.`} Platelets ${plateletRow.points}, prothrombin time difference ${ptRow.points}, fibrinogen ${fibrinogenRow.points}. ${PT_TEXT} ${NON_MONOTONIC_TEXT} ${REACHABILITY_TEXT} ${BOUNDARY_TEXT} ${NO_DDIMER_TEXT} This does not identify the cause, which is what gets treated, and it does not indicate delivery or any blood product.`,
    note: NOTE,
  };
}
