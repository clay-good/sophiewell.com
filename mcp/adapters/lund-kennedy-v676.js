// spec-v676 MCP adapter: Lund-Kennedy endoscopic score in lib/lund-kennedy-v676.js.
// The dom keys mirror the browser renderer (views/group-v676.js) and
// META['lund-kennedy'].example. Six required 0-2 enums (polyps/edema/discharge x
// left/right) plus four optional post-op enums (scarring/crusting x left/right);
// reports modified (0-12) and original (0-20) totals. Clinical domain.

import { lundKennedy } from '../../lib/lund-kennedy-v676.js';

export default [
  {
    id: 'lund-kennedy',
    summary: 'Lund-Kennedy endoscopic score for chronic rhinosinusitis (Lund-Kennedy 1997; modified Psaltis 2014): each nasal cavity graded 0-2 on polyps (0 absent, 1 in middle meatus, 2 beyond), edema (0-2), and discharge (0 none, 1 clear, 2 purulent). Modified total (both sides) 0-12. The original adds scarring and crusting (post-op findings, optional here) for 0-20. Higher is worse; no validated cutoff. Endoscopic companion to SNOT-22 and Lund-Mackay.',
    compute: lundKennedy,
    fields: [
      { dom: 'lk-pol-l', arg: 'polL', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Polyps, left (0 absent, 1 middle meatus, 2 beyond)' },
      { dom: 'lk-pol-r', arg: 'polR', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Polyps, right (0-2)' },
      { dom: 'lk-ede-l', arg: 'edeL', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Edema, left (0 absent, 1 mild, 2 severe)' },
      { dom: 'lk-ede-r', arg: 'edeR', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Edema, right (0-2)' },
      { dom: 'lk-dis-l', arg: 'disL', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Discharge, left (0 none, 1 clear, 2 purulent)' },
      { dom: 'lk-dis-r', arg: 'disR', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Discharge, right (0-2)' },
      { dom: 'lk-sca-l', arg: 'scaL', kind: 'enum', values: ['0', '1', '2'], label: 'Scarring, left (post-op, optional; default 0)' },
      { dom: 'lk-sca-r', arg: 'scaR', kind: 'enum', values: ['0', '1', '2'], label: 'Scarring, right (post-op, optional; default 0)' },
      { dom: 'lk-cru-l', arg: 'cruL', kind: 'enum', values: ['0', '1', '2'], label: 'Crusting, left (post-op, optional; default 0)' },
      { dom: 'lk-cru-r', arg: 'cruR', kind: 'enum', values: ['0', '1', '2'], label: 'Crusting, right (post-op, optional; default 0)' },
    ],
  },
];
