// spec-v841 §2: renderer for diabetes-diagnosis — the American Diabetes Association
// diagnostic thresholds (Clinical Scoring & Risk, Group G).
//
// "Confirmed on a repeat test" is a first-class input because confirmation is part of the
// definition rather than an afterthought: without unequivocal hyperglycemia, one abnormal
// result is not a diagnosis.
//
// The A1C-confounder and OGTT-preparation checkboxes exist so the tile can SET ASIDE a value
// rather than quietly using an uninterpretable one.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/diabetes-diagnosis-v841.js';
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
  'diabetes-diagnosis'(root) {
    note(root, 'Confirmation is part of the definition. Without unequivocal hyperglycemia, one abnormal result is not a diagnosis.');

    root.appendChild(el('h2', { text: 'Tests' }));
    numField(root, 'A1C, percent', 'dxd-a1c', { min: '0', max: '30', step: '0.1' });
    root.appendChild(checkField('A condition is present that alters the A1C: altered red cell turnover, HIV, cirrhosis, renal failure, dialysis, pregnancy or a hemoglobin variant', 'dxd-a1cconfound'));
    numField(root, 'Fasting plasma glucose, mg per dL, after at least 8 hours without calories', 'dxd-fpg', { min: '0', step: '1' });
    numField(root, '2-hour plasma glucose during a 75 g oral glucose tolerance test, mg per dL', 'dxd-ogtt', { min: '0', step: '1' });
    root.appendChild(checkField('Carbohydrate was restricted in the 3 days before the tolerance test', 'dxd-carbrestrict'));
    numField(root, 'Random plasma glucose, mg per dL', 'dxd-random', { min: '0', step: '1' });
    root.appendChild(checkField('Classic symptoms of hyperglycemia, or a hyperglycemic crisis', 'dxd-symptoms'));

    root.appendChild(el('h2', { text: 'Confirmation' }));
    root.appendChild(checkField('An abnormal result has been confirmed by repeating the same test at a second time point', 'dxd-confirmed'));

    const ids = ['dxd-a1c', 'dxd-a1cconfound', 'dxd-fpg', 'dxd-ogtt', 'dxd-carbrestrict',
      'dxd-random', 'dxd-symptoms', 'dxd-confirmed'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.diabetesDiagnosis({
        a1c: val('dxd-a1c'),
        a1cConfounder: checked('dxd-a1cconfound'),
        fastingGlucose: val('dxd-fpg'),
        twoHourGlucose: val('dxd-ogtt'),
        carbRestrictedBeforeOgtt: checked('dxd-carbrestrict'),
        randomGlucose: val('dxd-random'),
        classicSymptoms: checked('dxd-symptoms'),
        confirmedOnRepeat: checked('dxd-confirmed'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Tests in the diabetes range', value: `${r.diabetesRangeTests.length}` },
      ]);
      if (r.confirmationNote) note(o, r.confirmationNote);
      if (r.randomNote) note(o, r.randomNote);
      if (r.a1cNote) note(o, r.a1cNote);
      if (r.ogttNote) note(o, r.ogttNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This interprets results already obtained. It does not start or adjust any treatment.' }));
  },
};
