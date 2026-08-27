// spec-v807 §2: renderer for chicago-achalasia — Chicago Classification v4.0 achalasia
// subtypes (Clinical Scoring & Risk, Group G). The manometric companion to eckardt, which
// scores achalasia symptoms.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The two gating
// requirements sit under their own heading, separate from the two body findings that pick
// the subtype, because neither gate is optional.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/chicago-achalasia-v807.js';
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
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This reads a study already performed and reported. It does not interpret tracings and it does not choose a treatment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'chicago-achalasia'(root) {
    note(root, 'Two requirements gate all three subtypes and neither is optional. With both met, the esophageal body picks the subtype: spasm is type III, pressurization is type II, neither is type I. Spasm is checked first because it is what defines type III.');
    root.appendChild(el('h2', { text: 'Required for any subtype' }));
    root.appendChild(checkField('Abnormal median integrated relaxation pressure', 'chi-irp'));
    root.appendChild(checkField('100 percent absent peristalsis (every swallow failed or premature)', 'chi-peristalsis'));
    root.appendChild(el('h2', { text: 'What the esophageal body does' }));
    root.appendChild(checkField('Premature or spastic swallows in 20 percent or more (distal latency under 4.5 s with a distal contractile integral above 450)', 'chi-spasm'));
    root.appendChild(checkField('Panesophageal pressurization in 20 percent or more of swallows', 'chi-pep'));
    const ids = ['chi-irp', 'chi-peristalsis', 'chi-spasm', 'chi-pep'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.chicagoAchalasia({
        abnormalIrp: checked('chi-irp'),
        absentPeristalsis: checked('chi-peristalsis'),
        prematureSwallows: checked('chi-spasm'),
        panesophagealPressurization: checked('chi-pep'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Subtype', value: r.subtype === null ? 'not established' : `type ${r.subtype}` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
