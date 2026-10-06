// spec-v1563 tool 8: Zika virus disease case definition: suspected, probable or confirmed (WHO interim, 2016).
//
// Source: WHO. Zika virus disease: interim case definitions, 12 February 2016, WHO/ZIKV/SUR/16.1 (IRIS
// 10665/204381; all rights reserved, facts restated). Read October 6, 2026. Suspected: rash and/or fever with
// at least one of arthralgia, arthritis or non-purulent conjunctivitis. Probable: suspected with Zika IgM
// (no evidence of other flavivirus infection) and an epidemiological link (contact with a confirmed case, or
// living in or travel to an area with local transmission within 2 weeks before onset). Confirmed: Zika RNA
// or antigen in any sample, or IgM with a PRNT90 titer of 20 or more and 4 or more times that for other
// flaviviruses, other flaviviruses excluded.
//
// Stated rather than hidden: WHO labels these definitions interim; PAHO's 2022 definitions for the Americas
// were not read. A criterion left blank is not assessed.
//
// Pure: no DOM, no clock.

export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const NOTE = 'This follows WHO\'s 2016 interim Zika case definitions (surveillance and reporting). PAHO issued 2022 definitions for the Americas.';
const k = (v) => v === 'yes' || v === 'no';

export function zikaCaseDef(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const notes = [];
  const out = (band, label, abnormal) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });
  if (o.rna === 'yes') return out('Confirmed Zika: Zika virus RNA or antigen detected.', 'Confirmed', true);
  if (o.prnt === 'yes') return out('Confirmed Zika: IgM positive with a PRNT90 titer of 20 or more, at least 4 times other flaviviruses, other flaviviruses excluded.', 'Confirmed', true);
  if (![o.rash, o.fever, o.signs].some(k)) return { valid: false, message: 'Choose the rash, fever and joint or eye answers, or a positive confirmatory test.' };
  const rashOrFever = o.rash === 'yes' || o.fever === 'yes';
  const rfOpen = !rashOrFever && (!k(o.rash) || !k(o.fever));
  if (!(rashOrFever && o.signs === 'yes')) {
    if (rfOpen || (rashOrFever && !k(o.signs))) return out('Not decided: rash or fever with arthralgia, arthritis or non-purulent conjunctivitis is not fully assessed.', 'Not decided', false);
    return out('Does not meet the suspected-case definition: rash and/or fever with arthralgia, arthritis or non-purulent conjunctivitis.', 'Criterion not met', false);
  }
  if (o.igm === 'yes' && o.epi === 'yes') return out('Probable Zika: a suspected case with Zika IgM and an epidemiological link.', 'Probable', true);
  if (o.igm === 'yes' && !k(o.epi)) notes.push('Epidemiological link: not entered. With it, IgM makes this probable.');
  if (o.epi === 'yes' && !k(o.igm)) notes.push('Zika IgM: not entered. With the link, a positive IgM makes this probable.');
  notes.push('Epidemiological link: contact with a confirmed case, or living in or travel to an area with local transmission within 2 weeks before onset.');
  return out('Suspected Zika: rash and/or fever with arthralgia, arthritis or non-purulent conjunctivitis.', 'Suspected', true);
}
