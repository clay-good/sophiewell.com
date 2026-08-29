// spec-v574: COMPERA 2.0, the four-stratum risk assessment model for pulmonary arterial hypertension.
// "compera" and "compera-2" were both zero-hit and `grep -c "id: 'compera-2'" app.js` returned 0.
//
// A COMPANION AND A SUCCESSOR AT ONCE. `reveal-lite-2` is in the catalog; COMPERA 2.0 is the European
// counterpart adopted by the 2022 guidelines at follow-up, and by its own footnote it BORROWS the 6-minute
// walk distance and BNP cut points from REVEAL Lite 2. The two are not independent instruments, and this
// tile says so.
//
// **WHO FUNCTIONAL CLASS HAS ONLY THREE GRADES IN A FOUR-GRADE MODEL, AND NO FUNCTIONAL CLASS SCORES 4.**
// Class I or II scores 1, class III scores 2, class IV scores 3. There is no class that reaches grade 4.
// A four-column table with one row stopping at three columns looks like a missing cell, and an
// implementation that "completed" it by mapping class IV to 4 would push every class IV patient a whole
// stratum higher. The grade is unreachable, and the lib exports the ladder so that is checkable.
//
// **THREE ROWS HAVE NUMERIC GAPS, BECAUSE THE TABLE IS WRITTEN AS THOUGH EVERY INPUT IS AN INTEGER.** The
// walk-distance grades run 440 to 320 and then 319 to 165, so a distance strictly between 319 and 320 falls
// in neither. NT-proBNP runs to 649 and then from 650; BNP runs to 199 and then from 200. Those gaps are
// narrow but reachable -- a walk distance is routinely recorded to the metre and a natriuretic peptide to
// one decimal. This lib REFUSES a value that lands in a gap and names the gap, rather than rounding the
// patient into whichever neighbouring band happens to be nearer (spec-v97).
//
// **THE DENOMINATOR IS THE NUMBER OF VARIABLES ACTUALLY AVAILABLE, NOT A FIXED THREE.** The mean is the sum
// of the grades divided by how many were graded, so a patient with two of the three variables is still
// scorable. Treating a missing variable as a zero, or as a fixed denominator of three, would drag every
// incomplete patient toward low risk.
//
// **BNP AND NT-proBNP ARE MUTUALLY EXCLUSIVE AND THE PRECEDENCE IS STATED: WHEN BOTH ARE AVAILABLE,
// NT-proBNP IS USED.** They are not two variables that both count. Scoring both would give the natriuretic
// peptide axis double the weight of functional class and walk distance combined.
//
// **THE ROUNDING RULE DIFFERS BETWEEN THIS MODEL AND ITS OWN THREE-STRATUM SIBLING, AND REUSING ONE FOR THE
// OTHER IS THE CLASSIC ERROR.** COMPERA 2.0 rounds the mean TO THE NEAREST INTEGER, giving strata 1 to 4.
// The older three-stratum model uses banded rounding instead, with different boundaries entirely. A tile
// that applied the three-stratum bands here would misclassify most of the middle.
//
// **THIS PAPER PUBLISHES NO PER-STRATUM MORTALITY PERCENTAGES OF ITS OWN, SO NONE IS QUOTED HERE.** The
// figures that circulate for the four strata come from other cohorts. Attaching them to this citation would
// attribute numbers to a source that does not contain them.
//
// HIGH-STAKES: a follow-up risk stratification, not a diagnosis. It does NOT diagnose pulmonary arterial
// hypertension, which requires right heart catheterization, and it does not distinguish it from the other
// groups of pulmonary hypertension -- left heart disease, lung disease and chronic thromboembolic disease
// are managed completely differently and are not what this model was built on. It does not select or
// escalate PAH therapy, and it is not by itself an indication for combination treatment, parenteral
// prostacyclin, or transplant referral (spec-v11 section 5.3). The decision stays with the PH specialist.
//
// GRADES, CUT POINTS AND THE SCORING RULE RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from the
// paper's own Table 1 and with the scoring rule independently restated by two later publications:
//   - Hoeper MM, Pausch C, Olsson KM, et al. COMPERA 2.0: a refined four-stratum risk assessment model for
//     pulmonary arterial hypertension. Eur Respir J. 2022;60(1):2102311.

export const WHO_FC_GRADES = [
  { value: 'I-II', grade: 1, text: 'WHO functional class I or II' },
  { value: 'III', grade: 2, text: 'WHO functional class III' },
  { value: 'IV', grade: 3, text: 'WHO functional class IV' },
];

// Each band is [low, high] inclusive. The gaps between bands are deliberate and are refused.
export const SIX_MWD_BANDS = [
  { grade: 1, min: 441, max: Infinity, text: 'Over 440 m' },
  { grade: 2, min: 320, max: 440, text: '440 to 320 m' },
  { grade: 3, min: 165, max: 319, text: '319 to 165 m' },
  { grade: 4, min: 0, max: 164, text: 'Under 165 m' },
];

