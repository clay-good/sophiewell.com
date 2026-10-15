// spec-v1637 tool 1: is a DEA registration number well formed?
//
// Owner decision 2 (scope-pharmacy-practice.md), October 15, 2026: ship on the formula a pharmacy-law
// article states and DEA's own example obeys, saying DEA does not publish it.
// Sources, re-read October 15, 2026:
//   DEA, Pharmacist's Manual (EO-DEA154R1, 2022), "Construction of a Valid DEA Registration Number for
//     Practitioners": before October 1, 1985 practitioner numbers "started with the letter A"; later ones
//     "begin with the letter B or F"; mid-level practitioners "begin with the letter M"; the first letter
//     "is almost always followed by the first letter of the registrant's last name ... and then a
//     computer generated sequence of seven numbers (such as MJ3614511)". It states no check digit.
//   Gabay M, Hosp Pharm 2013;48(8):644-645 (PMC3847977): "add the sum of the first, third, and fifth
//     digits to twice the sum of the second, fourth, and sixth digits. The total should be a number whose
//     last digit is the same as the last digit of the DEA number". MJ3614511 satisfies it.
// A first letter outside A, B, F and M is a note, not a failure: other registrant types use other
// letters the manual does not list. A second letter that differs from the name's initial is a note
// ("almost always"). A pass says the number is well formed, never that it is real or active.
//
// Pure: no DOM, no clock, no network.

const NOTE = 'DEA does not publish this check; the formula is as stated in Gabay 2013, and DEA\'s own example number satisfies it. A well-formed number is not a valid registration: verify an unfamiliar prescriber with DEA or the state.';
const PRACTITIONER = { A: 'a practitioner number issued before October 1, 1985', B: 'a practitioner number issued after October 1, 1985', F: 'a practitioner number issued after October 1, 1985', M: 'a mid-level practitioner number' };

export function deaNumberCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = typeof o.deaNumber === 'string' ? o.deaNumber : '';
  const dea = raw.replace(/[\s-]/g, '').toUpperCase();
  if (!dea) return { valid: false, message: 'Enter the DEA number: two letters, then seven digits.' };
  if (!/^[A-Z][A-Z0-9]\d{7}$/.test(dea)) return { valid: true, wellFormed: false, flag: 'not-well-formed', abnormal: true, band: `${dea} is not two letters followed by seven digits, the form DEA describes.`, bandLabel: 'Not well formed', notes: [], note: NOTE };
  const d = dea.slice(2).split('').map(Number);
  const odd = d[0] + d[2] + d[4]; const even = 2 * (d[1] + d[3] + d[5]); const total = odd + even;
  const ok = total % 10 === d[6];
  const notes = [`(${d[0]} + ${d[2]} + ${d[4]}) + 2 × (${d[1]} + ${d[3]} + ${d[5]}) = ${odd} + ${even} = ${total}; its last digit, ${total % 10}, ${ok ? 'matches' : 'does not match'} the seventh digit, ${d[6]}.`];
  notes.push(PRACTITIONER[dea[0]] ? `First letter ${dea[0]}: ${PRACTITIONER[dea[0]]} (DEA Pharmacist's Manual).` : `First letter ${dea[0]}: not one of the practitioner letters the DEA manual names (A, B, F, M); other registrant types use other letters it does not list.`);
  const name = typeof o.lastName === 'string' ? o.lastName.trim() : '';
  if (name) {
    const initial = name[0].toUpperCase();
    notes.push(initial === dea[1] ? `Second letter ${dea[1]} matches the initial of "${name}".` : `Second letter ${dea[1]} differs from the initial of "${name}". The manual says it is "almost always" the last-name initial, so this is a note, not a failure.`);
  }
  return {
    valid: true, wellFormed: ok, checkTotal: total, flag: ok ? 'well-formed' : 'check-digit-mismatch', abnormal: !ok,
    band: ok ? `${dea} is well formed: its check digit agrees. That does not show the registration is real or active.` : `${dea} fails the check digit: the formula gives ${total % 10}, the number ends in ${d[6]}.`,
    bandLabel: ok ? 'Well formed' : 'Check digit fails', notes, note: NOTE,
  };
}
