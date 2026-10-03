// spec-v1624 step 2 / spec-v1613 §1: coded values from FHIR -- a Bundle,
// NDJSON, or single resources. Observations with a LOINC coding and a
// valueQuantity (and the systolic/diastolic components of a blood pressure
// panel, LOINC 85354-9), with their time; Patient.birthDate and gender.

const LOINC = 'http://loinc.org';
const SKIP = new Set(['entered-in-error', 'cancelled']);

const loincCodes = (cc) => ((cc && cc.coding) || []).filter((c) => c.system === LOINC && c.code).map((c) => c.code);
const when = (o) => String(o.effectiveDateTime || (o.effectivePeriod && o.effectivePeriod.start) || o.effectiveInstant || o.issued || '').slice(0, 10) || null;
const quantity = (q) => (q && Number.isFinite(Number(q.value)) ? { value: Number(q.value), unit: q.code || q.unit || '' } : null);

// resources(input) -> the FHIR resources in a parsed Bundle, a single
// resource, an array, or NDJSON text.
export function resources(input) {
  if (typeof input === 'string') {
    const t = input.trim();
    if (t.startsWith('{') && !t.includes('\n{')) return resources(JSON.parse(t));
    return t.split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l));
  }
  if (Array.isArray(input)) return input.flatMap(resources);
  if (input && input.resourceType === 'Bundle') return (input.entry || []).map((e) => e.resource).filter(Boolean).flatMap(resources);
  return input && input.resourceType ? [input] : [];
}

export function readFhir(input) {
  const observations = [];
  let birthDate = null;
  let sex = null;
  for (const r of resources(input)) {
    if (r.resourceType === 'Patient') {
      if (r.birthDate) birthDate = String(r.birthDate).slice(0, 10);
      sex = r.gender === 'female' ? 'F' : r.gender === 'male' ? 'M' : sex;
      continue;
    }
    if (r.resourceType !== 'Observation' || SKIP.has(r.status)) continue;
    const at = when(r);
    const q = quantity(r.valueQuantity);
    if (q) for (const code of loincCodes(r.code)) observations.push({ system: 'LOINC', code, ...q, at });
    for (const comp of r.component || []) {
      const cq = quantity(comp.valueQuantity);
      if (cq) for (const code of loincCodes(comp.code)) observations.push({ system: 'LOINC', code, ...cq, at });
    }
  }
  return { observations, birthDate, sex };
}
