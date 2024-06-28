import prettier from 'eslint-plugin-prettier'
import cypress from 'eslint-plugin-cypress'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

export default [
  {
    ignores: [
      'src/interfaces/**/*',
      '**/types-and-hooks.tsx',
      'src/gql/**/*',
      'packages/**/dist/**/*',
      '**/node_modules',
      '**/public'
    ]
  },
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'prettier',
    'plugin:cypress/recommended'
  ),
  {
    plugins: {
      prettier,
      cypress
    },

    languageOptions: {
      globals: {
        ...globals.browser
      },

      parser: tsParser,
      ecmaVersion: 12,
      sourceType: 'module',

      parserOptions: {
        tsconfigRootDir: './',
        project: './tsconfig.json'
      }
    },

    rules: {
      trailingComma: 'off',
      'object-curly-spacing': ['error', 'always'],
      'prettier/prettier': 'error'
    }
  }
]
