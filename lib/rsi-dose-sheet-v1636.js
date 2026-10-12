// spec-v1636 tool 7: intubation drug doses from the labels, one row per drug.
//
// Sources, DailyMed labels re-read October 12, 2026:
//   AMIDATE (etomidate), Hospira (set b7ed5bf8-..., version 27): "The dose for induction of anesthesia
//     in adult patients and in pediatric patients above the age of ten (10) years will vary between
//     0.2 mg/kg and 0.6 mg/kg ... The usual dose for induction in these patients is 0.3 mg/kg,
//     injected over a period of 30 to 60 seconds. There are inadequate data to make dosage
//     recommendations ... in patients below the age of ten (10) years; therefore, such use is not
//     recommended." 2 mg/mL.
//   KETALAR (ketamine), Par (set 14e8f864-..., version 33). 2.2: intravenous "may range from 1 mg/kg
//     to 4.5 mg/kg. The average amount required ... is 2 mg/kg. Administer KETALAR slowly (i.e., over
//     a period of 60 seconds)"; intramuscular "6.5 to 13 mg/kg". 8.4: "Safety and effectiveness in
//     pediatric patients below the age of 16 have not been established." 10, 50 and 100 mg/mL; "Do
//     not administer the 100 mg/mL concentration ... intravenously without proper dilution".
//   ANECTINE (succinylcholine), Sandoz (set 04a4e6f5-..., version 9). 2.2 adults: "The average dose
//     ... to facilitate tracheal intubation is 0.6 mg/kg ... may be from 0.3 to 1.1 mg/kg". 2.3
//     pediatric, emergency tracheal intubation: "2 mg/kg for infants and other small pediatric
//     patients; for older pediatric patients and adolescents the dose is 1 mg/kg". 2.4
//     intramuscular: "up to 3 to 4 mg/kg ..., but not more than 150 mg total". 20 mg/mL.
//   Rocuronium Bromide Injection, Baxter (set a18fce42-..., version 1). 2.2: "0.6 mg/kg". 2.3 Rapid
//     Sequence Intubation: "0.6 to 1.2 mg/kg". Pediatric: initial intubation dose 0.6 mg/kg (0.45
//     mg/kg may be used); "not recommended for rapid sequence intubation in pediatric patients".
//     Obese patients: 0.6 mg/kg "based upon the patient's actual body weight". 10 mg/mL.
//
// Only the rocuronium label has a rapid sequence section. The other three give induction or
// intubation doses, and the sheet says so; no textbook rapid-sequence figure is imported.
//
// Pure: the clock is a parameter (used only for the label rows).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABELS = {
  etomidate: { name: 'AMIDATE', setId: 'b7ed5bf8-ba75-44dc-8f81-96b4ad5766be' },
  ketamine: { name: 'KETALAR', setId: '14e8f864-8b8a-4e7e-8439-e510d3107063' },
  succinylcholine: { name: 'ANECTINE', setId: '04a4e6f5-6fa1-42e1-a3f9-21fca7786b15' },
  rocuronium: { name: 'Rocuronium Bromide Injection', setId: 'a18fce42-0f3d-4354-845e-57c37ac3a147' },
};
export const PATIENTS = [
  { value: 'adult', text: 'Adult' },
  { value: 'older-child-or-adolescent', text: 'Older pediatric patient or adolescent' },
  { value: 'infant-or-small-child', text: 'Infant or other small pediatric patient' },
];
export const KETAMINE = [
  { value: '10-mg-ml', text: '10 mg/mL', mgMl: 10 },
  { value: '50-mg-ml', text: '50 mg/mL', mgMl: 50 },
  { value: '100-mg-ml', text: '100 mg/mL (the label: not intravenously without dilution)', mgMl: 100 },
];
const NOTE = 'Each drug\'s labeled induction or intubation dose at the weight entered. Only the rocuronium label has a rapid sequence section; the others give induction and intubation doses. This is not a protocol, and it does not choose a drug or a point in a range.';
const n1 = (x) => (Math.round(x * 10) / 10).toLocaleString('en-US');
const n2 = (x) => (Math.round(x * 100) / 100).toLocaleString('en-US');
const range = (lo, hi, kg, mgMl) => `${n1(lo * kg)} to ${n1(hi * kg)} mg (${n2(lo * kg / mgMl)} to ${n2(hi * kg / mgMl)} mL)`;
const one = (perKg, kg, mgMl) => `${n1(perKg * kg)} mg (${n2(perKg * kg / mgMl)} mL)`;

