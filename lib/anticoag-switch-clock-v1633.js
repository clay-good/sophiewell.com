// spec-v1633 tool 1: when to start the next anticoagulant, as the DOAC labels state it.
//
// Four label rows (spec-v1628 section 1), each re-read on October 11, 2026:
//   Eliquis (apixaban), section 2.5 "Converting from or to ELIQUIS": from warfarin, "started when the
//     international normalized ratio (INR) is below 2.0"; to warfarin, "One approach is to discontinue
//     ELIQUIS and begin both a parenteral anticoagulant and warfarin at the time the next dose of
//     ELIQUIS would have been taken"; to or from other anticoagulants, "at the usual time of the next
//     dose".
//   Xarelto (rivaroxaban), section 2.3: from warfarin, "as soon as the International Normalized Ratio
//     (INR) is below 3.0 in adults and below 2.5 in pediatric patients"; to warfarin, adults "No
//     clinical trial data are available" and the same one approach; pediatric, continue "for at least
//     2 days after the first dose of warfarin ... until the INR is >= 2.0"; from another non-warfarin
//     anticoagulant, "0 to 2 hours prior to the next scheduled administration"; from a heparin
//     infusion, "stop the infusion and start XARELTO at the same time".
//   Pradaxa capsules (dabigatran), sections 2.6 and 2.7: from warfarin, INR "below 2.0"; to warfarin,
//     start warfarin 3 days (CrCl >= 50), 2 days (30-50) or 1 day (15-30) before stopping, "CrCl < 15
//     mL/min, no recommendations can be made"; pediatric eGFR >= 50, 3 days; from a parenteral drug,
//     "0 to 2 hours before the time that the next dose" or when a continuous infusion is stopped; to a
//     parenteral drug, wait 12 hours (CrCl >= 30) or 24 hours (CrCl < 30), pediatric 12 hours.
//   Savaysa (edoxaban), section 2.4, both transition tables: from warfarin, INR "<= 2.5"; from another
//     oral anticoagulant or LMWH, at the next scheduled dose; from unfractionated heparin, "4 hours
//     later"; to warfarin, an oral option (60 to 30 mg, 30 to 15 mg) and a parenteral option.
//
// The four INR thresholds differ by drug and are never carried from one label to another. A switch
// between two non-warfarin drugs can be covered by both labels; both rows are then shown. Dose
// selection for the new drug is doac-dose-check.
//
// Pure: no DOM, no network; `now` is passed in. Date-times are wall-clock values, taken as entered.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const DRUGS = [
  { value: 'warfarin', text: 'Warfarin' },
  { value: 'apixaban', text: 'Apixaban (Eliquis)' },
  { value: 'rivaroxaban', text: 'Rivaroxaban (Xarelto)' },
  { value: 'dabigatran', text: 'Dabigatran (Pradaxa capsules)' },
  { value: 'edoxaban', text: 'Edoxaban (Savaysa)' },
  { value: 'lmwh', text: 'LMWH or another intermittent parenteral anticoagulant' },
  { value: 'ufh', text: 'Unfractionated heparin, continuous infusion' },
];
export const POPULATIONS = [{ value: 'adult', text: 'Adult' }, { value: 'pediatric', text: 'Pediatric' }];
export const EDOXABAN_OPTIONS = [{ value: 'oral', text: 'Oral option (reduce edoxaban, start warfarin)' }, { value: 'parenteral', text: 'Parenteral option (stop edoxaban, bridge)' }];
export const EDOXABAN_DOSES = [{ value: '60', text: '60 mg once daily' }, { value: '30', text: '30 mg once daily' }];
export const LABELS = {
  apixaban: { brand: 'Eliquis', section: '2.5', setId: 'e9481622-7cc6-418a-acb6-c5450daae9b0' },
  rivaroxaban: { brand: 'Xarelto', section: '2.3', setId: '10db92f9-2300-4a80-836b-673e1ae91610' },
  dabigatran: { brand: 'Pradaxa', section: '2.6 and 2.7', setId: 'ba74e3cd-b06f-4145-b284-5fd6b84ff3c9' },
  edoxaban: { brand: 'Savaysa', section: '2.4', setId: 'e77d3400-56ad-11e3-949a-0800200c9a66' },
};
const DOACS = ['apixaban', 'rivaroxaban', 'dabigatran', 'edoxaban'];
const NAME = { warfarin: 'warfarin', apixaban: 'Eliquis', rivaroxaban: 'Xarelto', dabigatran: 'Pradaxa', edoxaban: 'Savaysa', lmwh: 'the parenteral anticoagulant', ufh: 'the heparin infusion' };
const NOTE = 'This reports what the label gives for these inputs. It does not prescribe. Dose selection for the new drug is a separate check (DOAC Dose Check by Indication).';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

