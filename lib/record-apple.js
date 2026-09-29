// spec-v1624 step 2 / spec-v1613 §1: body measurements from an Apple Health
// export.xml -- Record elements for body mass, height, BMI and blood
// pressure, with their dates, and the Me element's birth date and sex. The
// file is often hundreds of megabytes, so it is read as a stream of text
// chunks; no element is ever held beyond the one being read.

export const HK = {
  HKQuantityTypeIdentifierBodyMass: 'body-weight',
  HKQuantityTypeIdentifierHeight: 'body-height',
  HKQuantityTypeIdentifierBodyMassIndex: 'bmi',
  HKQuantityTypeIdentifierBloodPressureSystolic: 'systolic-bp',
  HKQuantityTypeIdentifierBloodPressureDiastolic: 'diastolic-bp',
};

const attr = (tag, name) => { const m = new RegExp(`\\b${name}="([^"]*)"`).exec(tag); return m ? m[1] : null; };

// readApple(chunks) -> { observations, birthDate, sex }. `chunks` is a string
// or an (async) iterable of strings.
export async function readApple(chunks) {
  const observations = [];
  let birthDate = null;
  let sex = null;
  let buf = '';
  const take = (final) => {
    let i;
    while ((i = buf.search(/<(Record|Me)\b/)) !== -1) {
      const end = buf.indexOf('>', i);
      if (end === -1) break;
      const tag = buf.slice(i, end + 1);
      buf = buf.slice(end + 1);
      if (tag.startsWith('<Me')) {
        birthDate = attr(tag, 'HKCharacteristicTypeIdentifierDateOfBirth') || birthDate;
        const s = attr(tag, 'HKCharacteristicTypeIdentifierBiologicalSex');
        sex = s === 'HKBiologicalSexFemale' ? 'F' : s === 'HKBiologicalSexMale' ? 'M' : sex;
        continue;
      }
      const type = attr(tag, 'type');
      if (!HK[type]) continue;
      const value = Number(attr(tag, 'value'));
      if (!Number.isFinite(value)) continue;
      observations.push({ system: 'HealthKit', code: type, value, unit: attr(tag, 'unit') || '', at: String(attr(tag, 'startDate') || '').slice(0, 10) || null });
    }
    // Keep only a possible partial tag at the end.
    const last = buf.lastIndexOf('<');
    buf = final ? '' : (last === -1 ? '' : buf.slice(last));
  };
  if (typeof chunks === 'string') { buf = chunks; take(true); }
  else for await (const c of chunks) { buf += c; take(false); }
  if (buf) take(true);
  return { observations, birthDate, sex };
}
