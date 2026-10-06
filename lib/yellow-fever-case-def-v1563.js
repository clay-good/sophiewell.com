// spec-v1563 tool 9: yellow fever case definition: suspected, probable or confirmed (WHO 2010).
//
// Source: WHO. Yellow fever surveillance and outbreak response: revision of case definitions, October 2010.
// Wkly Epidemiol Rec. 2010;85(47):465-472, Table (IRIS 10665/241679; WHO copyright, facts restated). Read
// October 6, 2026. Suspected: acute onset of fever with jaundice within 14 days of the first symptoms.
// Probable: suspected plus one of yellow fever IgM with no yellow fever vaccination in the 30 days before
// onset, positive postmortem liver histopathology, or an epidemiological link to a confirmed case or an
// outbreak. Confirmed: probable plus either yellow-fever-specific IgM, a fourfold rise in IgM or IgG, or
// specific neutralizing antibodies (other flaviviruses excluded), with no vaccination in the 30 days before
// onset; or the genome by PCR, antigen, or virus isolation, with no vaccination in the 14 days before onset.
//
// Stated rather than hidden: the 30-day and 14-day vaccine windows are separate. A criterion left blank is
// not assessed.
//
// Pure: no DOM, no clock.

export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
export const VACCINE_OPTIONS = [
  { value: 'none', text: 'No yellow fever vaccine in the 30 days before onset' },
  { value: 'd15to30', text: 'Vaccinated 15-30 days before onset' },
  { value: 'lt15', text: 'Vaccinated within 14 days before onset' },
];

const NOTE = 'This follows WHO\'s 2010 yellow fever case definitions (surveillance and reporting).';
const k = (v) => v === 'yes' || v === 'no';

export function yellowFeverCaseDef(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (!k(o.fever) || !k(o.jaundice)) return { valid: false, message: 'Choose whether there was acute fever, and jaundice within 14 days of the first symptoms.' };
  const notes = [];
  const out = (band, label, abnormal) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });
  if (o.fever !== 'yes' || o.jaundice !== 'yes') return out('Not a suspected case: the definition needs acute fever with jaundice within 14 days of the first symptoms.', 'Not suspected', false);
  const vac = VACCINE_OPTIONS.find((x) => x.value === o.vaccine)?.value;
  const no30 = vac === 'none';
  const no14 = vac === 'none' || vac === 'd15to30';
  if (!vac) notes.push('Recent yellow fever vaccination: not entered. Antibody results count only without vaccination in the 30 days before onset, and PCR, antigen or isolation only without it in the 14 days before.');

  const probable = (o.igm === 'yes' && no30) || o.histo === 'yes' || o.epi === 'yes';
  if (o.igm === 'yes' && !no30 && vac) notes.push('The IgM does not count toward a probable case: vaccinated within 30 days before onset.');
  if (!probable) return out('Suspected yellow fever: acute fever with jaundice within 14 days of the first symptoms.', 'Suspected', true);
  const sero = o.serology === 'yes' && no30;
  const viro = o.virology === 'yes' && no14;
  if (sero || viro) return out(`Confirmed yellow fever: a probable case with ${sero ? 'specific IgM, a fourfold antibody rise or specific neutralizing antibodies, no vaccine in the 30 days before' : 'the virus genome, antigen or isolate, no vaccine in the 14 days before'} onset.`, 'Confirmed', true);
  if (o.serology === 'yes' && vac && !no30) notes.push('The specific antibodies do not confirm: vaccinated within 30 days before onset.');
  if (o.virology === 'yes' && vac && !no14) notes.push('PCR, antigen or isolation does not confirm: vaccinated within 14 days before onset.');
  return out('Probable yellow fever: a suspected case with yellow fever IgM (no recent vaccine), positive postmortem liver histopathology, or an epidemiological link.', 'Probable', true);
}
