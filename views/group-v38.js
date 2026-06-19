// spec-v113 §2: renderers for the three dynamic fluid-responsiveness indices
// (ivc-fluid-responsiveness, ppv-svv, passive-leg-raise). All three home in
// Clinical Math & Conversions (Group E), beside the static hemodynamic-suite /
// shock-index tiles.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 applicability/technique posture note, each tile renders that it
// reports the index, not the fluid order; none authors a resuscitation decision
// in Sophie's voice (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/fluidresp-v113.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || '1');
  inp.setAttribute('inputmode', opts.step && opts.step !== '1' ? 'decimal' : 'numeric');
  if (opts.min != null) inp.setAttribute('min', String(opts.min));
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The index is the cited instrument’s, computed from the values you entered; it reports the percentage and the source’s responsiveness threshold. The give-fluid, withhold, or start-pressor decision stays with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

export const renderers = {
  // ----- 2.1 ivc-fluid-responsiveness -----------------------------------
  'ivc-fluid-responsiveness'(root) {
    note(root, 'IVC collapsibility / distensibility index: measure the maximum and minimum IVC diameter across the respiratory cycle. Spontaneous breathing uses the collapsibility (caval) index; mechanical ventilation uses the distensibility index (cited ~18% threshold).');
    root.appendChild(selectField('Ventilation mode', 'iv-mode', [
      { value: 'spontaneous', text: 'Spontaneous breathing (collapsibility index)' },
      { value: 'mechanical', text: 'Mechanical ventilation (distensibility index)' },
    ]));
    root.appendChild(field('Maximum IVC diameter (cm)', 'iv-dmax', { step: '0.1', min: 0, placeholder: 'e.g. 2.0' }));
    root.appendChild(field('Minimum IVC diameter (cm)', 'iv-dmin', { step: '0.1', min: 0, placeholder: 'e.g. 1.6' }));
    const o = out(); root.appendChild(o);
    wire(['iv-mode', 'iv-dmax', 'iv-dmin'], () => safe(o, () => {
      const r = M.ivcFluidResponsiveness({ mode: selVal('iv-mode'), dmax: optNum('iv-dmax'), dmin: optNum('iv-dmin') });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Index', value: `${r.index}%` },
        { label: 'Mode', value: r.mode },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 ppv-svv ----------------------------------------------------
  'ppv-svv'(root) {
    note(root, 'Pulse-pressure / stroke-volume variation: enter the maximum and minimum value over a respiratory cycle. Variation = (max - min) / ([max + min] / 2) x 100. PPV > ~13% (SVV > ~12%) suggests fluid responsiveness in a regular-rhythm, passively ventilated patient.');
    root.appendChild(selectField('Index', 'pv-mode', [
      { value: 'ppv', text: 'Pulse-pressure variation (PPV, mmHg)' },
      { value: 'svv', text: 'Stroke-volume variation (SVV, mL)' },
    ]));
    root.appendChild(field('Maximum over the respiratory cycle', 'pv-max', { step: '0.1', min: 0, placeholder: 'e.g. 50' }));
    root.appendChild(field('Minimum over the respiratory cycle', 'pv-min', { step: '0.1', min: 0, placeholder: 'e.g. 40' }));
    const o = out(); root.appendChild(o);
    wire(['pv-mode', 'pv-max', 'pv-min'], () => safe(o, () => {
      const r = M.ppvSvv({ mode: selVal('pv-mode'), max: optNum('pv-max'), min: optNum('pv-min') });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Variation', value: `${r.variation}%` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 passive-leg-raise ------------------------------------------
  'passive-leg-raise'(root) {
    note(root, 'Passive leg raise stroke-volume response: %dSV = (peak - baseline) / baseline x 100. From a semi-recumbent start, tilt the trunk down and legs up and measure the real-time stroke-volume surrogate within ~1 min. A rise of >= 10-15% predicts fluid responsiveness regardless of rhythm or ventilation mode.');
    root.appendChild(field('Baseline stroke volume (or CO / VTI surrogate)', 'plr-base', { step: '0.1', min: 0, placeholder: 'e.g. 60' }));
    root.appendChild(field('Peak value during the passive leg raise', 'plr-peak', { step: '0.1', min: 0, placeholder: 'e.g. 72' }));
    const o = out(); root.appendChild(o);
    wire(['plr-base', 'plr-peak'], () => safe(o, () => {
      const r = M.passiveLegRaise({ baseline: optNum('plr-base'), peak: optNum('plr-peak') });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Change', value: `${r.change >= 0 ? '+' : ''}${r.change}%` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
