// spec-v1555 tool 3: which snakes does this clinical picture suggest, and what kind of antivenom (broad,
// species-specific, or none) does the guideline point to? The syndromic approach of WHO AFRO and WHO SEARO.
//
// Sources, read October 6, 2026 (facts restated, nothing reproduced):
//   - AFRO10: WHO AFRO. Guidelines for the prevention and clinical management of snakebite in Africa, 2010
//     (IRIS 10665/204458), ch. 8, pp. 53-55 (page images), Table 8.1: (1) marked local swelling, coagulable
//     blood: spitting cobras or puff adders (rarely the Berg adder), polyspecific antivenom; (2) marked
//     swelling with incoagulable blood or spontaneous bleeding: saw-scaled or carpet vipers (northern third
//     of Africa), desert horned vipers, some puff adders, rarely Gaboon or bush vipers; monospecific Echis
//     antivenom south of the Sahara and north of the equator, polyspecific anywhere; (3) progressive
//     paralysis with negligible to moderate swelling: neurotoxic cobras or mambas, polyspecific antivenom,
//     consider an anticholinesterase trial, intubate and ventilate if needed; (4) mild swelling alone: night
//     adders, burrowing asps, some dwarf, bush and desert vipers, no antivenom; (5) mild or negligible
//     swelling with incoagulable blood: boomslang (monospecific antivenom) or vine snake (supportive); (6)
//     moderate to marked swelling with neurotoxicity: the Berg adder and other dwarf adders, no antivenom.
//   - SEARO16: Warrell DA, for WHO SEARO. Guidelines for the management of snakebites, 2nd ed., 2016 (IRIS
//     10665/249547), p. 101 (five syndromes) and p. 186 (algorithms should be built from local data).
//
// A suggestion, not an identification: the answer says so every time.
//
// Pure: no DOM, no clock.

