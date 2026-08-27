// spec-v818 §2: renderer for tension-headache-ichd3 — ICHD-3 sections 2.1, 2.2 and 2.3
// (Clinical Scoring & Risk, Group G).
//
// Nausea is a SEVERITY select rather than a checkbox. The episodic forms permit no nausea at
// all while the chronic form permits mild nausea, so "nausea: yes/no" cannot express the
// rule - it would either deny 2.3 to patients who have it or grant 2.1 and 2.2 to patients
// who do not.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/tension-headache-ichd3-v818.js';
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
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'numeric' }, attrs || {})));
  root.appendChild(wrap);
}
function selField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
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
  'tension-headache-ichd3'(root) {
    note(root, 'All three subtypes are assessed together. The symptom rule loosens in the chronic form: mild nausea disqualifies the episodic forms and is allowed in the chronic one.');

    root.appendChild(el('h2', { text: 'Pattern' }));
    numField(root, 'Headache days per month', 'tth-days', { min: '0', max: '31', step: '1' });
    numField(root, 'Number of episodes so far (needed for the episodic forms only)', 'tth-episodes', { min: '0', step: '1' });
    numField(root, 'Months the pattern has run', 'tth-months', { min: '0', step: '1' });
    selField(root, 'How long an episode lasts', 'tth-duration', [
      ['', '- choose -'],
      ['under-30-min', 'Under 30 minutes'],
      ['30-min-to-2-hours', '30 minutes to 2 hours'],
      ['hours-to-7-days', 'Hours to 7 days'],
      ['over-7-days-or-unremitting', 'Longer than 7 days, or unremitting'],
    ]);

    root.appendChild(el('h2', { text: 'Headache characteristics, at least two needed' }));
    root.appendChild(checkField('Both-sided location', 'tth-bilateral'));
    root.appendChild(checkField('Pressing or tightening, not pulsating', 'tth-pressing'));
    root.appendChild(checkField('Mild or moderate intensity', 'tth-mild'));
    root.appendChild(checkField('Not made worse by routine physical activity such as walking or climbing stairs', 'tth-notaggravated'));

    root.appendChild(el('h2', { text: 'Associated symptoms' }));
    selField(root, 'Nausea', 'tth-nausea', [
      ['none', 'None'],
      ['mild', 'Mild'],
      ['moderate', 'Moderate'],
      ['severe', 'Severe'],
    ]);
    root.appendChild(checkField('Vomiting', 'tth-vomiting'));
    root.appendChild(checkField('Photophobia', 'tth-photophobia'));
    root.appendChild(checkField('Phonophobia', 'tth-phonophobia'));

    root.appendChild(el('h2', { text: 'Exclusion' }));
    root.appendChild(checkField('Not better accounted for by another ICHD-3 diagnosis', 'tth-noother'));

    const ids = ['tth-days', 'tth-episodes', 'tth-months', 'tth-duration',
      'tth-bilateral', 'tth-pressing', 'tth-mild', 'tth-notaggravated',
      'tth-nausea', 'tth-vomiting', 'tth-photophobia', 'tth-phonophobia', 'tth-noother'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.tensionHeadacheIchd3({
        headacheDaysPerMonth: val('tth-days'),
        episodeCount: val('tth-episodes'),
        monthsOfPattern: val('tth-months'),
        duration: val('tth-duration'),
        bilateral: checked('tth-bilateral'),
        pressing: checked('tth-pressing'),
        mildOrModerate: checked('tth-mild'),
        notAggravated: checked('tth-notaggravated'),
        nausea: val('tth-nausea'),
        vomiting: checked('tth-vomiting'),
        photophobia: checked('tth-photophobia'),
        phonophobia: checked('tth-phonophobia'),
        noBetterExplanation: checked('tth-noother'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Characteristics', value: `${r.featureCount}/4` },
      ]);
      if (r.nauseaNote) note(o, r.nauseaNote);
      if (r.episodeNote) note(o, r.episodeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published criteria to a history already taken. It does not prescribe an abortive or a preventive.' }));
  },
};
