// spec-v822 §2: renderer for heds-2017 — the 2017 international criteria for hypermobile
// Ehlers-Danlos syndrome (Clinical Scoring & Risk, Group G).
//
// The age group is a select rather than a number, because the Beighton cutoff turns on
// pubertal status and not on age alone: an adolescent and a pubertal adult can be the same
// age and carry different cutoffs.
//
// The acquired-connective-tissue-disorder checkbox is not a footnote. It changes criterion 2
// from "two of A, B and C" to "A and B, and C counts for nothing", so it sits with the
// exclusions where it belongs.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/heds-2017-v822.js';
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
  'heds-2017'(root) {
    note(root, 'All three criteria must hold at the same time. The Beighton cutoff depends on age and pubertal status, and one point below it the questionnaire can still carry criterion 1.');

    root.appendChild(el('h2', { text: 'Criterion 1: generalized joint hypermobility' }));
    numField(root, 'Beighton score out of 9', 'heds-beighton', { min: '0', max: '9', step: '1' });
    selField(root, 'Which cutoff applies', 'heds-group', [
      ['prepubertal-or-adolescent', 'Pre-pubertal child or adolescent (cutoff 6)'],
      ['pubertal-to-50', 'Pubertal, up to age 50 (cutoff 5)'],
      ['over-50', 'Over the age of 50 (cutoff 4)'],
    ]);

    root.appendChild(el('h2', { text: 'Five-part questionnaire, used only one point below the cutoff' }));
    root.appendChild(checkField('Can, or could ever, place the hands flat on the floor without bending the knees', 'heds-q1'));
    root.appendChild(checkField('Can, or could ever, bend the thumb to touch the forearm', 'heds-q2'));
    root.appendChild(checkField('As a child, amused friends by contorting the body or could do the splits', 'heds-q3'));
    root.appendChild(checkField('As a child or teenager, dislocated a shoulder or kneecap more than once', 'heds-q4'));
    root.appendChild(checkField('Considers themselves double-jointed', 'heds-q5'));

    root.appendChild(el('h2', { text: 'Criterion 2, feature A: five of twelve are needed' }));
    root.appendChild(checkField('Unusually soft or velvety skin', 'heds-a1'));
    root.appendChild(checkField('Mild skin hyperextensibility', 'heds-a2'));
    root.appendChild(checkField('Unexplained striae without significant weight change', 'heds-a3'));
    root.appendChild(checkField('Bilateral piezogenic papules of the heel', 'heds-a4'));
    root.appendChild(checkField('Recurrent or multiple abdominal hernias', 'heds-a5'));
    root.appendChild(checkField('Atrophic scarring at two or more sites', 'heds-a6'));
    root.appendChild(checkField('Pelvic floor, rectal or uterine prolapse without a predisposing condition', 'heds-a7'));
    root.appendChild(checkField('Dental crowding and a high or narrow palate', 'heds-a8'));
    root.appendChild(checkField('Arachnodactyly by wrist or thumb sign, on both sides', 'heds-a9'));
    root.appendChild(checkField('Arm span to height ratio of 1.05 or more', 'heds-a10'));
    root.appendChild(checkField('Mitral valve prolapse, mild or greater, on strict echo criteria', 'heds-a11'));
    root.appendChild(checkField('Aortic root dilatation with a Z score above 2', 'heds-a12'));

    root.appendChild(el('h2', { text: 'Criterion 2, feature B' }));
    root.appendChild(checkField('A first-degree relative independently meets the current criteria', 'heds-family'));

    root.appendChild(el('h2', { text: 'Criterion 2, feature C: at least one' }));
    root.appendChild(checkField('Musculoskeletal pain in two or more limbs, recurring daily for at least 3 months', 'heds-c1'));
    root.appendChild(checkField('Chronic widespread pain for 3 months or more', 'heds-c2'));
    root.appendChild(checkField('Recurrent joint dislocations or frank joint instability, without trauma', 'heds-c3'));

    root.appendChild(el('h2', { text: 'Criterion 3: all three are prerequisites' }));
    root.appendChild(checkField('No unusual skin fragility', 'heds-skin'));
    root.appendChild(checkField('Other heritable and acquired connective-tissue disorders excluded', 'heds-otherctd'));
    root.appendChild(checkField('Alternative causes of hypermobility excluded', 'heds-alternatives'));
    root.appendChild(checkField('The patient HAS an acquired connective-tissue disorder such as lupus or rheumatoid arthritis', 'heds-acquired'));

    const ids = ['heds-beighton', 'heds-group', 'heds-q1', 'heds-q2', 'heds-q3', 'heds-q4', 'heds-q5', 'heds-a1', 'heds-a2', 'heds-a3', 'heds-a4', 'heds-a5', 'heds-a6', 'heds-a7', 'heds-a8', 'heds-a9', 'heds-a10', 'heds-a11', 'heds-a12', 'heds-family', 'heds-c1', 'heds-c2', 'heds-c3',
      'heds-skin', 'heds-otherctd', 'heds-alternatives', 'heds-acquired'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.heds2017({
        beightonScore: val('heds-beighton'),
        ageGroup: val('heds-group'),
        q1: checked('heds-q1'),
        q2: checked('heds-q2'),
        q3: checked('heds-q3'),
        q4: checked('heds-q4'),
        q5: checked('heds-q5'),
        a1: checked('heds-a1'),
        a2: checked('heds-a2'),
        a3: checked('heds-a3'),
        a4: checked('heds-a4'),
        a5: checked('heds-a5'),
        a6: checked('heds-a6'),
        a7: checked('heds-a7'),
        a8: checked('heds-a8'),
        a9: checked('heds-a9'),
        a10: checked('heds-a10'),
        a11: checked('heds-a11'),
        a12: checked('heds-a12'),
        familyHistory: checked('heds-family'),
        c1: checked('heds-c1'),
        c2: checked('heds-c2'),
        c3: checked('heds-c3'),
        noSkinFragility: checked('heds-skin'),
        otherCtdExcluded: checked('heds-otherctd'),
        alternativesExcluded: checked('heds-alternatives'),
        acquiredCtd: checked('heds-acquired'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Feature A', value: `${r.featureACount}/12` },
      ]);
      if (r.rescueNote) note(o, r.rescueNote);
      if (r.acquiredNote) note(o, r.acquiredNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published criteria to findings already gathered. It does not arrange genetic testing or physiotherapy.' }));
  },
};
