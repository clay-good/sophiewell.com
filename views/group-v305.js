// spec-v305: renderer for the ASTCT cytokine release syndrome (CRS) grading.
// Group G (clinical scoring & reference). The clinician marks the fever and picks
// the hypotension and hypoxia levels; the tile reports the ASTCT CRS grade (the
// more severe of the two axes).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the ASTCT grade; it never asserts a treatment
// order (lib/crs-v305.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/crs-v305.js';
import { resultRow } from '../lib/result-copy.js';

function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
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

export const renderers = {
  'crs-grade'(root) {
    note(root, 'Cytokine release syndrome (CRS) grading — the ASTCT consensus (Lee 2019) after immune-effector-cell / CAR-T therapy. Mark the fever and pick the hypotension and hypoxia levels; the grade is the more severe of the two axes. Grades ≥3 are severe. Near-neighbors: vasopressor, mascc.');
    root.appendChild(check('Fever ≥38°C, not otherwise explained', 'crs-fever'));
    root.appendChild(select('Hypotension', 'crs-hypotension', [
      ['none', 'None'],
      ['novaso', 'Present, not requiring vasopressors'],
      ['onevaso', 'Requiring one vasopressor (± vasopressin)'],
      ['multivaso', 'Requiring multiple vasopressors'],
    ]));
    root.appendChild(select('Hypoxia', 'crs-hypoxia', [
      ['none', 'None'],
      ['lowflow', 'Low-flow nasal cannula (≤6 L/min) or blow-by'],
      ['highflow', 'High-flow nasal cannula (>6 L/min) or mask'],
      ['pospressure', 'Positive pressure (CPAP/BiPAP/intubation)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['crs-fever', 'crs-hypotension', 'crs-hypoxia'], () => safe(o, () => {
      const r = M.crsGrade({ fever: chk('crs-fever'), hypotension: val('crs-hypotension'), hypoxia: val('crs-hypoxia') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'ASTCT CRS grade', value: r.meetsCriteria ? `${r.grade} of 4` : 'does not meet criteria' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
