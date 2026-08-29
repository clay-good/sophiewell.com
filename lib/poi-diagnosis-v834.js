// spec-v834: diagnosis of premature ovarian insufficiency, following the 2024 ESHRE
// guideline algorithm.
//
// Source:
//   ESHRE Guideline Group on POI. Evidence-based guideline: premature ovarian insufficiency.
//   Hum Reprod Open. 2024;2024(4):hoae065. Algorithm and wording taken from the guideline's
//   own healthcare-professional toolkit.
//
// THE ALGORITHM, in a woman aged under 40:
//   Step 1  bilateral oophorectomy = a diagnosis of POI, WITH NO FURTHER TESTING NEEDED.
//           Otherwise: menstrual disturbance, amenorrhea or oligomenorrhea, for at least
//           4 months.
//   Step 2  a pregnancy test, and an FSH concentration.
//           FSH above 25 IU/L WITH oligo- or amenorrhea for at least 4 months = diagnosis.
//
// FOUR THINGS THE GUIDELINE SAYS THAT TOOLS ROUTINELY DROP:
//
//   1. Bilateral oophorectomy under 40 IS the diagnosis. Asking for an FSH there orders a
//      test that cannot change the answer.
//   2. Hormonal therapy cuts both ways. It can CONCEAL the menstrual disturbance or cause
//      amenorrhea itself, and it can LOWER the FSH - a combined oral contraceptive should be
//      stopped for at least two to six weeks before the FSH is measured. An FSH drawn on the
//      pill can under-call the diagnosis.
//   3. FSH does not have to be timed to a particular day of the cycle. That is a common and
//      costly misconception.
//   4. The diagnosis is NOT based on estradiol, and ultrasound is NOT required. A low
//      estradiol adds confirmation; a normal antral follicle count does not exclude anything.
//      Anti-Mullerian hormone should not be the primary diagnostic test.
//
// ONE POINT WHERE SOURCES DIFFER, AND THIS TILE SAYS SO RATHER THAN CHOOSING SILENTLY.
// The 2016 ESHRE guideline asked for a raised FSH on TWO occasions at least four weeks apart.
// The 2024 algorithm states the diagnosis on a raised FSH with the menstrual criterion and
// does not repeat that requirement in its algorithm. Because ovarian activity fluctuates and
// FSH can fall back into the normal range, the repeat is clinically meaningful whichever
// wording is followed - so the tile reports the diagnosis on the 2024 algorithm AND notes
// whether a confirmatory second sample has been taken.
//
// Pure: no DOM, no clock, no network.

export const POI_NOTE = 'The 2024 ESHRE guideline on premature ovarian insufficiency (Hum Reprod Open 2024;2024(4):hoae065) diagnoses the condition in a woman under forty from menstrual disturbance, meaning amenorrhea or oligomenorrhea for at least four months, together with a follicle stimulating hormone concentration above 25 international units per liter. Bilateral oophorectomy under forty is itself the diagnosis and needs no further testing, so asking for a hormone level there orders a test that cannot change the answer. Four points are routinely dropped. Hormonal therapy cuts both ways, since it can conceal the menstrual disturbance or cause amenorrhea itself and can also lower the hormone level, so a combined oral contraceptive should be stopped for two to six weeks before measuring it and a level drawn on the pill can under-call the diagnosis. The blood test does not need to be timed to a particular day of the cycle. The diagnosis does not rest on estradiol, although a low level adds confirmation, and ultrasound is not required. And anti-Mullerian hormone should not be the primary diagnostic test. One point differs between guideline versions: the 2016 guideline asked for a raised level on two occasions at least four weeks apart, while the 2024 algorithm states the diagnosis without repeating that requirement. Because ovarian activity fluctuates and the level can fall back into the normal range, a confirmatory second sample remains clinically meaningful either way, so this tile reports the diagnosis on the current algorithm and says whether one has been taken. It applies published criteria to results already obtained and it does not start hormone replacement or arrange fertility counseling.';

