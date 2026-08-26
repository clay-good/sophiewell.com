// spec-v799 §2: renderer for caine-wernicke — the Caine criteria for Wernicke
// encephalopathy (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Four checkboxes;
// two of them meet the criteria.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/caine-wernicke-v799.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. Thiamine is given on suspicion and is safe, so nothing here is a reason to withhold it. Failing to meet two signs does not exclude the diagnosis, and this sets no thiamine dose or route.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'caine-wernicke'(root) {
    note(root, 'Two of these four signs are enough to consider Wernicke encephalopathy. The classic triad of confusion, ataxia and ophthalmoplegia appears in only about 16 percent of cases, and about 19 percent of patients show none of the three when first assessed, so waiting for the triad misses most of them.');
    root.appendChild(checkField('Dietary deficiency', 'caine-diet'));
    root.appendChild(checkField('Oculomotor abnormalities', 'caine-ocular'));
    root.appendChild(checkField('Cerebellar dysfunction', 'caine-cerebellar'));
    root.appendChild(checkField('Altered mental state or mild memory impairment', 'caine-mental'));
    const ids = ['caine-diet', 'caine-ocular', 'caine-cerebellar', 'caine-mental'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.caineWernicke({
        dietaryDeficiency: checked('caine-diet'),
        oculomotor: checked('caine-ocular'),
        cerebellar: checked('caine-cerebellar'),
        mentalOrMemory: checked('caine-mental'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Signs present', value: `${r.signCount}/4` },
      ]);
      note(o, r.signs.length ? `Signs: ${r.signs.join(', ')}.` : 'No signs selected.');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
