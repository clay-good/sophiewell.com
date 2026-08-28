// spec-v838 §2: renderer for clinical-obesity — the 2025 Lancet Commission framework
// (Clinical Scoring & Risk, Group G).
//
// The anthropometric measures are asked as "raised against a validated, ethnicity-appropriate
// cutoff" rather than as raw numbers. The Commission deliberately does not publish one set of
// cutoffs - it specifies validated ones appropriate to age, gender and ethnicity - so taking
// raw measurements would require inventing thresholds it declined to fix.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/clinical-obesity-v838.js';
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
  'clinical-obesity'(root) {
    note(root, 'Body mass index alone is not a diagnosis here. That is the reform: it confirms nothing on its own below 40, and two anthropometric criteria confirm obesity without it.');

    root.appendChild(el('h2', { text: 'Step one: confirm excess adiposity' }));
    numField(root, 'Body mass index', 'cob-bmi', { min: '5', max: '200', step: '0.1' });
    root.appendChild(checkField('Direct body fat measurement shows excess, by DXA or bioimpedance', 'cob-directfat'));
    root.appendChild(checkField('Waist circumference is raised against a validated cutoff for age, sex and ethnicity', 'cob-waist'));
    root.appendChild(checkField('Waist-to-hip ratio is raised against a validated cutoff', 'cob-waisthip'));
    root.appendChild(checkField('Waist-to-height ratio is raised against a validated cutoff', 'cob-waistheight'));

    root.appendChild(el('h2', { text: 'Step two: function, not size' }));
    root.appendChild(checkField('Signs or symptoms of reduced function of tissues or organs, due to the adiposity', 'cob-organ'));
    root.appendChild(checkField('Substantial, age-adjusted limitation of day-to-day activities', 'cob-activity'));

    const ids = ['cob-bmi', 'cob-directfat', 'cob-waist', 'cob-waisthip', 'cob-waistheight',
      'cob-organ', 'cob-activity'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.clinicalObesity({
        bmi: val('cob-bmi'),
        directBodyFatExcess: checked('cob-directfat'),
        waistRaised: checked('cob-waist'),
        waistHipRaised: checked('cob-waisthip'),
        waistHeightRaised: checked('cob-waistheight'),
        organDysfunction: checked('cob-organ'),
        activityLimitation: checked('cob-activity'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Anthropometric criteria', value: `${r.anthropometricCriteria.length}/3` },
      ]);
      if (r.bmiOnlyNote) note(o, r.bmiOnlyNote);
      if (r.normalBmiNote) note(o, r.normalBmiNote);
      if (r.functionNote) note(o, r.functionNote);
      if (r.cutoffNote) note(o, r.cutoffNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published criteria to findings already gathered. It does not prescribe treatment or counsel on weight.' }));
  },
};
