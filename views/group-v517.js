// spec-v517: renderer for the Premature Infant Pain Profile (PIPP). Group G. Seven selects, each 0-3, with
// the two contextual indicators (gestational age, behavioral state) first because they are scored before the
// procedure begins.
//
// Same input/render contract as the rest of the codebase: every select has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile sums what an observer rates; it never asserts a diagnosis and never
// recommends a drug or a dose (lib/pipp-v517.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pipp-v517.js';
import { resultRow } from '../lib/result-copy.js';

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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The analgesia decision stays with the neonatal team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'pipp'(root) {
    note(root, 'The Premature Infant Pain Profile, seven indicators scored 0 to 3 around one procedure, total 0 to 21. The first two are contextual and are scored before the procedure begins: a more preterm infant, and an infant in quiet sleep, mounts a smaller response to the same pain, so the score starts them higher. A total of 6 or less is commonly read as minimal or no pain and above 12 as moderate to severe. A low score does not mean the procedure did not hurt.');

    const ids = [];
    for (const ind of M.PIPP_INDICATORS) {
      const id = `pp-${ind.key}`;
      ids.push(id);
      root.appendChild(select(ind.label, id, ind.options.map((o) => [o.value, o.text])));
    }

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const ind of M.PIPP_INDICATORS) args[ind.key] = val(`pp-${ind.key}`);
      const r = M.pipp(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Total', value: r.bandLabel },
        { label: 'From the contextual indicators', value: `${r.contextual} of 6` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
