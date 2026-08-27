// spec-v811 §2: renderer for gold-coast-als — the 2020 Gold Coast diagnostic criteria for
// ALS (Clinical Scoring & Risk, Group G).
//
// The four regions each get their own UMN and LMN checkbox, rather than two "how many
// regions" counts, because the first limb of requirement 2 needs both findings in the SAME
// region. Counts cannot express that.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/gold-coast-als-v811.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
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
  'gold-coast-als'(root) {
    note(root, 'All three requirements are needed. Mark the findings region by region: upper and lower motor neuron signs in different regions satisfy neither limb of the distribution requirement.');

    root.appendChild(el('h2', { text: 'Required' }));
    root.appendChild(checkField('Progressive motor impairment documented by history or repeated assessment, preceded by normal motor function', 'gca-progressive'));
    root.appendChild(checkField('Investigations exclude other diseases', 'gca-excluded'));

    root.appendChild(el('h2', { text: 'Findings by body region' }));
    root.appendChild(checkField('Bulbar: upper motor neuron dysfunction', 'gca-bulbar-umn'));
    root.appendChild(checkField('Bulbar: lower motor neuron dysfunction', 'gca-bulbar-lmn'));
    root.appendChild(checkField('Cervical: upper motor neuron dysfunction', 'gca-cervical-umn'));
    root.appendChild(checkField('Cervical: lower motor neuron dysfunction', 'gca-cervical-lmn'));
    root.appendChild(checkField('Thoracic: upper motor neuron dysfunction', 'gca-thoracic-umn'));
    root.appendChild(checkField('Thoracic: lower motor neuron dysfunction', 'gca-thoracic-lmn'));
    root.appendChild(checkField('Lumbosacral: upper motor neuron dysfunction', 'gca-lumbosacral-umn'));
    root.appendChild(checkField('Lumbosacral: lower motor neuron dysfunction', 'gca-lumbosacral-lmn'));

    const ids = ['gca-progressive', 'gca-excluded',
      'gca-bulbar-umn', 'gca-bulbar-lmn', 'gca-cervical-umn', 'gca-cervical-lmn',
      'gca-thoracic-umn', 'gca-thoracic-lmn', 'gca-lumbosacral-umn', 'gca-lumbosacral-lmn'];

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.goldCoastAls({
        progressiveMotorImpairment: checked('gca-progressive'),
        otherDiseasesExcluded: checked('gca-excluded'),
        bulbarUmn: checked('gca-bulbar-umn'), bulbarLmn: checked('gca-bulbar-lmn'),
        cervicalUmn: checked('gca-cervical-umn'), cervicalLmn: checked('gca-cervical-lmn'),
        thoracicUmn: checked('gca-thoracic-umn'), thoracicLmn: checked('gca-thoracic-lmn'),
        lumbosacralUmn: checked('gca-lumbosacral-umn'), lumbosacralLmn: checked('gca-lumbosacral-lmn'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Distribution requirement', value: r.distributionMet ? 'met' : 'not met' },
      ]);
      if (r.splitNote) note(o, r.splitNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies criteria to findings already gathered. It does not make the diagnosis or order the investigations that exclude other causes.' }));
  },
};
