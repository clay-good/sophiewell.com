// spec-v654: Peritoneal Cancer Index (PCI) of Jacquet & Sugarbaker.
//
// The standard quantitative index of peritoneal tumor burden for peritoneal surface
// malignancy (cytoreductive surgery / HIPEC planning). A companion to the built
// oncologic staging tiles. Source:
//   Jacquet P, Sugarbaker PH. Clinical research methodologies in diagnosis and staging
//   of patients with peritoneal carcinomatosis. Cancer Treat Res. 1996;82:359-374.
//   PMID 8849962.
//
// Thirteen abdominopelvic regions (0-8 the nine regions from two transverse and two
// sagittal planes; 9-12 the four small-bowel regions), each scored 0-3 by lesion size:
//   LS-0 = no tumor; LS-1 = tumor up to 0.5 cm; LS-2 = tumor up to 5.0 cm;
//   LS-3 = tumor greater than 5.0 cm OR confluence of tumor.
// The sum is 0-39. Each region defaults to LS-0 (no tumor) so only involved regions
// need be entered.
//
// Posture: prognostic/selection thresholds (e.g. colorectal PCI < 20) are tumor-type
// specific and center-dependent, and candidacy also depends on the completeness-of-
// cytoreduction score; the tile reports the total and names cutoffs as advisory rather
// than asserting a verdict. Pure: no DOM, no clock, no network.

export const PCI_REGIONS = [
  { key: 'r0', label: 'Central' },
  { key: 'r1', label: 'Right upper' },
  { key: 'r2', label: 'Epigastrium' },
  { key: 'r3', label: 'Left upper' },
  { key: 'r4', label: 'Left flank' },
  { key: 'r5', label: 'Left lower' },
  { key: 'r6', label: 'Pelvis' },
  { key: 'r7', label: 'Right lower' },
  { key: 'r8', label: 'Right flank' },
  { key: 'r9', label: 'Upper jejunum' },
  { key: 'r10', label: 'Lower jejunum' },
  { key: 'r11', label: 'Upper ileum' },
  { key: 'r12', label: 'Lower ileum' },
];

export const PCI_MIN = 0;
export const PCI_MAX = 39;

export const PCI_NOTE = 'Peritoneal Cancer Index (Jacquet P, Sugarbaker PH, Cancer Treat Res 1996;82:359-374). Thirteen abdominopelvic regions (0-8 the nine regions from two transverse and two sagittal planes, 9-12 the four small-bowel regions) are each scored 0 to 3 by lesion size: 0 = no tumor, 1 = tumor up to 0.5 cm, 2 = tumor up to 5.0 cm, 3 = tumor greater than 5.0 cm or confluence of tumor. The sum is 0 to 39. Higher totals mean greater peritoneal tumor burden. Selection thresholds for cytoreductive surgery and HIPEC (for example a colorectal cutoff near 20, lower for gastric, and no strict ceiling for pseudomyxoma peritonei) are tumor-type specific and center-dependent, and candidacy also depends on the completeness-of-cytoreduction score and tumor biology; this tile reports the total and treats cutoffs as advisory rather than a verdict.';

export function peritonealCancerIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const bad = [];
  const scored = [];
  let total = 0;
  // spec-v1108's ledger, drained in spec-v1111. The `continue` below is the
  // defect and its comment said so: an unentered region "defaults to LS-0",
  // which on the PCI means the surgeon looked at that region and found no
  // tumor. Thirteen of them answered "PCI 0 of 39" -- the number a
  // cytoreduction decision is made on -- for an abdomen nobody had explored.
  //
  // Every region contributes 0 to 3, so what has been entered is a FLOOR.
  const unscored = [];
  for (const r of PCI_REGIONS) {
    const raw = o[r.key];
    if (raw === '' || raw === null || raw === undefined) { unscored.push(r.label); continue; }
    const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
    if (!Number.isInteger(n) || n < 0 || n > 3) { bad.push(`${r.key} = "${raw}"`); continue; }
    total += n;
    if (n > 0) scored.push(`${r.label}: LS-${n}`);
  }
  if (bad.length) {
    return { valid: false, code: 'OUT_OF_RANGE', message: `Each region lesion size is 0, 1, 2, or 3. Check: ${bad.join('; ')}.` };
  }
  const abnormal = total >= 20;
  // Rule 13: a PCI of 20 or more is already the high-burden reading and an
  // unscored region cannot bring it down, so that one needs no footing.
  const floored = unscored.length > 0 && !abnormal;
  return {
    valid: true,
    total,
    min: PCI_MIN,
    max: PCI_MAX,
    regionsInvolved: scored.length,
    unscored,
    floorOnly: floored,
    abnormal,
    bandLabel: floored ? `PCI at least ${total} of ${PCI_MAX}` : `PCI ${total} of ${PCI_MAX}`,
    band: floored
      ? `PCI at least ${total} of ${PCI_MAX}, from ${PCI_REGIONS.length - unscored.length} of the `
        + `${PCI_REGIONS.length} regions. ${unscored.length} `
        + `${unscored.length === 1 ? 'region is' : 'regions are'} not scored and each can only `
        + 'raise the index, so this is a floor rather than a peritoneal tumor burden.'
      : `PCI ${total} of ${PCI_MAX}.`,
    detail: (scored.length ? `${scored.join('; ')}.` : 'No region scored above LS-0 among those entered.')
      + (unscored.length ? ` Not scored: ${unscored.join(', ')}.` : ''),
    note: PCI_NOTE,
  };
}
