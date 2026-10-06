// spec-v1558 tool 3: the magnesium sulfate loading and IM (Pritchard) maintenance regimen for severe
// pre-eclampsia or eclampsia, and whether it is safe to give the next dose.
//
// Sources, read October 6, 2026 (facts restated, nothing reproduced):
//   - WHO. Managing complications in pregnancy and childbirth, 2nd ed., 2017 (MCPC; IRIS 10665/255760;
//     CC BY-NC-SA 3.0 IGO), Box S-4 (p. S-59): IM regimen loading 4 g of 20% IV over 5 minutes, then 10 g of
//     50% IM, 5 g deep in each buttock with 1 mL of 2% lidocaine in the same syringe; a convulsion after 15
//     minutes, 2 g of 50% IV over 5 minutes; maintenance 5 g of 50% with 1 mL of 2% lidocaine deep IM into
//     alternate buttocks every 4 hours, for 24 hours after birth or the last convulsion, whichever is later.
//     Box S-5 (p. S-60): withhold or delay if breathing falls below 16 a minute, patellar reflexes are absent,
//     or urine falls below 30 mL an hour over the preceding 4 hours; antidote calcium gluconate 1 g (10 mL
//     of 10%) IV slowly over 3 minutes.
//   - WHO. Pregnancy, childbirth, postpartum and newborn care, 3rd ed., 2015 (PCPNC; IRIS 10665/249580; all
//     rights reserved), B13: 4 g (20 mL of 20%) IV slowly over 20 minutes and 10 g IM; IM only (10 g) when
//     IV is not possible; 2 g (10 mL of 20%) IV over 20 minutes for a recurrent convulsion after 15 minutes;
//     refer urgently, continuing the maintenance if referral is delayed or she is in late labour; before the
//     next dose, knee jerk present, urine above 100 mL in 4 hours and breathing above 16 a minute, and no
//     dose if any falls below; antidote calcium gluconate 1 g (10 mL of 10%) IV over 10 minutes; never give
//     50% IV without diluting it to 20%; 50% is 5 g in 10 mL, and 10 mL of 20% is 4 mL of 50% plus 6 mL of
//     sterile water.
//
// Readings stated rather than hidden: PCPNC gives the dose above 100 mL and above 16 breaths and withholds it
// below, leaving exactly 100 mL and exactly 16 in neither; they are read as "hold" (the condition to give is
// not met). MCPC's "at least" thresholds include 16 and 30 mL/hour. MCPC prints its recurrent-convulsion dose
// as 50% solution IV; PCPNC forbids undiluted 50% IV. Both are printed.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const SOURCE_OPTIONS = [
  { value: 'mcpc', text: 'WHO Managing complications (MCPC 2017)' },
  { value: 'pcpnc', text: 'WHO Pregnancy, childbirth, postpartum and newborn care (PCPNC 2015)' },
];
export const REGIMEN_OPTIONS = [
  { value: 'ivim', text: 'IV plus IM loading, then IM maintenance' },
  { value: 'imonly', text: 'IM only (no IV access)' },
  { value: 'refer', text: 'Loading dose, then refer' },
];
export const REFLEX_OPTIONS = [{ value: 'present', text: 'Present' }, { value: 'absent', text: 'Absent' }];

const blank = (v) => v === undefined || v === null || String(v).trim() === '';
const IM5 = '5 g (10 mL of 50%) with 1 mL of 2% lidocaine in the same syringe';

