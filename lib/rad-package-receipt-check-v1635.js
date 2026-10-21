// spec-v1635 tool 31: receiving a radioactive package.
//
// Sources, read on eCFR as current October 8, 2026 (re-read October 11, 2026):
//   10 CFR 20.1906(b)  monitor a labeled package (White I, Yellow II or Yellow III) for contamination
//                      unless it holds only a gas or special form material; for radiation levels
//                      unless it holds a Type A quantity or less; and monitor any package known to
//                      contain radioactive material for both "if there is evidence of degradation of
//                      package integrity, such as packages that are crushed, wet, or damaged".
//   10 CFR 20.1906(c)  "as soon as practical after receipt of the package, but not later than 3 hours
//                      after the package is received ... during the licensee's normal working hours,
//                      or not later than 3 hours from the beginning of the next working day if it is
//                      received after working hours".
//   10 CFR 20.1906(d)  immediately notify the final delivery carrier and the NRC Headquarters
//                      Operations Center by telephone when removable contamination exceeds the limits
//                      of 71.87(i), or external radiation levels exceed the limits of 71.47.
//   10 CFR 71.87(i)    points to 49 CFR 173.443. 49 CFR 173.443(a) and Table 9: wipe 300 cm2; the
//                      activity on the wipe, divided by the area wiped and by the wipe efficiency
//                      ("the actual wipe efficiency may be used, or ... assumed to be 0.10"), may not
//                      exceed 4 Bq/cm2 (240 dpm/cm2) for beta and gamma emitters and low toxicity
//                      alpha emitters, or 0.4 Bq/cm2 (24 dpm/cm2) for all other alpha emitters.
//   10 CFR 71.47(a)    200 mrem/h at any point on the external surface, and a transport index of 10.
// The tool does not look up Type A quantities; the reader answers the three questions.
//
// Pure: no DOM, no clock, no network.

import { sigSafe } from './cut-display.js';
import { inputFault } from './num.js';

export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export const EMITTERS = [
  { value: 'beta-gamma', text: 'Beta or gamma emitter, or a low toxicity alpha emitter (240 dpm/cm²)', dpm: 240, bq: 4 },
  { value: 'other-alpha', text: 'Any other alpha emitter (24 dpm/cm²)', dpm: 24, bq: 0.4 },
];
const NOTE = 'A check of the reader\'s own measurements against the receiving rule. It does not classify the package, look up Type A quantities, or replace the licensee\'s written opening procedure, which the rule also requires. The 10-fold allowance for exclusive-use shipments during transport and Agreement State rules are not applied.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const yn = (v) => YES_NO.find((y) => y.value === String(v ?? '').trim());
const show = (x) => Number(x.toPrecision(3)).toLocaleString('en-US', { maximumSignificantDigits: 3 });
// Three significant digits, or more where three would put the shown value on the other side of the limit.
const showCut = (x, cut) => sigSafe(x, [cut], 3).toLocaleString('en-US', { maximumSignificantDigits: 15 });
// A wall-clock date and time as entered (YYYY-MM-DDTHH:MM); no time zone is assumed or converted.
function stamp(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(v ?? '').trim());
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]));
  return d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3] && +m[4] < 24 && +m[5] < 60 && +m[1] > 1990 && +m[1] < 2100 ? d : null;
}
const sayAt = (d) => `${d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' })} at ${d.toLocaleTimeString('en-US', { timeZone: 'UTC', hour: 'numeric', minute: '2-digit' }).toLowerCase()}`;

