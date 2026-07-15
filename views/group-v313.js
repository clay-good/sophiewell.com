// spec-v313: renderer for the acute cholecystitis diagnosis (Tokyo Guidelines
// TG18/TG13 diagnostic criteria) — the diagnostic companion to the spec-v311
// severity grade, and the fourth tile of the TG18 biliary quartet. Group G. The
// clinician checks the category A/B/C items they have determined; the tile reports
// whether the presentation is a definite or suspected acute cholecystitis, or does
// not meet the criteria.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the diagnostic category; it never asserts a
// diagnosis or an order (lib/cholecystitis-dx-v313.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cholecystitis-dx-v313.js';
import { resultRow } from '../lib/result-copy.js';

function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const IDS = ['ccd-murphy', 'ccd-ruq', 'ccd-fever', 'ccd-crp', 'ccd-wbc', 'ccd-imaging'];

export const renderers = {
  'cholecystitis-diagnosis'(root) {
    note(root, 'Acute cholecystitis diagnosis (Tokyo Guidelines TG18/TG13). Check the items you have determined. Suspected: one item in A plus one in B. Definite: one item in A plus one in B plus a characteristic imaging finding (C). Companion: cholecystitis-severity.');

    note(root, 'A — Local signs of inflammation:');
    root.appendChild(check('Murphy’s sign', 'ccd-murphy'));
    root.appendChild(check('Right-upper-quadrant mass, pain, or tenderness', 'ccd-ruq'));

    note(root, 'B — Systemic signs of inflammation:');
    root.appendChild(check('Fever', 'ccd-fever'));
    root.appendChild(check('Elevated CRP', 'ccd-crp'));
    root.appendChild(check('Elevated WBC count', 'ccd-wbc'));

    note(root, 'C — Imaging:');
    root.appendChild(check('Imaging findings characteristic of acute cholecystitis', 'ccd-imaging'));

    const o = out(); root.appendChild(o);
    wire(IDS, () => safe(o, () => {
      const r = M.cholecystitisDiagnosis({
        murphy: chk('ccd-murphy'), ruq: chk('ccd-ruq'),
        fever: chk('ccd-fever'), elevatedCrp: chk('ccd-crp'), elevatedWbc: chk('ccd-wbc'),
        imaging: chk('ccd-imaging'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Diagnosis', value: r.definite ? 'definite' : r.suspected ? 'suspected' : 'not met' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
