// spec-v793 §2: renderer for simple-shoulder-test — the Simple Shoulder Test (Clinical
// Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Twelve yes-or-no
// checkboxes; a ticked box is a yes and an unticked one a no, which is exactly the form.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/simple-shoulder-test-v793.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This records what a patient reports they can do. It is not an examination, a diagnosis, or a decision about surgery, and it is most useful compared against the same shoulder over time.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'simple-shoulder-test'(root) {
    note(root, 'Simple Shoulder Test (Lippitt, Harryman and Matsen 1993): tick each question the patient answers yes to. Every question counts the same - there are no subscales and no weights. The total runs 0 to 12 and higher is better.');
    root.appendChild(checkField('Shoulder is comfortable with the arm at rest by the side', 'sst-rest'));
    root.appendChild(checkField('Shoulder allows sleeping comfortably', 'sst-sleep'));
    root.appendChild(checkField('Can reach the small of the back to tuck in a shirt', 'sst-back'));
    root.appendChild(checkField('Can place the hand behind the head with the elbow out to the side', 'sst-head'));
    root.appendChild(checkField('Can place a coin on a shelf at shoulder level without bending the elbow', 'sst-coin'));
    root.appendChild(checkField('Can lift one pound to shoulder level without bending the elbow', 'sst-lift1'));
    root.appendChild(checkField('Can lift eight pounds to shoulder level without bending the elbow', 'sst-lift8'));
    root.appendChild(checkField('Can carry twenty pounds at the side', 'sst-carry20'));
    root.appendChild(checkField('Could toss a ball underhand twenty yards', 'sst-under'));
    root.appendChild(checkField('Could toss a ball overhand twenty yards', 'sst-over'));
    root.appendChild(checkField('Can wash the back of the opposite shoulder', 'sst-wash'));
    root.appendChild(checkField('Shoulder allows working full-time at the regular job', 'sst-work'));
    const ids = ['sst-rest', 'sst-sleep', 'sst-back', 'sst-head', 'sst-coin', 'sst-lift1', 'sst-lift8', 'sst-carry20', 'sst-under', 'sst-over', 'sst-wash', 'sst-work'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.simpleShoulderTest({
        comfortAtRest: checked('sst-rest'),
        sleepComfortably: checked('sst-sleep'),
        reachSmallOfBack: checked('sst-back'),
        handBehindHead: checked('sst-head'),
        coinOnShelf: checked('sst-coin'),
        liftOnePound: checked('sst-lift1'),
        liftEightPounds: checked('sst-lift8'),
        carryTwentyPounds: checked('sst-carry20'),
        tossUnderhand: checked('sst-under'),
        tossOverhand: checked('sst-over'),
        washOppositeShoulder: checked('sst-wash'),
        workFullTime: checked('sst-work'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/12` },
        { label: 'Percentage', value: `${r.percent.toFixed(1)}%` },
      ]);
      note(o, r.yesAnswers.length ? `Answered yes to ${r.yesAnswers.length} of 12.` : 'No questions answered yes (score 0).');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
