// spec-v362: renderer for the Forrester hemodynamic classification (subsets I-IV). Group G. The
// clinician enters the cardiac index (CI) and the pulmonary capillary wedge pressure (PCWP); the tile
// computes the hemodynamic subset (warm/cold x dry/wet) and flags any subset other than I.
//
// Same input/render contract as the rest of the codebase: the inputs have real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Forrester subset computed from the entered values; it never
// asserts a diagnosis, a treatment decision, or a prognosis (lib/forrester-hemodynamic-v362.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/forrester-hemodynamic-v362.js';
import { resultRow } from '../lib/result-copy.js';

function numField(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'decimal' }, attrs || {})));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The mortality figures are cohort averages; the management decision stays with the treating clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'forrester-hemodynamic'(root) {
    note(root, 'Forrester hemodynamic classification (Forrester, Diamond & Swan 1977) of acute MI / acute heart failure. Enter the cardiac index and PCWP. Cold = CI below 2.2 L/min/m2 (hypoperfusion); wet = PCWP above 18 mmHg (congestion). I warm/dry; II warm/wet; III cold/dry; IV cold/wet (cardiogenic shock). The invasive counterpart to the clinical Killip classification. Near-neighbors: killip.');
    root.appendChild(numField('Cardiac index (L/min/m²)', 'fh-ci', { min: '0', max: '15', step: '0.1' }));
    root.appendChild(numField('PCWP (mmHg)', 'fh-pcwp', { min: '0', max: '60', step: '1' }));

    const o = out(); root.appendChild(o);
    wire(['fh-ci', 'fh-pcwp'], () => safe(o, () => {
      const r = M.forresterHemodynamic({ ci: val('fh-ci'), pcwp: val('fh-pcwp') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Subset', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
