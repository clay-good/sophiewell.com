// spec-v510: renderer for the Banff grade of acute T cell-mediated rejection. Group G. Three selects, one
// per Banff lesion score (i, t, v), resolving to a category from borderline through grade III.
//
// Same input/render contract as the rest of the codebase: every select has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile applies the published rule to scores a pathologist has already assigned; it
// never reads a biopsy and never asserts an indication for treatment (lib/banff-tcmr-v510.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/banff-tcmr-v510.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The treatment decision stays with the transplant nephrology and pathology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'banff-tcmr'(root) {
    note(root, 'The Banff grade of acute T cell-mediated rejection in a kidney allograft biopsy. Enter the three lesion scores the pathologist assigned: interstitial inflammation (i), tubulitis (t), and intimal arteritis (v). Any arteritis grades the biopsy II or III on its own. This covers T cell-mediated rejection only: antibody-mediated rejection is a separate diagnosis, and chronic active rejection is scored on different lesions.');

    const ids = [];
    for (const lesion of M.LESIONS) {
      const id = `bf-${lesion.key}`;
      ids.push(id);
      root.appendChild(select(lesion.label, id, lesion.options.map((o) => [o.value, o.text])));
    }

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const lesion of M.LESIONS) args[lesion.key] = val(`bf-${lesion.key}`);
      const r = M.banffTcmr(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Category', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
