// spec-v1555 MCP adapter: snake-antivenom-indication in lib/snake-antivenom-indication-v1555.js.
// The dom keys mirror views/group-v1555b.js and META['snake-antivenom-indication'].example. Clinical domain.

import * as M from '../../lib/snake-antivenom-indication-v1555.js';

export default [
  {
    id: 'snake-antivenom-indication',
    summary: 'Applies WHO SEARO or AFRO criteria for antivenom after a snakebite. Any one systemic or local sign; AFRO counts local signs only for necrotic species; never says not indicated while a systemic sign is unassessed.',
    compute: M.snakeAntivenomIndication,
    fields: [
      { dom: 'ai-region', arg: 'region', kind: 'enum', required: true, label: 'Region', values: M.REGION_OPTIONS.map((d) => d.value) },
      { dom: 'ai-bleed', arg: 'bleed', kind: 'enum', label: 'Spontaneous bleeding away from the bite', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ai-wbct', arg: 'wbct', kind: 'enum', label: '20WBCT', values: M.WBCT_OPTIONS.map((d) => d.value) },
      { dom: 'ai-lab', arg: 'lab', kind: 'enum', label: 'INR, prothrombin time or platelets (Asia)', values: M.LAB_OPTIONS.map((d) => d.value) },
      { dom: 'ai-neuro', arg: 'neuro', kind: 'enum', label: 'Neurotoxic signs (drooping eyelids, eye movement paralysis, weakness)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ai-cardio', arg: 'cardio', kind: 'enum', label: 'Low blood pressure, shock, abnormal rhythm or ECG', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ai-aki', arg: 'aki', kind: 'enum', label: 'Acute kidney injury (Asia)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ai-urine', arg: 'urine', kind: 'enum', label: 'Dark brown urine (Asia)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ai-half', arg: 'half', kind: 'enum', label: 'Swelling of more than half the bitten limb (within 48 hours, no tourniquet)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ai-digit', arg: 'digit', kind: 'enum', label: 'Bite on a finger or toe, with swelling', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ai-rapid', arg: 'rapid', kind: 'enum', label: 'Rapidly spreading swelling (past the wrist or ankle within hours)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ai-node', arg: 'node', kind: 'enum', label: 'Enlarged tender lymph node draining the limb (Asia)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ai-necrotic', arg: 'necrotic', kind: 'enum', label: 'Africa: species known to cause tissue death (Bitis, Echis, Cerastes, Macrovipera, spitting cobras)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ai-risk', arg: 'risk', kind: 'enum', label: 'Previous reaction to horse or sheep serum, or severe allergy or asthma', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
