// spec-v699 §2: renderer for fab — the Frontal Assessment Battery (Clinical Scoring &
// Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Six 0-3 selects
// (one per subtest); the sum 0-18 maps to a frontal-function band.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/fab-v699.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The FAB is an examiner-administered screen; the < 12 cut-point depends on age and education. It supports rather than replaces formal neuropsychological assessment and clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const SCORE = [{ value: '', text: '— 0-3 —' }, { value: '0', text: '0' }, { value: '1', text: '1' }, { value: '2', text: '2' }, { value: '3', text: '3' }];

export const renderers = {
  'fab'(root) {
    note(root, 'Frontal Assessment Battery (Dubois 2000): six executive-function subtests, each scored 0–3 by the examiner, summed to 0–18 (higher is better). A total < 12 suggests frontal / dysexecutive dysfunction.');
    root.appendChild(selectField('Conceptualization (similarities)', 'fab-concept', SCORE));
    root.appendChild(selectField('Mental flexibility (verbal fluency)', 'fab-flex', SCORE));
    root.appendChild(selectField('Motor programming (Luria fist-edge-palm)', 'fab-motor', SCORE));
    root.appendChild(selectField('Sensitivity to interference (conflicting instructions)', 'fab-interfere', SCORE));
    root.appendChild(selectField('Inhibitory control (go / no-go)', 'fab-inhibit', SCORE));
    root.appendChild(selectField('Environmental autonomy (prehension behavior)', 'fab-autonomy', SCORE));
    const ids = ['fab-concept', 'fab-flex', 'fab-motor', 'fab-interfere', 'fab-inhibit', 'fab-autonomy'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.fab({
        conceptualization: val('fab-concept'), flexibility: val('fab-flex'), motorProgramming: val('fab-motor'),
        interference: val('fab-interfere'), inhibitory: val('fab-inhibit'), autonomy: val('fab-autonomy'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/18` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
