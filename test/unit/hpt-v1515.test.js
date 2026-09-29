import test from 'node:test';
import assert from 'node:assert/strict';
import { HPT_ATTESTATION, validateJsonDocument } from '../../lib/hpt-v1515.js';
import { validateHptCsvStream, validateHptJsonStream } from '../../lib/hpt-stream-v1515.js';

function metadata() {
  return {
    hospital_name: 'Example Hospital', last_updated_on: '2026-09-28', version: '3.0.0',
    location_name: ['Main campus'], hospital_address: ['1 Main St'], type_2_npi: ['1234567893'],
    license_information: { license_number: '123', state: 'TX' },
    attestation: { attestation: HPT_ATTESTATION, confirm_attestation: true, attester_name: 'Alex Example' },
  };
}

function jsonDocument() {
  return {
    ...metadata(),
    standard_charge_information: [{
      description: 'Clinic visit', code_information: [{ code: '99213', type: 'CPT' }],
      standard_charges: [{ setting: 'outpatient', gross_charge: 150 }],
    }],
  };
}

function csv(rows) {
  return rows.map((row) => row.map((value) => {
    const text = String(value ?? ''); return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  }).join(',')).join('\r\n');
}

function tallCsv(dataRows) {
  const general = ['hospital_name', 'last_updated_on', 'version', 'location_name', 'hospital_address', 'license_number|TX', 'type_2_npi', HPT_ATTESTATION, 'attester_name'];
  const values = ['Example Hospital', '2026-09-28', '3.0.0', 'Main campus', '1 Main St', '123', '1234567893', 'true', 'Alex Example'];
  const headers = ['description', 'code|1', 'code|1|type', 'modifiers', 'setting', 'drug_unit_of_measurement', 'drug_type_of_measurement', 'standard_charge|gross', 'standard_charge|discounted_cash', 'payer_name', 'plan_name', 'standard_charge|negotiated_dollar', 'standard_charge|negotiated_percentage', 'standard_charge|negotiated_algorithm', 'median_amount', '10th_percentile', '90th_percentile', 'count', 'standard_charge|methodology', 'standard_charge|min', 'standard_charge|max', 'additional_generic_notes'];
  return csv([general, values, headers, ...dataRows]);
}

test('JSON v3 stream accepts a valid document across one-byte token boundaries', async () => {
  const bytes = new TextEncoder().encode(JSON.stringify(jsonDocument())); let offset = 0;
  const source = { stream: () => new ReadableStream({ pull(controller) { if (offset === bytes.length) controller.close(); else controller.enqueue(bytes.slice(offset, ++offset)); } }) };
  const result = await validateHptJsonStream(source);
  assert.equal(result.valid, true); assert.equal(result.rowCount, 1); assert.deepEqual(result.findings, []);
});

test('JSON v3 reports the new attestation, NPI and allowed-amount requirements', () => {
  const input = jsonDocument(); input.type_2_npi = []; input.attestation.confirm_attestation = false;
  input.standard_charge_information[0].standard_charges = [{
    setting: 'outpatient', payers_information: [{ payer_name: 'Payer', plan_name: 'Plan', methodology: 'other', standard_charge_algorithm: 'formula', count: '11' }],
  }];
  const findings = validateJsonDocument(input);
  for (const code of ['required', 'attestation_not_confirmed', 'missing_notes', 'invalid_number']) assert.ok(findings.some((finding) => finding.code === code), code);
});

test('CSV tall stream accepts quoted newlines and valid payer charge rules', async () => {
  const input = tallCsv([['Clinic\nvisit', '99213', 'CPT', '', 'outpatient', '', '', '150', '', 'Payer', 'Plan', '100', '', '', '', '', '', '', 'fee schedule', '80', '120', '']]);
  const result = await validateHptCsvStream(new Blob([input]));
  assert.equal(result.valid, true); assert.equal(result.format, 'CSV tall'); assert.equal(result.rowCount, 1);
});

test('CSV tall reports placeholders and missing percentile values', async () => {
  const input = tallCsv([['Clinic visit', '99213', 'CPT', '', 'outpatient', '', '', '', '', 'Payer', 'Plan', '', '70', '', '', '', '', '11', 'other', '', '', '']]).replace('code|1,code|1|type', 'code|[i],code|[i]|type');
  const result = await validateHptCsvStream(new Blob([input]));
  assert.equal(result.valid, false);
  for (const code of ['placeholder', 'code_headers', 'missing_notes', 'required']) assert.ok(result.findings.some((finding) => finding.code === code), code);
});

test('CSV wide groups every required payer and plan column', async () => {
  const general = ['hospital_name', 'last_updated_on', 'version', 'location_name', 'hospital_address', 'license_number|TX', 'type_2_npi', HPT_ATTESTATION, 'attester_name'];
  const values = ['Example Hospital', '2026-09-28', '3.0.0', 'Main campus', '1 Main St', '123', '1234567893', 'true', 'Alex Example'];
  const payer = 'Example Payer|Example Plan';
  const headers = ['description', 'code|1', 'code|1|type', 'modifiers', 'setting', 'drug_unit_of_measurement', 'drug_type_of_measurement', 'standard_charge|gross', 'standard_charge|discounted_cash', `standard_charge|${payer}|negotiated_dollar`, `standard_charge|${payer}|negotiated_percentage`, `standard_charge|${payer}|negotiated_algorithm`, `median_amount|${payer}`, `10th_percentile|${payer}`, `90th_percentile|${payer}`, `count|${payer}`, `standard_charge|${payer}|methodology`, `additional_payer_notes|${payer}`, 'standard_charge|min', 'standard_charge|max', 'additional_generic_notes'];
  const row = ['Clinic visit', '99213', 'CPT', '', 'outpatient', '', '', '150', '', '', '70', '', '100', '80', '120', '11', 'percent of total billed charges', '', '', '', ''];
  const result = await validateHptCsvStream(new Blob([csv([general, values, headers, row])]));
  assert.equal(result.valid, true); assert.equal(result.format, 'CSV wide');
});

test('CSV modifier-only rows use the CMS conditional rule instead of item rules', async () => {
  const row = ['Bilateral procedure', '', '', '50', 'both', '', '', '', '', 'Payer', 'Plan', '', '150', '', '', '', '', '', '', '', '', 'Payment adjustment for the item carrying this modifier'];
  const result = await validateHptCsvStream(new Blob([tallCsv([row])]));
  assert.equal(result.valid, true); assert.equal(result.rowCount, 1);
});

test('CSV stream validates many rows without a whole-file parse', async () => {
  const row = ['Clinic visit', '99213', 'CPT', '', 'outpatient', '', '', '150', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
  const input = tallCsv(Array.from({ length: 20000 }, () => row));
  const result = await validateHptCsvStream(new Blob([input]));
  assert.equal(result.valid, true); assert.equal(result.rowCount, 20000);
});
