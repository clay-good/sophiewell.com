// spec-v836 §2: renderer for four-ts-hit — the 4Ts score for heparin-induced
// thrombocytopenia (Clinical Scoring & Risk, Group G).
//
// Each domain is a select carrying its published wording, so the reader picks a described
// finding rather than a number. The timing options say days 5 to 14 explicitly, because the
// narrower 5-to-10 window from the original description is still widely quoted.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/four-ts-hit-v836.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
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
  'four-ts-hit'(root) {
    note(root, 'A low score is a reason NOT to send laboratory testing. This score rules the diagnosis out far better than it rules it in.');

    selField(root, 'Thrombocytopenia', 'fts-thrombocytopenia', [
      ['0', 'Platelet fall under 30 percent, or nadir below 10'],
      ['1', 'Platelet fall of 30 to 50 percent, or nadir 10 to 19'],
      ['2', 'Platelet fall over 50 percent and nadir 20 or above'],
    ]);
    selField(root, 'Timing of the platelet fall', 'fts-timing', [
      ['0', 'Fall within 4 days without recent heparin exposure'],
      ['1', 'Consistent with days 5 to 14 but unclear, or onset after day 14, or a fall within 1 day with exposure 30 to 100 days ago'],
      ['2', 'Clear onset between days 5 and 14, or a fall within 1 day with exposure in the past 30 days'],
    ]);
    selField(root, 'Thrombosis or other sequelae', 'fts-thrombosis', [
      ['0', 'None'],
      ['1', 'Progressive or recurrent thrombosis, non-necrotizing skin lesions, or suspected but unconfirmed thrombosis'],
      ['2', 'New confirmed thrombosis, skin necrosis at injection sites, an anaphylactoid reaction after an intravenous bolus, or adrenal hemorrhage'],
    ]);
    selField(root, 'Other causes of thrombocytopenia', 'fts-other', [
      ['0', 'Another cause is definite'],
      ['1', 'Another cause is possible'],
      ['2', 'No other cause apparent'],
    ]);

    root.appendChild(checkField('Key information needed for the score is missing', 'fts-missing'));

    const ids = ['fts-thrombocytopenia', 'fts-timing', 'fts-thrombosis', 'fts-other', 'fts-missing'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.fourTsHit({
        thrombocytopenia: val('fts-thrombocytopenia'),
        timing: val('fts-timing'),
        thrombosis: val('fts-thrombosis'),
        otherCauses: val('fts-other'),
        keyInformationMissing: checked('fts-missing'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/8` },
      ]);
      note(o, r.testingAdvice);
      if (r.missingNote) note(o, r.missingNote);
      if (r.lowWithMissing) note(o, r.lowWithMissing);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This estimates a pretest probability from information already gathered. It does not stop heparin or start an alternative anticoagulant.' }));
  },
};
