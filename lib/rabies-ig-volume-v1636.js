// spec-v1636 backfill 5: the volume of rabies immune globulin by product, for rabies-pep.
//
// Sources, DailyMed labels re-read October 12, 2026:
//   HYPERRAB, Grifols (set f82880b8-..., version 10): "HYPERRAB 20 IU/kg body weight OR 0.0665 mL/kg
//     body weight"; "a sterile, 300 IU/mL solution for injection supplied in 1 mL, 3 mL and 5 mL
//     single-dose vials"; "The predecessor product, HYPERRAB S/D ... was formulated at 150 IU/mL";
//     "Administer HYPERRAB at the time of the first vaccine dose (day 0), but no later than day 7";
//     "Dilute HYPERRAB with an equal volume of dextrose, 5% (D5W), if additional volume is needed
//     ... Do not dilute with normal saline."
//   KEDRAB, Kedrion (set 53f2a23b-..., version 7): "a single 20 IU/kg body weight dose"; "2 mL or
//     10 mL of ready-to-use solution with a nominal potency of 150 IU/mL"; "at any time up to and
//     including seven days after the first dose of rabies vaccine".
//
// The HYPERRAB label prints 0.0665 mL/kg; 20 IU/kg divided by 300 IU/mL is 0.0667 mL/kg. Both are
// shown. Vials are counted as the fewest of the label's single-dose sizes whose total holds the volume
// (for HYPERRAB, the larger of the two volumes), and among those the set with the least left over; a
// pharmacy stocking other sizes opens what it has.
//
// Pure: the clock is a parameter (used only for the label rows).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABELS = {
  hyperrab: { name: 'HYPERRAB', setId: 'f82880b8-998c-4659-8f20-6dcc81f258e9' },
  kedrab: { name: 'KEDRAB', setId: '53f2a23b-c479-4c24-8cab-ee7a33a2633e' },
};
const IU_PER_KG = 20;
const r2 = (n) => Math.round(n * 100) / 100;
const fmt = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });

// The fewest vials of `sizes` (mL, largest first) whose total is at least `ml`, then the least left over,
// then the larger vials (5 + 1 before 3 + 3). Not exported:
// the fuzz harness calls every export.
function vials(ml, sizes) {
  let best = null;
  const hi = Math.ceil(ml / Math.min(...sizes)) + 1;
  const walk = (i, picked, total) => {
    if (total + 1e-9 >= ml) {
      const same = best && picked.length === best.picked.length && Math.abs(total - best.total) < 1e-9;
      if (!best || picked.length < best.picked.length || (picked.length === best.picked.length && total < best.total - 1e-9) || (same && picked[0] > best.picked[0])) best = { picked: [...picked], total };
      return;
    }
    if (i >= sizes.length || picked.length >= hi || (best && picked.length >= best.picked.length)) return;
    for (let k = 0; picked.length + k <= hi; k += 1) {
      walk(i + 1, [...picked, ...Array(k).fill(sizes[i])], total + k * sizes[i]);
      if (total + k * sizes[i] + 1e-9 >= ml) break;
    }
  };
  walk(0, [], 0);
  const left = r2(best.total - ml);
  return { count: best.picked.length, sizes: best.picked, totalMl: best.total, leftOverMl: left, text: `${best.picked.length} vial${best.picked.length === 1 ? '' : 's'} (${best.picked.join(' + ')} mL)${left > 0 ? `, ${fmt(left)} mL left over` : ''}` };
}

export function rabiesIgVolume(input, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const fault = inputFault([['the weight', o.weight, 0.5, 300, 'kg']]);
  if (fault) return { valid: false, message: fault };
  const kg = Number(o.weight);
  const units = r2(kg * IU_PER_KG);
  const notes = [];
  const rows = {};
  const hr = labelRow(LABELS.hyperrab.setId, now, table);
  if (hr.answers) {
    const byLabel = r2(kg * 0.0665);
    const byUnits = r2(units / 300);
    const v = vials(Math.max(byLabel, byUnits), [5, 3, 1]);
    rows.hyperrab = { labelMl: byLabel, arithmeticMl: byUnits, vials: v.count, vialSizes: v.sizes };
    notes.push(`HYPERRAB (300 IU/mL; 1, 3 and 5 mL vials): ${fmt(byLabel)} mL by the label's 0.0665 mL/kg${byUnits !== byLabel ? `; ${fmt(units)} IU divided by 300 IU/mL is ${fmt(byUnits)} mL` : ''}. Fewest vials: ${v.text}. The label: give it at the time of the first vaccine dose (day 0), but no later than day 7. If more volume is needed to infiltrate the wound, the label dilutes it with an equal volume of 5% dextrose, not normal saline.`);
    notes.push('The HYPERRAB label warns that its predecessor, HYPERRAB S/D, was 150 IU/mL: the volume for the 300 IU/mL product is about half.');
  } else notes.push(`HYPERRAB: ${hr.why}`);
  const kr = labelRow(LABELS.kedrab.setId, now, table);
  if (kr.answers) {
    const ml = r2(units / 150);
    const v = vials(ml, [10, 2]);
    rows.kedrab = { ml, vials: v.count, vialSizes: v.sizes };
    notes.push(`KEDRAB (150 IU/mL; 2 and 10 mL vials): ${fmt(ml)} mL (${fmt(units)} IU divided by 150 IU/mL). Fewest vials: ${v.text}. The label: at any time up to and including seven days after the first dose of rabies vaccine.`);
  } else notes.push(`KEDRAB: ${kr.why}`);
  if (!hr.answers && !kr.answers) {
    return { valid: true, flag: 'withheld', band: 'No volume is shown: neither label row is current.', bandLabel: 'Withheld', notes, note: notes.join(' ') };
  }
  notes.push('Both labels: one dose only; do not exceed it, because more can suppress the antibody response to the vaccine. Infiltrate the full dose around and into the wound if anatomically feasible and give the rest intramuscularly at a site distant from the vaccine. Not given to a person previously vaccinated. This is each label\'s arithmetic, not a decision to give it.');
  return {
    valid: true, flag: 'dose', units, ...rows,
    band: `Rabies immune globulin 20 IU/kg at ${fmt(kg)} kg is ${fmt(units)} IU.`,
    bandLabel: 'Label dose', notes, note: notes.join(' '),
  };
}
