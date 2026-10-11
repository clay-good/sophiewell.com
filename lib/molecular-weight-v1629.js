// spec-v1629 tool 4: molecular weight from a formula.
//
// The sum of abridged standard atomic weights times atom counts (lib/atomic-weights-2024.js, IUPAC
// CIAAW 2024). The reader types the formula printed on the bulk container, the certificate of
// analysis or the FDA label; the tool never maps a drug name to a formula.
//
// The formula grammar:
//   element symbols as written (Ca, not CA or ca: "CO" is carbon and oxygen, "Co" is cobalt)
//   whole-number counts after a symbol or a closing bracket (H2, (OH)2)
//   round or square brackets, nested
//   hydrates and adducts after a dot, a middle dot or an asterisk, with a leading multiplier that
//   may be a decimal (CaCl2.2H2O, CuSO4·5H2O, CaSO4.0.5H2O)
//   a charge only after a caret, ignored for the weight (SO4^2-, NH4^+, Fe^3+)
// A dot is always a separator, so a decimal atom count is not read (Fe0.5O is refused), and a bare
// trailing sign is refused as ambiguous: "Fe3+" is one iron, "NH4+" is four hydrogens, and no rule
// tells them apart. The result prints how the formula was read, so a misreading is visible.
// An unknown symbol is refused, never skipped. An element the table gives no standard atomic weight
// for (technetium, for one) is refused. A lowercase formula is refused: its symbols are ambiguous.
//
// Precision: each atomic weight carries the decimal places the table prints, and the result is
// rounded to the fewest decimal places among the elements used. The table's stated uncertainties are
// combined (each times its atom count, added) and shown, so a lithium salt, whose atomic weight is
// uncertain to 0.06, is visibly less certain.
//
// Pure: no DOM, no clock, no network.

import { ATOMIC_WEIGHTS, ATOMIC_WEIGHTS_EDITION } from './atomic-weights-2024.js';

const MAX_LEN = 200;
const MAX_ATOMS = 1e6;
const decimals = (s) => (s.includes('.') ? s.split('.')[1].length : 0);
const fix = (x, d) => Number(x).toFixed(d);
const show = (x, d) => Number(fix(x, d)).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const known = (sym) => Object.prototype.hasOwnProperty.call(ATOMIC_WEIGHTS, sym);

function fail(message) { const e = new RangeError(message); e.formula = true; throw e; }

// parseGroup(s, start, closer) -> [counts Map, next index]. Recursive descent over one bracket level.
function parseGroup(s, start, closer) {
  const counts = new Map();
  const add = (sym, n) => counts.set(sym, (counts.get(sym) || 0) + n);
  let i = start;
  const count = () => {
    const m = /^[0-9]+/.exec(s.slice(i));
    if (!m) return 1;
    i += m[0].length;
    const n = Number(m[0]);
    if (!(n > 0)) fail('A count of 0 is not a formula. Atom counts are whole numbers; a decimal count such as Fe0.5 is not read.');
    return n;
  };
  while (i < s.length) {
    const ch = s[i];
    if (ch === closer) return [counts, i + 1];
    if (ch === '(' || ch === '[') {
      const [inner, next] = parseGroup(s, i + 1, ch === '(' ? ')' : ']');
      if (!inner.size) fail('A pair of brackets is empty. Check the formula.');
      i = next;
      const n = count();
      for (const [sym, k] of inner) add(sym, k * n);
    } else if (ch === ')' || ch === ']') {
      fail(`A "${ch}" closes a bracket that was not opened. Check the brackets.`);
    } else if (/[A-Z]/.test(ch)) {
      const two = s.slice(i, i + 2);
      let sym = ch;
      if (/^[A-Z][a-z]$/.test(two)) {
        if (!known(two)) fail(`"${two}" is not an element symbol. Check the formula; nothing is skipped.`);
        sym = two;
      } else if (!known(ch)) fail(`"${ch}" is not an element symbol. Check the formula; nothing is skipped.`);
      i += sym.length;
      add(sym, count());
    } else if (/[a-z]/.test(ch)) {
      fail(`A lowercase "${ch}" does not start an element symbol. Type each symbol as it is written: Ca is calcium, CO is carbon and oxygen, Co is cobalt.`);
    } else {
      fail(`"${ch}" is not part of a formula. Use element symbols, whole-number counts, brackets, and a dot before a hydrate.`);
    }
  }
  if (closer) fail('A bracket is not closed. Check the brackets.');
  return [counts, i];
}

