// spec-v847 §2: renderer for mitral-regurgitation-stage — the ACC/AHA chronic PRIMARY mitral
// regurgitation stages (Clinical Scoring & Risk, Group G).
//
// The ejection-fraction field is labelled with its threshold because the threshold is the
// whole point: 60 percent is dysfunction in this disease, and a reader carrying the usual
// 50 percent line into it will call the wrong patients compensated.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/mitral-regurgitation-stage-v847.js';
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
  'mitral-regurgitation-stage'(root) {
    note(root, 'For primary regurgitation, a problem of the valve itself. An ejection fraction of 60 percent is already dysfunction in this disease, not a reassuring number.');

    root.appendChild(el('h2', { text: 'Severity of the leak' }));
    numField(root, 'Vena contracta width (cm)', 'mrs-vc', { min: '0', max: '3', step: '0.01' });
    numField(root, 'Regurgitant volume (mL per beat)', 'mrs-rvol', { min: '0', max: '300', step: '1' });
    numField(root, 'Regurgitant fraction (percent)', 'mrs-rf', { min: '0', max: '100', step: '1' });
    numField(root, 'Effective regurgitant orifice area (square cm)', 'mrs-ero', { min: '0', max: '3', step: '0.01' });

    root.appendChild(el('h2', { text: 'The ventricle' }));
    numField(root, 'Left ventricular ejection fraction (percent)', 'mrs-lvef', { min: '5', max: '85', step: '1' });
    numField(root, 'Left ventricular end-systolic dimension (mm)', 'mrs-lvesd', { min: '10', max: '100', step: '1' });

    root.appendChild(el('h2', { text: 'Valve and symptoms' }));
    root.appendChild(checkField('At-risk valve: mild prolapse with normal coaptation, mild leaflet thickening, or previous infective endocarditis', 'mrs-risk'));
    root.appendChild(checkField('Symptoms attributable to the regurgitation', 'mrs-sx'));

    const ids = ['mrs-vc', 'mrs-rvol', 'mrs-rf', 'mrs-ero', 'mrs-lvef', 'mrs-lvesd', 'mrs-risk', 'mrs-sx'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.mitralRegurgitationStage({
        venaContracta: val('mrs-vc'),
        regurgitantVolume: val('mrs-rvol'),
        regurgitantFraction: val('mrs-rf'),
        regurgitantOrifice: val('mrs-ero'),
        ejectionFraction: val('mrs-lvef'),
        endSystolicDimension: val('mrs-lvesd'),
        atRiskValve: checked('mrs-risk'),
        symptoms: checked('mrs-sx'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.flatteredEfNote) note(o, r.flatteredEfNote);
      if (r.dimensionOnlyNote) note(o, r.dimensionOnlyNote);
      if (r.ventricleNote) note(o, r.ventricleNote);
      if (r.pending) note(o, r.pending);
      if (r.disagreeNote) note(o, r.disagreeNote);
      note(o, r.primaryOnlyNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a published staging to measurements already taken. It does not select or adjust therapy, and the severity adjudication stays with the echocardiographer and the heart team.' }));
  },
};
