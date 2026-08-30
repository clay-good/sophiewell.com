// spec-v908 §2: renderer for hys-law — whether a liver-injury lab set meets Hy's Law
// (Clinical Scoring & Risk, Group G).
//
// The potential-case line is the point of the page: the labs alone never make a case, and the
// result says so whether or not the third criterion is checked.

import { el, clear } from '../lib/dom.js';
import * as H from '../lib/hys-law-v908.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, unit) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: unit ? `${label} (${unit})` : label }));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal' }));
  root.appendChild(wrap);
}
function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return Boolean(n && n.checked); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'hys-law'(root) {
    numField(root, 'ALT', 'hl-alt', 'U/L');
    numField(root, 'ALT upper limit of normal', 'hl-altuln', 'U/L');
    numField(root, 'AST, if higher than the ALT', 'hl-ast', 'U/L');
    numField(root, 'AST upper limit of normal', 'hl-astuln', 'U/L');
    numField(root, 'Total bilirubin', 'hl-bilirubin', 'mg/dL');
    numField(root, 'Total bilirubin upper limit of normal', 'hl-bilirubinuln', 'mg/dL');
    numField(root, 'Alkaline phosphatase', 'hl-alp', 'U/L');
    numField(root, 'Alkaline phosphatase upper limit of normal', 'hl-alpuln', 'U/L');
    checkField(root, 'Other causes ruled out: viral hepatitis A, B, C and E, other pre-existing or acute liver disease, and any other drug capable of the same injury', 'hl-othercausesexcluded');

    const ids = ['hl-alt', 'hl-altuln', 'hl-ast', 'hl-astuln', 'hl-bilirubin', 'hl-bilirubinuln',
      'hl-alp', 'hl-alpuln', 'hl-othercausesexcluded'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = H.hysLaw({
        alt: val('hl-alt'), altUln: val('hl-altuln'),
        ast: val('hl-ast'), astUln: val('hl-astuln'),
        bilirubin: val('hl-bilirubin'), bilirubinUln: val('hl-bilirubinuln'),
        alp: val('hl-alp'), alpUln: val('hl-alpuln'),
        otherCausesExcluded: checked('hl-othercausesexcluded'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      for (const c of r.criteria) note(o, `${c.text}: ${c.met ? 'met' : 'not met'}. ${c.detail}`);
      note(o, r.potentialNote);
      note(o, r.cholestasisNote);
      note(o, r.signalNote);
      note(o, r.timingNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This checks entered numbers against the published thresholds. It does not diagnose, and it does not attribute the injury to any drug.' }));
  },
};