export const BNP_BANDS = [
  { grade: 1, min: 0, max: 49, text: 'Under 50 ng/L' },
  { grade: 2, min: 50, max: 199, text: '50 to 199 ng/L' },
  { grade: 3, min: 200, max: 800, text: '200 to 800 ng/L' },
  { grade: 4, min: 801, max: Infinity, text: 'Over 800 ng/L' },
];

export const NT_PROBNP_BANDS = [
  { grade: 1, min: 0, max: 299, text: 'Under 300 ng/L' },
  { grade: 2, min: 300, max: 649, text: '300 to 649 ng/L' },
  { grade: 3, min: 650, max: 1100, text: '650 to 1100 ng/L' },
  { grade: 4, min: 1101, max: Infinity, text: 'Over 1100 ng/L' },
];

export const STRATA = {
  1: 'Low risk',
  2: 'Intermediate-low risk',
  3: 'Intermediate-high risk',
  4: 'High risk',
};

export const MAX_WHO_FC_GRADE = 3; // no functional class reaches 4

const FC_TEXT = `WHO functional class has only three grades in this four-grade model: I or II scores 1, III scores 2, and IV scores ${MAX_WHO_FC_GRADE}. NO functional class scores 4, and mapping class IV to 4 would push every such patient a whole stratum higher.`;

const PEPTIDE_PRECEDENCE = 'BNP and NT-proBNP are mutually exclusive: when both are available, NT-proBNP is used. They are not two variables that both count.';

const DENOMINATOR_TEXT = 'The mean is the sum of the grades divided by the number of variables ACTUALLY graded, not by a fixed three, so a patient with two of the three variables is still scorable.';

const ROUNDING_TEXT = 'COMPERA 2.0 rounds the mean TO THE NEAREST INTEGER. Its own three-stratum predecessor uses banded rounding with different boundaries, and applying those bands here would misclassify most of the middle.';

const NO_MORTALITY = 'This model publishes no per-stratum mortality percentages of its own, so none is quoted here. The figures that circulate for the four strata come from other cohorts and must not be attributed to this citation.';

const BORROWED = 'The 6-minute walk distance and BNP cut points are borrowed from REVEAL Lite 2 by the paper’s own footnote, so this model and that one are not independent.';

const NOTE = 'COMPERA 2.0 (Hoeper and colleagues 2022) is a four-stratum risk assessment model for pulmonary arterial hypertension at follow-up, and the European counterpart to REVEAL Lite 2, whose 6-minute walk distance and BNP cut points it borrows by its own footnote. Three variables are each graded 1 to 4 and the mean is taken: WHO functional class, 6-minute walk distance, and a natriuretic peptide. WHO functional class has only three grades in this four-grade model, with class I or II scoring 1, class III scoring 2 and class IV scoring 3; no functional class scores 4, and mapping class IV to 4 would push every such patient a whole stratum higher. The walk-distance grades are over 440 m, 440 to 320, 319 to 165, and under 165. BNP grades are under 50, 50 to 199, 200 to 800, and over 800 ng/L; NT-proBNP grades are under 300, 300 to 649, 650 to 1100, and over 1100 ng/L. Three of those rows have numeric gaps because the table is written as though every input is an integer: a walk distance strictly between 319 and 320, a BNP between 199 and 200, or an NT-proBNP between 649 and 650 falls in no band, and such values are refused here rather than rounded into whichever neighbour is nearer. BNP and NT-proBNP are mutually exclusive and the precedence is stated: when both are available, NT-proBNP is used, so scoring both would give the natriuretic peptide axis double weight. The mean is the sum of grades divided by the number of variables actually graded rather than by a fixed three, so a patient with two of the three is still scorable, and treating a missing variable as zero would drag every incomplete patient toward low risk. The mean is rounded to the nearest integer, giving strata of 1 low risk, 2 intermediate-low, 3 intermediate-high and 4 high; the older three-stratum model uses banded rounding with different boundaries, and reusing those bands here is the classic error. This paper publishes no per-stratum mortality percentages of its own, so none is quoted, and the figures circulating for the four strata come from other cohorts. This is a follow-up risk stratification, not a diagnosis. It does not diagnose pulmonary arterial hypertension, which requires right heart catheterization, and it does not distinguish it from the other groups of pulmonary hypertension, since disease due to left heart disease, lung disease or chronic thromboembolism is managed completely differently and is not what this model was built on. It does not select or escalate therapy, and it is not by itself an indication for combination treatment, parenteral prostacyclin, or transplant referral.';

