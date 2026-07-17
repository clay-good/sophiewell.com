// spec-v369 MCP wave: adapter for the Nohria-Stevenson clinical hemodynamic profiles in
// lib/nohria-stevenson-v369.js. The dom keys mirror the browser renderer (views/group-v369.js) and
// META['nohria-stevenson'].example. It is a TWO-field tile: `congestion` (enum dry/wet) and `perfusion`
// (enum warm/cold), both required (both in the example). The compute derives the profile A/B/C/L. The
// example (wet, cold -> profile C) round-trips through the default makeToArgs with no custom toArgs (its
// expected text is the profile description; no numeric facts).

import * as C from '../../lib/nohria-stevenson-v369.js';

export default [
  {
    id: 'nohria-stevenson',
    summary: 'Nohria-Stevenson clinical hemodynamic profiles (Nohria 2003) for acute heart failure — the bedside 2x2 classification by congestion (dry vs wet) and perfusion (warm vs cold), the clinical counterpart to the invasive Forrester classification. A: dry-warm (no congestion, adequate perfusion; compensated). B: wet-warm (congestion with adequate perfusion; the most common ADHF profile). C: wet-cold (congestion with hypoperfusion; the worst outcomes). L: dry-cold (hypoperfusion without congestion; low output). Reports the profile, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.nohriaStevenson,
    fields: [
      { dom: 'ns-congestion', arg: 'congestion', kind: 'enum', values: ['dry', 'wet'], label: 'Congestion', required: true },
      { dom: 'ns-perfusion', arg: 'perfusion', kind: 'enum', values: ['warm', 'cold'], label: 'Perfusion', required: true },
    ],
  },
];
