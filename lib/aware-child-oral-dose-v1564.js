// spec-v1564 §3: aware-child-oral-dose. A child's oral antibiotic dose by weight band, from the WHO AWaRe
// antibiotic book's dosing guidance for children.
//
// Source: WHO. The WHO AWaRe (Access, Watch, Reserve) antibiotic book. Geneva: WHO; 2022 (IRIS 10665/365237;
// CC BY-NC-SA 3.0 IGO, facts restated, nothing reproduced). Read October 9, 2026: chapter 50, Table 50.1
// (pp. 638-651), each weight-banded row checked against the page images. The eight oral antibiotics the table
// bands by weight are carried as bands; seven oral rows the table doses only by mg/kg (azithromycin at its two
// doses, cefixime, clarithromycin, nitrofurantoin, phenoxymethylpenicillin, oral vancomycin) and doxycycline's
// single cholera dose are computed from the weight, a range where the table gives one, and held to the table's
// daily maximum where it states one. IV, IM and neonatal rows are not carried. Every band runs from its lower
// weight up to, not including, the next ("3 to under 6 kg"); the table starts at 3 kg. The book's trimethoprim
// row carries a stray "mg of sulfamethoxazole/trimethoprim component" line under its weight bands; its bands
// (20, 40, 80 mg) are trimethoprim alone and match its 4 mg/kg.
//
// Stated rather than hidden: under 3 kg is outside the table and is refused; at or above the top band some rows
// say "use the adult dose", which is said, not computed. Doses are for normal kidney and liver function, as the
// table says.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

const every = (h) => `by mouth every ${h} hours`;
// mg/kg rows: [lo, hi] mg/kg a dose, doses a day, the stated daily maximum in mg (null when the table says to
// see adult dosing), and how often.
const PER_KG = [
  { value: 'azithromycin-10', text: 'Azithromycin, lower dose (10 mg/kg)', group: 'Watch', kg: [10, 10], perDay: 1, max: 500, how: 'by mouth once a day', uses: 'acute bloody diarrhea' },
  { value: 'azithromycin-20', text: 'Azithromycin, higher dose (20 mg/kg)', group: 'Watch', kg: [20, 20], perDay: 1, max: 500, how: 'by mouth once a day', uses: 'mild enteric fever; cholera and trachoma as a single dose' },
  { value: 'cefixime', text: 'Cefixime', group: 'Watch', kg: [10, 10], perDay: 1, max: null, how: 'by mouth once a day', uses: 'acute infectious diarrhea' },
  { value: 'clarithromycin', text: 'Clarithromycin', group: 'Watch', kg: [7.5, 7.5], perDay: 2, max: 1000, how: 'by mouth every 12 hours', uses: 'pharyngitis' },
  { value: 'nitrofurantoin', text: 'Nitrofurantoin', group: 'Access', kg: [2, 2], perDay: 2, max: 200, how: 'by mouth every 12 hours', uses: 'lower urinary tract infection', extra: 'Or 1 mg/kg every 6 hours with the immediate-release form.' },
  { value: 'phenoxymethylpenicillin', text: 'Phenoxymethylpenicillin (penicillin V)', group: 'Access', kg: [10, 15], perDay: 4, max: null, how: 'by mouth every 6 to 8 hours', uses: 'pharyngitis, dental infections', extra: '10-15 mg/kg is 16,000-24,000 IU/kg of the potassium salt.', noMaxText: 'no daily maximum is stated' },
  { value: 'vancomycin-oral', text: 'Vancomycin by mouth', group: 'Watch', kg: [5, 10], perDay: 4, max: 2000, how: 'by mouth every 6 hours', uses: 'Clostridioides difficile infection (the higher dose for severe cases); by mouth it is not absorbed, so this is its only oral use' },
];

