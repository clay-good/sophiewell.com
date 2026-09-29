// spec-v1515: CMS Hospital Price Transparency v3.0.0 structural validation.
// Source snapshot: CMSgov/hospital-price-transparency commit 5333564a710f80d7740180b9ffab8dbdcba9b502.
export const HPT_VERSION = '3.0.0';
export const HPT_ATTESTATION = 'To the best of its knowledge and belief, this hospital has included all applicable standard charge information in accordance with the requirements of 45 CFR 180.50, and the information encoded is true, accurate, and complete as of the date in the file. This hospital has included all payer-specific negotiated charges in dollars that can be expressed as a dollar amount. For payer-specific negotiated charges that cannot be expressed as a dollar amount in the machine-readable file or not knowable in advance, the hospital attests that the payer-specific negotiated charge is based on a contractual algorithm, percentage or formula that precludes the provision of a dollar amount and has provided all necessary information available to the hospital for the public to be able to derive the dollar amount, including, but not limited to, the specific fee schedule or components referenced in such percentage, algorithm or formula.';

const CODE_TYPES = new Set(['CPT', 'HCPCS', 'ICD', 'DRG', 'MS-DRG', 'R-DRG', 'S-DRG', 'APS-DRG', 'AP-DRG', 'APR-DRG', 'TRIS-DRG', 'APC', 'NDC', 'HIPPS', 'LOCAL', 'EAPG', 'CDT', 'RC', 'CDM', 'CMG', 'MS-LTC-DRG']);
const DRUG_TYPES = new Set(['GR', 'ML', 'ME', 'UN', 'F2', 'GM', 'EA']);
const METHODS = new Set(['case rate', 'fee schedule', 'percent of total billed charges', 'per diem', 'other']);
const SETTINGS = new Set(['inpatient', 'outpatient', 'both']);
const STATES = new Set('AL AK AS AZ AR CA CO CT DE DC FM FL GA GU HI ID IL IN IA KS KY LA ME MH MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND MP OH OK OR PW PA PR RI SC SD TN TX UT VT VI VA WA WV WI WY'.split(' '));
const COUNT = /^(0|1 through 10|1[1-9]|[2-9]\d+|[1-9]\d{2,})$/;

function object(value) { return value && typeof value === 'object' && !Array.isArray(value); }
function present(value) { return value !== '' && value !== null && value !== undefined; }
function text(value) { return typeof value === 'string' && value.trim() !== ''; }
function positive(value) { return typeof value === 'number' && Number.isFinite(value) && value > 0; }
function csvPositive(value) { return value === '' || (Number.isFinite(Number(value)) && Number(value) > 0); }
function normalized(value) { return String(value ?? '').trim().toLowerCase(); }
function header(value) { return normalized(value).split('|').map((part) => part.trim()).join('|'); }

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function validCsvDate(value) {
  if (validDate(value)) return true;
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(value || ''));
  if (!match) return false;
  return validDate(`${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`);
}

function checkNpis(values, location, add) {
  const list = Array.isArray(values) ? values : String(values || '').split('|');
  if (!list.length || list.some((value) => !text(value))) add('required', location, 'At least one Type 2 NPI is required.');
}

function requireText(value, location, label, add) {
  if (!text(value)) add('required', location, `${label} is required.`);
}

function requirePositive(value, location, label, add) {
  if (!positive(value)) add('invalid_number', location, `${label} must be a number greater than 0.`);
}

