// spec-v385: Schwab & England Activities of Daily Living (ADL) scale (0-100%, in 10% steps) — a global
// measure of functional independence widely used in Parkinson disease, where 100% is completely
// independent and 0% is bedridden with failing vegetative functions. It is the functional-ADL companion
// to the Hoehn-Yahr motor-staging tile already in the catalog. "schwab england" / "parkinson adl scale"
// routed to nothing.
//
// This is a FUNCTIONAL-STATUS descriptor the clinician assigns, not a measure of pathology and not a
// threshold: like the Karnofsky / ECOG performance scales, the tile reports the level the clinician has
// assessed and does NOT flag any level as abnormal, nor assert a diagnosis, a treatment decision, or a
// prognosis for an individual patient (spec-v11 §5.3). The falling-independence association (100 -> 0) is
// the descriptor's own ordering, not an order; the management decision stays with the treating team.
//
// LEVELS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Schwab RS, England AC Jr. Projection technique for evaluating surgery in Parkinson's disease. In:
//     Gillingham FJ, Donaldson MC, eds. Third Symposium on Parkinson's Disease. Edinburgh: E&S
//     Livingstone; 1969:152-157 (the 0-100% descriptors).
//   - Movement-disorder / rehabilitation references reproducing the same 11-level descriptors.

const LEVELS = {
  100: { pct: '100%', text: '100% - completely independent; able to do all chores without slowness, difficulty, or impairment; essentially normal, unaware of any difficulty.' },
  90: { pct: '90%', text: '90% - completely independent; able to do all chores with some slowness, difficulty, or impairment; may take twice as long; beginning to be aware of difficulty.' },
  80: { pct: '80%', text: '80% - completely independent in most chores; takes twice as long; conscious of difficulty and slowness.' },
  70: { pct: '70%', text: '70% - not completely independent; more difficulty with some chores, three to four times as long on some; may spend a large part of the day with chores.' },
  60: { pct: '60%', text: '60% - some dependency; can do most chores but exceedingly slowly and with much effort; errors, some chores impossible.' },
  50: { pct: '50%', text: '50% - more dependent; needs help with half of chores; slower, with difficulty with everything.' },
  40: { pct: '40%', text: '40% - very dependent; can assist with all chores but few alone.' },
  30: { pct: '30%', text: '30% - with effort, now and then does a few chores alone or begins alone; much help needed.' },
  20: { pct: '20%', text: '20% - nothing alone; can be a slight help with some chores; severe invalid.' },
  10: { pct: '10%', text: '10% - totally dependent, helpless; a complete invalid.' },
  0: { pct: '0%', text: '0% - vegetative functions such as swallowing and bladder and bowel function are not working; bedridden.' },
};

const NOTE = 'The Schwab & England ADL scale is a global 0-100% (10% steps) measure of functional independence, widely used in Parkinson disease. 100%: completely independent, normal. 80%: independent in most chores, takes twice as long. 50%: needs help with half of chores. 20%: nothing alone, severe invalid. 0%: bedridden, vegetative functions failing. This is a functional-status descriptor the clinician assigns, not a measure of pathology; the falling-independence ordering is the scale’s own, not an order. This reports the level the clinician has assessed, not a diagnosis, a treatment decision, or a prognosis.';

const VALID = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

// input:
//   percent: 0..100 in steps of 10 (number or string; a trailing '%' is accepted)
export function schwabEngland(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.percent == null ? '' : o.percent).trim().replace(/%\s*$/, '');
  const n = Number(raw);
  const ok = raw !== '' && Number.isFinite(n) && VALID.includes(n);
  const lvl = ok ? LEVELS[n] : null;
  if (!lvl) {
    return { valid: false, message: 'Select the Schwab & England level (0 to 100%, in steps of 10).' };
  }
  return {
    valid: true,
    percent: n,
    level: lvl.pct,
    abnormal: false,
    bandLabel: `Schwab & England ${lvl.pct}`,
    band: lvl.text,
    note: NOTE,
  };
}
