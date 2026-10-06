// spec-v1555 tool 2: does this snakebite patient meet WHO criteria for antivenom? WHO SEARO (South and
// Southeast Asia) or WHO AFRO (Africa).
//
// Sources, read October 6, 2026 (facts restated, nothing reproduced):
//   - SEARO16: Warrell DA, for WHO SEARO. Guidelines for the management of snakebites, 2nd ed., 2016 (IRIS
//     10665/249547): pp. 129-130 antivenom if one or more signs develop: spontaneous systemic bleeding,
//     coagulopathy (non-clotting 20WBCT, INR over 1.2 or prothrombin time over 4-5 seconds above control),
//     platelets under 100 x 10^9/L, neurotoxic signs, cardiovascular abnormality, acute kidney injury, dark
//     brown urine; local swelling of more than half the bitten limb within 48 hours (no tourniquet),
//     swelling after a bite on a digit, rapid extension of swelling, an enlarged tender draining lymph node.
//     p. 132: no absolute contraindication; a previous reaction to horse or sheep serum or strong atopy
//     (especially severe asthma) means antivenom only with systemic envenoming. pp. 133-134: optional
//     subcutaneous adrenaline pre-treatment (0.25 mg adults, 0.005 mL/kg of 0.1% children), except older
//     patients with suspected cerebrovascular disease and with an antivenom of proven reaction rate under 5%;
//     a reaction gets adrenaline 0.5 mg IM (children 0.01 mg/kg) at the first sign, repeated every 5-10
//     minutes. p. 141: adrenaline drawn up before antivenom. p. 142: children get the same dose as adults.
//   - AFRO10: WHO AFRO. Guidelines for the prevention and clinical management of snakebite in Africa, 2010
//     (IRIS 10665/204458), pp. 77-78 (page images): Table 14.1, systemic envenoming (neurotoxicity,
//     spontaneous systemic bleeding, incoagulable blood, cardiovascular abnormality) and local envenoming
//     (extensive swelling over half the limb, rapidly progressive swelling, bites on fingers and toes) only
//     by species known to cause necrosis (Bitis, Echis, Cerastes, Macrovipera, spitting cobras); no absolute
//     contraindication with life-threatening envenoming; children the same dose; no antivenom for burrowing
//     asps, night adders, bush vipers or Bitis atropos and smaller Bitis.
//
// Three-state throughout: a sign left blank is "not assessed" and never "no". The tile never says "not
// indicated" while a systemic sign is unassessed. No antivenom product or dose is named.
//
// Pure: no DOM, no clock.

export const REGION_OPTIONS = [
  { value: 'asia', text: 'South and Southeast Asia (WHO SEARO)' },
  { value: 'africa', text: 'Africa (WHO AFRO)' },
];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export const WBCT_OPTIONS = [{ value: 'noclot', text: 'Does not clot' }, { value: 'clots', text: 'Clots' }];
export const LAB_OPTIONS = [{ value: 'abnormal', text: 'Abnormal (INR over 1.2, PT 4-5 s over control, or platelets under 100)' }, { value: 'normal', text: 'Normal' }];

const SYSTEMIC = {
  asia: [
    ['bleed', 'spontaneous bleeding away from the bite'],
    ['wbct', 'a non-clotting 20WBCT'],
    ['lab', 'an abnormal INR, prothrombin time or platelet count'],
    ['neuro', 'neurotoxic signs'],
    ['cardio', 'low blood pressure, shock, an abnormal rhythm or ECG'],
    ['aki', 'acute kidney injury'],
    ['urine', 'dark brown urine'],
  ],
  africa: [
    ['neuro', 'neurotoxic signs'],
    ['bleed', 'spontaneous bleeding away from the bite'],
    ['wbct', 'a non-clotting 20WBCT'],
    ['cardio', 'low blood pressure, shock, an abnormal rhythm or ECG'],
  ],
};
const LOCAL = {
  asia: [
    ['half', 'swelling of more than half the bitten limb within 48 hours'],
    ['digit', 'swelling after a bite on a finger or toe'],
    ['rapid', 'rapidly spreading swelling'],
    ['node', 'an enlarged tender lymph node draining the limb'],
  ],
  africa: [
    ['half', 'swelling of more than half the bitten limb'],
    ['rapid', 'rapidly spreading swelling'],
    ['digit', 'a bite on a finger or toe'],
  ],
};
const present = (k, v) => (k === 'wbct' ? v === 'noclot' : k === 'lab' ? v === 'abnormal' : v === 'yes');
const assessed = (k, v) => (k === 'wbct' ? WBCT_OPTIONS : k === 'lab' ? LAB_OPTIONS : YES_NO).some((x) => x.value === v);
const join = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
const NOTE = {
  asia: 'This follows WHO SEARO\'s 2016 snakebite guidelines. The antivenom and its dose come from the product insert or national protocol.',
  africa: 'This follows WHO AFRO\'s 2010 snakebite guidelines. The antivenom and its dose come from the product insert or national protocol.',
};

