// spec-v278 §2: renderer for the Phoenix Sepsis Score (2024 international
// consensus). Group G (clinical scoring & risk). It reports a four-organ-system
// organ-dysfunction score and the consensus sepsis / septic-shock thresholds.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note the tile defers diagnosis and treatment to the
// clinician (spec-v11 §5.3): it reports a score and the consensus threshold,
// never a diagnosis or an order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/peds-sepsis-v278.js';
import { resultRow } from '../lib/result-copy.js';

function num(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
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
  'phoenix-sepsis'(root) {
    note(root, 'The 2024 international-consensus organ-dysfunction score that defines pediatric sepsis. Score the worst values in the window; leave a field blank if not measured. In a child with suspected/confirmed infection: total ≥ 2 = sepsis; sepsis + cardiovascular ≥ 1 = septic shock. Near-neighbors: psofa, pelod2, qsofa-sofa, pews.');
    root.appendChild(num('Age (months)', 'phx-age', { min: '0', max: '300' }));

    note(root, 'Respiratory (0–3):');
    root.appendChild(select('Oxygenation ratio type', 'phx-ratiotype', [['pf', 'PaO₂/FiO₂'], ['sf', 'SpO₂/FiO₂ (only if SpO₂ ≤ 97%)']]));
    root.appendChild(num('Oxygenation ratio value', 'phx-ratio', { min: '0' }));
    root.appendChild(select('Respiratory support', 'phx-support', [['none', 'None'], ['support', 'Any respiratory support'], ['imv', 'Invasive mechanical ventilation']]));

    note(root, 'Cardiovascular (0–6):');
    root.appendChild(num('Vasoactive medications (count)', 'phx-vaso', { min: '0', max: '20' }));
    root.appendChild(num('Lactate (mmol/L)', 'phx-lactate', { min: '0' }));
    root.appendChild(num('Mean arterial pressure (mmHg)', 'phx-map', { min: '0' }));

    note(root, 'Coagulation (0–2):');
    root.appendChild(num('Platelets (×10³/µL)', 'phx-plt', { min: '0' }));
    root.appendChild(num('INR', 'phx-inr', { min: '0' }));
    root.appendChild(num('D-dimer (mg/L FEU)', 'phx-ddimer', { min: '0' }));
    root.appendChild(num('Fibrinogen (mg/dL)', 'phx-fib', { min: '0' }));

    note(root, 'Neurologic (0–2):');
    root.appendChild(num('Glasgow Coma Scale (3–15)', 'phx-gcs', { min: '3', max: '15' }));
    root.appendChild(check('Bilaterally fixed pupils', 'phx-pupils'));

    const o = out(); root.appendChild(o);
    wire(['phx-age', 'phx-ratiotype', 'phx-ratio', 'phx-support', 'phx-vaso', 'phx-lactate', 'phx-map', 'phx-plt', 'phx-inr', 'phx-ddimer', 'phx-fib', 'phx-gcs', 'phx-pupils'], () => safe(o, () => {
      const r = M.phoenixSepsis({
        ageMonths: val('phx-age'),
        ratioType: val('phx-ratiotype'),
        ratio: val('phx-ratio'),
        support: val('phx-support'),
        vasoactives: val('phx-vaso'),
        lactate: val('phx-lactate'),
        map: val('phx-map'),
        platelets: val('phx-plt'),
        inr: val('phx-inr'),
        ddimer: val('phx-ddimer'),
        fibrinogen: val('phx-fib'),
        gcs: val('phx-gcs'),
        pupilsFixed: checked('phx-pupils'),
      });
      if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Phoenix', value: `${r.score}/13` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
