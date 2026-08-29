// spec-v826 §2: renderer for ph-hemodynamics-2022 — the 2022 ESC/ERS haemodynamic
// definitions of pulmonary hypertension (Clinical Scoring & Risk, Group G).
//
// Cardiac output is offered alongside a directly entered resistance because the resistance
// is derivable: PVR in Wood units is (mPAP - PAWP) / cardiac output. An entered value wins,
// since a measured one may come from a different cardiac-output method than the one to hand.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ph-hemodynamics-2022-v826.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'decimal' }, attrs || {})));
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
  'ph-hemodynamics-2022'(root) {
    note(root, 'These are the 2022 thresholds. Both moved down from 2015: mean pressure from 25 or more to above 20, and the resistance cut from above 3 Wood units to above 2.');

    numField(root, 'Mean pulmonary arterial pressure, mmHg', 'phh-mpap', { min: '0', max: '200', step: '1' });
    numField(root, 'Pulmonary arterial wedge pressure, mmHg', 'phh-pawp', { min: '0', max: '100', step: '1' });
    numField(root, 'Cardiac output, L per min (used to compute resistance)', 'phh-co', { min: '0.1', max: '30', step: '0.1' });
    numField(root, 'Pulmonary vascular resistance in Wood units, if measured directly', 'phh-pvr', { min: '0', max: '100', step: '0.1' });

    const ids = ['phh-mpap', 'phh-pawp', 'phh-co', 'phh-pvr'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.phHemodynamics2022({
        mpap: val('phh-mpap'),
        pawp: val('phh-pawp'),
        cardiacOutput: val('phh-co'),
        pvr: val('phh-pvr'),
      });
      if (!r.valid) { note(o, r.message); return; }
      const rows = [{ text: r.band, cls: r.abnormal ? 'warn' : null }];
      if (r.pvr !== null) rows.push({ label: `Resistance (${r.pvrSource})`, value: `${r.pvr} Wood units` });
      resultRow(o, rows);
      for (const n of r.versionNotes) note(o, n);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This classifies numbers from a right heart catheterization already performed. It does not start pulmonary vasodilators or decide who should be catheterized.' }));
  },
};
