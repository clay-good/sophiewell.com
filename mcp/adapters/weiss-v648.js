// spec-v648 MCP adapter: Weiss system for adrenocortical carcinoma in
// lib/weiss-v648.js. The dom keys mirror the browser renderer (views/group-v648.js)
// and META['weiss-adrenal'].example. Nine histopathologic criteria, each an optional
// bool; total 0-9, and >= 3 indicates carcinoma. Two definitional hazards are baked
// into the labels: mitoses count only when > 5/50 HPF, and the clear-cell criterion
// is present when clear cells are <= 25% (not >= 25%). Clinical domain.

import { weissAdrenal, WEISS_CRITERIA } from '../../lib/weiss-v648.js';

const DOM = {
  nuclearGrade: 'weiss-grade', mitoticRate: 'weiss-mitoses', atypicalMitoses: 'weiss-atypical',
  clearCells: 'weiss-clear', diffuseArchitecture: 'weiss-diffuse', necrosis: 'weiss-necrosis',
  venousInvasion: 'weiss-venous', sinusoidalInvasion: 'weiss-sinusoidal', capsularInvasion: 'weiss-capsular',
};

export default [
  {
    id: 'weiss-adrenal',
    summary: 'Weiss system for adrenocortical carcinoma: nine histopathologic criteria (high nuclear grade, mitoses > 5/50 HPF, atypical mitoses, clear cells ≤ 25%, diffuse architecture > 33%, necrosis, venous invasion, sinusoidal invasion, capsular invasion), each 1 point. A total ≥ 3 indicates adrenocortical carcinoma (malignant); 0-2 indicates a benign adenoma.',
    compute: weissAdrenal,
    fields: WEISS_CRITERIA.map((c) => ({
      dom: DOM[c.key], arg: c.key, kind: 'bool', required: false,
      label: c.label.charAt(0).toUpperCase() + c.label.slice(1),
    })),
  },
];
