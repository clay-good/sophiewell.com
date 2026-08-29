// spec-v859: classifying priapism from the cavernous blood gas.
//
// Source:
//   Bivalacqua TJ, Allen BK, Brock GB, et al. The diagnosis and management of recurrent
//   ischemic priapism, priapism in sickle cell patients, and non-ischemic priapism: an AUA/SMSNA
//   guideline. J Urol. 2022;208(1):43-52.
//
//   Cavernous blood gas, drawn from the corpus cavernosum:
//
//     ischemic      pO2 under 30 mmHg    pCO2 over 60 mmHg    pH under 7.25
//     non-ischemic  pO2 over 90 mmHg     pCO2 under 40 mmHg   pH about 7.40
//
//   When the gas is discordant, color duplex ultrasound decides: absent or minimal cavernosal
//   arterial flow is ischemic, normal or high flow is non-ischemic.
//
// THE TWO TYPES ARE OPPOSITE EMERGENCIES, AND THAT IS WHY THIS TILE EXISTS. Ischemic priapism is
// a compartment syndrome of the corpora and needs decompression now. Non-ischemic priapism is an
// unregulated arterial inflow that is not ischemic at all, and aspirating it or injecting a
// sympathomimetic treats the wrong disease.
//
// A TRAUMA HISTORY DOES NOT CLASSIFY THE EPISODE. Perineal or straddle trauma is the classic
// story for the non-ischemic type, and it is the classic reason an ischemic episode gets watched
// instead of decompressed. The gas decides; the history only raises the question.
//
// THE DURATION IS THE PROGNOSIS. Past 4 hours an ischemic episode is a compartment syndrome;
// smooth-muscle necrosis begins around 24 hours; past 36 hours erectile function is rarely
// preserved and the intervention is for pain and detumescence rather than for potency.
//
// SICKLE CELL DISEASE DOES NOT CHANGE THE ACUTE TREATMENT. Hydration, oxygen, analgesia and
// exchange transfusion are systemic care; the guideline is explicit that they must not delay or
// replace local intervention.
//
// Pure: no DOM, no clock, no network.

export const PRIAPISM_NOTE = 'The AUA and SMSNA guideline (J Urol, 2022) separates priapism into two types that are treated in opposite directions, and the cavernous blood gas is what separates them. Blood drawn from the corpus cavernosum with a pO2 under 30 mmHg, a pCO2 over 60 mmHg and a pH under 7.25 is ischemic: a closed, acidotic, hypoxic compartment. Blood with a pO2 over 90 mmHg, a pCO2 under 40 mmHg and a pH near 7.40 looks like arterial blood because it is arterial blood, and the episode is non-ischemic. Ischemic priapism is a compartment syndrome of the erectile tissue and is decompressed now, by aspiration and irrigation with an intracavernosal sympathomimetic. Non-ischemic priapism is an unregulated arterial inflow, is not painful, is not ischemic, and is not an emergency; aspiration and a sympathomimetic treat the wrong disease. Three things go wrong in practice. A history of perineal or straddle trauma is the classic story for the non-ischemic type and the classic reason an ischemic episode gets watched instead of decompressed, so the gas classifies the episode and the history only raises the question. The duration is the prognosis: past 4 hours an ischemic episode is a compartment syndrome, smooth-muscle necrosis begins around 24 hours, and past 36 hours erectile function is rarely preserved. And sickle cell disease does not change the acute treatment, because hydration, oxygen, analgesia and exchange transfusion are systemic care that must not delay or replace the local intervention. Where the gas is discordant, color duplex ultrasound decides, and where nothing decides the episode is handled as ischemic until it is shown not to be. It classifies an episode from measurements already taken. It does not choose a drug, a dose, a shunt, or an embolization.';

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function pick(v) {
  return v === 'yes' || v === true ? 'yes' : v === 'no' || v === false ? 'no' : null;
}

const RANGES = [
  ['po2', 'cavernous pO2', 0, 700, 'mmHg'],
  ['pco2', 'cavernous pCO2', 0, 250, 'mmHg'],
  ['ph', 'cavernous pH', 6, 8, ''],
  ['hours', 'duration', 0, 2000, 'hours'],
];

// The hour bands are the prognosis, not a schedule. Each is stated on ischemic and on
// undetermined episodes, because an undetermined one is handled as ischemic.
function clockFor(hours) {
  if (hours === null) return 'The duration decides how much erectile tissue is still salvageable, so enter it. Past 4 hours an ischemic episode is a compartment syndrome, necrosis of the cavernous smooth muscle begins around 24 hours, and past 36 hours erectile function is rarely preserved.';
  if (hours < 4) return `At ${hours} hours this is inside the window before an ischemic episode becomes a compartment syndrome. That window is short and it is not a reason to wait: the clock is already running.`;
  if (hours < 24) return `At ${hours} hours an ischemic episode is a compartment syndrome of the erectile tissue. Necrosis of the cavernous smooth muscle begins around 24 hours, so the time still available is measured in hours.`;
  if (hours < 36) return `At ${hours} hours an ischemic episode is past the point where necrosis of the cavernous smooth muscle begins. Detumescence is still the goal and erectile function is already at risk.`;
  return `At ${hours} hours an ischemic episode is past 36 hours, and erectile function is rarely preserved from here. Intervention is still indicated, for pain and for detumescence, but it is no longer being done for potency.`;
}

