// spec-v857 §2: renderer for aom-criteria — the AAP criteria for acute otitis media and the
// observation option (Clinical Scoring & Risk, Group G).
//
// The effusion checkbox sits first among the findings because it gates everything after it:
// without it none of the three criteria can be met, whatever the drum looks like.

import { el, clear } from '../lib/dom.js';
import * as A from '../lib/aom-criteria-v857.js';
import { resultRow } from '../lib/result-copy.js';

const BULGING = [
  { value: 'none', text: 'None' },
  { value: 'mild', text: 'Mild' },
  { value: 'moderate-severe', text: 'Moderate to severe' },
];

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
  for (const opt of options) sel.appendChild(el('option', { value: opt.value, text: opt.text }));
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

export const renderers = {
  'aom-criteria'(root) {
    note(root, 'A red eardrum on its own is not an ear infection. There has to be objective evidence of fluid behind the drum before any of the three criteria can be met, and a crying child has a red drum.');

    root.appendChild(el('h2', { text: 'The child' }));
    numField(root, 'Age (months)', 'aom-age', { min: '0', max: '216', step: '1' });
    root.appendChild(checkField('Both ears affected', 'aom-bilat'));

    root.appendChild(el('h2', { text: 'What the ear shows' }));
    root.appendChild(checkField('Objective evidence of fluid behind the eardrum', 'aom-effusion'));
    root.appendChild(selectField('Bulging of the eardrum', 'aom-bulge', BULGING));
    root.appendChild(checkField('New drainage from the ear, not from an outer-ear infection', 'aom-otorrhea'));
    root.appendChild(checkField('Ear pain that started within the last 48 hours', 'aom-recent'));
    root.appendChild(checkField('Intense redness of the eardrum', 'aom-erythema'));

    root.appendChild(el('h2', { text: 'How severe it is' }));
    root.appendChild(checkField('Moderate or severe ear pain', 'aom-pain'));
    root.appendChild(checkField('Ear pain lasting 48 hours or more', 'aom-pain48'));
    numField(root, 'Highest temperature (degrees Fahrenheit; 102.2 or above counts as severe)', 'aom-temp', { min: '90', max: '110', step: '0.1' });

    const ids = ['aom-age', 'aom-bilat', 'aom-effusion', 'aom-bulge', 'aom-otorrhea', 'aom-recent', 'aom-erythema', 'aom-pain', 'aom-pain48', 'aom-temp'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = A.aomCriteria({
        ageMonths: val('aom-age'),
        bilateral: checked('aom-bilat'),
        effusion: checked('aom-effusion'),
        bulging: val('aom-bulge'),
        otorrhea: checked('aom-otorrhea'),
        recentPain: checked('aom-recent'),
        intenseErythema: checked('aom-erythema'),
        moderateOrSeverePain: checked('aom-pain'),
        painFortyEightHours: checked('aom-pain48'),
        temperatureF: val('aom-temp'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.notMetReason) note(o, r.notMetReason);
      if (r.erythemaNote) note(o, r.erythemaNote);
      if (r.otorrheaEffusionNote) note(o, r.otorrheaEffusionNote);
      if (r.management) note(o, r.management);
      if (r.lateralityNote) note(o, r.lateralityNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This reports a published criterion and a published option. It does not prescribe, it does not select an antibiotic or a dose, and the decision stays with the treating clinician.' }));
  },
};
