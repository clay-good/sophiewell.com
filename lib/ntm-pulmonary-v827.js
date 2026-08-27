// spec-v827: ATS/ERS/ESCMID/IDSA criteria for the diagnosis of nontuberculous mycobacterial
// pulmonary disease.
//
// Source:
//   Daley CL, Iaccarino JM, Lange C, et al. Treatment of nontuberculous mycobacterial
//   pulmonary disease: an official ATS/ERS/ESCMID/IDSA clinical practice guideline. Clin
//   Infect Dis. 2020;71(4):905-913 / Eur Respir J. 2020;56(1):2000535. Table 2 is encoded
//   here verbatim from the guideline.
//
// ALL THREE DOMAINS ARE REQUIRED:
//   clinical      pulmonary or systemic symptoms
//   radiologic    nodular or cavitary opacities on chest radiograph, OR a high-resolution CT
//                 showing bronchiectasis with multiple small nodules
//                 - the guideline marks the clinical and radiologic items "both required"
//   exclusion     appropriate exclusion of other diagnoses
//   microbiologic ANY ONE of:
//                 1. positive cultures from at least TWO separate expectorated sputum samples
//                 2. a positive culture from at least ONE bronchial wash or lavage
//                 3. a transbronchial or other lung biopsy with mycobacterial histologic
//                    features and a positive NTM culture, or such a biopsy plus one or more
//                    culture-positive sputum or bronchial washings
//
// THE MICROBIOLOGIC DOMAIN IS WHERE THIS GOES WRONG, IN TWO OPPOSITE DIRECTIONS.
//
//   ONE positive sputum is not enough. Two separate expectorated samples are needed, and the
//   guideline is explicit that they must grow the SAME species - or subspecies, for
//   M. abscessus. Nontuberculous mycobacteria are environmental organisms and a single
//   isolate is often contamination or transient colonisation. Treating on one culture commits
//   a patient to a year or more of multidrug therapy for something they may not have.
//
//   But ONE bronchial wash IS enough. The sputum rule does not carry across to bronchoscopic
//   samples, and applying "you need two" to a lavage withholds a diagnosis the criteria grant.
//
// AND THE GUIDELINE SAYS SO ITSELF: making this diagnosis does not, in itself, require
// starting treatment. That is unusual enough to be worth carrying in the result.
//
// Pure: no DOM, no clock, no network.

export const NTM_NOTE = 'The ATS/ERS/ESCMID/IDSA criteria for nontuberculous mycobacterial pulmonary disease (Daley CL, Iaccarino JM, Lange C, et al, Clin Infect Dis 2020;71(4):905-913) need three things together: pulmonary or systemic symptoms; nodular or cavitary opacities on a chest radiograph or a high-resolution CT showing bronchiectasis with multiple small nodules; appropriate exclusion of other diagnoses; and one of three microbiologic routes. Those routes are positive cultures from at least two separate expectorated sputum samples, or a positive culture from at least one bronchial wash or lavage, or a lung biopsy with mycobacterial histologic features together with a positive culture from the biopsy or from sputum or washings. The microbiologic part goes wrong in two opposite directions. One positive sputum is not enough, and the two samples must grow the same species, or subspecies in the case of Mycobacterium abscessus, because these are environmental organisms and a single isolate is often contamination or transient colonisation; treating on one culture commits someone to a year or more of multidrug therapy for a disease they may not have. But one bronchial wash is enough on its own, so applying the two-sample rule to a lavage withholds a diagnosis the criteria grant. The guideline also states that making this diagnosis does not in itself require starting treatment. It applies published criteria to results already obtained and it does not choose or start an antimycobacterial regimen.';

export const SPUTUM_REQUIRED = 2;
export const MAX_SAMPLES = 100;

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function ntmPulmonary(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const sputum = num(o.positiveSputumCultures);
  if (sputum !== null && (sputum < 0 || sputum > MAX_SAMPLES)) {
    return { valid: false, message: `Positive sputum cultures must be between 0 and ${MAX_SAMPLES}.` };
  }

  const symptoms = truthy(o.pulmonarySymptoms);
  const radiology = truthy(o.nodularOrCavitary) || truthy(o.hrctBronchiectasis);
  const excluded = truthy(o.alternativesExcluded);

  const sameSpecies = truthy(o.sameSpecies);
  const bronchialWash = truthy(o.bronchialWashPositive);
  const biopsy = truthy(o.biopsyHistology) && (truthy(o.biopsyCulturePositive) || truthy(o.anyCulturePositive));

  const sputumRoute = sputum !== null && sputum >= SPUTUM_REQUIRED && sameSpecies;

  const routes = [];
  if (sputumRoute) routes.push(`${sputum} separate expectorated sputum cultures growing the same species`);
  if (bronchialWash) routes.push('a positive bronchial wash or lavage culture');
  if (biopsy) routes.push('a lung biopsy with mycobacterial histologic features and a positive culture');

  const microbiologic = routes.length >= 1;
  const met = symptoms && radiology && excluded && microbiologic;

  // The single-sputum error, which is the one that starts a year of therapy wrongly.
  const singleSputumNote = sputum === 1 && !bronchialWash && !biopsy
    ? `One positive sputum culture does not satisfy the microbiologic criterion, which asks for at least ${SPUTUM_REQUIRED} separate expectorated samples. These are environmental organisms and a single isolate is often contamination or transient colonisation.`
    : null;

  // The same-species requirement, which a raw count hides.
  const speciesNote = sputum !== null && sputum >= SPUTUM_REQUIRED && !sameSpecies
    ? `${sputum} positive sputum cultures are recorded but not confirmed as the same species. The guideline asks for the same species, or the same subspecies for M. abscessus, across the samples.`
    : null;

  // The opposite error: demanding two of a lavage.
  const washNote = bronchialWash
    ? 'A single bronchial wash or lavage culture satisfies the microbiologic criterion on its own. The two-sample rule applies to expectorated sputum and does not carry across to bronchoscopic samples.'
    : null;

  const treatmentNote = met
    ? 'The guideline states that making this diagnosis does not, in itself, require starting treatment. That decision turns on species, disease severity, progression and the patient.'
    : null;

  const missing = [];
  if (!symptoms) missing.push('pulmonary or systemic symptoms');
  if (!radiology) missing.push('nodular or cavitary opacities on radiograph, or HRCT bronchiectasis with multiple small nodules');
  if (!excluded) missing.push('appropriate exclusion of other diagnoses');
  if (!microbiologic) missing.push('one of the three microbiologic routes');

  return {
    valid: true,
    criteriaMet: met,
    domains: { clinical: symptoms, radiologic: radiology, exclusion: excluded, microbiologic },
    microbiologicRoutes: routes,
    singleSputumNote,
    speciesNote,
    washNote,
    treatmentNote,
    missing,
    abnormal: met,
    bandLabel: met ? 'NTM pulmonary disease criteria met' : 'Criteria not met',
    band: met
      ? `Criteria for nontuberculous mycobacterial pulmonary disease met, on ${routes.join(' and ')}.`
      : `Criteria for nontuberculous mycobacterial pulmonary disease not met — outstanding: ${missing.join('; ')}.`,
    detail: `Clinical, radiologic, exclusion and microbiologic domains are all required. The microbiologic domain takes any ONE of: ${SPUTUM_REQUIRED} or more separate expectorated sputum cultures of the same species; one bronchial wash or lavage; or a lung biopsy with mycobacterial histologic features plus a positive culture. Patients who do not meet the criteria should be followed until the diagnosis is firmly established or excluded.`,
    note: NTM_NOTE,
  };
}
