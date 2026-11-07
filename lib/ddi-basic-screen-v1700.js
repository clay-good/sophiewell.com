// spec-v1700 (drug-interaction-kinetics tool 1): ICH M12's basic methods for excluding a CYP inhibition risk
// from in vitro data (section 2.1.2.1 and 2.1.2.2, read November 7, 2026):
//   reversible:          Cmax,u / Ki,u < 0.02
//   intestinal CYP3A:    (Dose / 250 mL) / Ki,u < 10 (orally administered CYP3A inhibitors)
//   time-dependent:      (kobs + kdeg) / kdeg < 1.25, kobs = kinact x 5 Cmax,u / (KI,u + 5 Cmax,u)
// "If the reliability of fu,p measurements <1% cannot be demonstrated, a default value of 1% ... should be used."
// A ratio at its cutoff is not excluded: every test is a strict "<".
//
// Pure: no DOM, no clock, no network.

import { measured } from './num.js';
import { CUTOFFS, ENZYME_OPTIONS, enzymeRow } from './ich-m12.js';

export { ENZYME_OPTIONS };
export const MECHANISM_OPTIONS = [
  { value: 'reversible', text: 'Reversible inhibition (systemic)' },
  { value: 'gut', text: 'Reversible inhibition of intestinal CYP3A (oral drug)' },
  { value: 'tdi', text: 'Time-dependent inhibition' },
];
export const UNIT_OPTIONS = [
  { value: 'uM', text: 'µM' },
  { value: 'nM', text: 'nM' },
  { value: 'ngml', text: 'ng/mL (needs the molecular weight)' },
];

const sig = (x) => Number(x.toPrecision(4));

// toMicromolar(value, unit, mw) -> µM, or a message.
export function toMicromolar(v, unit, mw) {
  if (unit === 'uM') return { value: v };
  if (unit === 'nM') return { value: v / 1000 };
  if (unit === 'ngml') {
    if (mw === null) return { message: 'A concentration in ng/mL needs the molecular weight (g/mol) to become molar.' };
    return { value: v / mw };
  }
  return { message: 'Choose the concentration unit.' };
}

function pos(label, raw, required = true) {
  const v = measured(raw);
  if (v === null) return required ? { message: `Enter ${label}.` } : { value: null };
  if (!(v > 0)) return { message: `${label.charAt(0).toUpperCase()}${label.slice(1)} must be above 0.` };
  return { value: v };
}

