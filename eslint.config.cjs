const reactPlugin = require("./frontend/node_modules/eslint-plugin-react");

const browserGlobals = {
  alert: "readonly",
  Blob: "readonly",
  clearTimeout: "readonly",
  console: "readonly",
  document: "readonly",
  Event: "readonly",
  File: "readonly",
  FormData: "readonly",
  fetch: "readonly",
  Headers: "readonly",
  Intl: "readonly",
  localStorage: "readonly",
  navigator: "readonly",
  process: "readonly",
  React: "readonly",
  Request: "readonly",
  Response: "readonly",
  sessionStorage: "readonly",
  setTimeout: "readonly",
  URL: "readonly",
  URLSearchParams: "readonly",
  window: "readonly",
};

const nodeGlobals = {
  __dirname: "readonly",
  Buffer: "readonly",
  console: "readonly",
  module: "readonly",
  process: "readonly",
  require: "readonly",
  setTimeout: "readonly",
};

const commonRules = {
  "no-constant-binary-expression": "error",
  "no-constant-condition": "error",
  "no-debugger": "error",
  "no-dupe-args": "error",
  "no-dupe-else-if": "error",
  "no-dupe-keys": "error",
  "no-duplicate-case": "error",
  "no-empty": ["error", { allowEmptyCatch: true }],
  "no-func-assign": "error",
  "no-irregular-whitespace": "error",
  "no-loss-of-precision": "error",
  "no-redeclare": "error",
  "no-self-assign": "error",
  "no-sparse-arrays": "error",
  "no-unexpected-multiline": "error",
  "no-unreachable": "error",
  "no-unsafe-finally": "error",
  "no-unused-vars": [
    "error",
    {
      args: "after-used",
      argsIgnorePattern: "^_",
      caughtErrors: "none",
      varsIgnorePattern: "^_",
    },
  ],
  "no-undef": "error",
  "use-isnan": "error",
  "valid-typeof": "error",
};

module.exports = [
  {
    ignores: [
      "**/node_modules/**",
      "**/build/**",
      "**/build-*/**",
      "**/dist/**",
      "**/*.config.js",
      "**/*.log",
    ],
  },
  {
    files: ["backend/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: nodeGlobals,
    },
    rules: commonRules,
  },
  {
    files: ["frontend/src/**/*.{js,jsx}"],
    plugins: {
      react: reactPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: browserGlobals,
    },
    rules: {
      ...commonRules,
      "react/jsx-uses-vars": "error",
    },
  },
];
