// spec-v1512 tool 5: substitution-check. Two products, the one prescribed and the one on the shelf, and
// one question: can the pharmacy substitute the second for the first? Pure: the caller passes the two
// records it found (data/orange-book or data/purple-book) and the editions.
//
// Small molecules (Orange Book): substitutable when both products have the same active ingredient, dosage
// form and route, and strength, and share a therapeutic equivalence code that begins with "A" -- the codes
// must match exactly, so AB1 is equivalent to AB1 and not to AB2 (Orange Book preface, section 1.7). A
// "B" code, or none, is not.
// Biologics (Purple Book): substitutable at the pharmacy only when the shelf product is licensed as
// interchangeable (351(k) Interchangeable) with the prescribed product as its reference product, at the
// same strength (PHS Act 351(i)(3)). A biosimilar that is not interchangeable needs a new prescription.
// Either way, state pharmacy law governs the substitution itself.

const norm = (s) => String(s || '').trim().replace(/\s+/g, ' ').toUpperCase();
const codes = (te) => String(te || '').split(',').map((c) => c.trim().toUpperCase()).filter(Boolean);
export const STATE_LAW = 'State pharmacy law governs the substitution itself and may require notice to the prescriber or the patient\'s consent.';

export const describeOrange = (r) => `${r.trade}${norm(r.trade) === norm(r.ingredient) ? '' : ` (${r.ingredient})`} ${r.strength}, ${r.form.replace(';', ', ').toLowerCase()}, ${r.applicant}, application ${r.appl} product ${r.product}; TE code ${r.te || 'none'}${r.rld ? '; reference listed drug' : ''}`;
export const describePurple = (r) => `${r.proprietary} (${r.proper}) ${r.strength}, ${r.form.toLowerCase()}, ${r.presentation.toLowerCase()}; BLA ${r.bla}; ${r.license}${r.refProprietary ? ` to ${r.refProprietary} (${r.refProper})` : ''}`;

function orange(a, b) {
  if (a.appl === b.appl && a.product === b.product) return { yes: true, band: 'The same product: no substitution is involved.' };
  if (norm(a.ingredient) !== norm(b.ingredient)) return { yes: false, band: 'Not substitutable: different active ingredients.' };
  if (norm(a.form) !== norm(b.form)) return { yes: false, band: 'Not substitutable: different dosage form or route.' };
  if (norm(a.strength) !== norm(b.strength)) return { yes: false, band: 'Not substitutable: different strengths.' };
  const ca = codes(a.te); const cb = codes(b.te);
  if (!cb.length) return { yes: false, band: 'Not substitutable: the Orange Book gives the product on the shelf no therapeutic equivalence code.' };
  if (cb.every((c) => c.startsWith('B'))) return { yes: false, band: `Not substitutable: the product on the shelf is rated ${cb.join(', ')}, not therapeutically equivalent.` };
  if (!ca.length) return { yes: false, band: 'Not substitutable: the Orange Book gives the prescribed product no therapeutic equivalence code, so no product is rated equivalent to it.' };
  const shared = ca.filter((c) => c.startsWith('A') && cb.includes(c));
  if (shared.length) return { yes: true, band: `Substitutable at the pharmacy (subject to state law): both products are rated ${shared.join(', ')}.` };
  return { yes: false, band: `Not substitutable: the ratings differ (${ca.join(', ')} prescribed, ${cb.join(', ')} on the shelf). A multi-source rating such as AB1 is equivalent only to products with the same code.` };
}