export function rsiDoseSheet(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the weight', o.weight, 0.4, 300, 'kg'], ['the age', o.age, 0, 120, 'years']]);
  if (f) return { valid: false, message: f };
  const pt = PATIENTS.find((x) => x.value === String(o.patient ?? '').trim());
  if (!pt) return { valid: false, message: 'Choose the patient group: the succinylcholine and rocuronium labels dose adults, older pediatric patients and small pediatric patients differently.' };
  const ket = KETAMINE.find((x) => x.value === String(o.ketamineConcentration ?? '').trim());
  if (!ket) return { valid: false, message: 'Choose the ketamine concentration in hand: 10, 50 or 100 mg/mL.' };
  const kg = Number(o.weight); const age = Number(o.age);
  const adult = pt.value === 'adult';
  const rows = []; const notes = []; const withheld = [];
  const use = (key) => { const lr = labelRow(LABELS[key].setId, now, table); if (!lr.answers) withheld.push(`${LABELS[key].name}: ${lr.why}`); return lr; };

  let lr = use('etomidate');
  if (lr.answers) {
    if (age > 10) rows.push({ drug: 'etomidate', dose: true, text: `Etomidate (2 mg/mL), induction: usual 0.3 mg/kg, ${one(0.3, kg, 2)}; label range 0.2 to 0.6 mg/kg, ${range(0.2, 0.6, kg, 2)}. Injected over 30 to 60 seconds.` });
    else rows.push({ drug: 'etomidate', dose: false, text: age < 10 ? 'Etomidate: the label gives no dose below 10 years of age (inadequate data; such use is not recommended).' : 'Etomidate: the label doses patients "above the age of ten" and gives none "below the age of ten"; at exactly 10 years it says neither, and no dose is shown.' });
  }
  lr = use('ketamine');
  if (lr.answers) {
    if (age >= 16) rows.push({ drug: 'ketamine', dose: true, text: `Ketamine (${ket.mgMl} mg/mL), induction: intravenous 1 to 4.5 mg/kg, ${range(1, 4.5, kg, ket.mgMl)}, given slowly over 60 seconds; the label's average is 2 mg/kg, ${one(2, kg, ket.mgMl)}. Intramuscular 6.5 to 13 mg/kg, ${range(6.5, 13, kg, ket.mgMl)}.${ket.mgMl === 100 ? ' The label says not to give the 100 mg/mL concentration intravenously without proper dilution.' : ''}` });
    else rows.push({ drug: 'ketamine', dose: false, text: 'Ketamine: the label says safety and effectiveness below the age of 16 have not been established, and gives no pediatric dose.' });
  }
  lr = use('succinylcholine');
  if (lr.answers) {
    const im = 3 * kg >= 150
      ? 'Intramuscular, when no vein is accessible: 150 mg, the label\'s maximum by this route (3 to 4 mg/kg would be more).'
      : `Intramuscular, when no vein is accessible: up to 3 to 4 mg/kg, ${n1(3 * kg)} to ${n1(Math.min(4 * kg, 150))} mg, not more than 150 mg in all.`;
    if (adult) rows.push({ drug: 'succinylcholine', dose: true, text: `Succinylcholine (20 mg/mL), tracheal intubation in adults: average 0.6 mg/kg, ${one(0.6, kg, 20)}; label range 0.3 to 1.1 mg/kg, ${range(0.3, 1.1, kg, 20)}. ${im}` });
    else { const per = pt.value === 'infant-or-small-child' ? 2 : 1; rows.push({ drug: 'succinylcholine', dose: true, text: `Succinylcholine (20 mg/mL), emergency tracheal intubation: ${per} mg/kg for ${per === 2 ? 'infants and other small pediatric patients' : 'older pediatric patients and adolescents'}, ${one(per, kg, 20)}. ${im}` }); }
  }
  lr = use('rocuronium');
  if (lr.answers) {
    if (adult) rows.push({ drug: 'rocuronium', dose: true, text: `Rocuronium (10 mg/mL): tracheal intubation 0.6 mg/kg, ${one(0.6, kg, 10)}; rapid sequence intubation 0.6 to 1.2 mg/kg, ${range(0.6, 1.2, kg, 10)}. In obese patients the label bases 0.6 mg/kg on actual body weight.` });
    else rows.push({ drug: 'rocuronium', dose: true, text: `Rocuronium (10 mg/mL), pediatric tracheal intubation: 0.6 mg/kg, ${one(0.6, kg, 10)} (the label allows 0.45 mg/kg, ${one(0.45, kg, 10)}, depending on anesthetic technique and age). The label does not recommend rocuronium for rapid sequence intubation in pediatric patients.` });
  }
  if (!rows.length) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, band: `All four label rows are withheld (${withheld.join('; ')}). Read the doses from the labels in hand.`, bandLabel: 'Withheld', notes: [], note: NOTE };
  if (withheld.length) notes.push(`Not shown, because the label row is withheld: ${withheld.join('; ')}.`);
  if (!adult) notes.push('The succinylcholine label does not define "small" and "older" pediatric patients by age or weight; the group is the reader\'s classification.');
  if (adult && age < 16) notes.push(`An age of ${age} was entered with the adult group: the ketamine and etomidate rows follow the age, the other two the group.`);
  notes.push('The weight entered is used for every drug. Only the rocuronium label states a weight basis (actual body weight).');
  notes.push('Labels read: AMIDATE, KETALAR, ANECTINE and Rocuronium Bromide Injection (Baxter), each a watched label row.');
  const none = rows.filter((r) => !r.dose).length;
  return {
    valid: true, flag: none ? 'some-drugs-have-no-label-dose' : 'sheet', abnormal: none > 0 || withheld.length > 0, labelUrl: labelRow(LABELS.rocuronium.setId, now, table).url,
    rows: rows.map((r) => ({ drug: r.drug, hasDose: r.dose, text: r.text })),
    band: `${rows.filter((r) => r.dose).length} of 4 drugs have a labeled dose for this patient at ${kg} kg${none ? `; ${none} ${none === 1 ? 'does' : 'do'} not, and ${none === 1 ? 'its row says' : 'their rows say'} why` : ''}. ${rows[0].text}`,
    bandLabel: `${rows.filter((r) => r.dose).length} of 4 drugs dosed`, notes: [...rows.slice(1).map((r) => r.text), ...notes], note: NOTE,
  };
}
