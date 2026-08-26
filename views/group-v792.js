// spec-v792 §2: renderer for rudas — the Rowland Universal Dementia Assessment Scale
// (Clinical Scoring & Risk, Group G). Companion to sixcit, ad8, mini-cog and slums.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Six number
// inputs, each carrying its own maximum on the label, because the six maxima differ.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/rudas-v792.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id, max) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('min', '0');
  inp.setAttribute('max', String(max));
  inp.setAttribute('step', '1');
  inp.setAttribute('inputmode', 'numeric');
  wrap.appendChild(inp);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This is a screening test that flags the need for a fuller assessment. It does not diagnose dementia or identify its cause.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  rudas(root) {
    note(root, 'RUDAS (Storey 2004): a cognitive screen built to be minimally affected by culture, language and education. The six items carry different maxima and add to 30, and higher is better. A total of 22 or less counts as possible cognitive impairment.');
    root.appendChild(numberField('Memory (0 to 8)', 'rudas-memory', 8));
    root.appendChild(numberField('Body orientation (0 to 5)', 'rudas-body', 5));
    root.appendChild(numberField('Praxis (0 to 2)', 'rudas-praxis', 2));
    root.appendChild(numberField('Drawing (0 to 3)', 'rudas-drawing', 3));
    root.appendChild(numberField('Judgement (0 to 4)', 'rudas-judgement', 4));
    root.appendChild(numberField('Language (0 to 8)', 'rudas-language', 8));
    const ids = ['rudas-memory', 'rudas-body', 'rudas-praxis', 'rudas-drawing', 'rudas-judgement', 'rudas-language'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.rudas({
        memory: val('rudas-memory'),
        bodyOrientation: val('rudas-body'),
        praxis: val('rudas-praxis'),
        drawing: val('rudas-drawing'),
        judgement: val('rudas-judgement'),
        language: val('rudas-language'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.score}/30` },
      ]);
      note(o, `Items: ${r.parts.join(', ')}.`);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
