// spec-v1562 tool 2: worm infection intensity class (light, moderate, heavy) from an egg count (WHO).
//
// Source: WHO. Helminth control in school-age children: a guide for managers of control programmes, 2nd ed.,
// 2011 (IRIS 10665/44671; WHO copyright, facts restated), Table 5.1 (p. 54), from WHO TRS 912 (2002). Read
// October 6, 2026. Eggs per gram of feces (epg): Ascaris 1-4,999 light, 5,000-49,999 moderate, over 50,000
// heavy; Trichuris 1-999, 1,000-9,999, over 10,000; hookworm 1-1,999, 2,000-3,999, over 4,000; S. mansoni
// 1-99, 100-399, over 400. S. haematobium (eggs per 10 mL of urine): 1-50 light, over 50 heavy (or visible
// hematuria).
//
// Stated rather than hidden: the table's moderate classes end one below a heavy class printed as "over"
// (49,999 then "over 50,000"), so exactly 50,000 is in no class; each heavy class is read as "or more". S.
// haematobium has no gap: 50 is light and heavy starts above 50, as printed (the spec had proposed 50 as
// heavy). Eggs per gram are asked for directly; the Kato-Katz slide multiplier was not read and is not
// applied.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const PARASITE_OPTIONS = [
  { value: 'ascaris', text: 'Roundworm (Ascaris lumbricoides), eggs per gram' },
  { value: 'trichuris', text: 'Whipworm (Trichuris trichiura), eggs per gram' },
  { value: 'hookworm', text: 'Hookworm, eggs per gram' },
  { value: 'mansoni', text: 'Schistosoma mansoni, eggs per gram' },
  { value: 'haematobium', text: 'Schistosoma haematobium, eggs per 10 mL of urine' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

// [moderate from, heavy from]; heavy is read as "or more".
const CUTS = { ascaris: [5000, 50000], trichuris: [1000, 10000], hookworm: [2000, 4000], mansoni: [100, 400] };
const NOTE = 'This follows WHO\'s intensity classes (Helminth control in school-age children, 2011, Table 5.1). They grade a survey or a person\'s egg count; they do not by themselves decide treatment.';
const fmt = (n) => n.toLocaleString('en-US');

export function helminthIntensity(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const p = PARASITE_OPTIONS.find((x) => x.value === o.parasite);
  if (!p) return { valid: false, message: 'Choose the parasite: roundworm, whipworm, hookworm, S. mansoni or S. haematobium.' };
  const urine = p.value === 'haematobium';
  const f = inputFault([[urine ? 'the eggs per 10 mL of urine' : 'the eggs per gram of feces', o.eggs, 0, 1000000, urine ? 'eggs/10 mL' : 'epg']]);
  if (f) return { valid: false, message: f };
  const n = Number(o.eggs);
  const unit = urine ? 'eggs per 10 mL' : 'eggs per gram';
  const notes = [];
  const out = (band, label, abnormal) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });

  if (urine) {
    if (o.hematuria === 'yes') return out(`Heavy-intensity infection: visible blood in the urine${n > 0 ? ` (${fmt(n)} ${unit})` : ''}.`, 'Heavy', true);
    if (o.hematuria !== 'no') notes.push('Visible blood in the urine: not entered. It makes the infection heavy whatever the count.');
    if (n === 0) return out('No eggs counted: not classed as an infection by this count.', 'No eggs', false);
    if (n > 50) return out(`Heavy-intensity infection: ${fmt(n)} ${unit} (over 50).`, 'Heavy', true);
    notes.push('S. haematobium has two classes only: light 1 to 50, heavy over 50.');
    return out(`Light-intensity infection: ${fmt(n)} ${unit} (1 to 50).`, 'Light', true);
  }
  if (o.hematuria) notes.push('Visible blood in the urine is used only for S. haematobium.');
  if (n === 0) return out('No eggs counted: not classed as an infection by this count.', 'No eggs', false);
  const [mod, heavy] = CUTS[p.value];
  if (n >= heavy) {
    if (n === heavy) notes.push(`WHO prints the heavy class as "over ${fmt(heavy)}" after a moderate class ending at ${fmt(heavy - 1)}; exactly ${fmt(heavy)} is read as heavy.`);
    return out(`Heavy-intensity infection: ${fmt(n)} ${unit} (${fmt(heavy)} or more).`, 'Heavy', true);
  }
  if (n >= mod) return out(`Moderate-intensity infection: ${fmt(n)} ${unit} (${fmt(mod)} to ${fmt(heavy - 1)}).`, 'Moderate', true);
  return out(`Light-intensity infection: ${fmt(n)} ${unit} (1 to ${fmt(mod - 1)}).`, 'Light', true);
}
