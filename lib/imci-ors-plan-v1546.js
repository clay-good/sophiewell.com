// spec-v1546 tool 1: how much ORS or IV fluid a child under 5 with diarrhea gets on WHO's Plan A, B or C.
//
// Sources, read October 5, 2026 (facts restated, nothing reproduced):
//   - WHO, Integrated Management of Childhood Illness chart booklet, March 2014 (all rights reserved), the
//     "Give extra fluid for diarrhoea" pages: Plan A extra fluid after each loose stool (50-100 mL up to 2
//     years, 100-200 mL from 2 years), 2 ORS packets home, zinc 20 mg tablet (half from 2 to under 6
//     months, one from 6 months, 14 days); Plan B ORS over 4 hours by weight band (under 6 kg 200-450 mL,
//     6 to under 10 kg 450-800, 10 to under 12 kg 800-960, 12-19 kg 960-1,600), by age only when the weight
//     is unknown (up to 4 months, 4 to under 12 months, 12 months to under 2 years, 2 to under 5 years),
//     or about weight x 75 mL; reassess at 4 hours. Plan C: IV Ringer's lactate (or normal saline) 100
//     mL/kg, 30 mL/kg then 70 mL/kg, over 1 then 5 hours under 12 months and over 30 minutes then 2.5
//     hours from 12 months to 5 years; the first part repeated once if the radial pulse is still very weak;
//     ORS about 5 mL/kg/hour once the child can drink; reassess an infant at 6 hours, a child at 3. No IV
//     here: refer if IV is within 30 minutes; otherwise ORS by nasogastric tube (or by mouth) 20 mL/kg/hour
//     for 6 hours; otherwise refer urgently. Observe 6 hours after rehydration if not referred.
//   - WHO, Pocket book of hospital care for children, 2nd ed., 2013, pp. 19 and 204: in severe acute
//     malnutrition, no IV rehydration except for shock, and standard ORS is not suitable; ReSoMal by mouth
//     or nasogastric tube, more slowly.
//   - WHO, Guideline on management of pneumonia and diarrhoea in children up to 10 years of age, 2024,
//     recommendation 3c: zinc 5 mg daily for up to 14 days (conditional).
//
// Edges stated rather than hidden:
//   - Plan C's timing changes at 12 months of age, not at a weight.
//   - Plan B above 19 kg is off the chart's table; only weight x 75 is shown.
//   - Plan B with no weight uses the age band, and says so.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const PLAN_OPTIONS = [
  { value: 'A', text: 'Plan A: no dehydration (treat at home)' },
  { value: 'B', text: 'Plan B: some dehydration (ORS in the clinic)' },
  { value: 'C', text: 'Plan C: severe dehydration' },
];
export const ROUTE_OPTIONS = [
  { value: 'iv', text: 'IV fluid can be started here now' },
  { value: 'iv30', text: 'No IV here; IV treatment within 30 minutes' },
  { value: 'ng', text: 'No IV nearby; trained to use a nasogastric tube' },
  { value: 'oral', text: 'No IV nearby, no nasogastric tube; the child can drink' },
  { value: 'none', text: 'None of these: no IV, no tube, cannot drink' },
];
export const SAM_OPTIONS = [
  { value: 'no', text: 'No' },
  { value: 'yes', text: 'Yes' },
];

const NOTE = 'This follows WHO\'s 2014 IMCI chart booklet. Your national protocol may differ; follow it.';
const mL = (x) => `${Math.round(x).toLocaleString('en-US')} mL`;
const rate = (vol, hours) => `${Math.round(vol / hours).toLocaleString('en-US')} mL/h`;
const r1 = (x) => String(Math.round(x * 10) / 10);

// Plan B bands: [weight lo (kg), age lo (months), volume text].
const PLAN_B = [
  [0, 0, '200 to 450 mL', 'under 6 kg', 'up to 4 months'],
  [6, 4, '450 to 800 mL', '6 to under 10 kg', '4 months to under 12 months'],
  [10, 12, '800 to 960 mL', '10 to under 12 kg', '12 months to under 2 years'],
  [12, 24, '960 to 1,600 mL', '12 to 19 kg', '2 years to under 5 years'],
];