export function ddiBasicScreen(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mech = String(o.mechanism ?? '').trim();
  if (!['reversible', 'gut', 'tdi'].includes(mech)) return { valid: false, message: 'Choose the mechanism: reversible, intestinal CYP3A, or time-dependent inhibition.' };
  const unit = String(o.unit ?? '').trim();
  const mw = pos('the molecular weight', o.mw, false);
  if (mw.message) return { valid: false, message: mw.message };
  const notes = [];
  const conc = (label, raw) => {
    const p = pos(label, raw);
    if (p.message) return p;
    const c = toMicromolar(p.value, unit, mw.value);
    return c;
  };

  if (mech === 'gut') {
    const dose = pos('the maximum clinical dose in mg', o.dose);
    if (dose.message) return { valid: false, message: dose.message };
    if (mw.value === null) return { valid: false, message: 'Enter the molecular weight (g/mol); the dose is converted to a molar concentration in 250 mL.' };
    const ki = conc('Ki,u', o.ki);
    if (ki.message) return { valid: false, message: ki.message };
    const igut = ((dose.value / mw.value) * 1000) / 0.25;
    const ratio = igut / ki.value;
    if (!Number.isFinite(ratio)) return { valid: false, message: 'These inputs give no finite ratio.' };
    notes.push(`Dose / 250 mL = ${dose.value} mg / ${mw.value} g/mol x 1,000 / 0.25 L = ${sig(igut)} µM; Ki,u ${sig(ki.value)} µM.`);
    return result('gut', ratio, CUTOFFS.gut, '(Dose / 250 mL) / Ki,u', notes);
  }

  // Cmax,u: entered directly, or Cmax x fu,p with M12's 1% floor.
  let cmaxu;
  const direct = measured(o.cmaxu);
  if (direct !== null) {
    if (measured(o.cmax) !== null || measured(o.fup) !== null) return { valid: false, message: 'Enter Cmax,u, or Cmax with fu,p, not both.' };
    const c = conc('Cmax,u', o.cmaxu);
    if (c.message) return { valid: false, message: c.message };
    cmaxu = c.value;
    notes.push(`Cmax,u ${sig(cmaxu)} µM as entered.`);
  } else {
    const cmax = conc('Cmax at the highest dose at steady state (or Cmax,u directly)', o.cmax);
    if (cmax.message) return { valid: false, message: cmax.message };
    const fup = pos('fu,p (the unbound fraction in plasma)', o.fup);
    if (fup.message) return { valid: false, message: fup.message };
    if (fup.value > 1) return { valid: false, message: 'fu,p is a fraction from 0 to 1.' };
    const validated = o.fupValidated === true || o.fupValidated === 'true';
    let used = fup.value;
    if (fup.value < CUTOFFS.fupFloor && !validated) {
      used = CUTOFFS.fupFloor;
      notes.push(`fu,p ${fup.value} is below 1% and was not marked validated, so M12's default of 0.01 was used.`);
    } else if (fup.value < CUTOFFS.fupFloor) notes.push(`fu,p ${fup.value} below 1% was used as entered (marked validated).`);
    cmaxu = cmax.value * used;
    notes.push(`Cmax,u = Cmax ${sig(cmax.value)} µM x fu,p ${used} = ${sig(cmaxu)} µM.`);
  }

  if (mech === 'reversible') {
    const ki = conc('Ki,u', o.ki);
    if (ki.message) return { valid: false, message: ki.message };
    notes.push(`Ki,u ${sig(ki.value)} µM.`);
    return result('reversible', cmaxu / ki.value, CUTOFFS.reversible, 'Cmax,u / Ki,u', notes);
  }
  const kI = conc('KI,u', o.kI);
  if (kI.message) return { valid: false, message: kI.message };
  const kinact = pos('kinact (per minute)', o.kinact);
  if (kinact.message) return { valid: false, message: kinact.message };
  let kdeg = measured(o.kdeg);
  const row = enzymeRow(String(o.enzyme ?? ''));
  if (kdeg === null) {
    if (!row) return { valid: false, message: 'Choose the enzyme (for M12 Table 6\'s kdeg) or enter kdeg.' };
    kdeg = row.kdegPerMin;
    notes.push(`kdeg ${kdeg}/min for ${row.text} from M12 Table 6 (half-life ${row.halfLifeH} h).`);
  } else {
    if (!(kdeg > 0)) return { valid: false, message: 'kdeg must be above 0.' };
    notes.push(`kdeg ${kdeg}/min as entered.`);
  }
  const kobs = (kinact.value * 5 * cmaxu) / (kI.value + 5 * cmaxu);
  notes.push(`kobs = kinact x 5 Cmax,u / (KI,u + 5 Cmax,u) = ${sig(kobs)}/min.`);
  return result('tdi', (kobs + kdeg) / kdeg, CUTOFFS.tdi, '(kobs + kdeg) / kdeg', notes);
}

function result(mech, ratio, cutoff, formula, notes) {
  if (!Number.isFinite(ratio)) return { valid: false, message: 'These inputs give no finite ratio.' };
  const excluded = ratio < cutoff;
  const r = sig(ratio);
  return {
    valid: true, mechanism: mech, ratio: r, cutoff, excluded, abnormal: !excluded,
    band: excluded
      ? `${formula} = ${r}, below ${cutoff}: risk excluded by the basic method.`
      : `${formula} = ${r}, not below ${cutoff}: not excluded; M12 sends this to a mechanistic static or PBPK model (section 7.5).`,
    bandLabel: excluded ? 'Excluded' : 'Not excluded',
    notes: [...notes, `ICH M12 excludes the risk only when the ratio is below ${cutoff}; a ratio at the cutoff is not excluded.`],
    note: 'A development-stage screen in ICH M12\'s terms, not a prediction for a patient. Cmax,u and Ki,u are compared in one unit (µM here).',
  };
}
