// spec-v1551 tool 4: which antimalarial WHO recommends for a pregnant woman, by trimester, severity and
// species. The dose itself is in act-weight-band-dose or severe-malaria-injectable.
//
// Source: WHO guidelines for malaria, 10 September 2026 (doi:10.2471/B09879; CC BY-NC-SA 3.0 IGO, facts
// restated, nothing reproduced). Read October 5, 2026:
//   - p. 171: the WHO first-line ACTs (artemether + lumefantrine, artesunate + amodiaquine, artesunate +
//     mefloquine, dihydroartemisinin + piperaquine, artesunate + sulfadoxine-pyrimethamine) are recommended
//     in the second and third trimesters; artesunate + SP and artesunate-pyronaridine are not for the first.
//   - section 5.2.1.4.1, pp. 182-183: first trimester (2022) artemether + lumefantrine; the other ACTs may
//     be considered where it is not available or not recommended; antifolates (so artesunate + SP) are
//     contraindicated in the first trimester; no documented first-trimester use of artesunate-pyronaridine;
//     quinine (with clindamycin) only if effective alternatives are not available (hypoglycemia in late
//     pregnancy); high-dose (5 mg) folate compromises SP; primaquine and tetracyclines not in pregnancy.
//   - section 5.2.2: injectable artesunate for severe malaria in all trimesters.
//   - section 5.2.1.5, pp. 193-194: vivax and ovale blood stage with an ACT or chloroquine (an ACT where chloroquine
//     resistance is present); chloroquine 25 mg base/kg over 3 days (10, 10, 5).
//   - section 5.2.1.7, pp. 205 and 211-212 (2015): in pregnancy and breastfeeding, weekly chloroquine chemoprophylaxis until delivery
//     and breastfeeding end, then primaquine by G6PD status; primaquine contraindicated in pregnancy and
//     while breastfeeding an infant under 1 month; tafenoquine not recommended in pregnancy or lactation.
//
// One reading stated rather than hidden: for vivax or ovale in the first trimester, the first-trimester
// ACT rule (artemether + lumefantrine first) is applied to the ACT option; the guideline states that rule
// for falciparum.
//
// Pure: no DOM, no clock.

export const TRIMESTER_OPTIONS = [
  { value: 'first', text: 'First trimester' },
  { value: 'second', text: 'Second trimester' },
  { value: 'third', text: 'Third trimester' },
];
export const SEVERITY_OPTIONS = [
  { value: 'uncomplicated', text: 'Uncomplicated' },
  { value: 'severe', text: 'Severe' },
];
export const SPECIES_OPTIONS = [
  { value: 'falciparum', text: 'P. falciparum (or mixed, or species not known)' },
  { value: 'vivax', text: 'P. vivax or P. ovale' },
];

const NOTE = 'This follows the WHO guidelines for malaria of 10 September 2026, a living guideline. Your national protocol may differ; follow it.';
const has = (opts, v) => opts.some((x) => x.value === v);

export function malariaPregnancyTreatment(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (!has(TRIMESTER_OPTIONS, o.trimester)) return { valid: false, message: 'Choose the trimester: the first trimester has its own rule.' };
  if (!has(SEVERITY_OPTIONS, o.severity)) return { valid: false, message: 'Choose whether the malaria is uncomplicated or severe.' };
  if (!has(SPECIES_OPTIONS, o.species)) return { valid: false, message: 'Choose the species: vivax and ovale need a plan for relapse.' };
  const first = o.trimester === 'first';
  const tri = TRIMESTER_OPTIONS.find((x) => x.value === o.trimester).text.toLowerCase();
  const notes = [];

  if (o.severity === 'severe') {
    notes.push('Give it for at least 24 hours and until she can take oral medicine, then a full 3-day ACT (in the first trimester, artemether + lumefantrine).');
    notes.push('IM artemether, then quinine, are only for when artesunate is not available. Quinine raises the risk of low blood sugar in late pregnancy.');
    notes.push('The dose by weight is in the severe malaria injectable dose calculator.');
    return { valid: true, band: `Severe malaria in the ${tri}: injectable artesunate, IV or IM. WHO recommends it in every trimester, for any species.`, bandLabel: 'Injectable artesunate', abnormal: true, notes, note: NOTE };
  }

  if (o.species === 'falciparum') {
    if (first) {
      notes.push('If artemether + lumefantrine is not available or not recommended locally, artesunate + amodiaquine, artesunate + mefloquine or dihydroartemisinin + piperaquine may be considered: WHO judges their outcomes better than a 7-day quinine course.');
      notes.push('Not artesunate + sulfadoxine-pyrimethamine: antifolates are contraindicated in the first trimester. Not artesunate-pyronaridine: there is no documented first-trimester use.');
      notes.push('Since 2022, quinine with clindamycin is no longer WHO\'s first-trimester choice.');
    } else {
      notes.push('With artesunate + sulfadoxine-pyrimethamine, avoid folic acid at 5 mg a day, which weakens SP; 0.4 to 0.5 mg a day is fine.');
      notes.push('Quinine with clindamycin only if no effective alternative is available: it raises the risk of low blood sugar in late pregnancy.');
    }
    notes.push('The dose by weight is in the malaria treatment dose by weight calculator; WHO makes no dose change for pregnancy.');
    return {
      valid: true,
      band: first
        ? 'Uncomplicated falciparum malaria in the first trimester: artemether + lumefantrine, WHO\'s first-trimester choice since 2022.'
        : `Uncomplicated falciparum malaria in the ${tri}: any WHO first-line ACT (artemether + lumefantrine, artesunate + amodiaquine, artesunate + mefloquine, dihydroartemisinin + piperaquine, or artesunate + sulfadoxine-pyrimethamine).`,
      bandLabel: first ? 'Artemether + lumefantrine' : 'Any first-line ACT',
      abnormal: false,
      notes,
      note: NOTE,
    };
  }

  notes.push('Chloroquine is 25 mg base/kg over 3 days: 10 mg/kg on days 1 and 2, then 5 mg/kg on day 3. Where chloroquine resistance is present, use an ACT instead.');
  if (first) notes.push('If an ACT is used in the first trimester, artemether + lumefantrine comes first, as for falciparum; artesunate + SP and artesunate-pyronaridine are not used then (this applies WHO\'s first-trimester ACT rule to vivax and ovale).');
  notes.push('Primaquine is contraindicated in pregnancy and while breastfeeding an infant under 1 month; tafenoquine is not recommended in pregnancy or breastfeeding.');
  notes.push('To prevent relapses, weekly chloroquine can be given until delivery and breastfeeding are over; then primaquine for 14 days, depending on G6PD status.');
  return {
    valid: true,
    band: `Uncomplicated vivax or ovale malaria in the ${tri}: treat the blood stage with chloroquine (where it still works) or an ACT. No primaquine or tafenoquine in pregnancy.`,
    bandLabel: 'Chloroquine or an ACT',
    abnormal: false,
    notes,
    note: NOTE,
  };
}