export function imciOrsPlan(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const plan = PLAN_OPTIONS.find((p) => p.value === o.plan);
  if (!plan) return { valid: false, message: 'Choose the plan: A for no dehydration, B for some, C for severe.' };
  const fa = inputFault([['the age', o.age, 0, 59.9, 'months']]);
  if (fa) return { valid: false, message: fa };
  if (!SAM_OPTIONS.some((x) => x.value === o.sam)) return { valid: false, message: 'Choose whether the child has severe acute malnutrition: it changes how rehydration is done.' };
  const age = Number(o.age);
  const hasWeight = !(o.weight === undefined || o.weight === null || String(o.weight).trim() === '');
  if (hasWeight) {
    const fw = inputFault([['the weight', o.weight, 0.5, 50, 'kg']]);
    if (fw) return { valid: false, message: fw };
  }
  const w = hasWeight ? Number(o.weight) : null;

  if (o.sam === 'yes') {
    return {
      valid: true,
      band: 'Do not use Plan A, B or C: in severe acute malnutrition, standard ORS is not suitable and IV fluids are used only for shock. Rehydrate slowly with ReSoMal, by mouth or nasogastric tube, under the severe malnutrition protocol, and refer.',
      bandLabel: 'Not these plans (severe malnutrition)',
      abnormal: true,
      notes: ['Dehydration is hard to judge in severe malnutrition, and IV fluid given as for a well-nourished child risks fluid overload and heart failure.'],
      note: 'This follows WHO\'s 2013 Pocket book of hospital care for children. Your national protocol may differ; follow it.',
    };
  }

  if (plan.value === 'A') {
    const perStool = age < 24 ? '50 to 100 mL' : '100 to 200 mL';
    const notes = [
      'Give frequent small sips from a cup; if the child vomits, wait 10 minutes, then continue more slowly. Keep giving extra fluid until the diarrhea stops.',
      'Send 2 ORS packets home. Keep breastfeeding, and keep feeding.',
    ];
    if (age < 2) notes.push('The 2014 chart gives zinc from 2 months of age; this child is younger.');
    else notes.push(`Zinc: the 2014 chart gives a 20 mg tablet, ${age < 6 ? 'half a tablet' : 'one tablet'} a day for 14 days; WHO's 2024 guideline suggests 5 mg a day for up to 14 days instead. Follow your national protocol.`);
    notes.push('Return at once if the child gets worse, cannot drink or breastfeed, or has blood in the stool; follow up in 5 days if not improving.');
    return { valid: true, band: `Plan A: ${perStool} of ORS or other fluid after each loose stool, on top of the usual fluids (${age < 24 ? 'under 2 years' : '2 years or older'}).`, bandLabel: `${perStool} per loose stool`, abnormal: false, notes, note: NOTE };
  }

  if (plan.value === 'B') {
    const notes = [];
    let band;
    let label;
    if (w !== null) {
      const vol = w * 75;
      const row = w > 19 ? null : [...PLAN_B].reverse().find((b) => w >= b[0]);
      band = `Plan B: about ${mL(vol)} of ORS over 4 hours (${r1(w)} kg x 75 mL), about ${rate(vol, 4)}.`;
      label = `About ${mL(vol)} over 4 h`;
      if (row) {
        notes.push(`The chart's band for ${row[3]} is ${row[2]}.`);
        const ageRow = [...PLAN_B].reverse().find((b) => age >= b[1]);
        if (ageRow !== row) notes.push(`The age band (${ageRow[4]}) would give ${ageRow[2]}; the chart uses the weight when it is known.`);
      } else {
        notes.push('Above 19 kg the chart has no band; only the weight x 75 figure applies.');
      }
    } else {
      const row = [...PLAN_B].reverse().find((b) => age >= b[1]);
      band = `Plan B: ${row[2]} of ORS over 4 hours (the band for ${row[4]}).`;
      label = `${row[2]} over 4 h`;
      notes.push('No weight was entered, so this is the chart\'s age band. With a weight, the amount is about weight x 75 mL.');
    }
    notes.push('If the child wants more, give more. Give frequent small sips from a cup; if the child vomits, wait 10 minutes, then continue more slowly. Keep breastfeeding.');
    notes.push('After 4 hours, reassess and classify dehydration again, then choose the plan to continue. Start feeding in the clinic.');
    return { valid: true, band, bandLabel: label, abnormal: false, notes, note: NOTE };
  }

  // Plan C.
  if (w === null) return { valid: false, message: 'Enter the weight in kg: Plan C fluids are given per kg.' };
  const route = ROUTE_OPTIONS.find((r) => r.value === o.route);
  if (!route) return { valid: false, message: 'Choose what is possible here: IV now, IV within 30 minutes, a nasogastric tube, or drinking.' };
  const infant = age < 12;
  const notes = [];
  if (route.value === 'iv') {
    const [h1, h2] = infant ? [1, 5] : [0.5, 2.5];
    const p1 = w * 30;
    const p2 = w * 70;
    notes.push(`If the radial pulse is still very weak or absent after the first ${mL(p1)}, give it once more.`);
    notes.push('Reassess every 1 to 2 hours; if hydration is not improving, run the drip faster.');
    notes.push(`As soon as the child can drink, also give ORS, about ${mL(w * 5)} an hour (5 mL/kg/h): usually after 3 to 4 hours in an infant, 1 to 2 hours in a child.`);
    notes.push(`Reassess ${infant ? 'this infant at 6 hours' : 'this child at 3 hours'}, classify dehydration again, and choose the plan to continue.`);
    return {
      valid: true,
      band: `Plan C: Ringer's lactate (or normal saline if it is not available), ${mL(w * 100)} in all (100 mL/kg): first ${mL(p1)} over ${infant ? '1 hour' : '30 minutes'} (${rate(p1, h1)}), then ${mL(p2)} over ${infant ? '5 hours' : '2.5 hours'} (${rate(p2, h2)}). ${infant ? 'Under 12 months' : '12 months or older'}.`,
      bandLabel: `${mL(w * 100)} IV`,
      abnormal: true,
      notes,
      note: NOTE,
    };
  }
  if (route.value === 'iv30') {
    return {
      valid: true,
      band: 'Refer urgently to the hospital for IV treatment. If the child can drink, send ORS with the mother and show her how to give frequent sips on the way, or give ORS by nasogastric tube.',
      bandLabel: 'Refer for IV',
      abnormal: true,
      notes: [],
      note: NOTE,
    };
  }
  if (route.value === 'none') {
    return { valid: true, band: 'Refer urgently to the hospital for IV or nasogastric treatment.', bandLabel: 'Refer urgently', abnormal: true, notes: [], note: NOTE };
  }
  notes.push('Reassess every 1 to 2 hours while waiting for transfer. If there is repeated vomiting or the abdomen swells more and more, give it more slowly.');
  notes.push('If hydration is not improving after 3 hours, send the child for IV treatment.');
  notes.push('After 6 hours, reassess, classify dehydration again, and choose the plan to continue. If the child is not referred, watch for at least 6 hours after rehydration to be sure the mother can keep the child hydrated with ORS by mouth.');
  return {
    valid: true,
    band: `Plan C without IV: ORS ${route.value === 'ng' ? 'by nasogastric tube' : 'by mouth'}, ${mL(w * 20)} an hour (20 mL/kg/h) for 6 hours, ${mL(w * 120)} in all (120 mL/kg).`,
    bandLabel: `${mL(w * 20)}/h for 6 h`,
    abnormal: true,
    notes,
    note: NOTE,
  };
}