export function validateJsonMetadata(root, add) {
  if (!object(root)) { add('invalid_root', '$', 'The JSON root must be an object.'); return; }
  requireText(root.hospital_name, '$.hospital_name', 'Hospital name', add);
  if (!validDate(root.last_updated_on)) add('invalid_date', '$.last_updated_on', 'MRF date must be a real ISO 8601 date in YYYY-MM-DD form.');
  if (root.version !== HPT_VERSION) add('wrong_version', '$.version', `CMS template version must be ${HPT_VERSION}.`);
  for (const [key, label] of [['location_name', 'Hospital location'], ['hospital_address', 'Hospital address']]) {
    if (!Array.isArray(root[key]) || !root[key].length || root[key].some((value) => !text(value))) add('required', `$.${key}`, `${label} must be a nonempty array of strings.`);
  }
  if (!Array.isArray(root.type_2_npi)) add('invalid_type', '$.type_2_npi', 'Type 2 NPIs must be a nonempty array of strings.');
  else checkNpis(root.type_2_npi, '$.type_2_npi', add);
  if (!object(root.license_information) || !STATES.has(root.license_information.state)) add('invalid_state', '$.license_information.state', 'License state must be a CMS-listed two-letter state or territory code.');
  else if (Object.hasOwn(root.license_information, 'license_number') && !text(root.license_information.license_number)) add('invalid_type', '$.license_information.license_number', 'An entered license number must be a nonempty string.');
  const attestation = root.attestation;
  if (!object(attestation)) add('required', '$.attestation', 'The CMS attestation object is required.');
  else {
    if (attestation.attestation !== HPT_ATTESTATION) add('invalid_attestation', '$.attestation.attestation', 'Use the exact CMS v3.0.0 attestation statement.');
    if (attestation.confirm_attestation !== true) add('attestation_not_confirmed', '$.attestation.confirm_attestation', 'The attestation must be confirmed as true.');
    requireText(attestation.attester_name, '$.attestation.attester_name', 'Attester name', add);
  }
}

function validatePayer(payer, location, add) {
  if (!object(payer)) { add('invalid_type', location, 'Payer information must be an object.'); return; }
  requireText(payer.payer_name, `${location}.payer_name`, 'Payer name', add);
  requireText(payer.plan_name, `${location}.plan_name`, 'Plan name', add);
  const method = normalized(payer.methodology);
  if (!METHODS.has(method)) add('invalid_enum', `${location}.methodology`, 'Methodology must be case rate, fee schedule, percent of total billed charges, per diem, or other.');
  const dollar = present(payer.standard_charge_dollar); const percent = present(payer.standard_charge_percentage); const algorithm = present(payer.standard_charge_algorithm);
  if (!dollar && !percent && !algorithm) add('missing_charge', location, 'Enter a negotiated dollar amount, percentage, or algorithm.');
  if (dollar) requirePositive(payer.standard_charge_dollar, `${location}.standard_charge_dollar`, 'Negotiated dollar amount', add);
  if (percent) requirePositive(payer.standard_charge_percentage, `${location}.standard_charge_percentage`, 'Negotiated percentage', add);
  if (algorithm) requireText(payer.standard_charge_algorithm, `${location}.standard_charge_algorithm`, 'Negotiated algorithm', add);
  if (method === 'other' && !text(payer.additional_payer_notes)) add('missing_notes', `${location}.additional_payer_notes`, 'Methodology "other" requires an explanation.');
  if (percent || algorithm) {
    if (!COUNT.test(String(payer.count ?? ''))) add('invalid_count', `${location}.count`, 'Count must be 0, "1 through 10," or a whole number 11 or greater.');
    if (String(payer.count) === '0') {
      if (!text(payer.additional_payer_notes)) add('missing_notes', `${location}.additional_payer_notes`, 'A zero allowed-amount count requires an explanation.');
    } else {
      for (const [key, label] of [['10th_percentile', '10th percentile'], ['median_amount', 'Median amount'], ['90th_percentile', '90th percentile']]) requirePositive(payer[key], `${location}.${key}`, label, add);
    }
  }
  return { dollar };
}