export const DRUGS = [
  { value: 'amoxicillin', text: 'Amoxicillin', group: 'Access', basis: '80-90 mg/kg a day, up to 1.5 g a day (higher for serious bacterial infections)',
    bands: [[6, '250 mg', 12], [10, '375 mg', 12], [15, '500 mg', 12], [20, '750 mg', 12]], top: { from: 20, text: `500 mg ${every(8)}, or 1 g ${every(12)}` },
    uses: 'pharyngitis, acute otitis media, dental infections, acute sinusitis, mild community-acquired pneumonia, and sepsis when referral to hospital is not possible' },
  { value: 'amoxicillin-clavulanate', text: 'Amoxicillin+clavulanic acid (dose as amoxicillin)', group: 'Access', basis: '80-90 mg/kg a day of the amoxicillin component',
    bands: [[6, '250 mg', 12], [10, '375 mg', 12], [15, '500 mg', 12], [20, '750 mg', 12]], top: { from: 20, text: `500 mg of amoxicillin ${every(8)}, or 1 g of amoxicillin ${every(12)}` }, unit: ' of amoxicillin',
    uses: 'acute otitis media, acute sinusitis, lower urinary tract infection, mild skin and soft tissue infection, low-risk febrile neutropenia; by mouth or IV, mild intra-abdominal, bone and joint infections, hospital-acquired pneumonia, periorbital cellulitis, pyomyositis',
    extra: 'Oral liquids must be refrigerated once made up.' },
  { value: 'cefalexin', text: 'Cefalexin', group: 'Access', basis: '25 mg/kg a dose every 12 hours; the daily maximum is the adult dose',
    bands: [[6, '125 mg', 12], [10, '250 mg', 12], [15, '375 mg', 12], [20, '500 mg', 12], [30, '625 mg', 12]], top: { from: 30, adult: true },
    uses: 'periorbital cellulitis, pharyngitis, pyomyositis, mild skin and soft tissue infection' },
  { value: 'ciprofloxacin', text: 'Ciprofloxacin', group: 'Watch', basis: '15 mg/kg a dose every 12 hours, up to 1.5 g a day by mouth',
    bands: [[6, '50 mg', 12], [10, '100 mg', 12], [15, '150 mg', 12], [20, '200 mg', 12], [30, '300 mg', 12]], top: { from: 30, adult: true },
    uses: 'mild upper urinary tract infection, acute infectious diarrhea, mild intra-abdominal infection, enteric fever, low-risk febrile neutropenia, cholera (a single dose)' },
  { value: 'cloxacillin', text: 'Cloxacillin', group: 'Access', basis: '15 mg/kg a dose every 6 hours',
    bands: [[6, '62.5 mg', 6], [10, '125 mg', 6], [15, '250 mg', 6], [20, '375 mg', 6]], top: { from: 20, text: `500 mg ${every(6)}` },
    uses: 'mild skin and soft tissue infection, bone and joint infections, periorbital cellulitis, pyomyositis' },
  { value: 'metronidazole', text: 'Metronidazole', group: 'Access', basis: '7.5 mg/kg a dose every 8 hours for children, up to 1 g a day; a higher 10-15 mg/kg dose every 8 hours for amoebic abscess',
    bands: [[6, '30 mg', 8], [10, '50 mg', 8], [15, '100 mg', 8], [20, '150 mg', 8], [30, '200 mg', 8]], top: { from: 30, adult: true },
    uses: 'intra-abdominal infections, necrotizing fasciitis, Clostridioides difficile infection; at the higher dose, amoebic abscess',
    extra: 'Newborns are dosed by weight, not these bands: 7.5 mg/kg every 12 hours.' },
  { value: 'smx-tmp', text: 'Sulfamethoxazole+trimethoprim', group: 'Access', basis: '20 mg/kg of sulfamethoxazole + 4 mg/kg of trimethoprim every 12 hours, up to 1,200 mg of sulfamethoxazole a day',
    bands: [[6, '100 mg + 20 mg', 12], [10, '200 mg + 40 mg', 12], [30, '400 mg + 80 mg', 12]], top: { from: 30, adult: true },
    uses: 'lower urinary tract infection, acute infectious diarrhea' },
  { value: 'trimethoprim', text: 'Trimethoprim', group: 'Access', basis: '4 mg/kg every 12 hours',
    bands: [[6, '20 mg', 12], [10, '40 mg', 12], [30, '80 mg', 12]], top: { from: 30, adult: true },
    uses: 'lower urinary tract infection' },
];

// Every choice, bands first, for the select and the adapter.
export const ALL_DRUGS = [...DRUGS, ...PER_KG, { value: 'doxycycline-cholera', text: 'Doxycycline, single dose for cholera' }].map(({ value, text }) => ({ value, text }));

