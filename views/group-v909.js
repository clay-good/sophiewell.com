// spec-v909 §2: renderer for udca-response — the threshold definitions of biochemical response
// to ursodeoxycholic acid in primary biliary cholangitis (Clinical Scoring & Risk, Group G).
//
// All four sets are reported side by side, each with the time point it is read at. Where they
// part, none of them is offered as the answer.

import { el, clear } from '../lib/dom.js';
import * as U from '../lib/udca-response-v909.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, unit) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: unit ? `${label} (${unit})` : label }));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal' }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'udca-response'(root) {
    numField(root, 'Months on ursodeoxycholic acid', 'ur-months');
    numField(root, 'Alkaline phosphatase now', 'ur-alp', 'U/L');
    numField(root, 'Alkaline phosphatase upper limit of normal', 'ur-alpuln', 'U/L');
    numField(root, 'Alkaline phosphatase before treatment', 'ur-baselinealp', 'U/L');
    numField(root, 'AST', 'ur-ast', 'U/L');
    numField(root, 'AST upper limit of normal', 'ur-astuln', 'U/L');
    numField(root, 'Total bilirubin', 'ur-bilirubin', 'mg/dL');

    const ids = ['ur-months', 'ur-alp', 'ur-alpuln', 'ur-baselinealp', 'ur-ast', 'ur-astuln', 'ur-bilirubin'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = U.udcaResponse({
        monthsOnUdca: val('ur-months'),
        alp: val('ur-alp'), alpUln: val('ur-alpuln'), baselineAlp: val('ur-baselinealp'),
        ast: val('ur-ast'), astUln: val('ur-astuln'), bilirubin: val('ur-bilirubin'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      for (const s of r.sets) {
        const state = s.met === null ? 'not assessable' : s.met ? 'response' : 'not a response';
        note(o, `${s.name}: ${state}. ${s.why} ${s.timeNote}`);
      }
      note(o, r.disagreeNote);
      note(o, r.timingNote);
      note(o, r.purposeNote);
      note(o, r.continuousNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This checks entered numbers against published thresholds. It does not diagnose, and it does not choose therapy.' }));
  },
};
