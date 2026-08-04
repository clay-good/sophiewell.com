// spec-v646: McCormack Load-Sharing Classification of spine fractures.
//
// The companion to the built tlics-score: both are thoracolumbar-injury tools, but
// TLICS decides operative vs non-operative, while the Load-Sharing Classification
// predicts whether SHORT-SEGMENT POSTERIOR fixation will fail (needing anterior
// column support or a longer construct). Source:
//   McCormack T, Karaikovic E, Gaines RW. The load sharing classification of spine
//   fractures. Spine. 1994;19(15):1741-1744. PMID 7973969.
//
// Three CT/radiographic components, each scored 1-3, summed to 3-9:
//   comminution (<=30% = 1, 30-60% = 2, >60% = 3),
//   fragment apposition (minimal <2mm = 1, >=2mm over >=half the surface = 2, wide spread = 3),
//   kyphosis to correct (<=3 deg = 1, 4-9 deg = 2, >=10 deg = 3).
// A total >= 7 predicts failure of short-segment posterior instrumentation; <= 6
// suggests short-segment posterior fixation is likely to suffice.
//
// Pure: no DOM, no clock, no network.

const LEVELS = {
  comminution: { 1: '<= 30% comminuted', 2: '30-60% comminuted', 3: '> 60% comminuted' },
  apposition: { 1: 'minimal displacement (< 2 mm)', 2: '>= 2 mm displacement over >= half the fracture surface', 3: 'wide spread of fragments' },
  kyphosis: { 1: '<= 3 deg to correct', 2: '4-9 deg to correct', 3: '>= 10 deg to correct' },
};

export const MCCORMACK_COMPONENTS = [
  { key: 'comminution', label: 'Comminution of the vertebral body (CT)' },
  { key: 'apposition', label: 'Apposition / spread of the fragments (axial CT)' },
  { key: 'kyphosis', label: 'Kyphosis to be corrected (sagittal)' },
];

export const MCCORMACK_MIN = 3;
export const MCCORMACK_MAX = 9;

export const MCCORMACK_NOTE = 'McCormack Load-Sharing Classification (McCormack T, Karaikovic E, Gaines RW, Spine 1994;19(15):1741-1744) — grades how much of the axial load a fractured vertebral body can share, to predict whether short-segment posterior pedicle-screw fixation will hold. Three CT/radiographic components are each scored 1 to 3: comminution of the body (≤ 30% is 1, 30-60% is 2, > 60% is 3); apposition or spread of the fragments (minimal < 2 mm is 1, ≥ 2 mm over at least half the fracture surface is 2, wide spread is 3); and the kyphosis to be corrected (≤ 3° is 1, 4-9° is 2, ≥ 10° is 3). The total ranges 3 to 9. A total of 6 or below suggests short-segment posterior fixation is likely to suffice; 7 or above predicts failure of short-segment instrumentation, so anterior column support (corpectomy and strut graft) or a longer construct is advised. It complements, and does not replace, the operative-vs-nonoperative decision (see TLICS) and the surgeon’s judgment.';

export function mccormackLsc(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const missing = [];
  const bad = [];
  const parts = [];
  let total = 0;
  for (const c of MCCORMACK_COMPONENTS) {
    const raw = o[c.key];
    if (raw === '' || raw === null || raw === undefined) { missing.push(c.key); continue; }
    const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
    if (!Number.isInteger(n) || n < 1 || n > 3) { bad.push(`${c.key} = "${raw}"`); continue; }
    total += n;
    parts.push(`${c.label}: ${LEVELS[c.key][n]} (${n})`);
  }
  if (missing.length) {
    return { valid: false, code: 'MISSING_INPUT', field: missing[0], message: `Score all three components 1 to 3. Still needed: ${missing.join(', ')}.` };
  }
  if (bad.length) {
    return { valid: false, code: 'OUT_OF_RANGE', message: `Each component is 1, 2, or 3. Check: ${bad.join('; ')}.` };
  }
  const needsAnterior = total >= 7;
  return {
    valid: true,
    total,
    min: MCCORMACK_MIN,
    max: MCCORMACK_MAX,
    abnormal: needsAnterior,
    bandLabel: needsAnterior
      ? `Load-Sharing ${total} of ${MCCORMACK_MAX} — ≥ 7: predicts short-segment posterior failure; anterior support or a longer construct advised.`
      : `Load-Sharing ${total} of ${MCCORMACK_MAX} — ≤ 6: short-segment posterior fixation is likely to suffice.`,
    detail: parts.join('; ') + '.',
    note: MCCORMACK_NOTE,
  };
}