const NOTE = 'WHO AWaRe antibiotic book (2022), Table 50.1, for normal kidney and liver function. Local and national dosing guidance comes first where it exists.';

const mg = (n) => (n < 10 ? (Math.round(n * 10) / 10) : Math.round(n)).toLocaleString('en-US');

function perKgDose(d, kg) {
  const notes = [`Basis: ${d.kg[0] === d.kg[1] ? d.kg[0] : `${d.kg[0]}-${d.kg[1]}`} mg/kg a dose, ${d.how}; ${d.max ? `up to ${d.max.toLocaleString('en-US')} mg a day` : d.noMaxText || 'the daily maximum is the adult dose'}.`, `Used in the book for: ${d.uses}.`, `AWaRe group: ${d.group}.`];
  if (d.extra) notes.push(d.extra);
  const cap = d.max ? d.max / d.perDay : Infinity;
  const lo = Math.min(d.kg[0] * kg, cap); const hi = Math.min(d.kg[1] * kg, cap);
  if (d.max && d.kg[1] * kg > cap) notes.unshift(`Held to the table's daily maximum of ${d.max.toLocaleString('en-US')} mg (${mg(cap)} mg a dose).`);
  const dose = lo === hi ? `${mg(lo)} mg` : `${mg(lo)} to ${mg(hi)} mg`;
  return { valid: true, band: `${d.text}: ${dose} ${d.how} (${kg.toLocaleString('en-US')} kg).`, bandLabel: dose, abnormal: false, notes, note: NOTE };
}

function doxycyclineCholera(kg) {
  const notes = ['Basis: a single dose for cholera, 2-4 mg/kg under 45 kg (under 12 years), 300 mg over 45 kg (over 12 years).', 'AWaRe group: Access.'];
  if (kg === 45) return { valid: true, band: 'Doxycycline for cholera: at exactly 45 kg the table gives no dose (it says under 45 kg and over 45 kg); use the age line, 300 mg over 12 years.', bandLabel: 'Between the lines', abnormal: true, notes, note: NOTE };
  if (kg > 45) return { valid: true, band: 'Doxycycline for cholera: 300 mg by mouth, a single dose (over 45 kg).', bandLabel: '300 mg once', abnormal: false, notes, note: NOTE };
  return { valid: true, band: `Doxycycline for cholera: ${mg(2 * kg)} to ${mg(4 * kg)} mg by mouth, a single dose (${kg.toLocaleString('en-US')} kg).`, bandLabel: `${mg(2 * kg)} to ${mg(4 * kg)} mg once`, abnormal: false, notes, note: NOTE };
}

export function awareChildOralDose(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const d = DRUGS.find((x) => x.value === o.drug);
  const k = PER_KG.find((x) => x.value === o.drug);
  if (!d && !k && o.drug !== 'doxycycline-cholera') return { valid: false, message: 'Choose the antibiotic.' };
  const f = inputFault([['the weight', o.weight, 0.5, 150, 'kg']]);
  if (f) return { valid: false, message: f };
  const kg = Number(o.weight);
  if (k) return perKgDose(k, kg);
  if (!d) return doxycyclineCholera(kg);
  const notes = [`Basis: ${d.basis}.`, `Used in the book for: ${d.uses}.`, `AWaRe group: ${d.group}.`];
  if (d.extra) notes.push(d.extra);
  if (kg < 3) return { valid: true, band: `Under 3 kg is below the table's first weight band: no band dose. ${d.text}: ${d.basis}.`, bandLabel: 'Below the bands', abnormal: true, notes: notes.slice(1), note: NOTE };
  let lower = 3;
  for (const [lt, dose, h] of d.bands) {
    if (kg < lt) {
      return { valid: true, band: `${d.text}: ${dose}${d.unit || ''} ${every(h)} (the ${lower} to under ${lt} kg band).`, bandLabel: `${dose} every ${h} h`, abnormal: false, notes, note: NOTE };
    }
    lower = lt;
  }
  if (d.top.adult) return { valid: true, band: `${d.text}: at ${d.top.from} kg and over, use the adult dose.`, bandLabel: 'Adult dose', abnormal: false, notes, note: NOTE };
  return { valid: true, band: `${d.text}: ${d.top.text} (${d.top.from} kg and over).`, bandLabel: `${d.top.from} kg and over`, abnormal: false, notes, note: NOTE };
}
