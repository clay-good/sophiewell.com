// spec-v312: renderer for the acute cholangitis diagnosis (Tokyo Guidelines
// TG18/TG13 diagnostic criteria) — the diagnostic companion to the spec-v310
// severity grade. Group G. The clinician checks the category A/B/C items they have
// determined; the tile reports whether the presentation is a definite or suspected
// acute cholangitis, or does not meet the criteria.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the diagnostic category; it never asserts a
// diagnosis or an order (lib/cholangitis-dx-v312.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cholangitis-dx-v312.js';
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

const IDS = ['cgd-fever', 'cgd-inflammation', 'cgd-jaundice', 'cgd-lfts', 'cgd-dilatation', 'cgd-etiology'];

export const renderers = {
  'cholangitis-diagnosis'(root) {
    note(root, 'Acute cholangitis diagnosis (Tokyo Guidelines TG18/TG13). Check the items you have determined. Suspected: one item in A plus one in B or C. Definite: one item in each of A, B, and C. Companion: cholangitis-severity.');

    note(root, 'A — Systemic inflammation:');
    root.appendChild(check('A-1 Fever and/or shaking chills (BT >38 °C)', 'cgd-fever'));
    root.appendChild(check('A-2 Lab evidence of inflammatory response (WBC <4 or >10 ×10³/µL, or CRP ≥1 mg/dL)', 'cgd-inflammation'));

    note(root, 'B — Cholestasis:');
    root.appendChild(check('B-1 Jaundice (total bilirubin ≥2 mg/dL)', 'cgd-jaundice'));
    root.appendChild(check('B-2 Abnormal liver function tests (ALP, GGT, AST, or ALT >1.5× upper limit of normal)', 'cgd-lfts'));

    note(root, 'C — Imaging:');
    root.appendChild(check('C-1 Biliary dilatation', 'cgd-dilatation'));
    root.appendChild(check('C-2 Evidence of the etiology on imaging (stricture, stone, stent, etc.)', 'cgd-etiology'));

    const o = out(); root.appendChild(o);
    wire(IDS, () => safe(o, () => {
      const r = M.cholangitisDiagnosis({
        fever: chk('cgd-fever'), inflammation: chk('cgd-inflammation'),
        jaundice: chk('cgd-jaundice'), abnormalLfts: chk('cgd-lfts'),
        biliaryDilatation: chk('cgd-dilatation'), etiologyImaging: chk('cgd-etiology'),
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
