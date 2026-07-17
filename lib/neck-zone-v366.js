// spec-v366: anatomic zones of the neck for penetrating neck trauma (Zones I-III) — the classic
// division of the neck used to describe the location of a penetrating injury and the structures at
// risk. The catalog has trauma scores (ISS/RTS, TRISS, MESS) but no neck-zone reference. "neck zone" /
// "penetrating neck trauma zone" / "zone 2 neck" routed to nothing.
//
// HIGH-STAKES: this reports the ANATOMIC ZONE the clinician has identified, NOT a diagnosis, a
// management decision, or a prognosis (spec-v11 §5.3). Any penetrating neck injury is high-stakes; the
// modern "no-zone" approach drives management by hard signs of injury and hemodynamic stability with CT
// angiography, rather than by zone alone. The management decision stays with the trauma team.
//
// BOUNDARIES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Monson/Roon-Christensen zone description as reproduced in StatPearls (Neck Trauma), EAST practice
//     guidelines, and Radiopaedia: three zones bounded by the cricoid cartilage and the angle of the
//     mandible.
//
// Zones (structures at risk / surgical-access consideration):
//   I   : sternal notch / clavicles to the cricoid cartilage - aortic arch, subclavian and proximal
//         carotid vessels, lung apices, trachea, esophagus, thoracic duct. Treated like an upper
//         thoracic injury; proximal control may need sternotomy/thoracotomy.
//   II  : cricoid cartilage to the angle of the mandible - common/internal/external carotid arteries,
//         jugular veins, larynx, hypopharynx, proximal esophagus. The most surgically accessible zone.
//   III : angle of the mandible to the base of the skull - distal internal/external carotid, vertebral
//         artery, jugular veins, pharynx. Treated like a head injury; distal exposure may need
//         mandibular subluxation or craniotomy.

const ZONES = {
  I: { zone: 'I', text: 'Neck Zone I - sternal notch / clavicles to the cricoid cartilage; structures at risk include the aortic arch, subclavian and proximal carotid vessels, lung apices, trachea, esophagus, and thoracic duct. Treated like an upper thoracic injury; proximal vascular control may require sternotomy or thoracotomy.' },
  II: { zone: 'II', text: 'Neck Zone II - cricoid cartilage to the angle of the mandible; structures at risk include the common, internal, and external carotid arteries, jugular veins, larynx, hypopharynx, and proximal esophagus. The most surgically accessible zone.' },
  III: { zone: 'III', text: 'Neck Zone III - angle of the mandible to the base of the skull; structures at risk include the distal internal and external carotid arteries, the vertebral artery, jugular veins, and pharynx. Treated like a head injury; distal exposure may require mandibular subluxation or craniotomy.' },
};

const NOTE = 'The neck is divided into three anatomic zones for penetrating trauma. Zone I: sternal notch to cricoid cartilage. Zone II: cricoid to the angle of the mandible. Zone III: angle of the mandible to the skull base. The zone describes the structures at risk and the surgical-access considerations. The modern "no-zone" approach drives management by hard signs of injury and hemodynamic stability with CT angiography, rather than by zone alone. This reports the zone the clinician has identified, not a diagnosis, a management decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III',
  1: 'I', 2: 'II', 3: 'III',
};

// input:
//   zone: 'I' / 'II' / 'III' (case-insensitive; also accepts 1-3)
export function neckZone(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.zone == null ? '' : o.zone).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const z = ZONES[key];
  if (!z) {
    return { valid: false, message: 'Select the neck zone (I, II, or III; equivalently 1-3).' };
  }
  return {
    valid: true,
    zone: z.zone,
    abnormal: false,
    bandLabel: `Neck Zone ${z.zone}`,
    band: z.text,
    note: NOTE,
  };
}
