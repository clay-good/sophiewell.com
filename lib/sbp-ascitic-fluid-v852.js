// spec-v852: the ascitic-fluid criteria for spontaneous bacterial peritonitis.
//
// Sources:
//   Runyon BA; AASLD. Management of adult patients with ascites due to cirrhosis: update 2012.
//   Hepatology. 2013;57(4):1651-1653.
//   Sort P, Navasa M, Arroyo V, et al. Effect of intravenous albumin on renal impairment and
//   mortality in patients with cirrhosis and spontaneous bacterial peritonitis.
//   N Engl J Med. 1999;341(6):403-409.
//
//   corrected PMN = raw ascitic PMN - (ascitic red cells / 250), floored at 0
//   corrected PMN >= 250/mm^3                          neutrocytic ascites, treated as SBP
//   corrected PMN <  250 with one organism grown       bacterascites; repeat the tap
//
// A BLOODY TAP INFLATES THE COUNT, AND THAT IS WHAT THIS TILE IS FOR. Blood carries
// neutrophils, so a traumatic paracentesis raises the ascitic PMN count in proportion to the
// red cells it drags in. One PMN is subtracted per 250 red cells. Uncorrected, a bloody tap
// crosses 250 on blood alone.
//
// A NEGATIVE CULTURE DOES NOT EXCLUDE IT. Roughly two thirds of taps meeting the neutrophil
// criterion grow nothing. Culture-negative neutrocytic ascites presents the same way, carries
// the same mortality and is treated the same.
//
// IT IS THE NEUTROPHIL COUNT, NOT THE TOTAL WHITE COUNT. A total nucleated count of 500 with
// 30 percent neutrophils is 150 PMN, under the line.
//
// POLYMICROBIAL GROWTH POINTS AWAY FROM THIS DIAGNOSIS and toward secondary peritonitis, which
// is a surgical question.
//
// THE ALBUMIN CRITERIA ARE REPORTED, NOT ORDERED. The trial gave albumin where the creatinine
// was above 1 mg/dL, the urea nitrogen above 30 mg/dL OR the bilirubin above 4 mg/dL: 1.5 g/kg
// within six hours and 1 g/kg on day 3.
//
// Pure: no DOM, no clock, no network.

export const SBP_NOTE = 'The ascitic-fluid criterion for spontaneous bacterial peritonitis (Runyon BA and the American Association for the Study of Liver Diseases, Hepatology 2013;57(4):1651-1653) is a neutrophil count of 250 per cubic millimeter or more in the fluid. The count has to be corrected for blood first. Blood carries neutrophils, so a traumatic tap raises the count in proportion to the red cells it drags in, and one neutrophil is subtracted for every 250 red cells; uncorrected, a bloody tap can cross the line on blood alone. The threshold is the neutrophil count and not the total white cell count, so a total nucleated count of 500 with 30 percent neutrophils is 150 and under the line. A negative culture does not rule the infection out. About two thirds of samples meeting the neutrophil criterion grow nothing, and culture-negative neutrocytic ascites presents the same way, carries the same mortality and is managed the same as culture-positive disease. A count under 250 with a single organism grown is bacterascites, which calls for the tap to be repeated rather than for the result to be dismissed. Growth of more than one organism points away from this diagnosis and toward a perforated or inflamed viscus, which is a surgical question. The albumin figures reported here are the ones studied by Sort P, Navasa M, Arroyo V and colleagues (New England Journal of Medicine 1999;341(6):403-409), who gave 1.5 grams per kilogram within six hours and 1 gram per kilogram on day 3 where the creatinine was above 1 mg/dL, the urea nitrogen above 30 mg/dL or the bilirubin above 4 mg/dL. It applies a published fluid criterion to numbers already measured and it does not select an antibiotic, a dose or a route.';

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const THRESHOLD = 250;
const RBC_PER_PMN = 250;

