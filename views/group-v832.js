// spec-v832 §2: renderer for triple-i — the NICHD 2015 Triple I framework (Clinical Scoring
// & Risk, Group G).
//
// Temperature takes a unit select and converts, unlike some other tiles here: Celsius and
// Fahrenheit interconvert exactly, so nothing is invented by doing it.
//
// The "repeated after 30 minutes" question sits with the temperature because the fever
// definition has two routes and a single mid-range reading satisfies neither.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/triple-i-v832.js';
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
  'triple-i'(root) {
    note(root, 'Isolated maternal fever is a category of its own and not an infection diagnosis. Separating the two was the point of the 2015 framework.');

    root.appendChild(el('h2', { text: 'Fever' }));
    numField(root, 'Maternal temperature', 'ti-temp', { min: '25', max: '115', step: '0.1' });
    selField(root, 'Temperature unit', 'ti-unit', [
      ['c', 'Degrees Celsius (39.0 once, or 38.0 to 38.9 twice)'],
      ['f', 'Degrees Fahrenheit (102.2 once, or 100.4 to 102.0 twice)'],
    ]);
    root.appendChild(checkField('A second reading in the 38.0 to 38.9 range was taken at least 30 minutes later', 'ti-repeat'));
    root.appendChild(checkField('There is a clear alternative source for the fever', 'ti-altsource'));

    root.appendChild(el('h2', { text: 'Supporting features: one is needed for suspected Triple I' }));
    numField(root, 'Fetal heart rate, beats per minute', 'ti-fhr', { min: '0', max: '400', step: '1' });
    numField(root, 'Maternal white cell count, per cubic mm', 'ti-wbc', { min: '0', step: '100' });
    root.appendChild(checkField('Corticosteroids given recently', 'ti-steroids'));
    root.appendChild(checkField('Purulent fluid from the cervical os', 'ti-purulent'));

    root.appendChild(el('h2', { text: 'Confirmatory features: one is needed for confirmed Triple I' }));
    root.appendChild(checkField('Positive amniotic fluid Gram stain', 'ti-gram'));
    root.appendChild(checkField('Low amniotic fluid glucose, or a positive amniotic fluid culture', 'ti-glucose'));
    root.appendChild(checkField('Histologic evidence of infection on placental examination', 'ti-histology'));

    const ids = ['ti-temp', 'ti-unit', 'ti-repeat', 'ti-altsource', 'ti-fhr', 'ti-wbc',
      'ti-steroids', 'ti-purulent', 'ti-gram', 'ti-glucose', 'ti-histology'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.tripleI({
        temperature: val('ti-temp'),
        temperatureUnit: val('ti-unit'),
        repeatedAfter30Min: checked('ti-repeat'),
        alternativeSource: checked('ti-altsource'),
        fetalHeartRate: val('ti-fhr'),
        whiteCellCount: val('ti-wbc'),
        recentCorticosteroids: checked('ti-steroids'),
        purulentDischarge: checked('ti-purulent'),
        positiveGramStain: checked('ti-gram'),
        lowGlucoseOrCulture: checked('ti-glucose'),
        placentalHistology: checked('ti-histology'),
      });
      if (!r.valid) { note(o, r.message); return; }
      const rows = [{ text: r.band, cls: r.abnormal ? 'warn' : null }];
      if (r.temperatureCelsius !== null) rows.push({ label: 'Temperature', value: `${r.temperatureCelsius} C` });
      resultRow(o, rows);
      if (r.reformNote) note(o, r.reformNote);
      if (r.feverNote) note(o, r.feverNote);
      if (r.altNote) note(o, r.altNote);
      if (r.steroidNote) note(o, r.steroidNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published criteria to findings already gathered. It does not start or withhold antibiotics, and it does not decide on a neonatal sepsis evaluation.' }));
  },
};