export function priapismGas(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  for (const [key, label, lo, hi, unit] of RANGES) {
    const n = num(o[key]);
    if (n !== null && (n < lo || n > hi)) {
      return { valid: false, message: `The ${label} is outside a plausible range of ${lo} to ${hi}${unit ? ` ${unit}` : ''}.` };
    }
  }

  const po2 = num(o.po2);
  const pco2 = num(o.pco2);
  const ph = num(o.ph);
  const hours = num(o.hours);
  const flow = o.flow === 'absent' || o.flow === 'normal' ? o.flow : null;
  const trauma = pick(o.trauma);
  const sickle = pick(o.sickle);

  const gasComplete = po2 !== null && pco2 !== null && ph !== null;

  if (!gasComplete && flow === null) {
    return { valid: false, message: 'Enter the cavernous blood gas — pO2, pCO2 and pH from blood drawn from the corpus cavernosum — or the color duplex finding.' };
  }

  const ischemicGas = gasComplete && po2 < 30 && pco2 > 60 && ph < 7.25;
  const nonIschemicGas = gasComplete && po2 > 90 && pco2 < 40 && ph >= 7.35;
  const discordant = gasComplete && !ischemicGas && !nonIschemicGas;

  let type;
  let basis;
  if (ischemicGas) {
    type = 'ischemic';
    basis = `the cavernous gas: pO2 ${po2} mmHg, pCO2 ${pco2} mmHg, pH ${ph}`;
  } else if (nonIschemicGas) {
    type = 'non-ischemic';
    basis = `the cavernous gas: pO2 ${po2} mmHg, pCO2 ${pco2} mmHg, pH ${ph}`;
  } else if (flow === 'absent') {
    type = 'ischemic';
    basis = 'color duplex, which found absent or minimal cavernosal arterial flow';
  } else if (flow === 'normal') {
    type = 'non-ischemic';
    basis = 'color duplex, which found normal or high cavernosal arterial flow';
  } else {
    type = 'undetermined';
    basis = 'neither the gas nor a duplex study';
  }

  const label = type === 'ischemic' ? 'Ischemic priapism'
    : type === 'non-ischemic' ? 'Non-ischemic priapism'
      : 'Type not established';

  const state = type === 'undetermined'
    ? 'the type is not established by what has been entered, so it is handled as ischemic until it is shown not to be'
    : `${type} priapism, from ${basis}`;

  const treatedAsIschemic = type === 'ischemic' || type === 'undetermined';

  const typeNote = type === 'ischemic'
    ? 'Ischemic priapism is a compartment syndrome of the erectile tissue. It is decompressed rather than observed, and the two types are treated in opposite directions.'
    : type === 'non-ischemic'
      ? 'Non-ischemic priapism is an unregulated arterial inflow. It is not ischemic, it is usually not painful, and it is not an emergency. Aspiration and an intracavernosal sympathomimetic treat the other type and are not the treatment here.'
      : 'Until the type is established the episode is handled as ischemic, because that is the one where waiting costs erectile tissue.';

  // The discordance rule: an in-between gas is exactly where a duplex is owed.
  const discordantNote = discordant
    ? `The gas is discordant: pO2 ${po2} mmHg, pCO2 ${pco2} mmHg and pH ${ph} match neither the ischemic set (pO2 under 30, pCO2 over 60, pH under 7.25) nor the non-ischemic set (pO2 over 90, pCO2 under 40, pH near 7.40). That is where color duplex decides — absent or minimal cavernosal flow is ischemic, normal or high flow is non-ischemic.${flow ? '' : ' No duplex finding was entered.'}`
    : null;

  // The over-call this tile exists to prevent, and its mirror.
  const traumaNote = trauma === 'yes'
    ? (type === 'non-ischemic'
      ? 'The trauma history fits the non-ischemic type, but it is the gas above that classified this, not the history.'
      : 'A history of perineal or straddle trauma is the classic story for the non-ischemic type, and it is the classic reason an ischemic episode is watched instead of decompressed. It does not classify the episode. What is entered here does not read as non-ischemic.')
    : null;

  const sickleNote = sickle === 'yes' && treatedAsIschemic
    ? 'Sickle cell disease does not change the acute treatment. Hydration, oxygen, analgesia and exchange transfusion are systemic care, and the guideline is explicit that they must not delay or replace the local intervention.'
    : null;

  const clockNote = treatedAsIschemic ? clockFor(hours) : null;

  const scopeNote = 'This classifies an episode from measurements already taken. It does not choose a drug, a dose, a shunt, or an embolization, and it is not a substitute for urgent urological assessment.';

  return {
    valid: true,
    type,
    basis,
    hours,
    ischemicGas,
    nonIschemicGas,
    discordant,
    treatedAsIschemic,
    state,
    typeNote,
    discordantNote,
    traumaNote,
    sickleNote,
    clockNote,
    scopeNote,
    abnormal: treatedAsIschemic,
    bandLabel: label,
    band: type === 'undetermined'
      ? `${label} — handled as ischemic until it is shown not to be.`
      : `${label}, from ${basis}.`,
    detail: 'Blood drawn from the corpus cavernosum with a pO2 under 30 mmHg, a pCO2 over 60 mmHg and a pH under 7.25 is ischemic. A pO2 over 90 mmHg, a pCO2 under 40 mmHg and a pH near 7.40 is non-ischemic. A gas in between is settled by color duplex: absent or minimal cavernosal arterial flow is ischemic, normal or high flow is non-ischemic.',
    note: PRIAPISM_NOTE,
  };
}
