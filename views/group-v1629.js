// spec-v1629: renderers for the pharmacy bench-math tools (Group Q): alligation and dilution-c1v1.

import { el, clear } from '../lib/dom.js';
import * as AL from '../lib/alligation-v1629.js';
import * as DL from '../lib/dilution-c1v1-v1629.js';
import { resultRow } from '../lib/result-copy.js';

const NA = { value: '', text: '— choose —' };
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [NA, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
  return wrap;
}
function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
  return wrap;
}
function textareaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '4', placeholder }));
  root.appendChild(wrap);
  return wrap;
}
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function show(r, o) {
  if (!r.valid) { note(o, r.message); return; }
  resultRow(o, [{ text: r.band, cls: null }, { label: 'Result', value: r.bandLabel }]);
  list(o, r.notes);
  note(o, r.note);
}

export const renderers = {
  alligation(root) {
    const pairs = [['al-mode', 'mode'], ['al-su', 'strengthUnit'], ['al-qu', 'quantityUnit'], ['al-high', 'higher'], ['al-low', 'lower'], ['al-target', 'target'], ['al-total', 'total'], ['al-highqty', 'higherQty'], ['al-lowqty', 'lowerQty'], ['al-lots', 'lots']];
    selectField(root, 'What to work out', 'al-mode', AL.MODES);
    selectField(root, 'Strength unit (the same for every strength)', 'al-su', AL.STRENGTH_UNITS);
    selectField(root, 'Quantity unit', 'al-qu', AL.QUANTITY_UNITS);
    const two = [
      numField(root, 'Higher strength (100% for pure drug)', 'al-high', 'e.g. 70'),
      numField(root, 'Lower strength (0 for a plain diluent)', 'al-low', 'e.g. 20'),
      numField(root, 'Target strength', 'al-target', 'e.g. 30'),
      numField(root, 'Total wanted (enter this, or one amount on hand below)', 'al-total', 'e.g. 500'),
      numField(root, 'Or: amount of the higher strength on hand', 'al-highqty', ''),
      numField(root, 'Or: amount of the lower strength on hand', 'al-lowqty', ''),
    ];
    const medial = [textareaField(root, 'Lots, one per line: strength, quantity', 'al-lots', '10, 100\n20, 300')];
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const mode = val('al-mode');
      for (const w of two) w.hidden = mode === 'medial';
      for (const w of medial) w.hidden = mode !== 'medial';
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(AL.alligation(args), o);
    }));
  },

  'dilution-c1v1'(root) {
    const pairs = [['dl-c1', 'stockStrength'], ['dl-u1', 'stockUnit'], ['dl-q1', 'stockQuantity'], ['dl-c2', 'finalStrength'], ['dl-u2', 'finalUnit'], ['dl-q2', 'finalQuantity'], ['dl-sg', 'specificGravity']];
    note(root, 'Enter any three of the four values and leave the one to solve for blank.');
    numField(root, 'Stock strength', 'dl-c1', 'e.g. 1000');
    selectField(root, 'Stock strength unit', 'dl-u1', DL.UNITS);
    numField(root, 'Stock quantity (mL, or g for % w/w)', 'dl-q1', '');
    numField(root, 'Final strength', 'dl-c2', 'e.g. 10000');
    selectField(root, 'Final strength unit', 'dl-u2', DL.UNITS);
    numField(root, 'Final quantity (mL, or g for % w/w)', 'dl-q2', 'e.g. 100');
    numField(root, 'Specific gravity of the stock (only for a % w/w stock made into a weight-in-volume product)', 'dl-sg', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(DL.dilutionC1V1(args), o);
    }));
  },
};
