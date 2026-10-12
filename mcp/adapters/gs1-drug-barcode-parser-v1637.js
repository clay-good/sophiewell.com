// spec-v1637 MCP adapter: gs1-drug-barcode-parser in lib/gs1-drug-barcode-parser-v1637.js. The dom
// key mirrors views/group-v1637.js and META['gs1-drug-barcode-parser'].example. Administrative
// domain. The clock is read only to place a two-digit year in its century.

import { gs1DrugBarcodeParser } from '../../lib/gs1-drug-barcode-parser-v1637.js';

export default [
  {
    id: 'gs1-drug-barcode-parser',
    summary: 'Reads the string a scanner returns from a drug package barcode (GS1 DataMatrix). Splits it into GTIN, expiration date, lot and serial number, checks the GTIN check digit, reads the date, pulls the NDC digits, and says whether the four DSCSA product-identifier elements are present. It does not decode an image or judge authenticity.',
    compute: (args) => gs1DrugBarcodeParser(args, new Date()),
    fields: [
      { dom: 'gbp-scan', arg: 'scan', kind: 'string', required: true, label: 'The scanned string, raw or with parentheses' },
    ],
  },
];