export const REGION_OPTIONS = [
  { value: 'africa', text: 'Africa (WHO AFRO)' },
  { value: 'asia', text: 'South and Southeast Asia (WHO SEARO)' },
];
export const SWELLING_OPTIONS = [
  { value: 'none', text: 'None or negligible' },
  { value: 'mild', text: 'Mild' },
  { value: 'moderate', text: 'Moderate' },
  { value: 'marked', text: 'Marked' },
];
export const BLOOD_OPTIONS = [
  { value: 'clots', text: 'Clots (20WBCT)' },
  { value: 'noclot', text: 'Does not clot (20WBCT)' },
  { value: 'bleeding', text: 'Spontaneous bleeding away from the bite' },
  { value: 'notdone', text: '20WBCT not done' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
export const SETTING_OPTIONS = [
  { value: 'sleeping', text: 'On land, while sleeping on the floor or ground' },
  { value: 'land', text: 'On land, otherwise' },
  { value: 'sea', text: 'In the sea, an estuary or a lake' },
];

const CAVEAT = 'A suggestion from the clinical picture, not an identification of the snake.';
const NOTE = {
  africa: 'This follows WHO AFRO\'s 2010 syndromic approach (chapter 8). In southern Africa, AFRO points to the regional algorithms.',
  asia: 'This follows WHO SEARO\'s 2016 syndromes (p. 101). SEARO says syndromic algorithms should be built from local data; follow your national one.',
};

function africa(sw, blood, para) {
  if (para) {
    if (sw === 'moderate' || sw === 'marked') return ['Syndrome 6: swelling with paralysis. Suggests the Berg adder or another dwarf adder. No antivenom exists; palliative treatment only.', 'No antivenom'];
    return ['Syndrome 3: progressive paralysis. Strongly suggests a neurotoxic cobra or a mamba. Polyspecific antivenom; consider an anticholinesterase trial (not after a suspected mamba bite); intubate and ventilate if needed.', 'Polyspecific antivenom'];
  }
  if (blood === 'notdone') return null;
  const incoag = blood === 'noclot' || blood === 'bleeding';
  if (sw === 'marked') {
    return incoag
      ? ['Syndrome 2: marked swelling with incoagulable blood or bleeding. Strongly suggests a saw-scaled or carpet viper (northern third of Africa); also desert horned vipers or some puff adders. Monospecific Echis antivenom south of the Sahara and north of the equator; polyspecific antivenom anywhere in Africa.', 'Echis-specific or polyspecific']
      : ['Syndrome 1: marked swelling with clotting blood. Suggests a spitting cobra or a puff adder. Polyspecific antivenom with fluid replacement; supportive care only if a Berg adder is proven.', 'Polyspecific antivenom'];
  }
  if (sw === 'moderate') return ['Moderate swelling without paralysis sits between AFRO\'s syndromes (marked swelling for 1 and 2, mild for 4 and 5). Reassess the extent of swelling and repeat the 20WBCT.', 'Between syndromes'];
  if (incoag) return ['Syndrome 5: mild or no swelling with incoagulable blood. Suggests a boomslang, or more rarely a vine snake. Monospecific boomslang antivenom; supportive treatment for a vine snake.', 'Boomslang-specific'];
  if (sw === 'mild') return ['Syndrome 4: mild swelling alone. Suggests a night adder, a burrowing asp, or a dwarf, bush or desert viper. No antivenom; palliative treatment only.', 'No antivenom'];
  return ['No envenoming syndrome now: no swelling, clotting blood and no paralysis. Keep observing and repeat the 20WBCT; many bites inject no venom.', 'No syndrome now'];
}

function asia(sw, blood, para, o) {
  const local = sw === 'moderate' || sw === 'marked';
  const incoag = blood === 'noclot' || blood === 'bleeding';
  const renal = o.renal === 'yes';
  if (para && o.maluku === 'yes') return ['Syndrome 4: paralysis after a bite in Maluku or West Papua (Indonesia). Suggests an Australasian elapid.', 'Australasian elapid'];
  if (para && local) {
    if (incoag) return ['Syndrome 2 with paralysis: local swelling, a clotting problem and paralysis. Suggests Russell\'s viper (Sri Lanka and south India).', 'Russell\'s viper'];
    if (blood === 'notdone') return null;
    return ['Syndrome 3: local swelling with paralysis. Suggests a cobra or king cobra.', 'Cobra or king cobra'];
  }
  if (para) {
    if (!SETTING_OPTIONS.some((x) => x.value === o.setting)) return 'setting';
    if (renal) {
      if (o.setting === 'sea') return ['Syndrome 5: paralysis with dark urine and kidney injury after a bite in the sea or an estuary. Suggests a sea snake.', 'Sea snake'];
      if (o.setting === 'sleeping') return ['Syndrome 5: paralysis with dark urine and kidney injury after a bite while sleeping indoors. Suggests a krait (Bangladesh, Thailand).', 'Krait'];
      if (incoag) return ['Syndrome 5: paralysis with dark urine, kidney injury and a clotting problem after a bite on land. Suggests Russell\'s viper (Sri Lanka and south India).', 'Russell\'s viper'];
      if (blood === 'notdone') return null;
    }
    if (o.setting === 'sea') return ['Syndrome 4: paralysis with little local swelling after a bite in the sea or an estuary. Suggests a sea snake.', 'Sea snake'];
    if (o.setting === 'sleeping') return ['Syndrome 4: paralysis with little local swelling after a bite while sleeping on the ground. Suggests a krait.', 'Krait'];
    return ['Paralysis with little local swelling after a bite on land while awake does not match one of SEARO\'s five syndromes (kraits bite people sleeping on the ground).', 'No syndrome matches'];
  }
  if (blood === 'notdone') return null;
  if (local && incoag) {
    return renal
      ? ['Syndrome 2: local swelling, a clotting problem and shock or kidney injury. Suggests Russell\'s viper.', 'Russell\'s viper']
      : ['Syndrome 1: local swelling with a bleeding or clotting problem. Suggests a viper (any species).', 'Viper'];
  }
  if (!local && !incoag && sw === 'none') return ['No envenoming syndrome now: no swelling, clotting blood and no paralysis. Keep observing and repeat the 20WBCT; many bites inject no venom.', 'No syndrome now'];
  return ['This picture does not match one of SEARO\'s five syndromes. Reassess, repeat the 20WBCT, and use your national algorithm.', 'No syndrome matches'];
}

export function snakebiteSyndrome(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const region = REGION_OPTIONS.find((x) => x.value === o.region);
  if (!region) return { valid: false, message: 'Choose the region: Africa, or South and Southeast Asia.' };
  const sw = SWELLING_OPTIONS.find((x) => x.value === o.swelling);
  if (!sw) return { valid: false, message: 'Choose the local swelling: none, mild, moderate or marked.' };
  const blood = BLOOD_OPTIONS.find((x) => x.value === o.blood);
  if (!blood) return { valid: false, message: 'Choose the blood finding: clots, does not clot, spontaneous bleeding, or 20WBCT not done.' };
  if (!YES_NO.some((x) => x.value === o.paralysis)) return { valid: false, message: 'Choose whether there is paralysis (drooping eyelids, weakness).' };
  const para = o.paralysis === 'yes';
  const notes = [];
  if (region.value === 'africa' && (o.setting || o.renal || o.maluku)) notes.push('The setting, kidney and Maluku answers are used only for South and Southeast Asia.');
  if (region.value === 'asia' && !para && o.setting) notes.push('Where the bite happened is used only when there is paralysis.');
  const res = region.value === 'africa' ? africa(sw.value, blood.value, para) : asia(sw.value, blood.value, para, o);
  if (res === 'setting') return { valid: false, message: 'Choose where the bite happened: on land while sleeping, on land otherwise, or in the sea. It separates krait from sea snake.' };
  if (res === null) return { valid: false, message: 'Enter the 20WBCT result: the syndrome turns on whether the blood clots.' };
  notes.push(CAVEAT);
  if (region.value === 'asia' && !para && o.renal !== 'yes' && o.renal !== 'no') notes.push('Dark urine or kidney injury: not entered; with swelling and a clotting problem it would point to Russell\'s viper.');
  return { valid: true, band: res[0], bandLabel: res[1], abnormal: !/^No envenoming/.test(res[0]), notes, note: NOTE[region.value] };
}