export function validateJsonStandardItem(item, index, add) {
  const base = `$.standard_charge_information[${index}]`;
  if (!object(item)) { add('invalid_type', base, 'Each standard charge item must be an object.'); return; }
  requireText(item.description, `${base}.description`, 'Description', add);
  if (!Array.isArray(item.code_information) || !item.code_information.length) add('required', `${base}.code_information`, 'At least one billing code and type is required.');
  let ndc = false;
  (Array.isArray(item.code_information) ? item.code_information : []).forEach((code, codeIndex) => {
    const at = `${base}.code_information[${codeIndex}]`;
    if (!object(code)) { add('invalid_type', at, 'Code information must be an object.'); return; }
    requireText(code.code, `${at}.code`, 'Billing code', add);
    if (!CODE_TYPES.has(code.type)) add('invalid_enum', `${at}.type`, `Unsupported code type ${code.type || '(blank)'}.`);
    if (code.type === 'NDC') ndc = true;
  });
  if (ndc) {
    if (!object(item.drug_information)) add('required', `${base}.drug_information`, 'NDC items require drug unit and type.');
    else {
      requirePositive(item.drug_information.unit, `${base}.drug_information.unit`, 'Drug unit', add);
      if (!DRUG_TYPES.has(item.drug_information.type)) add('invalid_enum', `${base}.drug_information.type`, 'Drug type is not a CMS v3.0.0 value.');
    }
  }
  if (!Array.isArray(item.standard_charges) || !item.standard_charges.length) { add('required', `${base}.standard_charges`, 'At least one standard charge is required.'); return; }
  item.standard_charges.forEach((charge, chargeIndex) => {
    const at = `${base}.standard_charges[${chargeIndex}]`;
    if (!object(charge)) { add('invalid_type', at, 'Standard charge must be an object.'); return; }
    if (!SETTINGS.has(normalized(charge.setting))) add('invalid_enum', `${at}.setting`, 'Setting must be inpatient, outpatient, or both.');
    for (const [key, label] of [['gross_charge', 'Gross charge'], ['discounted_cash', 'Discounted cash price'], ['minimum', 'Minimum negotiated charge'], ['maximum', 'Maximum negotiated charge']]) if (present(charge[key])) requirePositive(charge[key], `${at}.${key}`, label, add);
    if (present(charge.payers_information) && !Array.isArray(charge.payers_information)) add('invalid_type', `${at}.payers_information`, 'Payer information must be an array.');
    const payers = Array.isArray(charge.payers_information) ? charge.payers_information : [];
    let hasDollar = false; payers.forEach((payer, payerIndex) => { hasDollar ||= Boolean(validatePayer(payer, `${at}.payers_information[${payerIndex}]`, add)?.dollar); });
    if (!present(charge.gross_charge) && !present(charge.discounted_cash) && !payers.length) add('missing_charge', at, 'Enter a gross, discounted cash, or payer-specific charge.');
    if (hasDollar) {
      if (!positive(charge.minimum)) add('required', `${at}.minimum`, 'A negotiated dollar amount requires the de-identified minimum.');
      if (!positive(charge.maximum)) add('required', `${at}.maximum`, 'A negotiated dollar amount requires the de-identified maximum.');
    }
  });
}

export function validateJsonModifier(item, index, add) {
  const base = `$.modifier_information[${index}]`;
  if (!object(item)) { add('invalid_type', base, 'Each modifier item must be an object.'); return; }
  requireText(item.description, `${base}.description`, 'Modifier description', add);
  requireText(item.code, `${base}.code`, 'Modifier code', add);
  if (present(item.setting) && !SETTINGS.has(normalized(item.setting))) add('invalid_enum', `${base}.setting`, 'Setting must be inpatient, outpatient, or both.');
  if (!Array.isArray(item.modifier_payer_information) || !item.modifier_payer_information.length) add('required', `${base}.modifier_payer_information`, 'At least one modifier payer record is required.');
  else item.modifier_payer_information.forEach((payer, payerIndex) => {
    const at = `${base}.modifier_payer_information[${payerIndex}]`;
    if (!object(payer)) { add('invalid_type', at, 'Modifier payer information must be an object.'); return; }
    requireText(payer.payer_name, `${at}.payer_name`, 'Payer name', add);
    requireText(payer.plan_name, `${at}.plan_name`, 'Plan name', add);
    requireText(payer.description, `${at}.description`, 'Modifier payer description', add);
  });
}

