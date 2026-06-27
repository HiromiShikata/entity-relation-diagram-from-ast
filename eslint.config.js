const js = require('@eslint/js');
const tseslintPlugin = require('@typescript-eslint/eslint-plugin');
const tseslintParser = require('@typescript-eslint/parser');
const importPlugin = require('eslint-plugin-import');
const noTypeAssertionPlugin = require('eslint-plugin-no-type-assertion');

module.exports = [
  js.configs.recommended,
  ...tseslintPlugin.configs['flat/recommended-type-checked'],
  {
    ...importPlugin.flatConfigs.typescript,
    files: ['src/**/*.ts'],
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tseslintParser,
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        project: ['tsconfig.json'],
      },
    },
    plugins: {
      'no-type-assertion': noTypeAssertionPlugin,
    },
    rules: {
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-non-null-assertion': 'error',
      'no-type-assertion/no-type-assertion': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/domain',
              from: './src/adapter',
            },
            {
              target: './src/domain/entities',
              from: './src/domain/usecases',
            },
            {
              target: './src/adapter/repositories',
              from: './src/adapter/entry-points',
            },
          ],
        },
      ],
    },
  },
];
