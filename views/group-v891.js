// spec-v891 §2: renderer for pef-zones — the peak expiratory flow zones of a written asthma
// action plan (Clinical Scoring & Risk, Group G).
//
// The personal-best sentence prints on every result, because using a predicted value instead is
// the error that moves every boundary at once.

import { el, clear } from '../lib/dom.js';
import * as P from '../lib/pef-zones-v891.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number' }, attrs || {})));
  root.appendChild(wrap);
}
function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return Boolean(n && n.checked); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'pef-zones'(root) {
    note(root, 'The zones are a fraction of this patient’s own personal best, not of a predicted value. Symptoms override the number.');

    root.appendChild(el('h2', { text: 'The readings' }));
    numField(root, 'Current peak flow, L/min', 'pz-currentpef', { min: '0', max: '900', step: '1' });
    numField(root, 'Personal best peak flow, L/min', 'pz-personalbest', { min: '0', max: '900', step: '1' });
    checkField(root, 'The personal best was established while the patient was well and on treatment', 'pz-bestfromwellperiod');

    const o = out(); root.appendChild(o);
    wire(['pz-currentpef', 'pz-personalbest', 'pz-bestfromwellperiod'], () => safe(o, () => {
      const r = P.pefZones({
        currentPef: val('pz-currentpef'),
        personalBest: val('pz-personalbest'),
        bestFromWellPeriod: checked('pz-bestfromwellperiod'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.staleBestNote) note(o, r.staleBestNote);
      note(o, r.establishNote);
      note(o, r.personalBestNote);
      note(o, r.symptomsNote);
      note(o, r.techniqueNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This computes a percentage against a reference the patient supplies. It does not decide treatment, and it does not replace the written plan.' }));
  },
};