export function validateJsonDocument(root) {
  const findings = []; const add = (code, location, message) => findings.push({ code, location, message });
  validateJsonMetadata(root, add);
  if (!Array.isArray(root?.standard_charge_information) || !root.standard_charge_information.length) add('required', '$.standard_charge_information', 'At least one standard charge item is required.');
  else root.standard_charge_information.forEach((item, index) => validateJsonStandardItem(item, index, add));
  if (Array.isArray(root?.modifier_information)) root.modifier_information.forEach((item, index) => validateJsonModifier(item, index, add));
  return findings;
}

function findIndex(headers, name) { return headers.indexOf(name); }
function valueAt(row, state, name) { const index = state.headers.indexOf(name); return index < 0 ? '' : String(row[index] ?? '').trim(); }

export function prepareCsv(generalHeaders, generalValues, dataHeaders, add) {
  const rawGeneral = generalHeaders.map((value) => String(value ?? '').trim()); const general = rawGeneral.map(header);
  const headers = dataHeaders.map(header); const requiredGeneral = ['hospital_name', 'last_updated_on', 'version', 'location_name', 'hospital_address', 'type_2_npi', 'attester_name'];
  for (const name of requiredGeneral) if (!general.includes(name)) add('missing_header', 'row 1', `Missing required header ${name}.`);
  if (!rawGeneral.includes(HPT_ATTESTATION)) add('missing_header', 'row 1', 'Missing the exact CMS v3.0.0 attestation statement header.');
  const license = general.find((name) => /^license_number\|[a-z]{2}$/.test(name));
  if (!license || !STATES.has(license.slice(-2).toUpperCase())) add('missing_header', 'row 1', 'Add license_number|[state] with a valid two-letter state or territory code.');
  if (new Set(general.filter(Boolean)).size !== general.filter(Boolean).length) add('duplicate_header', 'row 1', 'General-data headers must be unique.');
  if (new Set(headers.filter(Boolean)).size !== headers.filter(Boolean).length) add('duplicate_header', 'row 3', 'Charge-data headers must be unique.');
  if ([...general, ...headers].some((name) => /\[[^\]]+\]/.test(name))) add('placeholder', 'headers', 'Replace every bracketed CMS template placeholder with a real value.');
  const generalValue = (name) => { const index = findIndex(general, name); return index < 0 ? '' : String(generalValues[index] ?? '').trim(); };
  for (const [name, label] of [['hospital_name', 'Hospital name'], ['location_name', 'Hospital location'], ['hospital_address', 'Hospital address'], ['attester_name', 'Attester name']]) if (!generalValue(name)) add('required', 'row 2', `${label} is required.`);
  if (!validCsvDate(generalValue('last_updated_on'))) add('invalid_date', 'row 2', 'MRF date must be a real ISO or accepted slash date.');
  if (generalValue('version') !== HPT_VERSION) add('wrong_version', 'row 2', `CMS template version must be ${HPT_VERSION}.`);
  checkNpis(generalValue('type_2_npi'), 'row 2 type_2_npi', add);
  const attestationIndex = rawGeneral.indexOf(HPT_ATTESTATION);
  if (attestationIndex >= 0 && normalized(generalValues[attestationIndex]) !== 'true') add('attestation_not_confirmed', 'row 2 attestation', 'The attestation must be confirmed as true.');
  const requiredData = ['description', 'modifiers', 'setting', 'drug_unit_of_measurement', 'drug_type_of_measurement', 'standard_charge|gross', 'standard_charge|discounted_cash', 'standard_charge|min', 'standard_charge|max', 'additional_generic_notes'];
  for (const name of requiredData) if (!headers.includes(name)) add('missing_header', 'row 3', `Missing required header ${name}.`);
  const codeNumbers = headers.filter((name) => /^code\|\d+$/.test(name)).map((name) => Number(name.split('|')[1])).sort((a, b) => a - b);
  if (!codeNumbers.length || codeNumbers.some((number, index) => number !== index + 1) || codeNumbers.some((number) => !headers.includes(`code|${number}|type`))) add('code_headers', 'row 3', 'Code and code-type headers must use paired sequential numbers starting at 1.');
  const tall = headers.includes('payer_name') || headers.includes('plan_name');
  if (tall) for (const name of ['payer_name', 'plan_name', 'standard_charge|negotiated_dollar', 'standard_charge|negotiated_percentage', 'standard_charge|negotiated_algorithm', 'median_amount', '10th_percentile', '90th_percentile', 'count', 'standard_charge|methodology']) if (!headers.includes(name)) add('missing_header', 'row 3', `Tall CSV is missing ${name}.`);
  const groups = new Map();
  if (!tall) headers.forEach((name, index) => {
    const match = /^(standard_charge|median_amount|10th_percentile|90th_percentile|count|additional_payer_notes)\|([^|]+)\|([^|]+)(?:\|(negotiated_dollar|negotiated_percentage|negotiated_algorithm|methodology))?$/.exec(name);
    if (!match || ['gross', 'discounted_cash', 'min', 'max'].includes(match[2])) return;
    const key = `${match[2]}|${match[3]}`; if (!groups.has(key)) groups.set(key, { payer: match[2], plan: match[3], columns: new Map() });
    const field = match[1] === 'standard_charge' ? match[4] : match[1]; groups.get(key).columns.set(field, index);
  });
  const wideFields = ['negotiated_dollar', 'negotiated_percentage', 'negotiated_algorithm', 'median_amount', '10th_percentile', '90th_percentile', 'count', 'methodology', 'additional_payer_notes'];
  for (const group of groups.values()) for (const field of wideFields) if (!group.columns.has(field)) add('missing_header', 'row 3', `Wide CSV payer ${group.payer} / ${group.plan} is missing ${field}.`);
  return { headers, width: dataHeaders.length, tall, groups: [...groups.values()], codeNumbers };
}

