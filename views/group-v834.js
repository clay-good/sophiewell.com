// spec-v834 §2: renderer for poi-diagnosis — the 2024 ESHRE algorithm for premature ovarian
// insufficiency (Clinical Scoring & Risk, Group G).
//
// Bilateral oophorectomy sits FIRST, before any laboratory field, because under 40 it is the
// diagnosis on its own and the guideline says no further testing is needed. Putting it after
// the FSH would imply a test that cannot change the answer.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/poi-diagnosis-v834.js';
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
  'poi-diagnosis'(root) {
    note(root, 'Under 40, bilateral oophorectomy is the diagnosis on its own and no further testing is needed. Otherwise the menstrual criterion and the FSH are both required.');

    root.appendChild(el('h2', { text: 'Age and surgical history' }));
    numField(root, 'Age in years', 'poi-age', { min: '0', max: '120', step: '1' });
    root.appendChild(checkField('Bilateral oophorectomy', 'poi-oophorectomy'));

    root.appendChild(el('h2', { text: 'Menstrual disturbance' }));
    numField(root, 'Months of amenorrhea or oligomenorrhea', 'poi-months', { min: '0', step: '1' });
    root.appendChild(checkField('Currently on hormonal therapy, including oral, injectable or long-acting contraception', 'poi-hormones'));

    root.appendChild(el('h2', { text: 'Follicle stimulating hormone' }));
    numField(root, 'FSH, IU per L (no need to time this to a cycle day)', 'poi-fsh', { min: '0', max: '1000', step: '0.1' });
    root.appendChild(checkField('A second raised FSH has been taken at least 4 weeks apart', 'poi-repeat'));

    root.appendChild(el('h2', { text: 'Supportive but not diagnostic' }));
    root.appendChild(checkField('Estradiol is low', 'poi-estradiol'));
    root.appendChild(checkField('Ultrasound shows small ovarian volume or a low antral follicle count', 'poi-ultrasound'));
    root.appendChild(checkField('Anti-Mullerian hormone is low', 'poi-amh'));

    const ids = ['poi-age', 'poi-oophorectomy', 'poi-months', 'poi-hormones', 'poi-fsh',
      'poi-repeat', 'poi-estradiol', 'poi-ultrasound', 'poi-amh'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.poiDiagnosis({
        age: val('poi-age'),
        bilateralOophorectomy: checked('poi-oophorectomy'),
        monthsOfDisturbance: val('poi-months'),
        onHormonalTherapy: checked('poi-hormones'),
        fsh: val('poi-fsh'),
        repeatFshConfirmed: checked('poi-repeat'),
        estradiolLow: checked('poi-estradiol'),
        ultrasoundDone: checked('poi-ultrasound'),
        amhLow: checked('poi-amh'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.oophorectomyNote) note(o, r.oophorectomyNote);
      if (r.ageNote) note(o, r.ageNote);
      if (r.hormoneNote) note(o, r.hormoneNote);
      if (r.repeatNote) note(o, r.repeatNote);
      if (r.notDiagnosticNote) note(o, r.notDiagnosticNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published criteria to results already obtained. It does not start hormone replacement or arrange fertility counseling.' }));
  },
};
