// spec-v511: renderer for the CRAFFT adolescent substance-use screen. Group G. Six yes/no selects, one point
// each, with the validated positive cut point of 2.
//
// Same input/render contract as the rest of the codebase: every select has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile sums the answers given; it never asserts a diagnosis, and it never asserts an
// indication for drug testing, a treatment referral, or disclosure to a parent or guardian
// (lib/crafft-v511.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/crafft-v511.js';
import { resultRow } from '../lib/result-copy.js';

const YES_NO = [['no', 'No'], ['yes', 'Yes']];

function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The next step stays with the clinician and the adolescent.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'crafft'(root) {
    note(root, 'The CRAFFT, the six-item adolescent substance-use screen. One point per yes; 2 or more is the validated positive cut point and means further assessment is warranted. It is a screen, not a diagnosis. The CAR question asks about riding with an impaired driver, which is worth addressing whatever the total is.');

    const ids = [];
    M.CRAFFT_ITEMS.forEach((item, i) => {
      const id = `cf-q${i + 1}`;
      ids.push(id);
      root.appendChild(select(`${item.letter}. ${item.text}`, id, YES_NO));
    });

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      ids.forEach((id, i) => { args[`q${i + 1}`] = val(id); });
      const r = M.crafft(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Total', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