function purple(a, b) {
  if (a.bla === b.bla && a.product === b.product) return { yes: true, band: 'The same product: no substitution is involved.' };
  const refersTo = (x, ref) => norm(x.refProper) === norm(ref.proper) || (x.refProprietary && norm(x.refProprietary) === norm(ref.proprietary));
  if (!refersTo(b, a)) {
    if (refersTo(a, b)) return { yes: false, band: `Not substitutable: the prescribed product is ${a.license === '351(k) Interchangeable' ? 'an interchangeable' : 'a biosimilar'} of the product on the shelf. Interchangeability runs from the reference product to the interchangeable, not back.` };
    return { yes: false, band: 'Not substitutable: the product on the shelf is not licensed against the prescribed product as its reference.' };
  }
  if (b.license === '351(k) Biosimilar') return { yes: false, band: 'Not substitutable: biosimilar, not interchangeable. It needs a new prescription.' };
  if (b.license !== '351(k) Interchangeable') return { yes: false, band: `Not substitutable: the product on the shelf is licensed under ${b.license}.` };
  if (norm(a.strength) !== norm(b.strength)) return { yes: false, band: 'Not substitutable: different strengths.' };
  return { yes: true, band: 'Substitutable at the pharmacy (subject to state law): the product on the shelf is licensed as interchangeable with the prescribed product.' };
}

// substitutionCheck({ prescribed: { book, record }, shelf: { book, record }, editions: { orange, purple } })
export function substitutionCheck(input = {}) {
  const p = input.prescribed; const s = input.shelf;
  if (!p || !p.record) return { valid: false, message: 'Choose the prescribed product.' };
  if (!s || !s.record) return { valid: false, message: 'Choose the product on the shelf.' };
  if (p.book !== s.book) return { valid: false, message: 'One is a drug in the Orange Book and the other a biological product in the Purple Book; neither book rates one against the other, so they are not substitutable.', mixed: true };
  const r = p.book === 'orange' ? orange(p.record, s.record) : purple(p.record, s.record);
  const describe = p.book === 'orange' ? describeOrange : describePurple;
  const edition = (input.editions || {})[p.book];
  return {
    valid: true, substitutable: r.yes, band: r.band, bandLabel: r.yes ? 'Substitutable' : 'Not substitutable', abnormal: !r.yes,
    entries: [`Prescribed: ${describe(p.record)}.`, `On the shelf: ${describe(s.record)}.`],
    notes: [
      ...[['prescribed', p.record], ['shelf', s.record]].filter(([, r]) => r.note).map(([w, r]) => `FDA's note on the ${w === 'shelf' ? 'product on the shelf' : 'prescribed product'}: ${r.note}.`),
      STATE_LAW, `${p.book === 'orange' ? 'FDA Orange Book' : 'FDA Purple Book'}${edition ? `, ${edition}` : ''}.`,
    ],
  };
}

export const MAX_RESULTS = 100;
const hay = (r, b) => (b === 'orange' ? [r.trade, r.ingredient, r.strength, r.applicant, r.form] : [r.proprietary, r.proper, r.strength, r.presentation, r.refProprietary, r.refProper]).join(' ').toUpperCase();

// searchBooks(rows, words, book) -> the rows whose names, strength, applicant or form contain every word.
export function searchBooks(rows, words, book) {
  const w = words.map((x) => String(x).toUpperCase());
  const hits = rows.filter((r) => { const h = hay(r, book); return w.every((x) => h.includes(x)); });
  const name = (r) => (book === 'orange' ? `${r.trade} ${r.strength} ${r.applicant} ${r.appl}${r.product}` : `${r.proprietary} ${r.strength} ${r.presentation} ${r.bla}${r.product}`);
  return hits.sort((a, b) => name(a).localeCompare(name(b))).slice(0, MAX_RESULTS);
}

// optionLabel(record, book) -> the short line a picker shows.
export const optionLabel = (r, book) => (book === 'orange'
  ? `${r.trade} ${r.strength}, ${r.form.replace(';', ', ').toLowerCase()} (${r.applicant}; ${r.te || 'no TE code'})`
  : `${r.proprietary} ${r.strength}, ${r.presentation.toLowerCase()} (${r.license})`);
export const optionKey = (r, book) => (book === 'orange' ? `orange:${r.appl}:${r.product}` : `purple:${r.bla}:${r.product}:${r.presentation}`);
