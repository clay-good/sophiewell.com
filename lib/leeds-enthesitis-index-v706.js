// spec-v706: Leeds Enthesitis Index (LEI).
//
// A count of tender entheses used mainly in psoriatic arthritis. A companion to the built
// MASES enthesitis index (a different, 13-site instrument). Source:
//   Healy PJ, Helliwell PS. Measuring clinical enthesitis in psoriatic arthritis: assessment
//   of existing measures and development of an instrument specific to psoriatic arthritis.
//   Arthritis Rheum. 2008;59(5):686-691. (PMID 18438903.)
//
// Six sites, each scored tender (1) or non-tender (0), summed to a total of 0-6:
//   Left and right lateral epicondyle of the humerus
//   Left and right medial femoral condyle
//   Left and right Achilles tendon insertion
//
// There are no formal severity bands; the total is a count of involved entheses used to
// gauge burden and track change.
//
// Pure: no DOM, no clock, no network.

export const LEI_NOTE = 'Leeds Enthesitis Index (LEI) (Healy PJ, Helliwell PS, Arthritis Rheum 2008;59(5):686-691), a count of tender entheses used mainly in psoriatic arthritis. Six sites are each scored tender (1) or non-tender (0) on palpation and summed to a total of 0 to 6: the left and right lateral epicondyle of the humerus, the left and right medial femoral condyle, and the left and right Achilles tendon insertion. There are no formal severity cut-points; the total is a count of involved entheses used to gauge entheseal burden and to track change over time, and a score above 0 indicates clinical enthesitis at one or more of these sites. It assesses only these six sites (unlike broader indices such as MASES) and supports rather than replaces the full rheumatologic assessment.';

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

const SITES = [
  { key: 'leftEpicondyle', label: 'left lateral epicondyle' },
  { key: 'rightEpicondyle', label: 'right lateral epicondyle' },
  { key: 'leftFemoralCondyle', label: 'left medial femoral condyle' },
  { key: 'rightFemoralCondyle', label: 'right medial femoral condyle' },
  { key: 'leftAchilles', label: 'left Achilles insertion' },
  { key: 'rightAchilles', label: 'right Achilles insertion' },
];

export function leedsEnthesitisIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let total = 0;
  const factors = [];
  for (const s of SITES) {
    if (truthy(o[s.key])) { total += 1; factors.push(s.label); }
  }

  const present = total > 0;
  return {
    valid: true,
    score: total,
    tier: present ? 'enthesitis' : 'none',
    abnormal: present,
    factors,
    bandLabel: `LEI ${total} of 6`,
    band: `LEI ${total} of 6 — ${present ? `enthesitis at ${total} of 6 site${total === 1 ? '' : 's'}` : 'no tender entheses at these sites'}.`,
    detail: present
      ? 'Tender entheses counted (0-6). No formal severity bands; used to gauge burden and track change over time.'
      : 'No tender entheses at the six Leeds sites. This assesses only these six sites (unlike broader indices such as MASES).',
    note: LEI_NOTE,
  };
}
