// spec-v676: Lund-Kennedy endoscopic score for chronic rhinosinusitis.
//
// The endoscopic-appearance companion to the built sinus tiles: SNOT-22 (symptoms)
// and Lund-Mackay (CT). Each nasal cavity is scored 0-2 on several variables; the
// left and right sides are summed. Sources:
//   Lund VJ, Kennedy DW. Staging for rhinosinusitis. Otolaryngol Head Neck Surg.
//   1997;117(3 Pt 2):S35-S40 (original: polyps, discharge, edema, scarring, crusting;
//   0-20 total).
//   Psaltis AJ, Li G, Vaezeafshar R, Cho KS, Hwang PH. Modification of the
//   Lund-Kennedy endoscopic scoring system... Laryngoscope. 2014;124(10):2216-2223
//   (modified: polyps, edema, discharge only; 0-12 total).
//
// Scarring and crusting are essentially POST-OPERATIVE findings (adhesions from
// surgery, crusting during mucosal healing), so the modified score drops them for
// general/pre-op use; it had the best reliability and the only correlation with
// SNOT-22 in both operated and unoperated patients. This tile reports BOTH totals and
// treats scarring/crusting as optional (default 0). There is no validated severity
// cutoff; the score is used to grade appearance and track change over time.
//
// Pure: no DOM, no clock, no network.

export const LK_NOTE = 'Lund-Kennedy endoscopic score (Lund VJ, Kennedy DW, Otolaryngol Head Neck Surg 1997; modified by Psaltis AJ, et al., Laryngoscope 2014;124(10):2216-2223). Each nasal cavity is graded 0 to 2 on polyps (0 absent, 1 confined to the middle meatus, 2 beyond the middle meatus), edema (0 absent, 1 mild, 2 severe), and discharge (0 none, 1 clear/thin, 2 thick/purulent); the modified score sums these three across both sides for a total of 0 to 12. The original score adds scarring and crusting (each 0 to 2 per side) for a total of 0 to 20, but those two are essentially post-operative findings (adhesions and mucosal crusting after surgery), so they are optional here and default to 0. Higher scores mean worse endoscopic appearance; the modified score is the more reliable general-use version and the one that correlates with the SNOT-22 symptom score. There is no validated severity cutoff, so the score is used to grade appearance and track change over time rather than to classify a patient, and it supports but does not replace clinical judgment.';

function intIn(v, lo, hi) {
  if (v === '' || v === null || v === undefined) return NaN;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < lo || n > hi) return NaN;
  return n;
}
// Optional post-op variable: blank/undefined -> 0; otherwise must be a valid 0-2.
function optInt(v) {
  if (v === '' || v === null || v === undefined) return 0;
  return intIn(v, 0, 2);
}

const CORE = [
  { key: 'polL', label: 'polyps (left)' }, { key: 'polR', label: 'polyps (right)' },
  { key: 'edeL', label: 'edema (left)' }, { key: 'edeR', label: 'edema (right)' },
  { key: 'disL', label: 'discharge (left)' }, { key: 'disR', label: 'discharge (right)' },
];
const POSTOP = ['scaL', 'scaR', 'cruL', 'cruR'];

export function lundKennedy(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const core = {};
  for (const c of CORE) {
    const v = intIn(o[c.key], 0, 2);
    if (Number.isNaN(v)) {
      return { valid: false, code: 'MISSING_INPUT', field: c.key, message: `Score ${c.label} 0 (absent) to 2 (severe/beyond meatus).` };
    }
    core[c.key] = v;
  }
  const post = {};
  for (const k of POSTOP) {
    const v = optInt(o[k]);
    if (Number.isNaN(v)) {
      return { valid: false, code: 'OUT_OF_RANGE', field: k, message: `Scarring/crusting scores are 0 to 2 (leave blank if not assessed).` };
    }
    post[k] = v;
  }

  const modifiedTotal = core.polL + core.polR + core.edeL + core.edeR + core.disL + core.disR;
  const postopExtra = post.scaL + post.scaR + post.cruL + post.cruR;
  const originalTotal = modifiedTotal + postopExtra;

  const allScores = [core.polL, core.polR, core.edeL, core.edeR, core.disL, core.disR, post.scaL, post.scaR, post.cruL, post.cruR];
  // Flag any anchor-severe finding (a variable scored 2). No validated total cutoff.
  const abnormal = allScores.some((s) => s === 2);

  return {
    valid: true,
    modifiedTotal,
    originalTotal,
    postopExtra,
    abnormal,
    band: `Lund-Kennedy — modified ${modifiedTotal}/12, original ${originalTotal}/20 (higher is worse).`,
    detail: postopExtra > 0
      ? `Modified (polyps + edema + discharge) ${modifiedTotal}/12; scarring + crusting add ${postopExtra} for an original total of ${originalTotal}/20.`
      : `Modified (polyps + edema + discharge) ${modifiedTotal}/12; no scarring/crusting entered, so the original total equals ${originalTotal}/20.`,
    note: LK_NOTE,
  };
}