export function radPackageReceiptCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const notes = []; const out = { valid: true }; const bands = []; let exceeds = false; let did = false;
  // (c): the 3-hour clock.
  if (!blank(o.received) || !blank(o.duringWorkingHours) || !blank(o.nextWorkingDayStart)) {
    const during = yn(o.duringWorkingHours);
    if (!during) return { valid: false, message: 'Choose whether the package was received during normal working hours: the 3 hours run from receipt if so, and from the start of the next working day if not.' };
    const from = stamp(during.value === 'yes' ? o.received : o.nextWorkingDayStart);
    if (!from) return { valid: false, message: during.value === 'yes' ? 'Enter the date and time the package was received.' : 'Enter the date and time the next working day begins.' };
    const due = new Date(from.getTime() + 3 * 3600000);
    out.monitorBy = due.toISOString().slice(0, 16); did = true;
    bands.push(`Monitor by ${sayAt(due)}`);
    notes.push(`Monitoring: as soon as practical, and not later than ${sayAt(due)}, 3 hours after ${during.value === 'yes' ? 'receipt' : 'the start of the next working day'} (20.1906(c)).`);
  }
  // (b): which monitoring applies.
  if (!blank(o.labeled) || !blank(o.damaged) || !blank(o.gasOrSpecialForm) || !blank(o.aboveTypeA)) {
    const labeled = yn(o.labeled); const damaged = yn(o.damaged);
    if (!labeled) return { valid: false, message: 'Choose whether the package bears a Radioactive White I, Yellow II or Yellow III label.' };
    if (!damaged) return { valid: false, message: 'Choose whether there is evidence of degradation, such as a crushed, wet or damaged package.' };
    let contamination = false; let radiation = false;
    if (damaged.value === 'yes') { contamination = true; radiation = true; } else if (labeled.value === 'yes') {
      const gas = yn(o.gasOrSpecialForm); const typeA = yn(o.aboveTypeA);
      if (!gas) return { valid: false, message: 'Choose whether the package holds only a gas or special form material: such a package is not monitored for contamination.' };
      if (!typeA) return { valid: false, message: 'Choose whether the contents exceed a Type A quantity: only then is the package monitored for radiation levels.' };
      contamination = gas.value === 'no'; radiation = typeA.value === 'yes';
    }
    out.monitoringRequired = { contamination, radiationLevels: radiation }; did = true;
    const what = contamination && radiation ? 'contamination and radiation levels' : contamination ? 'contamination' : radiation ? 'radiation levels' : 'neither contamination nor radiation levels';
    bands.push(`20.1906(b) requires monitoring for ${what}`);
    notes.push(damaged.value === 'yes' ? 'Evidence of degradation: monitor for both contamination and radiation levels, whatever the label (20.1906(b)(3)).' : labeled.value === 'yes' ? `Labeled package: contamination monitoring ${contamination ? 'is required' : 'is not required (gas or special form only)'}; radiation level monitoring ${radiation ? 'is required (above a Type A quantity)' : 'is not required (a Type A quantity or less)'} (20.1906(b)(1), (2)).` : 'Not labeled and no evidence of degradation: 20.1906(b) requires no monitoring. The licensee\'s own procedure may.');
  }
  // The wipe.
  if (!blank(o.netCpm) || !blank(o.efficiencyPercent) || !blank(o.areaCm2)) {
    const emitter = EMITTERS.find((e) => e.value === String(o.emitter ?? '').trim());
    if (!emitter) return { valid: false, message: 'Choose the emitter type: the contamination limit differs tenfold.' };
    const f = inputFault([['the net counts per minute on the wipe', o.netCpm, 0, 1e9, ''], ['the counter efficiency', o.efficiencyPercent, null, 100, '%'], ['the area wiped', o.areaCm2, null, 1e5, 'cm²']]);
    if (f) return { valid: false, message: f };
    let wipeEff = 0.1;
    if (!blank(o.wipeEfficiencyPercent)) {
      const wf = inputFault([['the wipe efficiency', o.wipeEfficiencyPercent, null, 100, '%']]);
      if (wf) return { valid: false, message: wf };
      wipeEff = Number(o.wipeEfficiencyPercent) / 100;
    }
    const dpm = Number(o.netCpm) / (Number(o.efficiencyPercent) / 100) / Number(o.areaCm2) / wipeEff;
    const over = dpm > emitter.dpm + 1e-9;
    out.dpmPerCm2 = Number(dpm.toPrecision(6)); out.contaminationExceeds = over; did = true; exceeds = exceeds || over;
    bands.push(`removable contamination ${showCut(dpm, emitter.dpm + 1e-9)} dpm/cm², ${over ? 'above' : 'within'} the ${emitter.dpm} dpm/cm² limit`);
    notes.push(`Wipe: ${Number(o.netCpm).toLocaleString('en-US')} net cpm ÷ ${Number(o.efficiencyPercent)}% counter efficiency ÷ ${Number(o.areaCm2)} cm² ÷ ${show(wipeEff)} wipe efficiency${blank(o.wipeEfficiencyPercent) ? ' (the value the rule lets be assumed)' : ''} = ${show(dpm)} dpm/cm² (${show(dpm / 60)} Bq/cm²). Limit: ${emitter.dpm} dpm/cm² (${emitter.bq} Bq/cm²), 49 CFR 173.443 Table 9.${Number(o.areaCm2) !== 300 ? ' The rule\'s method wipes 300 cm².' : ''}`);
  }
  // Radiation levels.
  if (!blank(o.surfaceMremH) || !blank(o.oneMeterMremH)) {
    const rf = inputFault([...(blank(o.surfaceMremH) ? [] : [['the dose rate at the surface', o.surfaceMremH, 0, 1e6, 'mrem/h']]), ...(blank(o.oneMeterMremH) ? [] : [['the dose rate at 1 meter', o.oneMeterMremH, 0, 1e6, 'mrem/h']])]);
    if (rf) return { valid: false, message: rf };
    const parts = []; let over = false;
    if (!blank(o.surfaceMremH)) { const s = Number(o.surfaceMremH); const x = s > 200; over = over || x; parts.push(`surface ${showCut(s, 200)} mrem/h, ${x ? 'above' : 'within'} 200 mrem/h`); }
    if (!blank(o.oneMeterMremH)) { const t = Number(o.oneMeterMremH); const x = t > 10; over = over || x; parts.push(`${showCut(t, 10)} mrem/h at 1 meter, ${x ? 'above' : 'within'} a transport index of 10`); }
    out.radiationExceeds = over; did = true; exceeds = exceeds || over;
    bands.push(`radiation levels ${over ? 'above' : 'within'} the limits`);
    notes.push(`Radiation levels: ${parts.join('; ')} (10 CFR 71.47(a)). A package shipped under exclusive use has other limits.`);
  }
  if (!did) return { valid: false, message: 'Enter the receipt time, the package questions, a wipe result or the dose rates. Each part is checked on its own.' };
  if (exceeds) notes.push('A limit is exceeded: immediately notify the final delivery carrier and the NRC Headquarters Operations Center by telephone (20.1906(d)).');
  notes.push('10 CFR 20.1906, 71.47, 71.87; 49 CFR 173.443.');
  // "Within the limits" is said only when something was measured; the questions alone measure nothing.
  const measured = out.contaminationExceeds !== undefined || out.radiationExceeds !== undefined;
  const label = exceeds ? 'Exceeds a limit' : measured ? 'Within the limits checked' : out.monitorBy ? `Monitor by ${sayAt(new Date(`${out.monitorBy}:00Z`))}` : 'Monitoring required by the rule';
  const band = `${bands.join('; ')}.`;
  return { ...out, flag: exceeds ? 'exceeds' : 'checked', abnormal: exceeds, band: `${band[0].toUpperCase()}${band.slice(1)}${exceeds ? ' Notify the carrier and the NRC immediately.' : ''}`, bandLabel: label, notes, note: NOTE };
}
