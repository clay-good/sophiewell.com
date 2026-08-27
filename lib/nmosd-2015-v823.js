// spec-v823: 2015 international consensus diagnostic criteria for neuromyelitis optica
// spectrum disorder.
//
// Source:
//   Wingerchuk DM, Banwell B, Bennett JL, et al. International consensus diagnostic criteria
//   for neuromyelitis optica spectrum disorders. Neurology. 2015;85(2):177-189.
//
// THE CRITERIA ARE TWO DIFFERENT RULES, chosen by antibody status, and they are not close to
// each other in strictness.
//
//   WITH AQP4-IgG:  at least ONE core clinical characteristic
//                   + a positive AQP4-IgG test by the best available method
//                   + exclusion of alternative diagnoses
//
//   WITHOUT AQP4-IgG, or with unknown status:
//                   at least TWO core clinical characteristics over one or more clinical
//                     episodes, meeting ALL of:
//                     - dissemination in space, i.e. two DIFFERENT core characteristics
//                     - at least one of them optic neuritis, acute myelitis WITH a
//                       longitudinally extensive lesion, or area postrema syndrome
//                     - the additional MRI requirement satisfied for each characteristic
//                       that carries one
//                   + exclusion of alternative diagnoses
//
// The six core clinical characteristics: optic neuritis; acute myelitis; area postrema
// syndrome; acute brainstem syndrome; symptomatic narcolepsy or acute diencephalic syndrome
// with NMOSD-typical MRI lesions; symptomatic cerebral syndrome with NMOSD-typical lesions.
//
// WHY THE ASYMMETRY MATTERS. A single episode of longitudinally extensive transverse
// myelitis in a seropositive patient is NMOSD. The identical presentation in a seronegative
// patient is NOT - the seronegative rule needs two different core characteristics. A tool
// that applied one rule to both would diagnose NMOSD in seronegative patients on evidence
// the consensus panel deliberately judged insufficient, and NMOSD is a diagnosis where
// getting it wrong runs both ways: several multiple-sclerosis disease-modifying therapies
// make NMOSD worse.
//
// Pure: no DOM, no clock, no network.

export const NMOSD_NOTE = 'The 2015 international consensus criteria for neuromyelitis optica spectrum disorder (Wingerchuk DM, Banwell B, Bennett JL, et al, Neurology 2015;85(2):177-189) are two different rules chosen by antibody status. With a positive AQP4-IgG test by the best available method, one core clinical characteristic and exclusion of alternative diagnoses are enough. Without it, or where the status is unknown, at least two core characteristics are needed across one or more episodes, they must be different from one another, at least one must be optic neuritis, acute myelitis with a longitudinally extensive lesion or area postrema syndrome, and the additional MRI requirement must be satisfied for each characteristic that carries one. The six core characteristics are optic neuritis, acute myelitis, area postrema syndrome, acute brainstem syndrome, symptomatic narcolepsy or an acute diencephalic syndrome with typical lesions, and a symptomatic cerebral syndrome with typical lesions. The gap between the two rules is the point. A single episode of longitudinally extensive transverse myelitis is enough in a seropositive patient and is not enough in a seronegative one, where two different core characteristics are required. Applying one rule to both would diagnose the disorder on evidence the panel judged insufficient, and this is a diagnosis where being wrong runs both ways, since several multiple sclerosis disease-modifying therapies make this condition worse. It applies published criteria to findings already gathered and it does not start or stop immunotherapy.';

// The four characteristics that carry an additional MRI requirement in the seronegative arm.
const CORE = [
  { arg: 'opticNeuritis', text: 'optic neuritis', qualifying: true, mriArg: 'mriOpticNerve',
    mriText: 'brain MRI normal or with only nonspecific white matter lesions, OR an optic nerve lesion over more than half the nerve length or involving the chiasm' },
  { arg: 'acuteMyelitis', text: 'acute myelitis', qualifying: 'letm', mriArg: 'mriLetm',
    mriText: 'an intramedullary lesion over 3 or more contiguous segments, or 3 or more contiguous segments of focal cord atrophy' },
  { arg: 'areaPostrema', text: 'area postrema syndrome', qualifying: true, mriArg: 'mriAreaPostrema',
    mriText: 'an associated dorsal medulla or area postrema lesion' },
  { arg: 'brainstemSyndrome', text: 'acute brainstem syndrome', qualifying: false, mriArg: 'mriBrainstem',
    mriText: 'associated periependymal brainstem lesions' },
  { arg: 'diencephalicSyndrome', text: 'symptomatic narcolepsy or acute diencephalic syndrome with NMOSD-typical MRI lesions', qualifying: false, mriArg: null },
  { arg: 'cerebralSyndrome', text: 'symptomatic cerebral syndrome with NMOSD-typical brain lesions', qualifying: false, mriArg: null },
];

