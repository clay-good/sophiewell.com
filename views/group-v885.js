// spec-v885 §2: renderer for niosh-lifting — the revised NIOSH lifting equation (Clinical
// Scoring & Risk, Group G).
//
// The design-number sentence prints on every result, because a lifting index reads like a
// personal risk score and is not one.

import { el, clear } from '../lib/dom.js';
import * as N from '../lib/niosh-lifting-v885.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number' }, attrs || {})));
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
  'niosh-lifting'(root) {
    note(root, 'For a two-handed, smooth, unhurried lift. Carrying, pushing, pulling and one-handed lifts are outside this equation.');

    root.appendChild(el('h2', { text: 'The load' }));
    numField(root, 'Load weight, lb', 'nl-loadweightlb', { min: '0', max: '500', step: '0.1' });

    root.appendChild(el('h2', { text: 'The lift' }));
    numField(root, 'Horizontal distance, ankles to hands, inches', 'nl-horizontalinches', { min: '0', max: '100', step: '0.1' });
    numField(root, 'Vertical height of the hands at the start, inches', 'nl-verticalinches', { min: '0', max: '100', step: '0.1' });
    numField(root, 'Vertical travel distance, inches', 'nl-travelinches', { min: '0', max: '100', step: '0.1' });
    numField(root, 'Asymmetry angle of the trunk, degrees', 'nl-asymmetrydegrees', { min: '0', max: '180', step: '1' });

    root.appendChild(el('h2', { text: 'Frequency and grip' }));
    numField(root, 'Lifts per minute', 'nl-liftsperminute', { min: '0', max: '20', step: '0.1' });
    // Written out rather than mapped from the lib constants: scripts/lib/option-labels.mjs reads
    // option text out of this file statically, and a mapped list is not readable.
    selectField(root, 'How long the lifting continues', 'nl-duration', [
      { value: 'short', text: 'One hour or less' },
      { value: 'moderate', text: 'More than one hour, up to two' },
      { value: 'long', text: 'More than two hours, up to eight' },
    ]);
    selectField(root, 'Hand-to-object coupling', 'nl-coupling', [
      { value: 'good', text: 'Good: a handle, or a comfortable full-hand grip' },
      { value: 'fair', text: 'Fair: a poor handle, or a grip requiring a flexed wrist' },
      { value: 'poor', text: 'Poor: no handle, an irregular or unstable load' },
    ]);

    const ids = ['nl-loadweightlb', 'nl-horizontalinches', 'nl-verticalinches', 'nl-travelinches',
      'nl-asymmetrydegrees', 'nl-liftsperminute', 'nl-duration', 'nl-coupling'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = N.nioshLifting({
        loadWeightLb: val('nl-loadweightlb'),
        horizontalInches: val('nl-horizontalinches'),
        verticalInches: val('nl-verticalinches'),
        travelInches: val('nl-travelinches'),
        asymmetryDegrees: val('nl-asymmetrydegrees'),
        liftsPerMinute: val('nl-liftsperminute'),
        duration: val('nl-duration'),
        coupling: val('nl-coupling'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.multiplierNote);
      if (r.domainNote) note(o, r.domainNote);
      note(o, r.designNumberNote);
      note(o, r.scopeOfEquationNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This computes a published equation from measurements already taken. It does not decide whether a task is safe for a particular person.' }));
  },
};
