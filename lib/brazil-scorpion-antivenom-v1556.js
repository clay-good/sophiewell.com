// spec-v1556 tool 3: scorpion sting severity and antivenom in Brazil (Tityus).
//
// Source: Brasil, Ministério da Saúde. Guia de Vigilância em Saúde, 6th ed. revised, vol. 3, 2024 (CC
// BY-NC-SA 4.0, facts restated; owner decision D3), "Escorpionismo", treatment (p. 1132) and Quadro 3 (p. 1133, adapted
// from FUNASA 2001). Read October 6, 2026: mild, local pain and tingling, no antivenom (local lidocaine 2%
// without vasoconstrictor, or dipyrone 10 mg/kg); moderate, intense local pain with one or more of nausea,
// vomiting, sweating, drooling, agitation, fast breathing, fast heart rate, 2-3 vials of SAEsc (or SAAr);
// severe, the moderate signs plus one or more of incessant vomiting, profuse sweating, heavy drooling,
// prostration, seizures, coma, slow heart rate, heart failure, pulmonary edema, shock, 4-6 vials. Observe
// stung children 6-12 hours.
//
// Stated rather than hidden: vial counts are for Brazilian public antivenoms. A sign left blank is not
// assessed; when it could raise the class, the answer is "at least".
//
// Pure: no DOM, no clock.

export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const NOTE = 'This follows Brazil\'s Guia de Vigilância em Saúde (2024), Quadro 3. Vial counts are for Brazilian public antivenoms only.';
const k = (v) => v === 'yes' || v === 'no';

export function brazilScorpionAntivenom(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (![o.local, o.moderate, o.severe].some(k)) return { valid: false, message: 'Choose at least whether there is local pain, and whether moderate or severe signs are present.' };
  const notes = ['Observe a stung child for 6 to 12 hours.'];
  const out = (band, label, abnormal) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });
  if (o.severe === 'yes') return out('Severe scorpion sting: 4 to 6 vials of SAEsc (or SAAr), with intensive support.', 'Severe: 4-6 vials', true);
  if (o.moderate === 'yes') {
    if (!k(o.severe)) notes.push('Severe signs: not assessed. Any one would make this severe (4 to 6 vials).');
    return out(`${k(o.severe) ? 'Moderate' : 'At least moderate'} scorpion sting: 2 to 3 vials of SAEsc (or SAAr).`, `${k(o.severe) ? 'Moderate' : 'At least moderate'}: 2-3 vials`, true);
  }
  if (!k(o.moderate) || !k(o.severe)) return out('Not decided: the systemic signs were not fully assessed. With local pain and tingling only, the sting is mild.', 'Not decided', false);
  if (o.local === 'yes') return out('Mild scorpion sting: no antivenom. Relieve the pain with local lidocaine 2% without vasoconstrictor, or dipyrone 10 mg/kg.', 'Mild: no antivenom', false);
  return out('No local or systemic signs of scorpion envenoming now.', 'No signs', false);
}
