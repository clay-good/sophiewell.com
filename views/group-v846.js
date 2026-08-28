// spec-v846 §2: renderer for aortic-regurgitation-stage — the ACC/AHA chronic aortic
// regurgitation stages (Clinical Scoring & Risk, Group G).
//
// The ventricle has its own section because stage C splits on it and not on the valve. Two
// patients with identical regurgitation land in C1 and C2 on these three numbers alone.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/aortic-regurgitation-stage-v846.js';
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
  'aortic-regurgitation-stage'(root) {
    note(root, 'Stage C splits on the ventricle, not the valve. The same regurgitation is C1 or C2 depending on the ejection fraction and the end-systolic diameter.');

    root.appendChild(el('h2', { text: 'Severity of the leak' }));
    numField(root, 'Vena contracta width (cm)', 'ars-vc', { min: '0', max: '3', step: '0.01' });
    numField(root, 'Regurgitant volume (mL per beat)', 'ars-rvol', { min: '0', max: '300', step: '1' });
    numField(root, 'Regurgitant fraction (percent)', 'ars-rf', { min: '0', max: '100', step: '1' });
    numField(root, 'Effective regurgitant orifice area (square cm)', 'ars-ero', { min: '0', max: '3', step: '0.01' });
    root.appendChild(checkField('Holodiastolic flow reversal in the proximal descending aorta', 'ars-rev'));

    root.appendChild(el('h2', { text: 'The ventricle' }));
    numField(root, 'Left ventricular ejection fraction (percent)', 'ars-lvef', { min: '5', max: '85', step: '1' });
    numField(root, 'Left ventricular end-systolic diameter (mm)', 'ars-lvesd', { min: '10', max: '100', step: '1' });
    numField(root, 'Indexed end-systolic diameter (mm per square meter)', 'ars-lvesdi', { min: '0', max: '60', step: '0.1' });

    root.appendChild(el('h2', { text: 'Valve and symptoms' }));
    root.appendChild(checkField('At-risk valve: bicuspid or congenitally abnormal, dilated aortic sinuses or root, rheumatic change, or previous infective endocarditis', 'ars-risk'));
    root.appendChild(checkField('Symptoms attributable to the regurgitation', 'ars-sx'));

    const ids = ['ars-vc', 'ars-rvol', 'ars-rf', 'ars-ero', 'ars-rev',
      'ars-lvef', 'ars-lvesd', 'ars-lvesdi', 'ars-risk', 'ars-sx'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.aorticRegurgitationStage({
        venaContracta: val('ars-vc'),
        regurgitantVolume: val('ars-rvol'),
        regurgitantFraction: val('ars-rf'),
        regurgitantOrifice: val('ars-ero'),
        holodiastolicReversal: checked('ars-rev'),
        ejectionFraction: val('ars-lvef'),
        endSystolicDiameter: val('ars-lvesd'),
        indexedEndSystolicDiameter: val('ars-lvesdi'),
        atRiskValve: checked('ars-risk'),
        symptoms: checked('ars-sx'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.ventricleNote) note(o, r.ventricleNote);
      if (r.indexedOnlyNote) note(o, r.indexedOnlyNote);
      if (r.indexedMissingNote) note(o, r.indexedMissingNote);
      if (r.pending) note(o, r.pending);
      if (r.disagreeNote) note(o, r.disagreeNote);
      if (r.reversalNote) note(o, r.reversalNote);
      if (r.noReversalNote) note(o, r.noReversalNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a published staging to measurements already taken. It does not select or adjust therapy, and the severity adjudication stays with the echocardiographer and the heart team.' }));
  },
};
