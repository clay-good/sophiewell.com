// spec-v788 §2: renderer for intertak — the InterTAK Diagnostic Score (Clinical Scoring &
// Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Seven weighted
// checkboxes; the sum 0-100 maps to a probability band and the consensus workup pathway.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/intertak-v788.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. A high score does not exclude a coronary occlusion, and this score decides nothing about angiography. The pathway shown is what the consensus document suggests considering, not an order.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  intertak(root) {
    note(root, 'InterTAK Diagnostic Score (Ghadri 2017): seven weighted features summing to exactly 100, separating takotsubo syndrome from an acute coronary syndrome. In the expert consensus about 18 percent of patients scoring 50 have takotsubo and about 90 percent of those scoring above 70; 70 or more is treated as high probability.');
    root.appendChild(checkField('Female sex (25)', 'itk-female'));
    root.appendChild(checkField('Emotional trigger (24)', 'itk-emotional'));
    root.appendChild(checkField('Physical trigger (13)', 'itk-physical'));
    root.appendChild(checkField('No ST-segment depression, other than in aVR (12)', 'itk-nostdep'));
    root.appendChild(checkField('Psychiatric disorder (11)', 'itk-psych'));
    root.appendChild(checkField('Neurologic disorder (9)', 'itk-neuro'));
    root.appendChild(checkField('QT interval prolongation (6)', 'itk-qt'));
    const ids = ['itk-female', 'itk-emotional', 'itk-physical', 'itk-nostdep', 'itk-psych', 'itk-neuro', 'itk-qt'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.interTak({
        femaleSex: checked('itk-female'),
        emotionalTrigger: checked('itk-emotional'),
        physicalTrigger: checked('itk-physical'),
        noStDepression: checked('itk-nostdep'),
        psychiatricDisorder: checked('itk-psych'),
        neurologicDisorder: checked('itk-neuro'),
        qtProlongation: checked('itk-qt'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/100` },
        { label: 'Suggested next step', value: r.workup },
      ]);
      note(o, r.present.length ? `Features present: ${r.present.join(', ')}.` : 'No features selected (score 0).');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
