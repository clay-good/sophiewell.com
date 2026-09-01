// spec-v958 §2: renderer for vexus (Clinical Scoring & Risk, Group G).
//
// The mild line prints whenever a mild waveform was entered, because the grade deliberately
// ignores mild findings and a reader who does not know that will think the tool lost them.
//
// The selects are written as `'vx-hepatic', V.DOPPLER_OPTIONS` so that
// scripts/lib/option-labels.mjs, which reads views statically, resolves the option text.

import { el, clear } from '../lib/dom.js';
import * as V from '../lib/vexus-v958.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal' }));
  root.appendChild(wrap);
}
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
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
  vexus(root) {
    numField(root, 'Maximal IVC diameter (cm)', 'vx-ivc');
    selectField(root, 'Hepatic vein Doppler', 'vx-hepatic', V.DOPPLER_OPTIONS);
    selectField(root, 'Portal vein Doppler', 'vx-portal', V.DOPPLER_OPTIONS);
    selectField(root, 'Intrarenal vein Doppler', 'vx-renal', V.DOPPLER_OPTIONS);

    const ids = ['vx-ivc', 'vx-hepatic', 'vx-portal', 'vx-renal'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = V.vexusGrade({
        ivcDiameterCm: val('vx-ivc'),
        hepaticVein: val('vx-hepatic'),
        portalVein: val('vx-portal'),
        intrarenalVein: val('vx-renal'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.ivcNote);
      note(o, r.severeNote);
      note(o, r.mildNote);
      note(o, r.stoppedNote);
      note(o, r.scopeNote);
      note(o, r.confounderNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This grades three waveforms a sonographer has already classified. It does not read images, and a low grade is not evidence against congestion.' }));
  },
};
