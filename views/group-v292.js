// spec-v292 §2: renderer for the restrictive transfusion threshold decision aid
// (AABB 2023). Group G (clinical scoring & risk). It reports the population's
// AABB restrictive hemoglobin threshold and whether the entered value sits below
// it — the routine bedside question the massive-transfusion scores do not answer.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports a guideline threshold comparison and defers the
// transfusion decision to the clinician — it never emits an order, and for the
// no-recommendation population (acute coronary syndrome) it says so rather than
// fabricating a number (lib/transfusion-v292.js, Design D2).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/transfusion-v292.js';
import { resultRow } from '../lib/result-copy.js';
import { unitField, unitNumOpt, HEMOGLOBIN_UNITS } from '../lib/field-units.js';

function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const [value, text] of options) sel.appendChild(el('option', { value, text }));
  wrap.appendChild(sel);
  return wrap;
}
function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ` ${label}` }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return n ? n.checked : false; }
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
  'transfusion-threshold'(root) {
    note(root, 'AABB 2023 restrictive transfusion thresholds. Enter the hemoglobin and pick the population to see whether the value is below the threshold at which transfusion is reasonable, or within the restrictive range where you should not transfuse on the number alone. Acute coronary syndrome has no AABB numeric recommendation — the tile says so. Near-neighbors: massive-transfusion, peds-transfusion-volume, anemia workups.');
    root.appendChild(unitField('Hemoglobin', 'tt-hb', HEMOGLOBIN_UNITS, { placeholder: 'e.g. 6.8' }));
    root.appendChild(select('Patient population', 'tt-pop', [
      ['stable-adult', 'Stable hospitalized adult (incl. critically ill)'],
      ['cardiac-surgery', 'Cardiac surgery'],
      ['orthopedic-surgery', 'Orthopedic surgery'],
      ['cardiovascular-disease', 'Preexisting cardiovascular disease'],
      ['stable-child', 'Stable critically ill child'],
      ['acute-coronary-syndrome', 'Acute coronary syndrome'],
    ]));
    root.appendChild(check('Active symptomatic anemia (angina, heart failure, hemodynamic instability)', 'tt-sympt'));

    const o = out(); root.appendChild(o);
    wire(['tt-hb', 'tt-hb-unit', 'tt-pop', 'tt-sympt'], () => safe(o, () => {
      const r = M.transfusionThreshold({
        hemoglobin: unitNumOpt('tt-hb'),
        population: val('tt-pop'),
        symptomatic: checked('tt-sympt'),
      });
      if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
      const rows = [{ text: r.band, cls: r.abnormal ? 'warn' : null }];
      if (r.threshold !== null) rows.push({ label: 'AABB threshold', value: `${r.threshold} g/dL` });
      resultRow(o, rows);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
