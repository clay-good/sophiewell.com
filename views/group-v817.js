// spec-v817 §2: renderer for trigeminal-neuralgia-ichd3 — the ICHD-3 criteria for 13.1
// Trigeminal neuralgia (Clinical Scoring & Risk, Group G).
//
// The three pain characteristics sit under a heading that says "all three", not "at least
// two". ICHD-3 uses an at-least-two rule for migraine and an all-of-the-following rule here,
// and the heading is the cheapest place to stop that carrying over.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/trigeminal-neuralgia-ichd3-v817.js';
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
  'trigeminal-neuralgia-ichd3'(root) {
    note(root, 'A trigger by innocuous stimuli is required, not optional. Purely spontaneous facial pain does not meet these criteria however characteristic the rest looks.');

    root.appendChild(el('h2', { text: 'Pain distribution' }));
    root.appendChild(checkField('Recurrent bouts of one-sided facial pain in one or more trigeminal divisions', 'tn-unilateral'));
    root.appendChild(checkField('No radiation beyond the trigeminal distribution', 'tn-noradiation'));

    root.appendChild(el('h2', { text: 'Pain character: all three are required' }));
    root.appendChild(checkField('Lasting from a fraction of a second to 2 minutes', 'tn-duration'));
    root.appendChild(checkField('Severe intensity', 'tn-severity'));
    root.appendChild(checkField('Electric shock-like, shooting, stabbing or sharp in quality', 'tn-quality'));

    root.appendChild(el('h2', { text: 'Trigger' }));
    root.appendChild(checkField('Precipitated by innocuous stimuli within the affected distribution', 'tn-trigger'));

    root.appendChild(el('h2', { text: 'Exclusion' }));
    root.appendChild(checkField('Not better accounted for by another ICHD-3 diagnosis', 'tn-noother'));

    const ids = ['tn-unilateral', 'tn-noradiation', 'tn-duration', 'tn-severity', 'tn-quality', 'tn-trigger', 'tn-noother'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.trigeminalNeuralgiaIchd3({
        unilateralParoxysms: checked('tn-unilateral'),
        noRadiationBeyond: checked('tn-noradiation'),
        briefDuration: checked('tn-duration'),
        severeIntensity: checked('tn-severity'),
        shockLikeQuality: checked('tn-quality'),
        triggeredByInnocuousStimuli: checked('tn-trigger'),
        noBetterExplanation: checked('tn-noother'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Pain characteristics', value: `${r.painFeatureCount}/3` },
      ]);
      if (r.triggerNote) note(o, r.triggerNote);
      if (r.allThreeNote) note(o, r.allThreeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies criteria to a history already taken. It does not start carbamazepine or refer for a procedure.' }));
  },
};
