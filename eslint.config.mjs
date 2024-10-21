// @ts-check
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import eslintTerrestris from '@terrestris/eslint-config-typescript';
import eslint from '@eslint/js';
import tsEslint from 'typescript-eslint';
import stylisticEslint from '@stylistic/eslint-plugin'

export default tsEslint.config({
  extends: [
    eslint.configs.recommended,
    ...tsEslint.configs.recommended,
    ...tsEslint.configs.stylistic,
    importPlugin.flatConfigs.recommended
  ],
  files: [
    '**/*.ts'
  ],
  ignores: [
    '**/*.spec.ts',
    '**/jest/__mocks__/*.ts'
  ],
  languageOptions: {
    ecmaVersion: 2022,
    globals: globals.browser,
    parserOptions: {
      project: true,
      tsconfigRootDir: import.meta.dirname
    },
  },
  plugins: {
    '@stylistic': stylisticEslint
  },
  rules: {
    ...eslintTerrestris.rules,
    '@typescript-eslint/member-ordering': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-inferrable-types': 'off',
    'import/no-unresolved': 'off',
    'import/named': 'off',
    'import/no-named-as-default': 'off',
    'import/order': ['warn', {
      groups: [
        'builtin',
        'external',
        'parent',
        'sibling',
        'index',
        'object'
      ],
      pathGroups: [{
        pattern: 'react',
        group: 'external',
        position: 'before'
      }, {
        pattern: '@terrestris/**',
        group: 'external',
        position: 'after'
      }],
      pathGroupsExcludedImportTypes: ['react'],
      'newlines-between': 'always-and-inside-groups',
      alphabetize: {
        order: 'asc',
        caseInsensitive: true
      }
    }]
  }
});
