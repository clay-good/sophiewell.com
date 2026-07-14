// spec-v306: renderer for the ASTCT ICANS neurotoxicity grading. Group G (clinical
// scoring & reference). The clinician enters the ICE score and picks the
// consciousness / seizure / raised-ICP findings and the motor flag; the tile
// reports the ASTCT ICANS grade (the most severe of the five domains).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the ASTCT grade; it never asserts a treatment
// order (lib/icans-v306.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/icans-v306.js';
import { resultRow } from '../lib/result-copy.js';

function numInput(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: '1', inputmode: 'numeric', ...attrs }));
  return wrap;
}
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
  'icans-grade'(root) {
    note(root, 'ICANS neurotoxicity grading — the ASTCT consensus (Lee 2019) after immune-effector-cell / CAR-T therapy. Enter the ICE score (0–10, scored with the official tool) and the other findings; the grade is the most severe of the five domains. Grades ≥3 are severe. Near-neighbors: crs-grade.');
    root.appendChild(numInput('ICE score (0–10)', 'icans-ice', { min: '0', max: '10' }));
    root.appendChild(select('Level of consciousness', 'icans-loc', [
      ['spontaneous', 'Awakens spontaneously (normal)'],
      ['voice', 'Awakens to voice'],
      ['tactile', 'Awakens only to tactile stimulus'],
      ['unarousable', 'Unarousable / stupor / coma'],
    ]));
    root.appendChild(select('Seizure', 'icans-seizure', [
      ['none', 'None'],
      ['g3', 'Clinical seizure resolving rapidly, or non-convulsive seizure resolving with intervention'],
      ['g4', 'Prolonged (>5 min) or repetitive seizures without return to baseline'],
    ]));
    root.appendChild(select('Raised ICP / cerebral edema', 'icans-icp', [
      ['none', 'None'],
      ['focal', 'Focal / local edema on neuroimaging'],
      ['diffuse', 'Diffuse edema, posturing, CN VI palsy, papilledema, or Cushing triad'],
    ]));
    root.appendChild(check('Deep focal motor weakness (hemiparesis / paraparesis)', 'icans-motor'));

    const o = out(); root.appendChild(o);
    wire(['icans-ice', 'icans-loc', 'icans-seizure', 'icans-icp', 'icans-motor'], () => safe(o, () => {
      const r = M.icansGrade({ ice: val('icans-ice'), loc: val('icans-loc'), seizure: val('icans-seizure'), icp: val('icans-icp'), motor: chk('icans-motor') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'ASTCT ICANS grade', value: r.meetsCriteria ? `${r.grade} of 4` : 'no ICANS' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
