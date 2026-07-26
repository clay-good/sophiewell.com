// spec-v504: the METAVIR fibrosis stage (F0-F4), the histologic staging of liver fibrosis on biopsy. It is
// distinct from the serum-marker fibrosis tiles already in the catalog (fib4, nafld-fibrosis, rpr), which
// estimate fibrosis non-invasively; METAVIR is the stage read from the biopsy itself. "metavir" routed to
// nothing.
//
// HIGH-STAKES: this reports the histologic STAGE the pathologist has assigned, NOT a diagnosis, a
// non-invasive substitute for biopsy, or a treatment decision (spec-v11 section 5.3). The METAVIR system also
// grades necroinflammatory ACTIVITY (A0-A3); this tile reports the fibrosis stage only. The management
// decision stays with the hepatology team.
//
// STAGES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - The French METAVIR Cooperative Study Group. Intraobserver and interobserver variations in liver biopsy
//     interpretation in patients with chronic hepatitis C. Hepatology. 1994;20(1):15-20.
//   - Hepatology references reproducing the same F0 (none) through F4 (cirrhosis) staging.
//
// Fibrosis stages (F0-F4):
//   F0 : no fibrosis.
//   F1 : portal fibrosis without septa.
//   F2 : portal fibrosis with a few septa.
//   F3 : numerous septa without cirrhosis (bridging fibrosis).
//   F4 : cirrhosis.

const STAGES = {
  F0: { stage: 'F0', text: 'METAVIR F0 - no fibrosis.' },
  F1: { stage: 'F1', text: 'METAVIR F1 - portal fibrosis without septa.' },
  F2: { stage: 'F2', text: 'METAVIR F2 - portal fibrosis with a few septa.' },
  F3: { stage: 'F3', text: 'METAVIR F3 - numerous septa without cirrhosis (bridging fibrosis).' },
  F4: { stage: 'F4', text: 'METAVIR F4 - cirrhosis.' },
};

const NOTE = 'The METAVIR fibrosis stage (METAVIR Cooperative Study Group 1994) stages liver fibrosis on biopsy from F0 to F4. F0: no fibrosis. F1: portal fibrosis without septa. F2: portal fibrosis with a few septa. F3: numerous septa without cirrhosis (bridging fibrosis). F4: cirrhosis. METAVIR also grades necroinflammatory activity (A0-A3) separately; this reports the fibrosis stage the pathologist has assigned, not a diagnosis, a non-invasive substitute for biopsy, or a treatment decision.';

const ALIAS = {
  F0: 'F0', F1: 'F1', F2: 'F2', F3: 'F3', F4: 'F4',
  0: 'F0', 1: 'F1', 2: 'F2', 3: 'F3', 4: 'F4',
};

// input:
//   stage: 'F0' / 'F1' / 'F2' / 'F3' / 'F4' (case-insensitive; also accepts 0-4).
export function metavirFibrosis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.stage == null ? '' : o.stage).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const s = STAGES[key];
  if (!s) {
    return { valid: false, message: 'Select the METAVIR fibrosis stage (F0, F1, F2, F3, or F4).' };
  }
  return {
    valid: true,
    stage: s.stage,
    bandLabel: `METAVIR ${s.stage}`,
    band: s.text,
    note: NOTE,
  };
}
