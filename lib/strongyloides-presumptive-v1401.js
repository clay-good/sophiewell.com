// spec-v1401: Strongyloides -- presumptive ivermectin, or test first (CDC refugee health guidance).
//
// Source: CDC Immigrant and Refugee Health, Domestic Guidance: Intestinal Parasites (last updated
// January 30, 2025; read 2026-09-18):
//   Presumptive ivermectin 200 ug/kg orally as a single dose for asymptomatic refugees from Asia, the
//   Middle East, North Africa, Latin America, the Caribbean, and sub-Saharan Africa outside Loa loa-
//   endemic areas who did not receive documented overseas ivermectin, unless contraindicated.
//   Contraindications to presumptive ivermectin: weight under 15 kg; pregnancy or breastfeeding an
//   infant under 1 week old; Loa loa microfilaremia; hypersensitivity. With a contraindication, "test
//   and treat": Strongyloides IgG serology.
//   Anyone who lived in a Loa loa-endemic country is tested for Loa loa microfilaremia BEFORE
//   ivermectin: a single thin and thick blood smear drawn between 10 a.m. and 2 p.m. Negative: high-
//   burden Loa loa is ruled out and ivermectin may be offered. Positive: consult CDC.
//   Ivermectin is the drug of choice; albendazole is not recommended for Strongyloides.
//   Hyperinfection is associated with immunosuppression, most commonly corticosteroids at any dose or
//   duration; it may occur decades after exposure and kills more than half of those it affects.
//
// Corrected from the plan: the plan named albendazole 400 mg twice daily for 7 days for a Loa loa-
// endemic patient and a two-day ivermectin course; the current CDC page gives neither.
//
// Pure: no DOM, no clock, no network.

export const STRONGY_VERIFIED = '2026-09-18';
export const REGIONS = [
  { value: 'asia', text: 'Asia' },
  { value: 'middle-east', text: 'Middle East or North Africa' },
  { value: 'latam', text: 'Latin America or the Caribbean' },
  { value: 'ssa', text: 'Sub-Saharan Africa, outside Loa loa-endemic areas' },
  { value: 'loa', text: 'A Loa loa-endemic country of Central or West Africa' },
  { value: 'other', text: 'Elsewhere' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

export function strongyloidesPresumptive(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const region = REGIONS.find((r) => r.value === o.region);
  if (!region) return { valid: false, message: 'Choose where the person lived. Presumptive treatment depends on the region, and Loa loa-endemic areas need a blood smear first.' };
  for (const [k, what] of [['overseas', 'whether overseas presumptive ivermectin is documented'], ['pregnant', 'whether the person is pregnant or breastfeeding an infant under 1 week old'], ['steroids', 'whether corticosteroids or other immunosuppression are planned']]) {
    if (o[k] !== 'yes' && o[k] !== 'no') return { valid: false, message: `Answer ${what}.` };
  }
  if (isBlank(o.weightKg)) return { valid: false, message: 'Enter the weight in kilograms. Ivermectin is dosed by weight and is not given presumptively under 15 kg.' };
  const kg = Number(String(o.weightKg).trim());
  if (!Number.isFinite(kg) || kg < 1 || kg > 300) return { valid: false, message: 'Enter a weight between 1 and 300 kg.' };

  const doseMg = Math.round(kg * 0.2 * 10) / 10;
  const dose = `Ivermectin 200 ug/kg by mouth as a single dose: ${doseMg} mg for ${kg} kg.`;
  const steroidNote = o.steroids === 'yes'
    ? 'Corticosteroids or other immunosuppression are planned: hyperinfection is linked to corticosteroids at any dose or duration, can appear decades after exposure, and kills more than half of those it affects. Settle Strongyloides before starting if at all possible.'
    : null;
  const smear = 'Before any ivermectin: a thin and thick blood smear drawn between 10 a.m. and 2 p.m. If negative, high-burden Loa loa is ruled out and ivermectin may be offered; if positive, consult CDC.';

  if (region.value === 'other') {
    return { valid: true, action: 'none', abnormal: o.steroids === 'yes', bandLabel: 'Not a presumptive-treatment region', band: 'CDC\'s presumptive Strongyloides treatment covers refugees from Asia, the Middle East, North Africa, Latin America, the Caribbean, and sub-Saharan Africa. Test with serology if exposure is suspected.', dose: null, steroidNote };
  }
  if (region.value === 'loa') {
    return {
      valid: true, action: 'smear-first', abnormal: true,
      bandLabel: 'No presumptive ivermectin: blood smear first',
      band: `From a Loa loa-endemic country, ivermectin can cause encephalopathy in high-burden Loa loa. Send Strongyloides IgG serology, and rule out Loa loa before any ivermectin. ${smear}`,
      dose: null, steroidNote, drugNote: 'Albendazole is not recommended for Strongyloides; ivermectin is the drug of choice once Loa loa is ruled out.',
    };
  }
  const contra = [];
  if (kg < 15) contra.push('weight under 15 kg');
  if (o.pregnant === 'yes') contra.push('pregnancy or breastfeeding an infant under 1 week old');
  if (contra.length) {
    return { valid: true, action: 'test', abnormal: true, bandLabel: 'Test and treat instead', band: `Presumptive ivermectin is contraindicated (${contra.join('; ')}). Send Strongyloides IgG serology and treat a positive result.`, dose: null, steroidNote };
  }
  if (o.overseas === 'yes') {
    return {
      valid: true, action: 'done', abnormal: o.steroids === 'yes',
      bandLabel: o.steroids === 'yes' ? 'Treated overseas; still check before steroids' : 'Treated overseas',
      band: o.steroids === 'yes'
        ? 'Overseas presumptive ivermectin is documented. Corticosteroids are planned, so weigh the hyperinfection risk below with the treating team.'
        : 'Overseas presumptive ivermectin is documented; no further presumptive treatment is needed.',
      dose: null, steroidNote,
    };
  }
  return { valid: true, action: 'treat', abnormal: true, bandLabel: 'Presumptive ivermectin', band: `No documented overseas treatment and no contraindication: give presumptive ivermectin on arrival. ${dose}`, dose, steroidNote };
}
