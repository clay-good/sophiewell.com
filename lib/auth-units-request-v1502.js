// spec-v1502 tool 4: the billing units to request for an authorization period.
//
// The number of administrations in the period at the maintenance interval, plus any loading doses,
// each converted to billing units and rounded UP per administration -- a partial unit is billed whole
// on each claim, not once over the total. The per-administration conversion is ndcHcpcsUnits() from
// lib/billing-v81.js (the ndc-hcpcs-units tool), not a second copy of it.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';
import { ndcHcpcsUnits } from './billing-v81.js';
import { parseIsoStrict } from './deadline.js';

const POSTURE = 'This is arithmetic on the dosing and the code\'s unit size, not a coverage decision. The payer\'s policy controls.';
export const DOSE_BASIS = [{ value: 'mg', text: 'mg per administration' }, { value: 'mg-per-kg', text: 'mg per kg of body weight' }];
const date = (s) => { try { return parseIsoStrict(String(s ?? '').trim()); } catch { return null; } };

export function authUnitsRequest(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const basis = o.basis === 'mg' || o.basis === 'mg-per-kg' ? o.basis : null;
  if (!basis) return { valid: false, message: 'Choose whether the dose is in mg or in mg per kg.' };
  const spec = [['the maintenance dose', o.dose, null, 100000, basis === 'mg' ? 'mg' : 'mg/kg']];
  if (basis === 'mg-per-kg') spec.push(['the weight', o.weightKg, null, 500, 'kg']);
  spec.push(['the billing unit size', o.unitMg, null, 100000, 'mg'], ['the days between maintenance doses', o.intervalDays, null, 3650, '']);
  const fault = inputFault(spec);
  if (fault) return { valid: false, message: fault };
  const first = date(o.firstDose);
  const end = date(o.periodEnd);
  if (!first) return { valid: false, message: 'Enter the date of the first maintenance dose in the period (YYYY-MM-DD).' };
  if (!end) return { valid: false, message: 'Enter the last day of the authorization period (YYYY-MM-DD).' };
  if (end < first) return { valid: false, message: 'Enter the dates again: the period cannot end before the first dose.' };
  const every = Number(o.intervalDays);
  if (!Number.isInteger(every)) return { valid: false, message: 'Enter the days between maintenance doses as a whole number.' };
  const mg = (d) => (basis === 'mg' ? d : Math.round(d * Number(o.weightKg) * 1000) / 1000);
  const unitMg = Number(o.unitMg);
  const maint = mg(Number(o.dose));
  const days = Math.round((end - first) / 86400000);
  const count = Math.floor(days / every) + 1;
  const perMaint = ndcHcpcsUnits({ dose: maint, doseUnit: 'mg', unitSize: unitMg, unitUnit: 'mg', rounding: 'up' });
  const notes = [];
  let loadCount = 0;
  let perLoad = null;
  if (String(o.loadingCount ?? '').trim() !== '') {
    const lf = inputFault([['the number of loading doses', o.loadingCount, 0, 20, '']]);
    if (lf) return { valid: false, message: lf };
    loadCount = Number(o.loadingCount);
    if (!Number.isInteger(loadCount)) return { valid: false, message: 'Enter the number of loading doses as a whole number.' };
    if (loadCount > 0) {
      const lf2 = inputFault([['the loading dose', o.loadingDose, null, 100000, basis === 'mg' ? 'mg' : 'mg/kg']]);
      if (lf2) return { valid: false, message: lf2 };
      perLoad = ndcHcpcsUnits({ dose: mg(Number(o.loadingDose)), doseUnit: 'mg', unitSize: unitMg, unitUnit: 'mg', rounding: 'up' });
    }
  } else notes.push('The number of loading doses was not entered, so none are counted.');
  const total = count * perMaint.billingUnits + (perLoad ? loadCount * perLoad.billingUnits : 0);
  const lines = [`${count} maintenance dose${count === 1 ? '' : 's'} of ${maint} mg = ${perMaint.exactUnits} units each, billed as ${perMaint.billingUnits}`];
  if (perLoad) lines.push(`${loadCount} loading dose${loadCount === 1 ? '' : 's'} of ${perLoad.dose} mg = ${perLoad.exactUnits} units each, billed as ${perLoad.billingUnits}`);
  if (!perMaint.isCleanMultiple || (perLoad && !perLoad.isCleanMultiple)) notes.push('A dose that is not a whole number of billing units is rounded up on each administration, not once over the total; any discarded drug is billed separately with the JW modifier.');
  notes.push('Administrations are counted from the first maintenance dose at the fixed interval through the last day of the period.');
  return {
    valid: true,
    administrations: count + loadCount,
    units: total,
    band: `Request ${total} billing units: ${lines.join('; ')}.`,
    bandLabel: `${total} units`,
    notes,
    note: POSTURE,
  };
}
