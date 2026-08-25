// spec-v640 §2: renderer for mpa-acr-eular-2022 — the 2022 ACR/EULAR
// Classification Criteria for Microscopic Polyangiitis (Clinical Scoring & Risk,
// Group G). The fourth 2022 ACR/EULAR vasculitis tile, completing the ANCA pair
// with gpa-acr-eular-2022 (group-v639.js).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Three
// items carry NEGATIVE weights (nasal involvement, cANCA/PR3, blood eosinophilia);
// the labels show the sign. No absolute-requirement gate: the items sum directly,
// and the note states the small/medium-vessel-vasculitis context.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/mpa-v640.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The classification is the cited criteria set’s, computed from the bounded inputs you entered — the tile takes your read, it does not interpret a scan, lab, or biopsy on its own. Classification criteria are built to standardize study cohorts, not to diagnose an individual; the diagnosis and the management decision stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'mpa-acr-eular-2022'(root) {
    note(root, '2022 ACR/EULAR microscopic-polyangiitis classification (Suppiah 2022): apply only after a small/medium-vessel-vasculitis diagnosis with mimics excluded. Six weighted items sum to a range of -8 to +12; ≥ 5 classifies as MPA. Three items are negative (nasal involvement, cANCA/PR3, blood eosinophilia) because they point toward GPA and EGPA.');
    root.appendChild(checkField('Positive pANCA or anti-MPO antibody (+6)', 'mpa-panca'));
    root.appendChild(checkField('Pauci-immune glomerulonephritis on biopsy (+3)', 'mpa-gn'));
    root.appendChild(checkField('Fibrosis or interstitial lung disease on chest imaging (+3)', 'mpa-ild'));
    root.appendChild(checkField('Nasal involvement — bloody discharge, ulcers, crusting, congestion, blockage, or septal defect/perforation (-3)', 'mpa-nasal'));
    root.appendChild(checkField('Positive cANCA or anti-PR3 antibody (-1)', 'mpa-canca'));
    root.appendChild(checkField('Blood eosinophil count ≥ 1 x10^9/L (-4)', 'mpa-eos'));
    const ids = ['mpa-panca', 'mpa-gn', 'mpa-ild', 'mpa-nasal', 'mpa-canca', 'mpa-eos'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.mpaAcrEular2022({
        pAncaMpo: chk('mpa-panca'), pauciGn: chk('mpa-gn'), fibrosisIld: chk('mpa-ild'),
        nasal: chk('mpa-nasal'), cAncaPr3: chk('mpa-canca'), eosinophilia: chk('mpa-eos'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/12` },
        { label: 'Result', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
