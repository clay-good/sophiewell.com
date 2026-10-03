// spec-v1542 §3: decimal commas in number fields. Typing 37,5 into an <input type="number"> gives 375 in
// Chromium (every locale) and in WebKit with an English locale: the comma is dropped and the 5 appended, a
// silent tenfold error. Firefox empties the field instead. One listener on the document turns a typed comma
// into a decimal point in every number field, and says so beside the field. A comma that could be a
// thousands separator (1,500: one and a half, or fifteen hundred?) is refused: the field is emptied before
// the tool reads it, with a note asking for the number without the separator.

import { AMBIGUOUS_GROUPING } from './num.js';

const NOTE = 'decimal-comma-note';

function noteFor(input) {
  let n = input.nextElementSibling;
  if (n && n.classList && n.classList.contains(NOTE)) return n;
  n = input.ownerDocument.createElement('p');
  n.className = `muted ${NOTE}`;
  n.setAttribute('role', 'status');
  input.insertAdjacentElement('afterend', n);
  return n;
}

function clearNote(input) {
  const n = input.nextElementSibling;
  if (n && n.classList && n.classList.contains(NOTE)) n.remove();
  delete input.dataset.decimalComma;
}

const isNumberField = (t) => t && t.tagName === 'INPUT' && t.type === 'number';

export function installDecimalComma(doc) {
  doc.addEventListener('keydown', (e) => {
    if (e.key !== ',' || !isNumberField(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    e.target.dataset.decimalComma = '1';
    doc.execCommand('insertText', false, '.');
  }, true);
  // Capture phase: this runs before the tool's own input listener, so an ambiguous value is gone before it is read.
  doc.addEventListener('input', (e) => {
    const t = e.target;
    if (!isNumberField(t) || !t.dataset.decimalComma) return;
    if (t.value === '') { if (!t.validity.badInput) clearNote(t); return; }
    if (AMBIGUOUS_GROUPING.test(t.value)) {
      const typed = t.value.replace('.', ',');
      t.value = '';
      delete t.dataset.decimalComma;
      noteFor(t).textContent = `${typed} could be a decimal or a thousands separator. Type it without the comma: a dot for decimals (${typed.replace(',', '.')}) or no separator (${typed.replace(',', '')}).`;
      return;
    }
    noteFor(t).textContent = `The comma was read as a decimal point: ${t.value}.`;
  }, true);
}
