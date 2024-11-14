import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import checkFile from 'eslint-plugin-check-file';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  { files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'] },
  { languageOptions: { globals: globals.browser } },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      'object-shorthand': 'error',
    },
  },
  {
    plugins: {
      checkFile,
    },
    rules: {
      'checkFile/filename-naming-convention': [
        'error',
        {
          '**/*.{ts,tsx}': 'KEBAB_CASE',
        },
        {
          // ignore the middle extensions of the filename to support filename like bable.config.js or smoke.spec.ts
          ignoreMiddleExtensions: true,
        },
      ],
      'checkFile/folder-naming-convention': [
        'error',
        {
          // all folders within src (except __tests__)should be named in kebab-case
          'src/**/!(__tests__)': 'KEBAB_CASE',
        },
      ],
    },
  },
];
