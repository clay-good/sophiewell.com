// spec-v572: the HEAVEN criteria for difficult emergency airway management. "heaven" and "heaven-criteria"
// were both zero-hit and `grep -c "id: 'heaven-criteria'" app.js` returned 0.
//
// A COMPANION GAP. `lemon` and `macocha` are both in the catalog, as are Mallampati and Cormack-Lehane.
// HEAVEN exists BECAUSE those tools assume a cooperative, cooperative-enough, largely elective patient: it
// is the emergency rapid-sequence-intubation axis of the same question, and unlike them it includes
// PHYSIOLOGIC difficulty, not only anatomic.
//
// **THERE IS NO POINT SCORE AND NO BAND TABLE. HEAVEN IS A COUNT OF CRITERIA PRESENT, 0 TO 6.** Only two
// numbers were ever published against it: first-attempt success of about 94 percent with no criteria and
// about 43 percent with five or more. Everything between appears in the source papers as a FIGURE, never as
// a numeric table. A tile that emitted a percentage for a count of 2 or 3 would be reading values off a
// chart and presenting them as data, so this lib reports the two published anchors and refuses to
// interpolate (spec-v97).
//
// **FOUR OF THE SIX CRITERIA ARE EXPLICITLY OPERATOR-JUDGMENT DESCRIPTORS, NOT MEASUREMENTS.** The source
// defines them with phrases like "anticipated to interfere", "anticipated to limit" and "suspected". Only
// the hypoxemia threshold and the pediatric half of the size criterion are objective. **Obesity is
// deliberately left undefined -- there is no body mass index threshold**, and inventing one would replace
// the operator's judgment, which is the input the instrument actually asks for.
//
// **"EXSANGUINATION" DOES NOT MEAN BLEEDING, AND THE NAME IS ACTIVELY MISLEADING.** It means SUSPECTED
// ANEMIA, chronic or acute, scored for its effect on safe apnea time -- how fast the patient will
// desaturate once breathing stops. A patient who is not bleeding at all can meet it, and a patient
// bleeding briskly with a normal hemoglobin may not.
//
// **THE CRITERIA ARE ASSESSED AT THE MOMENT OF LARYNGOSCOPY, NOT ON ARRIVAL.** Hypoxemia and the
// fluid criterion both reference the time of initial laryngoscopy, so effective preoxygenation can
// legitimately un-score the hypoxemia criterion. A count taken on arrival is not a HEAVEN count.
//
// TWO PUBLISHED OUTCOMES, SAME CRITERIA. The original paper predicts FIRST-PASS INTUBATION SUCCESS; a later
// analysis by overlapping authors predicts a POOR LARYNGOSCOPIC VIEW, Cormack-Lehane grade III or IV. The
// criteria are identical and the endpoint is not, so a figure quoted without its endpoint is ambiguous.
//
// HIGH-STAKES: this ANTICIPATES difficulty. It does NOT decide whether to intubate, when to intubate, or by
// what technique, and it is not an indication for a surgical airway. A count of zero does not make an
// airway safe -- the published negative predictive value is high but not perfect, and unanticipated
// difficulty is exactly the scenario airway planning exists for. It does not replace a difficult-airway
// plan, backup equipment, or a trained second operator (spec-v11 section 5.3). The airway decision stays
// with the clinician at the bedside.
//
// CRITERIA AND BOTH NUMERIC THRESHOLDS RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from two
// independent sources that agree on every definition and on both numbers:
//   - Kuzmack E, Inglis T, Olvera D, Wolfe A, Seng K, Davis D. A Novel Difficult-Airway Prediction Tool for
//     Emergency Airway Management: Validation of the HEAVEN Criteria in a Large Air Medical Cohort.
//     J Emerg Med. 2018;54(4):395-401.
//   - Davis DP, Olvera D, Selde W, et al. Scand J Trauma Resusc Emerg Med. 2019;27:21.

export const HYPOXEMIA_THRESHOLD = 93; // percent oxygen saturation, at the time of initial laryngoscopy
export const PEDIATRIC_AGE_THRESHOLD = 8; // years

export const HEAVEN_CRITERIA = [
  {
    key: 'hypoxemia', letter: 'H', name: 'Hypoxemia',
    objective: true,
    text: `Oxygen saturation ${HYPOXEMIA_THRESHOLD} percent or below at the time of initial laryngoscopy.`,
  },
  {
    key: 'extremesOfSize', letter: 'E', name: 'Extremes of size',
    objective: false,
    text: `A pediatric patient ${PEDIATRIC_AGE_THRESHOLD} years of age or under, or clinical obesity that the operator anticipates will interfere with bag-valve-mask ventilation or with visualizing the glottis. Obesity is deliberately left undefined: there is no body mass index threshold.`,
  },
  {
    key: 'anatomicChallenge', letter: 'A', name: 'Anatomic challenge',
    objective: false,
    text: 'Any structural abnormality anticipated to limit the laryngoscopic view: airway trauma, limited oral aperture, large tongue, short neck, mass or swelling, foreign body, or an external structure obstructing visualization.',
  },
  {
    key: 'vomitBloodFluid', letter: 'V', name: 'Vomit, blood or fluid',
    objective: false,
    text: 'Clinically significant fluid in the pharynx or hypopharynx before laryngoscopy, anticipated to interfere with bag-valve-mask ventilation or with visualizing the glottis.',
  },
  {
    key: 'exsanguination', letter: 'E', name: 'Exsanguination',
    objective: false,
    text: 'SUSPECTED ANEMIA, chronic or acute, raising concern about shortening safe apnea time. This is NOT active bleeding: it is anticipated desaturation reserve.',
  },
  {
    key: 'neckMobility', letter: 'N', name: 'Neck mobility',
    objective: false,
    text: 'Limited cervical range of motion, from immobilization or from arthritis.',
  },
];

