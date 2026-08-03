// spec-v642: Yamaguchi criteria for Adult-Onset Still's Disease (AOSD).
//
// Source (transcribed from Table 4 of the primary paper):
//   Yamaguchi M, Ohta A, Tsunematsu T, et al. Preliminary criteria for
//   classification of adult Still's disease. J Rheumatol. 1992;19(3):424-430. PMID 1578458.
//
// Unlike the sum-and-threshold classification tiles, this one COUNTS criteria
// against a dual rule and applies exclusion vetoes: classification requires
// >= 5 of the 8 criteria INCLUDING >= 2 of the 4 major criteria, AND no exclusion
// present. The four minors each collapse a clinical pair into one item: lymph-
// adenopathy and/or splenomegaly is ONE criterion, and negative RF AND negative
// ANA (both required) is ONE criterion. Sensitivity 96.2%, specificity 92.1%.
//
// Pure: no DOM, no clock, no network.

const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';

export const YAMAGUCHI_NOTE = 'Yamaguchi criteria for Adult-Onset Still’s Disease (Yamaguchi M, Ohta A, Tsunematsu T, et al, J Rheumatol 1992;19(3):424-430). Four MAJOR criteria: fever ≥ 39°C lasting ≥ 1 week; arthralgia lasting ≥ 2 weeks; typical salmon-pink macular/maculopapular nonpruritic rash appearing during fever; leukocytosis ≥ 10,000/mm³ with ≥ 80% granulocytes. Four MINOR criteria: sore throat; lymphadenopathy and/or splenomegaly; liver dysfunction (elevated transaminases/LDH); negative rheumatoid factor AND negative ANA. Classification requires ≥ 5 of the 8 criteria INCLUDING ≥ 2 major, AND the absence of every exclusion: (I) infections (especially sepsis and infectious mononucleosis), (II) malignancies (especially malignant lymphoma), (III) rheumatic diseases (especially polyarteritis nodosa and rheumatoid vasculitis). Sensitivity 96.2%, specificity 92.1%. It is a classification rule, not a diagnosis or a treatment order.';

const MAJOR = [
  { key: 'feverMajor', label: 'fever ≥ 39°C for ≥ 1 week' },
  { key: 'arthralgia', label: 'arthralgia ≥ 2 weeks' },
  { key: 'rash', label: 'typical salmon-pink rash' },
  { key: 'leukocytosis', label: 'leukocytosis ≥ 10,000 with ≥ 80% granulocytes' },
];
const MINOR = [
  { key: 'soreThroat', label: 'sore throat' },
  { key: 'lymphSpleen', label: 'lymphadenopathy and/or splenomegaly' },
  { key: 'liverDysfunction', label: 'liver dysfunction' },
  { key: 'negativeRfAna', label: 'negative RF and negative ANA' },
];
const EXCLUSIONS = [
  { key: 'exclInfection', label: 'infection (e.g. sepsis, infectious mononucleosis)' },
  { key: 'exclMalignancy', label: 'malignancy (e.g. malignant lymphoma)' },
  { key: 'exclRheumatic', label: 'other rheumatic disease (e.g. polyarteritis nodosa, rheumatoid vasculitis)' },
];

export function yamaguchiAosd(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const exclusionsPresent = EXCLUSIONS.filter((e) => onFlag(o[e.key])).map((e) => e.label);
  const majorPresent = MAJOR.filter((m) => onFlag(o[m.key])).map((m) => m.label);
  const minorPresent = MINOR.filter((m) => onFlag(o[m.key])).map((m) => m.label);
  const majorCount = majorPresent.length;
  const minorCount = minorPresent.length;
  const total = majorCount + minorCount;

  if (exclusionsPresent.length) {
    return {
      valid: true,
      excluded: true,
      majorCount,
      minorCount,
      total,
      classified: false,
      abnormal: false,
      bandLabel: 'Not classifiable',
      band: `Not classifiable — an exclusion is present (${exclusionsPresent.join('; ')}). Yamaguchi criteria require infection, malignancy, and rheumatic disease be excluded first.`,
      detail: `${total} criteria present (${majorCount} major, ${minorCount} minor), but an exclusion vetoes classification.`,
      note: YAMAGUCHI_NOTE,
    };
  }

  const classified = total >= 5 && majorCount >= 2;
  return {
    valid: true,
    excluded: false,
    majorCount,
    minorCount,
    total,
    classified,
    abnormal: classified,
    bandLabel: classified ? 'Meets Yamaguchi criteria' : 'Does not meet criteria',
    band: classified
      ? `Meets Yamaguchi criteria: ${total} criteria including ${majorCount} major (≥ 5 total with ≥ 2 major, no exclusions) — classify as adult-onset Still’s disease.`
      : `Does not meet Yamaguchi criteria: ${total} criteria present (${majorCount} major); classification needs ≥ 5 total including ≥ 2 major.`,
    detail: (total ? `Major: ${majorPresent.join(', ') || 'none'}. Minor: ${minorPresent.join(', ') || 'none'}.` : 'no criteria present.'),
    note: YAMAGUCHI_NOTE,
  };
}
