// spec-v845 §2: renderer for mitral-stenosis-stage — the ACC/AHA mitral stenosis stages
// (Clinical Scoring & Risk, Group G).
//
// The mean gradient and the heart rate have their own section, headed so a reader can see
// before entering them that they are recorded rather than used. That is the design: taking
// the number and refusing to stage on it says more than leaving the field out.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/mitral-stenosis-stage-v845.js';
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
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const ANATOMY = [
  { value: '', text: '— not recorded —' },
  { value: 'doming', text: 'Mild doming in diastole, no commissural fusion' },
  { value: 'fusion', text: 'Commissural fusion with diastolic doming' },
];

export const renderers = {
  'mitral-stenosis-stage'(root) {
    note(root, 'The mean gradient does not grade mitral stenosis. It rises with heart rate and with cardiac output, so the same valve reads differently on two days.');

    root.appendChild(el('h2', { text: 'Obstruction' }));
    numField(root, 'Mitral valve area (square cm)', 'mvs-mva', { min: '0', max: '8', step: '0.1' });
    numField(root, 'Diastolic pressure half-time (ms)', 'mvs-pht', { min: '0', max: '800', step: '1' });

    root.appendChild(el('h2', { text: 'Valve anatomy' }));
    root.appendChild(selectField('Rheumatic changes on echocardiography', 'mvs-anat', ANATOMY));

    root.appendChild(el('h2', { text: 'Recorded, but not used to stage' }));
    numField(root, 'Mean mitral gradient (mmHg)', 'mvs-mg', { min: '0', max: '60', step: '1' });
    numField(root, 'Heart rate (beats per minute)', 'mvs-hr', { min: '20', max: '250', step: '1' });

    root.appendChild(el('h2', { text: 'Symptoms' }));
    root.appendChild(checkField('Reduced exercise tolerance or breathlessness on exertion', 'mvs-sx'));

    const ids = ['mvs-mva', 'mvs-pht', 'mvs-anat', 'mvs-mg', 'mvs-hr', 'mvs-sx'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.mitralStenosisStage({
        valveArea: val('mvs-mva'),
        pressureHalfTime: val('mvs-pht'),
        anatomy: val('mvs-anat'),
        meanGradient: val('mvs-mg'),
        heartRate: val('mvs-hr'),
        symptoms: checked('mvs-sx'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.verySevereNote) note(o, r.verySevereNote);
      if (r.pending) note(o, r.pending);
      if (r.disagreeNote) note(o, r.disagreeNote);
      if (r.gradientNote) note(o, r.gradientNote);
      if (r.heartRateNote) note(o, r.heartRateNote);
      if (r.halfTimeLimitsNote) note(o, r.halfTimeLimitsNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a published staging to measurements already taken. It does not select or adjust therapy, and it does not assess whether a valve is suitable for balloon valvuloplasty.' }));
  },
};
