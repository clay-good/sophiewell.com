// spec-v1551 tool 1: the WHO weight-band dose of an artemisinin-based combination (ACT) for uncomplicated
// falciparum malaria.
//
// Source: WHO guidelines for malaria, 10 September 2026 (a living guideline; doi:10.2471/B09879, IRIS
// 10665/387504; CC BY-NC-SA 3.0 IGO, so the bands are used as facts and no text is reproduced). Read
// October 3, 2026, pp. 175-178 (the five dose tables and their target ranges) and section 5.2.1.4.2
// (infants under 5 kg). High volatility: the under-5 kg artemether-lumefantrine band is new in 2025-2026.
//
// Edges stated rather than hidden:
//   - Under 5 kg, WHO says to give an ACT at the same mg/kg target as for a child of 5 kg; only
//     artemether-lumefantrine has a band for it (the 1:12 infant formulation). For the other regimens the
//     tile states the rule and gives no dose from the table.
//   - The dihydroartemisinin-piperaquine table prints its last two bands "60 < 80" and ">80", leaving
//     exactly 80 kg in no band. They are read as "60 to under 80" and "80 or more", like every other band.
//   - Artesunate-pyronaridine has no WHO dose table (only the product label), so it is named and refused.
//   - The answer is the band's dose. The achieved mg/kg is shown against WHO's target range and flagged
//     outside it; it never changes the dose (spec-v1540 §4.1).
//
// Pure: no DOM, no clock.

import { bandDose, achievedPerKg } from './band-dose.js';

const r1 = (x) => String(Math.round(x * 10) / 10);

// Each regimen: the weight bands (lo inclusive; the top band open), per-dose amounts, the schedule, and the
// targets for the achieved mg/kg ([label, mg per band from `parts`, how many, per, [lo, hi]]).
export const REGIMENS = {
  al: {
    text: 'Artemether + lumefantrine',
    bands: [[0, '5 + 60', [5, 60]], [5, '20 + 120', [20, 120]], [15, '40 + 240', [40, 240]], [25, '60 + 360', [60, 360]], [35, '80 + 480', [80, 480]]],
    names: ['artemether', 'lumefantrine'], per: 'per dose',
    schedule: 'twice a day for 3 days (six doses); the first two doses ideally 8 hours apart',
    targets: [['artemether total over the course', 0, 6, 'total', [5, 24]], ['lumefantrine total over the course', 1, 6, 'total', [29, 144]]],
    notes: ['Give it right after food or a drink containing fat, such as milk, especially on days 2 and 3: fat increases lumefantrine absorption.'],
  },
  asaq: {
    text: 'Artesunate + amodiaquine',
    bands: [[0, '25 + 67.5', [25, 67.5]], [9, '50 + 135', [50, 135]], [18, '100 + 270', [100, 270]], [36, '200 + 540', [200, 540]]],
    names: ['artesunate', 'amodiaquine'], per: 'daily',
    schedule: 'once a day for 3 days',
    targets: [['artesunate per day', 0, 1, 'day', [2, 10]], ['amodiaquine per day', 1, 1, 'day', [7.5, 15]]],
    notes: ['WHO advises avoiding it with zidovudine, efavirenz or cotrimoxazole unless it is the only ACT promptly available (severe neutropenia, hepatotoxicity).'],
  },
  asmq: {
    text: 'Artesunate + mefloquine',
    bands: [[0, '25 + 55', [25, 50]], [9, '50 + 110', [50, 100]], [18, '100 + 220', [100, 200]], [30, '200 + 440', [200, 400]]],
    names: ['artesunate', 'mefloquine hydrochloride'], per: 'daily',
    schedule: 'once a day for 3 days',
    targets: [['artesunate per day', 0, 1, 'day', [2, 10]], ['mefloquine base per day', 1, 1, 'day', [7, 11]]],
    notes: ['The mefloquine amounts are the hydrochloride (55 mg is 50 mg mefloquine base); WHO\'s target is in base, so the achieved mg/kg uses the base.'],
  },
  assp: {
    text: 'Artesunate + sulfadoxine-pyrimethamine',
    bands: [[0, '25 mg artesunate daily for 3 days; 250/12.5 mg sulfadoxine-pyrimethamine once, on day 1', [25, 250]], [10, '50 mg artesunate daily for 3 days; 500/25 mg sulfadoxine-pyrimethamine once, on day 1', [50, 500]], [25, '100 mg artesunate daily for 3 days; 1,000/50 mg sulfadoxine-pyrimethamine once, on day 1', [100, 1000]], [50, '200 mg artesunate daily for 3 days; 1,500/75 mg sulfadoxine-pyrimethamine once, on day 1', [200, 1500]]],
    schedule: '',
    targets: [['artesunate per day', 0, 1, 'day', [2, 10]], ['sulfadoxine, single dose', 1, 1, 'dose', [25, 70]]],
    notes: ['Folic acid at 5 mg a day reduces the efficacy of sulfadoxine-pyrimethamine and should not be given with it; 0.4 mg a day does not.'],
  },
  dhappq: {
    text: 'Dihydroartemisinin + piperaquine',
    bands: [[0, '20 + 160', [20, 160]], [8, '30 + 240', [30, 240]], [11, '40 + 320', [40, 320]], [17, '60 + 480', [60, 480]], [25, '80 + 640', [80, 640]], [36, '120 + 960', [120, 960]], [60, '160 + 1,280', [160, 1280]], [80, '200 + 1,600', [200, 1600]]],
    names: ['dihydroartemisinin', 'piperaquine'], per: 'daily',
    schedule: 'once a day for 3 days',
    // Targets differ above and below 25 kg; chosen in the function.
    targets: null,
    notes: ['Avoid high-fat meals with it (they speed piperaquine absorption and raise the risk of QT prolongation); normal meals are fine.'],
  },
  aspy: { text: 'Artesunate + pyronaridine', none: true },
};
export const REGIMEN_OPTIONS = Object.entries(REGIMENS).map(([value, r]) => ({ value, text: r.text }));

