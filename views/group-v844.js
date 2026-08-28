// spec-v844 §2: renderer for aortic-stenosis-stage — the ACC/AHA aortic stenosis stages
// (Clinical Scoring & Risk, Group G).
//
// The area, ejection fraction and stroke volume index are optional because a high-gradient
// reading stages without them. They stop being optional the moment the gradient is low, and
// the tile says so rather than staging on the gradient alone.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/aortic-stenosis-stage-v844.js';
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
  'aortic-stenosis-stage'(root) {
    note(root, 'A low gradient does not exclude severe stenosis. A small valve area with a low gradient can mean the ventricle is not generating enough flow to raise one.');

    root.appendChild(el('h2', { text: 'Gradient' }));
    numField(root, 'Peak aortic velocity (m/s)', 'ass-vmax', { min: '0', max: '10', step: '0.1' });
    numField(root, 'Mean transaortic gradient (mmHg)', 'ass-mg', { min: '0', max: '200', step: '1' });

    root.appendChild(el('h2', { text: 'Valve area' }));
    numField(root, 'Aortic valve area (square cm)', 'ass-ava', { min: '0', max: '6', step: '0.01' });
    numField(root, 'Indexed aortic valve area (square cm per square meter)', 'ass-avai', { min: '0', max: '4', step: '0.01' });

    root.appendChild(el('h2', { text: 'Flow' }));
    numField(root, 'Left ventricular ejection fraction (percent)', 'ass-lvef', { min: '5', max: '85', step: '1' });
    numField(root, 'Stroke volume index (mL per square meter)', 'ass-svi', { min: '0', max: '100', step: '1' });

    root.appendChild(el('h2', { text: 'Symptoms' }));
    root.appendChild(checkField('Symptoms attributable to the stenosis: exertional breathlessness, angina, syncope or presyncope', 'ass-sx'));

    const ids = ['ass-vmax', 'ass-mg', 'ass-ava', 'ass-avai', 'ass-lvef', 'ass-svi', 'ass-sx'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.aorticStenosisStage({
        peakVelocity: val('ass-vmax'),
        meanGradient: val('ass-mg'),
        valveArea: val('ass-ava'),
        indexedValveArea: val('ass-avai'),
        ejectionFraction: val('ass-lvef'),
        strokeVolumeIndex: val('ass-svi'),
        symptoms: checked('ass-sx'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.lowGradientNote) note(o, r.lowGradientNote);
      if (r.missedSevereNote) note(o, r.missedSevereNote);
      if (r.pending) note(o, r.pending);
      if (r.disagreeNote) note(o, r.disagreeNote);
      if (r.verySevereNote) note(o, r.verySevereNote);
      if (r.dobutamineNote) note(o, r.dobutamineNote);
      if (r.normotensiveNote) note(o, r.normotensiveNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a published staging to measurements already taken. It does not select or adjust therapy, and the severity adjudication stays with the echocardiographer and the heart team.' }));
  },
};
