// spec-v855 §2: renderer for narcolepsy-criteria — the ICSD-3 criteria for narcolepsy, type 1
// and type 2 (Clinical Scoring & Risk, Group G).
//
// The overnight-study checkbox sits directly under the REM-period count because the one can
// complete the other, and a reader who does not see them together files a one-period study as
// negative.

import { el, clear } from '../lib/dom.js';
import * as N from '../lib/narcolepsy-criteria-v855.js';
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
  'narcolepsy-criteria'(root) {
    note(root, 'Cataplexy on its own does not meet these criteria: it has to be paired with the latency-test findings, or replaced by a low hypocretin result. A REM period on the overnight study may count as one of the two.');

    root.appendChild(el('h2', { text: 'The history' }));
    root.appendChild(checkField('Daily irrepressible sleep or lapses into sleep for at least three months', 'nar-sleepy'));
    root.appendChild(checkField('Cataplexy: brief loss of muscle tone triggered by emotion', 'nar-cata'));

    root.appendChild(el('h2', { text: 'The sleep-latency test' }));
    numField(root, 'Mean sleep latency (minutes; the threshold is 8 or less)', 'nar-latency', { min: '0', max: '20', step: '0.1' });
    numField(root, 'Sleep-onset REM periods on the latency test (the threshold is 2)', 'nar-soremp', { min: '0', max: '5', step: '1' });
    root.appendChild(checkField('A sleep-onset REM period on the overnight study the night before, which may count as one of the two', 'nar-psg'));

    root.appendChild(el('h2', { text: 'Spinal fluid and other causes' }));
    numField(root, 'Hypocretin-1 in the spinal fluid (pg/mL; 110 or less is type 1 on its own)', 'nar-hcrt', { min: '0', max: '2000', step: '1' });
    root.appendChild(checkField('Too little sleep, obstructive sleep apnea, a delayed sleep phase and medication or its withdrawal have been excluded', 'nar-excl'));

    const ids = ['nar-sleepy', 'nar-cata', 'nar-latency', 'nar-soremp', 'nar-psg', 'nar-hcrt', 'nar-excl'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = N.narcolepsyCriteria({
        dailySleepiness: checked('nar-sleepy'),
        cataplexy: checked('nar-cata'),
        meanSleepLatency: val('nar-latency'),
        msltSoremps: val('nar-soremp'),
        psgSoremp: checked('nar-psg'),
        hypocretin: val('nar-hcrt'),
        othersExcluded: checked('nar-excl'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.missing) note(o, r.missing);
      if (r.substitutionNote) note(o, r.substitutionNote);
      if (r.missedSubstitutionNote) note(o, r.missedSubstitutionNote);
      if (r.cataplexyNote) note(o, r.cataplexyNote);
      if (r.hypocretinNote) note(o, r.hypocretinNote);
      if (r.exclusionNote) note(o, r.exclusionNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a published classification to results already obtained. It does not order a sleep study, it does not select treatment, and the diagnosis stays with the treating team.' }));
  },
};
