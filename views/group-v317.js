// spec-v317: renderer for the CDI severity classification (2017 IDSA/SHEA).
// Group G. The clinician enters the WBC and serum creatinine and checks any
// fulminant findings; the tile reports non-severe, severe, or fulminant CDI.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the classification; it never authors a treatment
// order (lib/cdi-severity-v317.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cdi-severity-v317.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || '1');
  inp.setAttribute('inputmode', opts.step && opts.step !== '1' ? 'decimal' : 'numeric');
  if (opts.min != null) inp.setAttribute('min', String(opts.min));
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The regimen and the management pathway stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const IDS = ['cdi-wbc', 'cdi-cr', 'cdi-hypotension', 'cdi-ileus', 'cdi-megacolon'];

export const renderers = {
  'cdi-severity'(root) {
    note(root, '2017 IDSA/SHEA Clostridioides difficile infection severity classification. Enter the WBC and serum creatinine, and check any fulminant finding. Severe = WBC ≥ 15,000 cells/µL or creatinine ≥ 1.5 mg/dL; fulminant = hypotension/shock, ileus, or megacolon (overrides the labs). Near-neighbors: atlas-cdi.');
    root.appendChild(field('WBC (cells/µL)', 'cdi-wbc', { min: 0, placeholder: 'e.g. 18000' }));
    root.appendChild(field('Serum creatinine (mg/dL)', 'cdi-cr', { step: '0.1', min: 0, placeholder: 'e.g. 1.2' }));
    note(root, 'Fulminant findings (any one classifies fulminant):');
    root.appendChild(check('Hypotension or shock', 'cdi-hypotension'));
    root.appendChild(check('Ileus', 'cdi-ileus'));
    root.appendChild(check('Megacolon (toxic megacolon)', 'cdi-megacolon'));

    const o = out(); root.appendChild(o);
    wire(IDS, () => safe(o, () => {
      const r = M.cdiSeverity({
        wbc: val('cdi-wbc'), creatinine: val('cdi-cr'),
        hypotension: chk('cdi-hypotension'), ileus: chk('cdi-ileus'), megacolon: chk('cdi-megacolon'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Class', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
