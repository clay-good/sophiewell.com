// spec-v1499: the Pediatric Anesthesia Emergence Delirium (PAED) scale.
//
// Sources, read 2026-09-25:
//   Sikich N, Lerman J. Development and psychometric evaluation of the pediatric anesthesia emergence
//     delirium scale. Anesthesiology. 2004;100(5):1138-1145 (the original).
//   Items and scoring as stated in BMJ Paediatr Open 2025 (PMC11911689): five items -- eye contact,
//     purposeful actions, awareness of surroundings, restlessness, inconsolability. "Items 1-3 are
//     scored as follows: 4=not at all, 3=just a little, 2=quite a bit, 1=very much and 0=extremely.
//     Items 4 and 5 are scored as follows: 0=not at all, 1=just a little, 2=quite a bit, 3=very much
//     and 4=extremely." That trial defined delirium as "a PAED score >12".
//   The cutoff of 10 as used in Paediatr Anaesth 2026 (PMC13460726): "a PAED score of 10 or higher",
//     and Medicine 2026 (PMC12908744): "a PAED score of >=10 points defined as emergence agitation".
//
// The two cutoffs disagree; the answer reads the total against both. Item wording is not reproduced:
// each item is named by its topic and rated on the five published anchors. Pure: no DOM, no clock.

export const PAED_ITEMS = [
  ['eye', 'Makes eye contact with the caregiver', true],
  ['purposeful', 'Actions are purposeful', true],
  ['aware', 'Aware of surroundings', true],
  ['restless', 'Restless', false],
  ['inconsolable', 'Inconsolable', false],
];
export const ANCHORS = [
  { value: 'not', text: 'Not at all' },
  { value: 'little', text: 'Just a little' },
  { value: 'quite', text: 'Quite a bit' },
  { value: 'very', text: 'Very much' },
  { value: 'extremely', text: 'Extremely' },
];
const ORDER = ANCHORS.map((a) => a.value);

export function paedDelirium(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const rated = PAED_ITEMS.filter(([k]) => ORDER.includes(o[k]))
    .map(([k, label, reverse]) => ({ k, label, pts: reverse ? 4 - ORDER.indexOf(o[k]) : ORDER.indexOf(o[k]) }));
  if (!rated.length) return { valid: false, message: 'Choose a rating for at least one PAED item.' };
  const total = rated.reduce((s, r) => s + r.pts, 0);
  const missing = PAED_ITEMS.length - rated.length;
  const maxLeft = missing * 4;
  const notes = [];
  if (missing) notes.push(`Scored from ${rated.length} of the 5 items; an item not rated can only raise the total, by up to ${maxLeft}.`);
  notes.push('The first three items score in reverse: a child who makes no eye contact, acts without purpose or is unaware of the room scores higher.');
  notes.push('Rate the child in the first 30 minutes after emergence; the studies using the scale assess pain separately, with FLACC.');
  let band;
  let label;
  let abnormal;
  if (total > 12) {
    band = `PAED ${total}: emergence delirium by both cutoffs in use (10 or more, and more than 12).`;
    label = 'Delirium (both cutoffs)'; abnormal = true;
  } else if (total >= 10) {
    band = `PAED ${total}: emergence delirium by the cutoff of 10 or more; below the stricter cutoff of more than 12 that some studies use.`;
    label = 'Delirium at 10 or more, not above 12'; abnormal = true;
  } else if (missing) {
    band = `PAED ${total} on ${rated.length} of 5 items: below 10 so far, but ${missing === 1 ? 'the item not rated' : `the ${missing} items not rated`} could raise it to ${total + maxLeft}.`;
    label = `Below 10 so far (${rated.length} of 5 items)`; abnormal = total + maxLeft >= 10;
  } else {
    band = `PAED ${total}: below both cutoffs for emergence delirium (10 or more; more than 12).`;
    label = 'Below both cutoffs'; abnormal = false;
  }
  return { valid: true, total, itemsRated: rated.length, abnormal, band, bandLabel: label, notes,
    note: 'PAED scale (Sikich N, Lerman J, Anesthesiology 2004); scoring as stated in BMJ Paediatr Open 2025, the cutoff of 10 in Paediatr Anaesth 2026 and Medicine 2026. It scores behavior on emergence; treatment is a clinical decision.' };
}
