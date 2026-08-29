// spec-v856 §2: renderer for rls-criteria — the five essential IRLSSG criteria for restless
// legs syndrome (Clinical Scoring & Risk, Group G).
//
// The fifth checkbox carries the list of mimics in its own label, because ticking it as a
// formality is the failure mode the 2014 revision exists to prevent.

import { el, clear } from '../lib/dom.js';
import * as R from '../lib/rls-criteria-v856.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'rls-criteria'(root) {
    note(root, 'All five are essential, so four of five is not a partial diagnosis. The fifth is the one that carries the specificity: leg cramps, positional discomfort and several other ordinary things satisfy the first four.');

    root.appendChild(el('h2', { text: 'The five essential criteria' }));
    root.appendChild(checkField('An urge to move the legs, usually with an uncomfortable sensation in them', 'rlsc-urge'));
    root.appendChild(checkField('It begins or worsens during rest or inactivity, such as lying down or sitting', 'rlsc-rest'));
    root.appendChild(checkField('It is partly or wholly relieved by movement, for as long as the movement continues', 'rlsc-move'));
    root.appendChild(checkField('It is worse in the evening or at night than during the day', 'rlsc-night'));
    root.appendChild(checkField('It is not better accounted for by another condition such as leg cramps, positional discomfort, muscle pain, venous stasis, swollen legs, arthritis or habitual foot tapping', 'rlsc-other'));

    root.appendChild(el('h2', { text: 'Specifiers, which are not criteria' }));
    root.appendChild(checkField('The symptoms cause distress, or interfere with sleep or with functioning', 'rlsc-sig'));
    root.appendChild(checkField('On average at least twice a week over the past year', 'rlsc-freq'));
    root.appendChild(checkField('Otherwise, at least five events in a lifetime', 'rlsc-five'));

    const ids = ['rlsc-urge', 'rlsc-rest', 'rlsc-move', 'rlsc-night', 'rlsc-other', 'rlsc-sig', 'rlsc-freq', 'rlsc-five'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = R.rlsCriteria({
        urge: checked('rlsc-urge'),
        atRest: checked('rlsc-rest'),
        relievedByMovement: checked('rlsc-move'),
        worseAtNight: checked('rlsc-night'),
        notOtherCondition: checked('rlsc-other'),
        clinicallySignificant: checked('rlsc-sig'),
        twiceWeeklyPastYear: checked('rlsc-freq'),
        fiveLifetimeEvents: checked('rlsc-five'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.mimicNote) note(o, r.mimicNote);
      if (r.fifthNote) note(o, r.fifthNote);
      if (r.notAScoreNote) note(o, r.notAScoreNote);
      if (r.comparisonNote) note(o, r.comparisonNote);
      if (r.significanceNote) note(o, r.significanceNote);
      if (r.courseNote) note(o, r.courseNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published criteria to a history already taken. It does not select treatment, and it does not assess iron status, which is a separate question.' }));
  },
};