const AQP4_STATES = ['positive', 'negative', 'unknown'];

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function nmosd2015(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const aqp4 = String(o.aqp4 == null ? '' : o.aqp4).trim().toLowerCase() || 'unknown';
  if (!AQP4_STATES.includes(aqp4)) {
    return { valid: false, message: 'AQP4-IgG status must be positive, negative or unknown.' };
  }

  const present = CORE.filter((c) => truthy(o[c.arg]));
  const coreCount = present.length;
  const letm = truthy(o.mriLetm);
  const excluded = truthy(o.alternativesExcluded);

  if (aqp4 === 'positive') {
    const met = coreCount >= 1 && excluded;
    const missing = [];
    if (coreCount < 1) missing.push('at least one core clinical characteristic');
    if (!excluded) missing.push('exclusion of alternative diagnoses');
    return result({
      met, arm: 'seropositive', coreCount, present, missing,
      armNote: coreCount >= 1 && excluded
        ? 'One core characteristic suffices here because AQP4-IgG is positive. The same presentation in a seronegative patient would need two different core characteristics.'
        : null,
      qualifyingNote: null, mriNote: null,
    });
  }

  // Seronegative or unknown.
  const disseminated = coreCount >= 2;
  const qualifying = present.filter((c) => c.qualifying === true || (c.qualifying === 'letm' && letm));
  const hasQualifying = qualifying.length >= 1;

  const mriUnmet = present.filter((c) => c.mriArg && !truthy(o[c.mriArg]));
  const mriSatisfied = mriUnmet.length === 0;

  const met = disseminated && hasQualifying && mriSatisfied && excluded;

  const missing = [];
  if (!disseminated) missing.push('at least two different core clinical characteristics, for dissemination in space');
  if (!hasQualifying) missing.push('at least one of optic neuritis, acute myelitis with a longitudinally extensive lesion, or area postrema syndrome');
  if (!mriSatisfied) missing.push(`the additional MRI requirement for ${mriUnmet.map((c) => c.text).join(' and ')}`);
  if (!excluded) missing.push('exclusion of alternative diagnoses');

  const armNote = coreCount === 1
    ? `Only one core characteristic is recorded. That would be enough with a positive AQP4-IgG test, but ${aqp4 === 'unknown' ? 'with an unknown antibody status' : 'without the antibody'} the criteria require two different ones. The two rules are not equally strict.`
    : null;

  const qualifyingNote = present.some((c) => c.qualifying === 'letm') && !letm && !hasQualifying
    ? 'Acute myelitis counts toward the qualifying characteristic only when the lesion is longitudinally extensive, over 3 or more contiguous segments. A short-segment myelitis does not carry that requirement.'
    : null;

  const mriNote = mriUnmet.length
    ? `Still needed: ${mriUnmet.map((c) => `for ${c.text}, ${c.mriText}`).join('; ')}.`
    : null;

  return result({ met, arm: aqp4 === 'negative' ? 'seronegative' : 'unknown antibody status', coreCount, present, missing, armNote, qualifyingNote, mriNote });
}

function result({ met, arm, coreCount, present, missing, armNote, qualifyingNote, mriNote }) {
  return {
    valid: true,
    criteriaMet: met,
    arm,
    coreCount,
    coreCharacteristics: present.map((c) => c.text),
    missing,
    armNote,
    qualifyingNote,
    mriNote,
    abnormal: met,
    bandLabel: met ? 'NMOSD criteria met' : 'NMOSD criteria not met',
    band: met
      ? `NMOSD criteria met on the ${arm} rule, with ${coreCount} core clinical characteristic${coreCount === 1 ? '' : 's'}.`
      : `NMOSD criteria not met on the ${arm} rule — outstanding: ${missing.join('; ')}.`,
    detail: 'With a positive AQP4-IgG, one core characteristic suffices. Without it, or with an unknown status, two different core characteristics are required, at least one of them optic neuritis, longitudinally extensive myelitis or area postrema syndrome, with the MRI requirement met for each characteristic that carries one.',
    note: NMOSD_NOTE,
  };
}

export { CORE };