export function mgso4ImRegimen(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const src = SOURCE_OPTIONS.find((x) => x.value === o.source);
  if (!src) return { valid: false, message: 'Choose the source: WHO\'s two manuals differ on the IV rate and the urine limit.' };
  const reg = REGIMEN_OPTIONS.find((x) => x.value === o.regimen);
  if (!reg) return { valid: false, message: 'Choose the regimen: IV plus IM loading, IM only, or loading then referral.' };
  const mcpc = src.value === 'mcpc';
  const ivMin = mcpc ? 5 : 20;

  // The next-dose check: all three, or none.
  const have = { rr: !blank(o.rr), reflex: !blank(o.reflex), urine: !blank(o.urine) };
  const any = have.rr || have.reflex || have.urine;
  let check = null;
  if (any) {
    const missing = [['rr', 'the breathing rate'], ['reflex', 'the knee reflex'], ['urine', 'the urine over the last 4 hours']].filter(([k]) => !have[k]).map(([, l]) => l);
    if (missing.length) return { valid: false, message: `Enter ${missing.join(' and ')}: the next dose is safe only when all three are checked.` };
    const f = inputFault([['the breathing rate', o.rr, 0, 80, 'per minute'], ['the urine over the last 4 hours', o.urine, 0, 5000, 'mL']]);
    if (f) return { valid: false, message: f };
    if (!REFLEX_OPTIONS.some((x) => x.value === o.reflex)) return { valid: false, message: 'Choose whether the knee reflex is present.' };
    const rr = Number(o.rr);
    const urine = Number(o.urine);
    const hold = [];
    if (mcpc ? rr < 16 : rr <= 16) hold.push(`breathing ${rr} a minute (${mcpc ? 'held below 16' : 'held at 16 or less'})`);
    if (o.reflex === 'absent') hold.push('knee reflex absent');
    if (mcpc ? urine < 120 : urine <= 100) hold.push(`urine ${urine} mL in 4 hours (${mcpc ? 'held below 30 mL an hour, 120 mL in 4 hours' : 'held at 100 mL or less in 4 hours'})`);
    check = hold;
  }

  const notes = [];
  const loading = reg.value === 'imonly'
    ? `IM loading only: 10 g, as ${IM5} deep IM into each buttock.${mcpc ? ' (MCPC prints no IM-only loading; this is PCPNC\'s.)' : ''}`
    : `Loading: 4 g IV (20 mL of 20%) over ${ivMin} minutes, then promptly 10 g IM, as ${IM5} deep into each buttock.`;
  notes.push(loading);
  notes.push(`A convulsion more than 15 minutes later: 2 g IV over ${ivMin} minutes${mcpc ? ' (MCPC prints it as 50% solution; PCPNC gives 10 mL of 20% and never undiluted 50% IV)' : ' (10 mL of 20%)'}.`);
  if (reg.value === 'refer') notes.push('Then refer urgently. If referral is delayed or she is in late labor, continue the maintenance below.');
  notes.push(`Maintenance: ${IM5} deep IM every 4 hours, alternating buttocks, until 24 hours after birth or the last convulsion, whichever is later.`);
  notes.push('Never give 50% IV: dilute it to 20% first (4 mL of 50% plus 6 mL of sterile water makes 10 mL of 20%, which is 2 g).');
  notes.push(`Antidote ready: calcium gluconate 1 g (10 mL of 10%) IV over ${mcpc ? '3' : '10'} minutes if breathing is depressed.`);
  notes.push(`Before each dose check breathing, the knee reflex and the urine: hold it if breathing is ${mcpc ? 'below 16' : '16 or less'} a minute, the reflex is absent, or urine is ${mcpc ? 'below 30 mL an hour over 4 hours (120 mL)' : '100 mL or less in 4 hours'}.`);
  if (!mcpc) notes.push('PCPNC gives the dose above 100 mL and 16 breaths and withholds it below, so exactly 100 mL or 16 is read as hold.');

  const regimenBand = reg.value === 'imonly'
    ? `Magnesium sulfate, IM only (${src.value.toUpperCase()}): 10 g IM to load, then 5 g IM every 4 hours.`
    : `Magnesium sulfate (${src.value.toUpperCase()}): 4 g IV over ${ivMin} minutes plus 10 g IM to load, then 5 g IM every 4 hours${reg.value === 'refer' ? ', with urgent referral' : ''}.`;
  if (check === null) {
    return { valid: true, band: regimenBand, bandLabel: reg.text, abnormal: false, notes, note: 'Your national protocol may differ; follow it.' };
  }
  return {
    valid: true,
    band: check.length
      ? `Hold the next dose (${src.value.toUpperCase()} limits): ${check.join('; ')}.`
      : `Safe to give the next dose (${src.value.toUpperCase()} limits): breathing, knee reflex and urine all pass.`,
    bandLabel: check.length ? 'Hold the next dose' : 'Next dose: safe to give',
    abnormal: check.length > 0,
    notes: [regimenBand, ...notes],
    note: 'Your national protocol may differ; follow it.',
  };
}