// parseFormula(text) -> { parts: [{ text, multiplier, counts: Map }], counts: Map } or throws. Internal:
// molecularWeight() is the entry point and never throws on a bad formula.
function parseFormula(text) {
  // A formula is text. A number or NaN is not one (the string "NaN" would read as sodium and nitrogen).
  if (text !== null && text !== undefined && typeof text !== 'string') fail('Enter the chemical formula as text, as printed on the container, the certificate of analysis or the label.');
  let s = String(text ?? '').replace(/\s+/g, '');
  if (!s) fail('Enter a chemical formula, as printed on the container, the certificate of analysis or the label.');
  if (s.length > MAX_LEN) fail(`A formula of ${s.length} characters is longer than the ${MAX_LEN} this tool takes.`);
  // A charge is written after a caret and does not change the weight: SO4^2-, NH4^+, Fe^3+.
  s = s.replace(/\^[0-9]*[+−-]$/, '');
  if (/[+−-]$/.test(s)) fail('A sign at the end is ambiguous ("Fe3+" is one iron; "NH4+" is four hydrogens). Write a charge after a caret (NH4^+, Fe^3+), or leave it off: a charge does not change the weight.');
  if (s.includes('^')) fail('A caret is read only before a charge at the end of the formula (SO4^2-).');
  const raw = s.split(/[.·*]/);
  // A decimal hydrate multiplier arrives split in two: "CaSO4.0.5H2O" is CaSO4, "0", "5H2O".
  const pieces = [];
  for (let k = 0; k < raw.length; k += 1) {
    if (/^[0-9]+$/.test(raw[k]) && k + 1 < raw.length && /^[0-9]+[A-Z(\[]/.test(raw[k + 1])) { pieces.push(`${raw[k]}.${raw[k + 1]}`); k += 1; } else pieces.push(raw[k]);
  }
  const parts = [];
  for (const piece of pieces) {
    if (!piece) fail('A dot must be followed by a hydrate or adduct, such as .2H2O.');
    const m = /^([0-9]+(?:\.[0-9]+)?)(?=[A-Z(\[])/.exec(piece);
    const multiplier = m ? Number(m[1]) : 1;
    if (!(multiplier > 0)) fail('A multiplier of 0 is not a formula. Check the numbers.');
    const body = m ? piece.slice(m[1].length) : piece;
    if (/^[0-9]/.test(body)) fail('A number must be followed by a formula, such as 2H2O.');
    const [counts, end] = parseGroup(body, 0, null);
    if (end !== body.length || !counts.size) fail('The formula could not be read. Check it against the source.');
    parts.push({ text: body, multiplier, counts });
  }
  const total = new Map();
  for (const p of parts) for (const [sym, n] of p.counts) total.set(sym, (total.get(sym) || 0) + n * p.multiplier);
  let atoms = 0;
  for (const n of total.values()) atoms += n;
  if (atoms > MAX_ATOMS) fail('That formula has more atoms than this tool sums. Check the counts.');
  return { parts, counts: total };
}

// weigh(counts) -> { mw, decimals, uncertainty } from a Map of symbol -> count, or throws for an
// element with no standard atomic weight. Internal.
function weigh(counts) {
  let mw = 0; let dec = Infinity; let unc = 0;
  for (const [sym, n] of counts) {
    const el = ATOMIC_WEIGHTS[sym];
    if (el.weight === null) fail(`${sym} (${el.name}) has no standard atomic weight in the ${ATOMIC_WEIGHTS_EDITION.edition} table, so this formula has no molecular weight here.`);
    mw += Number(el.weight) * n;
    unc += Number(el.uncertainty) * n;
    dec = Math.min(dec, decimals(el.weight));
  }
  return { mw, decimals: dec, uncertainty: unc };
}

export function molecularWeight(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let parsed; let w;
  try { parsed = parseFormula(o.formula); w = weigh(parsed.counts); } catch (e) {
    if (e && e.formula) return { valid: false, message: e.message };
    throw e;
  }
  const d = w.decimals;
  // Hill order: with carbon, C then H then the rest alphabetically; without carbon, all alphabetically.
  const hasC = parsed.counts.has('C');
  const rank = (x) => (hasC && x === 'C' ? '0' : hasC && x === 'H' ? '1' : `2${x}`);
  const order = [...parsed.counts.keys()].sort((a, b) => rank(a).localeCompare(rank(b)));
  const elements = order.map((sym) => {
    const n = parsed.counts.get(sym); const el = ATOMIC_WEIGHTS[sym];
    const mass = Number(el.weight) * n;
    return { symbol: sym, name: el.name, count: n, atomicWeight: el.weight, mass: Number(fix(mass, decimals(el.weight))), percent: Number(fix((mass / w.mw) * 100, 2)) };
  });
  const readAs = parsed.parts.map((p) => (p.multiplier === 1 ? p.text : `${p.multiplier} × ${p.text}`)).join(' + ');
  const notes = [`Read as: ${readAs}.`];
  for (const e of elements) notes.push(`${e.symbol} (${e.name}): ${e.count} × ${e.atomicWeight} = ${show(e.mass, decimals(e.atomicWeight))}, ${e.percent.toFixed(2)}% of the weight.`);
  // Water of hydration: the parts after the first that are exactly water.
  const isWater = (p) => p.counts.size === 2 && p.counts.get('H') === 2 && p.counts.get('O') === 1;
  const waters = parsed.parts.slice(1).filter(isWater).reduce((sum, p) => sum + p.multiplier, 0);
  let waterPercent = null;
  if (waters > 0) {
    const water = weigh(new Map([['H', 2 * waters], ['O', waters]])).mw;
    waterPercent = Number(fix((water / w.mw) * 100, 2));
    notes.push(`Water of hydration: ${waters} H2O = ${show(water, 3)} of ${show(w.mw, d)}, ${waterPercent.toFixed(2)}%. The anhydrous form weighs ${show(w.mw - water, d)} g/mol.`);
  }
  const uncertainty = Number(w.uncertainty.toFixed(Math.max(d, 2) + 1));
  notes.push(`Given to ${d} decimal place${d === 1 ? '' : 's'}, the fewest among these elements' atomic weights (the unrounded sum is ${Number(w.mw.toFixed(6))}). The table's uncertainties add to ± ${uncertainty} g/mol.`);
  notes.push(`Atomic weights: ${ATOMIC_WEIGHTS_EDITION.source.label}.`);
  return {
    valid: true, molecularWeight: Number(fix(w.mw, d)), molecularWeightUnrounded: Number(w.mw.toFixed(6)), decimals: d, uncertainty,
    elements, waterPercent, edition: ATOMIC_WEIGHTS_EDITION.edition,
    band: `Molecular weight ${show(w.mw, d)} g/mol.`,
    bandLabel: `${show(w.mw, d)} g/mol`,
    notes,
    note: 'The sum of standard atomic weights times atom counts. Type the formula from the bulk container, the certificate of analysis or the label: the tool does not look up a drug by name, and a hydrate or a salt is a different formula from the base.',
  };
}