function csvPayer(values, location, genericNotes, modifierOnly, add) {
  const dollar = values.negotiated_dollar; const percent = values.negotiated_percentage; const algorithm = values.negotiated_algorithm; const any = [dollar, percent, algorithm].some(present);
  const notes = text(values.additional_payer_notes);
  if (!any) return { any: false, dollar: false, notes };
  if (dollar && !csvPositive(dollar)) add('invalid_number', location, 'Negotiated dollar amount must be greater than 0.');
  if (percent && !csvPositive(percent)) add('invalid_number', location, 'Negotiated percentage must be greater than 0.');
  if (modifierOnly) return { any: true, dollar: Boolean(dollar), notes };
  const method = normalized(values.methodology);
  if (!METHODS.has(method)) add('invalid_enum', location, 'A payer-specific charge requires a valid methodology.');
  if (method === 'other' && !text(values.additional_payer_notes) && !text(genericNotes)) add('missing_notes', location, 'Methodology "other" requires an explanation.');
  if (percent || algorithm) {
    if (!COUNT.test(String(values.count || ''))) add('invalid_count', location, 'Count must be 0, "1 through 10," or a whole number 11 or greater.');
    if (values.count === '0') {
      if (!text(values.additional_payer_notes) && !text(genericNotes)) add('missing_notes', location, 'A zero allowed-amount count requires an explanation.');
    } else for (const field of ['10th_percentile', 'median_amount', '90th_percentile']) if (!present(values[field]) || !csvPositive(values[field])) add('required', location, `${field} is required and must be greater than 0.`);
  }
  return { any: true, dollar: Boolean(dollar), notes };
}

