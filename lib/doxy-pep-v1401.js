// spec-v1401: doxycycline postexposure prophylaxis (doxy-PEP) for bacterial STI prevention -- CDC 2024.
//
// Source: Bachmann LH, et al. CDC Clinical Guidelines on the Use of Doxycycline Postexposure
// Prophylaxis for Bacterial Sexually Transmitted Infection Prevention, United States, 2024. MMWR Recomm
// Rep 2024;73(RR-2) (PMC11166373, read 2026-09-18). Box 1:
//   Providers should counsel all MSM and transgender women with at least one bacterial STI (syphilis,
//   chlamydia, or gonorrhea) in the past 12 months about doxycycline 200 mg once within 72 hours of
//   oral, vaginal, or anal sex, not exceeding 200 mg per 24 hours, and offer doxy-PEP through shared
//   decision-making; reassess the need every 3-6 months (strong recommendation, AI).
//   "No recommendation can be given at this time" for cisgender women, cisgender heterosexual men,
//   transgender men, and other queer and nonbinary persons; evidence is insufficient.
//   Footnote: it could be discussed with MSM and TGW without an STI in the past year who will take part
//   in sexual activities known to raise the likelihood of STI exposure.
//   Bacterial STI testing at exposed anatomic sites at baseline and every 3-6 months; HIV screening per
//   current recommendations; within a comprehensive sexual health approach.
//
// Pure: no DOM, no clock, no network.

export const DOXY_VERIFIED = '2026-09-18';
export const POPULATIONS = [
  { value: 'msm-tgw', text: 'Gay, bisexual, or other man who has sex with men, or transgender woman' },
  { value: 'other', text: 'Cisgender woman, heterosexual cisgender man, transgender man, or nonbinary person' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

const DOSE = 'Doxycycline (any formulation) 200 mg once, as soon as possible within 72 hours after oral, vaginal, or anal sex; no more than 200 mg in any 24 hours.';
const MONITOR = [
  'Bacterial STI testing at the exposed sites at baseline and every 3 to 6 months.',
  'Reassess the need for doxy-PEP every 3 to 6 months.',
  'HIV screening, and PrEP or HIV care, as recommended; vaccines and risk reduction as part of routine sexual health care.',
];

export function doxyPep(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const pop = POPULATIONS.find((p) => p.value === o.population);
  if (!pop) return { valid: false, message: 'Choose the population. CDC\'s recommendation covers MSM and transgender women.' };
  if (pop.value === 'other') {
    return {
      valid: true, offer: null, abnormal: false,
      bandLabel: 'No CDC recommendation',
      band: 'CDC gives no recommendation for or against doxy-PEP for cisgender women, heterosexual cisgender men, transgender men, or nonbinary people: the evidence is insufficient, and the one trial in cisgender women found no benefit. Use clinical judgment and shared decision-making.',
      dose: null, monitoring: [],
    };
  }
  if (o.recentSti !== 'yes' && o.recentSti !== 'no') return { valid: false, message: 'Answer whether syphilis, chlamydia, or gonorrhea was diagnosed in the past 12 months.' };
  if (o.recentSti === 'yes') {
    return {
      valid: true, offer: true, abnormal: true,
      bandLabel: 'Counsel and offer doxy-PEP',
      band: 'A bacterial STI in the past 12 months: CDC recommends counseling about doxy-PEP and offering it through shared decision-making (strong recommendation, high-quality evidence).',
      dose: DOSE, monitoring: MONITOR,
    };
  }
  return {
    valid: true, offer: false, abnormal: false,
    bandLabel: 'Not in the recommended group; may be discussed',
    band: 'No bacterial STI in the past 12 months: outside the recommendation. CDC notes it could be discussed with someone whose planned sexual activity is known to raise the chance of STI exposure.',
    dose: DOSE, monitoring: MONITOR,
  };
}
