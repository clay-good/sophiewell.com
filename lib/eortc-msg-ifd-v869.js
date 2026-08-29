// spec-v869: the EORTC/MSGERC consensus definitions of invasive fungal disease.
//
// Source:
//   Donnelly JP, Chen SC, Kauffman CA, et al. Revision and Update of the Consensus Definitions
//   of Invasive Fungal Disease from the European Organization for Research and Treatment of
//   Cancer and the Mycoses Study Group Education and Research Consortium.
//   Clin Infect Dis. 2020;71(6):1367-1376.
//
//   Proven   Histopathologic, cytopathologic or direct microscopic evidence of fungal invasion
//            from a normally sterile site, or a culture from a normally sterile site.
//            NO HOST FACTOR IS REQUIRED.
//   Probable A host factor AND a clinical feature AND mycological evidence. All three.
//   Possible A host factor AND a clinical feature, with no mycological evidence.
//
// "POSSIBLE" IS AN EPIDEMIOLOGIC AND RESEARCH CATEGORY, NOT A TREATMENT CATEGORY, AND THAT IS
// WHY THIS TILE EXISTS. The consensus definitions were written to make clinical trials
// comparable. They were never intended to decide whether an individual patient is treated, and
// "possible" least of all.
//
// PROBABLE NEEDS ALL THREE. Two of the three is "possible" at best, and mycological evidence on
// its own -- a galactomannan, a positive culture from a non-sterile site -- classifies nothing.
//
// PROVEN DOES NOT NEED A HOST FACTOR. Tissue invasion or a sterile-site culture stands alone.
//
// THE DEFINITIONS ASSUME AN IMMUNOCOMPROMISED HOST. A patient with no host factor cannot reach
// probable or possible under them however ill they are; ICU-acquired disease in a patient
// without a host factor is outside what these definitions were built to describe.
//
// Pure: no DOM, no clock, no network.

export const IFD_NOTE = 'The EORTC and MSGERC consensus definitions of invasive fungal disease (Donnelly and colleagues, Clinical Infectious Diseases, 2020) sort a case into proven, probable, or possible. Proven means histopathologic, cytopathologic or direct microscopic evidence of fungal invasion from a normally sterile site, or a culture from a normally sterile site, and it requires no host factor. Probable requires all three of a host factor, a clinical feature, and mycological evidence. Possible is a host factor and a clinical feature with no mycological evidence. Four things about them are worth stating plainly. Possible is an epidemiologic and research category and not a treatment category: these definitions were written to make clinical trials comparable and were never intended to decide whether an individual patient is treated. Probable needs all three components, so two of them is possible at best, and mycological evidence on its own classifies nothing. Proven needs no host factor, because tissue invasion or a sterile-site culture stands on its own. And the definitions assume an immunocompromised host, so a patient with no host factor cannot reach probable or possible under them however ill they are. It applies published research definitions to findings already recorded. It does not decide whether to start antifungal treatment.';

export const HOST_FACTORS = [
  { key: 'neutropenia', text: 'Recent neutropenia below 0.5 x 10^9/L for more than 10 days' },
  { key: 'hematologicMalignancy', text: 'Hematologic malignancy' },
  { key: 'alloHct', text: 'Allogeneic stem cell transplant' },
  { key: 'solidOrgan', text: 'Solid organ transplant' },
  { key: 'corticosteroids', text: 'Corticosteroids at 0.3 mg/kg prednisone equivalent or more for 3 weeks or more in the past 60 days' },
  { key: 'tCellSuppressants', text: 'Treatment with recognized T-cell or B-cell immunosuppressants in the past 90 days' },
  { key: 'inheritedImmunodeficiency', text: 'Inherited severe immunodeficiency' },
  { key: 'gvhd', text: 'Acute graft-versus-host disease, grade III or IV' },
];

export const CLINICAL_FEATURES = [
  { key: 'denseLesion', text: 'Dense, well-circumscribed pulmonary lesion, with or without a halo sign' },
  { key: 'airCrescent', text: 'Air-crescent sign' },
  { key: 'cavity', text: 'Pulmonary cavity' },
  { key: 'wedgeConsolidation', text: 'Wedge-shaped, segmental or lobar consolidation' },
  { key: 'tracheobronchitis', text: 'Tracheobronchial ulceration, plaque, eschar or pseudomembrane on bronchoscopy' },
  { key: 'sinonasal', text: 'Sinonasal disease with bone erosion or extension beyond the sinus' },
  { key: 'cns', text: 'Focal brain lesion on imaging, or meningeal enhancement' },
  { key: 'disseminated', text: 'Disseminated disease: chorioretinitis, or small peripheral target abscesses in liver or spleen' },
];

