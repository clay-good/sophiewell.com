// spec-v608: renderer for the Zulewski clinical score. Group G. Sections are h2 (an h3 under the page h1 is
// a heading-level skip). Age is asked FIRST, because the age correction is the item most reproductions drop
// (lib/zulewski-v608.js). The three skin items are asked separately and are never merged.
//
// Per spec-v11 section 5.3 this rates clinical suspicion; it never diagnoses, never grades, and never doses.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/zulewski-v608.js';
import { resultRow } from '../lib/result-copy.js';

const YN = [['', '--'], ['no', 'No'], ['yes', 'Yes']];

function number(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', max: '120', step: '1' }));
  return wrap;
}
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
function heading(root, text) { root.appendChild(el('h2', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const aid = (k) => `zul-${k}`;

export const renderers = {
  zulewski(root) {
    heading(root, 'Age — the correction most reproductions drop');
    root.appendChild(number('Age in years', 'zul-age'));
    note(root, M.AGE_NOTE);

    heading(root, `Symptoms — ${M.SYMPTOMS.length} items, 1 point each`);
    for (const s of M.SYMPTOMS) root.appendChild(select(s.text, aid(s.key), YN));

    heading(root, `Signs — ${M.SIGNS.length} items, 1 point each`);
    for (const s of M.SIGNS) root.appendChild(select(s.text, aid(s.key), YN));
    note(root, M.SKIN_NOTE);

    const o = out(); root.appendChild(o);
    const ids = ['zul-age', ...[...M.SYMPTOMS, ...M.SIGNS].map((s) => aid(s.key))];
    wire(ids, () => safe(o, () => {
      const input = { age: val('zul-age') };
      for (const s of [...M.SYMPTOMS, ...M.SIGNS]) input[s.key] = val(aid(s.key));
      const r = M.zulewskiScore(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel },
        { label: 'Symptoms', value: `${r.symptomPoints} of ${M.SYMPTOMS.length}` },
        { label: 'Signs', value: `${r.signPoints} of ${M.SIGNS.length}` },
        { label: 'Age point', value: `${r.ageCorrection}` },
        { label: 'Uncorrected', value: `${r.uncorrectedScore} (${r.uncorrectedBand})` },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'What this score cannot do');
    note(root, M.TSH_NOTE);
    note(root, M.BAND_NOTE);
    note(root, M.SPLIT_NOTE);
    note(root, M.BILLEWICZ_NOTE);
    postureNote(root);
  },
};
