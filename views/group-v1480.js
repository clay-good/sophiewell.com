// spec-v1480: renderer for periodontitis-stage-grade (Clinical Scoring & Risk, Group G).

import { el, clear } from '../lib/dom.js';
import * as PD from '../lib/periodontitis-stage-grade-v1480.js';
import { resultRow } from '../lib/result-copy.js';

const NA = { value: '', text: '— choose —' };
function numField(root, label, id, min, max, step, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min, max, step, inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
}
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [NA, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
}
function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  root.appendChild(wrap);
}
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'periodontitis-stage-grade'(root) {
    root.appendChild(el('h2', { text: 'Stage' }));
    numField(root, 'Interdental attachment loss at the site of greatest loss (mm)', 'pd-cal', '0', '20', '0.5', 'e.g. 6');
    selectField(root, 'Or, if no attachment loss is available, the radiographic bone loss', 'pd-rbl', PD.PD_RBL);
    numField(root, 'Teeth lost to periodontitis (0 if none)', 'pd-teeth', '0', '32', '1', 'e.g. 0');
    numField(root, 'Maximum probing depth (mm)', 'pd-maxpd', '0', '20', '0.5', 'e.g. 6');
    checkField(root, 'Vertical bone loss of 3 mm or more', 'pd-vertical');
    checkField(root, 'Furcation involvement, class II or III', 'pd-furcation');
    checkField(root, 'Moderate ridge defect', 'pd-ridge');
    checkField(root, 'Needs complex rehabilitation (masticatory dysfunction, occlusal trauma, severe ridge defect, bite collapse, drifting, flaring, or fewer than 20 teeth)', 'pd-rehab');
    selectField(root, 'Extent', 'pd-extent', PD.PD_EXTENT);
    root.appendChild(el('h2', { text: 'Grade' }));
    selectField(root, 'Direct evidence of progression (radiographs or attachment loss over 5 years)', 'pd-direct', PD.PD_DIRECT);
    numField(root, 'Or: bone loss at the worst site (%)', 'pd-bonepct', '0', '100', '1', 'e.g. 40');
    numField(root, 'and age (years)', 'pd-age', '1', '120', '1', 'e.g. 45');
    selectField(root, 'Smoking', 'pd-smoking', PD.PD_SMOKING);
    selectField(root, 'Diabetes', 'pd-diabetes', PD.PD_DIABETES);
    const ids = ['pd-cal', 'pd-rbl', 'pd-teeth', 'pd-maxpd', 'pd-vertical', 'pd-furcation', 'pd-ridge', 'pd-rehab', 'pd-extent',
      'pd-direct', 'pd-bonepct', 'pd-age', 'pd-smoking', 'pd-diabetes'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = PD.periodontitisStageGrade({
        cal: val('pd-cal'), rbl: val('pd-rbl'), toothLoss: val('pd-teeth'), maxPd: val('pd-maxpd'),
        verticalBoneLoss: chk('pd-vertical'), furcation: chk('pd-furcation'), ridgeDefect: chk('pd-ridge'), complexRehab: chk('pd-rehab'),
        extent: val('pd-extent'), direct: val('pd-direct'), boneLossPct: val('pd-bonepct'), age: val('pd-age'),
        smoking: val('pd-smoking'), diabetes: val('pd-diabetes'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: 'warn' },
        { label: 'Periodontitis', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