// 'YYYY-MM-DDTHH:MM' (a datetime-local value) -> minutes since the epoch as a wall-clock value, or null.
function parseWhen(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})$/.exec(String(v ?? '').trim());
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const t = Date.UTC(y, mo - 1, d, h, mi);
  const back = new Date(t);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d || h > 23 || mi > 59) return null;
  return t;
}
const show = (t) => new Date(t).toISOString().slice(0, 16).replace('T', ' ');
const HOUR = 3600000;

// The INR at which the to-drug's label starts it after warfarin.
const INR_RULE = {
  apixaban: () => ({ limit: 2.0, inclusive: false }),
  rivaroxaban: (pop) => ({ limit: pop === 'pediatric' ? 2.5 : 3.0, inclusive: false }),
  dabigatran: () => ({ limit: 2.0, inclusive: false }),
  edoxaban: () => ({ limit: 2.5, inclusive: true }),
};

export function anticoagSwitchClock(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const from = String(o.from ?? '').trim(); const to = String(o.to ?? '').trim();
  if (!DRUGS.some((d) => d.value === from)) return { valid: false, message: 'Choose the anticoagulant being stopped.' };
  if (!DRUGS.some((d) => d.value === to)) return { valid: false, message: 'Choose the anticoagulant being started.' };
  if (from === to) return { valid: false, message: 'Choose two different anticoagulants: this is a switch from one to another.' };
  const pop = String(o.population ?? '').trim();
  if (pop !== 'adult' && pop !== 'pediatric') return { valid: false, message: 'Choose adult or pediatric: two of the labels give different rules for children.' };
  if (!DOACS.includes(from) && !DOACS.includes(to)) {
    return { valid: true, flag: 'not-covered', abnormal: true, band: 'None of the four DOAC labels covers a switch between warfarin and a heparin, or between two heparins. Nothing is reported for it.', bandLabel: 'Not covered', notes: ['This tool holds the switching rules of the Eliquis, Xarelto, Pradaxa and Savaysa labels only.'], note: NOTE };
  }
  let next = null; let last = null;
  if (!blank(o.nextDose)) { next = parseWhen(o.nextDose); if (next === null) return { valid: false, message: 'Enter the next scheduled dose as a date and time (YYYY-MM-DDTHH:MM), or leave it blank.' }; }
  if (!blank(o.lastDose)) { last = parseWhen(o.lastDose); if (last === null) return { valid: false, message: 'Enter the last dose as a date and time (YYYY-MM-DDTHH:MM), or leave it blank.' }; }

  const editions = [];
  // label(drug) -> the watched row, or null when its text is withheld (and a note says so).
  const withheld = [];
  const label = (drug) => {
    const L = LABELS[drug]; const row = labelRow(L.setId, now, table);
    if (!row.answers) { withheld.push(`The ${L.brand} label's rule is withheld: ${row.why}. Read it from the label in hand.`); return null; }
    if (!editions.includes(row.edition)) editions.push(row.edition);
    return L;
  };
  const done = (r) => ({ valid: true, from, to, population: pop, ...r, notes: [...(r.notes || []), ...withheld, ...editions.map((e) => `Label: ${e}.`)], note: NOTE });
  const allWithheld = (drug) => done({ withheld: true, labelUrl: labelRow(LABELS[drug].setId, now, table).url, band: `The ${LABELS[drug].brand} label's switching rule is withheld, so nothing is reported.`, bandLabel: 'Withheld' });
  const nextText = next === null ? '' : ` That is ${show(next)}.`;
  const askNext = next === null ? ['Enter the time of the next scheduled dose of the drug being stopped to see this as a date and time.'] : [];

  // --- from warfarin: the INR threshold of the drug being started ---
  if (from === 'warfarin') {
    const L = label(to); if (!L) return allWithheld(to);
    const f = inputFault([['the current INR', o.inr, 0.5, 20, '']]);
    if (f) return { valid: false, message: `${f} The ${L.brand} label starts it at an INR threshold.` };
    const inr = Number(o.inr); const rule = INR_RULE[to](pop);
    const words = rule.inclusive ? `${rule.limit.toFixed(1)} or below` : `below ${rule.limit.toFixed(1)}`;
    const met = rule.inclusive ? inr <= rule.limit : inr < rule.limit;
    const notes = [`${L.brand} label, section ${L.section}: discontinue warfarin and start ${L.brand} when the INR is ${words}${to === 'rivaroxaban' ? ` (${pop} patients; the label gives below 3.0 for adults and below 2.5 for pediatric patients)` : ''}.`, 'Each DOAC label has its own INR threshold; this one is not carried to another drug.'];
    if (pop === 'pediatric' && to === 'edoxaban') notes.push('The Savaysa label has no pediatric indication; its transition table is not stated for children.');
    return done({ flag: met ? 'start-now' : 'not-yet', met, threshold: rule.limit, abnormal: !met, band: met ? `INR ${inr} is ${words}: the ${L.brand} label's condition to stop warfarin and start ${L.brand} is met.` : `INR ${inr} is not yet ${words}: not yet, by the ${L.brand} label.`, bandLabel: met ? 'Condition met' : 'Not yet', notes });
  }

  // --- to warfarin: the label of the DOAC being stopped ---
  if (to === 'warfarin') {
    const L = label(from); if (!L) return allWithheld(from);
    if (from === 'apixaban' || (from === 'rivaroxaban' && pop === 'adult')) {
      const notes = [`${L.brand} label, section ${L.section}: ${L.brand} affects the INR, so INR measurements during the transition may not be useful for choosing the warfarin dose.`];
      if (from === 'rivaroxaban') notes.push('The label says no clinical trial data are available to guide converting patients from Xarelto to warfarin.');
      else notes.push('The label has the parenteral anticoagulant discontinued when the INR reaches an acceptable range.');
      return done({ flag: 'overlap-plan', startAt: next === null ? undefined : show(next), abnormal: false, band: `The ${L.brand} label gives one approach: discontinue ${L.brand} and begin both a parenteral anticoagulant and warfarin at the time the next ${L.brand} dose would have been taken.${nextText}`, bandLabel: next === null ? 'At the next dose time' : show(next), notes: [...notes, ...askNext] });
    }
    if (from === 'rivaroxaban') {
      return done({ flag: 'overlap-plan', abnormal: false, band: 'The Xarelto label, for pediatric patients: continue Xarelto for at least 2 days after the first dose of warfarin; after 2 days, obtain an INR before the next scheduled Xarelto dose; continue both until the INR is 2.0 or above.', bandLabel: 'Overlap until INR ≥ 2.0', notes: ['Once Xarelto is discontinued, the label says INR testing may be done reliably 24 hours after the last dose.'] });
    }
    if (from === 'dabigatran') {
      const measure = pop === 'pediatric' ? 'eGFR' : 'creatinine clearance'; const unit = pop === 'pediatric' ? 'mL/min/1.73 m²' : 'mL/min';
      const f = inputFault([[`the ${measure}`, o.crcl, 0, 250, unit]]);
      if (f) return { valid: false, message: `${f} The Pradaxa label sets the warfarin start by ${measure}.` };
      const k = Number(o.crcl);
      const tail = ['Because Pradaxa can increase the INR, the label says the INR better reflects warfarin\'s effect only after Pradaxa has been stopped for at least 2 days.'];
      if (pop === 'pediatric') {
        if (k >= 50) return done({ flag: 'overlap-plan', daysBefore: [3], abnormal: false, band: 'The Pradaxa label, for pediatric patients with an eGFR of 50 mL/min/1.73 m² or above: start warfarin 3 days before discontinuing Pradaxa.', bandLabel: 'Warfarin 3 days before', notes: tail });
        return done({ flag: 'no-recommendation-given', abnormal: true, band: 'The Pradaxa label says pediatric patients with an eGFR below 50 mL/min/1.73 m² have not been studied, and to avoid Pradaxa in them. It gives no warfarin start for this value.', bandLabel: 'Not studied', notes: tail });
      }
      if (k < 15) return done({ flag: 'no-recommendation-given', abnormal: true, band: 'The Pradaxa label: for a creatinine clearance below 15 mL/min, no recommendations can be made.', bandLabel: 'No recommendation', notes: tail });
      // The label prints >= 50, 30-50 and 15-30: 50 and 30 each sit in two rows, and both are shown.
      const days = k > 50 ? [3] : k === 50 ? [3, 2] : k > 30 ? [2] : k === 30 ? [2, 1] : [1];
      const band = days.length === 2
        ? (k === 50
          ? 'The Pradaxa label prints 50 mL/min in two rows (50 or above, and 30-50): start warfarin 3 days, or 2 days, before discontinuing Pradaxa. Both rows are shown.'
          : 'The Pradaxa label prints 30 mL/min in two rows (30-50 and 15-30): start warfarin 2 days, or 1 day, before discontinuing Pradaxa. Both rows are shown.')
        : `The Pradaxa label, for a creatinine clearance of ${k} mL/min: start warfarin ${days[0]} day${days[0] === 1 ? '' : 's'} before discontinuing Pradaxa.`;
      return done({ flag: 'overlap-plan', daysBefore: days, abnormal: false, band, bandLabel: `Warfarin ${days.join(' or ')} day${days.length === 1 && days[0] === 1 ? '' : 's'} before`, notes: ['The label\'s rows: 50 mL/min or above, 3 days; 30 to 50, 2 days; 15 to 30, 1 day; below 15, no recommendation.', ...tail] });
    }
    // edoxaban
    const option = String(o.edoxabanOption ?? '').trim();
    if (option !== 'oral' && option !== 'parenteral') return { valid: false, message: 'Choose the oral option or the parenteral option: the Savaysa label gives both for a switch to warfarin.' };
    const ped = pop === 'pediatric' ? ['The Savaysa label has no pediatric indication; its transition table is not stated for children.'] : [];
    if (option === 'parenteral') {
      return done({ flag: 'overlap-plan', startAt: next === null ? undefined : show(next), abnormal: false, band: `The Savaysa label, parenteral option: discontinue Savaysa and give a parenteral anticoagulant and warfarin at the time of the next scheduled Savaysa dose.${nextText}`, bandLabel: next === null ? 'At the next dose time' : show(next), notes: ['Once a stable INR of 2.0 or above is achieved, the parenteral anticoagulant is discontinued and warfarin continued.', ...ped, ...askNext] });
    }
    const dose = String(o.edoxabanDose ?? '').trim();
    if (dose !== '60' && dose !== '30') return { valid: false, message: 'Choose the current Savaysa dose, 60 mg or 30 mg: the oral option halves it.' };
    const reduced = dose === '60' ? 30 : 15;
    return done({ flag: 'overlap-plan', reducedDoseMg: reduced, abnormal: false, band: `The Savaysa label, oral option: reduce Savaysa from ${dose} mg to ${reduced} mg and begin warfarin with it; discontinue Savaysa once a stable INR of 2.0 or above is achieved.`, bandLabel: `Savaysa ${reduced} mg with warfarin`, notes: ['The INR must be measured at least weekly and just before the daily Savaysa dose, to minimize the influence of Savaysa on the measurement.', ...ped] });
  }

  // --- neither is warfarin: the leaving row of the from-label and the arriving row of the to-label ---
  const rows = [];
  const parenteral = (d) => d === 'lmwh' || d === 'ufh';
  if (DOACS.includes(from)) {
    const L = label(from);
    if (L) {
      if (from === 'dabigatran') {
        if (parenteral(to)) {
          let hours;
          if (pop === 'pediatric') hours = [12];
          else {
            const f = inputFault([['the creatinine clearance', o.crcl, 0, 250, 'mL/min']]);
            if (f) return { valid: false, message: `${f} The Pradaxa label waits 12 or 24 hours by creatinine clearance.` };
            hours = Number(o.crcl) >= 30 ? [12] : [24];
          }
          rows.push({ brand: L.brand, kind: 'wait', hours: hours[0], text: `wait ${hours[0]} hours after the last dose of Pradaxa before starting the parenteral anticoagulant${pop === 'pediatric' ? ' (pediatric patients)' : ` (the label gives 12 hours at a creatinine clearance of 30 mL/min or above, 24 hours below 30)`}`, at: last === null ? null : last + hours[0] * HOUR });
        } else {
          rows.push({ brand: L.brand, kind: 'none', text: 'the Pradaxa label gives no rule for a switch from Pradaxa to another oral anticoagulant other than warfarin' });
        }
      } else if (from === 'rivaroxaban') {
        rows.push({ brand: L.brand, kind: 'next', text: 'discontinue Xarelto and give the first dose of the other anticoagulant (one with rapid onset, oral or parenteral) at the time the next Xarelto dose would have been taken', at: next });
      } else if (from === 'apixaban') {
        rows.push({ brand: L.brand, kind: 'next', text: 'discontinue Eliquis and begin the new anticoagulant at the usual time of the next dose of Eliquis', at: next });
      } else {
        rows.push({ brand: L.brand, kind: 'next', text: `discontinue Savaysa and start the ${parenteral(to) ? 'parenteral' : 'other oral'} anticoagulant at the time of the next dose of Savaysa`, at: next });
      }
    }
  }
  if (DOACS.includes(to)) {
    const L = label(to);
    if (L) {
      if (to === 'apixaban') rows.push({ brand: L.brand, kind: 'next', text: `discontinue ${NAME[from]} and begin Eliquis at the usual time of the next dose of ${NAME[from]}`, at: next });
      else if (to === 'rivaroxaban') {
        if (from === 'ufh') rows.push({ brand: L.brand, kind: 'now', text: 'stop the heparin infusion and start Xarelto at the same time' });
        else rows.push({ brand: L.brand, kind: 'window', text: `start Xarelto 0 to 2 hours before the next scheduled administration of ${NAME[from]}, and omit that dose`, from: next === null ? null : next - 2 * HOUR, at: next });
      } else if (to === 'dabigatran') {
        if (from === 'ufh') rows.push({ brand: L.brand, kind: 'now', text: 'start Pradaxa at the time the continuous infusion is discontinued' });
        else if (from === 'lmwh') rows.push({ brand: L.brand, kind: 'window', text: 'start Pradaxa 0 to 2 hours before the time the next dose of the parenteral drug was to have been given', from: next === null ? null : next - 2 * HOUR, at: next });
        else rows.push({ brand: L.brand, kind: 'none', text: 'the Pradaxa label gives no rule for a switch to Pradaxa from another oral anticoagulant other than warfarin' });
      } else if (from === 'ufh') rows.push({ brand: L.brand, kind: 'after', hours: 4, text: 'discontinue the heparin infusion and start Savaysa 4 hours later' });
      else rows.push({ brand: L.brand, kind: 'next', text: `discontinue ${NAME[from]} and start Savaysa at the time of the next scheduled ${from === 'lmwh' ? 'administration of LMWH' : `dose of ${NAME[from]}`}`, at: next });
    }
  }
  if (!rows.length) return allWithheld(DOACS.includes(to) ? to : from);
  const when = (r) => {
    if (r.kind === 'window' && r.from !== null && r.from !== undefined) return ` That is between ${show(r.from)} and ${show(r.at)}.`;
    if ((r.kind === 'next' || r.kind === 'wait') && r.at !== null && r.at !== undefined) return ` That is ${show(r.at)}.`;
    return '';
  };
  const real = rows.filter((r) => r.kind !== 'none');
  const lead = real[0] || rows[0];
  const notes = rows.filter((r) => r !== lead).map((r) => `${r.brand} label: ${r.text}.${when(r)}`);
  if (real.length === 2) notes.push('Both labels cover this switch and their wording is shown side by side; where they differ, neither is chosen for you.');
  const needsNext = real.some((r) => (r.kind === 'next' || r.kind === 'window') && next === null);
  const needsLast = real.some((r) => r.kind === 'wait' && last === null);
  if (needsNext) notes.push(...askNext);
  if (needsLast) notes.push('Enter the time of the last Pradaxa dose to see this as a date and time.');
  if (pop === 'pediatric' && (from === 'edoxaban' || to === 'edoxaban')) notes.push('The Savaysa label has no pediatric indication; its transition table is not stated for children.');
  if (pop === 'pediatric' && (from === 'apixaban' || to === 'apixaban')) notes.push('The Eliquis label\'s switching section does not give a separate pediatric rule.');
  const timed = lead.kind !== 'none' && when(lead) !== '';
  return done({
    flag: lead.kind === 'none' ? 'no-recommendation-given' : lead.kind === 'now' ? 'start-now' : timed ? 'timed' : 'rule',
    startAt: timed ? show(lead.at) : undefined, windowFrom: lead.kind === 'window' && timed ? show(lead.from) : undefined,
    abnormal: lead.kind === 'none',
    band: lead.kind === 'none' ? `Neither label states this switch: ${rows.map((r) => r.text).join('; ')}.` : `The ${lead.brand} label: ${lead.text}.${when(lead)}`,
    bandLabel: lead.kind === 'none' ? 'No rule given' : lead.kind === 'now' ? 'Start when the infusion stops' : lead.kind === 'after' ? '4 hours after the infusion stops' : timed ? (lead.kind === 'window' ? `${show(lead.from)} to ${show(lead.at).slice(11)}` : show(lead.at)) : lead.kind === 'wait' ? `${lead.hours} hours after the last dose` : 'At the next dose time',
    notes,
  });
}
