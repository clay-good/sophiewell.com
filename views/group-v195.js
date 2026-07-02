// spec-v195 §2: renderers for the four gas-exchange / ventilation-efficiency
// tiles — the SpO2/FiO2 (S/F) ratio, the ventilatory ratio, the oxygen
// saturation index (OSI), and the ventilation index (VI). Group E.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The
// zero-denominator edges are guarded in lib/vent-v195.js. Per the spec-v50 §3
// posture note each tile defers the ventilator-setting / escalation decision to
// the clinician and respiratory therapist (spec-v11 §5.3) — these grade, they do
// not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/vent-v195.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
  return wrap;
}
function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function pickField(label, id, options) {
  return selectField(label, id, [{ value: '', text: '— choose —' }, ...options]);
}
function num(label, id) {
  return field(label, id, { type: 'number', min: '0', step: 'any', inputmode: 'decimal' });
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The value is the cited source’s formula, computed from the inputs you enter. The FiO₂ / PEEP / mode and escalation decisions stay with the clinician and respiratory therapist.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  // ----- 2.1 sf-ratio --------------------------------------------------------
  'sf-ratio'(root) {
    note(root, 'SpO₂/FiO₂ (S/F) ratio with Rice-regression P/F estimate (Rice 2007): S/F = SpO₂ ÷ FiO₂; est P/F ≈ (S/F − 64) / 0.84. Reliable only when SpO₂ ≤ 97%. Near-neighbors: pf-ratio, oxygenation-index, aa-pf-suite.');
    root.appendChild(num('SpO₂ (%)', 'sf-spo2'));
    root.appendChild(num('FiO₂ (fraction, 0.21–1.0)', 'sf-fio2'));
    const o = out(); root.appendChild(o);
    wire(['sf-spo2', 'sf-fio2'], () => safe(o, () => {
      const r = M.sfRatio({ spo2: val('sf-spo2'), fio2: val('sf-fio2') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'S/F', value: `${r.sf}` }, { label: 'est P/F', value: `${r.pf}` }]);
      note(o, r.detail); note(o, r.caveat); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 ventilatory-ratio -----------------------------------------------
  'ventilatory-ratio'(root) {
    note(root, 'Ventilatory ratio (Sinha 2009): VR = (measured minute ventilation × measured PaCO₂) / (PBW × 100 × 37.5). Normal ≈ 1; rising VR (> 2) tracks ARDS mortality. Near-neighbors: dead-space, minute-ventilation, driving-pressure.');
    root.appendChild(num('Measured minute ventilation (mL/min)', 'vr-ve'));
    root.appendChild(num('Measured PaCO₂ (mmHg)', 'vr-paco2'));
    root.appendChild(num('Height (cm)', 'vr-height'));
    root.appendChild(pickField('Sex (for predicted body weight)', 'vr-sex', [{ value: 'female', text: 'Female' }, { value: 'male', text: 'Male' }]));
    const o = out(); root.appendChild(o);
    wire(['vr-ve', 'vr-paco2', 'vr-height', 'vr-sex'], () => safe(o, () => {
      const r = M.ventilatoryRatio({ ve: val('vr-ve'), paco2: val('vr-paco2'), height: val('vr-height'), sex: val('vr-sex') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'VR', value: `${r.vr}` }, { label: 'PBW', value: `${r.pbw} kg` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 osi-oxygenation -------------------------------------------------
  'osi-oxygenation'(root) {
    note(root, 'Oxygen saturation index (PALICC 2015): OSI = (FiO₂ × mean airway pressure × 100) / SpO₂. PARDS: mild 5–<7.5, moderate 7.5–<12.3, severe ≥ 12.3. Reliable only when SpO₂ ≤ 97%. Near-neighbors: oxygenation-index, mean-airway-pressure, sf-ratio.');
    root.appendChild(num('FiO₂ (fraction, 0.21–1.0)', 'osi-fio2'));
    root.appendChild(num('Mean airway pressure (cmH₂O)', 'osi-map'));
    root.appendChild(num('SpO₂ (%)', 'osi-spo2'));
    const o = out(); root.appendChild(o);
    wire(['osi-fio2', 'osi-map', 'osi-spo2'], () => safe(o, () => {
      const r = M.osi({ fio2: val('osi-fio2'), map: val('osi-map'), spo2: val('osi-spo2') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'OSI', value: `${r.value}` }]);
      note(o, r.detail); note(o, r.caveat); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 ventilation-index -----------------------------------------------
  'ventilation-index'(root) {
    note(root, 'Ventilation index (Paret 1998): VI = (respiratory rate × peak inspiratory pressure × PaCO₂) / 1000. Higher = worse; a PEEP-corrected variant uses (PIP − PEEP). Near-neighbors: mean-airway-pressure, dead-space, ventilatory-ratio.');
    root.appendChild(num('Respiratory rate (breaths/min)', 'vi-rr'));
    root.appendChild(num('Peak inspiratory pressure (cmH₂O)', 'vi-pip'));
    root.appendChild(num('PaCO₂ (mmHg)', 'vi-paco2'));
    const o = out(); root.appendChild(o);
    wire(['vi-rr', 'vi-pip', 'vi-paco2'], () => safe(o, () => {
      const r = M.ventilationIndex({ rr: val('vi-rr'), pip: val('vi-pip'), paco2: val('vi-paco2') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'VI', value: `${r.value}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
