// spec-v852 §2: renderer for sbp-ascitic-fluid — the ascitic-fluid criteria for spontaneous
// bacterial peritonitis (Clinical Scoring & Risk, Group G).
//
// The red-cell field sits directly under the neutrophil field because the correction between
// them is the whole point: a bloody tap crosses the line on blood alone.

import { el, clear } from '../lib/dom.js';
import * as S from '../lib/sbp-ascitic-fluid-v852.js';
import { resultRow } from '../lib/result-copy.js';

const CULTURE = [
  { value: 'pending', text: 'Not back yet, or not sent' },
  { value: 'none', text: 'No growth' },
  { value: 'single', text: 'One organism' },
  { value: 'polymicrobial', text: 'More than one organism' },
];

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
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'sbp-ascitic-fluid'(root) {
    note(root, 'The line is 250 neutrophils per cubic millimetre in the fluid, after the count has been corrected for blood. A tap that drew blood carries neutrophils in with it and can cross 250 on the blood alone.');

    root.appendChild(el('h2', { text: 'The fluid' }));
    numField(root, 'Neutrophils in the fluid (cells per cubic mm)', 'sbp-pmn', { min: '0', max: '500000', step: '1' });
    numField(root, 'Red cells in the fluid (cells per cubic mm)', 'sbp-rbc', { min: '0', max: '5000000', step: '1' });

    root.appendChild(el('h2', { text: 'If the lab reported a total and a percentage instead' }));
    numField(root, 'Total nucleated cells (cells per cubic mm)', 'sbp-wbc', { min: '0', max: '500000', step: '1' });
    numField(root, 'Percentage of those that are neutrophils', 'sbp-pct', { min: '0', max: '100', step: '1' });

    root.appendChild(el('h2', { text: 'Culture' }));
    root.appendChild(selectField('What has grown', 'sbp-cult', CULTURE));

    root.appendChild(el('h2', { text: 'Blood tests and weight' }));
    numField(root, 'Creatinine (mg/dL)', 'sbp-cr', { min: '0', max: '30', step: '0.1' });
    numField(root, 'Blood urea nitrogen (mg/dL)', 'sbp-bun', { min: '0', max: '300', step: '1' });
    numField(root, 'Total bilirubin (mg/dL)', 'sbp-bili', { min: '0', max: '100', step: '0.1' });
    numField(root, 'Weight (kg)', 'sbp-wt', { min: '20', max: '400', step: '1' });

    const ids = ['sbp-pmn', 'sbp-rbc', 'sbp-wbc', 'sbp-pct', 'sbp-cult', 'sbp-cr', 'sbp-bun', 'sbp-bili', 'sbp-wt'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = S.sbpAsciticFluid({
        pmnCount: val('sbp-pmn'),
        redCellCount: val('sbp-rbc'),
        nucleatedCount: val('sbp-wbc'),
        pmnPercent: val('sbp-pct'),
        culture: val('sbp-cult'),
        creatinine: val('sbp-cr'),
        bun: val('sbp-bun'),
        bilirubin: val('sbp-bili'),
        weight: val('sbp-wt'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.bloodNote) note(o, r.bloodNote);
      if (r.percentNote) note(o, r.percentNote);
      if (r.cultureNote) note(o, r.cultureNote);
      if (r.secondaryNote) note(o, r.secondaryNote);
      if (r.bacterascitesNote) note(o, r.bacterascitesNote);
      if (r.albuminNote) note(o, r.albuminNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a published fluid criterion to numbers already measured. It does not select an antibiotic, a dose or a route, and the figures reported for albumin are the ones the trial used rather than an instruction.' }));
  },
};
