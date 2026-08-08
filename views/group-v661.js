// spec-v661 §2: renderer for ips-hodgkin — the International Prognostic Score for
// advanced Hodgkin lymphoma (Clinical Scoring & Risk, Group G). Companion to flipi/ipi.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Five numeric
// labs/age plus an optional lymphocyte percentage, and two checkboxes (male, stage IV);
// seven adverse factors sum to 0-7.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ips-hodgkin-v661.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal' }));
  return wrap;
}
function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The IPS estimates prognosis in advanced-stage Hodgkin lymphoma from the seven adverse factors you entered; it supports the treatment discussion and is read with the full clinical picture by the treating team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'ips-hodgkin'(root) {
    note(root, 'International Prognostic Score for advanced Hodgkin lymphoma (Hasenclever & Diehl 1998): 7 adverse factors, each 1 point (albumin < 4 g/dL, Hgb < 10.5 g/dL, male, age >= 45, stage IV, WBC >= 15000/mm3, lymphocytopenia < 600/mm3 and/or < 8%). Sum 0-7; higher = worse prognosis. Companion tiles: flipi, r-ipi.');
    root.appendChild(numberField('Serum albumin (g/dL)', 'ips-albumin'));
    root.appendChild(numberField('Hemoglobin (g/dL)', 'ips-hgb'));
    root.appendChild(numberField('Age (years)', 'ips-age'));
    root.appendChild(numberField('White blood cell count (/mm3)', 'ips-wbc'));
    root.appendChild(numberField('Absolute lymphocyte count (/mm3)', 'ips-lymph'));
    root.appendChild(numberField('Lymphocytes as % of WBC (optional)', 'ips-lymphpct'));
    root.appendChild(checkField('Male sex', 'ips-male'));
    root.appendChild(checkField('Ann Arbor stage IV', 'ips-stage4'));
    const ids = ['ips-albumin', 'ips-hgb', 'ips-age', 'ips-wbc', 'ips-lymph', 'ips-lymphpct', 'ips-male', 'ips-stage4'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.ipsHodgkin({
        albumin: val('ips-albumin'), hemoglobin: val('ips-hgb'), age: val('ips-age'), wbc: val('ips-wbc'),
        lymphocyteCount: val('ips-lymph'), lymphocytePct: val('ips-lymphpct'),
        male: chk('ips-male'), stageIV: chk('ips-stage4'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.total}/7` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
