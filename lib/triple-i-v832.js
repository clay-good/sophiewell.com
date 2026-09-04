// spec-v832: the NICHD 2015 "Triple I" framework for intrauterine inflammation, infection,
// or both - the graded replacement for the term clinical chorioamnionitis.
//
// Source:
//   Higgins RD, Saade G, Polin RA, et al. Evaluation and Management of Women and Newborns
//   With a Maternal Diagnosis of Chorioamnionitis: Summary of a Workshop. Obstet Gynecol.
//   2016;127(3):426-436. (The 2015 Eunice Kennedy Shriver National Institute of Child Health
//   and Human Development workshop.)
//
// THREE GRADED CATEGORIES, NOT ONE LABEL:
//
//   ISOLATED MATERNAL FEVER
//     a single temperature of 39.0 C or more, OR two temperatures of 38.0 to 38.9 C taken
//     at least 30 minutes apart, with no clear alternative source.
//     THIS IS NOT AN INFECTION DIAGNOSIS. It is its own category.
//
//   SUSPECTED TRIPLE I
//     maternal fever plus at least one of: fetal tachycardia above 160 beats per minute;
//     a maternal white cell count above 15,000 per mm3 in the absence of recent
//     corticosteroids; purulent fluid from the cervical os.
//
//   CONFIRMED TRIPLE I
//     suspected Triple I plus at least one of: a positive amniotic fluid Gram stain; a low
//     amniotic fluid glucose or a positive amniotic fluid culture; histologic evidence of
//     infection on placental pathology.
//
// THE POINT OF THE WHOLE FRAMEWORK IS THE FIRST CATEGORY. Before 2015, isolated intrapartum
// fever was routinely labelled chorioamnionitis, which committed the mother to antibiotics
// and the newborn to a sepsis evaluation. Separating fever from infection was the reform. A
// tool that reported fever alone as chorioamnionitis would undo it.
//
// TWO SMALLER THINGS THAT GET DROPPED:
//   * The fever definition itself has two routes, and a single reading of 38.5 C satisfies
//     NEITHER. One reading counts only at 39.0 C or above; below that it takes two, at least
//     30 minutes apart.
//   * The white cell criterion is void after recent corticosteroids, because betamethasone
//     raises the count on its own - and antenatal steroids are common in exactly this group.
//
// Pure: no DOM, no clock, no network.

export const TRIPLE_I_NOTE = 'The Triple I framework from the 2015 National Institute of Child Health and Human Development workshop (Higgins RD, Saade G, Polin RA, et al, Obstet Gynecol 2016;127(3):426-436) replaced the single label of clinical chorioamnionitis with three graded categories. Isolated maternal fever means one temperature of 39.0 degrees Celsius or more, or two readings between 38.0 and 38.9 taken at least thirty minutes apart, with no clear alternative source; it is a category in its own right and not an infection diagnosis. Suspected Triple I is that fever plus at least one of fetal tachycardia above 160 beats a minute, a maternal white cell count above fifteen thousand per cubic millimeter in the absence of recent corticosteroids, or purulent fluid from the cervical os. Confirmed Triple I adds a positive amniotic fluid Gram stain, a low amniotic fluid glucose or positive culture, or histologic evidence of infection in the placenta. The first category is the point of the reform: before this, isolated intrapartum fever was routinely called chorioamnionitis, which committed the mother to antibiotics and the newborn to a sepsis evaluation, and separating fever from infection was the whole change. Two smaller things get dropped. A single reading of 38.5 satisfies neither route to fever, since one reading counts only at 39.0 or above and below that it takes two thirty minutes apart. And the white cell criterion is void after recent corticosteroids, because betamethasone raises the count by itself and antenatal steroids are common in this very group. It applies published criteria to findings already gathered and it does not start or withhold antibiotics, nor decide on a neonatal sepsis evaluation.';

