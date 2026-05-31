// spec-v52 §4.3 "[Detect payer]" step: deterministic payer
// classifier.
//
// Inspects each document's text for letterhead anchors, plan-name
// strings, and member-ID format hints to pick one of the payer
// buckets Sophie has overlays for. v52-1g ships three buckets +
// the fall-through:
//
//   - 'cms-medicare-ffs'          (Medicare Fee-for-Service)
//   - 'cms-medicare-advantage'    (any MA plan, generic overlay)
//   - 'medicaid'                  (any state Medicaid, generic core)
//   - 'aetna'                     (Aetna commercial; the first named
//                                  commercial overlay, wave 52-7)
//   - 'commercial'                (any other non-government payer;
//                                  per-payer overlays land in later
//                                  waves)
//   - 'unknown'                   (no anchors hit)
//
// The classifier returns the bucket; the rule engine consumes it
// (and an explicit `payerOverride` set by the user via the future
// payer-selector UI in spec-v52 §4.2 step 4) when running payer
// overlays. v52-1g does not yet ship overlay-specific rules, so the
// bucket is informational only -- but pinning it down now lets
// every subsequent overlay wave consume a stable interface.

export const PAYER_BUCKETS = [
  'cms-medicare-ffs',
  'cms-medicare-advantage',
  'medicaid',
  'aetna',
  'commercial',
  'unknown',
];

// First-match-wins, in this order, because the buckets are nested:
// "Medicare Advantage" must match before "Medicare", "Medicaid"
// before generic commercial, etc.
const RULES = [
  {
    bucket: 'cms-medicare-advantage',
    anchors: [
      'medicare advantage',
      'ma plan',
      'mapd plan',
      'humana gold plus',
      'aetna medicare',
      'uhc medicare advantage',
      'unitedhealthcare medicare advantage',
      'kaiser permanente senior advantage',
      'centers for medicare & medicaid services advantage',
    ],
  },
  {
    bucket: 'medicaid',
    anchors: [
      'medicaid',
      'medi-cal',
      'denti-cal',
      'masshealth',
      'soonercare',
      'medicaid managed care',
      'state medicaid',
      'chip',
    ],
  },
  {
    bucket: 'cms-medicare-ffs',
    anchors: [
      'medicare part a',
      'medicare part b',
      'medicare fee-for-service',
      'medicare ffs',
      'mac jurisdiction',
      'noridian medicare',
      'novitas medicare',
      'palmetto gba',
    ],
  },
  {
    // The first named commercial overlay (spec-v52 §4.5.7, wave 52-7).
    // Placed before the generic 'commercial' bucket so an Aetna packet
    // routes to the Aetna overlay; 'aetna medicare [advantage]' is caught
    // earlier by the MA bucket, so this matches Aetna commercial only.
    bucket: 'aetna',
    anchors: [
      'aetna',
    ],
  },
  {
    bucket: 'commercial',
    anchors: [
      'cigna',
      'humana',
      'unitedhealthcare',
      'united healthcare',
      'uhc',
      'anthem',
      'blue cross',
      'bluecross',
      'blueshield',
      'blue shield',
      'kaiser permanente',
      'tricare',  // technically gov; close enough to commercial for v52-1g routing
    ],
  },
];

export function detectPayer(text) {
  const s = String(text || '').toLowerCase();
  if (s.length === 0) return 'unknown';
  for (const rule of RULES) {
    for (const anchor of rule.anchors) {
      if (s.includes(anchor)) return rule.bucket;
    }
  }
  return 'unknown';
}

// Per-bundle aggregator: classify each document, return the bucket
// that wins by simple majority. Ties broken by the order in
// PAYER_BUCKETS (Medicare before MA before Medicaid before commercial
// before unknown). 'unknown' is excluded from the count -- a payer
// hit on any single document beats the all-unknown case.
export function detectPacketPayer(documents) {
  const tally = new Map();
  for (const d of documents || []) {
    const bucket = detectPayer(d.text || '');
    if (bucket === 'unknown') continue;
    tally.set(bucket, (tally.get(bucket) || 0) + 1);
  }
  if (tally.size === 0) return 'unknown';
  let best = null;
  let bestCount = 0;
  for (const bucket of PAYER_BUCKETS) {
    const n = tally.get(bucket) || 0;
    if (n > bestCount) { best = bucket; bestCount = n; }
  }
  return best || 'unknown';
}