export const FSH_THRESHOLD = 25;      // IU/L, above
export const MONTHS_REQUIRED = 4;     // of oligo- or amenorrhea
export const AGE_LIMIT = 40;          // years, under

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function poiDiagnosis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const age = num(o.age);
  const fsh = num(o.fsh);
  const months = num(o.monthsOfDisturbance);
  if (age !== null && (age < 0 || age > 120)) return { valid: false, message: 'Age must be between 0 and 120 years.' };
  if (fsh !== null && (fsh < 0 || fsh > 1000)) return { valid: false, message: 'FSH must be between 0 and 1000 IU/L.' };
  if (months !== null && (months < 0 || months > 600)) return { valid: false, message: 'Months of menstrual disturbance is out of range.' };

  const underAge = age !== null && age < AGE_LIMIT;
  const oophorectomy = truthy(o.bilateralOophorectomy);
  const menstrualCriterion = months !== null && months >= MONTHS_REQUIRED;
  const fshRaised = fsh !== null && fsh > FSH_THRESHOLD;
  const onHormones = truthy(o.onHormonalTherapy);
  const repeatConfirmed = truthy(o.repeatFshConfirmed);

  let diagnosis = false;
  let route = null;
  if (underAge && oophorectomy) {
    diagnosis = true;
    route = 'bilateral oophorectomy under 40, which is itself the diagnosis';
  } else if (underAge && menstrualCriterion && fshRaised) {
    diagnosis = true;
    route = `${months} months of menstrual disturbance with an FSH of ${fsh} IU/L`;
  }

  // The test that cannot change the answer.
  const oophorectomyNote = underAge && oophorectomy
    ? 'Bilateral oophorectomy under 40 is the diagnosis on its own. The guideline states no further testing is needed, so an FSH here cannot change the answer.'
    : null;

  // Hormonal therapy, which cuts both ways.
  const hormoneNote = onHormones
    ? (fsh !== null && !fshRaised
      ? `Hormonal therapy is recorded and the FSH is ${fsh} IU/L. Some hormonal therapy lowers FSH, and a combined oral contraceptive should be stopped for at least two to six weeks before the FSH is measured. A level drawn on treatment can under-call the diagnosis.`
      : 'Hormonal therapy is recorded. It can conceal the menstrual disturbance or cause amenorrhea itself, and it can lower the FSH; a combined oral contraceptive should be stopped for two to six weeks before the FSH is measured.')
    : null;

  // The version difference, stated rather than chosen.
  const repeatNote = diagnosis && route && route.includes('FSH') && !repeatConfirmed
    ? 'The 2016 guideline asked for a raised FSH on two occasions at least four weeks apart; the 2024 algorithm states the diagnosis without repeating that requirement. No confirmatory second sample is recorded here. Ovarian activity fluctuates and the FSH can fall back into the normal range, so a repeat remains clinically meaningful either way.'
    : null;

  // Things that do not decide it.
  const notDiagnosticNote = truthy(o.estradiolLow) || truthy(o.ultrasoundDone) || truthy(o.amhLow)
    ? 'The diagnosis does not rest on estradiol, ultrasound or anti-Mullerian hormone. A low estradiol adds confirmation and a small ovarian volume or low antral follicle count is supportive, but none of these is required and anti-Mullerian hormone should not be the primary diagnostic test.'
    : null;

  const ageNote = age !== null && age >= AGE_LIMIT
    ? `Premature ovarian insufficiency is defined under ${AGE_LIMIT} years of age. At ${age}, these criteria do not apply.`
    : null;

  const missing = [];
  if (age === null) missing.push('the age');
  else if (!underAge) missing.push(`an age under ${AGE_LIMIT}`);
  if (!oophorectomy) {
    if (!menstrualCriterion) missing.push(`at least ${MONTHS_REQUIRED} months of amenorrhea or oligomenorrhea`);
    if (!fshRaised) missing.push(`an FSH above ${FSH_THRESHOLD} IU/L`);
  }

  return {
    valid: true,
    diagnosis,
    route,
    underAge,
    menstrualCriterion,
    fshRaised,
    oophorectomyNote,
    hormoneNote,
    repeatNote,
    notDiagnosticNote,
    ageNote,
    missing,
    abnormal: diagnosis,
    bandLabel: diagnosis ? 'Premature ovarian insufficiency' : 'Criteria not met',
    band: diagnosis
      ? `Premature ovarian insufficiency — ${route}.`
      : `Criteria for premature ovarian insufficiency not met — outstanding: ${missing.join('; ')}.`,
    detail: `Under ${AGE_LIMIT} years: bilateral oophorectomy is the diagnosis with no further testing; otherwise at least ${MONTHS_REQUIRED} months of amenorrhea or oligomenorrhea with an FSH above ${FSH_THRESHOLD} IU/L. FSH does not need timing to a cycle day. Estradiol, ultrasound and anti-Mullerian hormone are not diagnostic.`,
    note: POI_NOTE,
  };
}
