// spec-v369: Nohria-Stevenson clinical hemodynamic profiles for acute heart failure (A / B / C / L) —
// the bedside 2x2 classification by CONGESTION (dry vs wet) and PERFUSION (warm vs cold), the clinical
// counterpart to the invasive Forrester classification already in the catalog. "nohria stevenson" /
// "warm and wet heart failure" / "hemodynamic profile heart failure" routed to nothing.
//
// HIGH-STAKES: this reports the PROFILE from the congestion and perfusion the clinician has assessed at
// the bedside, NOT a diagnosis, a treatment decision, or a prognosis for an individual patient
// (spec-v11 §5.3). The profile-guided therapy (e.g. diuresis for wet, inotropes/afterload reduction for
// cold) is the classically taught association, not an order; the management decision stays with the
// treating clinician.
//
// PROFILES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Nohria A, Tsang SW, Fang JC, et al. Clinical assessment identifies hemodynamic profiles that
//     predict outcomes in patients admitted with heart failure. J Am Coll Cardiol. 2003;41(10):1797-1804.
//   - Heart-failure references reproducing the same A (dry-warm) / B (wet-warm) / C (wet-cold) / L
//     (dry-cold) profiles, with the cold profiles carrying the worst outcomes.
//
// Congestion signs (wet): orthopnea, elevated JVP, edema, ascites, rales, S3. Perfusion signs (cold):
// narrow pulse pressure, cool extremities, altered mentation, symptomatic hypotension, worsening renal
// function.
//
// Profiles:
//   A : dry and warm - no congestion, adequate perfusion (compensated).
//   B : wet and warm - congestion with adequate perfusion (the most common ADHF profile). Flagged.
//   C : wet and cold - congestion with hypoperfusion; the worst outcomes. Flagged.
//   L : dry and cold - hypoperfusion without congestion (low output). Flagged.

function key(congestion, perfusion) {
  const wet = congestion === 'wet';
  const cold = perfusion === 'cold';
  if (!wet && !cold) return 'A';
  if (wet && !cold) return 'B';
  if (wet && cold) return 'C';
  return 'L';
}

const PROFILES = {
  A: { profile: 'A', compensated: true, text: 'Nohria-Stevenson profile A - dry and warm: no congestion and adequate perfusion (compensated).' },
  B: { profile: 'B', compensated: false, text: 'Nohria-Stevenson profile B - wet and warm: congestion with adequate perfusion; the most common acute-decompensated-heart-failure profile.' },
  C: { profile: 'C', compensated: false, text: 'Nohria-Stevenson profile C - wet and cold: congestion with hypoperfusion; associated with the worst outcomes.' },
  L: { profile: 'L', compensated: false, text: 'Nohria-Stevenson profile L - dry and cold: hypoperfusion without congestion (low output).' },
};

const NOTE = 'The Nohria-Stevenson classification (Nohria 2003) assigns a bedside hemodynamic profile in acute heart failure from congestion (dry vs wet) and perfusion (warm vs cold). Wet signs: orthopnea, elevated JVP, edema, rales, S3. Cold signs: narrow pulse pressure, cool extremities, altered mentation, hypotension. A dry-warm (compensated); B wet-warm (congested); C wet-cold (congested + hypoperfused, worst outcomes); L dry-cold (low output). It is the clinical counterpart to the invasive Forrester classification. The profile-guided therapy pattern (diurese the wet, support the cold) is the classically taught association, not an order. This reports the profile from the entered signs, not a diagnosis, a treatment decision, or a prognosis.';

const CONG = { DRY: 'dry', WET: 'wet' };
const PERF = { WARM: 'warm', COLD: 'cold' };

// input:
//   congestion: 'dry' / 'wet'
//   perfusion:  'warm' / 'cold'
export function nohriaStevenson(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const congestion = CONG[String(o.congestion == null ? '' : o.congestion).trim().toUpperCase()];
  const perfusion = PERF[String(o.perfusion == null ? '' : o.perfusion).trim().toUpperCase()];
  if (!congestion || !perfusion) {
    return { valid: false, message: 'Select congestion (dry or wet) and perfusion (warm or cold).' };
  }
  const p = PROFILES[key(congestion, perfusion)];
  return {
    valid: true,
    profile: p.profile,
    congestion,
    perfusion,
    compensated: p.compensated,
    abnormal: !p.compensated,
    bandLabel: `Nohria-Stevenson profile ${p.profile}`,
    band: p.text,
    note: NOTE,
  };
}