export function validateCsvRow(row, state, rowNumber, add) {
  const location = `row ${rowNumber}`;
  if (row.length !== state.width) { add('row_width', location, `Expected ${state.width} columns but found ${row.length}.`); return; }
  if (!valueAt(row, state, 'description')) add('required', location, 'Description is required.');
  const setting = normalized(valueAt(row, state, 'setting')); if (!SETTINGS.has(setting)) add('invalid_enum', location, 'Setting must be inpatient, outpatient, or both.');
  for (const name of ['drug_unit_of_measurement', 'standard_charge|gross', 'standard_charge|discounted_cash', 'standard_charge|min', 'standard_charge|max']) {
    const value = valueAt(row, state, name); if (!csvPositive(value)) add('invalid_number', location, `${name} must be a number greater than 0.`);
  }
  const drugUnit = valueAt(row, state, 'drug_unit_of_measurement'); const drugType = valueAt(row, state, 'drug_type_of_measurement').toUpperCase();
  if (Boolean(drugUnit) !== Boolean(drugType)) add('drug_pair', location, 'Drug unit and drug type must be entered together.');
  if (drugType && !DRUG_TYPES.has(drugType)) add('invalid_enum', location, 'Drug type is not a CMS v3.0.0 value.');
  let codeFound = false; let ndc = false;
  for (const number of state.codeNumbers) {
    const code = valueAt(row, state, `code|${number}`); const type = valueAt(row, state, `code|${number}|type`).toUpperCase();
    if (Boolean(code) !== Boolean(type)) add('code_pair', location, `code|${number} and its type must be entered together.`);
    if (type && !CODE_TYPES.has(type)) add('invalid_enum', location, `Code type ${type} is not a CMS v3.0.0 value.`);
    codeFound ||= Boolean(code); ndc ||= type === 'NDC';
  }
  if (ndc && (!drugUnit || !drugType)) add('required', location, 'NDC items require drug unit and type.');
  const generic = valueAt(row, state, 'additional_generic_notes'); const modifierOnly = Boolean(valueAt(row, state, 'modifiers')) && !codeFound;
  let payerCharge = false; let dollar = false; let payerNotes = false;
  if (state.tall) {
    const values = {
      negotiated_dollar: valueAt(row, state, 'standard_charge|negotiated_dollar'), negotiated_percentage: valueAt(row, state, 'standard_charge|negotiated_percentage'), negotiated_algorithm: valueAt(row, state, 'standard_charge|negotiated_algorithm'),
      median_amount: valueAt(row, state, 'median_amount'), '10th_percentile': valueAt(row, state, '10th_percentile'), '90th_percentile': valueAt(row, state, '90th_percentile'), count: valueAt(row, state, 'count'), methodology: valueAt(row, state, 'standard_charge|methodology'), additional_payer_notes: '',
    };
    const result = csvPayer(values, location, generic, modifierOnly, add); payerCharge = result.any; dollar = result.dollar; payerNotes = result.notes;
    if (payerCharge && (!valueAt(row, state, 'payer_name') || !valueAt(row, state, 'plan_name'))) add('required', location, 'A payer-specific charge requires payer and plan names.');
    if (!modifierOnly && !payerCharge && (valueAt(row, state, 'payer_name') || valueAt(row, state, 'plan_name'))) add('missing_charge', location, 'Payer or plan name requires a payer-specific charge.');
  } else for (const group of state.groups) {
    const values = {}; for (const [field, index] of group.columns) values[field] = String(row[index] ?? '').trim();
    const result = csvPayer(values, `${location}, ${group.payer} / ${group.plan}`, generic, modifierOnly, add); payerCharge ||= result.any; dollar ||= result.dollar; payerNotes ||= result.notes;
  }
  if (modifierOnly) { if (!payerCharge && !payerNotes && !text(generic)) add('missing_charge', location, 'A modifier-only row requires a payer-specific charge or explanatory notes.'); return; }
  const baseCharge = Boolean(valueAt(row, state, 'standard_charge|gross') || valueAt(row, state, 'standard_charge|discounted_cash'));
  if (!baseCharge && !payerCharge) add('missing_charge', location, 'Enter a gross, discounted cash, or payer-specific charge.');
  if ((baseCharge || payerCharge) && !codeFound) add('required', location, 'A standard charge requires a billing code and code type.');
  if (dollar && (!valueAt(row, state, 'standard_charge|min') || !valueAt(row, state, 'standard_charge|max'))) add('required', location, 'A negotiated dollar amount requires de-identified minimum and maximum charges.');
}
