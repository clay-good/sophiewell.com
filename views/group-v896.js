// spec-v896 §2: renderer for last-lipid — lipid emulsion rescue for local anesthetic systemic
// toxicity (Clinical Scoring & Risk, Group G).
//
// The stop-injecting line prints first, above the arithmetic, because it is the first step and
// this page is not where it should be learned.

import { el, clear } from '../lib/dom.js';
import * as L from '../lib/last-lipid-v896.js';
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
  'last-lipid'(root) {
    note(root, 'Stop injecting the local anesthetic, call for help, get the rescue kit. Lipid goes early, not at cardiac arrest.');

    root.appendChild(el('h2', { text: 'The patient' }));
    numField(root, 'Weight, kg', 'last-weightkg', { min: '0', max: '300', step: '0.1' });
    checkField(root, 'In cardiac arrest', 'last-cardiacarrest');

    const o = out(); root.appendChild(o);
    wire(['last-weightkg', 'last-cardiacarrest'], () => safe(o, () => {
      const r = L.lastLipid({
        weightKg: val('last-weightkg'),
        cardiacArrest: checked('last-cardiacarrest'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: 'warn' }]);
      note(o, r.persistentNote);
      note(o, r.epinephrineNote);
      note(o, r.avoidNote);
      note(o, r.earlyNote);
      note(o, r.stopNote);
      note(o, r.monitorNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This computes volumes from a weight against a published checklist. It does not prescribe, and it does not replace the checklist at the bedside or the help that should already have been called.' }));
  },
};
