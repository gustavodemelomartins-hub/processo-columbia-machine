// Lint do JavaScript do protótipo (perfil leve do Vibe Coding Toolkit, adaptado).
// Medição inicial e motivo de cada exceção: docs/quality.md.
import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "index.html",
      "vendor/**",
      "node_modules/**",
      "artifacts/**",
      "outputs/**",
      "graphify-out/**",
      ".claude/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["app/**/*.js"],
    languageOptions: {
      sourceType: "script",
      globals: { ...globals.browser, module: "readonly" },
    },
  },
  {
    files: ["**/*.cjs", "**/*.mjs"],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // Fragmentos de interface: o build (scripts/build.py) concatena estes arquivos num
    // único escopo global do HTML. Variáveis de outro fragmento não são visíveis ao lint
    // por arquivo, então no-undef/no-unused-vars só valem para os domínios autocontidos.
    files: ["app/**/*.js"],
    ignores: ["app/**/*_domain.js", "app/storage.js"],
    rules: { "no-undef": "off", "no-unused-vars": "off" },
  },
  {
    // Corpos de page.evaluate rodam no navegador, com os globais do aplicativo.
    // Tuplas de casos de teste nomeiam campos não lidos (2 ocorrências em 15/10/2026).
    files: ["tests/browser/**/*.cjs"],
    rules: { "no-undef": "off", "no-unused-vars": "warn" },
  },
  {
    rules: {
      "no-empty": ["error", { allowEmptyCatch: true }],
      // Legado medido em 15/10/2026 (1 ocorrência cada): avisa até ser resolvido.
      "no-setter-return": "warn",
      "no-unreachable": "warn",
      // Referência de 350 linhas do toolkit, sem contar linhas em branco e comentários.
      "max-lines": ["warn", { max: 350, skipBlankLines: true, skipComments: true }],
    },
  },
];