const table = (reg) => ({ unit: 'kg', bands: reg.bands.map(([lo, dose, mg], i, all) => ({ lo, hi: all[i + 1] ? all[i + 1][0] : undefined, dose, mg })) });

export function actWeightBandDose(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const reg = REGIMENS[o.regimen];
  if (!reg) return { valid: false, message: 'Choose the ACT: each one has its own weight bands.' };
  if (reg.none) return { valid: false, message: 'WHO\'s malaria guideline gives no weight-band table for artesunate + pyronaridine. Use the dose on the product label.' };
  const got = bandDose({ weight: o.weight }, { weightTable: table(reg), weightLabel: 'weight in kg', maxWeight: 150 });
  if (!got.valid) return got;
  const w = Number(o.weight);
  if (w < 0.5) return { valid: false, message: 'Enter a weight of at least 0.5 kg.' };
  const notes = [];
  if (w < 5 && o.regimen !== 'al') {
    return {
      valid: true,
      band: `Under 5 kg, WHO 2026 gives no ${reg.text.toLowerCase()} band: it says to treat an infant under 5 kg with an ACT at the same mg/kg target as for a child of 5 kg. Where artemether + lumefantrine is available, the 1:12 infant formulation for babies under 5 kg should be used.`,
      bandLabel: 'No band under 5 kg',
      abnormal: true,
      notes: [],
      note: 'This follows the WHO guidelines for malaria of 10 September 2026, a living guideline. Your national protocol may differ; follow it.',
    };
  }
  const b = got.band;
  if (o.regimen === 'al' && w < 5) notes.push('This band is the 1:12 infant formulation of artemether + lumefantrine for babies under 5 kg. If it is not available, WHO says to give an ACT at the same mg/kg target as for a child of 5 kg.');
  if (o.regimen === 'dhappq' && w === 80) notes.push('WHO\'s table prints its last two bands as "60 < 80" and ">80", which leaves exactly 80 kg in no band; it is read as 80 kg or more, like every other band in the table.');
  const targets = reg.targets || (w >= 25
    ? [['dihydroartemisinin per day', 0, 1, 'day', [2, 10]], ['piperaquine per day', 1, 1, 'day', [16, 27]]]
    : [['dihydroartemisinin per day', 0, 1, 'day', [2.5, 10]], ['piperaquine per day', 1, 1, 'day', [20, 32]]]);
  for (const [label, k, times, , range] of targets) {
    const a = achievedPerKg(b.mg[k] * times, w, range);
    notes.push(`${label[0].toUpperCase()}${label.slice(1)}: ${r1(a.perKg)} mg/kg (WHO target ${range[0]} to ${range[1]})${a.outside ? ', outside the target range at this weight' : ''}.`);
  }
  notes.push('If the patient vomits a dose within 1 hour, give it again.');
  const parts = b.dose.split(' + ');
  const doseText = reg.names ? `${parts[0]} mg ${reg.names[0]} + ${parts[1]} mg ${reg.names[1]} ${reg.per}` : b.dose;
  notes.push(...reg.notes);
  return {
    valid: true,
    dose: b.dose,
    band: `${reg.text} for ${r1(w)} kg (WHO band ${b.hi === undefined ? `${b.lo} kg or more` : `${b.lo === 0 ? 'under' : `${b.lo} to under`} ${b.hi} kg`}): ${doseText}${reg.schedule ? `; ${reg.schedule}` : ''}.`,
    bandLabel: b.dose,
    abnormal: false,
    notes,
    note: 'This follows the WHO guidelines for malaria of 10 September 2026, a living guideline. Your national protocol may differ; follow it.',
  };
}