export const FEVER_SINGLE = 39.0;    // degrees Celsius, at or above, one reading
export const FEVER_REPEAT = 38.0;    // degrees Celsius, at or above, two readings 30 min apart
export const WBC_THRESHOLD = 15000;  // per mm3, above
export const FHR_THRESHOLD = 160;    // bpm, above

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function tripleI(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let temp = num(o.temperature);
  const unit = String(o.temperatureUnit == null ? '' : o.temperatureUnit).trim().toLowerCase() || 'c';
  if (!['c', 'f'].includes(unit)) return { valid: false, message: 'Temperature unit must be c or f.' };
  if (temp !== null) {
    // Celsius and Fahrenheit interconvert exactly, unlike some paired clinical thresholds.
    if (unit === 'f') temp = (temp - 32) * 5 / 9;
    if (temp < 25 || temp > 46) return { valid: false, message: 'Temperature is out of physiological range.' };
  }

  const wbc = num(o.whiteCellCount);
  const fhr = num(o.fetalHeartRate);
  if (wbc !== null && (wbc < 0 || wbc > 500000)) return { valid: false, message: 'White cell count is out of range.' };
  if (fhr !== null && (fhr < 0 || fhr > 400)) return { valid: false, message: 'Fetal heart rate is out of range.' };

  // spec-v1063: the temperature is this framework's entry condition -- every
  // category begins with fever -- so with it blank the tile was answering "No
  // category met on these entries", a rule-out built on the one reading nobody
  // had taken.
  if (temp === null) {
    return { valid: false, message: 'Enter a maternal temperature. Every category here begins with fever, so without one there is nothing to classify either way.' };
  }

  const repeated = truthy(o.repeatedAfter30Min);
  const altSource = truthy(o.alternativeSource);

  // Fever, by either route.
  const singleRoute = temp !== null && temp >= FEVER_SINGLE;
  const repeatRoute = temp !== null && temp >= FEVER_REPEAT && temp < FEVER_SINGLE && repeated;
  const fever = (singleRoute || repeatRoute) && !altSource;

  const feverNote = temp !== null && temp >= FEVER_REPEAT && temp < FEVER_SINGLE && !repeated
    ? `A single reading of ${Number(temp.toFixed(1))} C does not meet either route to fever. One reading counts only at ${FEVER_SINGLE.toFixed(1)} C or above; between ${FEVER_REPEAT.toFixed(1)} and ${(FEVER_SINGLE - 0.1).toFixed(1)} it takes two readings at least 30 minutes apart.`
    : null;

  const altNote = altSource && (singleRoute || repeatRoute)
    ? 'A clear alternative source for the fever is recorded, and the definition requires its absence. This is not isolated maternal fever by these criteria.'
    : null;

  // Suspected, criterion 2.
  const steroids = truthy(o.recentCorticosteroids);
  const wbcCounts = wbc !== null && wbc > WBC_THRESHOLD && !steroids;
  const supporting = [];
  if (fhr !== null && fhr > FHR_THRESHOLD) supporting.push(`fetal tachycardia at ${fhr} beats per minute`);
  if (wbcCounts) supporting.push(`a white cell count of ${wbc} per mm3`);
  if (truthy(o.purulentDischarge)) supporting.push('purulent fluid from the cervical os');

  const steroidNote = wbc !== null && wbc > WBC_THRESHOLD && steroids
    ? `A white cell count of ${wbc} per mm3 is above the threshold but is NOT counted here: the criterion requires the absence of recent corticosteroids, and betamethasone raises the count on its own.`
    : null;

  // spec-v1063: a supporting feature nobody measured is not a feature that is
  // absent. With the fetal heart rate blank the tile still concluded "fever
  // without any of the supporting features" -- and since one supporting feature
  // is all that separates isolated fever from suspected Triple I, that sentence
  // ruled out the diagnosis on an unmeasured value.
  const unassessed = [];
  if (fhr === null) unassessed.push('a fetal heart rate');
  if (wbc === null) unassessed.push('a maternal white cell count');

  const suspected = fever && supporting.length >= 1;

  // Confirmed.
  const confirmatory = [];
  if (truthy(o.positiveGramStain)) confirmatory.push('a positive amniotic fluid Gram stain');
  if (truthy(o.lowGlucoseOrCulture)) confirmatory.push('a low amniotic fluid glucose or a positive culture');
  if (truthy(o.placentalHistology)) confirmatory.push('histologic evidence of infection in the placenta');
  const confirmed = suspected && confirmatory.length >= 1;

  let category = null;
  if (confirmed) category = 'Confirmed Triple I';
  else if (suspected) category = 'Suspected Triple I';
  else if (fever) category = 'Isolated maternal fever';

  const reformNote = category === 'Isolated maternal fever'
    ? 'This is isolated maternal fever, which is a category in its own right and NOT an infection diagnosis. Separating it from Triple I was the point of the 2015 framework: fever alone used to be labelled chorioamnionitis, committing the mother to antibiotics and the newborn to a sepsis evaluation.'
    : null;

  return {
    valid: true,
    category,
    fever,
    suspected,
    confirmed,
    supportingFeatures: supporting,
    unassessedSupporting: unassessed,
    confirmatoryFeatures: confirmatory,
    temperatureCelsius: temp === null ? null : Number(temp.toFixed(1)),
    feverNote,
    altNote,
    steroidNote,
    reformNote,
    abnormal: !!category,
    bandLabel: category || 'No category met',
    band: category
      ? (confirmed
        ? `Confirmed Triple I — ${supporting.join(', ')}, with ${confirmatory.join(' and ')}.`
        : (suspected
          ? `Suspected Triple I — maternal fever with ${supporting.join(', ')}.`
          : (unassessed.length
            ? `Isolated maternal fever on what has been entered — but ${unassessed.join(' and ')} ${unassessed.length > 1 ? 'were' : 'was'} not entered, and either could make this suspected Triple I instead.`
            : 'Isolated maternal fever — fever without any of the supporting features.')))
      : 'No category met on these entries.',
    detail: `Isolated maternal fever is one reading at ${FEVER_SINGLE.toFixed(1)} C or above, or two between ${FEVER_REPEAT.toFixed(1)} and ${(FEVER_SINGLE - 0.1).toFixed(1)} at least 30 minutes apart, with no alternative source. Suspected Triple I adds one of fetal tachycardia above ${FHR_THRESHOLD}, a white cell count above ${WBC_THRESHOLD} without recent corticosteroids, or purulent cervical fluid. Confirmed adds amniotic fluid or placental evidence.`,
    note: TRIPLE_I_NOTE,
  };
}
