// spec-v901: the GLOBIAD categorization of incontinence-associated dermatitis.
//
// Source:
//   Beeckman D, Van den Bussche K, Alves P, et al. Towards an international language for
//   incontinence-associated dermatitis (IAD): design and evaluation of psychometric properties
//   of the Ghent Global IAD Categorisation Tool (GLOBIAD).
//   Br J Dermatol. 2018;178(6):1331-1340.
//
//   Category 1  persistent redness, with no skin loss.
//     1A  no clinical signs of infection.
//     1B  clinical signs of infection.
//   Category 2  skin loss.
//     2A  no clinical signs of infection.
//     2B  clinical signs of infection.
//
// IT IS NOT A PRESSURE INJURY, AND THAT IS WHY THIS TILE EXISTS. Moisture damage is written up as
// a "stage 2" more often than any other miscoding in skin assessment. The mechanisms are
// opposite: incontinence-associated dermatitis is top-down damage from moisture and irritants
// over an area that has been wet, while a pressure injury is bottom-up damage over a bony
// prominence. The distinction changes the prevention plan and the incident report, not just the
// word.
//
// THE PATTERN TELLS THEM APART. Moisture damage is diffuse, with irregular or indistinct edges,
// over the perineum, buttocks, groin or inner thighs, and it often spares the skin over the bone.
// A pressure injury has distinct edges and sits over a bony prominence.
//
// THE TWO CAN COEXIST, and the presence of one does not exclude the other.
//
// THE CATEGORY DOES NOT CHOOSE A PRODUCT. It records what was seen, and the infection subcategory
// is a prompt to look, not a diagnosis of infection.
//
// Pure: no DOM, no clock, no network.

export const IAD_NOTE = 'The Ghent Global IAD Categorisation Tool (Beeckman and colleagues, British Journal of Dermatology, 2018) sorts incontinence-associated dermatitis into two categories, each split by whether there are clinical signs of infection: category 1 is persistent redness with no skin loss, and category 2 is skin loss, with A meaning no signs of infection and B meaning signs are present. Four things about it are worth stating plainly. It is not a pressure injury, and moisture damage written up as a stage 2 is the commonest miscoding in skin assessment: the mechanisms are opposite, since this is top-down damage from moisture and irritants over an area that has been wet while a pressure injury is bottom-up damage over a bony prominence, and the distinction changes the prevention plan and the incident report rather than only the word. The pattern tells them apart, because moisture damage is diffuse with irregular or indistinct edges over the perineum, buttocks, groin or inner thighs and often spares the skin directly over the bone, while a pressure injury has distinct edges and sits over a prominence. The two can coexist, and the presence of one does not exclude the other. And the category does not choose a product: it records what was seen, and the infection subcategory is a prompt to look rather than a diagnosis of infection. It records a finding against a published categorization. It does not diagnose infection, and it does not stage a pressure injury.';

export const CATEGORIES = [
  { value: '1A', category: 1, infection: false, text: 'Category 1A: persistent redness, no skin loss, no clinical signs of infection' },
  { value: '1B', category: 1, infection: true, text: 'Category 1B: persistent redness, no skin loss, with clinical signs of infection' },
  { value: '2A', category: 2, infection: false, text: 'Category 2A: skin loss, no clinical signs of infection' },
  { value: '2B', category: 2, infection: true, text: 'Category 2B: skin loss, with clinical signs of infection' },
];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

export function iadGlobiad(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const skinLoss = on(o.skinLoss);
  const infectionSigns = on(o.infectionSigns);
  const overBonyProminence = on(o.overBonyProminence);
  const distinctEdges = on(o.distinctEdges);

  const value = `${skinLoss ? 2 : 1}${infectionSigns ? 'B' : 'A'}`;
  const row = CATEGORIES.find((c) => c.value === value);

  // Both features pointing at pressure is the reading this tile exists to interrupt.
  const pressurePattern = overBonyProminence && distinctEdges;
  const mixedPattern = (overBonyProminence || distinctEdges) && !pressurePattern;

  const action = `${row.text}.`;

  // The reason the tile exists, on every result.
  const notPressureNote = 'This is not a pressure injury. Moisture damage is top-down, from moisture and irritants over skin that has been wet; a pressure injury is bottom-up, over a bony prominence. Writing one up as the other changes the prevention plan and the incident report, not just the word.';

  const patternNote = pressurePattern
    ? 'Both features recorded here point the other way: damage over a bony prominence with distinct edges is the pattern of a pressure injury rather than of moisture damage. Categorizing it here may be the wrong call, and it is worth reassessing before this is recorded.'
    : mixedPattern
      ? `One feature recorded here points toward pressure damage: ${overBonyProminence ? 'the damage is over a bony prominence' : 'the edges are distinct'}. Moisture damage is diffuse with irregular edges over the perineum, buttocks, groin or inner thighs, and often spares the skin directly over the bone.`
      : 'Moisture damage is diffuse, with irregular or indistinct edges, over the perineum, buttocks, groin or inner thighs, and it often spares the skin directly over the bone. A pressure injury has distinct edges and sits over a prominence.';

  const coexistNote = 'The two can coexist. The presence of one does not exclude the other, and a patient with both needs both addressed.';

  const infectionNote = infectionSigns
    ? 'The B subcategory records that clinical signs of infection were seen. It is a prompt to look further, not a diagnosis of infection and not an indication for an antimicrobial on its own.'
    : 'The A subcategory records that no clinical signs of infection were seen at this assessment. Candidiasis in particular is easy to miss early, and it is worth re-checking.';

  const productNote = 'The category does not choose a product. It records what was seen so the next assessment can be compared with this one.';

  const scopeNote = 'This records a finding against a published categorization. It does not diagnose infection, and it does not stage a pressure injury.';

  return {
    valid: true,
    category: row.value,
    categoryNumber: row.category,
    infectionSigns,
    skinLoss,
    pressurePattern,
    action,
    notPressureNote,
    patternNote,
    coexistNote,
    infectionNote,
    productNote,
    scopeNote,
    abnormal: skinLoss || infectionSigns,
    bandLabel: `GLOBIAD ${row.value}`,
    band: action,
    detail: 'Category 1 is persistent redness with no skin loss; category 2 is skin loss. A means no clinical signs of infection, B means signs are present. Moisture damage is top-down over skin that has been wet, diffuse and irregularly edged; a pressure injury is bottom-up over a bony prominence with distinct edges. The two can coexist.',
    note: IAD_NOTE,
  };
}