export const HEAVEN_MAX = 6;

// The ONLY two published anchors. Everything between them exists as a figure, not a table.
export const PUBLISHED_ANCHORS = {
  none: 'About 94 percent first-attempt success with NO criteria present.',
  fiveOrMore: 'About 43 percent first-attempt success with FIVE OR MORE criteria present.',
};
export const ANCHOR_FLOOR = 5;

const NO_INTERPOLATION = 'HEAVEN is a COUNT, not a point score, and it has no band table. Only two figures were ever published: about 94 percent first-attempt success with no criteria and about 43 percent with five or more. Everything in between appears in the source papers as a figure rather than a numeric table, so no percentage is given for intermediate counts here.';

const JUDGMENT_TEXT = 'Four of the six criteria are explicitly operator-judgment descriptors rather than measurements, defined with phrases such as "anticipated to interfere" and "suspected". Only the hypoxemia threshold and the pediatric age are objective, and obesity is deliberately left undefined with no body mass index threshold.';

const TIMING_TEXT = 'The criteria are assessed AT THE MOMENT OF LARYNGOSCOPY, not on arrival: hypoxemia and the fluid criterion both reference the time of initial laryngoscopy, so effective preoxygenation can legitimately un-score hypoxemia. A count taken on arrival is not a HEAVEN count.';

const OUTCOME_TEXT = 'Two outcomes have been published against the same criteria: first-pass intubation success in the original paper, and a poor laryngoscopic view (Cormack-Lehane grade III or IV) in a later analysis. A figure quoted without its endpoint is ambiguous.';

const NOTE = 'The HEAVEN criteria (Kuzmack and colleagues 2018) anticipate a difficult emergency airway, and exist because tools such as LEMON and the Mallampati score assume a cooperative, largely elective patient. HEAVEN is the emergency rapid-sequence-intubation axis of the same question and, unlike those, includes physiologic as well as anatomic difficulty. The six criteria are hypoxemia, meaning an oxygen saturation of 93 percent or below at the time of initial laryngoscopy; extremes of size, meaning a patient 8 years of age or under or clinical obesity the operator anticipates will interfere; anatomic challenge, meaning any structural abnormality anticipated to limit the view; vomit, blood or fluid in the pharynx or hypopharynx anticipated to interfere; exsanguination, meaning suspected anemia rather than active bleeding, scored for its effect on safe apnea time; and limited neck mobility. It is a COUNT of criteria present from 0 to 6, with no point score and no band table. Only two figures were ever published, about 94 percent first-attempt success with no criteria and about 43 percent with five or more, and everything between appears in the source papers as a figure rather than a numeric table, so no percentage is given for intermediate counts. Four of the six criteria are explicitly operator-judgment descriptors rather than measurements, defined with phrases such as anticipated to interfere and suspected; only the hypoxemia threshold and the pediatric age are objective, and obesity is deliberately left undefined with no body mass index threshold, so inventing one would replace the judgment the instrument actually asks for. Exsanguination does not mean bleeding, and the name is misleading: it means suspected anemia, chronic or acute, scored for how fast the patient will desaturate once breathing stops, so a patient who is not bleeding at all can meet it. The criteria are assessed at the moment of laryngoscopy rather than on arrival, so effective preoxygenation can legitimately un-score hypoxemia. Two outcomes have been published against the same criteria, first-pass intubation success and a poor laryngoscopic view at Cormack-Lehane grade III or IV, so a figure quoted without its endpoint is ambiguous. This anticipates difficulty. It does not decide whether to intubate, when to intubate, or by what technique, and it is not an indication for a surgical airway. A count of zero does not make an airway safe, since the published negative predictive value is high but not perfect and unanticipated difficulty is exactly the scenario airway planning exists for. It does not replace a difficult-airway plan, backup equipment, or a trained second operator.';

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

// input: one key per criterion in HEAVEN_CRITERIA, each yes/no. All six required.
export function heavenCriteria(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const read = HEAVEN_CRITERIA.map((c) => ({ c, value: readBool(o[c.key]) }));
  const missing = read.filter((r) => r.value === null);
  if (missing.length) {
    return { valid: false, message: `Answer every criterion, assessed AT THE MOMENT OF LARYNGOSCOPY rather than on arrival. Still needed: ${missing.map((r) => r.c.key).join(', ')}.` };
  }
  const bad = read.filter((r) => Number.isNaN(r.value));
  if (bad.length) {
    return { valid: false, message: `Each criterion must be yes or no. Unrecognized: ${bad.map((r) => r.c.key).join(', ')}.` };
  }

  const present = read.filter((r) => r.value).map((r) => r.c.letter + ' (' + r.c.name + ')');
  const count = present.length;

  let anchor = null;
  if (count === 0) anchor = PUBLISHED_ANCHORS.none;
  else if (count >= ANCHOR_FLOOR) anchor = PUBLISHED_ANCHORS.fiveOrMore;

  return {
    valid: true,
    count,
    max: HEAVEN_MAX,
    criteriaPresent: present,
    publishedAnchor: anchor,
    hasPublishedFigure: anchor !== null,
    bandLabel: `HEAVEN ${count} of ${HEAVEN_MAX} criteria`,
    bandText: `HEAVEN: ${count} of ${HEAVEN_MAX} criteria present${count ? ` (${present.join(', ')})` : ''}. ${anchor ? anchor : 'No first-attempt success figure is published for this count.'} ${NO_INTERPOLATION} ${JUDGMENT_TEXT} ${TIMING_TEXT} ${OUTCOME_TEXT} This anticipates difficulty and does not decide whether or how to intubate; a count of zero does not make an airway safe.`,
    note: NOTE,
  };
}
