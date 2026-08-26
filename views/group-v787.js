// spec-v787 §2: renderer for atrial-enlargement — ECG criteria for left and right atrial
// enlargement (Clinical Scoring & Risk, Group G). The atrial companion to lvh-criteria
// and romhilt-estes.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Six optional P
// wave measurements; every criterion is evaluated only from the measurements provided.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/atrial-enlargement-v787.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || '1');
  inp.setAttribute('inputmode', opts.step && opts.step !== '1' ? 'decimal' : 'numeric');
  inp.setAttribute('min', String(opts.min));
  inp.setAttribute('max', String(opts.max));
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. These criteria infer chamber size from the P wave at roughly 50 percent sensitivity. A normal P wave does not rule enlargement out, and an echocardiogram measures the chamber this only infers.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'atrial-enlargement'(root) {
    note(root, 'Enter whichever P wave measurements you have. Left atrial criteria are met by any one of a P lasting 120 ms or more in lead II, a notched limb-lead P with peaks 40 ms or more apart, or a V1 terminal negative deflection at least 40 ms long and at least 1 mm deep. Right atrial criteria are met by a P taller than 2.5 mm in lead II or taller than 1.5 mm in V1.');
    root.appendChild(el('h2', { text: 'Left atrial criteria' }));
    root.appendChild(numberField('P wave duration in lead II (ms)', 'ae-pdur', { min: 0, max: 400, placeholder: 'e.g. 130' }));
    root.appendChild(numberField('Notched P: inter-peak duration in a limb lead (ms)', 'ae-notch', { min: 0, max: 400, placeholder: 'e.g. 45' }));
    root.appendChild(numberField('P terminal force in V1: duration of the negative deflection (ms)', 'ae-ptfdur', { min: 0, max: 400, placeholder: 'e.g. 60' }));
    root.appendChild(numberField('P terminal force in V1: depth of the negative deflection (mm)', 'ae-ptfdepth', { min: 0, max: 20, step: '0.1', placeholder: 'e.g. 1.5' }));
    root.appendChild(el('h2', { text: 'Right atrial criteria' }));
    root.appendChild(numberField('P wave amplitude in lead II (mm)', 'ae-ampii', { min: 0, max: 20, step: '0.1', placeholder: 'e.g. 3' }));
    root.appendChild(numberField('P wave amplitude in V1 (mm)', 'ae-ampv1', { min: 0, max: 20, step: '0.1', placeholder: 'e.g. 2' }));
    const ids = ['ae-pdur', 'ae-notch', 'ae-ptfdur', 'ae-ptfdepth', 'ae-ampii', 'ae-ampv1'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.atrialEnlargement({
        pDurationII: val('ae-pdur'),
        notchInterpeak: val('ae-notch'),
        ptfDuration: val('ae-ptfdur'),
        ptfDepth: val('ae-ptfdepth'),
        pAmplitudeII: val('ae-ampii'),
        pAmplitudeV1: val('ae-ampv1'),
      });
      if (!r.valid) { note(o, r.message); return; }
      const rows = [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Left atrial', value: r.leftMet ? 'criteria met' : 'not met' },
        { label: 'Right atrial', value: r.rightMet ? 'criteria met' : 'not met' },
      ];
      if (r.morrisIndex !== null) rows.push({ label: 'Morris index', value: `${r.morrisIndex.toFixed(3)} mm.s` });
      resultRow(o, rows);
      if (r.leftCriteria.length) note(o, `Left criteria met: ${r.leftCriteria.join('; ')}.`);
      if (r.rightCriteria.length) note(o, `Right criteria met: ${r.rightCriteria.join('; ')}.`);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
