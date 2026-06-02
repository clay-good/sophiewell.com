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
//   - 'uhc'                       (UnitedHealthcare commercial; the second
//                                  named commercial overlay, wave 52-8)
//   - 'anthem'                    (Anthem BCBS / Elevance commercial; the
//                                  third named commercial overlay, wave 52-9)
//   - 'cigna'                     (Cigna commercial; the fourth named
//                                  commercial overlay, wave 52-10)
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
  'uhc',
  'anthem',
  'cigna',
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
    // The second named commercial overlay (spec-v52 §4.5.8, wave 52-8).
    // Placed before the generic 'commercial' bucket so a UnitedHealthcare
    // packet routes to the UHC overlay; 'uhc/unitedhealthcare medicare
    // [advantage]' is caught earlier by the MA bucket, so this matches UHC
    // commercial only. UHC's TPA and subsidiary brands (UMR, Oxford,
    // UnitedHealthcare Oxford) are included because they adjudicate under
    // UHC's prior-authorization protocols.
    bucket: 'uhc',
    anchors: [
      'unitedhealthcare',
      'united healthcare',
      'uhc',
      'optumrx',
      'umr ',
      'oxford health',
    ],
  },
  {
    // The third named commercial overlay (spec-v52 §4.5.9, wave 52-9).
    // Anthem Blue Cross Blue Shield (Elevance Health) routes to its own
    // overlay. Only definitively-Anthem anchors ('anthem', 'elevance') are
    // used: generic 'blue cross' / 'blue shield' stays in the commercial
    // fall-through because most Blues plans are independent licensees, not
    // Anthem/Elevance, and the overlay asserts Anthem's specific submission
    // requirements. 'anthem medicare [advantage]' has no MA anchor of its
    // own, so an explicit "Medicare Advantage" string still wins the MA
    // bucket earlier; a plain Anthem MA packet without that string routes
    // here, which is acceptable (the overlay rules self-gate on requested
    // services, not on the line of business).
    bucket: 'anthem',
    anchors: [
      'anthem',
      'elevance',
    ],
  },
  {
    // The fourth named commercial overlay (spec-v52 §4.5.10, wave 52-10).
    // Cigna (and its Evernorth health-services brand) routes to its own
    // overlay. Placed before the generic 'commercial' bucket so a Cigna
    // packet routes to the Cigna overlay. There is no 'cigna medicare'
    // anchor in the MA bucket, so a plain Cigna MA packet without an
    // explicit "Medicare Advantage" string routes here, which is acceptable
    // (the overlay rules self-gate on requested services, not the line of
    // business), exactly like the Anthem bucket. 'evernorth' is admitted
    // because Cigna adjudicates pharmacy / specialty (Express Scripts /
    // Accredo) and behavioral health under the Evernorth brand.
    bucket: 'cigna',
    anchors: [
      'cigna',
      'evernorth',
    ],
  },
  {
    bucket: 'commercial',
    anchors: [
      'humana',
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
