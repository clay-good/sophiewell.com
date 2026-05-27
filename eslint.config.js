export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "data/**",
      "docs/**",
      // spec-v52 §5.2: vendored third-party libraries ship verbatim from
      // upstream with their own license. Linting them with Sophie's own
      // rules would be both redundant (upstream has its own quality bar)
      // and noisy (e.g. pdf.js uses constructor-style Function references
      // that eslint forbids in first-party code).
      "vendored/**",
      "README.md",
      "CHANGELOG.md",
      "sbom.json",
    ],
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // browser
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        location: "readonly",
        history: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        fetch: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        performance: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        Blob: "readonly",
        FileReader: "readonly",
        TextEncoder: "readonly",
        TextDecoder: "readonly",
        crypto: "readonly",
        atob: "readonly",
        btoa: "readonly",
        Event: "readonly",
        CustomEvent: "readonly",
        MouseEvent: "readonly",
        KeyboardEvent: "readonly",
        HTMLElement: "readonly",
        Node: "readonly",
        NodeList: "readonly",
        Element: "readonly",
        getComputedStyle: "readonly",
        matchMedia: "readonly",
        // service worker
        self: "readonly",
        caches: "readonly",
        clients: "readonly",
        // node
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
        globalThis: "readonly",
      },
    },
    rules: {
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-restricted-properties": [
        "error",
        {
          object: "document",
          property: "write",
          message: "document.write is forbidden.",
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "AssignmentExpression[left.property.name='innerHTML']",
          message: "innerHTML is forbidden. Use textContent or createElement.",
        },
        {
          selector: "AssignmentExpression[left.property.name='outerHTML']",
          message: "outerHTML is forbidden. Use textContent or createElement.",
        },
        {
          selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
          message: "insertAdjacentHTML is forbidden. Use textContent or createElement.",
        },
        {
          selector: "NewExpression[callee.name='Function']",
          message: "Function constructor is forbidden.",
        },
      ],
    },
  },
];