function givingNotes(region, risk) {
  const n = [
    'Children get exactly the same dose as adults: snakes inject the same amount of venom.',
    'Have epinephrine drawn up at the bedside before starting. At the very first sign of a reaction give epinephrine 0.5 mg IM for an adult or 0.01 mg/kg for a child, repeated every 5 to 10 minutes if it persists or worsens.',
    'There is no absolute contraindication to antivenom.',
  ];
  if (region === 'asia') {
    n.push('SEARO\'s optional pre-treatment: epinephrine 0.25 mg (0.25 mL of 0.1%) subcutaneously for an adult, 0.005 mL/kg of 0.1% for a child, except in older patients with suspected cerebrovascular disease and when the antivenom has a proven reaction rate under 5%.');
    n.push('Check the product\'s stated species: Indian antivenom does not cover sea snakes or pit vipers, including the hump-nosed pit viper.');
  } else {
    if (risk === 'yes') n.push('With a history of severe atopy or a previous reaction to horse serum, AFRO justifies pre-treatment with subcutaneous epinephrine and IV antihistamine and hydrocortisone.');
    n.push('Check the product\'s stated species: no antivenom covers burrowing asps, night adders, bush vipers, or the Berg adder and smaller Bitis.');
  }
  return n;
}

export function snakeAntivenomIndication(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const region = REGION_OPTIONS.find((x) => x.value === o.region);
  if (!region) return { valid: false, message: 'Choose the region: South and Southeast Asia, or Africa.' };
  const r = region.value;
  const notes = [];
  const out = (band, bandLabel, abnormal) => ({ valid: true, band, bandLabel, abnormal, notes, note: NOTE[r] });

  const sysYes = SYSTEMIC[r].filter(([k]) => present(k, o[k])).map(([, t]) => t);
  const sysOpen = SYSTEMIC[r].filter(([k]) => !assessed(k, o[k])).map(([, t]) => t);
  const necrotic = r === 'asia' || o.necrotic === 'yes';
  const locYes = LOCAL[r].filter(([k]) => present(k, o[k])).map(([, t]) => t);
  const locOpen = LOCAL[r].filter(([k]) => !assessed(k, o[k])).map(([, t]) => t);

  if (r === 'asia' && o.necrotic) notes.push('The species question applies only to Africa; SEARO counts the local signs for any snake.');
  if (r === 'africa') for (const k of ['lab', 'aki', 'urine', 'node']) if (o[k]) { notes.push('AFRO\'s criteria do not include the laboratory, kidney, urine or lymph node signs, so those answers are not used.'); break; }

  if (sysYes.length) {
    notes.push(...givingNotes(r, o.risk));
    return out(`Antivenom is indicated: systemic envenoming (${join(sysYes)}).`, 'Indicated', true);
  }

  if (locYes.length) {
    if (sysOpen.length) notes.push(`Systemic signs not assessed: ${join(sysOpen)}. Any one of them would indicate antivenom on its own.`);
    if (r === 'africa' && o.necrotic !== 'yes') {
      if (o.necrotic === 'no') {
        notes.push(`Local signs present (${join(locYes)}), but AFRO counts local signs only for species known to cause tissue death (Bitis, Echis, Cerastes, Macrovipera, spitting cobras).`);
      } else {
        return out(`Not decided: ${join(locYes)} would indicate antivenom only if the species is one known to cause tissue death (Bitis, Echis, Cerastes, Macrovipera, spitting cobras), and that was not entered.`, 'Not decided', true);
      }
    } else if (r === 'asia' && o.risk === 'yes') {
      notes.push('A previous reaction to horse or sheep serum, or strong atopy such as severe asthma, means antivenom only for systemic envenoming (SEARO). Keep re-assessing for systemic signs.');
      if (sysOpen.length) return out(`Not decided: local signs alone do not justify antivenom at high reaction risk, and these systemic signs were not assessed: ${join(sysOpen)}.`, 'Incomplete', true);
      return out(`Not indicated at high reaction risk on local signs alone (${join(locYes)}): SEARO gives antivenom to this patient only for systemic envenoming.`, 'Not on local signs alone', true);
    } else {
      if (r === 'asia' && o.risk !== 'no') notes.push('Reaction risk: not entered. A previous reaction to horse or sheep serum, or severe asthma, would limit antivenom to systemic envenoming (SEARO).');
      notes.push(...givingNotes(r, o.risk));
      return out(`Antivenom is indicated: local envenoming (${join(locYes)}).`, 'Indicated', true);
    }
  }

  if (sysOpen.length) return out(`Incomplete: no criterion is met so far, but these systemic signs were not assessed: ${join(sysOpen)}. This cannot say antivenom is not indicated.`, 'Incomplete', true);
  if (necrotic && locOpen.length) return out(`Incomplete: no systemic envenoming, but these local signs were not assessed: ${join(locOpen)}.`, 'Incomplete', true);
  if (r === 'africa' && !o.necrotic && locOpen.length) notes.push('Species: not entered; local signs would count only for a species known to cause tissue death.');
  notes.push('Envenoming can develop over hours: keep observing, and repeat the 20WBCT. Swelling confined to the bite area, with or without fang marks, is not an indication (India\'s guideline).');
  return out('Not indicated on the criteria entered: no systemic envenoming and no qualifying local sign. Keep observing.', 'Not indicated now', false);
}
