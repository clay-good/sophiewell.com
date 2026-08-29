// spec-v853 §2: renderer for constrictive-pericarditis-echo — the echocardiographic criteria
// for constrictive pericarditis (Clinical Scoring & Risk, Group G).
//
// The lateral annular velocity is offered even though it is not one of the criteria: it is
// what makes the reversed relationship between the two annuli visible, and that reversal is
// the finding a reader is most likely to read backwards.

import { el, clear } from '../lib/dom.js';
import * as C from '../lib/constrictive-pericarditis-echo-v853.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'decimal' }, attrs || {})));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'constrictive-pericarditis-echo'(root) {
    note(root, 'A medial annular velocity that looks normal is the finding here, not a reassuring number. The septal shift is required: neither of the other two counts without it.');

    root.appendChild(el('h2', { text: 'The septum' }));
    root.appendChild(checkField('Ventricular septal shift that moves with respiration', 'cpe-shift'));

    root.appendChild(el('h2', { text: 'The mitral annulus' }));
    numField(root, 'Medial or septal annular early diastolic velocity, criterion at 9 or more (cm/s)', 'cpe-medial', { min: '0', max: '30', step: '0.1' });
    numField(root, 'Lateral annular early diastolic velocity (cm/s)', 'cpe-lateral', { min: '0', max: '30', step: '0.1' });

    root.appendChild(el('h2', { text: 'The hepatic vein' }));
    numField(root, 'Expiratory diastolic reversal ratio, criterion at 0.79 or more', 'cpe-hvr', { min: '0', max: '5', step: '0.01' });
    numField(root, 'Or: expiratory diastolic reversal velocity (cm/s)', 'cpe-hvrev', { min: '0', max: '200', step: '1' });
    numField(root, 'Or: diastolic forward velocity (cm/s)', 'cpe-hvfwd', { min: '0', max: '200', step: '1' });

    const ids = ['cpe-shift', 'cpe-medial', 'cpe-lateral', 'cpe-hvr', 'cpe-hvrev', 'cpe-hvfwd'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = C.constrictivePericarditisEcho({
        septalShift: checked('cpe-shift'),
        medialE: val('cpe-medial'),
        lateralE: val('cpe-lateral'),
        hepaticVeinRatio: val('cpe-hvr'),
        hepaticVeinReversalVelocity: val('cpe-hvrev'),
        hepaticVeinForwardVelocity: val('cpe-hvfwd'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.performance);
      if (r.derivedNote) note(o, r.derivedNote);
      if (r.annulusReversusNote) note(o, r.annulusReversusNote);
      if (r.reversedPairNote) note(o, r.reversedPairNote);
      if (r.paradoxusNote) note(o, r.paradoxusNote);
      if (r.missingNote) note(o, r.missingNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published criteria to measurements already taken. It does not stage the disease, it does not select an operation, and the reading of the study stays with the echocardiographer.' }));
  },
};
