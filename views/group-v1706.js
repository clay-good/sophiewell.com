// spec-v1706: biosignal-analysis tool 1, qrs-detect-trace (Pan-Tompkins). The RR intervals it finds can be handed
// to the two HRV tools through a deep link (lib/hash.js buildHash), and are drawn as a tachogram.

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import { plot } from '../lib/components.js';
import { buildHash } from '../lib/hash.js';
import * as QRS from '../lib/qrs-detect-trace-v1706.js';

const MAX_LINK = 600;

export const renderers = {
  'qrs-detect-trace'(root) {
    const p1 = el('p');
    p1.appendChild(el('label', { for: 'qrs-fs', text: 'Sampling rate (samples per second)' }));
    p1.appendChild(el('br'));
    p1.appendChild(el('input', { id: 'qrs-fs', type: 'number', step: 'any', inputmode: 'decimal', placeholder: '360' }));
    root.appendChild(p1);
    const p2 = el('p');
    p2.appendChild(el('label', { for: 'qrs-x', text: 'Samples of one ECG lead, one per line or separated by commas (at least 5 seconds)' }));
    p2.appendChild(el('br'));
    p2.appendChild(el('textarea', { id: 'qrs-x', rows: '6' }));
    root.appendChild(p2);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const area = el('div', { class: 'plot-area' });
    root.appendChild(area);
    const run = () => {
      clear(o); clear(area);
      let r;
      try { r = QRS.qrsDetectTrace({ samplingRate: document.getElementById('qrs-fs').value, samples: document.getElementById('qrs-x').value }); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); return; }
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.message })); return; }
      resultRow(o, [{ text: r.band }, { label: 'Result', value: r.bandLabel }]);
      const ul = el('ul');
      for (const t of r.notes) ul.appendChild(el('li', { text: t }));
      o.appendChild(ul);
      if (r.rr.length <= MAX_LINK) {
        const links = el('p');
        const rr = r.rr.map((v) => Math.round(v)).join(', ');
        links.appendChild(el('a', { href: buildHash({ route: 'hrv-time-domain', state: { 'htd-rr': rr } }), text: 'Send these intervals to HRV time domain' }));
        links.appendChild(document.createTextNode(' · '));
        links.appendChild(el('a', { href: buildHash({ route: 'hrv-frequency-domain', state: { 'hfd-rr': rr, 'hfd-type': 'short' } }), text: 'to HRV frequency domain' }));
        o.appendChild(links);
      } else o.appendChild(el('p', { class: 'muted', text: `${r.rr.length} intervals is too many for a link; copy them from the list above.` }));
      o.appendChild(el('p', { class: 'muted', text: r.note }));
      const fig = plot({
        title: 'RR intervals over time', xLabel: 'seconds', yLabel: 'RR interval (ms)', yFromZero: false,
        series: [{ label: 'RR', points: r.rr.map((v, i) => [r.times[i + 1], v]) }],
        table: { headers: ['Beat time (s)', 'RR (ms)'], rows: r.rr.map((v, i) => [r.times[i + 1], v]).filter((_, i) => i % Math.max(1, Math.ceil(r.rr.length / 40)) === 0) },
      });
      if (fig) area.appendChild(fig);
    };
    for (const id of ['qrs-fs', 'qrs-x']) { const n = document.getElementById(id); n.addEventListener('input', run); n.addEventListener('change', run); }
    run();
  },
};