export const MYCOLOGICAL_EVIDENCE = [
  { key: 'directTest', text: 'Mold in sputum, lavage, bronchial brush or sinus aspirate by cytology, microscopy or culture' },
  { key: 'serumGalactomannan', text: 'Serum or plasma galactomannan at 1.0 or above' },
  { key: 'balGalactomannan', text: 'Bronchoalveolar lavage galactomannan at 1.0 or above' },
  { key: 'pairedGalactomannan', text: 'Serum galactomannan at 0.7 or above with a lavage value at 0.8 or above' },
  { key: 'aspergillusPcr', text: 'Aspergillus PCR positive on the pattern the definitions accept' },
];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

function pick(list, o) {
  return list.filter((item) => on(o[item.key]));
}

export function eortcMsgIfd(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const proven = on(o.provenEvidence);
  const hosts = pick(HOST_FACTORS, o);
  const clinical = pick(CLINICAL_FEATURES, o);
  const myco = pick(MYCOLOGICAL_EVIDENCE, o);

  const classification = proven
    ? 'proven'
    : hosts.length && clinical.length && myco.length
      ? 'probable'
      : hosts.length && clinical.length
        ? 'possible'
        : 'not-classified';

  const action = classification === 'proven'
    ? 'Proven invasive fungal disease: fungal invasion demonstrated from a normally sterile site. No host factor is required for this.'
    : classification === 'probable'
      ? 'Probable invasive fungal disease: a host factor, a clinical feature and mycological evidence are all present.'
      : classification === 'possible'
        ? 'Possible invasive fungal disease: a host factor and a clinical feature, with no mycological evidence.'
        : 'The case is not classified by these definitions from what was entered.';

  const present = `Recorded: ${hosts.length} host factor${hosts.length === 1 ? '' : 's'}, ${clinical.length} clinical feature${clinical.length === 1 ? '' : 's'}, ${myco.length} item${myco.length === 1 ? '' : 's'} of mycological evidence.`;

  // Why nothing was classified, in the terms the definitions use.
  const missing = [];
  if (classification === 'not-classified') {
    if (!hosts.length) missing.push('no host factor is recorded, and both probable and possible begin with one');
    if (!clinical.length) missing.push('no clinical feature is recorded');
    if (!hosts.length && !clinical.length && myco.length) missing.push('mycological evidence on its own classifies nothing under these definitions');
  }
  const missingNote = missing.length ? `Why: ${missing.join('; ')}.` : null;

  // The reason the tile exists, on every result.
  const researchNote = 'These are research definitions. They were written to make clinical trials comparable, not to decide whether an individual patient is treated.';

  // The category that is acted on as if it were a diagnosis.
  const possibleNote = classification === 'possible'
    ? 'Possible is an epidemiologic and research category. It is the weakest tier in the framework and is not a treatment category; a case that stops here is a case in which mycological evidence has not been obtained, not one in which disease has been established.'
    : null;

  const probableNote = classification === 'probable' || classification === 'possible'
    ? 'Probable requires all three components. Two of the three is possible at best, and mycological evidence on its own classifies nothing.'
    : null;

  const provenNote = classification === 'proven'
    ? 'Proven stands on tissue invasion or a sterile-site culture alone. Neither a host factor nor a clinical feature is needed for it, and neither adds to it.'
    : null;

  const hostNote = !hosts.length && !proven
    ? 'These definitions assume an immunocompromised host. With no host factor a case cannot reach probable or possible under them however ill the patient is, and disease acquired in intensive care without a host factor is outside what they were built to describe.'
    : null;

  const scopeNote = 'This applies published research definitions to findings already recorded. It does not decide whether to start antifungal treatment.';

  return {
    valid: true,
    classification,
    proven,
    hostFactors: hosts.map((h) => h.text),
    clinicalFeatures: clinical.map((c) => c.text),
    mycological: myco.map((m) => m.text),
    counts: { host: hosts.length, clinical: clinical.length, mycological: myco.length },
    action,
    present,
    missingNote,
    researchNote,
    possibleNote,
    probableNote,
    provenNote,
    hostNote,
    scopeNote,
    abnormal: classification !== 'not-classified',
    bandLabel: classification === 'proven' ? 'Proven' : classification === 'probable' ? 'Probable' : classification === 'possible' ? 'Possible' : 'Not classified',
    band: action,
    detail: 'Proven is fungal invasion demonstrated from a normally sterile site, or a sterile-site culture, and needs no host factor. Probable is a host factor with a clinical feature and mycological evidence, all three. Possible is a host factor with a clinical feature and no mycological evidence, and is a research category rather than a treatment one.',
    note: IFD_NOTE,
  };
}
