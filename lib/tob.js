// spec-v4 §5 utility 86: Type of Bill decoder.
// Decomposes a 3- or 4-digit NUBC TOB into Type of Facility, Bill
// Classification, and Frequency lookups using the bundled
// data/tob-codes/tob.json structural table.

export function decodeTob(input, table) {
  const raw = String(input || '').trim();
  if (!/^\d{3,4}$/.test(raw)) {
    return { ok: false, error: 'Enter a 3- or 4-digit Type of Bill (TOB).' };
  }
  // 4-digit TOBs include the leading "0"; the structural digits are positions 2/3/4.
  const padded = raw.length === 3 ? '0' + raw : raw;
  const facilityDigit = padded[1];
  const billClassDigit = padded[2];
  const frequencyDigit = padded[3];
  const find = (rows, d) => (rows || []).find((r) => r.digit === d) || null;
  return {
    ok: true,
    input: padded,
    facility: find(table.facilityType, facilityDigit),
    classification: find(table.billClassification, billClassDigit),
    frequency: find(table.frequency, frequencyDigit),
  };
}
