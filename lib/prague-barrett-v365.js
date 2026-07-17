// spec-v365: Prague C&M criteria for the endoscopic grading of Barrett's esophagus — the standardized
// notation for the circumferential (C) and maximal (M) extent, in centimeters above the
// gastroesophageal junction, of the columnar-lined (Barrett's) segment. The catalog has GI-endoscopy
// tiles (Forrest, Rutgeerts, LA esophagitis, Tokyo, etc.) but no Barrett's-extent grading. "prague
// criteria" / "prague c m" / "barrett esophagus length" routed to nothing.
//
// HIGH-STAKES: this reports the Prague NOTATION from the extents the endoscopist has measured, NOT a
// diagnosis (Barrett's requires biopsy-confirmed intestinal metaplasia), a dysplasia grade, or a
// surveillance-interval order (spec-v11 §5.3). The management/surveillance decision stays with the
// gastroenterologist.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Sharma P, Dent J, Armstrong D, et al. The development and validation of an endoscopic grading
//     system for Barrett's esophagus: the Prague C & M criteria. Gastroenterology. 2006;131(5):1392-1399.
//   - GI-endoscopy references reproducing C = circumferential extent, M = maximal extent (both cm above
//     the GEJ), with M >= C by definition.
//
// C = the circumferential extent (cm above the GEJ). M = the maximal extent, including the longest
// tongue (cm above the GEJ). M is at least as long as C. The Prague system standardized the measurement
// and de-emphasized the older short-/long-segment (3 cm) split; the long-segment descriptor (M >= 3 cm)
// is reported here as a secondary, traditional note only.

function num(v) {
  if (v === '' || v == null) return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

// input:
//   c: circumferential extent, cm above the GEJ
//   m: maximal extent, cm above the GEJ (must be >= c)
export function pragueBarrett(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const c = num(o.c);
  const m = num(o.m);
  if (Number.isNaN(c) || Number.isNaN(m)) {
    return { valid: false, message: 'Enter the circumferential (C) and maximal (M) extent in cm above the GEJ.' };
  }
  if (c < 0 || m < 0 || c > 25 || m > 25) {
    return { valid: false, message: 'Enter a plausible extent in cm (0-25).' };
  }
  if (m < c) {
    return { valid: false, message: 'The maximal extent (M) must be at least as long as the circumferential extent (C).' };
  }
  const longSegment = m >= 3;
  const notation = `Prague C${c} M${m}`;
  return {
    valid: true,
    c,
    m,
    longSegment,
    abnormal: longSegment,
    segment: longSegment ? 'long-segment' : 'short-segment',
    bandLabel: notation,
    band: `${notation} - a columnar-lined (Barrett's) segment ${c} cm circumferential and ${m} cm maximal extent above the gastroesophageal junction; ${longSegment ? 'long-segment (M >= 3 cm)' : 'short-segment (M < 3 cm)'} by the traditional descriptor.`,
    note: 'The Prague C&M criteria (Sharma 2006) standardize the endoscopic grading of Barrett\'s esophagus: C is the circumferential extent and M the maximal extent (including the longest tongue), both in cm above the gastroesophageal junction, with M at least as long as C. The Prague system is the measurement itself; the older short-segment (M < 3 cm) / long-segment (M >= 3 cm) split is a secondary, traditional descriptor. Barrett\'s requires biopsy-confirmed intestinal metaplasia; this reports the extent notation, not a diagnosis, a dysplasia grade, or a surveillance-interval decision.',
  };
}