function gradeFromBands(bands, value, label, unit) {
  const band = bands.find((b) => value >= b.min && value <= b.max);
  if (band) return { grade: band.grade, band };
  // The value landed in a printed gap.
  const below = bands.filter((b) => b.max < value).sort((a, b) => b.max - a.max)[0];
  const above = bands.filter((b) => b.min > value).sort((a, b) => a.min - b.min)[0];
  return {
    gap: `A ${label} of ${value} ${unit} falls in a GAP in the published table, between ${below.text} and ${above.text}. The table is written as though every input is an integer, and this value is in neither band. No grade is assigned rather than rounding into whichever neighbour is nearer.`,
  };
}

function readNumber(raw, max) {
  if (raw === '' || raw === null || raw === undefined) return null;
  const n = Number(String(raw).trim());
  if (!Number.isFinite(n) || n < 0 || n > max) return NaN;
  return n;
}

// input:
//   whoFc      -- 'I-II', 'III' or 'IV'. Optional.
//   sixMwd     -- metres. Optional.
//   bnp        -- ng/L. Optional. Ignored when ntProBnp is supplied.
//   ntProBnp   -- ng/L. Optional. Takes precedence over bnp.
// At least one variable is required; the denominator is however many were graded.
export function compera2(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const graded = [];

  const rawFc = o.whoFc;
  if (rawFc !== '' && rawFc !== null && rawFc !== undefined) {
    const fc = WHO_FC_GRADES.find((g) => g.value === String(rawFc).trim().toUpperCase().replace('I-II', 'I-II'));
    if (!fc) {
      return { valid: false, message: `WHO functional class must be one of: ${WHO_FC_GRADES.map((g) => g.value).join(', ')}. ${FC_TEXT}` };
    }
    graded.push({ variable: 'WHO functional class', grade: fc.grade, detail: fc.text });
  }

  const sixMwd = readNumber(o.sixMwd, 2000);
  if (Number.isNaN(sixMwd)) {
    return { valid: false, message: 'The 6-minute walk distance must be a number of meters between 0 and 2000.' };
  }
  if (sixMwd !== null) {
    const g = gradeFromBands(SIX_MWD_BANDS, sixMwd, '6-minute walk distance', 'm');
    if (g.gap) return { valid: false, message: g.gap };
    graded.push({ variable: '6-minute walk distance', grade: g.grade, detail: g.band.text });
  }

  const ntProBnp = readNumber(o.ntProBnp, 100000);
  if (Number.isNaN(ntProBnp)) {
    return { valid: false, message: 'NT-proBNP must be a number in ng/L.' };
  }
  const bnp = readNumber(o.bnp, 100000);
  if (Number.isNaN(bnp)) {
    return { valid: false, message: 'BNP must be a number in ng/L.' };
  }

  let peptideUsed = null;
  if (ntProBnp !== null) {
    const g = gradeFromBands(NT_PROBNP_BANDS, ntProBnp, 'NT-proBNP', 'ng/L');
    if (g.gap) return { valid: false, message: g.gap };
    graded.push({ variable: 'NT-proBNP', grade: g.grade, detail: g.band.text });
    peptideUsed = 'NT-proBNP';
  } else if (bnp !== null) {
    const g = gradeFromBands(BNP_BANDS, bnp, 'BNP', 'ng/L');
    if (g.gap) return { valid: false, message: g.gap };
    graded.push({ variable: 'BNP', grade: g.grade, detail: g.band.text });
    peptideUsed = 'BNP';
  }

  if (!graded.length) {
    return { valid: false, message: 'Supply at least one of WHO functional class, 6-minute walk distance, or a natriuretic peptide. The denominator is the number of variables actually available.' };
  }

  const sum = graded.reduce((a, g) => a + g.grade, 0);
  const mean = sum / graded.length;
  const stratum = Math.round(mean);
  const bothPeptides = ntProBnp !== null && bnp !== null;

  return {
    valid: true,
    stratum,
    stratumLabel: STRATA[stratum],
    mean: Math.round(mean * 100) / 100,
    variablesGraded: graded.length,
    graded,
    peptideUsed,
    bnpIgnored: bothPeptides,
    bandLabel: `COMPERA 2.0 stratum ${stratum}, ${STRATA[stratum].toLowerCase()}`,
    bandText: `COMPERA 2.0: stratum ${stratum}, ${STRATA[stratum].toLowerCase()}. Mean grade ${Math.round(mean * 100) / 100} from ${graded.length} variable${graded.length === 1 ? '' : 's'} (${graded.map((g) => `${g.variable} ${g.grade}`).join(', ')}). ${DENOMINATOR_TEXT} ${ROUNDING_TEXT} ${FC_TEXT}${bothPeptides ? ` Both peptides were supplied; ${PEPTIDE_PRECEDENCE}` : ` ${PEPTIDE_PRECEDENCE}`} ${NO_MORTALITY} ${BORROWED} This is a follow-up risk stratification and does not diagnose pulmonary arterial hypertension or select therapy.`,
    note: NOTE,
  };
}
