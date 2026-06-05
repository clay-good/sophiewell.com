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
//   - 'humana'                    (Humana commercial; the fifth named
//                                  commercial overlay, wave 52-11)
//   - 'hcsc'                      (Health Care Service Corporation -- Blue
//                                  Cross Blue Shield of IL/TX/MT/NM/OK; the
//                                  sixth named commercial overlay, wave 52-12)
//   - 'highmark'                  (Highmark -- Blue Cross Blue Shield of
//                                  PA/WV/DE + western NY; the seventh named
//                                  commercial overlay, wave 52-13)
//   - 'florida-blue'              (Florida Blue / GuideWell -- Blue Cross and
//                                  Blue Shield of Florida; the eighth named
//                                  commercial overlay, wave 52-14)
//   - 'bcbsm'                     (Blue Cross Blue Shield of Michigan + Blue
//                                  Care Network; the ninth named commercial
//                                  overlay, wave 52-15)
//   - 'blue-shield-ca'            (Blue Shield of California; the tenth named
//                                  commercial overlay, wave 52-16)
//   - 'ibx'                       (Independence Blue Cross -- southeastern PA /
//                                  Philadelphia; the eleventh named commercial
//                                  overlay, wave 52-17)
//   - 'carefirst'                 (CareFirst BlueCross BlueShield -- MD / DC /
//                                  Northern VA; the twelfth named commercial
//                                  overlay, wave 52-18)
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
  'humana',
  'hcsc',
  'highmark',
  'florida-blue',
  'bcbsm',
  'blue-shield-ca',
  'ibx',
  'carefirst',
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
    // The fifth named commercial overlay (spec-v52 §4.5.11, wave 52-11).
    // Humana routes to its own overlay. Placed before the generic
    // 'commercial' bucket so a Humana packet routes to the Humana overlay.
    // 'humana gold plus' (and any explicit "Medicare Advantage" string) is
    // caught earlier by the MA bucket; a plain Humana commercial packet
    // routes here. 'centerwell' is admitted because Humana runs its pharmacy
    // and care-delivery services under the CenterWell brand. Like the Anthem
    // and Cigna buckets, a plain Humana MA packet without an explicit
    // "Medicare Advantage" string also routes here, which is acceptable (the
    // overlay rules self-gate on requested services, not the line of business).
    bucket: 'humana',
    anchors: [
      'humana',
      'centerwell',
    ],
  },
  {
    // The sixth named commercial overlay (spec-v52 §4.5.12, wave 52-12).
    // Health Care Service Corporation (HCSC) is the largest Blue Cross Blue
    // Shield licensee not already routed to the Anthem/Elevance bucket: it
    // operates the Blues plans of Illinois, Texas, Montana, New Mexico, and
    // Oklahoma. Placed before the generic 'commercial' bucket so an HCSC
    // packet routes to the HCSC overlay. Only definitively-HCSC anchors are
    // used -- the corporate name, the 'hcsc' acronym, and the five state plan
    // names -- so generic 'blue cross' / 'blue shield' (and other Blues
    // licensees like Florida Blue or Blue Shield of California) stay in the
    // commercial fall-through. HCSC's Medicare Advantage line ("Blue Cross
    // Medicare Advantage") carries an explicit "Medicare Advantage" string,
    // so it is caught earlier by the MA bucket; a plain HCSC commercial packet
    // routes here. Like the Anthem / Cigna / Humana buckets, the overlay rules
    // self-gate on requested services, not on the line of business.
    bucket: 'hcsc',
    anchors: [
      'health care service corporation',
      'hcsc',
      'blue cross blue shield of illinois',
      'blue cross and blue shield of illinois',
      'blue cross blue shield of texas',
      'blue cross and blue shield of texas',
      'blue cross blue shield of montana',
      'blue cross and blue shield of montana',
      'blue cross blue shield of new mexico',
      'blue cross and blue shield of new mexico',
      'blue cross blue shield of oklahoma',
      'blue cross and blue shield of oklahoma',
    ],
  },
  {
    // The seventh named commercial overlay (spec-v52 §4.5.13, wave 52-13).
    // Highmark is the second-largest independent Blue Cross Blue Shield
    // licensee (after HCSC): it operates the Blues plans of Pennsylvania, West
    // Virginia, Delaware, and western/northeastern New York. Placed before the
    // generic 'commercial' bucket so a Highmark packet routes to the Highmark
    // overlay. The single unambiguous brand anchor 'highmark' is used (it is a
    // distinct trade name, not a generic Blues phrase), so generic 'blue cross'
    // / 'blue shield' and other licensees stay in the commercial fall-through.
    // Highmark's Medicare Advantage line ("Freedom Blue" / "Highmark Medicare
    // Advantage") carries an explicit "Medicare Advantage" string where used,
    // so it is caught earlier by the MA bucket; a plain Highmark commercial
    // packet routes here. Like the Anthem / Cigna / Humana / HCSC buckets, the
    // overlay rules self-gate on requested services, not on the line of business.
    bucket: 'highmark',
    anchors: [
      'highmark',
    ],
  },
  {
    // The eighth named commercial overlay (spec-v52 §4.5.14, wave 52-14).
    // Florida Blue (Blue Cross and Blue Shield of Florida, a GuideWell
    // company) is the dominant Blues licensee in Florida and one of the
    // largest independent licensees not routed to the Anthem/Elevance, HCSC,
    // or Highmark buckets. Placed before the generic 'commercial' bucket so a
    // Florida Blue packet routes to the Florida Blue overlay. Only
    // definitively-Florida-Blue anchors are used -- the 'florida blue' /
    // 'guidewell' trade names and the 'blue cross [and] blue shield of
    // florida' plan name -- so generic 'blue cross' / 'blue shield' and other
    // Blues licensees stay in the commercial fall-through. Florida Blue's
    // Medicare Advantage line ("Florida Blue Medicare") carries an explicit
    // "Medicare Advantage" string where used, so it is caught earlier by the
    // MA bucket; a plain Florida Blue commercial packet routes here. Like the
    // Anthem / Cigna / Humana / HCSC / Highmark buckets, the overlay rules
    // self-gate on requested services, not on the line of business.
    bucket: 'florida-blue',
    anchors: [
      'florida blue',
      'guidewell',
      'blue cross and blue shield of florida',
      'blue cross blue shield of florida',
    ],
  },
  {
    // The ninth named commercial overlay (spec-v52 §4.5.15, wave 52-15).
    // Blue Cross Blue Shield of Michigan (BCBSM, with its HMO subsidiary Blue
    // Care Network) is the dominant Blues licensee in Michigan and one of the
    // largest independent licensees not routed to the Anthem/Elevance, HCSC,
    // Highmark, or Florida Blue buckets. Placed before the generic 'commercial'
    // bucket so a BCBSM packet routes to the BCBSM overlay. Only
    // definitively-BCBSM anchors are used -- the plan name, the 'bcbsm'
    // acronym, and the 'blue care network' HMO brand -- so generic 'blue cross'
    // / 'blue shield' and other Blues licensees stay in the commercial
    // fall-through. BCBSM's Medicare Advantage line ("BCBSM Medicare Plus
    // Blue") carries an explicit "Medicare Advantage" string where used, so it
    // is caught earlier by the MA bucket; a plain BCBSM commercial packet routes
    // here. Like the other commercial buckets, the overlay rules self-gate on
    // requested services, not on the line of business.
    bucket: 'bcbsm',
    anchors: [
      'blue cross blue shield of michigan',
      'blue cross and blue shield of michigan',
      'bcbsm',
      'blue care network',
    ],
  },
  {
    // The tenth named commercial overlay (spec-v52 §4.5.16, wave 52-16).
    // Blue Shield of California is the second-largest health plan in California
    // and a distinct independent licensee from Anthem Blue Cross of California
    // (Elevance), which the 'anthem' bucket catches earlier. Placed before the
    // generic 'commercial' bucket so a Blue Shield of California packet routes
    // to its overlay. The single unambiguous plan-name anchor 'blue shield of
    // california' is used, so generic 'blue cross' / 'blue shield' and other
    // Blues licensees stay in the commercial fall-through. Its Medicare
    // Advantage line ("Blue Shield of California Medicare") carries an explicit
    // "Medicare Advantage" string where used, so it is caught earlier by the MA
    // bucket; a plain commercial packet routes here. Like the other commercial
    // buckets, the overlay rules self-gate on requested services, not on the
    // line of business.
    bucket: 'blue-shield-ca',
    anchors: [
      'blue shield of california',
      'blue shield of ca',
    ],
  },
  {
    // The eleventh named commercial overlay (spec-v52 §4.5.17, wave 52-17).
    // Independence Blue Cross (IBX) is the dominant Blues licensee in
    // southeastern Pennsylvania (the Philadelphia region) and a distinct
    // licensee from Highmark, which operates western / central Pennsylvania.
    // Placed before the generic 'commercial' bucket so an IBX packet routes to
    // its overlay; the 'highmark' bucket catches that brand earlier, so IBX is
    // matched only by its own 'independence blue cross' / 'ibx' anchors. Generic
    // 'blue cross' / 'blue shield' and other Blues licensees stay in the
    // commercial fall-through. An explicit "Medicare Advantage" string still
    // wins the MA bucket earlier. Like the other commercial buckets, the overlay
    // rules self-gate on requested services, not on the line of business.
    bucket: 'ibx',
    anchors: [
      'independence blue cross',
      'independence administrators',
      'ibx',
    ],
  },
  {
    // The twelfth named commercial overlay (spec-v52 §4.5.18, wave 52-18).
    // CareFirst BlueCross BlueShield is the dominant Blues licensee in the
    // mid-Atlantic (Maryland, the District of Columbia, and Northern Virginia)
    // and one of the largest independent licensees not routed to the
    // Anthem/Elevance, HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of
    // California, or IBX buckets. Placed before the generic 'commercial' bucket
    // so a CareFirst packet routes to its overlay. The single unambiguous brand
    // anchor 'carefirst' is used (it is a distinct trade name, not a generic
    // Blues phrase), so generic 'blue cross' / 'blue shield' and other Blues
    // licensees stay in the commercial fall-through. An explicit "Medicare
    // Advantage" string still wins the MA bucket earlier; a plain CareFirst MA
    // packet without that string routes here, which is acceptable (the overlay
    // rules self-gate on requested services, not on the line of business).
    bucket: 'carefirst',
    anchors: [
      'carefirst',
      'care first',
    ],
  },
  {
    bucket: 'commercial',
    anchors: [
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