export function sbpAsciticFluid(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const nucleated = num(o.nucleatedCount);
  const pmnPercent = num(o.pmnPercent);
  const pmnDirect = num(o.pmnCount);
  const rbc = num(o.redCellCount);
  const culture = typeof o.culture === 'string' ? o.culture : 'pending';
  const creatinine = num(o.creatinine);
  const bun = num(o.bun);
  const bilirubin = num(o.bilirubin);
  const weight = num(o.weight);

  // The neutrophil count may be reported directly, or as a percentage of the total nucleated
  // count. Either way the tile does the multiplication rather than letting the total stand in.
  let rawPmn = pmnDirect;
  let derivedFromPercent = false;
  if (rawPmn === null && nucleated !== null && pmnPercent !== null) {
    rawPmn = Math.round(nucleated * (pmnPercent / 100));
    derivedFromPercent = true;
  }

  if (rawPmn === null) {
    return { valid: false, message: 'Enter the ascitic neutrophil count, or the total nucleated count together with the percentage that are neutrophils.' };
  }
  if (rawPmn < 0 || rawPmn > 500000) {
    return { valid: false, message: 'The neutrophil count is outside a plausible range of 0 to 500000 per cubic millimeter.' };
  }
  if (pmnPercent !== null && (pmnPercent < 0 || pmnPercent > 100)) {
    return { valid: false, message: 'The neutrophil percentage has to be between 0 and 100.' };
  }
  if (nucleated !== null && (nucleated < 0 || nucleated > 500000)) {
    return { valid: false, message: 'The total nucleated count is outside a plausible range of 0 to 500000 per cubic millimeter.' };
  }
  if (rbc !== null && (rbc < 0 || rbc > 5000000)) {
    return { valid: false, message: 'The red cell count is outside a plausible range of 0 to 5000000 per cubic millimeter.' };
  }
  if (creatinine !== null && (creatinine < 0 || creatinine > 30)) {
    return { valid: false, message: 'The creatinine is outside a plausible range of 0 to 30 mg/dL.' };
  }
  if (bun !== null && (bun < 0 || bun > 300)) {
    return { valid: false, message: 'The urea nitrogen is outside a plausible range of 0 to 300 mg/dL.' };
  }
  if (bilirubin !== null && (bilirubin < 0 || bilirubin > 100)) {
    return { valid: false, message: 'The bilirubin is outside a plausible range of 0 to 100 mg/dL.' };
  }
  if (weight !== null && (weight < 20 || weight > 400)) {
    return { valid: false, message: 'The weight is outside a plausible range of 20 to 400 kg.' };
  }

  const bloodSubtraction = rbc !== null ? Math.round(rbc / RBC_PER_PMN) : 0;
  const correctedPmn = Math.max(0, Math.round(rawPmn) - bloodSubtraction);
  const neutrocytic = correctedPmn >= THRESHOLD;

  let state;
  let stateDetail;
  if (neutrocytic && culture === 'single') {
    state = 'spontaneous bacterial peritonitis';
    stateDetail = 'the neutrophil criterion is met and one organism has grown';
  } else if (neutrocytic && culture === 'none') {
    state = 'culture-negative neutrocytic ascites';
    stateDetail = 'the neutrophil criterion is met and nothing has grown, which is managed the same way as culture-positive disease';
  } else if (neutrocytic && culture === 'polymicrobial') {
    state = 'neutrocytic ascites with polymicrobial growth';
    stateDetail = 'the neutrophil criterion is met, but more than one organism points away from a spontaneous infection';
  } else if (neutrocytic) {
    state = 'neutrocytic ascites';
    stateDetail = 'the neutrophil criterion is met; the culture is not back';
  } else if (culture === 'single') {
    state = 'bacterascites';
    stateDetail = 'one organism has grown below the neutrophil criterion';
  } else if (culture === 'polymicrobial') {
    state = 'polymicrobial growth below the neutrophil criterion';
    stateDetail = 'more than one organism has grown below the neutrophil criterion';
  } else {
    state = 'the neutrophil criterion is not met';
    stateDetail = `the corrected count of ${correctedPmn} is below 250`;
  }

  // The error this tile exists to prevent: an uncorrected bloody tap.
  const bloodNote = bloodSubtraction > 0
    ? `The tap carried blood. ${Math.round(rawPmn)} neutrophils per cubic millimeter were reported; subtracting one for every 250 red cells removes ${bloodSubtraction}, leaving ${correctedPmn}.${Math.round(rawPmn) >= THRESHOLD && !neutrocytic ? ' Uncorrected this sample crosses 250 on blood alone.' : ''}`
    : null;

  const percentNote = derivedFromPercent
    ? `The neutrophil count is ${Math.round(rawPmn)}, taken as ${pmnPercent} percent of a total nucleated count of ${nucleated}. The threshold is the neutrophil count, not the total.`
    : null;

  const cultureNote = neutrocytic && (culture === 'none' || culture === 'pending')
    ? 'A negative or pending culture does not rule this out. About two thirds of samples meeting the neutrophil criterion grow nothing, and culture-negative neutrocytic ascites carries the same mortality and is managed the same way.'
    : null;

  const secondaryNote = culture === 'polymicrobial'
    ? 'More than one organism points away from a spontaneous infection and toward a perforated or inflamed viscus. That is a surgical question, and it is not settled by antibiotics.'
    : null;

  const bacterascitesNote = state === 'bacterascites'
    ? 'One organism below the neutrophil criterion is bacterascites. The published response is to repeat the tap rather than to dismiss the growth.'
    : null;

  // Reported, never ordered.
  const albuminTriggers = [];
  if (creatinine !== null && creatinine > 1) albuminTriggers.push(`creatinine ${creatinine} mg/dL`);
  if (bun !== null && bun > 30) albuminTriggers.push(`urea nitrogen ${bun} mg/dL`);
  if (bilirubin !== null && bilirubin > 4) albuminTriggers.push(`bilirubin ${bilirubin} mg/dL`);
  const albuminCriteriaMet = neutrocytic && albuminTriggers.length > 0;
  const albuminChecked = neutrocytic && (creatinine !== null || bun !== null || bilirubin !== null);

  let albuminNote = null;
  if (albuminCriteriaMet) {
    const doses = weight !== null
      ? ` At ${weight} kg that is ${Math.round(weight * 1.5)} g and ${Math.round(weight)} g.`
      : ' Enter a weight to see those in grams.';
    albuminNote = `The albumin criteria studied in this setting are met, on ${albuminTriggers.join(' and ')}. The regimen studied was 1.5 g per kg within six hours and 1 g per kg on day 3.${doses} That is what the trial gave; it is not an order.`;
  } else if (albuminChecked) {
    albuminNote = 'None of the albumin criteria studied in this setting are met: they are a creatinine above 1 mg/dL, a urea nitrogen above 30 mg/dL or a bilirubin above 4 mg/dL.';
  }

  const scopeNote = 'This applies a published fluid criterion to numbers already measured. It does not select an antibiotic, a dose or a route.';

  return {
    valid: true,
    rawPmn: Math.round(rawPmn),
    bloodSubtraction,
    correctedPmn,
    neutrocytic,
    state,
    stateDetail,
    culture,
    albuminCriteriaMet,
    albuminTriggers,
    bloodNote,
    percentNote,
    cultureNote,
    secondaryNote,
    bacterascitesNote,
    albuminNote,
    scopeNote,
    abnormal: neutrocytic || culture === 'single' || culture === 'polymicrobial',
    bandLabel: state,
    band: `Corrected neutrophil count ${correctedPmn} per cubic millimeter — ${state}, because ${stateDetail}.`,
    detail: 'The criterion is a corrected ascitic neutrophil count of 250 per cubic millimeter or more. The correction subtracts one neutrophil for every 250 red cells, because a bloody tap carries neutrophils in with the blood. A count at or above the line with a single organism is spontaneous bacterial peritonitis; the same count with no growth is culture-negative neutrocytic ascites and is managed the same way; a single organism below the line is bacterascites.',
    note: SBP_NOTE,
  };
}
