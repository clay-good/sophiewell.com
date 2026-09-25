// spec-v1495: the Oral Health Assessment Tool (OHAT), a nursing screen of the mouth.
//
// Sources, read 2026-09-25:
//   Chalmers JM, King PL, Spencer AJ, Wright FA, Carter KD. The oral health assessment tool: validity
//     and reliability. Aust Dent J. 2005;50(3):191-199 (the original).
//   Items and scoring as stated in J Nutr Health Aging 2021 (PMC12876686): "It consists of 8 items:
//     lips, tongue, gums/tissues, saliva, natural teeth, dentures, oral cleanliness, and dental pain.
//     Each item is graded 0 (healthy), 1 (oral changes) or 2 (unhealthy). The total score is graded
//     over 16." BMC Oral Health 2026 (PMC12977401) states the same eight items and three-point scale.
//
// The item descriptors of the published form are not reproduced; each item is rated on the three
// named levels. Pure: no DOM, no clock.

export const OHAT_ITEMS = [
  ['lips', 'Lips'],
  ['tongue', 'Tongue'],
  ['gums', 'Gums and tissues'],
  ['saliva', 'Saliva'],
  ['teeth', 'Natural teeth'],
  ['dentures', 'Dentures'],
  ['cleanliness', 'Oral cleanliness'],
  ['pain', 'Dental pain'],
];
export const LEVELS = [
  { value: '0', text: '0: healthy' },
  { value: '1', text: '1: changes' },
  { value: '2', text: '2: unhealthy' },
];

export function ohatOralHealth(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const rated = OHAT_ITEMS.filter(([k]) => ['0', '1', '2'].includes(String(o[k])))
    .map(([k, label]) => ({ k, label, v: Number(o[k]) }));
  if (!rated.length) return { valid: false, message: 'Choose a rating (healthy, changes or unhealthy) for at least one OHAT item.' };
  const total = rated.reduce((s, r) => s + r.v, 0);
  const unhealthy = rated.filter((r) => r.v === 2).map((r) => r.label.toLowerCase());
  const changes = rated.filter((r) => r.v === 1).map((r) => r.label.toLowerCase());
  const parts = [];
  if (unhealthy.length) parts.push(`Unhealthy: ${unhealthy.join(', ')}.`);
  if (changes.length) parts.push(`Changes: ${changes.join(', ')}.`);
  const notes = [];
  if (rated.length < OHAT_ITEMS.length) {
    notes.push(`Scored from ${rated.length} of the 8 items; an item not rated can only raise the total.`);
  }
  notes.push('Each item is rated 0 (healthy), 1 (changes) or 2 (unhealthy), for a total out of 16.');
  return {
    valid: true,
    total,
    itemsRated: rated.length,
    abnormal: total > 0,
    band: `OHAT ${total} of ${rated.length * 2}${rated.length < 8 ? ` (${rated.length} of 8 items)` : ''}. ${parts.length ? parts.join(' ') : rated.length < 8 ? 'The items rated are healthy.' : 'Every item rated healthy.'}`,
    bandLabel: `OHAT ${total}${unhealthy.length ? `, ${unhealthy.length} unhealthy` : ''}${rated.length < 8 ? ` (${rated.length} of 8 items)` : ''}`,
    notes,
    note: 'Oral Health Assessment Tool (Chalmers JM et al, Aust Dent J 2005); items and scoring as stated in J Nutr Health Aging 2021. A screen that nurses and carers can use; referral to a dentist is a clinical decision.',
  };
}
